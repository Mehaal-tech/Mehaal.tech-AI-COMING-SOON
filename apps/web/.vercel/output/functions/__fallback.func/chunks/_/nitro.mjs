import http from 'node:http';
import https from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { AsyncLocalStorage } from 'node:async_hooks';
import invariant from 'vinxi/lib/invariant';
import { virtualId, handlerModule, join as join$1 } from 'vinxi/lib/path';
import { pathToFileURL } from 'node:url';
import { sharedConfig, lazy, createComponent } from 'solid-js';
import { renderToString, ssrElement, escape, mergeProps, ssr, renderToStream, getRequestEvent, isServer } from 'solid-js/web';
import { provideRequestEvent } from 'solid-js/web/storage';
import { promises, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode$1(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodeQueryKey(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return defaultProto ? parseURL(defaultProto + input) : parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

function parse(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = {};
  const opt = {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize$1(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

function parseSetCookie(setCookieValue, options) {
  const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
  } catch {
  }
  const cookie = {
    name,
    value
  };
  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }
  return cookie;
}
function _parseNameValuePair(nameValuePairStr) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$1 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c=class{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=m$1(e._destroy,t._destroy);}};function _$2(){return Object.assign(c.prototype,i$1.prototype),Object.assign(c.prototype,l$1.prototype),c}function m$1(...n){return function(...e){for(const t of n)t(...e);}}const g$1=_$2();let A$1 = class A extends g$1{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}};let y$2 = class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A$1;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}};function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}let w$2 = class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}};const E$2=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R(n={}){const e=new E$2,t=Array.isArray(n)||H$2(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H$2(n){return typeof n?.entries=="function"}function v$1(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S$2=new Set([101,204,205,304]);async function b$2(n,e){const t=new y$2,r=new w$2(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S$2.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C$1(n,e,t={}){try{const r=await b$2(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v$1(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}
function getRequestIP(event, opts = {}) {
  if (event.context.clientAddress) {
    return event.context.clientAddress;
  }
  if (opts.xForwardedFor) {
    const xForwardedFor = getRequestHeader(event, "x-forwarded-for")?.split(",").shift()?.trim();
    if (xForwardedFor) {
      return xForwardedFor;
    }
  }
  if (event.node.req.socket.remoteAddress) {
    return event.node.req.socket.remoteAddress;
  }
}

const RawBodySymbol = Symbol.for("h3RawBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function getDistinctCookieKey(name, opts) {
  return [name, opts.domain || "", opts.path || "/"].join(";");
}

function parseCookies(event) {
  return parse(event.node.req.headers.cookie || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie(event, name, value, serializeOptions = {}) {
  if (!serializeOptions.path) {
    serializeOptions = { path: "/", ...serializeOptions };
  }
  const newCookie = serialize$1(name, value, serializeOptions);
  const currentCookies = splitCookiesString(
    event.node.res.getHeader("set-cookie")
  );
  if (currentCookies.length === 0) {
    event.node.res.setHeader("set-cookie", newCookie);
    return;
  }
  const newCookieKey = getDistinctCookieKey(name, serializeOptions);
  event.node.res.removeHeader("set-cookie");
  for (const cookie of currentCookies) {
    const parsed = parseSetCookie(cookie);
    const key = getDistinctCookieKey(parsed.name, parsed);
    if (key === newCookieKey) {
      continue;
    }
    event.node.res.appendHeader("set-cookie", cookie);
  }
  event.node.res.appendHeader("set-cookie", newCookie);
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeaders(event) {
  return event.node.res.getHeaders();
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$2=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$2;
const AbortController = globalThis.AbortController || i;
createFetch({ fetch, Headers: Headers$1, AbortController });

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s$1="base64url";function digest(t){if(e)return e(r,t,s$1);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s$1):o.digest(s$1)}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {};



const appConfig$1 = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {
      "/_build/assets/**": {
        "headers": {
          "cache-control": "public, immutable, max-age=31536000"
        }
      }
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig$1));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());

const nitroAsyncContext = getContext("nitro-app", {
  asyncContext: true,
  AsyncLocalStorage: AsyncLocalStorage 
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$0 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const appConfig = {"name":"vinxi","routers":[{"name":"public","type":"static","base":"/","dir":"./public","root":"D:\\code\\site\\Mehaal.tech-AI-COMING-SOON\\apps\\web","order":0,"outDir":"D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/.vinxi/build/public"},{"name":"ssr","type":"http","link":{"client":"client"},"handler":"src/entry-server.tsx","extensions":["js","jsx","ts","tsx"],"target":"server","root":"D:\\code\\site\\Mehaal.tech-AI-COMING-SOON\\apps\\web","base":"/","outDir":"D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/.vinxi/build/ssr","order":1},{"name":"client","type":"client","base":"/_build","handler":"src/entry-client.tsx","extensions":["js","jsx","ts","tsx"],"target":"browser","root":"D:\\code\\site\\Mehaal.tech-AI-COMING-SOON\\apps\\web","outDir":"D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/.vinxi/build/client","order":2},{"name":"server-fns","type":"http","base":"/_server","handler":"../../node_modules/.pnpm/@solidjs+start@1.2.1_solid-_062fbaa4eb1fa3d2a1c7d24c8a08d325/node_modules/@solidjs/start/dist/runtime/server-handler.js","target":"server","root":"D:\\code\\site\\Mehaal.tech-AI-COMING-SOON\\apps\\web","outDir":"D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/.vinxi/build/server-fns","order":3}],"server":{"compressPublicAssets":{"brotli":true},"routeRules":{"/_build/assets/**":{"headers":{"cache-control":"public, immutable, max-age=31536000"}}},"experimental":{"asyncContext":true},"preset":"vercel"},"root":"D:\\code\\site\\Mehaal.tech-AI-COMING-SOON\\apps\\web"};
					const buildManifest = {"ssr":{"_Button-rjMnZ3ec.js":{"file":"assets/Button-rjMnZ3ec.js","name":"Button"},"_Card-D9smAXyI.js":{"file":"assets/Card-D9smAXyI.js","name":"Card"},"_Input-0sOzVmib.js":{"file":"assets/Input-0sOzVmib.js","name":"Input"},"_Select-DpfdCahF.js":{"file":"assets/Select-DpfdCahF.js","name":"Select"},"_Table-BWC7UuMQ.js":{"file":"assets/Table-BWC7UuMQ.js","name":"Table"},"_Topbar-UAezHi7t.js":{"file":"assets/Topbar-UAezHi7t.js","name":"Topbar"},"_routing-0hP7Sh6N.js":{"file":"assets/routing-0hP7Sh6N.js","name":"routing"},"_ssr-BERDO86b.css":{"file":"assets/ssr-BERDO86b.css","src":"_ssr-BERDO86b.css"},"_ssr-CFrG4X4Z.js":{"file":"assets/ssr-CFrG4X4Z.js","name":"ssr","dynamicImports":["src/routes/auth/login.tsx?pick=default&pick=$css","src/routes/auth/login.tsx?pick=default&pick=$css","src/routes/cms/media/index.tsx?pick=default&pick=$css","src/routes/cms/media/index.tsx?pick=default&pick=$css","src/routes/cms/pages/index.tsx?pick=default&pick=$css","src/routes/cms/pages/index.tsx?pick=default&pick=$css","src/routes/cms/pages/[id].tsx?pick=default&pick=$css","src/routes/cms/pages/[id].tsx?pick=default&pick=$css","src/routes/cms/pricing/index.tsx?pick=default&pick=$css","src/routes/cms/pricing/index.tsx?pick=default&pick=$css","src/routes/cms/services/index.tsx?pick=default&pick=$css","src/routes/cms/services/index.tsx?pick=default&pick=$css","src/routes/cms/settings/index.tsx?pick=default&pick=$css","src/routes/cms/settings/index.tsx?pick=default&pick=$css","src/routes/dashboard/client/index.tsx?pick=default&pick=$css","src/routes/dashboard/client/index.tsx?pick=default&pick=$css","src/routes/dashboard/franchise/index.tsx?pick=default&pick=$css","src/routes/dashboard/franchise/index.tsx?pick=default&pick=$css","src/routes/dashboard/management/index.tsx?pick=default&pick=$css","src/routes/dashboard/management/index.tsx?pick=default&pick=$css","src/routes/dashboard/owner/index.tsx?pick=default&pick=$css","src/routes/dashboard/owner/index.tsx?pick=default&pick=$css","src/routes/dashboard/partner/index.tsx?pick=default&pick=$css","src/routes/dashboard/partner/index.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/root.tsx"],"css":["assets/ssr-BERDO86b.css"]},"src/root.tsx":{"file":"assets/root-p0kWiATY.js","name":"root","src":"src/root.tsx","isDynamicEntry":true,"imports":["_ssr-CFrG4X4Z.js","_routing-0hP7Sh6N.js"],"css":["assets/root-BDtOi9L6.css"]},"src/routes/auth/login.tsx?pick=default&pick=$css":{"file":"login.js","name":"login","src":"src/routes/auth/login.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Button-rjMnZ3ec.js","_Input-0sOzVmib.js","_Card-D9smAXyI.js","_routing-0hP7Sh6N.js"]},"src/routes/cms/media/index.tsx?pick=default&pick=$css":{"file":"index.js","name":"index","src":"src/routes/cms/media/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Button-rjMnZ3ec.js","_Card-D9smAXyI.js","_Topbar-UAezHi7t.js"]},"src/routes/cms/pages/[id].tsx?pick=default&pick=$css":{"file":"_id_.js","name":"_id_","src":"src/routes/cms/pages/[id].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Button-rjMnZ3ec.js","_Input-0sOzVmib.js","_Card-D9smAXyI.js","_Topbar-UAezHi7t.js","_Select-DpfdCahF.js","_routing-0hP7Sh6N.js"]},"src/routes/cms/pages/index.tsx?pick=default&pick=$css":{"file":"index2.js","name":"index","src":"src/routes/cms/pages/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Button-rjMnZ3ec.js","_Card-D9smAXyI.js","_Topbar-UAezHi7t.js","_Table-BWC7UuMQ.js","_routing-0hP7Sh6N.js"]},"src/routes/cms/pricing/index.tsx?pick=default&pick=$css":{"file":"index3.js","name":"index","src":"src/routes/cms/pricing/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Button-rjMnZ3ec.js","_Card-D9smAXyI.js","_Topbar-UAezHi7t.js"]},"src/routes/cms/services/index.tsx?pick=default&pick=$css":{"file":"index4.js","name":"index","src":"src/routes/cms/services/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Button-rjMnZ3ec.js","_Card-D9smAXyI.js","_Topbar-UAezHi7t.js","_Table-BWC7UuMQ.js"]},"src/routes/cms/settings/index.tsx?pick=default&pick=$css":{"file":"index5.js","name":"index","src":"src/routes/cms/settings/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Button-rjMnZ3ec.js","_Input-0sOzVmib.js","_Card-D9smAXyI.js","_Topbar-UAezHi7t.js","_Select-DpfdCahF.js"]},"src/routes/dashboard/client/index.tsx?pick=default&pick=$css":{"file":"index6.js","name":"index","src":"src/routes/dashboard/client/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Card-D9smAXyI.js","_Topbar-UAezHi7t.js"]},"src/routes/dashboard/franchise/index.tsx?pick=default&pick=$css":{"file":"index7.js","name":"index","src":"src/routes/dashboard/franchise/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Card-D9smAXyI.js","_Topbar-UAezHi7t.js"]},"src/routes/dashboard/management/index.tsx?pick=default&pick=$css":{"file":"index8.js","name":"index","src":"src/routes/dashboard/management/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Card-D9smAXyI.js","_Topbar-UAezHi7t.js","_Table-BWC7UuMQ.js"]},"src/routes/dashboard/owner/index.tsx?pick=default&pick=$css":{"file":"index9.js","name":"index","src":"src/routes/dashboard/owner/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Card-D9smAXyI.js","_Topbar-UAezHi7t.js"]},"src/routes/dashboard/partner/index.tsx?pick=default&pick=$css":{"file":"index10.js","name":"index","src":"src/routes/dashboard/partner/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Card-D9smAXyI.js","_Topbar-UAezHi7t.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"index11.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true},"virtual:$vinxi/handler/ssr":{"file":"ssr.js","name":"ssr","src":"virtual:$vinxi/handler/ssr","isEntry":true,"imports":["_ssr-CFrG4X4Z.js"]}},"client":{"_Select-Cap5-moz.js":{"file":"assets/Select-Cap5-moz.js","name":"Select","imports":["_web-UFtpux7-.js"]},"_Topbar-ZFk08UJX.js":{"file":"assets/Topbar-ZFk08UJX.js","name":"Topbar","imports":["_web-UFtpux7-.js"]},"_routing-tmIMdZIt.js":{"file":"assets/routing-tmIMdZIt.js","name":"routing","imports":["_web-UFtpux7-.js"]},"_web-UFtpux7-.js":{"file":"assets/web-UFtpux7-.js","name":"web"},"src/routes/auth/login.tsx?pick=default&pick=$css":{"file":"assets/login-C_9nWGG-.js","name":"login","src":"src/routes/auth/login.tsx?pick=default&pick=$css","isEntry":true,"imports":["_web-UFtpux7-.js","_Select-Cap5-moz.js","_routing-tmIMdZIt.js"]},"src/routes/cms/media/index.tsx?pick=default&pick=$css":{"file":"assets/index-DKkIfRux.js","name":"index","src":"src/routes/cms/media/index.tsx?pick=default&pick=$css","isEntry":true,"imports":["_web-UFtpux7-.js","_Select-Cap5-moz.js","_Topbar-ZFk08UJX.js"]},"src/routes/cms/pages/[id].tsx?pick=default&pick=$css":{"file":"assets/_id_-d1Zifeky.js","name":"_id_","src":"src/routes/cms/pages/[id].tsx?pick=default&pick=$css","isEntry":true,"imports":["_web-UFtpux7-.js","_Select-Cap5-moz.js","_Topbar-ZFk08UJX.js","_routing-tmIMdZIt.js"]},"src/routes/cms/pages/index.tsx?pick=default&pick=$css":{"file":"assets/index-C8RkO9Bm.js","name":"index","src":"src/routes/cms/pages/index.tsx?pick=default&pick=$css","isEntry":true,"imports":["_web-UFtpux7-.js","_Select-Cap5-moz.js","_Topbar-ZFk08UJX.js","_routing-tmIMdZIt.js"]},"src/routes/cms/pricing/index.tsx?pick=default&pick=$css":{"file":"assets/index-Bn9R5Xzu.js","name":"index","src":"src/routes/cms/pricing/index.tsx?pick=default&pick=$css","isEntry":true,"imports":["_web-UFtpux7-.js","_Select-Cap5-moz.js","_Topbar-ZFk08UJX.js"]},"src/routes/cms/services/index.tsx?pick=default&pick=$css":{"file":"assets/index-GO96JWkE.js","name":"index","src":"src/routes/cms/services/index.tsx?pick=default&pick=$css","isEntry":true,"imports":["_web-UFtpux7-.js","_Select-Cap5-moz.js","_Topbar-ZFk08UJX.js"]},"src/routes/cms/settings/index.tsx?pick=default&pick=$css":{"file":"assets/index-DjE2r30L.js","name":"index","src":"src/routes/cms/settings/index.tsx?pick=default&pick=$css","isEntry":true,"imports":["_web-UFtpux7-.js","_Select-Cap5-moz.js","_Topbar-ZFk08UJX.js"]},"src/routes/dashboard/client/index.tsx?pick=default&pick=$css":{"file":"assets/index-BA5tMgZ_.js","name":"index","src":"src/routes/dashboard/client/index.tsx?pick=default&pick=$css","isEntry":true,"imports":["_web-UFtpux7-.js","_Select-Cap5-moz.js","_Topbar-ZFk08UJX.js"]},"src/routes/dashboard/franchise/index.tsx?pick=default&pick=$css":{"file":"assets/index-BKwlDawL.js","name":"index","src":"src/routes/dashboard/franchise/index.tsx?pick=default&pick=$css","isEntry":true,"imports":["_web-UFtpux7-.js","_Select-Cap5-moz.js","_Topbar-ZFk08UJX.js"]},"src/routes/dashboard/management/index.tsx?pick=default&pick=$css":{"file":"assets/index-C0lPvqp1.js","name":"index","src":"src/routes/dashboard/management/index.tsx?pick=default&pick=$css","isEntry":true,"imports":["_web-UFtpux7-.js","_Select-Cap5-moz.js","_Topbar-ZFk08UJX.js"]},"src/routes/dashboard/owner/index.tsx?pick=default&pick=$css":{"file":"assets/index-C6SnS8vR.js","name":"index","src":"src/routes/dashboard/owner/index.tsx?pick=default&pick=$css","isEntry":true,"imports":["_web-UFtpux7-.js","_Select-Cap5-moz.js","_Topbar-ZFk08UJX.js"]},"src/routes/dashboard/partner/index.tsx?pick=default&pick=$css":{"file":"assets/index-DpMxU2tw.js","name":"index","src":"src/routes/dashboard/partner/index.tsx?pick=default&pick=$css","isEntry":true,"imports":["_web-UFtpux7-.js","_Select-Cap5-moz.js","_Topbar-ZFk08UJX.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"assets/index-BCMZtCtU.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"imports":["_web-UFtpux7-.js"]},"virtual:$vinxi/handler/client":{"file":"assets/client-B43zKqWU.js","name":"client","src":"virtual:$vinxi/handler/client","isEntry":true,"imports":["_web-UFtpux7-.js"],"css":["assets/client-BERDO86b.css"]}},"server-fns":{"_Button-rjMnZ3ec.js":{"file":"assets/Button-rjMnZ3ec.js","name":"Button"},"_Card-D9smAXyI.js":{"file":"assets/Card-D9smAXyI.js","name":"Card"},"_Input-0sOzVmib.js":{"file":"assets/Input-0sOzVmib.js","name":"Input"},"_Select-DpfdCahF.js":{"file":"assets/Select-DpfdCahF.js","name":"Select"},"_Table-BWC7UuMQ.js":{"file":"assets/Table-BWC7UuMQ.js","name":"Table"},"_Topbar-UAezHi7t.js":{"file":"assets/Topbar-UAezHi7t.js","name":"Topbar"},"_routing-wKbSS_gE.js":{"file":"assets/routing-wKbSS_gE.js","name":"routing"},"src/app.tsx":{"file":"assets/app-D7wd_jxA.js","name":"app","src":"src/app.tsx","isDynamicEntry":true,"css":["assets/app-BERDO86b.css"]},"src/routes/auth/login.tsx?pick=default&pick=$css":{"file":"login.js","name":"login","src":"src/routes/auth/login.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Button-rjMnZ3ec.js","_Input-0sOzVmib.js","_Card-D9smAXyI.js","_routing-wKbSS_gE.js"]},"src/routes/cms/media/index.tsx?pick=default&pick=$css":{"file":"index.js","name":"index","src":"src/routes/cms/media/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Button-rjMnZ3ec.js","_Card-D9smAXyI.js","_Topbar-UAezHi7t.js"]},"src/routes/cms/pages/[id].tsx?pick=default&pick=$css":{"file":"_id_.js","name":"_id_","src":"src/routes/cms/pages/[id].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Button-rjMnZ3ec.js","_Input-0sOzVmib.js","_Card-D9smAXyI.js","_Topbar-UAezHi7t.js","_Select-DpfdCahF.js","_routing-wKbSS_gE.js"]},"src/routes/cms/pages/index.tsx?pick=default&pick=$css":{"file":"index2.js","name":"index","src":"src/routes/cms/pages/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Button-rjMnZ3ec.js","_Card-D9smAXyI.js","_Topbar-UAezHi7t.js","_Table-BWC7UuMQ.js","_routing-wKbSS_gE.js"]},"src/routes/cms/pricing/index.tsx?pick=default&pick=$css":{"file":"index3.js","name":"index","src":"src/routes/cms/pricing/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Button-rjMnZ3ec.js","_Card-D9smAXyI.js","_Topbar-UAezHi7t.js"]},"src/routes/cms/services/index.tsx?pick=default&pick=$css":{"file":"index4.js","name":"index","src":"src/routes/cms/services/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Button-rjMnZ3ec.js","_Card-D9smAXyI.js","_Topbar-UAezHi7t.js","_Table-BWC7UuMQ.js"]},"src/routes/cms/settings/index.tsx?pick=default&pick=$css":{"file":"index5.js","name":"index","src":"src/routes/cms/settings/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Button-rjMnZ3ec.js","_Input-0sOzVmib.js","_Card-D9smAXyI.js","_Topbar-UAezHi7t.js","_Select-DpfdCahF.js"]},"src/routes/dashboard/client/index.tsx?pick=default&pick=$css":{"file":"index6.js","name":"index","src":"src/routes/dashboard/client/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Card-D9smAXyI.js","_Topbar-UAezHi7t.js"]},"src/routes/dashboard/franchise/index.tsx?pick=default&pick=$css":{"file":"index7.js","name":"index","src":"src/routes/dashboard/franchise/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Card-D9smAXyI.js","_Topbar-UAezHi7t.js"]},"src/routes/dashboard/management/index.tsx?pick=default&pick=$css":{"file":"index8.js","name":"index","src":"src/routes/dashboard/management/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Card-D9smAXyI.js","_Topbar-UAezHi7t.js","_Table-BWC7UuMQ.js"]},"src/routes/dashboard/owner/index.tsx?pick=default&pick=$css":{"file":"index9.js","name":"index","src":"src/routes/dashboard/owner/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Card-D9smAXyI.js","_Topbar-UAezHi7t.js"]},"src/routes/dashboard/partner/index.tsx?pick=default&pick=$css":{"file":"index10.js","name":"index","src":"src/routes/dashboard/partner/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_Card-D9smAXyI.js","_Topbar-UAezHi7t.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"index11.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true},"virtual:$vinxi/handler/server-fns":{"file":"server-fns.js","name":"server-fns","src":"virtual:$vinxi/handler/server-fns","isEntry":true,"dynamicImports":["src/routes/auth/login.tsx?pick=default&pick=$css","src/routes/auth/login.tsx?pick=default&pick=$css","src/routes/cms/media/index.tsx?pick=default&pick=$css","src/routes/cms/media/index.tsx?pick=default&pick=$css","src/routes/cms/pages/index.tsx?pick=default&pick=$css","src/routes/cms/pages/index.tsx?pick=default&pick=$css","src/routes/cms/pages/[id].tsx?pick=default&pick=$css","src/routes/cms/pages/[id].tsx?pick=default&pick=$css","src/routes/cms/pricing/index.tsx?pick=default&pick=$css","src/routes/cms/pricing/index.tsx?pick=default&pick=$css","src/routes/cms/services/index.tsx?pick=default&pick=$css","src/routes/cms/services/index.tsx?pick=default&pick=$css","src/routes/cms/settings/index.tsx?pick=default&pick=$css","src/routes/cms/settings/index.tsx?pick=default&pick=$css","src/routes/dashboard/client/index.tsx?pick=default&pick=$css","src/routes/dashboard/client/index.tsx?pick=default&pick=$css","src/routes/dashboard/franchise/index.tsx?pick=default&pick=$css","src/routes/dashboard/franchise/index.tsx?pick=default&pick=$css","src/routes/dashboard/management/index.tsx?pick=default&pick=$css","src/routes/dashboard/management/index.tsx?pick=default&pick=$css","src/routes/dashboard/owner/index.tsx?pick=default&pick=$css","src/routes/dashboard/owner/index.tsx?pick=default&pick=$css","src/routes/dashboard/partner/index.tsx?pick=default&pick=$css","src/routes/dashboard/partner/index.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/app.tsx"]}}};

					const routeManifest = {"ssr":{},"client":{},"server-fns":{}};

        function createProdApp(appConfig) {
          return {
            config: { ...appConfig, buildManifest, routeManifest },
            getRouter(name) {
              return appConfig.routers.find(router => router.name === name)
            }
          }
        }

        function plugin$2(app) {
          const prodApp = createProdApp(appConfig);
          globalThis.app = prodApp;
        }

