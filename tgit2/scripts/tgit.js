#!/usr/bin/env node

'use strict';

const { createClient } = require('./lib/client');
const { createApi } = require('./api');

function resolveMethod(api, methodPath) {
  const parts = methodPath.split('.');
  let cur = api;
  for (const p of parts) {
    if (cur == null) return null;
    cur = cur[p];
  }
  return typeof cur === 'function' ? cur : null;
}

function listMethods(api) {
  const out = [];
  function walk(obj, prefix) {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('_')) continue;
      const value = obj[key];
      const name = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'function') {
        out.push(name);
        walk(value, name);
      } else if (value && typeof value === 'object') {
        walk(value, name);
      }
    }
  }
  walk(api, '');
  return Array.from(new Set(out)).sort();
}

function printErrorAndExit(err) {
  const payload = {
    error: err.message,
    status: err.response && err.response.status,
    statusText: err.response && err.response.statusText,
    data: err.response && err.response.data,
    url: err.config && err.config.url,
    method: err.config && err.config.method,
  };
  process.stderr.write(JSON.stringify(payload, null, 2) + '\n');
  process.exit(3);
}

async function main() {
  const [, , methodPath, paramsJson] = process.argv;

  const token = process.env.TGIT_TOKEN;
  if (!token) {
    process.stderr.write(
      'Error: TGIT_TOKEN environment variable is required.\n' +
        'Set it in your shell, e.g.:\n' +
        '  export TGIT_TOKEN=your_token\n'
    );
    process.exit(1);
  }

  if (!methodPath) {
    process.stderr.write(
      'Usage: node tgit.js <method.path> [json-params]\n' +
        '       node tgit.js --list\n'
    );
    process.exit(1);
  }

  const baseURL = process.env.TGIT_BASE_URL || 'https://git.code.tencent.com/api/v3';
  const tokenHeader = process.env.TGIT_TOKEN_HEADER || 'PRIVATE-TOKEN';
  const client = createClient({ baseURL, token, tokenHeader });
  const api = createApi(client);

  if (methodPath === '--list' || methodPath === '-l') {
    process.stdout.write(listMethods(api).join('\n') + '\n');
    return;
  }

  const fn = resolveMethod(api, methodPath);
  if (!fn) {
    process.stderr.write(
      `Unknown method: ${methodPath}\n` +
        'Run `node tgit.js --list` to see supported methods.\n'
    );
    process.exit(2);
  }

  let params = {};
  if (paramsJson) {
    try {
      params = JSON.parse(paramsJson);
    } catch (e) {
      process.stderr.write(`Invalid JSON for params: ${e.message}\n`);
      process.exit(1);
    }
  }

  try {
    const result = await fn(params);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (err) {
    printErrorAndExit(err);
  }
}

main();
