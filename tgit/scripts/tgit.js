#!/usr/bin/env node
/**
 * tgit.js — Thin CLI wrapper around the `tgit-api` npm package so the Claude
 * tgit skill can invoke 工蜂 REST API methods by name with JSON params.
 *
 * Usage:
 *   node tgit.js <method.path> [json-params]
 *   node tgit.js --list
 *
 * Examples:
 *   node tgit.js projects '{"per_page":10}'
 *   node tgit.js projects.get '{"id":12345}'
 *   node tgit.js projects.merge_requests '{"id":12345,"state":"opened"}'
 *   node tgit.js projects.files.get '{"id":12345,"file_path":"README.md","ref":"master"}'
 *
 * Environment:
 *   TGIT_TOKEN     (required) Private token or OAuth2 access_token.
 *   TGIT_BASE_URL  (optional) Override API base. Default:
 *                  https://git.code.tencent.com/api/v3
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

function ensureDeps() {
  const nodeModules = path.join(__dirname, 'node_modules', 'tgit-api');
  if (fs.existsSync(nodeModules)) return;
  process.stderr.write('[tgit] Installing tgit-api dependency (one-time)...\n');
  execSync('npm install --silent --no-audit --no-fund', {
    cwd: __dirname,
    stdio: ['ignore', 'inherit', 'inherit'],
  });
}

function loadTgit() {
  ensureDeps();
  const mod = require('tgit-api');
  return mod.default || mod.TgitApi || mod;
}

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
    for (const k of Object.keys(obj)) {
      if (k === 'maker' || k === 'token' || k === 'catch' ||
          k === 'onRequest' || k === 'onSuccess') continue;
      const v = obj[k];
      const name = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'function') {
        out.push(name);
        // a function can also have sub-methods attached
        for (const sk of Object.keys(v)) {
          if (typeof v[sk] === 'function' || (v[sk] && typeof v[sk] === 'object')) {
            walk({ [sk]: v[sk] }, name);
          }
        }
      } else if (v && typeof v === 'object') {
        walk(v, name);
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
        '  export TGIT_TOKEN=your_private_or_oauth_token\n'
    );
    process.exit(1);
  }

  const baseURL = process.env.TGIT_BASE_URL || 'https://git.code.tencent.com/api/v3';

  if (!methodPath) {
    process.stderr.write(
      'Usage: node tgit.js <method.path> [json-params]\n' +
        '       node tgit.js --list\n'
    );
    process.exit(1);
  }

  const tgitApi = loadTgit();
  const api = tgitApi(token, undefined, undefined, { baseURL });

  if (methodPath === '--list' || methodPath === '-l') {
    process.stdout.write(listMethods(api).join('\n') + '\n');
    return;
  }

  const fn = resolveMethod(api, methodPath);
  if (!fn) {
    process.stderr.write(
      `Unknown method: ${methodPath}\n` +
        'Run `node tgit.js --list` to see all available methods, ' +
        'or consult references/methods.md.\n'
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
