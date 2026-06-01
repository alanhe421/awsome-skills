'use strict';

const manifest = require('./manifest.json');

function toSnakeCase(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

function toCamelCase(value) {
  const snake = toSnakeCase(value);
  return snake.replace(/_([a-z0-9])/g, (_, ch) => ch.toUpperCase());
}

function getAliasCandidates(name) {
  const base = String(name);
  const camel = toCamelCase(base);
  const snake = toSnakeCase(base);
  const candidates = new Set([base, camel, snake]);

  const bySuffix = {
    id_or_path: ['id_or_path', 'idOrPath', 'project_id', 'projectId', 'group_id', 'groupId', 'namespace_id', 'namespaceId', 'id'],
    project_id: ['project_id', 'projectId', 'id_or_path', 'idOrPath', 'id'],
    group_id: ['group_id', 'groupId', 'id_or_path', 'idOrPath', 'id'],
    namespace_id: ['namespace_id', 'namespaceId', 'id_or_path', 'idOrPath', 'id'],
    user_id: ['user_id', 'userId', 'uid', 'id'],
    uid: ['uid', 'user_id', 'userId', 'id'],
    merge_request_id: ['merge_request_id', 'mergeRequestId', 'merge_request_iid', 'mergeRequestIid', 'iid', 'id'],
    merge_request_iid: ['merge_request_iid', 'mergeRequestIid', 'merge_request_id', 'mergeRequestId', 'iid', 'id'],
    issue_id: ['issue_id', 'issueId', 'issue_iid', 'issueIid', 'iid', 'id'],
    issue_iid: ['issue_iid', 'issueIid', 'issue_id', 'issueId', 'iid', 'id'],
    note_id: ['note_id', 'noteId', 'id'],
    hook_id: ['hook_id', 'hookId', 'id'],
    org_link_id: ['org_link_id', 'orgLinkId', 'id'],
    template_id: ['template_id', 'templateId', 'id'],
    preconf_id: ['preconf_id', 'preconfId', 'id'],
    file_path: ['file_path', 'filePath', 'filepath', 'path'],
    filepath: ['filepath', 'file_path', 'filePath', 'path'],
    branch: ['branch', 'branch_name', 'branchName', 'ref'],
    branch_name: ['branch_name', 'branchName', 'branch', 'ref'],
    tag: ['tag', 'tag_name', 'tagName'],
    tag_name: ['tag_name', 'tagName', 'tag'],
    sha: ['sha', 'commit_sha', 'commitSha'],
    revision: ['revision', 'sha', 'id'],
    path: ['path', 'file_path', 'filePath'],
    type: ['type'],
    id: ['id'],
    id_or_username: ['id_or_username', 'idOrUsername', 'username', 'id'],
    idOrUsername: ['idOrUsername', 'id_or_username', 'username', 'id'],
    file_id: ['file_id', 'fileId', 'id'],
  };

  if (bySuffix[snake]) {
    for (const candidate of bySuffix[snake]) candidates.add(candidate);
  }
  if (snake.endsWith('_id')) {
    const baseName = snake.slice(0, -3);
    candidates.add(baseName);
    candidates.add(toCamelCase(baseName));
  }
  return [...candidates];
}

function pickValue(source, names) {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(source, name) && source[name] !== undefined && source[name] !== null) {
      return source[name];
    }
  }
  return undefined;
}

function resolvePathParams(pathTemplate, params) {
  const pathParams = {};
  const placeholders = [...pathTemplate.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
  for (const placeholder of placeholders) {
    const value = pickValue(params, getAliasCandidates(placeholder));
    if (value === undefined) {
      throw new Error(`Missing required path parameter: ${placeholder}`);
    }
    pathParams[placeholder] = encodeURIComponent(String(value));
  }
  return pathParams;
}

function applyPathTemplate(pathTemplate, pathParams) {
  return pathTemplate.replace(/\{([^}]+)\}/g, (_, key) => pathParams[key]);
}

function stripPathKeys(params, pathTemplate) {
  const remaining = { ...(params || {}) };
  for (const placeholder of pathTemplate.match(/\{([^}]+)\}/g) || []) {
    const key = placeholder.slice(1, -1);
    for (const candidate of getAliasCandidates(key)) {
      if (Object.prototype.hasOwnProperty.call(remaining, candidate)) {
        delete remaining[candidate];
      }
    }
  }
  return remaining;
}

function toServicePath(brand) {
  return String(brand)
    .split('.')
    .filter(Boolean);
}

function createEndpointInvoker(client, spec) {
  return async function invoke(params = {}) {
    const pathParams = resolvePathParams(spec.path, params);
    const url = applyPathTemplate(spec.path, pathParams);
    const remaining = stripPathKeys(params, spec.path);
    const method = spec.httpMethod.toUpperCase();

    const requestConfig = { method, url };
    if (method === 'GET' || method === 'DELETE') {
      requestConfig.params = remaining;
    } else {
      requestConfig.data = remaining;
    }

    return client.request(method, url, requestConfig);
  };
}

function createApi(client) {
  const api = {};
  for (const spec of manifest) {
    const path = [...toServicePath(spec.brand), spec.methodName];
    let cur = api;
    for (let i = 0; i < path.length - 1; i += 1) {
      const segment = path[i];
      if (!cur[segment]) cur[segment] = {};
      cur = cur[segment];
    }
    cur[path[path.length - 1]] = createEndpointInvoker(client, spec);
  }

  api._manifest = manifest;
  return api;
}

module.exports = { createApi };
