'use strict';

const axios = require('axios');
const JSONbig = require('json-bigint');
const qs = require('qs');

const JSONbigNative = JSONbig({ useNativeBigInt: false, storeAsString: true });

function createClient(options) {
  const { baseURL, token, tokenHeader = 'PRIVATE-TOKEN' } = options || {};

  if (!token) {
    throw new Error('TGIT_TOKEN is required');
  }

  const http = axios.create({
    baseURL,
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

  http.interceptors.response.use(
    (response) => response,
    (error) => {
      const { response, config } = error || {};
      if (response && response.status === 401 && config && !config.__retrying) {
        console.error('Response return 401, Try again...');
        return http.request({ ...config, __retrying: true });
      }
      throw error;
    },
  );

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