function plugin$1(app) {
	globalThis.$handle = (event) => app.h3App.handler(event);
}

/**
 * Traverses the module graph and collects assets for a given chunk
 *
 * @param {any} manifest Client manifest
 * @param {string} id Chunk id
 * @param {Map<string, string[]>} assetMap Cache of assets
 * @param {string[]} stack Stack of chunk ids to prevent circular dependencies
 * @returns Array of asset URLs
 */
function findAssetsInViteManifest(manifest, id, assetMap = new Map(), stack = []) {
	if (stack.includes(id)) {
		return [];
	}

	const cached = assetMap.get(id);
	if (cached) {
		return cached;
	}
	const chunk = manifest[id];
	if (!chunk) {
		return [];
	}

	const assets = [
		...(chunk.assets?.filter(Boolean) || []),
		...(chunk.css?.filter(Boolean) || [])
	];
	if (chunk.imports) {
		stack.push(id);
		for (let i = 0, l = chunk.imports.length; i < l; i++) {
			assets.push(...findAssetsInViteManifest(manifest, chunk.imports[i], assetMap, stack));
		}
		stack.pop();
	}
	assets.push(chunk.file);
	const all = Array.from(new Set(assets));
	assetMap.set(id, all);

	return all;
}

/** @typedef {import("../app.js").App & { config: { buildManifest: { [key:string]: any } }}} ProdApp */

function createHtmlTagsForAssets(router, app, assets) {
	return assets
		.filter(
			(asset) =>
				asset.endsWith(".css") ||
				asset.endsWith(".js") ||
				asset.endsWith(".mjs"),
		)
		.map((asset) => ({
			tag: "link",
			attrs: {
				href: joinURL(app.config.server.baseURL ?? "/", router.base, asset),
				key: join$1(app.config.server.baseURL ?? "", router.base, asset),
				...(asset.endsWith(".css")
					? { rel: "stylesheet", fetchPriority: "high" }
					: { rel: "modulepreload" }),
			},
		}));
}

/**
 *
 * @param {ProdApp} app
 * @returns
 */
