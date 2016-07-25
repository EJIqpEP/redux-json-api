'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.apiRequest = exports.noop = exports.jsonContentTypes = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jsonContentTypes = exports.jsonContentTypes = ['application/json', 'application/vnd.api+json'];

var noop = exports.noop = function noop() {};

var apiRequest = exports.apiRequest = function apiRequest(url, accessToken) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var allOptions = (0, _extends3.default)({
    credentials: 'same-origin',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json'
    }
  }, options);

  return fetch(url, allOptions).then(function (res) {
    if (res.status >= 200 && res.status < 300) {
      if (jsonContentTypes.some(function (contentType) {
        return res.headers.get('Content-Type').indexOf(contentType) > -1;
      })) {
        return res.json();
      }

      return res;
    }

    var e = new Error(res.statusText);
    e.response = res;
    throw e;
  });
};