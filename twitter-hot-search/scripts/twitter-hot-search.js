#!/usr/bin/env node
'use strict';

const DEFAULT_FIELDS = {
  'tweet.fields': 'author_id,created_at,lang,public_metrics,entities,context_annotations',
  'user.fields': 'id,name,username,verified,verified_type,public_metrics',
  expansions: 'author_id',
};

function usage() {
  process.stderr.write(`Usage:
  node scripts/twitter-hot-search.js "<query>" [limit]
  node scripts/twitter-hot-search.js --hot "<query>" [limit] [pages]
  node scripts/twitter-hot-search.js --json '{"query":"<query>","limit":10,"pages":1,"sort":"hot"}'

Environment:
  X_BEARER_TOKEN or TWITTER_BEARER_TOKEN  Required OAuth 2.0 bearer token
  TWITTER_API_BASE_URL                    Optional, default: https://api.twitter.com/2

Examples:
  node scripts/twitter-hot-search.js "AI lang:en -is:retweet" 10
  node scripts/twitter-hot-search.js --hot "Claude OR OpenAI lang:en -is:retweet" 20 2
`);
}

function parsePositiveInt(value, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    usage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  if (args[0] === '--json') {
    if (!args[1]) {
      process.stderr.write('Error: --json requires a JSON options object.\n');
      process.exit(1);
    }
    try {
      const options = JSON.parse(args[1]);
      return normalizeOptions(options);
    } catch (err) {
      process.stderr.write(`Error: invalid JSON options: ${err.message}\n`);
      process.exit(1);
    }
  }

  const hot = args[0] === '--hot';
  const query = hot ? args[1] : args[0];
  if (!query) {
    usage();
    process.exit(1);
  }

  return normalizeOptions({
    query,
    limit: hot ? args[2] : args[1],
    pages: hot ? args[3] : 1,
    sort: hot ? 'hot' : 'recency',
  });
}

function normalizeOptions(options) {
  const query = String(options.query || '').trim();
  if (!query) {
    process.stderr.write('Error: query is required.\n');
    process.exit(1);
  }

  const sort = options.sort === 'hot' || options.hot ? 'hot' : (options.sort || 'recency');
  return {
    query,
    limit: parsePositiveInt(options.limit || options.max_results, 10, { min: 1, max: 100 }),
    pages: parsePositiveInt(options.pages, 1, { min: 1, max: 5 }),
    sort,
    start_time: options.start_time,
    end_time: options.end_time,
    lang: options.lang,
  };
}

function getBearerToken() {
  return process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN;
}

function buildQuery(options) {
  if (!options.lang) return options.query;
  if (/\blang:/i.test(options.query)) return options.query;
  return `${options.query} lang:${options.lang}`;
}

function hotScore(metrics = {}) {
  const likes = metrics.like_count || 0;
  const retweets = metrics.retweet_count || 0;
  const replies = metrics.reply_count || 0;
  const quotes = metrics.quote_count || 0;
  const bookmarks = metrics.bookmark_count || 0;
  const impressions = metrics.impression_count || 0;
  return likes + retweets * 3 + replies * 2 + quotes * 2 + bookmarks * 2 + Math.floor(impressions / 1000);
}

function indexUsers(includes = {}) {
  const users = new Map();
  for (const user of includes.users || []) {
    users.set(user.id, user);
  }
  return users;
}

function toTweetUrl(user, tweet) {
  if (!user || !user.username) return null;
  return `https://x.com/${user.username}/status/${tweet.id}`;
}

async function fetchRecentSearch(options, token) {
  const baseURL = process.env.TWITTER_API_BASE_URL || 'https://api.twitter.com/2';
  const url = new URL(`${baseURL.replace(/\/$/, '')}/tweets/search/recent`);
  const perPage = Math.min(Math.max(options.limit, 10), 100);
  const params = {
    query: buildQuery(options),
    max_results: String(perPage),
    ...DEFAULT_FIELDS,
  };

  if (options.sort && options.sort !== 'hot') params.sort_order = options.sort;
  if (options.start_time) params.start_time = options.start_time;
  if (options.end_time) params.end_time = options.end_time;

  let nextToken;
  const tweets = [];
  const users = new Map();
  const meta = [];

  for (let page = 0; page < options.pages; page += 1) {
    const pageURL = new URL(url.toString());
    for (const [key, value] of Object.entries(params)) {
      pageURL.searchParams.set(key, value);
    }
    if (nextToken) pageURL.searchParams.set('next_token', nextToken);

    const response = await fetch(pageURL, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'twitter-hot-search-skill/1.0',
      },
    });

    const bodyText = await response.text();
    let body;
    try {
      body = bodyText ? JSON.parse(bodyText) : {};
    } catch (_err) {
      body = { raw: bodyText };
    }

    if (!response.ok) {
      const error = new Error(body.detail || body.title || response.statusText);
      error.status = response.status;
      error.data = body;
      throw error;
    }

    const pageUsers = indexUsers(body.includes || {});
    for (const [id, user] of pageUsers.entries()) users.set(id, user);
    tweets.push(...(body.data || []));
    meta.push(body.meta || {});

    nextToken = body.meta && body.meta.next_token;
    if (!nextToken) break;
  }

  const enriched = tweets.map((tweet) => {
    const author = users.get(tweet.author_id) || null;
    return {
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      lang: tweet.lang,
      author,
      public_metrics: tweet.public_metrics || {},
      hot_score: hotScore(tweet.public_metrics),
      url: toTweetUrl(author, tweet),
    };
  });

  if (options.sort === 'hot') {
    enriched.sort((a, b) => b.hot_score - a.hot_score || String(b.created_at).localeCompare(String(a.created_at)));
  }

  return {
    query: options.query,
    effective_query: buildQuery(options),
    sort: options.sort,
    requested_limit: options.limit,
    pages_requested: options.pages,
    pages_returned: meta.length,
    result_count: enriched.length,
    results: enriched.slice(0, options.limit),
    meta,
  };
}

async function main() {
  const options = parseArgs(process.argv);
  const token = getBearerToken();
  if (!token) {
    process.stderr.write(
      'Error: X_BEARER_TOKEN or TWITTER_BEARER_TOKEN is required.\n' +
      'Set it in your shell, e.g.:\n' +
      '  export X_BEARER_TOKEN=your_oauth2_bearer_token\n'
    );
    process.exit(1);
  }

  try {
    const result = await fetchRecentSearch(options, token);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (err) {
    process.stderr.write(JSON.stringify({
      error: err.message,
      status: err.status,
      data: err.data,
    }, null, 2) + '\n');
    process.exit(2);
  }
}

main();
