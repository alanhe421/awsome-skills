'use strict';

const axios = require('axios');
const JSONbig = require('json-bigint');
const qs = require('qs');

const JSONbigNative = JSONbig({ useNativeBigInt: false, storeAsString: true });
const DEFAULT_TIMEOUT_MS = 30000;

function normalizeTimeout(timeout) {
  const value = Number(timeout);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS;
}

function createClient(options) {
  const { baseURL, token, tokenHeader = 'PRIVATE-TOKEN', timeout } = options || {};

  if (!token) {
    throw new Error('TGIT_TOKEN is required');
  }

  const http = axios.create({
    baseURL,
    timeout: normalizeTimeout(timeout),
    headers: {
      'Content-Type': 'application/json',
      [tokenHeader]: token,
    },
    transformResponse: [
      (data) => {
        if (typeof data !== 'string') return data;
        try {
          return JSONbigNative.parse(data);
        } catch {
          return data;
        }
      },
    ],
    paramsSerializer: {
      serialize(params) {
        return qs.stringify(params, {
          arrayFormat: 'repeat',
          encoder(value) {
            if (typeof value === 'number' || typeof value === 'boolean') {
              return String(value);
            }
            return encodeURIComponent(String(value)).replace(/%3A/gi, ':');
          },
        });
      },
    },
  });

  function request(method, url, options) {
    return http.request({
      method,
      url,
      ...(options || {}),
    }).then((response) => response.data);
  }

  return { http, request, baseURL, tokenHeader };
}

module.exports = { createClient };