function createProdManifest(app) {
	const manifest = new Proxy(
		{},
		{
			get(target, routerName) {
				invariant(typeof routerName === "string", "Bundler name expected");
				const router = app.getRouter(routerName);
				const bundlerManifest = app.config.buildManifest[routerName];

				invariant(
					router.type !== "static",
					"manifest not available for static router",
				);
				return {
					handler: router.handler,
					async assets() {
						/** @type {{ [key: string]: string[] }} */
						let assets = {};
						assets[router.handler] = await this.inputs[router.handler].assets();
						for (const route of (await router.internals.routes?.getRoutes()) ??
							[]) {
							assets[route.filePath] = await this.inputs[
								route.filePath
							].assets();
						}
						return assets;
					},
					async routes() {
						return (await router.internals.routes?.getRoutes()) ?? [];
					},
					async json() {
						/** @type {{ [key: string]: { output: string; assets: string[]} }} */
						let json = {};
						for (const input of Object.keys(this.inputs)) {
							json[input] = {
								output: this.inputs[input].output.path,
								assets: await this.inputs[input].assets(),
							};
						}
						return json;
					},
					chunks: new Proxy(
						{},
						{
							get(target, chunk) {
								invariant(typeof chunk === "string", "Chunk expected");
								const chunkPath = join$1(
									router.outDir,
									router.base,
									chunk + ".mjs",
								);
								return {
									import() {
										if (globalThis.$$chunks[chunk + ".mjs"]) {
											return globalThis.$$chunks[chunk + ".mjs"];
										}
										return import(
											/* @vite-ignore */ pathToFileURL(chunkPath).href
										);
									},
									output: {
										path: chunkPath,
									},
								};
							},
						},
					),
					inputs: new Proxy(
						{},
						{
							ownKeys(target) {
								const keys = Object.keys(bundlerManifest)
									.filter((id) => bundlerManifest[id].isEntry)
									.map((id) => id);
								return keys;
							},
							getOwnPropertyDescriptor(k) {
								return {
									enumerable: true,
									configurable: true,
								};
							},
							get(target, input) {
								invariant(typeof input === "string", "Input expected");
								if (router.target === "server") {
									const id =
										input === router.handler
											? virtualId(handlerModule(router))
											: input;
									return {
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: join$1(
												router.outDir,
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								} else if (router.target === "browser") {
									const id =
										input === router.handler && !input.endsWith(".html")
											? virtualId(handlerModule(router))
											: input;
									return {
										import() {
											return import(
												/* @vite-ignore */ joinURL(
													app.config.server.baseURL ?? "",
													router.base,
													bundlerManifest[id].file,
												)
											);
										},
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: joinURL(
												app.config.server.baseURL ?? "",
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								}
							},
						},
					),
				};
			},
		},
	);

	return manifest;
}

function plugin() {
	globalThis.MANIFEST =
		createProdManifest(globalThis.app)
			;
}

const chunks = {};
			 



			 function app() {
				 globalThis.$$chunks = chunks;
			 }

const plugins = [
  plugin$2,
plugin$1,
plugin,
app
];

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
function Dr(e, t) {
  const r = (e || "").split(";").filter((c) => typeof c == "string" && !!c.trim()), n = r.shift() || "", a = jr(n), i = a.name;
  let o = a.value;
  try {
    o = (t == null ? void 0 : t.decode) === false ? o : ((t == null ? void 0 : t.decode) || decodeURIComponent)(o);
  } catch {
  }
  const u = { name: i, value: o };
  for (const c of r) {
    const l = c.split("="), p = (l.shift() || "").trimStart().toLowerCase(), d = l.join("=");
    switch (p) {
      case "expires": {
        u.expires = new Date(d);
        break;
      }
      case "max-age": {
        u.maxAge = Number.parseInt(d, 10);
        break;
      }
      case "secure": {
        u.secure = true;
        break;
      }
      case "httponly": {
        u.httpOnly = true;
        break;
      }
      case "samesite": {
        u.sameSite = d;
        break;
      }
      default:
        u[p] = d;
    }
  }
  return u;
}
function jr(e) {
  let t = "", r = "";
  const n = e.split("=");
  return n.length > 1 ? (t = n.shift(), r = n.join("=")) : r = e, { name: t, value: r };
}
var Fr = ((e) => (e[e.AggregateError = 1] = "AggregateError", e[e.ArrowFunction = 2] = "ArrowFunction", e[e.ErrorPrototypeStack = 4] = "ErrorPrototypeStack", e[e.ObjectAssign = 8] = "ObjectAssign", e[e.BigIntTypedArray = 16] = "BigIntTypedArray", e[e.RegExp = 32] = "RegExp", e))(Fr || {}), k$1 = Symbol.asyncIterator, gt = Symbol.hasInstance, j = Symbol.isConcatSpreadable, A = Symbol.iterator, bt = Symbol.match, yt = Symbol.matchAll, wt = Symbol.replace, vt = Symbol.search, St = Symbol.species, Rt = Symbol.split, xt = Symbol.toPrimitive, F = Symbol.toStringTag, Et = Symbol.unscopables, Ur = { 0: "Symbol.asyncIterator", 1: "Symbol.hasInstance", 2: "Symbol.isConcatSpreadable", 3: "Symbol.iterator", 4: "Symbol.match", 5: "Symbol.matchAll", 6: "Symbol.replace", 7: "Symbol.search", 8: "Symbol.species", 9: "Symbol.split", 10: "Symbol.toPrimitive", 11: "Symbol.toStringTag", 12: "Symbol.unscopables" }, kt = { [k$1]: 0, [gt]: 1, [j]: 2, [A]: 3, [bt]: 4, [yt]: 5, [wt]: 6, [vt]: 7, [St]: 8, [Rt]: 9, [xt]: 10, [F]: 11, [Et]: 12 }, Hr = { 0: k$1, 1: gt, 2: j, 3: A, 4: bt, 5: yt, 6: wt, 7: vt, 8: St, 9: Rt, 10: xt, 11: F, 12: Et }, qr = { 2: "!0", 3: "!1", 1: "void 0", 0: "null", 4: "-0", 5: "1/0", 6: "-1/0", 7: "0/0" }, s = void 0, Br = { 2: true, 3: false, 1: s, 0: null, 4: -0, 5: Number.POSITIVE_INFINITY, 6: Number.NEGATIVE_INFINITY, 7: Number.NaN }, At = { 0: "Error", 1: "EvalError", 2: "RangeError", 3: "ReferenceError", 4: "SyntaxError", 5: "TypeError", 6: "URIError" }, Gr = { 0: Error, 1: EvalError, 2: RangeError, 3: ReferenceError, 4: SyntaxError, 5: TypeError, 6: URIError };
function m(e, t, r, n, a, i, o, u, c, l, p, d) {
  return { t: e, i: t, s: r, c: n, m: a, p: i, e: o, a: u, f: c, b: l, o: p, l: d };
}
function I$1(e) {
  return m(2, s, e, s, s, s, s, s, s, s, s, s);
}
var $t = I$1(2), Ot = I$1(3), Wr = I$1(1), Vr = I$1(0), Xr = I$1(4), Yr = I$1(5), Jr = I$1(6), Kr = I$1(7);
function Zr(e) {
  switch (e) {
    case '"':
      return '\\"';
    case "\\":
      return "\\\\";
    case `
`:
      return "\\n";
    case "\r":
      return "\\r";
    case "\b":
      return "\\b";
    case "	":
      return "\\t";
    case "\f":
      return "\\f";
    case "<":
      return "\\x3C";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return s;
  }
}
function E$1(e) {
  let t = "", r = 0, n;
  for (let a = 0, i = e.length; a < i; a++) n = Zr(e[a]), n && (t += e.slice(r, a) + n, r = a + 1);
  return r === 0 ? t = e : t += e.slice(r), t;
}
function Qr(e) {
  switch (e) {
    case "\\\\":
      return "\\";
    case '\\"':
      return '"';
    case "\\n":
      return `
`;
    case "\\r":
      return "\r";
    case "\\b":
      return "\b";
    case "\\t":
      return "	";
    case "\\f":
      return "\f";
    case "\\x3C":
      return "<";
    case "\\u2028":
      return "\u2028";
    case "\\u2029":
      return "\u2029";
    default:
      return e;
  }
}
function z(e) {
  return e.replace(/(\\\\|\\"|\\n|\\r|\\b|\\t|\\f|\\u2028|\\u2029|\\x3C)/g, Qr);
}
var G$1 = "__SEROVAL_REFS__", ie = "$R", ne = `self.${ie}`;
function en(e) {
  return e == null ? `${ne}=${ne}||[]` : `(${ne}=${ne}||{})["${E$1(e)}"]=[]`;
}
var It = /* @__PURE__ */ new Map(), D = /* @__PURE__ */ new Map();
function Ct(e) {
  return It.has(e);
}
function tn(e) {
  return D.has(e);
}
function rn(e) {
  if (Ct(e)) return It.get(e);
  throw new Nn(e);
}
function nn(e) {
  if (tn(e)) return D.get(e);
  throw new _n(e);
}
typeof globalThis < "u" ? Object.defineProperty(globalThis, G$1, { value: D, configurable: true, writable: false, enumerable: false }) : typeof self < "u" ? Object.defineProperty(self, G$1, { value: D, configurable: true, writable: false, enumerable: false }) : typeof global < "u" && Object.defineProperty(global, G$1, { value: D, configurable: true, writable: false, enumerable: false });
function ze$1(e) {
  return e instanceof EvalError ? 1 : e instanceof RangeError ? 2 : e instanceof ReferenceError ? 3 : e instanceof SyntaxError ? 4 : e instanceof TypeError ? 5 : e instanceof URIError ? 6 : 0;
}
function sn(e) {
  let t = At[ze$1(e)];
  return e.name !== t ? { name: e.name } : e.constructor.name !== t ? { name: e.constructor.name } : {};
}
function Nt(e, t) {
  let r = sn(e), n = Object.getOwnPropertyNames(e);
  for (let a = 0, i = n.length, o; a < i; a++) o = n[a], o !== "name" && o !== "message" && (o === "stack" ? t & 4 && (r = r || {}, r[o] = e[o]) : (r = r || {}, r[o] = e[o]));
  return r;
}
function _t(e) {
  return Object.isFrozen(e) ? 3 : Object.isSealed(e) ? 2 : Object.isExtensible(e) ? 0 : 1;
}
function an(e) {
  switch (e) {
    case Number.POSITIVE_INFINITY:
      return Yr;
    case Number.NEGATIVE_INFINITY:
      return Jr;
  }
  return e !== e ? Kr : Object.is(e, -0) ? Xr : m(0, s, e, s, s, s, s, s, s, s, s, s);
}
function zt(e) {
  return m(1, s, E$1(e), s, s, s, s, s, s, s, s, s);
}
function on(e) {
  return m(3, s, "" + e, s, s, s, s, s, s, s, s, s);
}
function un(e) {
  return m(4, e, s, s, s, s, s, s, s, s, s, s);
}
function cn(e, t) {
  let r = t.valueOf();
  return m(5, e, r !== r ? "" : t.toISOString(), s, s, s, s, s, s, s, s, s);
}
function ln(e, t) {
  return m(6, e, s, E$1(t.source), t.flags, s, s, s, s, s, s, s);
}
function fn(e, t) {
  return m(17, e, kt[t], s, s, s, s, s, s, s, s, s);
}
function pn(e, t) {
  return m(18, e, E$1(rn(t)), s, s, s, s, s, s, s, s, s);
}
function Pt(e, t, r) {
  return m(25, e, r, E$1(t), s, s, s, s, s, s, s, s);
}
function dn(e, t, r) {
  return m(9, e, s, s, s, s, s, r, s, s, _t(t), s);
}
function hn(e, t) {
  return m(21, e, s, s, s, s, s, s, t, s, s, s);
}
function mn(e, t, r) {
  return m(15, e, s, t.constructor.name, s, s, s, s, r, t.byteOffset, s, t.length);
}
function gn(e, t, r) {
  return m(16, e, s, t.constructor.name, s, s, s, s, r, t.byteOffset, s, t.byteLength);
}
function bn(e, t, r) {
  return m(20, e, s, s, s, s, s, s, r, t.byteOffset, s, t.byteLength);
}
function yn(e, t, r) {
  return m(13, e, ze$1(t), s, E$1(t.message), r, s, s, s, s, s, s);
}
function wn(e, t, r) {
  return m(14, e, ze$1(t), s, E$1(t.message), r, s, s, s, s, s, s);
}
function vn(e, t) {
  return m(7, e, s, s, s, s, s, t, s, s, s, s);
}
function Sn(e, t) {
  return m(28, s, s, s, s, s, s, [e, t], s, s, s, s);
}
function Rn(e, t) {
  return m(30, s, s, s, s, s, s, [e, t], s, s, s, s);
}
function xn(e, t, r) {
  return m(31, e, s, s, s, s, s, r, t, s, s, s);
}
function En(e, t) {
  return m(32, e, s, s, s, s, s, s, t, s, s, s);
}
function kn(e, t) {
  return m(33, e, s, s, s, s, s, s, t, s, s, s);
}
function An(e, t) {
  return m(34, e, s, s, s, s, s, s, t, s, s, s);
}
var $n = { parsing: 1, serialization: 2, deserialization: 3 };
function On(e) {
  return `Seroval Error (step: ${$n[e]})`;
}
var In = (e, t) => On(e), Tt = class extends Error {
  constructor(e, t) {
    super(In(e)), this.cause = t;
  }
}, Be$1 = class Be extends Tt {
  constructor(e) {
    super("parsing", e);
  }
}, Cn = class extends Tt {
  constructor(e) {
    super("deserialization", e);
  }
};
function $$1(e) {
  return `Seroval Error (specific: ${e})`;
}
var ce = class extends Error {
  constructor(e) {
    super($$1(1)), this.value = e;
  }
}, P$1 = class P extends Error {
  constructor(e) {
    super($$1(2));
  }
}, Lt = class extends Error {
  constructor(e) {
    super($$1(3));
  }
}, Q = class extends Error {
  constructor(e) {
    super($$1(4));
  }
}, Nn = class extends Error {
  constructor(e) {
    super($$1(5)), this.value = e;
  }
}, _n = class extends Error {
  constructor(e) {
    super($$1(6));
  }
}, zn = class extends Error {
  constructor(e) {
    super($$1(7));
  }
}, C = class extends Error {
  constructor(t) {
    super($$1(8));
  }
}, Mt = class extends Error {
  constructor(t) {
    super($$1(9));
  }
}, Pn = class {
  constructor(t, r) {
    this.value = t, this.replacement = r;
  }
}, le = () => {
  let e = { p: 0, s: 0, f: 0 };
  return e.p = new Promise((t, r) => {
    e.s = t, e.f = r;
  }), e;
}, Tn = (e, t) => {
  e.s(t), e.p.s = 1, e.p.v = t;
}, Ln = (e, t) => {
  e.f(t), e.p.s = 2, e.p.v = t;
}, Mn = le.toString(), Dn = Tn.toString(), jn = Ln.toString(), Dt = () => {
  let e = [], t = [], r = true, n = false, a = 0, i = (c, l, p) => {
    for (p = 0; p < a; p++) t[p] && t[p][l](c);
  }, o = (c, l, p, d) => {
    for (l = 0, p = e.length; l < p; l++) d = e[l], !r && l === p - 1 ? c[n ? "return" : "throw"](d) : c.next(d);
  }, u = (c, l) => (r && (l = a++, t[l] = c), o(c), () => {
    r && (t[l] = t[a], t[a--] = void 0);
  });
  return { __SEROVAL_STREAM__: true, on: (c) => u(c), next: (c) => {
    r && (e.push(c), i(c, "next"));
  }, throw: (c) => {
    r && (e.push(c), i(c, "throw"), r = false, n = false, t.length = 0);
  }, return: (c) => {
    r && (e.push(c), i(c, "return"), r = false, n = true, t.length = 0);
  } };
}, Fn = Dt.toString(), jt = (e) => (t) => () => {
  let r = 0, n = { [e]: () => n, next: () => {
    if (r > t.d) return { done: true, value: void 0 };
    let a = r++, i = t.v[a];
    if (a === t.t) throw i;
    return { done: a === t.d, value: i };
  } };
  return n;
}, Un = jt.toString(), Ft = (e, t) => (r) => () => {
  let n = 0, a = -1, i = false, o = [], u = [], c = (p = 0, d = u.length) => {
    for (; p < d; p++) u[p].s({ done: true, value: void 0 });
  };
  r.on({ next: (p) => {
    let d = u.shift();
    d && d.s({ done: false, value: p }), o.push(p);
  }, throw: (p) => {
    let d = u.shift();
    d && d.f(p), c(), a = o.length, i = true, o.push(p);
  }, return: (p) => {
    let d = u.shift();
    d && d.s({ done: true, value: p }), c(), a = o.length, o.push(p);
  } });
  let l = { [e]: () => l, next: () => {
    if (a === -1) {
      let v = n++;
      if (v >= o.length) {
        let f = t();
        return u.push(f), f.p;
      }
      return { done: false, value: o[v] };
    }
    if (n > a) return { done: true, value: void 0 };
    let p = n++, d = o[p];
    if (p !== a) return { done: false, value: d };
    if (i) throw d;
    return { done: true, value: d };
  } };
  return l;
}, Hn = Ft.toString(), Ut = (e) => {
  let t = atob(e), r = t.length, n = new Uint8Array(r);
  for (let a = 0; a < r; a++) n[a] = t.charCodeAt(a);
  return n.buffer;
}, qn = Ut.toString(), Bn = {}, Gn = {}, Wn = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {} }, Vn = { 0: "[]", 1: Mn, 2: Dn, 3: jn, 4: Fn, 5: qn };
function fe$1(e) {
  return "__SEROVAL_STREAM__" in e;
}
function ee() {
  return Dt();
}
function Xn(e) {
  let t = ee(), r = e[k$1]();
  async function n() {
    try {
      let a = await r.next();
      a.done ? t.return(a.value) : (t.next(a.value), await n());
    } catch (a) {
      t.throw(a);
    }
  }
  return n().catch(() => {
  }), t;
}
var Yn = Ft(k$1, le);
function Jn(e) {
  return Yn(e);
}
function Kn(e) {
  let t = [], r = -1, n = -1, a = e[A]();
  for (; ; ) try {
    let i = a.next();
    if (t.push(i.value), i.done) {
      n = t.length - 1;
      break;
    }
  } catch (i) {
    r = t.length, t.push(i);
  }
  return { v: t, t: r, d: n };
}
var Zn = jt(A);
function Qn(e) {
  return Zn(e);
}
function es(e, t) {
  return { plugins: t.plugins, mode: e, marked: /* @__PURE__ */ new Set(), features: 63 ^ (t.disabledFeatures || 0), refs: t.refs || /* @__PURE__ */ new Map(), depthLimit: t.depthLimit || 1e3 };
}
function ts(e, t) {
  e.marked.add(t);
}
function Ht(e, t) {
  let r = e.refs.size;
  return e.refs.set(t, r), r;
}
function pe(e, t) {
  let r = e.refs.get(t);
  return r != null ? (ts(e, r), { type: 1, value: un(r) }) : { type: 0, value: Ht(e, t) };
}
function Pe$1(e, t) {
  let r = pe(e, t);
  return r.type === 1 ? r : Ct(t) ? { type: 2, value: pn(r.value, t) } : r;
}
function N$1(e, t) {
  let r = Pe$1(e, t);
  if (r.type !== 0) return r.value;
  if (t in kt) return fn(r.value, t);
  throw new ce(t);
}
function L$1(e, t) {
  let r = pe(e, Wn[t]);
  return r.type === 1 ? r.value : m(26, r.value, t, s, s, s, s, s, s, s, s, s);
}
function rs(e) {
  let t = pe(e, Bn);
  return t.type === 1 ? t.value : m(27, t.value, s, s, s, s, s, s, N$1(e, A), s, s, s);
}
function ns(e) {
  let t = pe(e, Gn);
  return t.type === 1 ? t.value : m(29, t.value, s, s, s, s, s, [L$1(e, 1), N$1(e, k$1)], s, s, s, s);
}
function ss(e, t, r, n) {
  return m(r ? 11 : 10, e, s, s, s, n, s, s, s, s, _t(t), s);
}
function as(e, t, r, n) {
  return m(8, t, s, s, s, s, { k: r, v: n }, s, L$1(e, 0), s, s, s);
}
function is(e, t, r) {
  return m(22, t, r, s, s, s, s, s, L$1(e, 1), s, s, s);
}
function os(e, t, r) {
  let n = new Uint8Array(r), a = "";
  for (let i = 0, o = n.length; i < o; i++) a += String.fromCharCode(n[i]);
  return m(19, t, E$1(btoa(a)), s, s, s, s, s, L$1(e, 5), s, s, s);
}
var us = ((e) => (e[e.Vanilla = 1] = "Vanilla", e[e.Cross = 2] = "Cross", e))(us || {});
function qt(e, t) {
  for (let r = 0, n = t.length; r < n; r++) {
    let a = t[r];
    e.has(a) || (e.add(a), a.extends && qt(e, a.extends));
  }
}
function Bt(e) {
  if (e) {
    let t = /* @__PURE__ */ new Set();
    return qt(t, e), [...t];
  }
}
function cs(e) {
  switch (e) {
    case "Int8Array":
      return Int8Array;
    case "Int16Array":
      return Int16Array;
    case "Int32Array":
      return Int32Array;
    case "Uint8Array":
      return Uint8Array;
    case "Uint16Array":
      return Uint16Array;
    case "Uint32Array":
      return Uint32Array;
    case "Uint8ClampedArray":
      return Uint8ClampedArray;
    case "Float32Array":
      return Float32Array;
    case "Float64Array":
      return Float64Array;
    case "BigInt64Array":
      return BigInt64Array;
    case "BigUint64Array":
      return BigUint64Array;
    default:
      throw new zn(e);
  }
}
var ls = 1e6, fs = 1e4, ps = 2e4;
function Gt(e, t) {
  switch (t) {
    case 3:
      return Object.freeze(e);
    case 1:
      return Object.preventExtensions(e);
    case 2:
      return Object.seal(e);
    default:
      return e;
  }
}
var ds = 1e3;
function hs(e, t) {
  var r;
  return { mode: e, plugins: t.plugins, refs: t.refs || /* @__PURE__ */ new Map(), features: (r = t.features) != null ? r : 63 ^ (t.disabledFeatures || 0), depthLimit: t.depthLimit || ds };
}
function ms(e) {
  return { mode: 1, base: hs(1, e), child: s, state: { marked: new Set(e.markedRefs) } };
}
var gs = class {
  constructor(e, t) {
    this._p = e, this.depth = t;
  }
  deserialize(e) {
    return b$1(this._p, this.depth, e);
  }
};
function Wt(e, t) {
  if (t < 0 || !Number.isFinite(t) || !Number.isInteger(t)) throw new C({ t: 4, i: t });
  if (e.refs.has(t)) throw new Error("Conflicted ref id: " + t);
}
function bs(e, t, r) {
  return Wt(e.base, t), e.state.marked.has(t) && e.base.refs.set(t, r), r;
}
function ys(e, t, r) {
  return Wt(e.base, t), e.base.refs.set(t, r), r;
}
function y$1(e, t, r) {
  return e.mode === 1 ? bs(e, t, r) : ys(e, t, r);
}
function Re$1(e, t, r) {
  if (Object.hasOwn(t, r)) return t[r];
  throw new C(e);
}
function ws(e, t) {
  return y$1(e, t.i, nn(z(t.s)));
}
function vs(e, t, r) {
  let n = r.a, a = n.length, i = y$1(e, r.i, new Array(a));
  for (let o = 0, u; o < a; o++) u = n[o], u && (i[o] = b$1(e, t, u));
  return Gt(i, r.o), i;
}
function Ss(e) {
  switch (e) {
    case "constructor":
    case "__proto__":
    case "prototype":
    case "__defineGetter__":
    case "__defineSetter__":
    case "__lookupGetter__":
    case "__lookupSetter__":
      return false;
    default:
      return true;
  }
}
function Rs(e) {
  switch (e) {
    case k$1:
    case j:
    case F:
    case A:
      return true;
    default:
      return false;
  }
}
function Ge$1(e, t, r) {
  Ss(t) ? e[t] = r : Object.defineProperty(e, t, { value: r, configurable: true, enumerable: true, writable: true });
}
function xs(e, t, r, n, a) {
  if (typeof n == "string") Ge$1(r, n, b$1(e, t, a));
  else {
    let i = b$1(e, t, n);
    switch (typeof i) {
      case "string":
        Ge$1(r, i, b$1(e, t, a));
        break;
      case "symbol":
        Rs(i) && (r[i] = b$1(e, t, a));
        break;
      default:
        throw new C(n);
    }
  }
}
function Vt(e, t, r, n) {
  let a = r.k;
  if (a.length > 0) for (let i = 0, o = r.v, u = a.length; i < u; i++) xs(e, t, n, a[i], o[i]);
  return n;
}
function Es(e, t, r) {
  let n = y$1(e, r.i, r.t === 10 ? {} : /* @__PURE__ */ Object.create(null));
  return Vt(e, t, r.p, n), Gt(n, r.o), n;
}
function ks(e, t) {
  return y$1(e, t.i, new Date(t.s));
}
function As(e, t) {
  if (e.base.features & 32) {
    let r = z(t.c);
    if (r.length > ps) throw new C(t);
    return y$1(e, t.i, new RegExp(r, t.m));
  }
  throw new P$1(t);
}
function $s(e, t, r) {
  let n = y$1(e, r.i, /* @__PURE__ */ new Set());
  for (let a = 0, i = r.a, o = i.length; a < o; a++) n.add(b$1(e, t, i[a]));
  return n;
}
function Os(e, t, r) {
  let n = y$1(e, r.i, /* @__PURE__ */ new Map());
  for (let a = 0, i = r.e.k, o = r.e.v, u = i.length; a < u; a++) n.set(b$1(e, t, i[a]), b$1(e, t, o[a]));
  return n;
}
function Is(e, t) {
  if (t.s.length > ls) throw new C(t);
  return y$1(e, t.i, Ut(z(t.s)));
}
function Cs(e, t, r) {
  var n;
  let a = cs(r.c), i = b$1(e, t, r.f), o = (n = r.b) != null ? n : 0;
  if (o < 0 || o > i.byteLength) throw new C(r);
  return y$1(e, r.i, new a(i, o, r.l));
}
function Ns(e, t, r) {
  var n;
  let a = b$1(e, t, r.f), i = (n = r.b) != null ? n : 0;
  if (i < 0 || i > a.byteLength) throw new C(r);
  return y$1(e, r.i, new DataView(a, i, r.l));
}
function Xt(e, t, r, n) {
  if (r.p) {
    let a = Vt(e, t, r.p, {});
    Object.defineProperties(n, Object.getOwnPropertyDescriptors(a));
  }
  return n;
}
function _s(e, t, r) {
  let n = y$1(e, r.i, new AggregateError([], z(r.m)));
  return Xt(e, t, r, n);
}
function zs(e, t, r) {
  let n = Re$1(r, Gr, r.s), a = y$1(e, r.i, new n(z(r.m)));
  return Xt(e, t, r, a);
}
function Ps(e, t, r) {
  let n = le(), a = y$1(e, r.i, n.p), i = b$1(e, t, r.f);
  return r.s ? n.s(i) : n.f(i), a;
}
function Ts(e, t, r) {
  return y$1(e, r.i, Object(b$1(e, t, r.f)));
}
function Ls(e, t, r) {
  let n = e.base.plugins;
  if (n) {
    let a = z(r.c);
    for (let i = 0, o = n.length; i < o; i++) {
      let u = n[i];
      if (u.tag === a) return y$1(e, r.i, u.deserialize(r.s, new gs(e, t), { id: r.i }));
    }
  }
  throw new Lt(r.c);
}
function Ms(e, t) {
  return y$1(e, t.i, y$1(e, t.s, le()).p);
}
function Ds(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n) return n.s(b$1(e, t, r.a[1])), s;
  throw new Q("Promise");
}
function js(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n) return n.f(b$1(e, t, r.a[1])), s;
  throw new Q("Promise");
}
function Fs(e, t, r) {
  b$1(e, t, r.a[0]);
  let n = b$1(e, t, r.a[1]);
  return Qn(n);
}
function Us(e, t, r) {
  b$1(e, t, r.a[0]);
  let n = b$1(e, t, r.a[1]);
  return Jn(n);
}
function Hs(e, t, r) {
  let n = y$1(e, r.i, ee()), a = r.a, i = a.length;
  if (i) for (let o = 0; o < i; o++) b$1(e, t, a[o]);
  return n;
}
function qs(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n && fe$1(n)) return n.next(b$1(e, t, r.f)), s;
  throw new Q("Stream");
}
function Bs(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n && fe$1(n)) return n.throw(b$1(e, t, r.f)), s;
  throw new Q("Stream");
}
function Gs(e, t, r) {
  let n = e.base.refs.get(r.i);
  if (n && fe$1(n)) return n.return(b$1(e, t, r.f)), s;
  throw new Q("Stream");
}
function Ws(e, t, r) {
  return b$1(e, t, r.f), s;
}
function Vs(e, t, r) {
  return b$1(e, t, r.a[1]), s;
}
function b$1(e, t, r) {
  if (t > e.base.depthLimit) throw new Mt(e.base.depthLimit);
  switch (t += 1, r.t) {
    case 2:
      return Re$1(r, Br, r.s);
    case 0:
      return Number(r.s);
    case 1:
      return z(String(r.s));
    case 3:
      if (String(r.s).length > fs) throw new C(r);
      return BigInt(r.s);
    case 4:
      return e.base.refs.get(r.i);
    case 18:
      return ws(e, r);
    case 9:
      return vs(e, t, r);
    case 10:
    case 11:
      return Es(e, t, r);
    case 5:
      return ks(e, r);
    case 6:
      return As(e, r);
    case 7:
      return $s(e, t, r);
    case 8:
      return Os(e, t, r);
    case 19:
      return Is(e, r);
    case 16:
    case 15:
      return Cs(e, t, r);
    case 20:
      return Ns(e, t, r);
    case 14:
      return _s(e, t, r);
    case 13:
      return zs(e, t, r);
    case 12:
      return Ps(e, t, r);
    case 17:
      return Re$1(r, Hr, r.s);
    case 21:
      return Ts(e, t, r);
    case 25:
      return Ls(e, t, r);
    case 22:
      return Ms(e, r);
    case 23:
      return Ds(e, t, r);
    case 24:
      return js(e, t, r);
    case 28:
      return Fs(e, t, r);
    case 30:
      return Us(e, t, r);
    case 31:
      return Hs(e, t, r);
    case 32:
      return qs(e, t, r);
    case 33:
      return Bs(e, t, r);
    case 34:
      return Gs(e, t, r);
    case 27:
      return Ws(e, t, r);
    case 29:
      return Vs(e, t, r);
    default:
      throw new P$1(r);
  }
}
function Xs(e, t) {
  try {
    return b$1(e, 0, t);
  } catch (r) {
    throw new Cn(r);
  }
}
var Ys = () => T, Js = Ys.toString(), Yt = /=>/.test(Js);
function Jt(e, t) {
  return Yt ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>" + (t.startsWith("{") ? "(" + t + ")" : t) : "function(" + e.join(",") + "){return " + t + "}";
}
function Ks(e, t) {
  return Yt ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>{" + t + "}" : "function(" + e.join(",") + "){" + t + "}";
}
var Kt = "hjkmoquxzABCDEFGHIJKLNPQRTUVWXYZ$_", We$1 = Kt.length, Zt = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_", Ve$1 = Zt.length;
function Zs(e) {
  let t = e % We$1, r = Kt[t];
  for (e = (e - t) / We$1; e > 0; ) t = e % Ve$1, r += Zt[t], e = (e - t) / Ve$1;
  return r;
}
var Qs = /^[$A-Z_][0-9A-Z_$]*$/i;
function Qt(e) {
  let t = e[0];
  return (t === "$" || t === "_" || t >= "A" && t <= "Z" || t >= "a" && t <= "z") && Qs.test(e);
}
function W$1(e) {
  switch (e.t) {
    case 0:
      return e.s + "=" + e.v;
    case 2:
      return e.s + ".set(" + e.k + "," + e.v + ")";
    case 1:
      return e.s + ".add(" + e.v + ")";
    case 3:
      return e.s + ".delete(" + e.k + ")";
  }
}
function ea(e) {
  let t = [], r = e[0];
  for (let n = 1, a = e.length, i, o = r; n < a; n++) i = e[n], i.t === 0 && i.v === o.v ? r = { t: 0, s: i.s, k: s, v: W$1(r) } : i.t === 2 && i.s === o.s ? r = { t: 2, s: W$1(r), k: i.k, v: i.v } : i.t === 1 && i.s === o.s ? r = { t: 1, s: W$1(r), k: s, v: i.v } : i.t === 3 && i.s === o.s ? r = { t: 3, s: W$1(r), k: i.k, v: s } : (t.push(r), r = i), o = i;
  return t.push(r), t;
}
function er(e) {
  if (e.length) {
    let t = "", r = ea(e);
    for (let n = 0, a = r.length; n < a; n++) t += W$1(r[n]) + ",";
    return t;
  }
  return s;
}
var ta = "Object.create(null)", ra = "new Set", na = "new Map", sa = "Promise.resolve", aa = "Promise.reject", ia = { 3: "Object.freeze", 2: "Object.seal", 1: "Object.preventExtensions", 0: s };
function oa(e, t) {
  return { mode: e, plugins: t.plugins, features: t.features, marked: new Set(t.markedRefs), stack: [], flags: [], assignments: [] };
}
function ua(e) {
  return { mode: 2, base: oa(2, e), state: e, child: s };
}
var ca = class {
  constructor(e) {
    this._p = e;
  }
  serialize(e) {
    return h(this._p, e);
  }
};
function la(e, t) {
  let r = e.valid.get(t);
  r == null && (r = e.valid.size, e.valid.set(t, r));
  let n = e.vars[r];
  return n == null && (n = Zs(r), e.vars[r] = n), n;
}
function fa(e) {
  return ie + "[" + e + "]";
}
function g(e, t) {
  return e.mode === 1 ? la(e.state, t) : fa(t);
}
function x(e, t) {
  e.marked.add(t);
}
function xe$1(e, t) {
  return e.marked.has(t);
}
function Te$1(e, t, r) {
  t !== 0 && (x(e.base, r), e.base.flags.push({ type: t, value: g(e, r) }));
}
function pa(e) {
  let t = "";
  for (let r = 0, n = e.flags, a = n.length; r < a; r++) {
    let i = n[r];
    t += ia[i.type] + "(" + i.value + "),";
  }
  return t;
}
function da(e) {
  let t = er(e.assignments), r = pa(e);
  return t ? r ? t + r : t : r;
}
function tr(e, t, r) {
  e.assignments.push({ t: 0, s: t, k: s, v: r });
}
function ha(e, t, r) {
  e.base.assignments.push({ t: 1, s: g(e, t), k: s, v: r });
}
function B(e, t, r, n) {
  e.base.assignments.push({ t: 2, s: g(e, t), k: r, v: n });
}
function Xe$1(e, t, r) {
  e.base.assignments.push({ t: 3, s: g(e, t), k: r, v: s });
}
function Y(e, t, r, n) {
  tr(e.base, g(e, t) + "[" + r + "]", n);
}
function Ee$1(e, t, r, n) {
  tr(e.base, g(e, t) + "." + r, n);
}
function O$1(e, t) {
  return t.t === 4 && e.stack.includes(t.i);
}
function q$1(e, t, r) {
  return e.mode === 1 && !xe$1(e.base, t) ? r : g(e, t) + "=" + r;
}
function ma(e) {
  return G$1 + '.get("' + e.s + '")';
}
function Ye$1(e, t, r, n) {
  return r ? O$1(e.base, r) ? (x(e.base, t), Y(e, t, n, g(e, r.i)), "") : h(e, r) : "";
}
function ga(e, t) {
  let r = t.i, n = t.a, a = n.length;
  if (a > 0) {
    e.base.stack.push(r);
    let i = Ye$1(e, r, n[0], 0), o = i === "";
    for (let u = 1, c; u < a; u++) c = Ye$1(e, r, n[u], u), i += "," + c, o = c === "";
    return e.base.stack.pop(), Te$1(e, t.o, t.i), "[" + i + (o ? ",]" : "]");
  }
  return "[]";
}
function Je$1(e, t, r, n) {
  if (typeof r == "string") {
    let a = Number(r), i = a >= 0 && a.toString() === r || Qt(r);
    if (O$1(e.base, n)) {
      let o = g(e, n.i);
      return x(e.base, t.i), i && a !== a ? Ee$1(e, t.i, r, o) : Y(e, t.i, i ? r : '"' + r + '"', o), "";
    }
    return (i ? r : '"' + r + '"') + ":" + h(e, n);
  }
  return "[" + h(e, r) + "]:" + h(e, n);
}
function rr(e, t, r) {
  let n = r.k, a = n.length;
  if (a > 0) {
    let i = r.v;
    e.base.stack.push(t.i);
    let o = Je$1(e, t, n[0], i[0]);
    for (let u = 1, c = o; u < a; u++) c = Je$1(e, t, n[u], i[u]), o += (c && o && ",") + c;
    return e.base.stack.pop(), "{" + o + "}";
  }
  return "{}";
}
function ba(e, t) {
  return Te$1(e, t.o, t.i), rr(e, t, t.p);
}
function ya(e, t, r, n) {
  let a = rr(e, t, r);
  return a !== "{}" ? "Object.assign(" + n + "," + a + ")" : n;
}
function wa(e, t, r, n, a) {
  let i = e.base, o = h(e, a), u = Number(n), c = u >= 0 && u.toString() === n || Qt(n);
  if (O$1(i, a)) c && u !== u ? Ee$1(e, t.i, n, o) : Y(e, t.i, c ? n : '"' + n + '"', o);
  else {
    let l = i.assignments;
    i.assignments = r, c && u !== u ? Ee$1(e, t.i, n, o) : Y(e, t.i, c ? n : '"' + n + '"', o), i.assignments = l;
  }
}
function va(e, t, r, n, a) {
  if (typeof n == "string") wa(e, t, r, n, a);
  else {
    let i = e.base, o = i.stack;
    i.stack = [];
    let u = h(e, a);
    i.stack = o;
    let c = i.assignments;
    i.assignments = r, Y(e, t.i, h(e, n), u), i.assignments = c;
  }
}
function Sa(e, t, r) {
  let n = r.k, a = n.length;
  if (a > 0) {
    let i = [], o = r.v;
    e.base.stack.push(t.i);
    for (let u = 0; u < a; u++) va(e, t, i, n[u], o[u]);
    return e.base.stack.pop(), er(i);
  }
  return s;
}
function Le$1(e, t, r) {
  if (t.p) {
    let n = e.base;
    if (n.features & 8) r = ya(e, t, t.p, r);
    else {
      x(n, t.i);
      let a = Sa(e, t, t.p);
      if (a) return "(" + q$1(e, t.i, r) + "," + a + g(e, t.i) + ")";
    }
  }
  return r;
}
function Ra(e, t) {
  return Te$1(e, t.o, t.i), Le$1(e, t, ta);
}
function xa(e) {
  return 'new Date("' + e.s + '")';
}
function Ea(e, t) {
  if (e.base.features & 32) return "/" + t.c + "/" + t.m;
  throw new P$1(t);
}
function Ke(e, t, r) {
  let n = e.base;
  return O$1(n, r) ? (x(n, t), ha(e, t, g(e, r.i)), "") : h(e, r);
}
function ka(e, t) {
  let r = ra, n = t.a, a = n.length, i = t.i;
  if (a > 0) {
    e.base.stack.push(i);
    let o = Ke(e, i, n[0]);
    for (let u = 1, c = o; u < a; u++) c = Ke(e, i, n[u]), o += (c && o && ",") + c;
    e.base.stack.pop(), o && (r += "([" + o + "])");
  }
  return r;
}
function Ze$1(e, t, r, n, a) {
  let i = e.base;
  if (O$1(i, r)) {
    let o = g(e, r.i);
    if (x(i, t), O$1(i, n)) {
      let c = g(e, n.i);
      return B(e, t, o, c), "";
    }
    if (n.t !== 4 && n.i != null && xe$1(i, n.i)) {
      let c = "(" + h(e, n) + ",[" + a + "," + a + "])";
      return B(e, t, o, g(e, n.i)), Xe$1(e, t, a), c;
    }
    let u = i.stack;
    return i.stack = [], B(e, t, o, h(e, n)), i.stack = u, "";
  }
  if (O$1(i, n)) {
    let o = g(e, n.i);
    if (x(i, t), r.t !== 4 && r.i != null && xe$1(i, r.i)) {
      let c = "(" + h(e, r) + ",[" + a + "," + a + "])";
      return B(e, t, g(e, r.i), o), Xe$1(e, t, a), c;
    }
    let u = i.stack;
    return i.stack = [], B(e, t, h(e, r), o), i.stack = u, "";
  }
  return "[" + h(e, r) + "," + h(e, n) + "]";
}
function Aa(e, t) {
  let r = na, n = t.e.k, a = n.length, i = t.i, o = t.f, u = g(e, o.i), c = e.base;
  if (a > 0) {
    let l = t.e.v;
    c.stack.push(i);
    let p = Ze$1(e, i, n[0], l[0], u);
    for (let d = 1, v = p; d < a; d++) v = Ze$1(e, i, n[d], l[d], u), p += (v && p && ",") + v;
    c.stack.pop(), p && (r += "([" + p + "])");
  }
  return o.t === 26 && (x(c, o.i), r = "(" + h(e, o) + "," + r + ")"), r;
}
function $a(e, t) {
  return M$1(e, t.f) + '("' + t.s + '")';
}
function Oa(e, t) {
  return "new " + t.c + "(" + h(e, t.f) + "," + t.b + "," + t.l + ")";
}
function Ia(e, t) {
  return "new DataView(" + h(e, t.f) + "," + t.b + "," + t.l + ")";
}
function Ca(e, t) {
  let r = t.i;
  e.base.stack.push(r);
  let n = Le$1(e, t, 'new AggregateError([],"' + t.m + '")');
  return e.base.stack.pop(), n;
}
function Na(e, t) {
  return Le$1(e, t, "new " + At[t.s] + '("' + t.m + '")');
}
function _a(e, t) {
  let r, n = t.f, a = t.i, i = t.s ? sa : aa, o = e.base;
  if (O$1(o, n)) {
    let u = g(e, n.i);
    r = i + (t.s ? "().then(" + Jt([], u) + ")" : "().catch(" + Ks([], "throw " + u) + ")");
  } else {
    o.stack.push(a);
    let u = h(e, n);
    o.stack.pop(), r = i + "(" + u + ")";
  }
  return r;
}
function za(e, t) {
  return "Object(" + h(e, t.f) + ")";
}
function M$1(e, t) {
  let r = h(e, t);
  return t.t === 4 ? r : "(" + r + ")";
}
function Pa(e, t) {
  if (e.mode === 1) throw new P$1(t);
  return "(" + q$1(e, t.s, M$1(e, t.f) + "()") + ").p";
}
function Ta(e, t) {
  if (e.mode === 1) throw new P$1(t);
  return M$1(e, t.a[0]) + "(" + g(e, t.i) + "," + h(e, t.a[1]) + ")";
}
function La(e, t) {
  if (e.mode === 1) throw new P$1(t);
  return M$1(e, t.a[0]) + "(" + g(e, t.i) + "," + h(e, t.a[1]) + ")";
}
function Ma(e, t) {
  let r = e.base.plugins;
  if (r) for (let n = 0, a = r.length; n < a; n++) {
    let i = r[n];
    if (i.tag === t.c) return e.child == null && (e.child = new ca(e)), i.serialize(t.s, e.child, { id: t.i });
  }
  throw new Lt(t.c);
}
function Da(e, t) {
  let r = "", n = false;
  return t.f.t !== 4 && (x(e.base, t.f.i), r = "(" + h(e, t.f) + ",", n = true), r += q$1(e, t.i, "(" + Un + ")(" + g(e, t.f.i) + ")"), n && (r += ")"), r;
}
function ja(e, t) {
  return M$1(e, t.a[0]) + "(" + h(e, t.a[1]) + ")";
}
function Fa(e, t) {
  let r = t.a[0], n = t.a[1], a = e.base, i = "";
  r.t !== 4 && (x(a, r.i), i += "(" + h(e, r)), n.t !== 4 && (x(a, n.i), i += (i ? "," : "(") + h(e, n)), i && (i += ",");
  let o = q$1(e, t.i, "(" + Hn + ")(" + g(e, n.i) + "," + g(e, r.i) + ")");
  return i ? i + o + ")" : o;
}
function Ua(e, t) {
  return M$1(e, t.a[0]) + "(" + h(e, t.a[1]) + ")";
}
function Ha(e, t) {
  let r = q$1(e, t.i, M$1(e, t.f) + "()"), n = t.a.length;
  if (n) {
    let a = h(e, t.a[0]);
    for (let i = 1; i < n; i++) a += "," + h(e, t.a[i]);
    return "(" + r + "," + a + "," + g(e, t.i) + ")";
  }
  return r;
}
function qa(e, t) {
  return g(e, t.i) + ".next(" + h(e, t.f) + ")";
}
function Ba(e, t) {
  return g(e, t.i) + ".throw(" + h(e, t.f) + ")";
}
function Ga(e, t) {
  return g(e, t.i) + ".return(" + h(e, t.f) + ")";
}
function Wa(e, t) {
  switch (t.t) {
    case 17:
      return Ur[t.s];
    case 18:
      return ma(t);
    case 9:
      return ga(e, t);
    case 10:
      return ba(e, t);
    case 11:
      return Ra(e, t);
    case 5:
      return xa(t);
    case 6:
      return Ea(e, t);
    case 7:
      return ka(e, t);
    case 8:
      return Aa(e, t);
    case 19:
      return $a(e, t);
    case 16:
    case 15:
      return Oa(e, t);
    case 20:
      return Ia(e, t);
    case 14:
      return Ca(e, t);
    case 13:
      return Na(e, t);
    case 12:
      return _a(e, t);
    case 21:
      return za(e, t);
    case 22:
      return Pa(e, t);
    case 25:
      return Ma(e, t);
    case 26:
      return Vn[t.s];
    default:
      throw new P$1(t);
  }
}
function h(e, t) {
  switch (t.t) {
    case 2:
      return qr[t.s];
    case 0:
      return "" + t.s;
    case 1:
      return '"' + t.s + '"';
    case 3:
      return t.s + "n";
    case 4:
      return g(e, t.i);
    case 23:
      return Ta(e, t);
    case 24:
      return La(e, t);
    case 27:
      return Da(e, t);
    case 28:
      return ja(e, t);
    case 29:
      return Fa(e, t);
    case 30:
      return Ua(e, t);
    case 31:
      return Ha(e, t);
    case 32:
      return qa(e, t);
    case 33:
      return Ba(e, t);
    case 34:
      return Ga(e, t);
    default:
      return q$1(e, t.i, Wa(e, t));
  }
}
function Va(e, t) {
  let r = h(e, t), n = t.i;
  if (n == null) return r;
  let a = da(e.base), i = g(e, n), o = e.state.scopeId, u = o == null ? "" : ie, c = a ? "(" + r + "," + a + i + ")" : r;
  if (u === "") return t.t === 10 && !a ? "(" + c + ")" : c;
  let l = o == null ? "()" : "(" + ie + '["' + E$1(o) + '"])';
  return "(" + Jt([u], c) + ")" + l;
}
var Xa = class {
  constructor(e, t) {
    this._p = e, this.depth = t;
  }
  parse(e) {
    return S$1(this._p, this.depth, e);
  }
}, Ya = class {
  constructor(e, t) {
    this._p = e, this.depth = t;
  }
  parse(e) {
    return S$1(this._p, this.depth, e);
  }
  parseWithError(e) {
    return _$1(this._p, this.depth, e);
  }
  isAlive() {
    return this._p.state.alive;
  }
  pushPendingState() {
    Fe$1(this._p);
  }
  popPendingState() {
    J(this._p);
  }
  onParse(e) {
    U(this._p, e);
  }
  onError(e) {
    De$1(this._p, e);
  }
};
function Ja(e) {
  return { alive: true, pending: 0, initial: true, buffer: [], onParse: e.onParse, onError: e.onError, onDone: e.onDone };
}
function Ka(e) {
  return { type: 2, base: es(2, e), state: Ja(e) };
}
function Za(e, t, r) {
  let n = [];
  for (let a = 0, i = r.length; a < i; a++) a in r ? n[a] = S$1(e, t, r[a]) : n[a] = 0;
  return n;
}
function Qa(e, t, r, n) {
  return dn(r, n, Za(e, t, n));
}
function Me$1(e, t, r) {
  let n = Object.entries(r), a = [], i = [];
  for (let o = 0, u = n.length; o < u; o++) a.push(E$1(n[o][0])), i.push(S$1(e, t, n[o][1]));
  return A in r && (a.push(N$1(e.base, A)), i.push(Sn(rs(e.base), S$1(e, t, Kn(r))))), k$1 in r && (a.push(N$1(e.base, k$1)), i.push(Rn(ns(e.base), S$1(e, t, e.type === 1 ? ee() : Xn(r))))), F in r && (a.push(N$1(e.base, F)), i.push(zt(r[F]))), j in r && (a.push(N$1(e.base, j)), i.push(r[j] ? $t : Ot)), { k: a, v: i };
}
function de(e, t, r, n, a) {
  return ss(r, n, a, Me$1(e, t, n));
}
function ei(e, t, r, n) {
  return hn(r, S$1(e, t, n.valueOf()));
}
function ti(e, t, r, n) {
  return mn(r, n, S$1(e, t, n.buffer));
}
function ri(e, t, r, n) {
  return gn(r, n, S$1(e, t, n.buffer));
}
function ni(e, t, r, n) {
  return bn(r, n, S$1(e, t, n.buffer));
}
function Qe$1(e, t, r, n) {
  let a = Nt(n, e.base.features);
  return yn(r, n, a ? Me$1(e, t, a) : s);
}
function si(e, t, r, n) {
  let a = Nt(n, e.base.features);
  return wn(r, n, a ? Me$1(e, t, a) : s);
}
function ai(e, t, r, n) {
  let a = [], i = [];
  for (let [o, u] of n.entries()) a.push(S$1(e, t, o)), i.push(S$1(e, t, u));
  return as(e.base, r, a, i);
}
function ii(e, t, r, n) {
  let a = [];
  for (let i of n.keys()) a.push(S$1(e, t, i));
  return vn(r, a);
}
function oi(e, t, r, n) {
  let a = xn(r, L$1(e.base, 4), []);
  return e.type === 1 || (Fe$1(e), n.on({ next: (i) => {
    if (e.state.alive) {
      let o = _$1(e, t, i);
      o && U(e, En(r, o));
    }
  }, throw: (i) => {
    if (e.state.alive) {
      let o = _$1(e, t, i);
      o && U(e, kn(r, o));
    }
    J(e);
  }, return: (i) => {
    if (e.state.alive) {
      let o = _$1(e, t, i);
      o && U(e, An(r, o));
    }
    J(e);
  } })), a;
}
function ui(e, t, r) {
  if (this.state.alive) {
    let n = _$1(this, t, r);
    n && U(this, m(23, e, s, s, s, s, s, [L$1(this.base, 2), n], s, s, s, s)), J(this);
  }
}
function ci(e, t, r) {
  if (this.state.alive) {
    let n = _$1(this, t, r);
    n && U(this, m(24, e, s, s, s, s, s, [L$1(this.base, 3), n], s, s, s, s));
  }
  J(this);
}
function li(e, t, r, n) {
  let a = Ht(e.base, {});
  return e.type === 2 && (Fe$1(e), n.then(ui.bind(e, a, t), ci.bind(e, a, t))), is(e.base, r, a);
}
function fi(e, t, r, n, a) {
  for (let i = 0, o = a.length; i < o; i++) {
    let u = a[i];
    if (u.parse.sync && u.test(n)) return Pt(r, u.tag, u.parse.sync(n, new Xa(e, t), { id: r }));
  }
  return s;
}
function pi(e, t, r, n, a) {
  for (let i = 0, o = a.length; i < o; i++) {
    let u = a[i];
    if (u.parse.stream && u.test(n)) return Pt(r, u.tag, u.parse.stream(n, new Ya(e, t), { id: r }));
  }
  return s;
}
function nr(e, t, r, n) {
  let a = e.base.plugins;
  return a ? e.type === 1 ? fi(e, t, r, n, a) : pi(e, t, r, n, a) : s;
}
function di(e, t, r, n, a) {
  switch (a) {
    case Object:
      return de(e, t, r, n, false);
    case s:
      return de(e, t, r, n, true);
    case Date:
      return cn(r, n);
    case Error:
    case EvalError:
    case RangeError:
    case ReferenceError:
    case SyntaxError:
    case TypeError:
    case URIError:
      return Qe$1(e, t, r, n);
    case Number:
    case Boolean:
    case String:
    case BigInt:
      return ei(e, t, r, n);
    case ArrayBuffer:
      return os(e.base, r, n);
    case Int8Array:
    case Int16Array:
    case Int32Array:
    case Uint8Array:
    case Uint16Array:
    case Uint32Array:
    case Uint8ClampedArray:
    case Float32Array:
    case Float64Array:
      return ti(e, t, r, n);
    case DataView:
      return ni(e, t, r, n);
    case Map:
      return ai(e, t, r, n);
    case Set:
      return ii(e, t, r, n);
  }
  if (a === Promise || n instanceof Promise) return li(e, t, r, n);
  let i = e.base.features;
  if (i & 32 && a === RegExp) return ln(r, n);
  if (i & 16) switch (a) {
    case BigInt64Array:
    case BigUint64Array:
      return ri(e, t, r, n);
  }
  if (i & 1 && typeof AggregateError < "u" && (a === AggregateError || n instanceof AggregateError)) return si(e, t, r, n);
  if (n instanceof Error) return Qe$1(e, t, r, n);
  if (A in n || k$1 in n) return de(e, t, r, n, !!a);
  throw new ce(n);
}
function hi(e, t, r, n) {
  if (Array.isArray(n)) return Qa(e, t, r, n);
  if (fe$1(n)) return oi(e, t, r, n);
  let a = n.constructor;
  return a === Pn ? S$1(e, t, n.replacement) : nr(e, t, r, n) || di(e, t, r, n, a);
}
function mi(e, t, r) {
  let n = Pe$1(e.base, r);
  if (n.type !== 0) return n.value;
  let a = nr(e, t, n.value, r);
  if (a) return a;
  throw new ce(r);
}
function S$1(e, t, r) {
  if (t >= e.base.depthLimit) throw new Mt(e.base.depthLimit);
  switch (typeof r) {
    case "boolean":
      return r ? $t : Ot;
    case "undefined":
      return Wr;
    case "string":
      return zt(r);
    case "number":
      return an(r);
    case "bigint":
      return on(r);
    case "object": {
      if (r) {
        let n = Pe$1(e.base, r);
        return n.type === 0 ? hi(e, t + 1, n.value, r) : n.value;
      }
      return Vr;
    }
    case "symbol":
      return N$1(e.base, r);
    case "function":
      return mi(e, t, r);
    default:
      throw new ce(r);
  }
}
function U(e, t) {
  e.state.initial ? e.state.buffer.push(t) : je$1(e, t, false);
}
function De$1(e, t) {
  if (e.state.onError) e.state.onError(t);
  else throw t instanceof Be$1 ? t : new Be$1(t);
}
function sr(e) {
  e.state.onDone && e.state.onDone();
}
function je$1(e, t, r) {
  try {
    e.state.onParse(t, r);
  } catch (n) {
    De$1(e, n);
  }
}
function Fe$1(e) {
  e.state.pending++;
}
function J(e) {
  --e.state.pending <= 0 && sr(e);
}
function _$1(e, t, r) {
  try {
    return S$1(e, t, r);
  } catch (n) {
    return De$1(e, n), s;
  }
}
function gi(e, t) {
  let r = _$1(e, 0, t);
  r && (je$1(e, r, true), e.state.initial = false, bi(e, e.state), e.state.pending <= 0 && ar(e));
}
function bi(e, t) {
  for (let r = 0, n = t.buffer.length; r < n; r++) je$1(e, t.buffer[r], false);
}
function ar(e) {
  e.state.alive && (sr(e), e.state.alive = false);
}
function yi(e, t) {
  let r = Bt(t.plugins), n = Ka({ plugins: r, refs: t.refs, disabledFeatures: t.disabledFeatures, onParse(a, i) {
    let o = ua({ plugins: r, features: n.base.features, scopeId: t.scopeId, markedRefs: n.base.marked }), u;
    try {
      u = Va(o, a);
    } catch (c) {
      t.onError && t.onError(c);
      return;
    }
    t.onSerialize(u, i);
  }, onError: t.onError, onDone: t.onDone });
  return gi(n, e), ar.bind(null, n);
}
function et$1(e, t = {}) {
  var r;
  let n = Bt(t.plugins), a = t.disabledFeatures || 0, i = (r = e.f) != null ? r : 63, o = ms({ plugins: n, markedRefs: e.m, features: i & ~a, disabledFeatures: a });
  return Xs(o, e.t);
}
function he(e) {
  return { detail: e.detail, bubbles: e.bubbles, cancelable: e.cancelable, composed: e.composed };
}
var wi = { tag: "seroval-plugins/web/CustomEvent", test(e) {
  return typeof CustomEvent > "u" ? false : e instanceof CustomEvent;
}, parse: { sync(e, t) {
  return { type: t.parse(e.type), options: t.parse(he(e)) };
}, async async(e, t) {
  return { type: await t.parse(e.type), options: await t.parse(he(e)) };
}, stream(e, t) {
  return { type: t.parse(e.type), options: t.parse(he(e)) };
} }, serialize(e, t) {
  return "new CustomEvent(" + t.serialize(e.type) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new CustomEvent(t.deserialize(e.type), t.deserialize(e.options));
} }, ke$1 = wi, vi = { tag: "seroval-plugins/web/DOMException", test(e) {
  return typeof DOMException > "u" ? false : e instanceof DOMException;
}, parse: { sync(e, t) {
  return { name: t.parse(e.name), message: t.parse(e.message) };
}, async async(e, t) {
  return { name: await t.parse(e.name), message: await t.parse(e.message) };
}, stream(e, t) {
  return { name: t.parse(e.name), message: t.parse(e.message) };
} }, serialize(e, t) {
  return "new DOMException(" + t.serialize(e.message) + "," + t.serialize(e.name) + ")";
}, deserialize(e, t) {
  return new DOMException(t.deserialize(e.message), t.deserialize(e.name));
} }, Ae$1 = vi;
function me$1(e) {
  return { bubbles: e.bubbles, cancelable: e.cancelable, composed: e.composed };
}
var Si = { tag: "seroval-plugins/web/Event", test(e) {
  return typeof Event > "u" ? false : e instanceof Event;
}, parse: { sync(e, t) {
  return { type: t.parse(e.type), options: t.parse(me$1(e)) };
}, async async(e, t) {
  return { type: await t.parse(e.type), options: await t.parse(me$1(e)) };
}, stream(e, t) {
  return { type: t.parse(e.type), options: t.parse(me$1(e)) };
} }, serialize(e, t) {
  return "new Event(" + t.serialize(e.type) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Event(t.deserialize(e.type), t.deserialize(e.options));
} }, $e$1 = Si, Ri = { tag: "seroval-plugins/web/File", test(e) {
  return typeof File > "u" ? false : e instanceof File;
}, parse: { async async(e, t) {
  return { name: await t.parse(e.name), options: await t.parse({ type: e.type, lastModified: e.lastModified }), buffer: await t.parse(await e.arrayBuffer()) };
} }, serialize(e, t) {
  return "new File([" + t.serialize(e.buffer) + "]," + t.serialize(e.name) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new File([t.deserialize(e.buffer)], t.deserialize(e.name), t.deserialize(e.options));
} }, xi = Ri;
function ge$1(e) {
  let t = [];
  return e.forEach((r, n) => {
    t.push([n, r]);
  }), t;
}
var V = {}, ir = (e, t = new FormData(), r = 0, n = e.length, a) => {
  for (; r < n; r++) a = e[r], t.append(a[0], a[1]);
  return t;
}, Ei = { tag: "seroval-plugins/web/FormDataFactory", test(e) {
  return e === V;
}, parse: { sync() {
}, async async() {
  return await Promise.resolve(void 0);
}, stream() {
} }, serialize() {
  return ir.toString();
}, deserialize() {
  return V;
} }, ki = { tag: "seroval-plugins/web/FormData", extends: [xi, Ei], test(e) {
  return typeof FormData > "u" ? false : e instanceof FormData;
}, parse: { sync(e, t) {
  return { factory: t.parse(V), entries: t.parse(ge$1(e)) };
}, async async(e, t) {
  return { factory: await t.parse(V), entries: await t.parse(ge$1(e)) };
}, stream(e, t) {
  return { factory: t.parse(V), entries: t.parse(ge$1(e)) };
} }, serialize(e, t) {
  return "(" + t.serialize(e.factory) + ")(" + t.serialize(e.entries) + ")";
}, deserialize(e, t) {
  return ir(t.deserialize(e.entries));
} }, Oe$1 = ki;
function be$1(e) {
  let t = [];
  return e.forEach((r, n) => {
    t.push([n, r]);
  }), t;
}
var Ai = { tag: "seroval-plugins/web/Headers", test(e) {
  return typeof Headers > "u" ? false : e instanceof Headers;
}, parse: { sync(e, t) {
  return t.parse(be$1(e));
}, async async(e, t) {
  return await t.parse(be$1(e));
}, stream(e, t) {
  return t.parse(be$1(e));
} }, serialize(e, t) {
  return "new Headers(" + t.serialize(e) + ")";
}, deserialize(e, t) {
  return new Headers(t.deserialize(e));
} }, K = Ai, X = {}, or = (e) => new ReadableStream({ start: (t) => {
  e.on({ next: (r) => {
    try {
      t.enqueue(r);
    } catch {
    }
  }, throw: (r) => {
    t.error(r);
  }, return: () => {
    try {
      t.close();
    } catch {
    }
  } });
} }), $i = { tag: "seroval-plugins/web/ReadableStreamFactory", test(e) {
  return e === X;
}, parse: { sync() {
}, async async() {
  return await Promise.resolve(void 0);
}, stream() {
} }, serialize() {
  return or.toString();
}, deserialize() {
  return X;
} };
function tt$1(e) {
  let t = ee(), r = e.getReader();
  async function n() {
    try {
      let a = await r.read();
      a.done ? t.return(a.value) : (t.next(a.value), await n());
    } catch (a) {
      t.throw(a);
    }
  }
  return n().catch(() => {
  }), t;
}
var Oi = { tag: "seroval/plugins/web/ReadableStream", extends: [$i], test(e) {
  return typeof ReadableStream > "u" ? false : e instanceof ReadableStream;
}, parse: { sync(e, t) {
  return { factory: t.parse(X), stream: t.parse(ee()) };
}, async async(e, t) {
  return { factory: await t.parse(X), stream: await t.parse(tt$1(e)) };
}, stream(e, t) {
  return { factory: t.parse(X), stream: t.parse(tt$1(e)) };
} }, serialize(e, t) {
  return "(" + t.serialize(e.factory) + ")(" + t.serialize(e.stream) + ")";
}, deserialize(e, t) {
  let r = t.deserialize(e.stream);
  return or(r);
} }, Z = Oi;
function rt$1(e, t) {
  return { body: t, cache: e.cache, credentials: e.credentials, headers: e.headers, integrity: e.integrity, keepalive: e.keepalive, method: e.method, mode: e.mode, redirect: e.redirect, referrer: e.referrer, referrerPolicy: e.referrerPolicy };
}
var Ii = { tag: "seroval-plugins/web/Request", extends: [Z, K], test(e) {
  return typeof Request > "u" ? false : e instanceof Request;
}, parse: { async async(e, t) {
  return { url: await t.parse(e.url), options: await t.parse(rt$1(e, e.body && !e.bodyUsed ? await e.clone().arrayBuffer() : null)) };
}, stream(e, t) {
  return { url: t.parse(e.url), options: t.parse(rt$1(e, e.body && !e.bodyUsed ? e.clone().body : null)) };
} }, serialize(e, t) {
  return "new Request(" + t.serialize(e.url) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Request(t.deserialize(e.url), t.deserialize(e.options));
} }, Ie$1 = Ii;
function nt(e) {
  return { headers: e.headers, status: e.status, statusText: e.statusText };
}
var Ci = { tag: "seroval-plugins/web/Response", extends: [Z, K], test(e) {
  return typeof Response > "u" ? false : e instanceof Response;
}, parse: { async async(e, t) {
  return { body: await t.parse(e.body && !e.bodyUsed ? await e.clone().arrayBuffer() : null), options: await t.parse(nt(e)) };
}, stream(e, t) {
  return { body: t.parse(e.body && !e.bodyUsed ? e.clone().body : null), options: t.parse(nt(e)) };
} }, serialize(e, t) {
  return "new Response(" + t.serialize(e.body) + "," + t.serialize(e.options) + ")";
}, deserialize(e, t) {
  return new Response(t.deserialize(e.body), t.deserialize(e.options));
} }, Ce$1 = Ci, Ni = { tag: "seroval-plugins/web/URL", test(e) {
  return typeof URL > "u" ? false : e instanceof URL;
}, parse: { sync(e, t) {
  return t.parse(e.href);
}, async async(e, t) {
  return await t.parse(e.href);
}, stream(e, t) {
  return t.parse(e.href);
} }, serialize(e, t) {
  return "new URL(" + t.serialize(e) + ")";
}, deserialize(e, t) {
  return new URL(t.deserialize(e));
} }, Ne$1 = Ni, _i = { tag: "seroval-plugins/web/URLSearchParams", test(e) {
  return typeof URLSearchParams > "u" ? false : e instanceof URLSearchParams;
}, parse: { sync(e, t) {
  return t.parse(e.toString());
}, async async(e, t) {
  return await t.parse(e.toString());
}, stream(e, t) {
  return t.parse(e.toString());
} }, serialize(e, t) {
  return "new URLSearchParams(" + t.serialize(e) + ")";
}, deserialize(e, t) {
  return new URLSearchParams(t.deserialize(e));
} }, _e$1 = _i;
function zi(e = {}) {
  let t, r = false;
  const n = (o) => {
    if (t && t !== o) throw new Error("Context conflict");
  };
  let a;
  if (e.asyncContext) {
    const o = e.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    o ? a = new o() : console.warn("[unctx] `AsyncLocalStorage` is not provided.");
  }
  const i = () => {
    if (a) {
      const o = a.getStore();
      if (o !== void 0) return o;
    }
    return t;
  };
  return { use: () => {
    const o = i();
    if (o === void 0) throw new Error("Context is not available");
    return o;
  }, tryUse: () => i(), set: (o, u) => {
    u || n(o), t = o, r = true;
  }, unset: () => {
    t = void 0, r = false;
  }, call: (o, u) => {
    n(o), t = o;
    try {
      return a ? a.run(o, u) : u();
    } finally {
      r || (t = void 0);
    }
  }, async callAsync(o, u) {
    t = o;
    const c = () => {
      t = o;
    }, l = () => t === o ? c : void 0;
    it.add(l);
    try {
      const p = a ? a.run(o, u) : u();
      return r || (t = void 0), await p;
    } finally {
      it.delete(l);
    }
  } };
}
function Pi(e = {}) {
  const t = {};
  return { get(r, n = {}) {
    return t[r] || (t[r] = zi({ ...e, ...n })), t[r];
  } };
}
const oe = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof global < "u" ? global : {}, st = "__unctx__", Ti = oe[st] || (oe[st] = Pi()), Li = (e, t = {}) => Ti.get(e, t), at = "__unctx_async_handlers__", it = oe[at] || (oe[at] = /* @__PURE__ */ new Set());
function Mi(e) {
  let t;
  const r = cr(e), n = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(r, { ...n, body: e.node.req.body }) : new Request(r, { ...n, get body() {
    return t || (t = Vi(e), t);
  } });
}
function Di(e) {
  var _a2;
  return (_a2 = e.web) != null ? _a2 : e.web = { request: Mi(e), url: cr(e) }, e.web.request;
}
function ji() {
  return Ki();
}
const ur = Symbol("$HTTPEvent");
function Fi(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[ur]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function w$1(e) {
  return function(...t) {
    var _a2;
    let r = t[0];
    if (Fi(r)) t[0] = r instanceof H3Event || r.__is_event__ ? r : r[ur];
    else {
      if (!((_a2 = globalThis.app.config.server.experimental) == null ? void 0 : _a2.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (r = ji(), !r) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      t.unshift(r);
    }
    return e(...t);
  };
}
const cr = w$1(getRequestURL), Ui = w$1(getRequestIP), ue = w$1(setResponseStatus), ot = w$1(getResponseStatus), Hi = w$1(getResponseStatusText), se = w$1(getResponseHeaders), ut = w$1(getResponseHeader), qi = w$1(setResponseHeader), lr = w$1(appendResponseHeader), Bi = w$1(parseCookies), Gi = w$1(getCookie), Wi = w$1(setCookie), ae = w$1(setHeader), Vi = w$1(getRequestWebStream), Xi = w$1(removeResponseHeader), Yi = w$1(Di);
function Ji() {
  var _a2;
  return Li("nitro-app", { asyncContext: !!((_a2 = globalThis.app.config.server.experimental) == null ? void 0 : _a2.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function Ki() {
  return Ji().use().event;
}
const ye$1 = "Invariant Violation", { setPrototypeOf: Zi = function(e, t) {
  return e.__proto__ = t, e;
} } = Object;
let Ue$1 = class Ue extends Error {
  constructor(t = ye$1) {
    super(typeof t == "number" ? `${ye$1}: ${t} (see https://github.com/apollographql/invariant-packages)` : t);
    __publicField$1(this, "framesToPop", 1);
    __publicField$1(this, "name", ye$1);
    Zi(this, Ue.prototype);
  }
};
function Qi(e, t) {
  if (!e) throw new Ue$1(t);
}
const we$1 = "solidFetchEvent";
function eo(e) {
  return { request: Yi(e), response: so(e), clientAddress: Ui(e), locals: {}, nativeEvent: e };
}
function to(e) {
  return { ...e };
}
function ro(e) {
  if (!e.context[we$1]) {
    const t = eo(e);
    e.context[we$1] = t;
  }
  return e.context[we$1];
}
function ct$1(e, t) {
  for (const [r, n] of t.entries()) lr(e, r, n);
}
class no {
  constructor(t) {
    __publicField$1(this, "event");
    this.event = t;
  }
  get(t) {
    const r = ut(this.event, t);
    return Array.isArray(r) ? r.join(", ") : r || null;
  }
  has(t) {
    return this.get(t) !== null;
  }
  set(t, r) {
    return qi(this.event, t, r);
  }
  delete(t) {
    return Xi(this.event, t);
  }
  append(t, r) {
    lr(this.event, t, r);
  }
  getSetCookie() {
    const t = ut(this.event, "Set-Cookie");
    return Array.isArray(t) ? t : [t];
  }
  forEach(t) {
    return Object.entries(se(this.event)).forEach(([r, n]) => t(Array.isArray(n) ? n.join(", ") : n, r, this));
  }
  entries() {
    return Object.entries(se(this.event)).map(([t, r]) => [t, Array.isArray(r) ? r.join(", ") : r])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(se(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(se(this.event)).map((t) => Array.isArray(t) ? t.join(", ") : t)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}
function so(e) {
  return { get status() {
    return ot(e);
  }, set status(t) {
    ue(e, t);
  }, get statusText() {
    return Hi(e);
  }, set statusText(t) {
    ue(e, ot(e), t);
  }, headers: new no(e) };
}
const H$1 = { NORMAL: 0, WILDCARD: 1, PLACEHOLDER: 2 };
function ao(e = {}) {
  const t = { options: e, rootNode: fr(), staticRoutesMap: {} }, r = (n) => e.strictTrailingSlash ? n : n.replace(/\/$/, "") || "/";
  if (e.routes) for (const n in e.routes) lt$1(t, r(n), e.routes[n]);
  return { ctx: t, lookup: (n) => io(t, r(n)), insert: (n, a) => lt$1(t, r(n), a), remove: (n) => oo(t, r(n)) };
}
function io(e, t) {
  const r = e.staticRoutesMap[t];
  if (r) return r.data;
  const n = t.split("/"), a = {};
  let i = false, o = null, u = e.rootNode, c = null;
  for (let l = 0; l < n.length; l++) {
    const p = n[l];
    u.wildcardChildNode !== null && (o = u.wildcardChildNode, c = n.slice(l).join("/"));
    const d = u.children.get(p);
    if (d === void 0) {
      if (u && u.placeholderChildren.length > 1) {
        const v = n.length - l;
        u = u.placeholderChildren.find((f) => f.maxDepth === v) || null;
      } else u = u.placeholderChildren[0] || null;
      if (!u) break;
      u.paramName && (a[u.paramName] = p), i = true;
    } else u = d;
  }
  return (u === null || u.data === null) && o !== null && (u = o, a[u.paramName || "_"] = c, i = true), u ? i ? { ...u.data, params: i ? a : void 0 } : u.data : null;
}
function lt$1(e, t, r) {
  let n = true;
  const a = t.split("/");
  let i = e.rootNode, o = 0;
  const u = [i];
  for (const c of a) {
    let l;
    if (l = i.children.get(c)) i = l;
    else {
      const p = uo(c);
      l = fr({ type: p, parent: i }), i.children.set(c, l), p === H$1.PLACEHOLDER ? (l.paramName = c === "*" ? `_${o++}` : c.slice(1), i.placeholderChildren.push(l), n = false) : p === H$1.WILDCARD && (i.wildcardChildNode = l, l.paramName = c.slice(3) || "_", n = false), u.push(l), i = l;
    }
  }
  for (const [c, l] of u.entries()) l.maxDepth = Math.max(u.length - c, l.maxDepth || 0);
  return i.data = r, n === true && (e.staticRoutesMap[t] = i), i;
}
function oo(e, t) {
  let r = false;
  const n = t.split("/");
  let a = e.rootNode;
  for (const i of n) if (a = a.children.get(i), !a) return r;
  if (a.data) {
    const i = n.at(-1) || "";
    a.data = null, Object.keys(a.children).length === 0 && a.parent && (a.parent.children.delete(i), a.parent.wildcardChildNode = null, a.parent.placeholderChildren = []), r = true;
  }
  return r;
}
function fr(e = {}) {
  return { type: e.type || H$1.NORMAL, maxDepth: 0, parent: e.parent || null, children: /* @__PURE__ */ new Map(), data: e.data || null, paramName: e.paramName || null, wildcardChildNode: null, placeholderChildren: [] };
}
function uo(e) {
  return e.startsWith("**") ? H$1.WILDCARD : e[0] === ":" || e === "*" ? H$1.PLACEHOLDER : H$1.NORMAL;
}
const pr = [{ page: true, $component: { src: "src/routes/auth/login.tsx?pick=default&pick=$css", build: () => import('../build/login.mjs'), import: () => import('../build/login.mjs') }, path: "/auth/login", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/auth/login.tsx" }, { page: true, $component: { src: "src/routes/cms/media/index.tsx?pick=default&pick=$css", build: () => import('../build/index.mjs'), import: () => import('../build/index.mjs') }, path: "/cms/media/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/cms/media/index.tsx" }, { page: true, $component: { src: "src/routes/cms/pages/index.tsx?pick=default&pick=$css", build: () => import('../build/index2.mjs'), import: () => import('../build/index2.mjs') }, path: "/cms/pages/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/cms/pages/index.tsx" }, { page: true, $component: { src: "src/routes/cms/pages/[id].tsx?pick=default&pick=$css", build: () => import('../build/_id_.mjs'), import: () => import('../build/_id_.mjs') }, path: "/cms/pages/:id", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/cms/pages/[id].tsx" }, { page: true, $component: { src: "src/routes/cms/pricing/index.tsx?pick=default&pick=$css", build: () => import('../build/index3.mjs'), import: () => import('../build/index3.mjs') }, path: "/cms/pricing/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/cms/pricing/index.tsx" }, { page: true, $component: { src: "src/routes/cms/services/index.tsx?pick=default&pick=$css", build: () => import('../build/index4.mjs'), import: () => import('../build/index4.mjs') }, path: "/cms/services/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/cms/services/index.tsx" }, { page: true, $component: { src: "src/routes/cms/settings/index.tsx?pick=default&pick=$css", build: () => import('../build/index5.mjs'), import: () => import('../build/index5.mjs') }, path: "/cms/settings/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/cms/settings/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard/client/index.tsx?pick=default&pick=$css", build: () => import('../build/index6.mjs'), import: () => import('../build/index6.mjs') }, path: "/dashboard/client/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/dashboard/client/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard/franchise/index.tsx?pick=default&pick=$css", build: () => import('../build/index7.mjs'), import: () => import('../build/index7.mjs') }, path: "/dashboard/franchise/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/dashboard/franchise/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard/management/index.tsx?pick=default&pick=$css", build: () => import('../build/index8.mjs'), import: () => import('../build/index8.mjs') }, path: "/dashboard/management/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/dashboard/management/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard/owner/index.tsx?pick=default&pick=$css", build: () => import('../build/index9.mjs'), import: () => import('../build/index9.mjs') }, path: "/dashboard/owner/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/dashboard/owner/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard/partner/index.tsx?pick=default&pick=$css", build: () => import('../build/index10.mjs'), import: () => import('../build/index10.mjs') }, path: "/dashboard/partner/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/dashboard/partner/index.tsx" }, { page: true, $component: { src: "src/routes/index.tsx?pick=default&pick=$css", build: () => import('../build/index11.mjs'), import: () => import('../build/index11.mjs') }, path: "/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/index.tsx" }], co = lo(pr.filter((e) => e.page));
function lo(e) {
  function t(r, n, a, i) {
    const o = Object.values(r).find((u) => a.startsWith(u.id + "/"));
    return o ? (t(o.children || (o.children = []), n, a.slice(o.id.length)), r) : (r.push({ ...n, id: a, path: a.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), r);
  }
  return e.sort((r, n) => r.path.length - n.path.length).reduce((r, n) => t(r, n, n.path, n.path), []);
}
function fo(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
ao({ routes: pr.reduce((e, t) => {
  if (!fo(t)) return e;
  let r = t.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (n, a) => `**:${a}`).split("/").map((n) => n.startsWith(":") || n.startsWith("*") ? n : encodeURIComponent(n)).join("/");
  if (/:[^/]*\?/g.test(r)) throw new Error(`Optional parameters are not supported in API routes: ${r}`);
  if (e[r]) throw new Error(`Duplicate API routes for "${r}" found at "${e[r].route.path}" and "${t.path}"`);
  return e[r] = { route: t }, e;
}, {}) });
var ho = " ";
const mo = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(ho), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function go(e, t) {
  let { tag: r, attrs: { key: n, ...a } = { key: void 0 }, children: i } = e;
  return mo[r]({ attrs: { ...a, nonce: t }, key: n, children: i });
}
function bo(e, t, r, n = "default") {
  return lazy(async () => {
    var _a2;
    {
      const i = (await e.import())[n], u = (await ((_a2 = t.inputs) == null ? void 0 : _a2[e.src].assets())).filter((l) => l.tag === "style" || l.attrs.rel === "stylesheet");
      return { default: (l) => [...u.map((p) => go(p)), createComponent(i, l)] };
    }
  });
}
function yo() {
  function e(r) {
    return { ...r, ...r.$$route ? r.$$route.require().route : void 0, info: { ...r.$$route ? r.$$route.require().route.info : {}, filesystem: true }, component: r.$component && bo(r.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: r.children ? r.children.map(e) : void 0 };
  }
  return co.map(e);
}
function wo(e) {
  const t = Gi(e.nativeEvent, "flash");
  if (t) try {
    let r = JSON.parse(t);
    if (!r || !r.result) return;
    const n = [...r.input.slice(0, -1), new Map(r.input[r.input.length - 1])], a = r.error ? new Error(r.result) : r.result;
    return { input: n, url: r.url, pending: false, result: r.thrown ? void 0 : a, error: r.thrown ? a : void 0 };
  } catch (r) {
    console.error(r);
  } finally {
    Wi(e.nativeEvent, "flash", "", { maxAge: 0 });
  }
}
async function vo(e) {
  const t = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, e.response.headers.set("Content-Type", "text/html"), Object.assign(e, { manifest: await t.json(), assets: [...await t.inputs[t.handler].assets()], router: { submission: wo(e) }, routes: yo(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const So = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function Ro(e) {
  return e.status && So.has(e.status) ? e.status : 302;
}
const xo = {};
function Eo(e) {
  const t = new TextEncoder().encode(e), r = t.length, n = r.toString(16), a = "00000000".substring(0, 8 - n.length) + n, i = new TextEncoder().encode(`;0x${a};`), o = new Uint8Array(12 + r);
  return o.set(i), o.set(t, 12), o;
}
function ft(e, t) {
  return new ReadableStream({ start(r) {
    yi(t, { scopeId: e, plugins: [ke$1, Ae$1, $e$1, Oe$1, K, Z, Ie$1, Ce$1, _e$1, Ne$1], onSerialize(n, a) {
      r.enqueue(Eo(a ? `(${en(e)},${n})` : n));
    }, onDone() {
      r.close();
    }, onError(n) {
      r.error(n);
    } });
  } });
}
async function ko(e) {
  const t = ro(e), r = t.request, n = r.headers.get("X-Server-Id"), a = r.headers.get("X-Server-Instance"), i = r.headers.has("X-Single-Flight"), o = new URL(r.url);
  let u, c;
  if (n) Qi(typeof n == "string", "Invalid server function"), [u, c] = n.split("#");
  else if (u = o.searchParams.get("id"), c = o.searchParams.get("name"), !u || !c) return new Response(null, { status: 404 });
  const l = xo[u];
  let p;
  if (!l) return new Response(null, { status: 404 });
  p = await l.importer();
  const d = p[l.functionName];
  let v = [];
  if (!a || e.method === "GET") {
    const f = o.searchParams.get("args");
    if (f) {
      const R = JSON.parse(f);
      (R.t ? et$1(R, { plugins: [ke$1, Ae$1, $e$1, Oe$1, K, Z, Ie$1, Ce$1, _e$1, Ne$1] }) : R).forEach((te) => v.push(te));
    }
  }
  if (e.method === "POST") {
    const f = r.headers.get("content-type"), R = e.node.req, te = R instanceof ReadableStream, dr = R.body instanceof ReadableStream, He = te && R.locked || dr && R.body.locked, qe = te ? R : R.body;
    if ((f == null ? void 0 : f.startsWith("multipart/form-data")) || (f == null ? void 0 : f.startsWith("application/x-www-form-urlencoded"))) v.push(await (He ? r : new Request(r, { ...r, body: qe })).formData());
    else if (f == null ? void 0 : f.startsWith("application/json")) {
      const hr = He ? r : new Request(r, { ...r, body: qe });
      v = et$1(await hr.json(), { plugins: [ke$1, Ae$1, $e$1, Oe$1, K, Z, Ie$1, Ce$1, _e$1, Ne$1] });
    }
  }
  try {
    let f = await provideRequestEvent(t, async () => (sharedConfig.context = { event: t }, t.locals.serverFunctionMeta = { id: u + "#" + c }, d(...v)));
    if (i && a && (f = await dt(t, f)), f instanceof Response) {
      if (f.headers && f.headers.has("X-Content-Raw")) return f;
      a && (f.headers && ct$1(e, f.headers), f.status && (f.status < 300 || f.status >= 400) && ue(e, f.status), f.customBody ? f = await f.customBody() : f.body == null && (f = null));
    }
    return a ? (ae(e, "content-type", "text/javascript"), ft(a, f)) : pt(f, r, v);
  } catch (f) {
    if (f instanceof Response) i && a && (f = await dt(t, f)), f.headers && ct$1(e, f.headers), f.status && (!a || f.status < 300 || f.status >= 400) && ue(e, f.status), f.customBody ? f = f.customBody() : f.body == null && (f = null), ae(e, "X-Error", "true");
    else if (a) {
      const R = f instanceof Error ? f.message : typeof f == "string" ? f : "true";
      ae(e, "X-Error", R.replace(/[\r\n]+/g, ""));
    } else f = pt(f, r, v, true);
    return a ? (ae(e, "content-type", "text/javascript"), ft(a, f)) : f;
  }
}
function pt(e, t, r, n) {
  const a = new URL(t.url), i = e instanceof Error;
  let o = 302, u;
  return e instanceof Response ? (u = new Headers(e.headers), e.headers.has("Location") && (u.set("Location", new URL(e.headers.get("Location"), a.origin + "").toString()), o = Ro(e))) : u = new Headers({ Location: new URL(t.headers.get("referer")).toString() }), e && u.append("Set-Cookie", `flash=${encodeURIComponent(JSON.stringify({ url: a.pathname + a.search, result: i ? e.message : e, thrown: n, error: i, input: [...r.slice(0, -1), [...r[r.length - 1].entries()]] }))}; Secure; HttpOnly;`), new Response(null, { status: o, headers: u });
}
let ve$1;
function Ao(e) {
  var _a2;
  const t = new Headers(e.request.headers), r = Bi(e.nativeEvent), n = e.response.headers.getSetCookie();
  t.delete("cookie");
  let a = false;
  return ((_a2 = e.nativeEvent.node) == null ? void 0 : _a2.req) && (a = true, e.nativeEvent.node.req.headers.cookie = ""), n.forEach((i) => {
    if (!i) return;
    const { maxAge: o, expires: u, name: c, value: l } = Dr(i);
    if (o != null && o <= 0) {
      delete r[c];
      return;
    }
    if (u != null && u.getTime() <= Date.now()) {
      delete r[c];
      return;
    }
    r[c] = l;
  }), Object.entries(r).forEach(([i, o]) => {
    t.append("cookie", `${i}=${o}`), a && (e.nativeEvent.node.req.headers.cookie += `${i}=${o};`);
  }), t;
}
async function dt(e, t) {
  let r, n = new URL(e.request.headers.get("referer")).toString();
  t instanceof Response && (t.headers.has("X-Revalidate") && (r = t.headers.get("X-Revalidate").split(",")), t.headers.has("Location") && (n = new URL(t.headers.get("Location"), new URL(e.request.url).origin + "").toString()));
  const a = to(e);
  return a.request = new Request(n, { headers: Ao(e) }), await provideRequestEvent(a, async () => {
    await vo(a), ve$1 || (ve$1 = (await import('../build/app-D7wd_jxA.mjs')).default), a.router.dataOnly = r || true, a.router.previousUrl = e.request.headers.get("referer");
    try {
      renderToString(() => {
        sharedConfig.context.event = a, ve$1();
      });
    } catch (u) {
      console.log(u);
    }
    const i = a.router.data;
    if (!i) return t;
    let o = false;
    for (const u in i) i[u] === void 0 ? delete i[u] : o = true;
    return o && (t instanceof Response ? t.customBody && (i._$value = t.customBody()) : (i._$value = t, t = new Response(null, { status: 200 })), t.customBody = () => i, t.headers.set("X-Single-Flight", "true")), t;
  });
}
const To = eventHandler(ko);

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
function fe(e = {}) {
  let r, t = false;
  const s = (i) => {
    if (r && r !== i) throw new Error("Context conflict");
  };
  let o;
  if (e.asyncContext) {
    const i = e.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    i ? o = new i() : console.warn("[unctx] `AsyncLocalStorage` is not provided.");
  }
  const a = () => {
    if (o) {
      const i = o.getStore();
      if (i !== void 0) return i;
    }
    return r;
  };
  return { use: () => {
    const i = a();
    if (i === void 0) throw new Error("Context is not available");
    return i;
  }, tryUse: () => a(), set: (i, n) => {
    n || s(i), r = i, t = true;
  }, unset: () => {
    r = void 0, t = false;
  }, call: (i, n) => {
    s(i), r = i;
    try {
      return o ? o.run(i, n) : n();
    } finally {
      t || (r = void 0);
    }
  }, async callAsync(i, n) {
    r = i;
    const l = () => {
      r = i;
    }, c = () => r === i ? l : void 0;
    v.add(c);
    try {
      const d = o ? o.run(i, n) : n();
      return t || (r = void 0), await d;
    } finally {
      v.delete(c);
    }
  } };
}
function me(e = {}) {
  const r = {};
  return { get(t, s = {}) {
    return r[t] || (r[t] = fe({ ...e, ...s })), r[t];
  } };
}
const y = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof global < "u" ? global : {}, N = "__unctx__", ge = y[N] || (y[N] = me()), be = (e, r = {}) => ge.get(e, r), O = "__unctx_async_handlers__", v = y[O] || (y[O] = /* @__PURE__ */ new Set());
function ye(e) {
  let r;
  const t = q(e), s = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(t, { ...s, body: e.node.req.body }) : new Request(t, { ...s, get body() {
    return r || (r = Ee(e), r);
  } });
}
function xe(e) {
  var _a;
  return (_a = e.web) != null ? _a : e.web = { request: ye(e), url: q(e) }, e.web.request;
}
function Re() {
  return Me();
}
const L = Symbol("$HTTPEvent");
function $e(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[L]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function u(e) {
  return function(...r) {
    var _a;
    let t = r[0];
    if ($e(t)) r[0] = t instanceof H3Event || t.__is_event__ ? t : t[L];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (t = Re(), !t) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      r.unshift(t);
    }
    return e(...r);
  };
}
const q = u(getRequestURL), Ce = u(getRequestIP), w = u(setResponseStatus), E = u(getResponseStatus), we = u(getResponseStatusText), b = u(getResponseHeaders), T$1 = u(getResponseHeader), Se = u(setResponseHeader), Ae = u(appendResponseHeader), k = u(sendRedirect), Ne = u(getCookie), Oe = u(setCookie), ve = u(setHeader), Ee = u(getRequestWebStream), Te = u(removeResponseHeader), ke = u(xe);
function Ie() {
  var _a;
  return be("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function Me() {
  return Ie().use().event;
}
const f = { NORMAL: 0, WILDCARD: 1, PLACEHOLDER: 2 };
function Pe(e = {}) {
  const r = { options: e, rootNode: _(), staticRoutesMap: {} }, t = (s) => e.strictTrailingSlash ? s : s.replace(/\/$/, "") || "/";
  if (e.routes) for (const s in e.routes) I(r, t(s), e.routes[s]);
  return { ctx: r, lookup: (s) => He(r, t(s)), insert: (s, o) => I(r, t(s), o), remove: (s) => De(r, t(s)) };
}
function He(e, r) {
  const t = e.staticRoutesMap[r];
  if (t) return t.data;
  const s = r.split("/"), o = {};
  let a = false, i = null, n = e.rootNode, l = null;
  for (let c = 0; c < s.length; c++) {
    const d = s[c];
    n.wildcardChildNode !== null && (i = n.wildcardChildNode, l = s.slice(c).join("/"));
    const m = n.children.get(d);
    if (m === void 0) {
      if (n && n.placeholderChildren.length > 1) {
        const x = s.length - c;
        n = n.placeholderChildren.find((p) => p.maxDepth === x) || null;
      } else n = n.placeholderChildren[0] || null;
      if (!n) break;
      n.paramName && (o[n.paramName] = d), a = true;
    } else n = m;
  }
  return (n === null || n.data === null) && i !== null && (n = i, o[n.paramName || "_"] = l, a = true), n ? a ? { ...n.data, params: a ? o : void 0 } : n.data : null;
}
function I(e, r, t) {
  let s = true;
  const o = r.split("/");
  let a = e.rootNode, i = 0;
  const n = [a];
  for (const l of o) {
    let c;
    if (c = a.children.get(l)) a = c;
    else {
      const d = Le(l);
      c = _({ type: d, parent: a }), a.children.set(l, c), d === f.PLACEHOLDER ? (c.paramName = l === "*" ? `_${i++}` : l.slice(1), a.placeholderChildren.push(c), s = false) : d === f.WILDCARD && (a.wildcardChildNode = c, c.paramName = l.slice(3) || "_", s = false), n.push(c), a = c;
    }
  }
  for (const [l, c] of n.entries()) c.maxDepth = Math.max(n.length - l, c.maxDepth || 0);
  return a.data = t, s === true && (e.staticRoutesMap[r] = a), a;
}
function De(e, r) {
  let t = false;
  const s = r.split("/");
  let o = e.rootNode;
  for (const a of s) if (o = o.children.get(a), !o) return t;
  if (o.data) {
    const a = s.at(-1) || "";
    o.data = null, Object.keys(o.children).length === 0 && o.parent && (o.parent.children.delete(a), o.parent.wildcardChildNode = null, o.parent.placeholderChildren = []), t = true;
  }
  return t;
}
function _(e = {}) {
  return { type: e.type || f.NORMAL, maxDepth: 0, parent: e.parent || null, children: /* @__PURE__ */ new Map(), data: e.data || null, paramName: e.paramName || null, wildcardChildNode: null, placeholderChildren: [] };
}
function Le(e) {
  return e.startsWith("**") ? f.WILDCARD : e[0] === ":" || e === "*" ? f.PLACEHOLDER : f.NORMAL;
}
const G = [{ page: true, $component: { src: "src/routes/auth/login.tsx?pick=default&pick=$css", build: () => import('../build/login2.mjs'), import: () => import('../build/login2.mjs') }, path: "/auth/login", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/auth/login.tsx" }, { page: true, $component: { src: "src/routes/cms/media/index.tsx?pick=default&pick=$css", build: () => import('../build/index12.mjs'), import: () => import('../build/index12.mjs') }, path: "/cms/media/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/cms/media/index.tsx" }, { page: true, $component: { src: "src/routes/cms/pages/index.tsx?pick=default&pick=$css", build: () => import('../build/index22.mjs'), import: () => import('../build/index22.mjs') }, path: "/cms/pages/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/cms/pages/index.tsx" }, { page: true, $component: { src: "src/routes/cms/pages/[id].tsx?pick=default&pick=$css", build: () => import('../build/_id_2.mjs'), import: () => import('../build/_id_2.mjs') }, path: "/cms/pages/:id", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/cms/pages/[id].tsx" }, { page: true, $component: { src: "src/routes/cms/pricing/index.tsx?pick=default&pick=$css", build: () => import('../build/index32.mjs'), import: () => import('../build/index32.mjs') }, path: "/cms/pricing/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/cms/pricing/index.tsx" }, { page: true, $component: { src: "src/routes/cms/services/index.tsx?pick=default&pick=$css", build: () => import('../build/index42.mjs'), import: () => import('../build/index42.mjs') }, path: "/cms/services/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/cms/services/index.tsx" }, { page: true, $component: { src: "src/routes/cms/settings/index.tsx?pick=default&pick=$css", build: () => import('../build/index52.mjs'), import: () => import('../build/index52.mjs') }, path: "/cms/settings/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/cms/settings/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard/client/index.tsx?pick=default&pick=$css", build: () => import('../build/index62.mjs'), import: () => import('../build/index62.mjs') }, path: "/dashboard/client/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/dashboard/client/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard/franchise/index.tsx?pick=default&pick=$css", build: () => import('../build/index72.mjs'), import: () => import('../build/index72.mjs') }, path: "/dashboard/franchise/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/dashboard/franchise/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard/management/index.tsx?pick=default&pick=$css", build: () => import('../build/index82.mjs'), import: () => import('../build/index82.mjs') }, path: "/dashboard/management/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/dashboard/management/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard/owner/index.tsx?pick=default&pick=$css", build: () => import('../build/index92.mjs'), import: () => import('../build/index92.mjs') }, path: "/dashboard/owner/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/dashboard/owner/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard/partner/index.tsx?pick=default&pick=$css", build: () => import('../build/index102.mjs'), import: () => import('../build/index102.mjs') }, path: "/dashboard/partner/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/dashboard/partner/index.tsx" }, { page: true, $component: { src: "src/routes/index.tsx?pick=default&pick=$css", build: () => import('../build/index112.mjs'), import: () => import('../build/index112.mjs') }, path: "/", filePath: "D:/code/site/Mehaal.tech-AI-COMING-SOON/apps/web/src/routes/index.tsx" }], qe = _e(G.filter((e) => e.page));
function _e(e) {
  function r(t, s, o, a) {
    const i = Object.values(t).find((n) => o.startsWith(n.id + "/"));
    return i ? (r(i.children || (i.children = []), s, o.slice(i.id.length)), t) : (t.push({ ...s, id: o, path: o.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), t);
  }
  return e.sort((t, s) => t.path.length - s.path.length).reduce((t, s) => r(t, s, s.path, s.path), []);
}
function Ge(e, r) {
  const t = Fe.lookup(e);
  if (t && t.route) {
    const s = t.route, o = r === "HEAD" ? s.$HEAD || s.$GET : s[`$${r}`];
    if (o === void 0) return;
    const a = s.page === true && s.$component !== void 0;
    return { handler: o, params: t.params, isPage: a };
  }
}
function We(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
const Fe = Pe({ routes: G.reduce((e, r) => {
  if (!We(r)) return e;
  let t = r.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (s, o) => `**:${o}`).split("/").map((s) => s.startsWith(":") || s.startsWith("*") ? s : encodeURIComponent(s)).join("/");
  if (/:[^/]*\?/g.test(t)) throw new Error(`Optional parameters are not supported in API routes: ${t}`);
  if (e[t]) throw new Error(`Duplicate API routes for "${t}" found at "${e[t].route.path}" and "${r.path}"`);
  return e[t] = { route: r }, e;
}, {}) }), $ = "solidFetchEvent";
function je(e) {
  return { request: ke(e), response: Be(e), clientAddress: Ce(e), locals: {}, nativeEvent: e };
}
function Ue(e) {
  if (!e.context[$]) {
    const r = je(e);
    e.context[$] = r;
  }
  return e.context[$];
}
class ze {
  constructor(r) {
    __publicField(this, "event");
    this.event = r;
  }
  get(r) {
    const t = T$1(this.event, r);
    return Array.isArray(t) ? t.join(", ") : t || null;
  }
  has(r) {
    return this.get(r) !== null;
  }
  set(r, t) {
    return Se(this.event, r, t);
  }
  delete(r) {
    return Te(this.event, r);
  }
  append(r, t) {
    Ae(this.event, r, t);
  }
  getSetCookie() {
    const r = T$1(this.event, "Set-Cookie");
    return Array.isArray(r) ? r : [r];
  }
  forEach(r) {
    return Object.entries(b(this.event)).forEach(([t, s]) => r(Array.isArray(s) ? s.join(", ") : s, t, this));
  }
  entries() {
    return Object.entries(b(this.event)).map(([r, t]) => [r, Array.isArray(t) ? t.join(", ") : t])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(b(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(b(this.event)).map((r) => Array.isArray(r) ? r.join(", ") : r)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}
function Be(e) {
  return { get status() {
    return E(e);
  }, set status(r) {
    w(e, r);
  }, get statusText() {
    return we(e);
  }, set statusText(r) {
    w(e, E(e), r);
  }, headers: new ze(e) };
}
var Ye = " ";
const Je = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(Ye), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function Qe(e, r) {
  let { tag: t, attrs: { key: s, ...o } = { key: void 0 }, children: a } = e;
  return Je[t]({ attrs: { ...o, nonce: r }, key: s, children: a });
}
function Ve(e, r, t, s = "default") {
  return lazy(async () => {
    var _a;
    {
      const a = (await e.import())[s], n = (await ((_a = r.inputs) == null ? void 0 : _a[e.src].assets())).filter((c) => c.tag === "style" || c.attrs.rel === "stylesheet");
      return { default: (c) => [...n.map((d) => Qe(d)), createComponent(a, c)] };
    }
  });
}
function W() {
  function e(t) {
    return { ...t, ...t.$$route ? t.$$route.require().route : void 0, info: { ...t.$$route ? t.$$route.require().route.info : {}, filesystem: true }, component: t.$component && Ve(t.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: t.children ? t.children.map(e) : void 0 };
  }
  return qe.map(e);
}
let M;
const ct = isServer ? () => getRequestEvent().routes : () => M || (M = W());
function Xe(e) {
  const r = Ne(e.nativeEvent, "flash");
  if (r) try {
    let t = JSON.parse(r);
    if (!t || !t.result) return;
    const s = [...t.input.slice(0, -1), new Map(t.input[t.input.length - 1])], o = t.error ? new Error(t.result) : t.result;
    return { input: s, url: t.url, pending: false, result: t.thrown ? void 0 : o, error: t.thrown ? o : void 0 };
  } catch (t) {
    console.error(t);
  } finally {
    Oe(e.nativeEvent, "flash", "", { maxAge: 0 });
  }
}
async function Ze(e) {
  const r = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, e.response.headers.set("Content-Type", "text/html"), Object.assign(e, { manifest: await r.json(), assets: [...await r.inputs[r.handler].assets()], router: { submission: Xe(e) }, routes: W(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const et = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function S(e) {
  return e.status && et.has(e.status) ? e.status : 302;
}
function tt(e, r, t = {}, s) {
  return eventHandler({ handler: (o) => {
    const a = Ue(o);
    return provideRequestEvent(a, async () => {
      const i = Ge(new URL(a.request.url).pathname, a.request.method);
      if (i) {
        const p = await i.handler.import(), h = a.request.method === "HEAD" ? p.HEAD || p.GET : p[a.request.method];
        a.params = i.params || {}, sharedConfig.context = { event: a };
        const A = await h(a);
        if (A !== void 0) return A;
        if (a.request.method !== "GET") throw new Error(`API handler for ${a.request.method} "${a.request.url}" did not return a response.`);
        if (!i.isPage) return;
      }
      const n = await r(a), l = typeof t == "function" ? await t(n) : { ...t }, c = l.mode || "stream";
      if (l.nonce && (n.nonce = l.nonce), c === "sync") {
        const p = renderToString(() => (sharedConfig.context.event = n, e(n)), l);
        if (n.complete = true, n.response && n.response.headers.get("Location")) {
          const h = S(n.response);
          return k(o, n.response.headers.get("Location"), h);
        }
        return p;
      }
      if (l.onCompleteAll) {
        const p = l.onCompleteAll;
        l.onCompleteAll = (h) => {
          H(n)(h), p(h);
        };
      } else l.onCompleteAll = H(n);
      if (l.onCompleteShell) {
        const p = l.onCompleteShell;
        l.onCompleteShell = (h) => {
          P(n, o)(), p(h);
        };
      } else l.onCompleteShell = P(n, o);
      const d = renderToStream(() => (sharedConfig.context.event = n, e(n)), l);
      if (n.response && n.response.headers.get("Location")) {
        const p = S(n.response);
        return k(o, n.response.headers.get("Location"), p);
      }
      if (c === "async") return d;
      const { writable: m, readable: x } = new TransformStream();
      return d.pipeTo(m), x;
    });
  } });
}
function P(e, r) {
  return () => {
    if (e.response && e.response.headers.get("Location")) {
      const t = S(e.response);
      w(r, t), ve(r, "Location", e.response.headers.get("Location"));
    }
  };
}
function H(e) {
  return ({ write: r }) => {
    e.complete = true;
    const t = e.response && e.response.headers.get("Location");
    t && r(`<script>window.location="${t}"<\/script>`);
  };
}
function rt(e, r, t) {
  return tt(e, Ze, r);
}
ssr("<!DOCTYPE html>");
const lt = rt(() => import('../build/root-p0kWiATY.mjs'));

const handlers = [
  { route: '/_server', handler: To, lazy: false, middleware: true, method: undefined },
  { route: '/', handler: lt, lazy: false, middleware: true, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b$2(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C$1(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  {
    const _handler = h3App.handler;
    h3App.handler = (event) => {
      const ctx = { event };
      return nitroAsyncContext.callAsync(ctx, () => _handler(event));
    };
  }
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp = createNitroApp();
function useNitroApp() {
  return nitroApp;
}
runNitroPlugins(nitroApp);

export { ct as c, parseQuery as p, toNodeListener as t, useNitroApp as u };
//# sourceMappingURL=nitro.mjs.map
