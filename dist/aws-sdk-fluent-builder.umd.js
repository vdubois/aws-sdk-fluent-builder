(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('util'), require('fs'), require('crypto'), require('buffer'), require('domain'), require('stream'), require('url'), require('querystring'), require('string_decoder'), require('events'), require('timers'), require('https'), require('http'), require('path'), require('os')) :
	typeof define === 'function' && define.amd ? define(['exports', 'util', 'fs', 'crypto', 'buffer', 'domain', 'stream', 'url', 'querystring', 'string_decoder', 'events', 'timers', 'https', 'http', 'path', 'os'], factory) :
	(factory((global['aws-sdk-fluent-builder'] = {}),global.util,global.fs,global.crypto,global.buffer,global.domain,global.stream,global.url,global.querystring,global.string_decoder,global.events,global.timers,global.https,global.http,global.path,global.os));
}(this, (function (exports,util,fs,crypto,buffer,domain,stream,url,querystring,string_decoder,events,timers,https,http,path,os) { 'use strict';

util = util && util.hasOwnProperty('default') ? util['default'] : util;
var fs__default = fs['default'];
crypto = crypto && crypto.hasOwnProperty('default') ? crypto['default'] : crypto;
buffer = buffer && buffer.hasOwnProperty('default') ? buffer['default'] : buffer;
domain = domain && domain.hasOwnProperty('default') ? domain['default'] : domain;
stream = stream && stream.hasOwnProperty('default') ? stream['default'] : stream;
url = url && url.hasOwnProperty('default') ? url['default'] : url;
querystring = querystring && querystring.hasOwnProperty('default') ? querystring['default'] : querystring;
string_decoder = string_decoder && string_decoder.hasOwnProperty('default') ? string_decoder['default'] : string_decoder;
events = events && events.hasOwnProperty('default') ? events['default'] : events;
timers = timers && timers.hasOwnProperty('default') ? timers['default'] : timers;
https = https && https.hasOwnProperty('default') ? https['default'] : https;
http = http && http.hasOwnProperty('default') ? http['default'] : http;
var path__default = path['default'];
os = os && os.hasOwnProperty('default') ? os['default'] : os;

function JsonBuilder() { }

JsonBuilder.prototype.build = function(value, shape) {
  return JSON.stringify(translate(value, shape));
};

function translate(value, shape) {
  if (!shape || value === undefined || value === null) return undefined;

  switch (shape.type) {
    case 'structure': return translateStructure(value, shape);
    case 'map': return translateMap(value, shape);
    case 'list': return translateList(value, shape);
    default: return translateScalar(value, shape);
  }
}

function translateStructure(structure, shape) {
  var struct = {};
  util_1.each(structure, function(name, value) {
    var memberShape = shape.members[name];
    if (memberShape) {
      if (memberShape.location !== 'body') return;
      var locationName = memberShape.isLocationName ? memberShape.name : name;
      var result = translate(value, memberShape);
      if (result !== undefined) struct[locationName] = result;
    }
  });
  return struct;
}

function translateList(list, shape) {
  var out = [];
  util_1.arrayEach(list, function(value) {
    var result = translate(value, shape.member);
    if (result !== undefined) out.push(result);
  });
  return out;
}

function translateMap(map, shape) {
  var out = {};
  util_1.each(map, function(key, value) {
    var result = translate(value, shape.value);
    if (result !== undefined) out[key] = result;
  });
  return out;
}

function translateScalar(value, shape) {
  return shape.toWireFormat(value);
}

var builder = JsonBuilder;

function JsonParser() { }

JsonParser.prototype.parse = function(value, shape) {
  return translate$1(JSON.parse(value), shape);
};

function translate$1(value, shape) {
  if (!shape || value === undefined) return undefined;

  switch (shape.type) {
    case 'structure': return translateStructure$1(value, shape);
    case 'map': return translateMap$1(value, shape);
    case 'list': return translateList$1(value, shape);
    default: return translateScalar$1(value, shape);
  }
}

function translateStructure$1(structure, shape) {
  if (structure == null) return undefined;

  var struct = {};
  var shapeMembers = shape.members;
  util_1.each(shapeMembers, function(name, memberShape) {
    var locationName = memberShape.isLocationName ? memberShape.name : name;
    if (Object.prototype.hasOwnProperty.call(structure, locationName)) {
      var value = structure[locationName];
      var result = translate$1(value, memberShape);
      if (result !== undefined) struct[name] = result;
    }
  });
  return struct;
}

function translateList$1(list, shape) {
  if (list == null) return undefined;

  var out = [];
  util_1.arrayEach(list, function(value) {
    var result = translate$1(value, shape.member);
    if (result === undefined) out.push(null);
    else out.push(result);
  });
  return out;
}

function translateMap$1(map, shape) {
  if (map == null) return undefined;

  var out = {};
  util_1.each(map, function(key, value) {
    var result = translate$1(value, shape.value);
    if (result === undefined) out[key] = null;
    else out[key] = result;
  });
  return out;
}

function translateScalar$1(value, shape) {
  return shape.toType(value);
}

var parser = JsonParser;

function buildRequest(req) {
  var httpRequest = req.httpRequest;
  var api = req.service.api;
  var target = api.targetPrefix + '.' + api.operations[req.operation].name;
  var version = api.jsonVersion || '1.0';
  var input = api.operations[req.operation].input;
  var builder$$1 = new builder();

  if (version === 1) version = '1.0';
  httpRequest.body = builder$$1.build(req.params || {}, input);
  httpRequest.headers['Content-Type'] = 'application/x-amz-json-' + version;
  httpRequest.headers['X-Amz-Target'] = target;
}

function extractError(resp) {
  var error = {};
  var httpResponse = resp.httpResponse;

  error.code = httpResponse.headers['x-amzn-errortype'] || 'UnknownError';
  if (typeof error.code === 'string') {
    error.code = error.code.split(':')[0];
  }

  if (httpResponse.body.length > 0) {
    try {
      var e = JSON.parse(httpResponse.body.toString());
      if (e.__type || e.code) {
        error.code = (e.__type || e.code).split('#').pop();
      }
      if (error.code === 'RequestEntityTooLarge') {
        error.message = 'Request body must be less than 1 MB';
      } else {
        error.message = (e.message || e.Message || null);
      }
    } catch (e) {
      error.statusCode = httpResponse.statusCode;
      error.message = httpResponse.statusMessage;
    }
  } else {
    error.statusCode = httpResponse.statusCode;
    error.message = httpResponse.statusCode.toString();
  }

  resp.error = util_1.error(new Error(), error);
}

function extractData(resp) {
  var body = resp.httpResponse.body.toString() || '{}';
  if (resp.request.service.config.convertResponseTypes === false) {
    resp.data = JSON.parse(body);
  } else {
    var operation = resp.request.service.api.operations[resp.request.operation];
    var shape = operation.output || {};
    var parser$$1 = new parser();
    resp.data = parser$$1.parse(body, shape);
  }
}

var json = {
  buildRequest: buildRequest,
  extractError: extractError,
  extractData: extractData
};

function QueryParamSerializer() {
}

QueryParamSerializer.prototype.serialize = function(params, shape, fn) {
  serializeStructure('', params, shape, fn);
};

function ucfirst(shape) {
  if (shape.isQueryName || shape.api.protocol !== 'ec2') {
    return shape.name;
  } else {
    return shape.name[0].toUpperCase() + shape.name.substr(1);
  }
}

function serializeStructure(prefix, struct, rules, fn) {
  util_1.each(rules.members, function(name, member) {
    var value = struct[name];
    if (value === null || value === undefined) return;

    var memberName = ucfirst(member);
    memberName = prefix ? prefix + '.' + memberName : memberName;
    serializeMember(memberName, value, member, fn);
  });
}

function serializeMap(name, map, rules, fn) {
  var i = 1;
  util_1.each(map, function (key, value) {
    var prefix = rules.flattened ? '.' : '.entry.';
    var position = prefix + (i++) + '.';
    var keyName = position + (rules.key.name || 'key');
    var valueName = position + (rules.value.name || 'value');
    serializeMember(name + keyName, key, rules.key, fn);
    serializeMember(name + valueName, value, rules.value, fn);
  });
}

function serializeList(name, list, rules, fn) {
  var memberRules = rules.member || {};

  if (list.length === 0) {
    fn.call(this, name, null);
    return;
  }

  util_1.arrayEach(list, function (v, n) {
    var suffix = '.' + (n + 1);
    if (rules.api.protocol === 'ec2') {
      // Do nothing for EC2
      suffix = suffix + ''; // make linter happy
    } else if (rules.flattened) {
      if (memberRules.name) {
        var parts = name.split('.');
        parts.pop();
        parts.push(ucfirst(memberRules));
        name = parts.join('.');
      }
    } else {
      suffix = '.' + (memberRules.name ? memberRules.name : 'member') + suffix;
    }
    serializeMember(name + suffix, v, memberRules, fn);
  });
}

function serializeMember(name, value, rules, fn) {
  if (value === null || value === undefined) return;
  if (rules.type === 'structure') {
    serializeStructure(name, value, rules, fn);
  } else if (rules.type === 'list') {
    serializeList(name, value, rules, fn);
  } else if (rules.type === 'map') {
    serializeMap(name, value, rules, fn);
  } else {
    fn(name, rules.toWireFormat(value).toString());
  }
}

var query_param_serializer = QueryParamSerializer;

var memoizedProperty$1 = util_1.memoizedProperty;

function memoize(name, value, fn, nameTr) {
  memoizedProperty$1(this, nameTr(name), function() {
    return fn(name, value);
  });
}

function Collection(iterable, options, fn, nameTr) {
  nameTr = nameTr || String;
  var self = this;

  for (var id in iterable) {
    if (Object.prototype.hasOwnProperty.call(iterable, id)) {
      memoize.call(self, id, iterable[id], fn, nameTr);
    }
  }
}

var collection = Collection;

function property(obj, name, value) {
  if (value !== null && value !== undefined) {
    util_1.property.apply(this, arguments);
  }
}

function memoizedProperty(obj, name) {
  if (!obj.constructor.prototype[name]) {
    util_1.memoizedProperty.apply(this, arguments);
  }
}

function Shape(shape, options, memberName) {
  options = options || {};

  property(this, 'shape', shape.shape);
  property(this, 'api', options.api, false);
  property(this, 'type', shape.type);
  property(this, 'enum', shape.enum);
  property(this, 'min', shape.min);
  property(this, 'max', shape.max);
  property(this, 'pattern', shape.pattern);
  property(this, 'location', shape.location || this.location || 'body');
  property(this, 'name', this.name || shape.xmlName || shape.queryName ||
    shape.locationName || memberName);
  property(this, 'isStreaming', shape.streaming || this.isStreaming || false);
  property(this, 'isComposite', shape.isComposite || false);
  property(this, 'isShape', true, false);
  property(this, 'isQueryName', Boolean(shape.queryName), false);
  property(this, 'isLocationName', Boolean(shape.locationName), false);
  property(this, 'isIdempotent', shape.idempotencyToken === true);
  property(this, 'isJsonValue', shape.jsonvalue === true);
  property(this, 'isSensitive', shape.sensitive === true || shape.prototype && shape.prototype.sensitive === true);

  if (options.documentation) {
    property(this, 'documentation', shape.documentation);
    property(this, 'documentationUrl', shape.documentationUrl);
  }

  if (shape.xmlAttribute) {
    property(this, 'isXmlAttribute', shape.xmlAttribute || false);
  }

  // type conversion and parsing
  property(this, 'defaultValue', null);
  this.toWireFormat = function(value) {
    if (value === null || value === undefined) return '';
    return value;
  };
  this.toType = function(value) { return value; };
}

/**
 * @api private
 */
Shape.normalizedTypes = {
  character: 'string',
  double: 'float',
  long: 'integer',
  short: 'integer',
  biginteger: 'integer',
  bigdecimal: 'float',
  blob: 'binary'
};

/**
 * @api private
 */
Shape.types = {
  'structure': StructureShape,
  'list': ListShape,
  'map': MapShape,
  'boolean': BooleanShape,
  'timestamp': TimestampShape,
  'float': FloatShape,
  'integer': IntegerShape,
  'string': StringShape,
  'base64': Base64Shape,
  'binary': BinaryShape
};

Shape.resolve = function resolve(shape, options) {
  if (shape.shape) {
    var refShape = options.api.shapes[shape.shape];
    if (!refShape) {
      throw new Error('Cannot find shape reference: ' + shape.shape);
    }

    return refShape;
  } else {
    return null;
  }
};

Shape.create = function create(shape, options, memberName) {
  if (shape.isShape) return shape;

  var refShape = Shape.resolve(shape, options);
  if (refShape) {
    var filteredKeys = Object.keys(shape);
    if (!options.documentation) {
      filteredKeys = filteredKeys.filter(function(name) {
        return !name.match(/documentation/);
      });
    }

    // create an inline shape with extra members
    var InlineShape = function() {
      refShape.constructor.call(this, shape, options, memberName);
    };
    InlineShape.prototype = refShape;
    return new InlineShape();
  } else {
    // set type if not set
    if (!shape.type) {
      if (shape.members) shape.type = 'structure';
      else if (shape.member) shape.type = 'list';
      else if (shape.key) shape.type = 'map';
      else shape.type = 'string';
    }

    // normalize types
    var origType = shape.type;
    if (Shape.normalizedTypes[shape.type]) {
      shape.type = Shape.normalizedTypes[shape.type];
    }

    if (Shape.types[shape.type]) {
      return new Shape.types[shape.type](shape, options, memberName);
    } else {
      throw new Error('Unrecognized shape type: ' + origType);
    }
  }
};

function CompositeShape(shape) {
  Shape.apply(this, arguments);
  property(this, 'isComposite', true);

  if (shape.flattened) {
    property(this, 'flattened', shape.flattened || false);
  }
}

function StructureShape(shape, options) {
  var requiredMap = null, firstInit = !this.isShape;

  CompositeShape.apply(this, arguments);

  if (firstInit) {
    property(this, 'defaultValue', function() { return {}; });
    property(this, 'members', {});
    property(this, 'memberNames', []);
    property(this, 'required', []);
    property(this, 'isRequired', function() { return false; });
  }

  if (shape.members) {
    property(this, 'members', new collection(shape.members, options, function(name, member) {
      return Shape.create(member, options, name);
    }));
    memoizedProperty(this, 'memberNames', function() {
      return shape.xmlOrder || Object.keys(shape.members);
    });
  }

  if (shape.required) {
    property(this, 'required', shape.required);
    property(this, 'isRequired', function(name) {
      if (!requiredMap) {
        requiredMap = {};
        for (var i = 0; i < shape.required.length; i++) {
          requiredMap[shape.required[i]] = true;
        }
      }

      return requiredMap[name];
    }, false, true);
  }

  property(this, 'resultWrapper', shape.resultWrapper || null);

  if (shape.payload) {
    property(this, 'payload', shape.payload);
  }

  if (typeof shape.xmlNamespace === 'string') {
    property(this, 'xmlNamespaceUri', shape.xmlNamespace);
  } else if (typeof shape.xmlNamespace === 'object') {
    property(this, 'xmlNamespacePrefix', shape.xmlNamespace.prefix);
    property(this, 'xmlNamespaceUri', shape.xmlNamespace.uri);
  }
}

function ListShape(shape, options) {
  var self = this, firstInit = !this.isShape;
  CompositeShape.apply(this, arguments);

  if (firstInit) {
    property(this, 'defaultValue', function() { return []; });
  }

  if (shape.member) {
    memoizedProperty(this, 'member', function() {
      return Shape.create(shape.member, options);
    });
  }

  if (this.flattened) {
    var oldName = this.name;
    memoizedProperty(this, 'name', function() {
      return self.member.name || oldName;
    });
  }
}

function MapShape(shape, options) {
  var firstInit = !this.isShape;
  CompositeShape.apply(this, arguments);

  if (firstInit) {
    property(this, 'defaultValue', function() { return {}; });
    property(this, 'key', Shape.create({type: 'string'}, options));
    property(this, 'value', Shape.create({type: 'string'}, options));
  }

  if (shape.key) {
    memoizedProperty(this, 'key', function() {
      return Shape.create(shape.key, options);
    });
  }
  if (shape.value) {
    memoizedProperty(this, 'value', function() {
      return Shape.create(shape.value, options);
    });
  }
}

function TimestampShape(shape) {
  var self = this;
  Shape.apply(this, arguments);

  if (this.location === 'header') {
    property(this, 'timestampFormat', 'rfc822');
  } else if (shape.timestampFormat) {
    property(this, 'timestampFormat', shape.timestampFormat);
  } else if (!this.timestampFormat && this.api) {
    if (this.api.timestampFormat) {
      property(this, 'timestampFormat', this.api.timestampFormat);
    } else {
      switch (this.api.protocol) {
        case 'json':
        case 'rest-json':
          property(this, 'timestampFormat', 'unixTimestamp');
          break;
        case 'rest-xml':
        case 'query':
        case 'ec2':
          property(this, 'timestampFormat', 'iso8601');
          break;
      }
    }
  }

  this.toType = function(value) {
    if (value === null || value === undefined) return null;
    if (typeof value.toUTCString === 'function') return value;
    return typeof value === 'string' || typeof value === 'number' ?
           util_1.date.parseTimestamp(value) : null;
  };

  this.toWireFormat = function(value) {
    return util_1.date.format(value, self.timestampFormat);
  };
}

function StringShape() {
  Shape.apply(this, arguments);

  var nullLessProtocols = ['rest-xml', 'query', 'ec2'];
  this.toType = function(value) {
    value = this.api && nullLessProtocols.indexOf(this.api.protocol) > -1 ?
      value || '' : value;
    if (this.isJsonValue) {
      return JSON.parse(value);
    }

    return value && typeof value.toString === 'function' ?
      value.toString() : value;
  };

  this.toWireFormat = function(value) {
    return this.isJsonValue ? JSON.stringify(value) : value;
  };
}

function FloatShape() {
  Shape.apply(this, arguments);

  this.toType = function(value) {
    if (value === null || value === undefined) return null;
    return parseFloat(value);
  };
  this.toWireFormat = this.toType;
}

function IntegerShape() {
  Shape.apply(this, arguments);

  this.toType = function(value) {
    if (value === null || value === undefined) return null;
    return parseInt(value, 10);
  };
  this.toWireFormat = this.toType;
}

function BinaryShape() {
  Shape.apply(this, arguments);
  this.toType = util_1.base64.decode;
  this.toWireFormat = util_1.base64.encode;
}

function Base64Shape() {
  BinaryShape.apply(this, arguments);
}

function BooleanShape() {
  Shape.apply(this, arguments);

  this.toType = function(value) {
    if (typeof value === 'boolean') return value;
    if (value === null || value === undefined) return null;
    return value === 'true';
  };
}

/**
 * @api private
 */
Shape.shapes = {
  StructureShape: StructureShape,
  ListShape: ListShape,
  MapShape: MapShape,
  StringShape: StringShape,
  BooleanShape: BooleanShape,
  Base64Shape: Base64Shape
};

var shape = Shape;

function buildRequest$1(req) {
  var operation = req.service.api.operations[req.operation];
  var httpRequest = req.httpRequest;
  httpRequest.headers['Content-Type'] =
    'application/x-www-form-urlencoded; charset=utf-8';
  httpRequest.params = {
    Version: req.service.api.apiVersion,
    Action: operation.name
  };

  // convert the request parameters into a list of query params,
  // e.g. Deeply.NestedParam.0.Name=value
  var builder = new query_param_serializer();
  builder.serialize(req.params, operation.input, function(name, value) {
    httpRequest.params[name] = value;
  });
  httpRequest.body = util_1.queryParamsToString(httpRequest.params);
}

function extractError$1(resp) {
  var data, body = resp.httpResponse.body.toString();
  if (body.match('<UnknownOperationException')) {
    data = {
      Code: 'UnknownOperation',
      Message: 'Unknown operation ' + resp.request.operation
    };
  } else {
    try {
      data = new core.XML.Parser().parse(body);
    } catch (e) {
      data = {
        Code: resp.httpResponse.statusCode,
        Message: resp.httpResponse.statusMessage
      };
    }
  }

  if (data.requestId && !resp.requestId) resp.requestId = data.requestId;
  if (data.Errors) data = data.Errors;
  if (data.Error) data = data.Error;
  if (data.Code) {
    resp.error = util_1.error(new Error(), {
      code: data.Code,
      message: data.Message
    });
  } else {
    resp.error = util_1.error(new Error(), {
      code: resp.httpResponse.statusCode,
      message: null
    });
  }
}

function extractData$1(resp) {
  var req = resp.request;
  var operation = req.service.api.operations[req.operation];
  var shape$$1 = operation.output || {};
  var origRules = shape$$1;

  if (origRules.resultWrapper) {
    var tmp = shape.create({type: 'structure'});
    tmp.members[origRules.resultWrapper] = shape$$1;
    tmp.memberNames = [origRules.resultWrapper];
    util_1.property(shape$$1, 'name', shape$$1.resultWrapper);
    shape$$1 = tmp;
  }

  var parser = new core.XML.Parser();

  // TODO: Refactor XML Parser to parse RequestId from response.
  if (shape$$1 && shape$$1.members && !shape$$1.members._XAMZRequestId) {
    var requestIdShape = shape.create(
      { type: 'string' },
      { api: { protocol: 'query' } },
      'requestId'
    );
    shape$$1.members._XAMZRequestId = requestIdShape;
  }

  var data = parser.parse(resp.httpResponse.body.toString(), shape$$1);
  resp.requestId = data._XAMZRequestId || data.requestId;

  if (data._XAMZRequestId) delete data._XAMZRequestId;

  if (origRules.resultWrapper) {
    if (data[origRules.resultWrapper]) {
      util_1.update(data, data[origRules.resultWrapper]);
      delete data[origRules.resultWrapper];
    }
  }

  resp.data = data;
}

var query = {
  buildRequest: buildRequest$1,
  extractError: extractError$1,
  extractData: extractData$1
};

function populateMethod(req) {
  req.httpRequest.method = req.service.api.operations[req.operation].httpMethod;
}

function generateURI(endpointPath, operationPath, input, params) {
  var uri = [endpointPath, operationPath].join('/');
  uri = uri.replace(/\/+/g, '/');

  var queryString = {}, queryStringSet = false;
  util_1.each(input.members, function (name, member) {
    var paramValue = params[name];
    if (paramValue === null || paramValue === undefined) return;
    if (member.location === 'uri') {
      var regex = new RegExp('\\{' + member.name + '(\\+)?\\}');
      uri = uri.replace(regex, function(_, plus) {
        var fn = plus ? util_1.uriEscapePath : util_1.uriEscape;
        return fn(String(paramValue));
      });
    } else if (member.location === 'querystring') {
      queryStringSet = true;

      if (member.type === 'list') {
        queryString[member.name] = paramValue.map(function(val) {
          return util_1.uriEscape(String(val));
        });
      } else if (member.type === 'map') {
        util_1.each(paramValue, function(key, value) {
          if (Array.isArray(value)) {
            queryString[key] = value.map(function(val) {
              return util_1.uriEscape(String(val));
            });
          } else {
            queryString[key] = util_1.uriEscape(String(value));
          }
        });
      } else {
        queryString[member.name] = util_1.uriEscape(String(paramValue));
      }
    }
  });

  if (queryStringSet) {
    uri += (uri.indexOf('?') >= 0 ? '&' : '?');
    var parts = [];
    util_1.arrayEach(Object.keys(queryString).sort(), function(key) {
      if (!Array.isArray(queryString[key])) {
        queryString[key] = [queryString[key]];
      }
      for (var i = 0; i < queryString[key].length; i++) {
        parts.push(util_1.uriEscape(String(key)) + '=' + queryString[key][i]);
      }
    });
    uri += parts.join('&');
  }

  return uri;
}

function populateURI(req) {
  var operation = req.service.api.operations[req.operation];
  var input = operation.input;

  var uri = generateURI(req.httpRequest.endpoint.path, operation.httpPath, input, req.params);
  req.httpRequest.path = uri;
}

function populateHeaders(req) {
  var operation = req.service.api.operations[req.operation];
  util_1.each(operation.input.members, function (name, member) {
    var value = req.params[name];
    if (value === null || value === undefined) return;

    if (member.location === 'headers' && member.type === 'map') {
      util_1.each(value, function(key, memberValue) {
        req.httpRequest.headers[member.name + key] = memberValue;
      });
    } else if (member.location === 'header') {
      value = member.toWireFormat(value).toString();
      if (member.isJsonValue) {
        value = util_1.base64.encode(value);
      }
      req.httpRequest.headers[member.name] = value;
    }
  });
}

function buildRequest$2(req) {
  populateMethod(req);
  populateURI(req);
  populateHeaders(req);
}

function extractError$2() {
}

function extractData$2(resp) {
  var req = resp.request;
  var data = {};
  var r = resp.httpResponse;
  var operation = req.service.api.operations[req.operation];
  var output = operation.output;

  // normalize headers names to lower-cased keys for matching
  var headers = {};
  util_1.each(r.headers, function (k, v) {
    headers[k.toLowerCase()] = v;
  });

  util_1.each(output.members, function(name, member) {
    var header = (member.name || name).toLowerCase();
    if (member.location === 'headers' && member.type === 'map') {
      data[name] = {};
      var location = member.isLocationName ? member.name : '';
      var pattern = new RegExp('^' + location + '(.+)', 'i');
      util_1.each(r.headers, function (k, v) {
        var result = k.match(pattern);
        if (result !== null) {
          data[name][result[1]] = v;
        }
      });
    } else if (member.location === 'header') {
      if (headers[header] !== undefined) {
        var value = member.isJsonValue ?
          util_1.base64.decode(headers[header]) :
          headers[header];
        data[name] = member.toType(value);
      }
    } else if (member.location === 'statusCode') {
      data[name] = parseInt(r.statusCode, 10);
    }
  });

  resp.data = data;
}

var rest = {
  buildRequest: buildRequest$2,
  extractError: extractError$2,
  extractData: extractData$2,
  generateURI: generateURI
};

function populateBody(req) {
  var builder$$2 = new builder();
  var input = req.service.api.operations[req.operation].input;

  if (input.payload) {
    var params = {};
    var payloadShape = input.members[input.payload];
    params = req.params[input.payload];
    if (params === undefined) return;

    if (payloadShape.type === 'structure') {
      req.httpRequest.body = builder$$2.build(params, payloadShape);
      applyContentTypeHeader(req);
    } else { // non-JSON payload
      req.httpRequest.body = params;
      if (payloadShape.type === 'binary' || payloadShape.isStreaming) {
        applyContentTypeHeader(req, true);
      }
    }
  } else {
    req.httpRequest.body = builder$$2.build(req.params, input);
    applyContentTypeHeader(req);
  }
}

function applyContentTypeHeader(req, isBinary) {
  var operation = req.service.api.operations[req.operation];
  var input = operation.input;

  if (!req.httpRequest.headers['Content-Type']) {
    var type = isBinary ? 'binary/octet-stream' : 'application/json';
    req.httpRequest.headers['Content-Type'] = type;
  }
}

function buildRequest$3(req) {
  rest.buildRequest(req);

  // never send body payload on GET/HEAD/DELETE
  if (['GET', 'HEAD', 'DELETE'].indexOf(req.httpRequest.method) < 0) {
    populateBody(req);
  }
}

function extractError$3(resp) {
  json.extractError(resp);
}

function extractData$3(resp) {
  rest.extractData(resp);

  var req = resp.request;
  var rules = req.service.api.operations[req.operation].output || {};
  if (rules.payload) {
    var payloadMember = rules.members[rules.payload];
    var body = resp.httpResponse.body;
    if (payloadMember.type === 'structure' || payloadMember.type === 'list') {
      var parser$$2 = new parser();
      resp.data[rules.payload] = parser$$2.parse(body, payloadMember);
    } else if (payloadMember.type === 'binary' || payloadMember.isStreaming) {
      resp.data[rules.payload] = body;
    } else {
      resp.data[rules.payload] = payloadMember.toType(body);
    }
  } else {
    var data = resp.data;
    json.extractData(resp);
    resp.data = util_1.merge(data, resp.data);
  }
}

var rest_json = {
  buildRequest: buildRequest$3,
  extractError: extractError$3,
  extractData: extractData$3
};

function populateBody$1(req) {
  var input = req.service.api.operations[req.operation].input;
  var builder = new core.XML.Builder();
  var params = req.params;

  var payload = input.payload;
  if (payload) {
    var payloadMember = input.members[payload];
    params = params[payload];
    if (params === undefined) return;

    if (payloadMember.type === 'structure') {
      var rootElement = payloadMember.name;
      req.httpRequest.body = builder.toXML(params, payloadMember, rootElement, true);
    } else { // non-xml payload
      req.httpRequest.body = params;
    }
  } else {
    req.httpRequest.body = builder.toXML(params, input, input.name ||
      input.shape || util_1.string.upperFirst(req.operation) + 'Request');
  }
}

function buildRequest$4(req) {
  rest.buildRequest(req);

  // never send body payload on GET/HEAD
  if (['GET', 'HEAD'].indexOf(req.httpRequest.method) < 0) {
    populateBody$1(req);
  }
}

function extractError$4(resp) {
  rest.extractError(resp);

  var data;
  try {
    data = new core.XML.Parser().parse(resp.httpResponse.body.toString());
  } catch (e) {
    data = {
      Code: resp.httpResponse.statusCode,
      Message: resp.httpResponse.statusMessage
    };
  }

  if (data.Errors) data = data.Errors;
  if (data.Error) data = data.Error;
  if (data.Code) {
    resp.error = util_1.error(new Error(), {
      code: data.Code,
      message: data.Message
    });
  } else {
    resp.error = util_1.error(new Error(), {
      code: resp.httpResponse.statusCode,
      message: null
    });
  }
}

function extractData$4(resp) {
  rest.extractData(resp);

  var parser;
  var req = resp.request;
  var body = resp.httpResponse.body;
  var operation = req.service.api.operations[req.operation];
  var output = operation.output;

  var payload = output.payload;
  if (payload) {
    var payloadMember = output.members[payload];
    if (payloadMember.type === 'structure') {
      parser = new core.XML.Parser();
      resp.data[payload] = parser.parse(body.toString(), payloadMember);
    } else if (payloadMember.type === 'binary' || payloadMember.isStreaming) {
      resp.data[payload] = body;
    } else {
      resp.data[payload] = payloadMember.toType(body);
    }
  } else if (body.length > 0) {
    parser = new core.XML.Parser();
    var data = parser.parse(body.toString(), output);
    util_1.update(resp.data, data);
  }
}

var rest_xml = {
  buildRequest: buildRequest$4,
  extractError: extractError$4,
  extractData: extractData$4
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = _freeGlobal || freeSelf || Function('return this')();

var _root = root;

/** Built-in value references. */
var Symbol = _root.Symbol;

var _Symbol = Symbol;

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$3.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto$3.toString;

/** Built-in value references. */
var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty$4.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

var _getRawTag = getRawTag;

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$4.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

var _objectToString = objectToString;

/** `Object#toString` result references. */
var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? _getRawTag(value)
    : _objectToString(value);
}

var _baseGetTag = baseGetTag;

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject;

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]';
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject_1(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = _baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

var isFunction_1 = isFunction;

/** Used to detect overreaching core-js shims. */
var coreJsData = _root['__core-js_shared__'];

var _coreJsData = coreJsData;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

var _isMasked = isMasked;

/** Used for built-in method references. */
var funcProto$1 = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

var _toSource = toSource;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype;
var objectProto$2 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$2.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty$3).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject_1(value) || _isMasked(value)) {
    return false;
  }
  var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
  return pattern.test(_toSource(value));
}

var _baseIsNative = baseIsNative;

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

var _getValue = getValue;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = _getValue(object, key);
  return _baseIsNative(value) ? value : undefined;
}

var _getNative = getNative;

var defineProperty = (function() {
  try {
    var func = _getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

var _defineProperty = defineProperty;

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && _defineProperty) {
    _defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

var _baseAssignValue = baseAssignValue;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

var eq_1 = eq;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$1.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$2.call(object, key) && eq_1(objValue, value)) ||
      (value === undefined && !(key in object))) {
    _baseAssignValue(object, key, value);
  }
}

var _assignValue = assignValue;

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      _baseAssignValue(object, key, newValue);
    } else {
      _assignValue(object, key, newValue);
    }
  }
  return object;
}

var _copyObject = copyObject;

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

var identity_1 = identity;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

var _apply = apply;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return _apply(func, this, otherArgs);
  };
}

var _overRest = overRest;

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

var constant_1 = constant;

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !_defineProperty ? identity_1 : function(func, string) {
  return _defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant_1(string),
    'writable': true
  });
};

var _baseSetToString = baseSetToString;

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800;
var HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

var _shortOut = shortOut;

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = _shortOut(_baseSetToString);

var _setToString = setToString;

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return _setToString(_overRest(func, start, identity_1), func + '');
}

var _baseRest = baseRest;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

var isLength_1 = isLength;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength_1(value.length) && !isFunction_1(value);
}

var isArrayLike_1 = isArrayLike;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

var _isIndex = isIndex;

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject_1(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike_1(object) && _isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq_1(object[index], value);
  }
  return false;
}

var _isIterateeCall = isIterateeCall;

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return _baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && _isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

var _createAssigner = createAssigner;

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$5;

  return value === proto;
}

var _isPrototype = isPrototype;

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

var _baseTimes = baseTimes;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
}

var _baseIsArguments = baseIsArguments;

/** Used for built-in method references. */
var objectProto$7 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$7.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
  return isObjectLike_1(value) && hasOwnProperty$6.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

var isArguments_1 = isArguments;

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

var isArray_1 = isArray;

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

var stubFalse_1 = stubFalse;

var isBuffer_1 = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? _root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse_1;

module.exports = isBuffer;
});

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]';
var arrayTag = '[object Array]';
var boolTag = '[object Boolean]';
var dateTag = '[object Date]';
var errorTag = '[object Error]';
var funcTag$1 = '[object Function]';
var mapTag = '[object Map]';
var numberTag = '[object Number]';
var objectTag = '[object Object]';
var regexpTag = '[object RegExp]';
var setTag = '[object Set]';
var stringTag = '[object String]';
var weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]';
var dataViewTag = '[object DataView]';
var float32Tag = '[object Float32Array]';
var float64Tag = '[object Float64Array]';
var int8Tag = '[object Int8Array]';
var int16Tag = '[object Int16Array]';
var int32Tag = '[object Int32Array]';
var uint8Tag = '[object Uint8Array]';
var uint8ClampedTag = '[object Uint8ClampedArray]';
var uint16Tag = '[object Uint16Array]';
var uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike_1(value) &&
    isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
}

var _baseIsTypedArray = baseIsTypedArray;

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

var _baseUnary = baseUnary;

var _nodeUtil = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && _freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;
});

/* Node.js helper references. */
var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

var isTypedArray_1 = isTypedArray;

/** Used for built-in method references. */
var objectProto$6 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray_1(value),
      isArg = !isArr && isArguments_1(value),
      isBuff = !isArr && !isArg && isBuffer_1(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? _baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$5.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           _isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

var _arrayLikeKeys = arrayLikeKeys;

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

var _overArg = overArg;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = _overArg(Object.keys, Object);

var _nativeKeys = nativeKeys;

/** Used for built-in method references. */
var objectProto$8 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$7 = objectProto$8.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!_isPrototype(object)) {
    return _nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$7.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

var _baseKeys = baseKeys;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
}

var keys_1 = keys;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto.hasOwnProperty;

/**
 * Assigns own enumerable string keyed properties of source objects to the
 * destination object. Source objects are applied from left to right.
 * Subsequent sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object` and is loosely based on
 * [`Object.assign`](https://mdn.io/Object/assign).
 *
 * @static
 * @memberOf _
 * @since 0.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assignIn
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * function Bar() {
 *   this.c = 3;
 * }
 *
 * Foo.prototype.b = 2;
 * Bar.prototype.d = 4;
 *
 * _.assign({ 'a': 0 }, new Foo, new Bar);
 * // => { 'a': 1, 'c': 3 }
 */
var assign = _createAssigner(function(object, source) {
  if (_isPrototype(source) || isArrayLike_1(source)) {
    _copyObject(source, keys_1(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty$1.call(source, key)) {
      _assignValue(object, key, source[key]);
    }
  }
});

var assign_1 = assign;

var XMLStringifier = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLStringifier,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    hasProp = {}.hasOwnProperty;

  module.exports = XMLStringifier = (function() {
    function XMLStringifier(options) {
      this.assertLegalChar = bind(this.assertLegalChar, this);
      var key, ref, value;
      this.allowSurrogateChars = options != null ? options.allowSurrogateChars : void 0;
      this.noDoubleEncoding = options != null ? options.noDoubleEncoding : void 0;
      ref = (options != null ? options.stringify : void 0) || {};
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        value = ref[key];
        this[key] = value;
      }
    }

    XMLStringifier.prototype.eleName = function(val) {
      val = '' + val || '';
      return this.assertLegalChar(val);
    };

    XMLStringifier.prototype.eleText = function(val) {
      val = '' + val || '';
      return this.assertLegalChar(this.elEscape(val));
    };

    XMLStringifier.prototype.cdata = function(val) {
      val = '' + val || '';
      if (val.match(/]]>/)) {
        throw new Error("Invalid CDATA text: " + val);
      }
      return this.assertLegalChar(val);
    };

    XMLStringifier.prototype.comment = function(val) {
      val = '' + val || '';
      if (val.match(/--/)) {
        throw new Error("Comment text cannot contain double-hypen: " + val);
      }
      return this.assertLegalChar(val);
    };

    XMLStringifier.prototype.raw = function(val) {
      return '' + val || '';
    };

    XMLStringifier.prototype.attName = function(val) {
      return '' + val || '';
    };

    XMLStringifier.prototype.attValue = function(val) {
      val = '' + val || '';
      return this.attEscape(val);
    };

    XMLStringifier.prototype.insTarget = function(val) {
      return '' + val || '';
    };

    XMLStringifier.prototype.insValue = function(val) {
      val = '' + val || '';
      if (val.match(/\?>/)) {
        throw new Error("Invalid processing instruction value: " + val);
      }
      return val;
    };

    XMLStringifier.prototype.xmlVersion = function(val) {
      val = '' + val || '';
      if (!val.match(/1\.[0-9]+/)) {
        throw new Error("Invalid version number: " + val);
      }
      return val;
    };

    XMLStringifier.prototype.xmlEncoding = function(val) {
      val = '' + val || '';
      if (!val.match(/^[A-Za-z](?:[A-Za-z0-9._-]|-)*$/)) {
        throw new Error("Invalid encoding: " + val);
      }
      return val;
    };

    XMLStringifier.prototype.xmlStandalone = function(val) {
      if (val) {
        return "yes";
      } else {
        return "no";
      }
    };

    XMLStringifier.prototype.dtdPubID = function(val) {
      return '' + val || '';
    };

    XMLStringifier.prototype.dtdSysID = function(val) {
      return '' + val || '';
    };

    XMLStringifier.prototype.dtdElementValue = function(val) {
      return '' + val || '';
    };

    XMLStringifier.prototype.dtdAttType = function(val) {
      return '' + val || '';
    };

    XMLStringifier.prototype.dtdAttDefault = function(val) {
      if (val != null) {
        return '' + val || '';
      } else {
        return val;
      }
    };

    XMLStringifier.prototype.dtdEntityValue = function(val) {
      return '' + val || '';
    };

    XMLStringifier.prototype.dtdNData = function(val) {
      return '' + val || '';
    };

    XMLStringifier.prototype.convertAttKey = '@';

    XMLStringifier.prototype.convertPIKey = '?';

    XMLStringifier.prototype.convertTextKey = '#text';

    XMLStringifier.prototype.convertCDataKey = '#cdata';

    XMLStringifier.prototype.convertCommentKey = '#comment';

    XMLStringifier.prototype.convertRawKey = '#raw';

    XMLStringifier.prototype.assertLegalChar = function(str) {
      var chars, chr;
      if (this.allowSurrogateChars) {
        chars = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uFFFE-\uFFFF]/;
      } else {
        chars = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE-\uFFFF]/;
      }
      chr = str.match(chars);
      if (chr) {
        throw new Error("Invalid character (" + chr + ") in string: " + str + " at index " + chr.index);
      }
      return str;
    };

    XMLStringifier.prototype.elEscape = function(str) {
      var ampregex;
      ampregex = this.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g;
      return str.replace(ampregex, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r/g, '&#xD;');
    };

    XMLStringifier.prototype.attEscape = function(str) {
      var ampregex;
      ampregex = this.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g;
      return str.replace(ampregex, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    };

    return XMLStringifier;

  })();

}).call(commonjsGlobal);
});

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && _copyObject(source, keys_1(source), object);
}

var _baseAssign = baseAssign;

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject_1(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

var _baseCreate = baseCreate;

/**
 * Creates an object that inherits from the `prototype` object. If a
 * `properties` object is given, its own enumerable string keyed properties
 * are assigned to the created object.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Object
 * @param {Object} prototype The object to inherit from.
 * @param {Object} [properties] The properties to assign to the object.
 * @returns {Object} Returns the new object.
 * @example
 *
 * function Shape() {
 *   this.x = 0;
 *   this.y = 0;
 * }
 *
 * function Circle() {
 *   Shape.call(this);
 * }
 *
 * Circle.prototype = _.create(Shape.prototype, {
 *   'constructor': Circle
 * });
 *
 * var circle = new Circle;
 * circle instanceof Circle;
 * // => true
 *
 * circle instanceof Shape;
 * // => true
 */
function create(prototype, properties) {
  var result = _baseCreate(prototype);
  return properties == null ? result : _baseAssign(result, properties);
}

var create_1 = create;

/* Built-in method references that are verified to be native. */
var DataView = _getNative(_root, 'DataView');

var _DataView = DataView;

/* Built-in method references that are verified to be native. */
var Map = _getNative(_root, 'Map');

var _Map = Map;

/* Built-in method references that are verified to be native. */
var Promise$1 = _getNative(_root, 'Promise');

var _Promise = Promise$1;

/* Built-in method references that are verified to be native. */
var Set = _getNative(_root, 'Set');

var _Set = Set;

/* Built-in method references that are verified to be native. */
var WeakMap = _getNative(_root, 'WeakMap');

var _WeakMap = WeakMap;

/** `Object#toString` result references. */
var mapTag$2 = '[object Map]';
var objectTag$1 = '[object Object]';
var promiseTag = '[object Promise]';
var setTag$2 = '[object Set]';
var weakMapTag$1 = '[object WeakMap]';

var dataViewTag$1 = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = _toSource(_DataView);
var mapCtorString = _toSource(_Map);
var promiseCtorString = _toSource(_Promise);
var setCtorString = _toSource(_Set);
var weakMapCtorString = _toSource(_WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = _baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$1) ||
    (_Map && getTag(new _Map) != mapTag$2) ||
    (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
    (_Set && getTag(new _Set) != setTag$2) ||
    (_WeakMap && getTag(new _WeakMap) != weakMapTag$1)) {
  getTag = function(value) {
    var result = _baseGetTag(value),
        Ctor = result == objectTag$1 ? value.constructor : undefined,
        ctorString = Ctor ? _toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag$1;
        case mapCtorString: return mapTag$2;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag$2;
        case weakMapCtorString: return weakMapTag$1;
      }
    }
    return result;
  };
}

var _getTag = getTag;

/** `Object#toString` result references. */
var mapTag$1 = '[object Map]';
var setTag$1 = '[object Set]';

/** Used for built-in method references. */
var objectProto$9 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$8 = objectProto$9.hasOwnProperty;

/**
 * Checks if `value` is an empty object, collection, map, or set.
 *
 * Objects are considered empty if they have no own enumerable string keyed
 * properties.
 *
 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
 * jQuery-like collections are considered empty if they have a `length` of `0`.
 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty(null);
 * // => true
 *
 * _.isEmpty(true);
 * // => true
 *
 * _.isEmpty(1);
 * // => true
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty({ 'a': 1 });
 * // => false
 */
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (isArrayLike_1(value) &&
      (isArray_1(value) || typeof value == 'string' || typeof value.splice == 'function' ||
        isBuffer_1(value) || isTypedArray_1(value) || isArguments_1(value))) {
    return !value.length;
  }
  var tag = _getTag(value);
  if (tag == mapTag$1 || tag == setTag$1) {
    return !value.size;
  }
  if (_isPrototype(value)) {
    return !_baseKeys(value).length;
  }
  for (var key in value) {
    if (hasOwnProperty$8.call(value, key)) {
      return false;
    }
  }
  return true;
}

var isEmpty_1 = isEmpty;

/**
 * A specialized version of `_.every` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if all elements pass the predicate check,
 *  else `false`.
 */
function arrayEvery(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (!predicate(array[index], index, array)) {
      return false;
    }
  }
  return true;
}

var _arrayEvery = arrayEvery;

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

var _createBaseFor = createBaseFor;

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = _createBaseFor();

var _baseFor = baseFor;

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && _baseFor(object, iteratee, keys_1);
}

var _baseForOwn = baseForOwn;

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike_1(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

var _createBaseEach = createBaseEach;

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = _createBaseEach(_baseForOwn);

var _baseEach = baseEach;

/**
 * The base implementation of `_.every` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if all elements pass the predicate check,
 *  else `false`
 */
function baseEvery(collection, predicate) {
  var result = true;
  _baseEach(collection, function(value, index, collection) {
    result = !!predicate(value, index, collection);
    return result;
  });
  return result;
}

var _baseEvery = baseEvery;

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

var _listCacheClear = listCacheClear;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq_1(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

var _assocIndexOf = assocIndexOf;

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

var _listCacheDelete = listCacheDelete;

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

var _listCacheGet = listCacheGet;

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return _assocIndexOf(this.__data__, key) > -1;
}

var _listCacheHas = listCacheHas;

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

var _listCacheSet = listCacheSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = _listCacheClear;
ListCache.prototype['delete'] = _listCacheDelete;
ListCache.prototype.get = _listCacheGet;
ListCache.prototype.has = _listCacheHas;
ListCache.prototype.set = _listCacheSet;

var _ListCache = ListCache;

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new _ListCache;
  this.size = 0;
}

var _stackClear = stackClear;

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

var _stackDelete = stackDelete;

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

var _stackGet = stackGet;

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

var _stackHas = stackHas;

/* Built-in method references that are verified to be native. */
var nativeCreate = _getNative(Object, 'create');

var _nativeCreate = nativeCreate;

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
  this.size = 0;
}

var _hashClear = hashClear;

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

var _hashDelete = hashDelete;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto$10 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$9 = objectProto$10.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (_nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty$9.call(data, key) ? data[key] : undefined;
}

var _hashGet = hashGet;

/** Used for built-in method references. */
var objectProto$11 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$10 = objectProto$11.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$10.call(data, key);
}

var _hashHas = hashHas;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
  return this;
}

var _hashSet = hashSet;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = _hashClear;
Hash.prototype['delete'] = _hashDelete;
Hash.prototype.get = _hashGet;
Hash.prototype.has = _hashHas;
Hash.prototype.set = _hashSet;

var _Hash = Hash;

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new _Hash,
    'map': new (_Map || _ListCache),
    'string': new _Hash
  };
}

var _mapCacheClear = mapCacheClear;

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

var _isKeyable = isKeyable;

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return _isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

var _getMapData = getMapData;

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = _getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

var _mapCacheDelete = mapCacheDelete;

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return _getMapData(this, key).get(key);
}

var _mapCacheGet = mapCacheGet;

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return _getMapData(this, key).has(key);
}

var _mapCacheHas = mapCacheHas;

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = _getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

var _mapCacheSet = mapCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = _mapCacheClear;
MapCache.prototype['delete'] = _mapCacheDelete;
MapCache.prototype.get = _mapCacheGet;
MapCache.prototype.has = _mapCacheHas;
MapCache.prototype.set = _mapCacheSet;

var _MapCache = MapCache;

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof _ListCache) {
    var pairs = data.__data__;
    if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new _MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

var _stackSet = stackSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new _ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = _stackClear;
Stack.prototype['delete'] = _stackDelete;
Stack.prototype.get = _stackGet;
Stack.prototype.has = _stackHas;
Stack.prototype.set = _stackSet;

var _Stack = Stack;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED$2);
  return this;
}

var _setCacheAdd = setCacheAdd;

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

var _setCacheHas = setCacheHas;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new _MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
SetCache.prototype.has = _setCacheHas;

var _SetCache = SetCache;

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

var _arraySome = arraySome;

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

var _cacheHas = cacheHas;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$2 = 1;
var COMPARE_UNORDERED_FLAG$1 = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG$1) ? new _SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!_arraySome(other, function(othValue, othIndex) {
            if (!_cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

var _equalArrays = equalArrays;

/** Built-in value references. */
var Uint8Array$1 = _root.Uint8Array;

var _Uint8Array = Uint8Array$1;

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

var _mapToArray = mapToArray;

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

var _setToArray = setToArray;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$3 = 1;
var COMPARE_UNORDERED_FLAG$2 = 2;

/** `Object#toString` result references. */
var boolTag$1 = '[object Boolean]';
var dateTag$1 = '[object Date]';
var errorTag$1 = '[object Error]';
var mapTag$3 = '[object Map]';
var numberTag$1 = '[object Number]';
var regexpTag$1 = '[object RegExp]';
var setTag$3 = '[object Set]';
var stringTag$1 = '[object String]';
var symbolTag = '[object Symbol]';

var arrayBufferTag$1 = '[object ArrayBuffer]';
var dataViewTag$2 = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto = _Symbol ? _Symbol.prototype : undefined;
var symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag$2:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag$1:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new _Uint8Array(object), new _Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag$1:
    case dateTag$1:
    case numberTag$1:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq_1(+object, +other);

    case errorTag$1:
      return object.name == other.name && object.message == other.message;

    case regexpTag$1:
    case stringTag$1:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag$3:
      var convert = _mapToArray;

    case setTag$3:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3;
      convert || (convert = _setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG$2;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = _equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

var _equalByTag = equalByTag;

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

var _arrayPush = arrayPush;

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
}

var _baseGetAllKeys = baseGetAllKeys;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

var _arrayFilter = arrayFilter;

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

var stubArray_1 = stubArray;

/** Used for built-in method references. */
var objectProto$14 = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable$1 = objectProto$14.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray_1 : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return _arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable$1.call(object, symbol);
  });
};

var _getSymbols = getSymbols;

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return _baseGetAllKeys(object, keys_1, _getSymbols);
}

var _getAllKeys = getAllKeys;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$4 = 1;

/** Used for built-in method references. */
var objectProto$13 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$12 = objectProto$13.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4,
      objProps = _getAllKeys(object),
      objLength = objProps.length,
      othProps = _getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$12.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

var _equalObjects = equalObjects;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$1 = 1;

/** `Object#toString` result references. */
var argsTag$2 = '[object Arguments]';
var arrayTag$1 = '[object Array]';
var objectTag$2 = '[object Object]';

/** Used for built-in method references. */
var objectProto$12 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$11 = objectProto$12.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray_1(object),
      othIsArr = isArray_1(other),
      objTag = objIsArr ? arrayTag$1 : _getTag(object),
      othTag = othIsArr ? arrayTag$1 : _getTag(other);

  objTag = objTag == argsTag$2 ? objectTag$2 : objTag;
  othTag = othTag == argsTag$2 ? objectTag$2 : othTag;

  var objIsObj = objTag == objectTag$2,
      othIsObj = othTag == objectTag$2,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer_1(object)) {
    if (!isBuffer_1(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new _Stack);
    return (objIsArr || isTypedArray_1(object))
      ? _equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : _equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG$1)) {
    var objIsWrapped = objIsObj && hasOwnProperty$11.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty$11.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new _Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new _Stack);
  return _equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

var _baseIsEqualDeep = baseIsEqualDeep;

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike_1(value) && !isObjectLike_1(other))) {
    return value !== value && other !== other;
  }
  return _baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

var _baseIsEqual = baseIsEqual;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;
var COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new _Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

var _baseIsMatch = baseIsMatch;

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject_1(value);
}

var _isStrictComparable = isStrictComparable;

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = keys_1(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, _isStrictComparable(value)];
  }
  return result;
}

var _getMatchData = getMatchData;

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

var _matchesStrictComparable = matchesStrictComparable;

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = _getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return _matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || _baseIsMatch(object, source, matchData);
  };
}

var _baseMatches = baseMatches;

/** `Object#toString` result references. */
var symbolTag$1 = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike_1(value) && _baseGetTag(value) == symbolTag$1);
}

var isSymbol_1 = isSymbol;

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
var reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray_1(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol_1(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

var _isKey = isKey;

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize$1(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize$1.Cache || _MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize$1.Cache = _MapCache;

var memoize_1 = memoize$1;

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = memoize_1(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

var _memoizeCapped = memoizeCapped;

/** Used to match property names within property paths. */
var reLeadingDot = /^\./;
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = _memoizeCapped(function(string) {
  var result = [];
  if (reLeadingDot.test(string)) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

var _stringToPath = stringToPath;

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

var _arrayMap = arrayMap;

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined;
var symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray_1(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return _arrayMap(value, baseToString) + '';
  }
  if (isSymbol_1(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

var _baseToString = baseToString;

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : _baseToString(value);
}

var toString_1 = toString;

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (isArray_1(value)) {
    return value;
  }
  return _isKey(value, object) ? [value] : _stringToPath(toString_1(value));
}

var _castPath = castPath;

/** Used as references for various `Number` constants. */
var INFINITY$1 = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol_1(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
}

var _toKey = toKey;

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path$$1) {
  path$$1 = _castPath(path$$1, object);

  var index = 0,
      length = path$$1.length;

  while (object != null && index < length) {
    object = object[_toKey(path$$1[index++])];
  }
  return (index && index == length) ? object : undefined;
}

var _baseGet = baseGet;

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path$$1, defaultValue) {
  var result = object == null ? undefined : _baseGet(object, path$$1);
  return result === undefined ? defaultValue : result;
}

var get_1 = get;

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

var _baseHasIn = baseHasIn;

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path$$1, hasFunc) {
  path$$1 = _castPath(path$$1, object);

  var index = -1,
      length = path$$1.length,
      result = false;

  while (++index < length) {
    var key = _toKey(path$$1[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength_1(length) && _isIndex(key, length) &&
    (isArray_1(object) || isArguments_1(object));
}

var _hasPath = hasPath;

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path$$1) {
  return object != null && _hasPath(object, path$$1, _baseHasIn);
}

var hasIn_1 = hasIn;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$5 = 1;
var COMPARE_UNORDERED_FLAG$3 = 2;

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path$$1, srcValue) {
  if (_isKey(path$$1) && _isStrictComparable(srcValue)) {
    return _matchesStrictComparable(_toKey(path$$1), srcValue);
  }
  return function(object) {
    var objValue = get_1(object, path$$1);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn_1(object, path$$1)
      : _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
  };
}

var _baseMatchesProperty = baseMatchesProperty;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

var _baseProperty = baseProperty;

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path$$1) {
  return function(object) {
    return _baseGet(object, path$$1);
  };
}

var _basePropertyDeep = basePropertyDeep;

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property$1(path$$1) {
  return _isKey(path$$1) ? _baseProperty(_toKey(path$$1)) : _basePropertyDeep(path$$1);
}

var property_1 = property$1;

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity_1;
  }
  if (typeof value == 'object') {
    return isArray_1(value)
      ? _baseMatchesProperty(value[0], value[1])
      : _baseMatches(value);
  }
  return property_1(value);
}

var _baseIteratee = baseIteratee;

/**
 * Checks if `predicate` returns truthy for **all** elements of `collection`.
 * Iteration is stopped once `predicate` returns falsey. The predicate is
 * invoked with three arguments: (value, index|key, collection).
 *
 * **Note:** This method returns `true` for
 * [empty collections](https://en.wikipedia.org/wiki/Empty_set) because
 * [everything is true](https://en.wikipedia.org/wiki/Vacuous_truth) of
 * elements of empty collections.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {boolean} Returns `true` if all elements pass the predicate check,
 *  else `false`.
 * @example
 *
 * _.every([true, 1, null, 'yes'], Boolean);
 * // => false
 *
 * var users = [
 *   { 'user': 'barney', 'age': 36, 'active': false },
 *   { 'user': 'fred',   'age': 40, 'active': false }
 * ];
 *
 * // The `_.matches` iteratee shorthand.
 * _.every(users, { 'user': 'barney', 'active': false });
 * // => false
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.every(users, ['active', false]);
 * // => true
 *
 * // The `_.property` iteratee shorthand.
 * _.every(users, 'active');
 * // => false
 */
function every(collection, predicate, guard) {
  var func = isArray_1(collection) ? _arrayEvery : _baseEvery;
  if (guard && _isIterateeCall(collection, predicate, guard)) {
    predicate = undefined;
  }
  return func(collection, _baseIteratee(predicate, 3));
}

var every_1 = every;

var XMLAttribute = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLAttribute, create;

  create = create_1;

  module.exports = XMLAttribute = (function() {
    function XMLAttribute(parent, name, value) {
      this.stringify = parent.stringify;
      if (name == null) {
        throw new Error("Missing attribute name of element " + parent.name);
      }
      if (value == null) {
        throw new Error("Missing attribute value for attribute " + name + " of element " + parent.name);
      }
      this.name = this.stringify.attName(name);
      this.value = this.stringify.attValue(value);
    }

    XMLAttribute.prototype.clone = function() {
      return create(XMLAttribute.prototype, this);
    };

    XMLAttribute.prototype.toString = function(options, level) {
      return ' ' + this.name + '="' + this.value + '"';
    };

    return XMLAttribute;

  })();

}).call(commonjsGlobal);
});

var XMLProcessingInstruction = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLProcessingInstruction, create;

  create = create_1;

  module.exports = XMLProcessingInstruction = (function() {
    function XMLProcessingInstruction(parent, target, value) {
      this.stringify = parent.stringify;
      if (target == null) {
        throw new Error("Missing instruction target");
      }
      this.target = this.stringify.insTarget(target);
      if (value) {
        this.value = this.stringify.insValue(value);
      }
    }

    XMLProcessingInstruction.prototype.clone = function() {
      return create(XMLProcessingInstruction.prototype, this);
    };

    XMLProcessingInstruction.prototype.toString = function(options, level) {
      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
      pretty = (options != null ? options.pretty : void 0) || false;
      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
      level || (level = 0);
      space = new Array(level + offset + 1).join(indent);
      r = '';
      if (pretty) {
        r += space;
      }
      r += '<?';
      r += this.target;
      if (this.value) {
        r += ' ' + this.value;
      }
      r += '?>';
      if (pretty) {
        r += newline;
      }
      return r;
    };

    return XMLProcessingInstruction;

  })();

}).call(commonjsGlobal);
});

var XMLElement = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLAttribute$$1, XMLElement, XMLNode$$1, XMLProcessingInstruction$$1, create, every, isFunction, isObject,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  create = create_1;

  isObject = isObject_1;

  isFunction = isFunction_1;

  every = every_1;

  XMLNode$$1 = XMLNode;

  XMLAttribute$$1 = XMLAttribute;

  XMLProcessingInstruction$$1 = XMLProcessingInstruction;

  module.exports = XMLElement = (function(superClass) {
    extend(XMLElement, superClass);

    function XMLElement(parent, name, attributes) {
      XMLElement.__super__.constructor.call(this, parent);
      if (name == null) {
        throw new Error("Missing element name");
      }
      this.name = this.stringify.eleName(name);
      this.children = [];
      this.instructions = [];
      this.attributes = {};
      if (attributes != null) {
        this.attribute(attributes);
      }
    }

    XMLElement.prototype.clone = function() {
      var att, attName, clonedSelf, i, len, pi, ref, ref1;
      clonedSelf = create(XMLElement.prototype, this);
      if (clonedSelf.isRoot) {
        clonedSelf.documentObject = null;
      }
      clonedSelf.attributes = {};
      ref = this.attributes;
      for (attName in ref) {
        if (!hasProp.call(ref, attName)) continue;
        att = ref[attName];
        clonedSelf.attributes[attName] = att.clone();
      }
      clonedSelf.instructions = [];
      ref1 = this.instructions;
      for (i = 0, len = ref1.length; i < len; i++) {
        pi = ref1[i];
        clonedSelf.instructions.push(pi.clone());
      }
      clonedSelf.children = [];
      this.children.forEach(function(child) {
        var clonedChild;
        clonedChild = child.clone();
        clonedChild.parent = clonedSelf;
        return clonedSelf.children.push(clonedChild);
      });
      return clonedSelf;
    };

    XMLElement.prototype.attribute = function(name, value) {
      var attName, attValue;
      if (name != null) {
        name = name.valueOf();
      }
      if (isObject(name)) {
        for (attName in name) {
          if (!hasProp.call(name, attName)) continue;
          attValue = name[attName];
          this.attribute(attName, attValue);
        }
      } else {
        if (isFunction(value)) {
          value = value.apply();
        }
        if (!this.options.skipNullAttributes || (value != null)) {
          this.attributes[name] = new XMLAttribute$$1(this, name, value);
        }
      }
      return this;
    };

    XMLElement.prototype.removeAttribute = function(name) {
      var attName, i, len;
      if (name == null) {
        throw new Error("Missing attribute name");
      }
      name = name.valueOf();
      if (Array.isArray(name)) {
        for (i = 0, len = name.length; i < len; i++) {
          attName = name[i];
          delete this.attributes[attName];
        }
      } else {
        delete this.attributes[name];
      }
      return this;
    };

    XMLElement.prototype.instruction = function(target, value) {
      var i, insTarget, insValue, instruction, len;
      if (target != null) {
        target = target.valueOf();
      }
      if (value != null) {
        value = value.valueOf();
      }
      if (Array.isArray(target)) {
        for (i = 0, len = target.length; i < len; i++) {
          insTarget = target[i];
          this.instruction(insTarget);
        }
      } else if (isObject(target)) {
        for (insTarget in target) {
          if (!hasProp.call(target, insTarget)) continue;
          insValue = target[insTarget];
          this.instruction(insTarget, insValue);
        }
      } else {
        if (isFunction(value)) {
          value = value.apply();
        }
        instruction = new XMLProcessingInstruction$$1(this, target, value);
        this.instructions.push(instruction);
      }
      return this;
    };

    XMLElement.prototype.toString = function(options, level) {
      var att, child, i, indent, instruction, j, len, len1, name, newline, offset, pretty, r, ref, ref1, ref2, ref3, ref4, ref5, space;
      pretty = (options != null ? options.pretty : void 0) || false;
      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
      level || (level = 0);
      space = new Array(level + offset + 1).join(indent);
      r = '';
      ref3 = this.instructions;
      for (i = 0, len = ref3.length; i < len; i++) {
        instruction = ref3[i];
        r += instruction.toString(options, level);
      }
      if (pretty) {
        r += space;
      }
      r += '<' + this.name;
      ref4 = this.attributes;
      for (name in ref4) {
        if (!hasProp.call(ref4, name)) continue;
        att = ref4[name];
        r += att.toString(options);
      }
      if (this.children.length === 0 || every(this.children, function(e) {
        return e.value === '';
      })) {
        r += '/>';
        if (pretty) {
          r += newline;
        }
      } else if (pretty && this.children.length === 1 && (this.children[0].value != null)) {
        r += '>';
        r += this.children[0].value;
        r += '</' + this.name + '>';
        r += newline;
      } else {
        r += '>';
        if (pretty) {
          r += newline;
        }
        ref5 = this.children;
        for (j = 0, len1 = ref5.length; j < len1; j++) {
          child = ref5[j];
          r += child.toString(options, level + 1);
        }
        if (pretty) {
          r += space;
        }
        r += '</' + this.name + '>';
        if (pretty) {
          r += newline;
        }
      }
      return r;
    };

    XMLElement.prototype.att = function(name, value) {
      return this.attribute(name, value);
    };

    XMLElement.prototype.ins = function(target, value) {
      return this.instruction(target, value);
    };

    XMLElement.prototype.a = function(name, value) {
      return this.attribute(name, value);
    };

    XMLElement.prototype.i = function(target, value) {
      return this.instruction(target, value);
    };

    return XMLElement;

  })(XMLNode$$1);

}).call(commonjsGlobal);
});

var XMLCData = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLCData, XMLNode$$2, create,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  create = create_1;

  XMLNode$$2 = XMLNode;

  module.exports = XMLCData = (function(superClass) {
    extend(XMLCData, superClass);

    function XMLCData(parent, text) {
      XMLCData.__super__.constructor.call(this, parent);
      if (text == null) {
        throw new Error("Missing CDATA text");
      }
      this.text = this.stringify.cdata(text);
    }

    XMLCData.prototype.clone = function() {
      return create(XMLCData.prototype, this);
    };

    XMLCData.prototype.toString = function(options, level) {
      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
      pretty = (options != null ? options.pretty : void 0) || false;
      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
      level || (level = 0);
      space = new Array(level + offset + 1).join(indent);
      r = '';
      if (pretty) {
        r += space;
      }
      r += '<![CDATA[' + this.text + ']]>';
      if (pretty) {
        r += newline;
      }
      return r;
    };

    return XMLCData;

  })(XMLNode$$2);

}).call(commonjsGlobal);
});

var XMLComment = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLComment, XMLNode$$2, create,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  create = create_1;

  XMLNode$$2 = XMLNode;

  module.exports = XMLComment = (function(superClass) {
    extend(XMLComment, superClass);

    function XMLComment(parent, text) {
      XMLComment.__super__.constructor.call(this, parent);
      if (text == null) {
        throw new Error("Missing comment text");
      }
      this.text = this.stringify.comment(text);
    }

    XMLComment.prototype.clone = function() {
      return create(XMLComment.prototype, this);
    };

    XMLComment.prototype.toString = function(options, level) {
      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
      pretty = (options != null ? options.pretty : void 0) || false;
      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
      level || (level = 0);
      space = new Array(level + offset + 1).join(indent);
      r = '';
      if (pretty) {
        r += space;
      }
      r += '<!-- ' + this.text + ' -->';
      if (pretty) {
        r += newline;
      }
      return r;
    };

    return XMLComment;

  })(XMLNode$$2);

}).call(commonjsGlobal);
});

var XMLDTDAttList = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLDTDAttList;

  module.exports = XMLDTDAttList = (function() {
    function XMLDTDAttList(parent, elementName, attributeName, attributeType, defaultValueType, defaultValue) {
      this.stringify = parent.stringify;
      if (elementName == null) {
        throw new Error("Missing DTD element name");
      }
      if (attributeName == null) {
        throw new Error("Missing DTD attribute name");
      }
      if (!attributeType) {
        throw new Error("Missing DTD attribute type");
      }
      if (!defaultValueType) {
        throw new Error("Missing DTD attribute default");
      }
      if (defaultValueType.indexOf('#') !== 0) {
        defaultValueType = '#' + defaultValueType;
      }
      if (!defaultValueType.match(/^(#REQUIRED|#IMPLIED|#FIXED|#DEFAULT)$/)) {
        throw new Error("Invalid default value type; expected: #REQUIRED, #IMPLIED, #FIXED or #DEFAULT");
      }
      if (defaultValue && !defaultValueType.match(/^(#FIXED|#DEFAULT)$/)) {
        throw new Error("Default value only applies to #FIXED or #DEFAULT");
      }
      this.elementName = this.stringify.eleName(elementName);
      this.attributeName = this.stringify.attName(attributeName);
      this.attributeType = this.stringify.dtdAttType(attributeType);
      this.defaultValue = this.stringify.dtdAttDefault(defaultValue);
      this.defaultValueType = defaultValueType;
    }

    XMLDTDAttList.prototype.toString = function(options, level) {
      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
      pretty = (options != null ? options.pretty : void 0) || false;
      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
      level || (level = 0);
      space = new Array(level + offset + 1).join(indent);
      r = '';
      if (pretty) {
        r += space;
      }
      r += '<!ATTLIST ' + this.elementName + ' ' + this.attributeName + ' ' + this.attributeType;
      if (this.defaultValueType !== '#DEFAULT') {
        r += ' ' + this.defaultValueType;
      }
      if (this.defaultValue) {
        r += ' "' + this.defaultValue + '"';
      }
      r += '>';
      if (pretty) {
        r += newline;
      }
      return r;
    };

    return XMLDTDAttList;

  })();

}).call(commonjsGlobal);
});

var XMLDTDEntity = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLDTDEntity, create, isObject;

  isObject = isObject_1;

  module.exports = XMLDTDEntity = (function() {
    function XMLDTDEntity(parent, pe, name, value) {
      this.stringify = parent.stringify;
      if (name == null) {
        throw new Error("Missing entity name");
      }
      if (value == null) {
        throw new Error("Missing entity value");
      }
      this.pe = !!pe;
      this.name = this.stringify.eleName(name);
      if (!isObject(value)) {
        this.value = this.stringify.dtdEntityValue(value);
      } else {
        if (!value.pubID && !value.sysID) {
          throw new Error("Public and/or system identifiers are required for an external entity");
        }
        if (value.pubID && !value.sysID) {
          throw new Error("System identifier is required for a public external entity");
        }
        if (value.pubID != null) {
          this.pubID = this.stringify.dtdPubID(value.pubID);
        }
        if (value.sysID != null) {
          this.sysID = this.stringify.dtdSysID(value.sysID);
        }
        if (value.nData != null) {
          this.nData = this.stringify.dtdNData(value.nData);
        }
        if (this.pe && this.nData) {
          throw new Error("Notation declaration is not allowed in a parameter entity");
        }
      }
    }

    XMLDTDEntity.prototype.toString = function(options, level) {
      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
      pretty = (options != null ? options.pretty : void 0) || false;
      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
      level || (level = 0);
      space = new Array(level + offset + 1).join(indent);
      r = '';
      if (pretty) {
        r += space;
      }
      r += '<!ENTITY';
      if (this.pe) {
        r += ' %';
      }
      r += ' ' + this.name;
      if (this.value) {
        r += ' "' + this.value + '"';
      } else {
        if (this.pubID && this.sysID) {
          r += ' PUBLIC "' + this.pubID + '" "' + this.sysID + '"';
        } else if (this.sysID) {
          r += ' SYSTEM "' + this.sysID + '"';
        }
        if (this.nData) {
          r += ' NDATA ' + this.nData;
        }
      }
      r += '>';
      if (pretty) {
        r += newline;
      }
      return r;
    };

    return XMLDTDEntity;

  })();

}).call(commonjsGlobal);
});

var XMLDTDElement = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLDTDElement;

  module.exports = XMLDTDElement = (function() {
    function XMLDTDElement(parent, name, value) {
      this.stringify = parent.stringify;
      if (name == null) {
        throw new Error("Missing DTD element name");
      }
      if (!value) {
        value = '(#PCDATA)';
      }
      if (Array.isArray(value)) {
        value = '(' + value.join(',') + ')';
      }
      this.name = this.stringify.eleName(name);
      this.value = this.stringify.dtdElementValue(value);
    }

    XMLDTDElement.prototype.toString = function(options, level) {
      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
      pretty = (options != null ? options.pretty : void 0) || false;
      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
      level || (level = 0);
      space = new Array(level + offset + 1).join(indent);
      r = '';
      if (pretty) {
        r += space;
      }
      r += '<!ELEMENT ' + this.name + ' ' + this.value + '>';
      if (pretty) {
        r += newline;
      }
      return r;
    };

    return XMLDTDElement;

  })();

}).call(commonjsGlobal);
});

var XMLDTDNotation = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLDTDNotation;

  module.exports = XMLDTDNotation = (function() {
    function XMLDTDNotation(parent, name, value) {
      this.stringify = parent.stringify;
      if (name == null) {
        throw new Error("Missing notation name");
      }
      if (!value.pubID && !value.sysID) {
        throw new Error("Public or system identifiers are required for an external entity");
      }
      this.name = this.stringify.eleName(name);
      if (value.pubID != null) {
        this.pubID = this.stringify.dtdPubID(value.pubID);
      }
      if (value.sysID != null) {
        this.sysID = this.stringify.dtdSysID(value.sysID);
      }
    }

    XMLDTDNotation.prototype.toString = function(options, level) {
      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
      pretty = (options != null ? options.pretty : void 0) || false;
      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
      level || (level = 0);
      space = new Array(level + offset + 1).join(indent);
      r = '';
      if (pretty) {
        r += space;
      }
      r += '<!NOTATION ' + this.name;
      if (this.pubID && this.sysID) {
        r += ' PUBLIC "' + this.pubID + '" "' + this.sysID + '"';
      } else if (this.pubID) {
        r += ' PUBLIC "' + this.pubID + '"';
      } else if (this.sysID) {
        r += ' SYSTEM "' + this.sysID + '"';
      }
      r += '>';
      if (pretty) {
        r += newline;
      }
      return r;
    };

    return XMLDTDNotation;

  })();

}).call(commonjsGlobal);
});

var XMLDocType = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLCData$$1, XMLComment$$1, XMLDTDAttList$$1, XMLDTDElement$$1, XMLDTDEntity$$1, XMLDTDNotation$$1, XMLDocType, XMLProcessingInstruction$$2, create, isObject;

  isObject = isObject_1;

  XMLCData$$1 = XMLCData;

  XMLComment$$1 = XMLComment;

  XMLDTDAttList$$1 = XMLDTDAttList;

  XMLDTDEntity$$1 = XMLDTDEntity;

  XMLDTDElement$$1 = XMLDTDElement;

  XMLDTDNotation$$1 = XMLDTDNotation;

  XMLProcessingInstruction$$2 = XMLProcessingInstruction;

  module.exports = XMLDocType = (function() {
    function XMLDocType(parent, pubID, sysID) {
      var ref, ref1;
      this.documentObject = parent;
      this.stringify = this.documentObject.stringify;
      this.children = [];
      if (isObject(pubID)) {
        ref = pubID, pubID = ref.pubID, sysID = ref.sysID;
      }
      if (sysID == null) {
        ref1 = [pubID, sysID], sysID = ref1[0], pubID = ref1[1];
      }
      if (pubID != null) {
        this.pubID = this.stringify.dtdPubID(pubID);
      }
      if (sysID != null) {
        this.sysID = this.stringify.dtdSysID(sysID);
      }
    }

    XMLDocType.prototype.element = function(name, value) {
      var child;
      child = new XMLDTDElement$$1(this, name, value);
      this.children.push(child);
      return this;
    };

    XMLDocType.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
      var child;
      child = new XMLDTDAttList$$1(this, elementName, attributeName, attributeType, defaultValueType, defaultValue);
      this.children.push(child);
      return this;
    };

    XMLDocType.prototype.entity = function(name, value) {
      var child;
      child = new XMLDTDEntity$$1(this, false, name, value);
      this.children.push(child);
      return this;
    };

    XMLDocType.prototype.pEntity = function(name, value) {
      var child;
      child = new XMLDTDEntity$$1(this, true, name, value);
      this.children.push(child);
      return this;
    };

    XMLDocType.prototype.notation = function(name, value) {
      var child;
      child = new XMLDTDNotation$$1(this, name, value);
      this.children.push(child);
      return this;
    };

    XMLDocType.prototype.cdata = function(value) {
      var child;
      child = new XMLCData$$1(this, value);
      this.children.push(child);
      return this;
    };

    XMLDocType.prototype.comment = function(value) {
      var child;
      child = new XMLComment$$1(this, value);
      this.children.push(child);
      return this;
    };

    XMLDocType.prototype.instruction = function(target, value) {
      var child;
      child = new XMLProcessingInstruction$$2(this, target, value);
      this.children.push(child);
      return this;
    };

    XMLDocType.prototype.root = function() {
      return this.documentObject.root();
    };

    XMLDocType.prototype.document = function() {
      return this.documentObject;
    };

    XMLDocType.prototype.toString = function(options, level) {
      var child, i, indent, len, newline, offset, pretty, r, ref, ref1, ref2, ref3, space;
      pretty = (options != null ? options.pretty : void 0) || false;
      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
      level || (level = 0);
      space = new Array(level + offset + 1).join(indent);
      r = '';
      if (pretty) {
        r += space;
      }
      r += '<!DOCTYPE ' + this.root().name;
      if (this.pubID && this.sysID) {
        r += ' PUBLIC "' + this.pubID + '" "' + this.sysID + '"';
      } else if (this.sysID) {
        r += ' SYSTEM "' + this.sysID + '"';
      }
      if (this.children.length > 0) {
        r += ' [';
        if (pretty) {
          r += newline;
        }
        ref3 = this.children;
        for (i = 0, len = ref3.length; i < len; i++) {
          child = ref3[i];
          r += child.toString(options, level + 1);
        }
        r += ']';
      }
      r += '>';
      if (pretty) {
        r += newline;
      }
      return r;
    };

    XMLDocType.prototype.ele = function(name, value) {
      return this.element(name, value);
    };

    XMLDocType.prototype.att = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
      return this.attList(elementName, attributeName, attributeType, defaultValueType, defaultValue);
    };

    XMLDocType.prototype.ent = function(name, value) {
      return this.entity(name, value);
    };

    XMLDocType.prototype.pent = function(name, value) {
      return this.pEntity(name, value);
    };

    XMLDocType.prototype.not = function(name, value) {
      return this.notation(name, value);
    };

    XMLDocType.prototype.dat = function(value) {
      return this.cdata(value);
    };

    XMLDocType.prototype.com = function(value) {
      return this.comment(value);
    };

    XMLDocType.prototype.ins = function(target, value) {
      return this.instruction(target, value);
    };

    XMLDocType.prototype.up = function() {
      return this.root();
    };

    XMLDocType.prototype.doc = function() {
      return this.document();
    };

    return XMLDocType;

  })();

}).call(commonjsGlobal);
});

var XMLRaw = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLNode$$2, XMLRaw, create,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  create = create_1;

  XMLNode$$2 = XMLNode;

  module.exports = XMLRaw = (function(superClass) {
    extend(XMLRaw, superClass);

    function XMLRaw(parent, text) {
      XMLRaw.__super__.constructor.call(this, parent);
      if (text == null) {
        throw new Error("Missing raw text");
      }
      this.value = this.stringify.raw(text);
    }

    XMLRaw.prototype.clone = function() {
      return create(XMLRaw.prototype, this);
    };

    XMLRaw.prototype.toString = function(options, level) {
      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
      pretty = (options != null ? options.pretty : void 0) || false;
      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
      level || (level = 0);
      space = new Array(level + offset + 1).join(indent);
      r = '';
      if (pretty) {
        r += space;
      }
      r += this.value;
      if (pretty) {
        r += newline;
      }
      return r;
    };

    return XMLRaw;

  })(XMLNode$$2);

}).call(commonjsGlobal);
});

var XMLText = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLNode$$2, XMLText, create,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  create = create_1;

  XMLNode$$2 = XMLNode;

  module.exports = XMLText = (function(superClass) {
    extend(XMLText, superClass);

    function XMLText(parent, text) {
      XMLText.__super__.constructor.call(this, parent);
      if (text == null) {
        throw new Error("Missing element text");
      }
      this.value = this.stringify.eleText(text);
    }

    XMLText.prototype.clone = function() {
      return create(XMLText.prototype, this);
    };

    XMLText.prototype.toString = function(options, level) {
      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
      pretty = (options != null ? options.pretty : void 0) || false;
      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
      level || (level = 0);
      space = new Array(level + offset + 1).join(indent);
      r = '';
      if (pretty) {
        r += space;
      }
      r += this.value;
      if (pretty) {
        r += newline;
      }
      return r;
    };

    return XMLText;

  })(XMLNode$$2);

}).call(commonjsGlobal);
});

var XMLNode = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLCData$$1, XMLComment$$1, XMLDeclaration$$1, XMLDocType$$1, XMLElement$$1, XMLNode, XMLRaw$$1, XMLText$$1, isEmpty, isFunction, isObject,
    hasProp = {}.hasOwnProperty;

  isObject = isObject_1;

  isFunction = isFunction_1;

  isEmpty = isEmpty_1;

  XMLElement$$1 = null;

  XMLCData$$1 = null;

  XMLComment$$1 = null;

  XMLDeclaration$$1 = null;

  XMLDocType$$1 = null;

  XMLRaw$$1 = null;

  XMLText$$1 = null;

  module.exports = XMLNode = (function() {
    function XMLNode(parent) {
      this.parent = parent;
      this.options = this.parent.options;
      this.stringify = this.parent.stringify;
      if (XMLElement$$1 === null) {
        XMLElement$$1 = XMLElement;
        XMLCData$$1 = XMLCData;
        XMLComment$$1 = XMLComment;
        XMLDeclaration$$1 = XMLDeclaration;
        XMLDocType$$1 = XMLDocType;
        XMLRaw$$1 = XMLRaw;
        XMLText$$1 = XMLText;
      }
    }

    XMLNode.prototype.element = function(name, attributes, text) {
      var childNode, item, j, k, key, lastChild, len, len1, ref, val;
      lastChild = null;
      if (attributes == null) {
        attributes = {};
      }
      attributes = attributes.valueOf();
      if (!isObject(attributes)) {
        ref = [attributes, text], text = ref[0], attributes = ref[1];
      }
      if (name != null) {
        name = name.valueOf();
      }
      if (Array.isArray(name)) {
        for (j = 0, len = name.length; j < len; j++) {
          item = name[j];
          lastChild = this.element(item);
        }
      } else if (isFunction(name)) {
        lastChild = this.element(name.apply());
      } else if (isObject(name)) {
        for (key in name) {
          if (!hasProp.call(name, key)) continue;
          val = name[key];
          if (isFunction(val)) {
            val = val.apply();
          }
          if ((isObject(val)) && (isEmpty(val))) {
            val = null;
          }
          if (!this.options.ignoreDecorators && this.stringify.convertAttKey && key.indexOf(this.stringify.convertAttKey) === 0) {
            lastChild = this.attribute(key.substr(this.stringify.convertAttKey.length), val);
          } else if (!this.options.ignoreDecorators && this.stringify.convertPIKey && key.indexOf(this.stringify.convertPIKey) === 0) {
            lastChild = this.instruction(key.substr(this.stringify.convertPIKey.length), val);
          } else if (!this.options.separateArrayItems && Array.isArray(val)) {
            for (k = 0, len1 = val.length; k < len1; k++) {
              item = val[k];
              childNode = {};
              childNode[key] = item;
              lastChild = this.element(childNode);
            }
          } else if (isObject(val)) {
            lastChild = this.element(key);
            lastChild.element(val);
          } else {
            lastChild = this.element(key, val);
          }
        }
      } else {
        if (!this.options.ignoreDecorators && this.stringify.convertTextKey && name.indexOf(this.stringify.convertTextKey) === 0) {
          lastChild = this.text(text);
        } else if (!this.options.ignoreDecorators && this.stringify.convertCDataKey && name.indexOf(this.stringify.convertCDataKey) === 0) {
          lastChild = this.cdata(text);
        } else if (!this.options.ignoreDecorators && this.stringify.convertCommentKey && name.indexOf(this.stringify.convertCommentKey) === 0) {
          lastChild = this.comment(text);
        } else if (!this.options.ignoreDecorators && this.stringify.convertRawKey && name.indexOf(this.stringify.convertRawKey) === 0) {
          lastChild = this.raw(text);
        } else {
          lastChild = this.node(name, attributes, text);
        }
      }
      if (lastChild == null) {
        throw new Error("Could not create any elements with: " + name);
      }
      return lastChild;
    };

    XMLNode.prototype.insertBefore = function(name, attributes, text) {
      var child, i, removed;
      if (this.isRoot) {
        throw new Error("Cannot insert elements at root level");
      }
      i = this.parent.children.indexOf(this);
      removed = this.parent.children.splice(i);
      child = this.parent.element(name, attributes, text);
      Array.prototype.push.apply(this.parent.children, removed);
      return child;
    };

    XMLNode.prototype.insertAfter = function(name, attributes, text) {
      var child, i, removed;
      if (this.isRoot) {
        throw new Error("Cannot insert elements at root level");
      }
      i = this.parent.children.indexOf(this);
      removed = this.parent.children.splice(i + 1);
      child = this.parent.element(name, attributes, text);
      Array.prototype.push.apply(this.parent.children, removed);
      return child;
    };

    XMLNode.prototype.remove = function() {
      var i, ref;
      if (this.isRoot) {
        throw new Error("Cannot remove the root element");
      }
      i = this.parent.children.indexOf(this);
      [].splice.apply(this.parent.children, [i, i - i + 1].concat(ref = [])), ref;
      return this.parent;
    };

    XMLNode.prototype.node = function(name, attributes, text) {
      var child, ref;
      if (name != null) {
        name = name.valueOf();
      }
      if (attributes == null) {
        attributes = {};
      }
      attributes = attributes.valueOf();
      if (!isObject(attributes)) {
        ref = [attributes, text], text = ref[0], attributes = ref[1];
      }
      child = new XMLElement$$1(this, name, attributes);
      if (text != null) {
        child.text(text);
      }
      this.children.push(child);
      return child;
    };

    XMLNode.prototype.text = function(value) {
      var child;
      child = new XMLText$$1(this, value);
      this.children.push(child);
      return this;
    };

    XMLNode.prototype.cdata = function(value) {
      var child;
      child = new XMLCData$$1(this, value);
      this.children.push(child);
      return this;
    };

    XMLNode.prototype.comment = function(value) {
      var child;
      child = new XMLComment$$1(this, value);
      this.children.push(child);
      return this;
    };

    XMLNode.prototype.raw = function(value) {
      var child;
      child = new XMLRaw$$1(this, value);
      this.children.push(child);
      return this;
    };

    XMLNode.prototype.declaration = function(version, encoding, standalone) {
      var doc, xmldec;
      doc = this.document();
      xmldec = new XMLDeclaration$$1(doc, version, encoding, standalone);
      doc.xmldec = xmldec;
      return doc.root();
    };

    XMLNode.prototype.doctype = function(pubID, sysID) {
      var doc, doctype;
      doc = this.document();
      doctype = new XMLDocType$$1(doc, pubID, sysID);
      doc.doctype = doctype;
      return doctype;
    };

    XMLNode.prototype.up = function() {
      if (this.isRoot) {
        throw new Error("The root node has no parent. Use doc() if you need to get the document object.");
      }
      return this.parent;
    };

    XMLNode.prototype.root = function() {
      var child;
      if (this.isRoot) {
        return this;
      }
      child = this.parent;
      while (!child.isRoot) {
        child = child.parent;
      }
      return child;
    };

    XMLNode.prototype.document = function() {
      return this.root().documentObject;
    };

    XMLNode.prototype.end = function(options) {
      return this.document().toString(options);
    };

    XMLNode.prototype.prev = function() {
      var i;
      if (this.isRoot) {
        throw new Error("Root node has no siblings");
      }
      i = this.parent.children.indexOf(this);
      if (i < 1) {
        throw new Error("Already at the first node");
      }
      return this.parent.children[i - 1];
    };

    XMLNode.prototype.next = function() {
      var i;
      if (this.isRoot) {
        throw new Error("Root node has no siblings");
      }
      i = this.parent.children.indexOf(this);
      if (i === -1 || i === this.parent.children.length - 1) {
        throw new Error("Already at the last node");
      }
      return this.parent.children[i + 1];
    };

    XMLNode.prototype.importXMLBuilder = function(xmlbuilder) {
      var clonedRoot;
      clonedRoot = xmlbuilder.root().clone();
      clonedRoot.parent = this;
      clonedRoot.isRoot = false;
      this.children.push(clonedRoot);
      return this;
    };

    XMLNode.prototype.ele = function(name, attributes, text) {
      return this.element(name, attributes, text);
    };

    XMLNode.prototype.nod = function(name, attributes, text) {
      return this.node(name, attributes, text);
    };

    XMLNode.prototype.txt = function(value) {
      return this.text(value);
    };

    XMLNode.prototype.dat = function(value) {
      return this.cdata(value);
    };

    XMLNode.prototype.com = function(value) {
      return this.comment(value);
    };

    XMLNode.prototype.doc = function() {
      return this.document();
    };

    XMLNode.prototype.dec = function(version, encoding, standalone) {
      return this.declaration(version, encoding, standalone);
    };

    XMLNode.prototype.dtd = function(pubID, sysID) {
      return this.doctype(pubID, sysID);
    };

    XMLNode.prototype.e = function(name, attributes, text) {
      return this.element(name, attributes, text);
    };

    XMLNode.prototype.n = function(name, attributes, text) {
      return this.node(name, attributes, text);
    };

    XMLNode.prototype.t = function(value) {
      return this.text(value);
    };

    XMLNode.prototype.d = function(value) {
      return this.cdata(value);
    };

    XMLNode.prototype.c = function(value) {
      return this.comment(value);
    };

    XMLNode.prototype.r = function(value) {
      return this.raw(value);
    };

    XMLNode.prototype.u = function() {
      return this.up();
    };

    return XMLNode;

  })();

}).call(commonjsGlobal);
});

var XMLDeclaration = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLDeclaration, XMLNode$$1, create, isObject,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  isObject = isObject_1;

  XMLNode$$1 = XMLNode;

  module.exports = XMLDeclaration = (function(superClass) {
    extend(XMLDeclaration, superClass);

    function XMLDeclaration(parent, version, encoding, standalone) {
      var ref;
      XMLDeclaration.__super__.constructor.call(this, parent);
      if (isObject(version)) {
        ref = version, version = ref.version, encoding = ref.encoding, standalone = ref.standalone;
      }
      if (!version) {
        version = '1.0';
      }
      this.version = this.stringify.xmlVersion(version);
      if (encoding != null) {
        this.encoding = this.stringify.xmlEncoding(encoding);
      }
      if (standalone != null) {
        this.standalone = this.stringify.xmlStandalone(standalone);
      }
    }

    XMLDeclaration.prototype.toString = function(options, level) {
      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
      pretty = (options != null ? options.pretty : void 0) || false;
      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
      level || (level = 0);
      space = new Array(level + offset + 1).join(indent);
      r = '';
      if (pretty) {
        r += space;
      }
      r += '<?xml';
      r += ' version="' + this.version + '"';
      if (this.encoding != null) {
        r += ' encoding="' + this.encoding + '"';
      }
      if (this.standalone != null) {
        r += ' standalone="' + this.standalone + '"';
      }
      r += '?>';
      if (pretty) {
        r += newline;
      }
      return r;
    };

    return XMLDeclaration;

  })(XMLNode$$1);

}).call(commonjsGlobal);
});

var XMLBuilder = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLBuilder, XMLDeclaration$$1, XMLDocType$$1, XMLElement$$1, XMLStringifier$$1;

  XMLStringifier$$1 = XMLStringifier;

  XMLElement$$1 = XMLElement;

  module.exports = XMLBuilder = (function() {
    function XMLBuilder(name, options) {
      var root, temp;
      if (name == null) {
        throw new Error("Root element needs a name");
      }
      if (options == null) {
        options = {};
      }
      this.options = options;
      this.stringify = new XMLStringifier$$1(options);
      temp = new XMLElement$$1(this, 'doc');
      root = temp.element(name);
      root.isRoot = true;
      root.documentObject = this;
      this.rootObject = root;
      if (!options.headless) {
        root.declaration(options);
        if ((options.pubID != null) || (options.sysID != null)) {
          root.doctype(options);
        }
      }
    }

    XMLBuilder.prototype.root = function() {
      return this.rootObject;
    };

    XMLBuilder.prototype.end = function(options) {
      return this.toString(options);
    };

    XMLBuilder.prototype.toString = function(options) {
      var indent, newline, offset, pretty, r, ref, ref1, ref2;
      pretty = (options != null ? options.pretty : void 0) || false;
      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
      r = '';
      if (this.xmldec != null) {
        r += this.xmldec.toString(options);
      }
      if (this.doctype != null) {
        r += this.doctype.toString(options);
      }
      r += this.rootObject.toString(options);
      if (pretty && r.slice(-newline.length) === newline) {
        r = r.slice(0, -newline.length);
      }
      return r;
    };

    return XMLBuilder;

  })();

}).call(commonjsGlobal);
});

var lib = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.9.1
(function() {
  var XMLBuilder$$1, assign;

  assign = assign_1;

  XMLBuilder$$1 = XMLBuilder;

  module.exports.create = function(name, xmldec, doctype, options) {
    options = assign({}, xmldec, doctype, options);
    return new XMLBuilder$$1(name, options).root();
  };

}).call(commonjsGlobal);
});

var lib_1 = lib.create;

function XmlBuilder() { }

XmlBuilder.prototype.toXML = function(params, shape, rootElement, noEmpty) {
  var xml = lib.create(rootElement);
  applyNamespaces(xml, shape);
  serialize(xml, params, shape);
  return xml.children.length > 0 || noEmpty ? xml.root().toString() : '';
};

function serialize(xml, value, shape) {
  switch (shape.type) {
    case 'structure': return serializeStructure$1(xml, value, shape);
    case 'map': return serializeMap$1(xml, value, shape);
    case 'list': return serializeList$1(xml, value, shape);
    default: return serializeScalar(xml, value, shape);
  }
}

function serializeStructure$1(xml, params, shape) {
  util_1.arrayEach(shape.memberNames, function(memberName) {
    var memberShape = shape.members[memberName];
    if (memberShape.location !== 'body') return;

    var value = params[memberName];
    var name = memberShape.name;
    if (value !== undefined && value !== null) {
      if (memberShape.isXmlAttribute) {
        xml.att(name, value);
      } else if (memberShape.flattened) {
        serialize(xml, value, memberShape);
      } else {
        var element = xml.ele(name);
        applyNamespaces(element, memberShape);
        serialize(element, value, memberShape);
      }
    }
  });
}

function serializeMap$1(xml, map, shape) {
  var xmlKey = shape.key.name || 'key';
  var xmlValue = shape.value.name || 'value';

  util_1.each(map, function(key, value) {
    var entry = xml.ele(shape.flattened ? shape.name : 'entry');
    serialize(entry.ele(xmlKey), key, shape.key);
    serialize(entry.ele(xmlValue), value, shape.value);
  });
}

function serializeList$1(xml, list, shape) {
  if (shape.flattened) {
    util_1.arrayEach(list, function(value) {
      var name = shape.member.name || shape.name;
      var element = xml.ele(name);
      serialize(element, value, shape.member);
    });
  } else {
    util_1.arrayEach(list, function(value) {
      var name = shape.member.name || 'member';
      var element = xml.ele(name);
      serialize(element, value, shape.member);
    });
  }
}

function serializeScalar(xml, value, shape) {
  xml.txt(shape.toWireFormat(value));
}

function applyNamespaces(xml, shape) {
  var uri, prefix = 'xmlns';
  if (shape.xmlNamespaceUri) {
    uri = shape.xmlNamespaceUri;
    if (shape.xmlNamespacePrefix) prefix += ':' + shape.xmlNamespacePrefix;
  } else if (xml.isRoot && shape.api.xmlNamespaceUri) {
    uri = shape.api.xmlNamespaceUri;
  }

  if (uri) xml.att(prefix, uri);
}

var builder_1 = XmlBuilder;

var property$4 = util_1.property;
var memoizedProperty$3 = util_1.memoizedProperty;

function Operation(name, operation, options) {
  var self = this;
  options = options || {};

  property$4(this, 'name', operation.name || name);
  property$4(this, 'api', options.api, false);

  operation.http = operation.http || {};
  property$4(this, 'httpMethod', operation.http.method || 'POST');
  property$4(this, 'httpPath', operation.http.requestUri || '/');
  property$4(this, 'authtype', operation.authtype || '');

  memoizedProperty$3(this, 'input', function() {
    if (!operation.input) {
      return new shape.create({type: 'structure'}, options);
    }
    return shape.create(operation.input, options);
  });

  memoizedProperty$3(this, 'output', function() {
    if (!operation.output) {
      return new shape.create({type: 'structure'}, options);
    }
    return shape.create(operation.output, options);
  });

  memoizedProperty$3(this, 'errors', function() {
    var list = [];
    if (!operation.errors) return null;

    for (var i = 0; i < operation.errors.length; i++) {
      list.push(shape.create(operation.errors[i], options));
    }

    return list;
  });

  memoizedProperty$3(this, 'paginator', function() {
    return options.api.paginators[name];
  });

  if (options.documentation) {
    property$4(this, 'documentation', operation.documentation);
    property$4(this, 'documentationUrl', operation.documentationUrl);
  }

  // idempotentMembers only tracks top-level input shapes
  memoizedProperty$3(this, 'idempotentMembers', function() {
    var idempotentMembers = [];
    var input = self.input;
    var members = input.members;
    if (!input.members) {
      return idempotentMembers;
    }
    for (var name in members) {
      if (!members.hasOwnProperty(name)) {
        continue;
      }
      if (members[name].isIdempotent === true) {
        idempotentMembers.push(name);
      }
    }
    return idempotentMembers;
  });

}

var operation = Operation;

var property$5 = util_1.property;

function Paginator(name, paginator) {
  property$5(this, 'inputToken', paginator.input_token);
  property$5(this, 'limitKey', paginator.limit_key);
  property$5(this, 'moreResults', paginator.more_results);
  property$5(this, 'outputToken', paginator.output_token);
  property$5(this, 'resultKey', paginator.result_key);
}

var paginator = Paginator;

var property$6 = util_1.property;

function ResourceWaiter(name, waiter, options) {
  options = options || {};
  property$6(this, 'name', name);
  property$6(this, 'api', options.api, false);

  if (waiter.operation) {
    property$6(this, 'operation', util_1.string.lowerFirst(waiter.operation));
  }

  var self = this;
  var keys = [
    'type',
    'description',
    'delay',
    'maxAttempts',
    'acceptors'
  ];

  keys.forEach(function(key) {
    var value = waiter[key];
    if (value) {
      property$6(self, key, value);
    }
  });
}

var resource_waiter = ResourceWaiter;

var property$3 = util_1.property;
var memoizedProperty$2 = util_1.memoizedProperty;

function Api(api, options) {
  api = api || {};
  options = options || {};
  options.api = this;

  api.metadata = api.metadata || {};

  property$3(this, 'isApi', true, false);
  property$3(this, 'apiVersion', api.metadata.apiVersion);
  property$3(this, 'endpointPrefix', api.metadata.endpointPrefix);
  property$3(this, 'signingName', api.metadata.signingName);
  property$3(this, 'globalEndpoint', api.metadata.globalEndpoint);
  property$3(this, 'signatureVersion', api.metadata.signatureVersion);
  property$3(this, 'jsonVersion', api.metadata.jsonVersion);
  property$3(this, 'targetPrefix', api.metadata.targetPrefix);
  property$3(this, 'protocol', api.metadata.protocol);
  property$3(this, 'timestampFormat', api.metadata.timestampFormat);
  property$3(this, 'xmlNamespaceUri', api.metadata.xmlNamespace);
  property$3(this, 'abbreviation', api.metadata.serviceAbbreviation);
  property$3(this, 'fullName', api.metadata.serviceFullName);

  memoizedProperty$2(this, 'className', function() {
    var name = api.metadata.serviceAbbreviation || api.metadata.serviceFullName;
    if (!name) return null;

    name = name.replace(/^Amazon|AWS\s*|\(.*|\s+|\W+/g, '');
    if (name === 'ElasticLoadBalancing') name = 'ELB';
    return name;
  });

  property$3(this, 'operations', new collection(api.operations, options, function(name, operation$$1) {
    return new operation(name, operation$$1, options);
  }, util_1.string.lowerFirst));

  property$3(this, 'shapes', new collection(api.shapes, options, function(name, shape$$2) {
    return shape.create(shape$$2, options);
  }));

  property$3(this, 'paginators', new collection(api.paginators, options, function(name, paginator$$1) {
    return new paginator(name, paginator$$1, options);
  }));

  property$3(this, 'waiters', new collection(api.waiters, options, function(name, waiter) {
    return new resource_waiter(name, waiter, options);
  }, util_1.string.lowerFirst));

  if (options.documentation) {
    property$3(this, 'documentation', api.documentation);
    property$3(this, 'documentationUrl', api.documentationUrl);
  }
}

var api = Api;

function apiLoader$1(svc, version) {
  if (!apiLoader$1.services.hasOwnProperty(svc)) {
    throw new Error('InvalidService: Failed to load api for ' + svc);
  }
  return apiLoader$1.services[svc][version];
}

/**
 * This member of AWS.apiLoader is private, but changing it will necessitate a
 * change to ../scripts/services-table-generator.ts
 */
apiLoader$1.services = {};
var api_loader = apiLoader$1;

var rules = {"*/*":{"endpoint":"{service}.{region}.amazonaws.com"},"cn-*/*":{"endpoint":"{service}.{region}.amazonaws.com.cn"},"*/budgets":"globalSSL","*/cloudfront":"globalSSL","*/iam":"globalSSL","*/sts":"globalSSL","*/importexport":{"endpoint":"{service}.amazonaws.com","signatureVersion":"v2","globalEndpoint":true},"*/route53":{"endpoint":"https://{service}.amazonaws.com","signatureVersion":"v3https","globalEndpoint":true},"*/waf":"globalSSL","us-gov-*/iam":"globalGovCloud","us-gov-*/sts":{"endpoint":"{service}.{region}.amazonaws.com"},"us-gov-west-1/s3":"s3signature","us-west-1/s3":"s3signature","us-west-2/s3":"s3signature","eu-west-1/s3":"s3signature","ap-southeast-1/s3":"s3signature","ap-southeast-2/s3":"s3signature","ap-northeast-1/s3":"s3signature","sa-east-1/s3":"s3signature","us-east-1/s3":{"endpoint":"{service}.amazonaws.com","signatureVersion":"s3"},"us-east-1/sdb":{"endpoint":"{service}.amazonaws.com","signatureVersion":"v2"},"*/sdb":{"endpoint":"{service}.{region}.amazonaws.com","signatureVersion":"v2"}};
var patterns = {"globalSSL":{"endpoint":"https://{service}.amazonaws.com","globalEndpoint":true},"globalGovCloud":{"endpoint":"{service}.us-gov.amazonaws.com"},"s3signature":{"endpoint":"{service}.{region}.amazonaws.com","signatureVersion":"s3"}};
var region_config_data = {
	rules: rules,
	patterns: patterns
};

var region_config_data$1 = Object.freeze({
	rules: rules,
	patterns: patterns,
	default: region_config_data
});

var regionConfig = ( region_config_data$1 && region_config_data ) || region_config_data$1;

function generateRegionPrefix(region) {
  if (!region) return null;

  var parts = region.split('-');
  if (parts.length < 3) return null;
  return parts.slice(0, parts.length - 2).join('-') + '-*';
}

function derivedKeys(service) {
  var region = service.config.region;
  var regionPrefix = generateRegionPrefix(region);
  var endpointPrefix = service.api.endpointPrefix;

  return [
    [region, endpointPrefix],
    [regionPrefix, endpointPrefix],
    [region, '*'],
    [regionPrefix, '*'],
    ['*', endpointPrefix],
    ['*', '*']
  ].map(function(item) {
    return item[0] && item[1] ? item.join('/') : null;
  });
}

function applyConfig(service, config) {
  util_1.each(config, function(key, value) {
    if (key === 'globalEndpoint') return;
    if (service.config[key] === undefined || service.config[key] === null) {
      service.config[key] = value;
    }
  });
}

function configureEndpoint(service) {
  var keys = derivedKeys(service);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!key) continue;

    if (Object.prototype.hasOwnProperty.call(regionConfig.rules, key)) {
      var config = regionConfig.rules[key];
      if (typeof config === 'string') {
        config = regionConfig.patterns[config];
      }

      // set dualstack endpoint
      if (service.config.useDualstack && util_1.isDualstackAvailable(service)) {
        config = util_1.copy(config);
        config.endpoint = '{service}.dualstack.{region}.amazonaws.com';
      }

      // set global endpoint
      service.isGlobalEndpoint = !!config.globalEndpoint;

      // signature version
      if (!config.signatureVersion) config.signatureVersion = 'v4';

      // merge config
      applyConfig(service, config);
      return;
    }
  }
}

var region_config = configureEndpoint;

var inherit = core.util.inherit;
var clientCount = 0;

/**
 * The service class representing an AWS service.
 *
 * @abstract
 *
 * @!attribute apiVersions
 *   @return [Array<String>] the list of API versions supported by this service.
 *   @readonly
 */
core.Service = inherit({
  /**
   * Create a new service object with a configuration object
   *
   * @param config [map] a map of configuration options
   */
  constructor: function Service(config) {
    if (!this.loadServiceClass) {
      throw core.util.error(new Error(),
        'Service must be constructed with `new\' operator');
    }
    var ServiceClass = this.loadServiceClass(config || {});
    if (ServiceClass) {
      var originalConfig = core.util.copy(config);
      var svc = new ServiceClass(config);
      Object.defineProperty(svc, '_originalConfig', {
        get: function() { return originalConfig; },
        enumerable: false,
        configurable: true
      });
      svc._clientId = ++clientCount;
      return svc;
    }
    this.initialize(config);
  },

  /**
   * @api private
   */
  initialize: function initialize(config) {
    var svcConfig = core.config[this.serviceIdentifier];

    this.config = new core.Config(core.config);
    if (svcConfig) this.config.update(svcConfig, true);
    if (config) this.config.update(config, true);

    this.validateService();
    if (!this.config.endpoint) region_config(this);

    this.config.endpoint = this.endpointFromTemplate(this.config.endpoint);
    this.setEndpoint(this.config.endpoint);
  },

  /**
   * @api private
   */
  validateService: function validateService() {
  },

  /**
   * @api private
   */
  loadServiceClass: function loadServiceClass(serviceConfig) {
    var config = serviceConfig;
    if (!core.util.isEmpty(this.api)) {
      return null;
    } else if (config.apiConfig) {
      return core.Service.defineServiceApi(this.constructor, config.apiConfig);
    } else if (!this.constructor.services) {
      return null;
    } else {
      config = new core.Config(core.config);
      config.update(serviceConfig, true);
      var version = config.apiVersions[this.constructor.serviceIdentifier];
      version = version || config.apiVersion;
      return this.getLatestServiceClass(version);
    }
  },

  /**
   * @api private
   */
  getLatestServiceClass: function getLatestServiceClass(version) {
    version = this.getLatestServiceVersion(version);
    if (this.constructor.services[version] === null) {
      core.Service.defineServiceApi(this.constructor, version);
    }

    return this.constructor.services[version];
  },

  /**
   * @api private
   */
  getLatestServiceVersion: function getLatestServiceVersion(version) {
    if (!this.constructor.services || this.constructor.services.length === 0) {
      throw new Error('No services defined on ' +
                      this.constructor.serviceIdentifier);
    }

    if (!version) {
      version = 'latest';
    } else if (core.util.isType(version, Date)) {
      version = core.util.date.iso8601(version).split('T')[0];
    }

    if (Object.hasOwnProperty(this.constructor.services, version)) {
      return version;
    }

    var keys = Object.keys(this.constructor.services).sort();
    var selectedVersion = null;
    for (var i = keys.length - 1; i >= 0; i--) {
      // versions that end in "*" are not available on disk and can be
      // skipped, so do not choose these as selectedVersions
      if (keys[i][keys[i].length - 1] !== '*') {
        selectedVersion = keys[i];
      }
      if (keys[i].substr(0, 10) <= version) {
        return selectedVersion;
      }
    }

    throw new Error('Could not find ' + this.constructor.serviceIdentifier +
                    ' API to satisfy version constraint `' + version + '\'');
  },

  /**
   * @api private
   */
  api: {},

  /**
   * @api private
   */
  defaultRetryCount: 3,

  /**
   * @api private
   */
  customizeRequests: function customizeRequests(callback) {
    if (!callback) {
      this.customRequestHandler = null;
    } else if (typeof callback === 'function') {
      this.customRequestHandler = callback;
    } else {
      throw new Error('Invalid callback type \'' + typeof callback + '\' provided in customizeRequests');
    }
  },

  /**
   * Calls an operation on a service with the given input parameters.
   *
   * @param operation [String] the name of the operation to call on the service.
   * @param params [map] a map of input options for the operation
   * @callback callback function(err, data)
   *   If a callback is supplied, it is called when a response is returned
   *   from the service.
   *   @param err [Error] the error object returned from the request.
   *     Set to `null` if the request is successful.
   *   @param data [Object] the de-serialized data returned from
   *     the request. Set to `null` if a request error occurs.
   */
  makeRequest: function makeRequest(operation, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = null;
    }

    params = params || {};
    if (this.config.params) { // copy only toplevel bound params
      var rules = this.api.operations[operation];
      if (rules) {
        params = core.util.copy(params);
        core.util.each(this.config.params, function(key, value) {
          if (rules.input.members[key]) {
            if (params[key] === undefined || params[key] === null) {
              params[key] = value;
            }
          }
        });
      }
    }

    var request = new core.Request(this, operation, params);
    this.addAllRequestListeners(request);

    if (callback) request.send(callback);
    return request;
  },

  /**
   * Calls an operation on a service with the given input parameters, without
   * any authentication data. This method is useful for "public" API operations.
   *
   * @param operation [String] the name of the operation to call on the service.
   * @param params [map] a map of input options for the operation
   * @callback callback function(err, data)
   *   If a callback is supplied, it is called when a response is returned
   *   from the service.
   *   @param err [Error] the error object returned from the request.
   *     Set to `null` if the request is successful.
   *   @param data [Object] the de-serialized data returned from
   *     the request. Set to `null` if a request error occurs.
   */
  makeUnauthenticatedRequest: function makeUnauthenticatedRequest(operation, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = {};
    }

    var request = this.makeRequest(operation, params).toUnauthenticated();
    return callback ? request.send(callback) : request;
  },

  /**
   * Waits for a given state
   *
   * @param state [String] the state on the service to wait for
   * @param params [map] a map of parameters to pass with each request
   * @option params $waiter [map] a map of configuration options for the waiter
   * @option params $waiter.delay [Number] The number of seconds to wait between
   *                                       requests
   * @option params $waiter.maxAttempts [Number] The maximum number of requests
   *                                             to send while waiting
   * @callback callback function(err, data)
   *   If a callback is supplied, it is called when a response is returned
   *   from the service.
   *   @param err [Error] the error object returned from the request.
   *     Set to `null` if the request is successful.
   *   @param data [Object] the de-serialized data returned from
   *     the request. Set to `null` if a request error occurs.
   */
  waitFor: function waitFor(state, params, callback) {
    var waiter = new core.ResourceWaiter(this, state);
    return waiter.wait(params, callback);
  },

  /**
   * @api private
   */
  addAllRequestListeners: function addAllRequestListeners(request) {
    var list = [core.events, core.EventListeners.Core, this.serviceInterface(),
                core.EventListeners.CorePost];
    for (var i = 0; i < list.length; i++) {
      if (list[i]) request.addListeners(list[i]);
    }

    // disable parameter validation
    if (!this.config.paramValidation) {
      request.removeListener('validate',
        core.EventListeners.Core.VALIDATE_PARAMETERS);
    }

    if (this.config.logger) { // add logging events
      request.addListeners(core.EventListeners.Logger);
    }

    this.setupRequestListeners(request);
    // call prototype's customRequestHandler
    if (typeof this.constructor.prototype.customRequestHandler === 'function') {
      this.constructor.prototype.customRequestHandler(request);
    }
    // call instance's customRequestHandler
    if (Object.prototype.hasOwnProperty.call(this, 'customRequestHandler') && typeof this.customRequestHandler === 'function') {
      this.customRequestHandler(request);
    }
  },

  /**
   * Override this method to setup any custom request listeners for each
   * new request to the service.
   *
   * @abstract
   */
  setupRequestListeners: function setupRequestListeners() {
  },

  /**
   * Gets the signer class for a given request
   * @api private
   */
  getSignerClass: function getSignerClass(request) {
    var version;
    // get operation authtype if present
    var operation = null;
    var authtype = '';
    if (request) {
      var operations = request.service.api.operations || {};
      operation = operations[request.operation] || null;
      authtype = operation ? operation.authtype : '';
    }
    if (this.config.signatureVersion) {
      version = this.config.signatureVersion;
    } else if (authtype === 'v4' || authtype === 'v4-unsigned-body') {
      version = 'v4';
    } else {
      version = this.api.signatureVersion;
    }
    return core.Signers.RequestSigner.getVersion(version);
  },

  /**
   * @api private
   */
  serviceInterface: function serviceInterface() {
    switch (this.api.protocol) {
      case 'ec2': return core.EventListeners.Query;
      case 'query': return core.EventListeners.Query;
      case 'json': return core.EventListeners.Json;
      case 'rest-json': return core.EventListeners.RestJson;
      case 'rest-xml': return core.EventListeners.RestXml;
    }
    if (this.api.protocol) {
      throw new Error('Invalid service `protocol\' ' +
        this.api.protocol + ' in API config');
    }
  },

  /**
   * @api private
   */
  successfulResponse: function successfulResponse(resp) {
    return resp.httpResponse.statusCode < 300;
  },

  /**
   * How many times a failed request should be retried before giving up.
   * the defaultRetryCount can be overriden by service classes.
   *
   * @api private
   */
  numRetries: function numRetries() {
    if (this.config.maxRetries !== undefined) {
      return this.config.maxRetries;
    } else {
      return this.defaultRetryCount;
    }
  },

  /**
   * @api private
   */
  retryDelays: function retryDelays(retryCount) {
    return core.util.calculateRetryDelay(retryCount, this.config.retryDelayOptions);
  },

  /**
   * @api private
   */
  retryableError: function retryableError(error) {
    if (this.timeoutError(error)) return true;
    if (this.networkingError(error)) return true;
    if (this.expiredCredentialsError(error)) return true;
    if (this.throttledError(error)) return true;
    if (error.statusCode >= 500) return true;
    return false;
  },

  /**
   * @api private
   */
  networkingError: function networkingError(error) {
    return error.code === 'NetworkingError';
  },

  /**
   * @api private
   */
  timeoutError: function timeoutError(error) {
    return error.code === 'TimeoutError';
  },

  /**
   * @api private
   */
  expiredCredentialsError: function expiredCredentialsError(error) {
    // TODO : this only handles *one* of the expired credential codes
    return (error.code === 'ExpiredTokenException');
  },

  /**
   * @api private
   */
  clockSkewError: function clockSkewError(error) {
    switch (error.code) {
      case 'RequestTimeTooSkewed':
      case 'RequestExpired':
      case 'InvalidSignatureException':
      case 'SignatureDoesNotMatch':
      case 'AuthFailure':
      case 'RequestInTheFuture':
        return true;
      default: return false;
    }
  },

  /**
   * @api private
   */
  getSkewCorrectedDate: function getSkewCorrectedDate() {
    return new Date(Date.now() + this.config.systemClockOffset);
  },

  /**
   * @api private
   */
  applyClockOffset: function applyClockOffset(newServerTime) {
    if (newServerTime) {
      this.config.systemClockOffset = newServerTime - Date.now();
    }
  },

  /**
   * @api private
   */
  isClockSkewed: function isClockSkewed(newServerTime) {
    if (newServerTime) {
      return Math.abs(this.getSkewCorrectedDate().getTime() - newServerTime) >= 30000;
    }
  },

  /**
   * @api private
   */
  throttledError: function throttledError(error) {
    // this logic varies between services
    switch (error.code) {
      case 'ProvisionedThroughputExceededException':
      case 'Throttling':
      case 'ThrottlingException':
      case 'RequestLimitExceeded':
      case 'RequestThrottled':
        return true;
      default:
        return false;
    }
  },

  /**
   * @api private
   */
  endpointFromTemplate: function endpointFromTemplate(endpoint) {
    if (typeof endpoint !== 'string') return endpoint;

    var e = endpoint;
    e = e.replace(/\{service\}/g, this.api.endpointPrefix);
    e = e.replace(/\{region\}/g, this.config.region);
    e = e.replace(/\{scheme\}/g, this.config.sslEnabled ? 'https' : 'http');
    return e;
  },

  /**
   * @api private
   */
  setEndpoint: function setEndpoint(endpoint) {
    this.endpoint = new core.Endpoint(endpoint, this.config);
  },

  /**
   * @api private
   */
  paginationConfig: function paginationConfig(operation, throwException) {
    var paginator = this.api.operations[operation].paginator;
    if (!paginator) {
      if (throwException) {
        var e = new Error();
        throw core.util.error(e, 'No pagination configuration for ' + operation);
      }
      return null;
    }

    return paginator;
  }
});

core.util.update(core.Service, {

  /**
   * Adds one method for each operation described in the api configuration
   *
   * @api private
   */
  defineMethods: function defineMethods(svc) {
    core.util.each(svc.prototype.api.operations, function iterator(method) {
      if (svc.prototype[method]) return;
      var operation = svc.prototype.api.operations[method];
      if (operation.authtype === 'none') {
        svc.prototype[method] = function (params, callback) {
          return this.makeUnauthenticatedRequest(method, params, callback);
        };
      } else {
        svc.prototype[method] = function (params, callback) {
          return this.makeRequest(method, params, callback);
        };
      }
    });
  },

  /**
   * Defines a new Service class using a service identifier and list of versions
   * including an optional set of features (functions) to apply to the class
   * prototype.
   *
   * @param serviceIdentifier [String] the identifier for the service
   * @param versions [Array<String>] a list of versions that work with this
   *   service
   * @param features [Object] an object to attach to the prototype
   * @return [Class<Service>] the service class defined by this function.
   */
  defineService: function defineService(serviceIdentifier, versions, features) {
    core.Service._serviceMap[serviceIdentifier] = true;
    if (!Array.isArray(versions)) {
      features = versions;
      versions = [];
    }

    var svc = inherit(core.Service, features || {});

    if (typeof serviceIdentifier === 'string') {
      core.Service.addVersions(svc, versions);

      var identifier = svc.serviceIdentifier || serviceIdentifier;
      svc.serviceIdentifier = identifier;
    } else { // defineService called with an API
      svc.prototype.api = serviceIdentifier;
      core.Service.defineMethods(svc);
    }

    return svc;
  },

  /**
   * @api private
   */
  addVersions: function addVersions(svc, versions) {
    if (!Array.isArray(versions)) versions = [versions];

    svc.services = svc.services || {};
    for (var i = 0; i < versions.length; i++) {
      if (svc.services[versions[i]] === undefined) {
        svc.services[versions[i]] = null;
      }
    }

    svc.apiVersions = Object.keys(svc.services).sort();
  },

  /**
   * @api private
   */
  defineServiceApi: function defineServiceApi(superclass, version, apiConfig) {
    var svc = inherit(superclass, {
      serviceIdentifier: superclass.serviceIdentifier
    });

    function setApi(api$$1) {
      if (api$$1.isApi) {
        svc.prototype.api = api$$1;
      } else {
        svc.prototype.api = new api(api$$1);
      }
    }

    if (typeof version === 'string') {
      if (apiConfig) {
        setApi(apiConfig);
      } else {
        try {
          setApi(core.apiLoader(superclass.serviceIdentifier, version));
        } catch (err) {
          throw core.util.error(err, {
            message: 'Could not find API configuration ' +
              superclass.serviceIdentifier + '-' + version
          });
        }
      }
      if (!Object.prototype.hasOwnProperty.call(superclass.services, version)) {
        superclass.apiVersions = superclass.apiVersions.concat(version).sort();
      }
      superclass.services[version] = svc;
    } else {
      setApi(version);
    }

    core.Service.defineMethods(svc);
    return svc;
  },

  /**
   * @api private
   */
  hasService: function(identifier) {
    return Object.prototype.hasOwnProperty.call(core.Service._serviceMap, identifier);
  },

  /**
   * @api private
   */
  _serviceMap: {}
});

/**
 * Represents your AWS security credentials, specifically the
 * {accessKeyId}, {secretAccessKey}, and optional {sessionToken}.
 * Creating a `Credentials` object allows you to pass around your
 * security information to configuration and service objects.
 *
 * Note that this class typically does not need to be constructed manually,
 * as the {AWS.Config} and {AWS.Service} classes both accept simple
 * options hashes with the three keys. These structures will be converted
 * into Credentials objects automatically.
 *
 * ## Expiring and Refreshing Credentials
 *
 * Occasionally credentials can expire in the middle of a long-running
 * application. In this case, the SDK will automatically attempt to
 * refresh the credentials from the storage location if the Credentials
 * class implements the {refresh} method.
 *
 * If you are implementing a credential storage location, you
 * will want to create a subclass of the `Credentials` class and
 * override the {refresh} method. This method allows credentials to be
 * retrieved from the backing store, be it a file system, database, or
 * some network storage. The method should reset the credential attributes
 * on the object.
 *
 * @!attribute expired
 *   @return [Boolean] whether the credentials have been expired and
 *     require a refresh. Used in conjunction with {expireTime}.
 * @!attribute expireTime
 *   @return [Date] a time when credentials should be considered expired. Used
 *     in conjunction with {expired}.
 * @!attribute accessKeyId
 *   @return [String] the AWS access key ID
 * @!attribute secretAccessKey
 *   @return [String] the AWS secret access key
 * @!attribute sessionToken
 *   @return [String] an optional AWS session token
 */
core.Credentials = core.util.inherit({
  /**
   * A credentials object can be created using positional arguments or an options
   * hash.
   *
   * @overload AWS.Credentials(accessKeyId, secretAccessKey, sessionToken=null)
   *   Creates a Credentials object with a given set of credential information
   *   as positional arguments.
   *   @param accessKeyId [String] the AWS access key ID
   *   @param secretAccessKey [String] the AWS secret access key
   *   @param sessionToken [String] the optional AWS session token
   *   @example Create a credentials object with AWS credentials
   *     var creds = new AWS.Credentials('akid', 'secret', 'session');
   * @overload AWS.Credentials(options)
   *   Creates a Credentials object with a given set of credential information
   *   as an options hash.
   *   @option options accessKeyId [String] the AWS access key ID
   *   @option options secretAccessKey [String] the AWS secret access key
   *   @option options sessionToken [String] the optional AWS session token
   *   @example Create a credentials object with AWS credentials
   *     var creds = new AWS.Credentials({
   *       accessKeyId: 'akid', secretAccessKey: 'secret', sessionToken: 'session'
   *     });
   */
  constructor: function Credentials() {
    // hide secretAccessKey from being displayed with util.inspect
    core.util.hideProperties(this, ['secretAccessKey']);

    this.expired = false;
    this.expireTime = null;
    if (arguments.length === 1 && typeof arguments[0] === 'object') {
      var creds = arguments[0].credentials || arguments[0];
      this.accessKeyId = creds.accessKeyId;
      this.secretAccessKey = creds.secretAccessKey;
      this.sessionToken = creds.sessionToken;
    } else {
      this.accessKeyId = arguments[0];
      this.secretAccessKey = arguments[1];
      this.sessionToken = arguments[2];
    }
  },

  /**
   * @return [Integer] the number of seconds before {expireTime} during which
   *   the credentials will be considered expired.
   */
  expiryWindow: 15,

  /**
   * @return [Boolean] whether the credentials object should call {refresh}
   * @note Subclasses should override this method to provide custom refresh
   *   logic.
   */
  needsRefresh: function needsRefresh() {
    var currentTime = core.util.date.getDate().getTime();
    var adjustedTime = new Date(currentTime + this.expiryWindow * 1000);

    if (this.expireTime && adjustedTime > this.expireTime) {
      return true;
    } else {
      return this.expired || !this.accessKeyId || !this.secretAccessKey;
    }
  },

  /**
   * Gets the existing credentials, refreshing them if they are not yet loaded
   * or have expired. Users should call this method before using {refresh},
   * as this will not attempt to reload credentials when they are already
   * loaded into the object.
   *
   * @callback callback function(err)
   *   When this callback is called with no error, it means either credentials
   *   do not need to be refreshed or refreshed credentials information has
   *   been loaded into the object (as the `accessKeyId`, `secretAccessKey`,
   *   and `sessionToken` properties).
   *   @param err [Error] if an error occurred, this value will be filled
   */
  get: function get(callback) {
    var self = this;
    if (this.needsRefresh()) {
      this.refresh(function(err) {
        if (!err) self.expired = false; // reset expired flag
        if (callback) callback(err);
      });
    } else if (callback) {
      callback();
    }
  },

  /**
   * @!method  getPromise()
   *   Returns a 'thenable' promise.
   *   Gets the existing credentials, refreshing them if they are not yet loaded
   *   or have expired. Users should call this method before using {refresh},
   *   as this will not attempt to reload credentials when they are already
   *   loaded into the object.
   *
   *   Two callbacks can be provided to the `then` method on the returned promise.
   *   The first callback will be called if the promise is fulfilled, and the second
   *   callback will be called if the promise is rejected.
   *   @callback fulfilledCallback function()
   *     Called if the promise is fulfilled. When this callback is called, it
   *     means either credentials do not need to be refreshed or refreshed
   *     credentials information has been loaded into the object (as the
   *     `accessKeyId`, `secretAccessKey`, and `sessionToken` properties).
   *   @callback rejectedCallback function(err)
   *     Called if the promise is rejected.
   *     @param err [Error] if an error occurred, this value will be filled
   *   @return [Promise] A promise that represents the state of the `get` call.
   *   @example Calling the `getPromise` method.
   *     var promise = credProvider.getPromise();
   *     promise.then(function() { ... }, function(err) { ... });
   */

  /**
   * @!method  refreshPromise()
   *   Returns a 'thenable' promise.
   *   Refreshes the credentials. Users should call {get} before attempting
   *   to forcibly refresh credentials.
   *
   *   Two callbacks can be provided to the `then` method on the returned promise.
   *   The first callback will be called if the promise is fulfilled, and the second
   *   callback will be called if the promise is rejected.
   *   @callback fulfilledCallback function()
   *     Called if the promise is fulfilled. When this callback is called, it
   *     means refreshed credentials information has been loaded into the object
   *     (as the `accessKeyId`, `secretAccessKey`, and `sessionToken` properties).
   *   @callback rejectedCallback function(err)
   *     Called if the promise is rejected.
   *     @param err [Error] if an error occurred, this value will be filled
   *   @return [Promise] A promise that represents the state of the `refresh` call.
   *   @example Calling the `refreshPromise` method.
   *     var promise = credProvider.refreshPromise();
   *     promise.then(function() { ... }, function(err) { ... });
   */

  /**
   * Refreshes the credentials. Users should call {get} before attempting
   * to forcibly refresh credentials.
   *
   * @callback callback function(err)
   *   When this callback is called with no error, it means refreshed
   *   credentials information has been loaded into the object (as the
   *   `accessKeyId`, `secretAccessKey`, and `sessionToken` properties).
   *   @param err [Error] if an error occurred, this value will be filled
   * @note Subclasses should override this class to reset the
   *   {accessKeyId}, {secretAccessKey} and optional {sessionToken}
   *   on the credentials object and then call the callback with
   *   any error information.
   * @see get
   */
  refresh: function refresh(callback) {
    this.expired = false;
    callback();
  }
});

/**
 * @api private
 */
core.Credentials.addPromisesToClass = function addPromisesToClass(PromiseDependency) {
  this.prototype.getPromise = core.util.promisifyMethod('get', PromiseDependency);
  this.prototype.refreshPromise = core.util.promisifyMethod('refresh', PromiseDependency);
};

/**
 * @api private
 */
core.Credentials.deletePromisesFromClass = function deletePromisesFromClass() {
  delete this.prototype.getPromise;
  delete this.prototype.refreshPromise;
};

core.util.addPromises(core.Credentials);

/**
 * Creates a credential provider chain that searches for AWS credentials
 * in a list of credential providers specified by the {providers} property.
 *
 * By default, the chain will use the {defaultProviders} to resolve credentials.
 * These providers will look in the environment using the
 * {AWS.EnvironmentCredentials} class with the 'AWS' and 'AMAZON' prefixes.
 *
 * ## Setting Providers
 *
 * Each provider in the {providers} list should be a function that returns
 * a {AWS.Credentials} object, or a hardcoded credentials object. The function
 * form allows for delayed execution of the credential construction.
 *
 * ## Resolving Credentials from a Chain
 *
 * Call {resolve} to return the first valid credential object that can be
 * loaded by the provider chain.
 *
 * For example, to resolve a chain with a custom provider that checks a file
 * on disk after the set of {defaultProviders}:
 *
 * ```javascript
 * var diskProvider = new AWS.FileSystemCredentials('./creds.json');
 * var chain = new AWS.CredentialProviderChain();
 * chain.providers.push(diskProvider);
 * chain.resolve();
 * ```
 *
 * The above code will return the `diskProvider` object if the
 * file contains credentials and the `defaultProviders` do not contain
 * any credential settings.
 *
 * @!attribute providers
 *   @return [Array<AWS.Credentials, Function>]
 *     a list of credentials objects or functions that return credentials
 *     objects. If the provider is a function, the function will be
 *     executed lazily when the provider needs to be checked for valid
 *     credentials. By default, this object will be set to the
 *     {defaultProviders}.
 *   @see defaultProviders
 */
core.CredentialProviderChain = core.util.inherit(core.Credentials, {

  /**
   * Creates a new CredentialProviderChain with a default set of providers
   * specified by {defaultProviders}.
   */
  constructor: function CredentialProviderChain(providers) {
    if (providers) {
      this.providers = providers;
    } else {
      this.providers = core.CredentialProviderChain.defaultProviders.slice(0);
    }
  },

  /**
   * @!method  resolvePromise()
   *   Returns a 'thenable' promise.
   *   Resolves the provider chain by searching for the first set of
   *   credentials in {providers}.
   *
   *   Two callbacks can be provided to the `then` method on the returned promise.
   *   The first callback will be called if the promise is fulfilled, and the second
   *   callback will be called if the promise is rejected.
   *   @callback fulfilledCallback function(credentials)
   *     Called if the promise is fulfilled and the provider resolves the chain
   *     to a credentials object
   *     @param credentials [AWS.Credentials] the credentials object resolved
   *       by the provider chain.
   *   @callback rejectedCallback function(error)
   *     Called if the promise is rejected.
   *     @param err [Error] the error object returned if no credentials are found.
   *   @return [Promise] A promise that represents the state of the `resolve` method call.
   *   @example Calling the `resolvePromise` method.
   *     var promise = chain.resolvePromise();
   *     promise.then(function(credentials) { ... }, function(err) { ... });
   */

  /**
   * Resolves the provider chain by searching for the first set of
   * credentials in {providers}.
   *
   * @callback callback function(err, credentials)
   *   Called when the provider resolves the chain to a credentials object
   *   or null if no credentials can be found.
   *
   *   @param err [Error] the error object returned if no credentials are
   *     found.
   *   @param credentials [AWS.Credentials] the credentials object resolved
   *     by the provider chain.
   * @return [AWS.CredentialProviderChain] the provider, for chaining.
   */
  resolve: function resolve(callback) {
    if (this.providers.length === 0) {
      callback(new Error('No providers'));
      return this;
    }

    var index = 0;
    var providers = this.providers.slice(0);

    function resolveNext(err, creds) {
      if ((!err && creds) || index === providers.length) {
        callback(err, creds);
        return;
      }

      var provider = providers[index++];
      if (typeof provider === 'function') {
        creds = provider.call();
      } else {
        creds = provider;
      }

      if (creds.get) {
        creds.get(function(getErr) {
          resolveNext(getErr, getErr ? null : creds);
        });
      } else {
        resolveNext(null, creds);
      }
    }

    resolveNext();
    return this;
  }
});

/**
 * The default set of providers used by a vanilla CredentialProviderChain.
 *
 * In the browser:
 *
 * ```javascript
 * AWS.CredentialProviderChain.defaultProviders = []
 * ```
 *
 * In Node.js:
 *
 * ```javascript
 * AWS.CredentialProviderChain.defaultProviders = [
 *   function () { return new AWS.EnvironmentCredentials('AWS'); },
 *   function () { return new AWS.EnvironmentCredentials('AMAZON'); },
 *   function () { return new AWS.SharedIniFileCredentials(); },
 *   function () {
 *     // if AWS_CONTAINER_CREDENTIALS_RELATIVE_URI is set
 *       return new AWS.ECSCredentials();
 *     // else
 *       return new AWS.EC2MetadataCredentials();
 *   }
 * ]
 * ```
 */
core.CredentialProviderChain.defaultProviders = [];

/**
 * @api private
 */
core.CredentialProviderChain.addPromisesToClass = function addPromisesToClass(PromiseDependency) {
  this.prototype.resolvePromise = core.util.promisifyMethod('resolve', PromiseDependency);
};

/**
 * @api private
 */
core.CredentialProviderChain.deletePromisesFromClass = function deletePromisesFromClass() {
  delete this.prototype.resolvePromise;
};

core.util.addPromises(core.CredentialProviderChain);

var PromisesDependency;

/**
 * The main configuration class used by all service objects to set
 * the region, credentials, and other options for requests.
 *
 * By default, credentials and region settings are left unconfigured.
 * This should be configured by the application before using any
 * AWS service APIs.
 *
 * In order to set global configuration options, properties should
 * be assigned to the global {AWS.config} object.
 *
 * @see AWS.config
 *
 * @!group General Configuration Options
 *
 * @!attribute credentials
 *   @return [AWS.Credentials] the AWS credentials to sign requests with.
 *
 * @!attribute region
 *   @example Set the global region setting to us-west-2
 *     AWS.config.update({region: 'us-west-2'});
 *   @return [AWS.Credentials] The region to send service requests to.
 *   @see http://docs.amazonwebservices.com/general/latest/gr/rande.html
 *     A list of available endpoints for each AWS service
 *
 * @!attribute maxRetries
 *   @return [Integer] the maximum amount of retries to perform for a
 *     service request. By default this value is calculated by the specific
 *     service object that the request is being made to.
 *
 * @!attribute maxRedirects
 *   @return [Integer] the maximum amount of redirects to follow for a
 *     service request. Defaults to 10.
 *
 * @!attribute paramValidation
 *   @return [Boolean|map] whether input parameters should be validated against
 *     the operation description before sending the request. Defaults to true.
 *     Pass a map to enable any of the following specific validation features:
 *
 *     * **min** [Boolean] &mdash; Validates that a value meets the min
 *       constraint. This is enabled by default when paramValidation is set
 *       to `true`.
 *     * **max** [Boolean] &mdash; Validates that a value meets the max
 *       constraint.
 *     * **pattern** [Boolean] &mdash; Validates that a string value matches a
 *       regular expression.
 *     * **enum** [Boolean] &mdash; Validates that a string value matches one
 *       of the allowable enum values.
 *
 * @!attribute computeChecksums
 *   @return [Boolean] whether to compute checksums for payload bodies when
 *     the service accepts it (currently supported in S3 only).
 *
 * @!attribute convertResponseTypes
 *   @return [Boolean] whether types are converted when parsing response data.
 *     Currently only supported for JSON based services. Turning this off may
 *     improve performance on large response payloads. Defaults to `true`.
 *
 * @!attribute correctClockSkew
 *   @return [Boolean] whether to apply a clock skew correction and retry
 *     requests that fail because of an skewed client clock. Defaults to
 *     `false`.
 *
 * @!attribute sslEnabled
 *   @return [Boolean] whether SSL is enabled for requests
 *
 * @!attribute s3ForcePathStyle
 *   @return [Boolean] whether to force path style URLs for S3 objects
 *
 * @!attribute s3BucketEndpoint
 *   @note Setting this configuration option requires an `endpoint` to be
 *     provided explicitly to the service constructor.
 *   @return [Boolean] whether the provided endpoint addresses an individual
 *     bucket (false if it addresses the root API endpoint).
 *
 * @!attribute s3DisableBodySigning
 *   @return [Boolean] whether to disable S3 body signing when using signature version `v4`.
 *     Body signing can only be disabled when using https. Defaults to `true`.
 *
 * @!attribute useAccelerateEndpoint
 *   @note This configuration option is only compatible with S3 while accessing
 *     dns-compatible buckets.
 *   @return [Boolean] Whether to use the Accelerate endpoint with the S3 service.
 *     Defaults to `false`.
 *
 * @!attribute retryDelayOptions
 *   @example Set the base retry delay for all services to 300 ms
 *     AWS.config.update({retryDelayOptions: {base: 300}});
 *     // Delays with maxRetries = 3: 300, 600, 1200
 *   @example Set a custom backoff function to provide delay values on retries
 *     AWS.config.update({retryDelayOptions: {customBackoff: function(retryCount) {
 *       // returns delay in ms
 *     }}});
 *   @return [map] A set of options to configure the retry delay on retryable errors.
 *     Currently supported options are:
 *
 *     * **base** [Integer] &mdash; The base number of milliseconds to use in the
 *       exponential backoff for operation retries. Defaults to 100 ms for all services except
 *       DynamoDB, where it defaults to 50ms.
 *     * **customBackoff ** [function] &mdash; A custom function that accepts a retry count
 *       and returns the amount of time to delay in milliseconds. The `base` option will be
 *       ignored if this option is supplied.
 *
 * @!attribute httpOptions
 *   @return [map] A set of options to pass to the low-level HTTP request.
 *     Currently supported options are:
 *
 *     * **proxy** [String] &mdash; the URL to proxy requests through
 *     * **agent** [http.Agent, https.Agent] &mdash; the Agent object to perform
 *       HTTP requests with. Used for connection pooling. Defaults to the global
 *       agent (`http.globalAgent`) for non-SSL connections. Note that for
 *       SSL connections, a special Agent object is used in order to enable
 *       peer certificate verification. This feature is only supported in the
 *       Node.js environment.
 *     * **connectTimeout** [Integer] &mdash; Sets the socket to timeout after
 *       failing to establish a connection with the server after
 *       `connectTimeout` milliseconds. This timeout has no effect once a socket
 *       connection has been established.
 *     * **timeout** [Integer] &mdash; Sets the socket to timeout after timeout
 *       milliseconds of inactivity on the socket. Defaults to two minutes
 *       (120000)
 *     * **xhrAsync** [Boolean] &mdash; Whether the SDK will send asynchronous
 *       HTTP requests. Used in the browser environment only. Set to false to
 *       send requests synchronously. Defaults to true (async on).
 *     * **xhrWithCredentials** [Boolean] &mdash; Sets the "withCredentials"
 *       property of an XMLHttpRequest object. Used in the browser environment
 *       only. Defaults to false.
 * @!attribute logger
 *   @return [#write,#log] an object that responds to .write() (like a stream)
 *     or .log() (like the console object) in order to log information about
 *     requests
 *
 * @!attribute systemClockOffset
 *   @return [Number] an offset value in milliseconds to apply to all signing
 *     times. Use this to compensate for clock skew when your system may be
 *     out of sync with the service time. Note that this configuration option
 *     can only be applied to the global `AWS.config` object and cannot be
 *     overridden in service-specific configuration. Defaults to 0 milliseconds.
 *
 * @!attribute signatureVersion
 *   @return [String] the signature version to sign requests with (overriding
 *     the API configuration). Possible values are: 'v2', 'v3', 'v4'.
 *
 * @!attribute signatureCache
 *   @return [Boolean] whether the signature to sign requests with (overriding
 *     the API configuration) is cached. Only applies to the signature version 'v4'.
 *     Defaults to `true`.
 */
core.Config = core.util.inherit({
  /**
   * @!endgroup
   */

  /**
   * Creates a new configuration object. This is the object that passes
   * option data along to service requests, including credentials, security,
   * region information, and some service specific settings.
   *
   * @example Creating a new configuration object with credentials and region
   *   var config = new AWS.Config({
   *     accessKeyId: 'AKID', secretAccessKey: 'SECRET', region: 'us-west-2'
   *   });
   * @option options accessKeyId [String] your AWS access key ID.
   * @option options secretAccessKey [String] your AWS secret access key.
   * @option options sessionToken [AWS.Credentials] the optional AWS
   *   session token to sign requests with.
   * @option options credentials [AWS.Credentials] the AWS credentials
   *   to sign requests with. You can either specify this object, or
   *   specify the accessKeyId and secretAccessKey options directly.
   * @option options credentialProvider [AWS.CredentialProviderChain] the
   *   provider chain used to resolve credentials if no static `credentials`
   *   property is set.
   * @option options region [String] the region to send service requests to.
   *   See {region} for more information.
   * @option options maxRetries [Integer] the maximum amount of retries to
   *   attempt with a request. See {maxRetries} for more information.
   * @option options maxRedirects [Integer] the maximum amount of redirects to
   *   follow with a request. See {maxRedirects} for more information.
   * @option options sslEnabled [Boolean] whether to enable SSL for
   *   requests.
   * @option options paramValidation [Boolean|map] whether input parameters
   *   should be validated against the operation description before sending
   *   the request. Defaults to true. Pass a map to enable any of the
   *   following specific validation features:
   *
   *   * **min** [Boolean] &mdash; Validates that a value meets the min
   *     constraint. This is enabled by default when paramValidation is set
   *     to `true`.
   *   * **max** [Boolean] &mdash; Validates that a value meets the max
   *     constraint.
   *   * **pattern** [Boolean] &mdash; Validates that a string value matches a
   *     regular expression.
   *   * **enum** [Boolean] &mdash; Validates that a string value matches one
   *     of the allowable enum values.
   * @option options computeChecksums [Boolean] whether to compute checksums
   *   for payload bodies when the service accepts it (currently supported
   *   in S3 only)
   * @option options convertResponseTypes [Boolean] whether types are converted
   *     when parsing response data. Currently only supported for JSON based
   *     services. Turning this off may improve performance on large response
   *     payloads. Defaults to `true`.
   * @option options correctClockSkew [Boolean] whether to apply a clock skew
   *     correction and retry requests that fail because of an skewed client
   *     clock. Defaults to `false`.
   * @option options s3ForcePathStyle [Boolean] whether to force path
   *   style URLs for S3 objects.
   * @option options s3BucketEndpoint [Boolean] whether the provided endpoint
   *   addresses an individual bucket (false if it addresses the root API
   *   endpoint). Note that setting this configuration option requires an
   *   `endpoint` to be provided explicitly to the service constructor.
   * @option options s3DisableBodySigning [Boolean] whether S3 body signing
   *   should be disabled when using signature version `v4`. Body signing
   *   can only be disabled when using https. Defaults to `true`.
   *
   * @option options retryDelayOptions [map] A set of options to configure
   *   the retry delay on retryable errors. Currently supported options are:
   *
   *   * **base** [Integer] &mdash; The base number of milliseconds to use in the
   *     exponential backoff for operation retries. Defaults to 100 ms for all
   *     services except DynamoDB, where it defaults to 50ms.
   *   * **customBackoff ** [function] &mdash; A custom function that accepts a retry count
   *     and returns the amount of time to delay in milliseconds. The `base` option will be
   *     ignored if this option is supplied.
   * @option options httpOptions [map] A set of options to pass to the low-level
   *   HTTP request. Currently supported options are:
   *
   *   * **proxy** [String] &mdash; the URL to proxy requests through
   *   * **agent** [http.Agent, https.Agent] &mdash; the Agent object to perform
   *     HTTP requests with. Used for connection pooling. Defaults to the global
   *     agent (`http.globalAgent`) for non-SSL connections. Note that for
   *     SSL connections, a special Agent object is used in order to enable
   *     peer certificate verification. This feature is only available in the
   *     Node.js environment.
   *   * **connectTimeout** [Integer] &mdash; Sets the socket to timeout after
   *     failing to establish a connection with the server after
   *     `connectTimeout` milliseconds. This timeout has no effect once a socket
   *     connection has been established.
   *   * **timeout** [Integer] &mdash; Sets the socket to timeout after timeout
   *     milliseconds of inactivity on the socket. Defaults to two minutes
   *     (120000).
   *   * **xhrAsync** [Boolean] &mdash; Whether the SDK will send asynchronous
   *     HTTP requests. Used in the browser environment only. Set to false to
   *     send requests synchronously. Defaults to true (async on).
   *   * **xhrWithCredentials** [Boolean] &mdash; Sets the "withCredentials"
   *     property of an XMLHttpRequest object. Used in the browser environment
   *     only. Defaults to false.
   * @option options apiVersion [String, Date] a String in YYYY-MM-DD format
   *   (or a date) that represents the latest possible API version that can be
   *   used in all services (unless overridden by `apiVersions`). Specify
   *   'latest' to use the latest possible version.
   * @option options apiVersions [map<String, String|Date>] a map of service
   *   identifiers (the lowercase service class name) with the API version to
   *   use when instantiating a service. Specify 'latest' for each individual
   *   that can use the latest available version.
   * @option options logger [#write,#log] an object that responds to .write()
   *   (like a stream) or .log() (like the console object) in order to log
   *   information about requests
   * @option options systemClockOffset [Number] an offset value in milliseconds
   *   to apply to all signing times. Use this to compensate for clock skew
   *   when your system may be out of sync with the service time. Note that
   *   this configuration option can only be applied to the global `AWS.config`
   *   object and cannot be overridden in service-specific configuration.
   *   Defaults to 0 milliseconds.
   * @option options signatureVersion [String] the signature version to sign
   *   requests with (overriding the API configuration). Possible values are:
   *   'v2', 'v3', 'v4'.
   * @option options signatureCache [Boolean] whether the signature to sign
   *   requests with (overriding the API configuration) is cached. Only applies
   *   to the signature version 'v4'. Defaults to `true`.
   * @option options dynamoDbCrc32 [Boolean] whether to validate the CRC32
   *   checksum of HTTP response bodies returned by DynamoDB. Default: `true`.
   */
  constructor: function Config(options) {
    if (options === undefined) options = {};
    options = this.extractCredentials(options);

    core.util.each.call(this, this.keys, function (key, value) {
      this.set(key, options[key], value);
    });
  },

  /**
   * @!group Managing Credentials
   */

  /**
   * Loads credentials from the configuration object. This is used internally
   * by the SDK to ensure that refreshable {Credentials} objects are properly
   * refreshed and loaded when sending a request. If you want to ensure that
   * your credentials are loaded prior to a request, you can use this method
   * directly to provide accurate credential data stored in the object.
   *
   * @note If you configure the SDK with static or environment credentials,
   *   the credential data should already be present in {credentials} attribute.
   *   This method is primarily necessary to load credentials from asynchronous
   *   sources, or sources that can refresh credentials periodically.
   * @example Getting your access key
   *   AWS.config.getCredentials(function(err) {
   *     if (err) console.log(err.stack); // credentials not loaded
   *     else console.log("Access Key:", AWS.config.credentials.accessKeyId);
   *   })
   * @callback callback function(err)
   *   Called when the {credentials} have been properly set on the configuration
   *   object.
   *
   *   @param err [Error] if this is set, credentials were not successfully
   *     loaded and this error provides information why.
   * @see credentials
   * @see Credentials
   */
  getCredentials: function getCredentials(callback) {
    var self = this;

    function finish(err) {
      callback(err, err ? null : self.credentials);
    }

    function credError(msg, err) {
      return new core.util.error(err || new Error(), {
        code: 'CredentialsError',
        message: msg,
        name: 'CredentialsError'
      });
    }

    function getAsyncCredentials() {
      self.credentials.get(function(err) {
        if (err) {
          var msg = 'Could not load credentials from ' +
            self.credentials.constructor.name;
          err = credError(msg, err);
        }
        finish(err);
      });
    }

    function getStaticCredentials() {
      var err = null;
      if (!self.credentials.accessKeyId || !self.credentials.secretAccessKey) {
        err = credError('Missing credentials');
      }
      finish(err);
    }

    if (self.credentials) {
      if (typeof self.credentials.get === 'function') {
        getAsyncCredentials();
      } else { // static credentials
        getStaticCredentials();
      }
    } else if (self.credentialProvider) {
      self.credentialProvider.resolve(function(err, creds) {
        if (err) {
          err = credError('Could not load credentials from any providers', err);
        }
        self.credentials = creds;
        finish(err);
      });
    } else {
      finish(credError('No credentials to load'));
    }
  },

  /**
   * @!group Loading and Setting Configuration Options
   */

  /**
   * @overload update(options, allowUnknownKeys = false)
   *   Updates the current configuration object with new options.
   *
   *   @example Update maxRetries property of a configuration object
   *     config.update({maxRetries: 10});
   *   @param [Object] options a map of option keys and values.
   *   @param [Boolean] allowUnknownKeys whether unknown keys can be set on
   *     the configuration object. Defaults to `false`.
   *   @see constructor
   */
  update: function update(options, allowUnknownKeys) {
    allowUnknownKeys = allowUnknownKeys || false;
    options = this.extractCredentials(options);
    core.util.each.call(this, options, function (key, value) {
      if (allowUnknownKeys || Object.prototype.hasOwnProperty.call(this.keys, key) ||
          core.Service.hasService(key)) {
        this.set(key, value);
      }
    });
  },

  /**
   * Loads configuration data from a JSON file into this config object.
   * @note Loading configuration will reset all existing configuration
   *   on the object.
   * @!macro nobrowser
   * @param path [String] the path relative to your process's current
   *    working directory to load configuration from.
   * @return [AWS.Config] the same configuration object
   */
  loadFromPath: function loadFromPath(path$$1) {
    this.clear();

    var options = JSON.parse(core.util.readFileSync(path$$1));
    var fileSystemCreds = new core.FileSystemCredentials(path$$1);
    var chain = new core.CredentialProviderChain();
    chain.providers.unshift(fileSystemCreds);
    chain.resolve(function (err, creds) {
      if (err) throw err;
      else options.credentials = creds;
    });

    this.constructor(options);

    return this;
  },

  /**
   * Clears configuration data on this object
   *
   * @api private
   */
  clear: function clear() {
    /*jshint forin:false */
    core.util.each.call(this, this.keys, function (key) {
      delete this[key];
    });

    // reset credential provider
    this.set('credentials', undefined);
    this.set('credentialProvider', undefined);
  },

  /**
   * Sets a property on the configuration object, allowing for a
   * default value
   * @api private
   */
  set: function set(property, value, defaultValue) {
    if (value === undefined) {
      if (defaultValue === undefined) {
        defaultValue = this.keys[property];
      }
      if (typeof defaultValue === 'function') {
        this[property] = defaultValue.call(this);
      } else {
        this[property] = defaultValue;
      }
    } else if (property === 'httpOptions' && this[property]) {
      // deep merge httpOptions
      this[property] = core.util.merge(this[property], value);
    } else {
      this[property] = value;
    }
  },

  /**
   * All of the keys with their default values.
   *
   * @constant
   * @api private
   */
  keys: {
    credentials: null,
    credentialProvider: null,
    region: null,
    logger: null,
    apiVersions: {},
    apiVersion: null,
    endpoint: undefined,
    httpOptions: {
      timeout: 120000
    },
    maxRetries: undefined,
    maxRedirects: 10,
    paramValidation: true,
    sslEnabled: true,
    s3ForcePathStyle: false,
    s3BucketEndpoint: false,
    s3DisableBodySigning: true,
    computeChecksums: true,
    convertResponseTypes: true,
    correctClockSkew: false,
    customUserAgent: null,
    dynamoDbCrc32: true,
    systemClockOffset: 0,
    signatureVersion: null,
    signatureCache: true,
    retryDelayOptions: {},
    useAccelerateEndpoint: false
  },

  /**
   * Extracts accessKeyId, secretAccessKey and sessionToken
   * from a configuration hash.
   *
   * @api private
   */
  extractCredentials: function extractCredentials(options) {
    if (options.accessKeyId && options.secretAccessKey) {
      options = core.util.copy(options);
      options.credentials = new core.Credentials(options);
    }
    return options;
  },

  /**
   * Sets the promise dependency the SDK will use wherever Promises are returned.
   * Passing `null` will force the SDK to use native Promises if they are available.
   * If native Promises are not available, passing `null` will have no effect.
   * @param [Constructor] dep A reference to a Promise constructor
   */
  setPromisesDependency: function setPromisesDependency(dep) {
    PromisesDependency = dep;
    // if null was passed in, we should try to use native promises
    if (dep === null && typeof Promise === 'function') {
      PromisesDependency = Promise;
    }
    var constructors = [core.Request, core.Credentials, core.CredentialProviderChain];
    if (core.S3 && core.S3.ManagedUpload) constructors.push(core.S3.ManagedUpload);
    core.util.addPromises(constructors, PromisesDependency);
  },

  /**
   * Gets the promise dependency set by `AWS.config.setPromisesDependency`.
   */
  getPromisesDependency: function getPromisesDependency() {
    return PromisesDependency;
  }
});

/**
 * @return [AWS.Config] The global configuration object singleton instance
 * @readonly
 * @see AWS.Config
 */
core.config = new core.Config();

var inherit$1 = core.util.inherit;

/**
 * The endpoint that a service will talk to, for example,
 * `'https://ec2.ap-southeast-1.amazonaws.com'`. If
 * you need to override an endpoint for a service, you can
 * set the endpoint on a service by passing the endpoint
 * object with the `endpoint` option key:
 *
 * ```javascript
 * var ep = new AWS.Endpoint('awsproxy.example.com');
 * var s3 = new AWS.S3({endpoint: ep});
 * s3.service.endpoint.hostname == 'awsproxy.example.com'
 * ```
 *
 * Note that if you do not specify a protocol, the protocol will
 * be selected based on your current {AWS.config} configuration.
 *
 * @!attribute protocol
 *   @return [String] the protocol (http or https) of the endpoint
 *     URL
 * @!attribute hostname
 *   @return [String] the host portion of the endpoint, e.g.,
 *     example.com
 * @!attribute host
 *   @return [String] the host portion of the endpoint including
 *     the port, e.g., example.com:80
 * @!attribute port
 *   @return [Integer] the port of the endpoint
 * @!attribute href
 *   @return [String] the full URL of the endpoint
 */
core.Endpoint = inherit$1({

  /**
   * @overload Endpoint(endpoint)
   *   Constructs a new endpoint given an endpoint URL. If the
   *   URL omits a protocol (http or https), the default protocol
   *   set in the global {AWS.config} will be used.
   *   @param endpoint [String] the URL to construct an endpoint from
   */
  constructor: function Endpoint(endpoint, config) {
    core.util.hideProperties(this, ['slashes', 'auth', 'hash', 'search', 'query']);

    if (typeof endpoint === 'undefined' || endpoint === null) {
      throw new Error('Invalid endpoint: ' + endpoint);
    } else if (typeof endpoint !== 'string') {
      return core.util.copy(endpoint);
    }

    if (!endpoint.match(/^http/)) {
      var useSSL = config && config.sslEnabled !== undefined ?
        config.sslEnabled : core.config.sslEnabled;
      endpoint = (useSSL ? 'https' : 'http') + '://' + endpoint;
    }

    core.util.update(this, core.util.urlParse(endpoint));

    // Ensure the port property is set as an integer
    if (this.port) {
      this.port = parseInt(this.port, 10);
    } else {
      this.port = this.protocol === 'https:' ? 443 : 80;
    }
  }

});

/**
 * The low level HTTP request object, encapsulating all HTTP header
 * and body data sent by a service request.
 *
 * @!attribute method
 *   @return [String] the HTTP method of the request
 * @!attribute path
 *   @return [String] the path portion of the URI, e.g.,
 *     "/list/?start=5&num=10"
 * @!attribute headers
 *   @return [map<String,String>]
 *     a map of header keys and their respective values
 * @!attribute body
 *   @return [String] the request body payload
 * @!attribute endpoint
 *   @return [AWS.Endpoint] the endpoint for the request
 * @!attribute region
 *   @api private
 *   @return [String] the region, for signing purposes only.
 */
core.HttpRequest = inherit$1({

  /**
   * @api private
   */
  constructor: function HttpRequest(endpoint, region) {
    endpoint = new core.Endpoint(endpoint);
    this.method = 'POST';
    this.path = endpoint.path || '/';
    this.headers = {};
    this.body = '';
    this.endpoint = endpoint;
    this.region = region;
    this._userAgent = '';
    this.setUserAgent();
  },

  /**
   * @api private
   */
  setUserAgent: function setUserAgent() {
    this._userAgent = this.headers[this.getUserAgentHeaderName()] = core.util.userAgent();
  },

  getUserAgentHeaderName: function getUserAgentHeaderName() {
    var prefix = core.util.isBrowser() ? 'X-Amz-' : '';
    return prefix + 'User-Agent';
  },

  /**
   * @api private
   */
  appendToUserAgent: function appendToUserAgent(agentPartial) {
    if (typeof agentPartial === 'string' && agentPartial) {
      this._userAgent += ' ' + agentPartial;
    }
    this.headers[this.getUserAgentHeaderName()] = this._userAgent;
  },

  /**
   * @api private
   */
  getUserAgent: function getUserAgent() {
    return this._userAgent;
  },

  /**
   * @return [String] the part of the {path} excluding the
   *   query string
   */
  pathname: function pathname() {
    return this.path.split('?', 1)[0];
  },

  /**
   * @return [String] the query string portion of the {path}
   */
  search: function search() {
    var query = this.path.split('?', 2)[1];
    if (query) {
      query = core.util.queryStringParse(query);
      return core.util.queryParamsToString(query);
    }
    return '';
  }

});

/**
 * The low level HTTP response object, encapsulating all HTTP header
 * and body data returned from the request.
 *
 * @!attribute statusCode
 *   @return [Integer] the HTTP status code of the response (e.g., 200, 404)
 * @!attribute headers
 *   @return [map<String,String>]
 *      a map of response header keys and their respective values
 * @!attribute body
 *   @return [String] the response body payload
 * @!attribute [r] streaming
 *   @return [Boolean] whether this response is being streamed at a low-level.
 *     Defaults to `false` (buffered reads). Do not modify this manually, use
 *     {createUnbufferedStream} to convert the stream to unbuffered mode
 *     instead.
 */
core.HttpResponse = inherit$1({

  /**
   * @api private
   */
  constructor: function HttpResponse() {
    this.statusCode = undefined;
    this.headers = {};
    this.body = undefined;
    this.streaming = false;
    this.stream = null;
  },

  /**
   * Disables buffering on the HTTP response and returns the stream for reading.
   * @return [Stream, XMLHttpRequest, null] the underlying stream object.
   *   Use this object to directly read data off of the stream.
   * @note This object is only available after the {AWS.Request~httpHeaders}
   *   event has fired. This method must be called prior to
   *   {AWS.Request~httpData}.
   * @example Taking control of a stream
   *   request.on('httpHeaders', function(statusCode, headers) {
   *     if (statusCode < 300) {
   *       if (headers.etag === 'xyz') {
   *         // pipe the stream, disabling buffering
   *         var stream = this.response.httpResponse.createUnbufferedStream();
   *         stream.pipe(process.stdout);
   *       } else { // abort this request and set a better error message
   *         this.abort();
   *         this.response.error = new Error('Invalid ETag');
   *       }
   *     }
   *   }).send(console.log);
   */
  createUnbufferedStream: function createUnbufferedStream() {
    this.streaming = true;
    return this.stream;
  }
});


core.HttpClient = inherit$1({});

/**
 * @api private
 */
core.HttpClient.getInstance = function getInstance() {
  if (this.singleton === undefined) {
    this.singleton = new this();
  }
  return this.singleton;
};

/**
 * @api private
 * @!method on(eventName, callback)
 *   Registers an event listener callback for the event given by `eventName`.
 *   Parameters passed to the callback function depend on the individual event
 *   being triggered. See the event documentation for those parameters.
 *
 *   @param eventName [String] the event name to register the listener for
 *   @param callback [Function] the listener callback function
 *   @return [AWS.SequentialExecutor] the same object for chaining
 */
core.SequentialExecutor = core.util.inherit({

  constructor: function SequentialExecutor() {
    this._events = {};
  },

  /**
   * @api private
   */
  listeners: function listeners(eventName) {
    return this._events[eventName] ? this._events[eventName].slice(0) : [];
  },

  on: function on(eventName, listener) {
    if (this._events[eventName]) {
      this._events[eventName].push(listener);
    } else {
      this._events[eventName] = [listener];
    }
    return this;
  },

  /**
   * @api private
   */
  onAsync: function onAsync(eventName, listener) {
    listener._isAsync = true;
    return this.on(eventName, listener);
  },

  removeListener: function removeListener(eventName, listener) {
    var listeners = this._events[eventName];
    if (listeners) {
      var length = listeners.length;
      var position = -1;
      for (var i = 0; i < length; ++i) {
        if (listeners[i] === listener) {
          position = i;
        }
      }
      if (position > -1) {
        listeners.splice(position, 1);
      }
    }
    return this;
  },

  removeAllListeners: function removeAllListeners(eventName) {
    if (eventName) {
      delete this._events[eventName];
    } else {
      this._events = {};
    }
    return this;
  },

  /**
   * @api private
   */
  emit: function emit(eventName, eventArgs, doneCallback) {
    if (!doneCallback) doneCallback = function() { };
    var listeners = this.listeners(eventName);
    var count = listeners.length;
    this.callListeners(listeners, eventArgs, doneCallback);
    return count > 0;
  },

  /**
   * @api private
   */
  callListeners: function callListeners(listeners, args, doneCallback, prevError) {
    var self = this;
    var error = prevError || null;

    function callNextListener(err) {
      if (err) {
        error = core.util.error(error || new Error(), err);
        if (self._haltHandlersOnError) {
          return doneCallback.call(self, error);
        }
      }
      self.callListeners(listeners, args, doneCallback, error);
    }

    while (listeners.length > 0) {
      var listener = listeners.shift();
      if (listener._isAsync) { // asynchronous listener
        listener.apply(self, args.concat([callNextListener]));
        return; // stop here, callNextListener will continue
      } else { // synchronous listener
        try {
          listener.apply(self, args);
        } catch (err) {
          error = core.util.error(error || new Error(), err);
        }
        if (error && self._haltHandlersOnError) {
          doneCallback.call(self, error);
          return;
        }
      }
    }
    doneCallback.call(self, error);
  },

  /**
   * Adds or copies a set of listeners from another list of
   * listeners or SequentialExecutor object.
   *
   * @param listeners [map<String,Array<Function>>, AWS.SequentialExecutor]
   *   a list of events and callbacks, or an event emitter object
   *   containing listeners to add to this emitter object.
   * @return [AWS.SequentialExecutor] the emitter object, for chaining.
   * @example Adding listeners from a map of listeners
   *   emitter.addListeners({
   *     event1: [function() { ... }, function() { ... }],
   *     event2: [function() { ... }]
   *   });
   *   emitter.emit('event1'); // emitter has event1
   *   emitter.emit('event2'); // emitter has event2
   * @example Adding listeners from another emitter object
   *   var emitter1 = new AWS.SequentialExecutor();
   *   emitter1.on('event1', function() { ... });
   *   emitter1.on('event2', function() { ... });
   *   var emitter2 = new AWS.SequentialExecutor();
   *   emitter2.addListeners(emitter1);
   *   emitter2.emit('event1'); // emitter2 has event1
   *   emitter2.emit('event2'); // emitter2 has event2
   */
  addListeners: function addListeners(listeners) {
    var self = this;

    // extract listeners if parameter is an SequentialExecutor object
    if (listeners._events) listeners = listeners._events;

    core.util.each(listeners, function(event, callbacks) {
      if (typeof callbacks === 'function') callbacks = [callbacks];
      core.util.arrayEach(callbacks, function(callback) {
        self.on(event, callback);
      });
    });

    return self;
  },

  /**
   * Registers an event with {on} and saves the callback handle function
   * as a property on the emitter object using a given `name`.
   *
   * @param name [String] the property name to set on this object containing
   *   the callback function handle so that the listener can be removed in
   *   the future.
   * @param (see on)
   * @return (see on)
   * @example Adding a named listener DATA_CALLBACK
   *   var listener = function() { doSomething(); };
   *   emitter.addNamedListener('DATA_CALLBACK', 'data', listener);
   *
   *   // the following prints: true
   *   console.log(emitter.DATA_CALLBACK == listener);
   */
  addNamedListener: function addNamedListener(name, eventName, callback) {
    this[name] = callback;
    this.addListener(eventName, callback);
    return this;
  },

  /**
   * @api private
   */
  addNamedAsyncListener: function addNamedAsyncListener(name, eventName, callback) {
    callback._isAsync = true;
    return this.addNamedListener(name, eventName, callback);
  },

  /**
   * Helper method to add a set of named listeners using
   * {addNamedListener}. The callback contains a parameter
   * with a handle to the `addNamedListener` method.
   *
   * @callback callback function(add)
   *   The callback function is called immediately in order to provide
   *   the `add` function to the block. This simplifies the addition of
   *   a large group of named listeners.
   *   @param add [Function] the {addNamedListener} function to call
   *     when registering listeners.
   * @example Adding a set of named listeners
   *   emitter.addNamedListeners(function(add) {
   *     add('DATA_CALLBACK', 'data', function() { ... });
   *     add('OTHER', 'otherEvent', function() { ... });
   *     add('LAST', 'lastEvent', function() { ... });
   *   });
   *
   *   // these properties are now set:
   *   emitter.DATA_CALLBACK;
   *   emitter.OTHER;
   *   emitter.LAST;
   */
  addNamedListeners: function addNamedListeners(callback) {
    var self = this;
    callback(
      function() {
        self.addNamedListener.apply(self, arguments);
      },
      function() {
        self.addNamedAsyncListener.apply(self, arguments);
      }
    );
    return this;
  }
});

/**
 * {on} is the prefered method.
 * @api private
 */
core.SequentialExecutor.prototype.addListener = core.SequentialExecutor.prototype.on;

var sequential_executor = core.SequentialExecutor;

/**
 * The namespace used to register global event listeners for request building
 * and sending.
 */
core.EventListeners = {
  /**
   * @!attribute VALIDATE_CREDENTIALS
   *   A request listener that validates whether the request is being
   *   sent with credentials.
   *   Handles the {AWS.Request~validate 'validate' Request event}
   *   @example Sending a request without validating credentials
   *     var listener = AWS.EventListeners.Core.VALIDATE_CREDENTIALS;
   *     request.removeListener('validate', listener);
   *   @readonly
   *   @return [Function]
   * @!attribute VALIDATE_REGION
   *   A request listener that validates whether the region is set
   *   for a request.
   *   Handles the {AWS.Request~validate 'validate' Request event}
   *   @example Sending a request without validating region configuration
   *     var listener = AWS.EventListeners.Core.VALIDATE_REGION;
   *     request.removeListener('validate', listener);
   *   @readonly
   *   @return [Function]
   * @!attribute VALIDATE_PARAMETERS
   *   A request listener that validates input parameters in a request.
   *   Handles the {AWS.Request~validate 'validate' Request event}
   *   @example Sending a request without validating parameters
   *     var listener = AWS.EventListeners.Core.VALIDATE_PARAMETERS;
   *     request.removeListener('validate', listener);
   *   @example Disable parameter validation globally
   *     AWS.EventListeners.Core.removeListener('validate',
   *       AWS.EventListeners.Core.VALIDATE_REGION);
   *   @readonly
   *   @return [Function]
   * @!attribute SEND
   *   A request listener that initiates the HTTP connection for a
   *   request being sent. Handles the {AWS.Request~send 'send' Request event}
   *   @example Replacing the HTTP handler
   *     var listener = AWS.EventListeners.Core.SEND;
   *     request.removeListener('send', listener);
   *     request.on('send', function(response) {
   *       customHandler.send(response);
   *     });
   *   @return [Function]
   *   @readonly
   * @!attribute HTTP_DATA
   *   A request listener that reads data from the HTTP connection in order
   *   to build the response data.
   *   Handles the {AWS.Request~httpData 'httpData' Request event}.
   *   Remove this handler if you are overriding the 'httpData' event and
   *   do not want extra data processing and buffering overhead.
   *   @example Disabling default data processing
   *     var listener = AWS.EventListeners.Core.HTTP_DATA;
   *     request.removeListener('httpData', listener);
   *   @return [Function]
   *   @readonly
   */
  Core: {} /* doc hack */
};

/**
 * @api private
 */
function getOperationAuthtype(req) {
  if (!req.service.api.operations) {
    return '';
  }
  var operation = req.service.api.operations[req.operation];
  return operation ? operation.authtype : '';
}

core.EventListeners = {
  Core: new sequential_executor().addNamedListeners(function(add, addAsync) {
    addAsync('VALIDATE_CREDENTIALS', 'validate',
        function VALIDATE_CREDENTIALS(req, done) {
      if (!req.service.api.signatureVersion) return done(); // none
      req.service.config.getCredentials(function(err) {
        if (err) {
          req.response.error = core.util.error(err,
            {code: 'CredentialsError', message: 'Missing credentials in config'});
        }
        done();
      });
    });

    add('VALIDATE_REGION', 'validate', function VALIDATE_REGION(req) {
      if (!req.service.config.region && !req.service.isGlobalEndpoint) {
        req.response.error = core.util.error(new Error(),
          {code: 'ConfigError', message: 'Missing region in config'});
      }
    });

    add('BUILD_IDEMPOTENCY_TOKENS', 'validate', function BUILD_IDEMPOTENCY_TOKENS(req) {
      if (!req.service.api.operations) {
        return;
      }
      var operation = req.service.api.operations[req.operation];
      if (!operation) {
        return;
      }
      var idempotentMembers = operation.idempotentMembers;
      if (!idempotentMembers.length) {
        return;
      }
      // creates a copy of params so user's param object isn't mutated
      var params = core.util.copy(req.params);
      for (var i = 0, iLen = idempotentMembers.length; i < iLen; i++) {
        if (!params[idempotentMembers[i]]) {
          // add the member
          params[idempotentMembers[i]] = core.util.uuid.v4();
        }
      }
      req.params = params;
    });

    add('VALIDATE_PARAMETERS', 'validate', function VALIDATE_PARAMETERS(req) {
      if (!req.service.api.operations) {
        return;
      }
      var rules = req.service.api.operations[req.operation].input;
      var validation = req.service.config.paramValidation;
      new core.ParamValidator(validation).validate(rules, req.params);
    });

    addAsync('COMPUTE_SHA256', 'afterBuild', function COMPUTE_SHA256(req, done) {
      req.haltHandlersOnError();
      if (!req.service.api.operations) {
        return;
      }
      var operation = req.service.api.operations[req.operation];
      var authtype = operation ? operation.authtype : '';
      if (!req.service.api.signatureVersion && !authtype) return done(); // none
      if (req.service.getSignerClass(req) === core.Signers.V4) {
        var body = req.httpRequest.body || '';
        if (authtype.indexOf('unsigned-body') >= 0) {
          req.httpRequest.headers['X-Amz-Content-Sha256'] = 'UNSIGNED-PAYLOAD';
          return done();
        }
        core.util.computeSha256(body, function(err, sha) {
          if (err) {
            done(err);
          }
          else {
            req.httpRequest.headers['X-Amz-Content-Sha256'] = sha;
            done();
          }
        });
      } else {
        done();
      }
    });

    add('SET_CONTENT_LENGTH', 'afterBuild', function SET_CONTENT_LENGTH(req) {
      var authtype = getOperationAuthtype(req);
      if (req.httpRequest.headers['Content-Length'] === undefined
          && authtype.indexOf('unsigned-body') === -1) {
        var length = core.util.string.byteLength(req.httpRequest.body);
        req.httpRequest.headers['Content-Length'] = length;
      }
    });

    add('SET_HTTP_HOST', 'afterBuild', function SET_HTTP_HOST(req) {
      req.httpRequest.headers['Host'] = req.httpRequest.endpoint.host;
    });

    add('RESTART', 'restart', function RESTART() {
      var err = this.response.error;
      if (!err || !err.retryable) return;

      this.httpRequest = new core.HttpRequest(
        this.service.endpoint,
        this.service.region
      );

      if (this.response.retryCount < this.service.config.maxRetries) {
        this.response.retryCount++;
      } else {
        this.response.error = null;
      }
    });

    addAsync('SIGN', 'sign', function SIGN(req, done) {
      var service = req.service;
      var operations = req.service.api.operations || {};
      var operation = operations[req.operation];
      var authtype = operation ? operation.authtype : '';
      if (!service.api.signatureVersion && !authtype) return done(); // none

      service.config.getCredentials(function (err, credentials) {
        if (err) {
          req.response.error = err;
          return done();
        }

        try {
          var date = service.getSkewCorrectedDate();
          var SignerClass = service.getSignerClass(req);
          var signer = new SignerClass(req.httpRequest,
            service.api.signingName || service.api.endpointPrefix,
            {
              signatureCache: service.config.signatureCache,
              operation: operation
            });
          signer.setServiceClientId(service._clientId);

          // clear old authorization headers
          delete req.httpRequest.headers['Authorization'];
          delete req.httpRequest.headers['Date'];
          delete req.httpRequest.headers['X-Amz-Date'];

          // add new authorization
          signer.addAuthorization(credentials, date);
          req.signedAt = date;
        } catch (e) {
          req.response.error = e;
        }
        done();
      });
    });

    add('VALIDATE_RESPONSE', 'validateResponse', function VALIDATE_RESPONSE(resp) {
      if (this.service.successfulResponse(resp, this)) {
        resp.data = {};
        resp.error = null;
      } else {
        resp.data = null;
        resp.error = core.util.error(new Error(),
          {code: 'UnknownError', message: 'An unknown error occurred.'});
      }
    });

    addAsync('SEND', 'send', function SEND(resp, done) {
      resp.httpResponse._abortCallback = done;
      resp.error = null;
      resp.data = null;

      function callback(httpResp) {
        resp.httpResponse.stream = httpResp;
        var stream$$1 = resp.request.httpRequest.stream;

        httpResp.on('headers', function onHeaders(statusCode, headers, statusMessage) {
          resp.request.emit(
            'httpHeaders',
            [statusCode, headers, resp, statusMessage]
          );

          if (!resp.httpResponse.streaming) {
            if (core.HttpClient.streamsApiVersion === 2) { // streams2 API check
              httpResp.on('readable', function onReadable() {
                var data = httpResp.read();
                if (data !== null) {
                  resp.request.emit('httpData', [data, resp]);
                }
              });
            } else { // legacy streams API
              httpResp.on('data', function onData(data) {
                resp.request.emit('httpData', [data, resp]);
              });
            }
          }
        });

        httpResp.on('end', function onEnd() {
          if (!stream$$1 || !stream$$1.didCallback) {
            resp.request.emit('httpDone');
            done();
          }
        });
      }

      function progress(httpResp) {
        httpResp.on('sendProgress', function onSendProgress(value) {
          resp.request.emit('httpUploadProgress', [value, resp]);
        });

        httpResp.on('receiveProgress', function onReceiveProgress(value) {
          resp.request.emit('httpDownloadProgress', [value, resp]);
        });
      }

      function error(err) {
        if (err.code !== 'RequestAbortedError') {
          var errCode = err.code === 'TimeoutError' ? err.code : 'NetworkingError';
          err = core.util.error(err, {
            code: errCode,
            region: resp.request.httpRequest.region,
            hostname: resp.request.httpRequest.endpoint.hostname,
            retryable: true
          });
        }
        resp.error = err;
        resp.request.emit('httpError', [resp.error, resp], function() {
          done();
        });
      }

      function executeSend() {
        var http$$1 = core.HttpClient.getInstance();
        var httpOptions = resp.request.service.config.httpOptions || {};
        try {
          var stream$$1 = http$$1.handleRequest(resp.request.httpRequest, httpOptions,
                                          callback, error);
          progress(stream$$1);
        } catch (err) {
          error(err);
        }
      }
      var timeDiff = (resp.request.service.getSkewCorrectedDate() - this.signedAt) / 1000;
      if (timeDiff >= 60 * 10) { // if we signed 10min ago, re-sign
        this.emit('sign', [this], function(err) {
          if (err) done(err);
          else executeSend();
        });
      } else {
        executeSend();
      }
    });

    add('HTTP_HEADERS', 'httpHeaders',
        function HTTP_HEADERS(statusCode, headers, resp, statusMessage) {
      resp.httpResponse.statusCode = statusCode;
      resp.httpResponse.statusMessage = statusMessage;
      resp.httpResponse.headers = headers;
      resp.httpResponse.body = new core.util.Buffer('');
      resp.httpResponse.buffers = [];
      resp.httpResponse.numBytes = 0;
      var dateHeader = headers.date || headers.Date;
      var service = resp.request.service;
      if (dateHeader) {
        var serverTime = Date.parse(dateHeader);
        if (service.config.correctClockSkew
            && service.isClockSkewed(serverTime)) {
          service.applyClockOffset(serverTime);
        }
      }
    });

    add('HTTP_DATA', 'httpData', function HTTP_DATA(chunk, resp) {
      if (chunk) {
        if (core.util.isNode()) {
          resp.httpResponse.numBytes += chunk.length;

          var total = resp.httpResponse.headers['content-length'];
          var progress = { loaded: resp.httpResponse.numBytes, total: total };
          resp.request.emit('httpDownloadProgress', [progress, resp]);
        }

        resp.httpResponse.buffers.push(new core.util.Buffer(chunk));
      }
    });

    add('HTTP_DONE', 'httpDone', function HTTP_DONE(resp) {
      // convert buffers array into single buffer
      if (resp.httpResponse.buffers && resp.httpResponse.buffers.length > 0) {
        var body = core.util.buffer.concat(resp.httpResponse.buffers);
        resp.httpResponse.body = body;
      }
      delete resp.httpResponse.numBytes;
      delete resp.httpResponse.buffers;
    });

    add('FINALIZE_ERROR', 'retry', function FINALIZE_ERROR(resp) {
      if (resp.httpResponse.statusCode) {
        resp.error.statusCode = resp.httpResponse.statusCode;
        if (resp.error.retryable === undefined) {
          resp.error.retryable = this.service.retryableError(resp.error, this);
        }
      }
    });

    add('INVALIDATE_CREDENTIALS', 'retry', function INVALIDATE_CREDENTIALS(resp) {
      if (!resp.error) return;
      switch (resp.error.code) {
        case 'RequestExpired': // EC2 only
        case 'ExpiredTokenException':
        case 'ExpiredToken':
          resp.error.retryable = true;
          resp.request.service.config.credentials.expired = true;
      }
    });

    add('EXPIRED_SIGNATURE', 'retry', function EXPIRED_SIGNATURE(resp) {
      var err = resp.error;
      if (!err) return;
      if (typeof err.code === 'string' && typeof err.message === 'string') {
        if (err.code.match(/Signature/) && err.message.match(/expired/)) {
          resp.error.retryable = true;
        }
      }
    });

    add('CLOCK_SKEWED', 'retry', function CLOCK_SKEWED(resp) {
      if (!resp.error) return;
      if (this.service.clockSkewError(resp.error)
          && this.service.config.correctClockSkew) {
        resp.error.retryable = true;
      }
    });

    add('REDIRECT', 'retry', function REDIRECT(resp) {
      if (resp.error && resp.error.statusCode >= 300 &&
          resp.error.statusCode < 400 && resp.httpResponse.headers['location']) {
        this.httpRequest.endpoint =
          new core.Endpoint(resp.httpResponse.headers['location']);
        this.httpRequest.headers['Host'] = this.httpRequest.endpoint.host;
        resp.error.redirect = true;
        resp.error.retryable = true;
      }
    });

    add('RETRY_CHECK', 'retry', function RETRY_CHECK(resp) {
      if (resp.error) {
        if (resp.error.redirect && resp.redirectCount < resp.maxRedirects) {
          resp.error.retryDelay = 0;
        } else if (resp.retryCount < resp.maxRetries) {
          resp.error.retryDelay = this.service.retryDelays(resp.retryCount) || 0;
        }
      }
    });

    addAsync('RESET_RETRY_STATE', 'afterRetry', function RESET_RETRY_STATE(resp, done) {
      var delay, willRetry = false;

      if (resp.error) {
        delay = resp.error.retryDelay || 0;
        if (resp.error.retryable && resp.retryCount < resp.maxRetries) {
          resp.retryCount++;
          willRetry = true;
        } else if (resp.error.redirect && resp.redirectCount < resp.maxRedirects) {
          resp.redirectCount++;
          willRetry = true;
        }
      }

      if (willRetry) {
        resp.error = null;
        setTimeout(done, delay);
      } else {
        done();
      }
    });
  }),

  CorePost: new sequential_executor().addNamedListeners(function(add) {
    add('EXTRACT_REQUEST_ID', 'extractData', core.util.extractRequestId);
    add('EXTRACT_REQUEST_ID', 'extractError', core.util.extractRequestId);

    add('ENOTFOUND_ERROR', 'httpError', function ENOTFOUND_ERROR(err) {
      if (err.code === 'NetworkingError' && err.errno === 'ENOTFOUND') {
        var message = 'Inaccessible host: `' + err.hostname +
          '\'. This service may not be available in the `' + err.region +
          '\' region.';
        this.response.error = core.util.error(new Error(message), {
          code: 'UnknownEndpoint',
          region: err.region,
          hostname: err.hostname,
          retryable: true,
          originalError: err
        });
      }
    });
  }),

  Logger: new sequential_executor().addNamedListeners(function(add) {
    add('LOG_REQUEST', 'complete', function LOG_REQUEST(resp) {
      var req = resp.request;
      var logger = req.service.config.logger;
      if (!logger) return;
      function filterSensitiveLog(inputShape, shape) {
        if (!shape) {
          return shape;
        }
        switch (inputShape.type) {
          case 'structure':
            var struct = {};
            core.util.each(shape, function(subShapeName, subShape) {
              if (Object.prototype.hasOwnProperty.call(inputShape.members, subShapeName)) {
                struct[subShapeName] = filterSensitiveLog(inputShape.members[subShapeName], subShape);
              } else {
                struct[subShapeName] = subShape;
              }
            });
            return struct
          case 'list':
            var list = [];
            core.util.arrayEach(shape, function(subShape, index) {
              list.push(filterSensitiveLog(inputShape.member, subShape));
            });
            return list;
          case 'map':
            var map = {};
            core.util.each(shape, function(key, value) {
              map[key] = filterSensitiveLog(inputShape.value, value);
            });
            return map;
          default:
            if (inputShape.isSensitive) {
              return '***SensitiveInformation***'
            } else {
              return shape;
            }
        }
      }

      function buildMessage() {
        var time = resp.request.service.getSkewCorrectedDate().getTime();
        var delta = (time - req.startTime.getTime()) / 1000;
        var ansi = logger.isTTY ? true : false;
        var status = resp.httpResponse.statusCode;
        var censoredParams = req.params;
        if (
          req.service.api.operations &&
              req.service.api.operations[req.operation] &&
              req.service.api.operations[req.operation].input
        ) {
          var inputShape = req.service.api.operations[req.operation].input;
          censoredParams = filterSensitiveLog(inputShape, req.params);
        }
        var params = util.inspect(censoredParams, true, null);
        var message = '';
        if (ansi) message += '\x1B[33m';
        message += '[AWS ' + req.service.serviceIdentifier + ' ' + status;
        message += ' ' + delta.toString() + 's ' + resp.retryCount + ' retries]';
        if (ansi) message += '\x1B[0;1m';
        message += ' ' + core.util.string.lowerFirst(req.operation);
        message += '(' + params + ')';
        if (ansi) message += '\x1B[0m';
        return message;
      }

      var line = buildMessage();
      if (typeof logger.log === 'function') {
        logger.log(line);
      } else if (typeof logger.write === 'function') {
        logger.write(line + '\n');
      }
    });
  }),

  Json: new sequential_executor().addNamedListeners(function(add) {
    var svc = json;
    add('BUILD', 'build', svc.buildRequest);
    add('EXTRACT_DATA', 'extractData', svc.extractData);
    add('EXTRACT_ERROR', 'extractError', svc.extractError);
  }),

  Rest: new sequential_executor().addNamedListeners(function(add) {
    var svc = rest;
    add('BUILD', 'build', svc.buildRequest);
    add('EXTRACT_DATA', 'extractData', svc.extractData);
    add('EXTRACT_ERROR', 'extractError', svc.extractError);
  }),

  RestJson: new sequential_executor().addNamedListeners(function(add) {
    var svc = rest_json;
    add('BUILD', 'build', svc.buildRequest);
    add('EXTRACT_DATA', 'extractData', svc.extractData);
    add('EXTRACT_ERROR', 'extractError', svc.extractError);
  }),

  RestXml: new sequential_executor().addNamedListeners(function(add) {
    var svc = rest_xml;
    add('BUILD', 'build', svc.buildRequest);
    add('EXTRACT_DATA', 'extractData', svc.extractData);
    add('EXTRACT_ERROR', 'extractError', svc.extractError);
  }),

  Query: new sequential_executor().addNamedListeners(function(add) {
    var svc = query;
    add('BUILD', 'build', svc.buildRequest);
    add('EXTRACT_DATA', 'extractData', svc.extractData);
    add('EXTRACT_ERROR', 'extractError', svc.extractError);
  })
};

function AcceptorStateMachine(states, state) {
  this.currentState = state || null;
  this.states = states || {};
}

AcceptorStateMachine.prototype.runTo = function runTo(finalState, done, bindObject, inputError) {
  if (typeof finalState === 'function') {
    inputError = bindObject; bindObject = done;
    done = finalState; finalState = null;
  }

  var self = this;
  var state = self.states[self.currentState];
  state.fn.call(bindObject || self, inputError, function(err) {
    if (err) {
      if (state.fail) self.currentState = state.fail;
      else return done ? done.call(bindObject, err) : null;
    } else {
      if (state.accept) self.currentState = state.accept;
      else return done ? done.call(bindObject) : null;
    }
    if (self.currentState === finalState) {
      return done ? done.call(bindObject, err) : null;
    }

    self.runTo(finalState, done, bindObject, err);
  });
};

AcceptorStateMachine.prototype.addState = function addState(name, acceptState, failState, fn) {
  if (typeof acceptState === 'function') {
    fn = acceptState; acceptState = null; failState = null;
  } else if (typeof failState === 'function') {
    fn = failState; failState = null;
  }

  if (!this.currentState) this.currentState = name;
  this.states[name] = { accept: acceptState, fail: failState, fn: fn };
  return this;
};

var state_machine = AcceptorStateMachine;

var jmespath = createCommonjsModule(function (module, exports) {
(function(exports) {
  function isArray(obj) {
    if (obj !== null) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    } else {
      return false;
    }
  }

  function isObject(obj) {
    if (obj !== null) {
      return Object.prototype.toString.call(obj) === "[object Object]";
    } else {
      return false;
    }
  }

  function strictDeepEqual(first, second) {
    // Check the scalar case first.
    if (first === second) {
      return true;
    }

    // Check if they are the same type.
    var firstType = Object.prototype.toString.call(first);
    if (firstType !== Object.prototype.toString.call(second)) {
      return false;
    }
    // We know that first and second have the same type so we can just check the
    // first type from now on.
    if (isArray(first) === true) {
      // Short circuit if they're not the same length;
      if (first.length !== second.length) {
        return false;
      }
      for (var i = 0; i < first.length; i++) {
        if (strictDeepEqual(first[i], second[i]) === false) {
          return false;
        }
      }
      return true;
    }
    if (isObject(first) === true) {
      // An object is equal if it has the same key/value pairs.
      var keysSeen = {};
      for (var key in first) {
        if (hasOwnProperty.call(first, key)) {
          if (strictDeepEqual(first[key], second[key]) === false) {
            return false;
          }
          keysSeen[key] = true;
        }
      }
      // Now check that there aren't any keys in second that weren't
      // in first.
      for (var key2 in second) {
        if (hasOwnProperty.call(second, key2)) {
          if (keysSeen[key2] !== true) {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  }

  function isFalse(obj) {
    // From the spec:
    // A false value corresponds to the following values:
    // Empty list
    // Empty object
    // Empty string
    // False boolean
    // null value

    // First check the scalar values.
    if (obj === "" || obj === false || obj === null) {
        return true;
    } else if (isArray(obj) && obj.length === 0) {
        // Check for an empty array.
        return true;
    } else if (isObject(obj)) {
        // Check for an empty object.
        for (var key in obj) {
            // If there are any keys, then
            // the object is not empty so the object
            // is not false.
            if (obj.hasOwnProperty(key)) {
              return false;
            }
        }
        return true;
    } else {
        return false;
    }
  }

  function objValues(obj) {
    var keys = Object.keys(obj);
    var values = [];
    for (var i = 0; i < keys.length; i++) {
      values.push(obj[keys[i]]);
    }
    return values;
  }

  var trimLeft;
  if (typeof String.prototype.trimLeft === "function") {
    trimLeft = function(str) {
      return str.trimLeft();
    };
  } else {
    trimLeft = function(str) {
      return str.match(/^\s*(.*)/)[1];
    };
  }

  // Type constants used to define functions.
  var TYPE_NUMBER = 0;
  var TYPE_ANY = 1;
  var TYPE_STRING = 2;
  var TYPE_ARRAY = 3;
  var TYPE_OBJECT = 4;
  var TYPE_BOOLEAN = 5;
  var TYPE_EXPREF = 6;
  var TYPE_NULL = 7;
  var TYPE_ARRAY_NUMBER = 8;
  var TYPE_ARRAY_STRING = 9;

  var TOK_EOF = "EOF";
  var TOK_UNQUOTEDIDENTIFIER = "UnquotedIdentifier";
  var TOK_QUOTEDIDENTIFIER = "QuotedIdentifier";
  var TOK_RBRACKET = "Rbracket";
  var TOK_RPAREN = "Rparen";
  var TOK_COMMA = "Comma";
  var TOK_COLON = "Colon";
  var TOK_RBRACE = "Rbrace";
  var TOK_NUMBER = "Number";
  var TOK_CURRENT = "Current";
  var TOK_EXPREF = "Expref";
  var TOK_PIPE = "Pipe";
  var TOK_OR = "Or";
  var TOK_AND = "And";
  var TOK_EQ = "EQ";
  var TOK_GT = "GT";
  var TOK_LT = "LT";
  var TOK_GTE = "GTE";
  var TOK_LTE = "LTE";
  var TOK_NE = "NE";
  var TOK_FLATTEN = "Flatten";
  var TOK_STAR = "Star";
  var TOK_FILTER = "Filter";
  var TOK_DOT = "Dot";
  var TOK_NOT = "Not";
  var TOK_LBRACE = "Lbrace";
  var TOK_LBRACKET = "Lbracket";
  var TOK_LPAREN= "Lparen";
  var TOK_LITERAL= "Literal";

  // The "&", "[", "<", ">" tokens
  // are not in basicToken because
  // there are two token variants
  // ("&&", "[?", "<=", ">=").  This is specially handled
  // below.

  var basicTokens = {
    ".": TOK_DOT,
    "*": TOK_STAR,
    ",": TOK_COMMA,
    ":": TOK_COLON,
    "{": TOK_LBRACE,
    "}": TOK_RBRACE,
    "]": TOK_RBRACKET,
    "(": TOK_LPAREN,
    ")": TOK_RPAREN,
    "@": TOK_CURRENT
  };

  var operatorStartToken = {
      "<": true,
      ">": true,
      "=": true,
      "!": true
  };

  var skipChars = {
      " ": true,
      "\t": true,
      "\n": true
  };


  function isAlpha(ch) {
      return (ch >= "a" && ch <= "z") ||
             (ch >= "A" && ch <= "Z") ||
             ch === "_";
  }

  function isNum(ch) {
      return (ch >= "0" && ch <= "9") ||
             ch === "-";
  }
  function isAlphaNum(ch) {
      return (ch >= "a" && ch <= "z") ||
             (ch >= "A" && ch <= "Z") ||
             (ch >= "0" && ch <= "9") ||
             ch === "_";
  }

  function Lexer() {
  }
  Lexer.prototype = {
      tokenize: function(stream$$1) {
          var tokens = [];
          this._current = 0;
          var start;
          var identifier;
          var token;
          while (this._current < stream$$1.length) {
              if (isAlpha(stream$$1[this._current])) {
                  start = this._current;
                  identifier = this._consumeUnquotedIdentifier(stream$$1);
                  tokens.push({type: TOK_UNQUOTEDIDENTIFIER,
                               value: identifier,
                               start: start});
              } else if (basicTokens[stream$$1[this._current]] !== undefined) {
                  tokens.push({type: basicTokens[stream$$1[this._current]],
                              value: stream$$1[this._current],
                              start: this._current});
                  this._current++;
              } else if (isNum(stream$$1[this._current])) {
                  token = this._consumeNumber(stream$$1);
                  tokens.push(token);
              } else if (stream$$1[this._current] === "[") {
                  // No need to increment this._current.  This happens
                  // in _consumeLBracket
                  token = this._consumeLBracket(stream$$1);
                  tokens.push(token);
              } else if (stream$$1[this._current] === "\"") {
                  start = this._current;
                  identifier = this._consumeQuotedIdentifier(stream$$1);
                  tokens.push({type: TOK_QUOTEDIDENTIFIER,
                               value: identifier,
                               start: start});
              } else if (stream$$1[this._current] === "'") {
                  start = this._current;
                  identifier = this._consumeRawStringLiteral(stream$$1);
                  tokens.push({type: TOK_LITERAL,
                               value: identifier,
                               start: start});
              } else if (stream$$1[this._current] === "`") {
                  start = this._current;
                  var literal = this._consumeLiteral(stream$$1);
                  tokens.push({type: TOK_LITERAL,
                               value: literal,
                               start: start});
              } else if (operatorStartToken[stream$$1[this._current]] !== undefined) {
                  tokens.push(this._consumeOperator(stream$$1));
              } else if (skipChars[stream$$1[this._current]] !== undefined) {
                  // Ignore whitespace.
                  this._current++;
              } else if (stream$$1[this._current] === "&") {
                  start = this._current;
                  this._current++;
                  if (stream$$1[this._current] === "&") {
                      this._current++;
                      tokens.push({type: TOK_AND, value: "&&", start: start});
                  } else {
                      tokens.push({type: TOK_EXPREF, value: "&", start: start});
                  }
              } else if (stream$$1[this._current] === "|") {
                  start = this._current;
                  this._current++;
                  if (stream$$1[this._current] === "|") {
                      this._current++;
                      tokens.push({type: TOK_OR, value: "||", start: start});
                  } else {
                      tokens.push({type: TOK_PIPE, value: "|", start: start});
                  }
              } else {
                  var error = new Error("Unknown character:" + stream$$1[this._current]);
                  error.name = "LexerError";
                  throw error;
              }
          }
          return tokens;
      },

      _consumeUnquotedIdentifier: function(stream$$1) {
          var start = this._current;
          this._current++;
          while (this._current < stream$$1.length && isAlphaNum(stream$$1[this._current])) {
              this._current++;
          }
          return stream$$1.slice(start, this._current);
      },

      _consumeQuotedIdentifier: function(stream$$1) {
          var start = this._current;
          this._current++;
          var maxLength = stream$$1.length;
          while (stream$$1[this._current] !== "\"" && this._current < maxLength) {
              // You can escape a double quote and you can escape an escape.
              var current = this._current;
              if (stream$$1[current] === "\\" && (stream$$1[current + 1] === "\\" ||
                                               stream$$1[current + 1] === "\"")) {
                  current += 2;
              } else {
                  current++;
              }
              this._current = current;
          }
          this._current++;
          return JSON.parse(stream$$1.slice(start, this._current));
      },

      _consumeRawStringLiteral: function(stream$$1) {
          var start = this._current;
          this._current++;
          var maxLength = stream$$1.length;
          while (stream$$1[this._current] !== "'" && this._current < maxLength) {
              // You can escape a single quote and you can escape an escape.
              var current = this._current;
              if (stream$$1[current] === "\\" && (stream$$1[current + 1] === "\\" ||
                                               stream$$1[current + 1] === "'")) {
                  current += 2;
              } else {
                  current++;
              }
              this._current = current;
          }
          this._current++;
          var literal = stream$$1.slice(start + 1, this._current - 1);
          return literal.replace("\\'", "'");
      },

      _consumeNumber: function(stream$$1) {
          var start = this._current;
          this._current++;
          var maxLength = stream$$1.length;
          while (isNum(stream$$1[this._current]) && this._current < maxLength) {
              this._current++;
          }
          var value = parseInt(stream$$1.slice(start, this._current));
          return {type: TOK_NUMBER, value: value, start: start};
      },

      _consumeLBracket: function(stream$$1) {
          var start = this._current;
          this._current++;
          if (stream$$1[this._current] === "?") {
              this._current++;
              return {type: TOK_FILTER, value: "[?", start: start};
          } else if (stream$$1[this._current] === "]") {
              this._current++;
              return {type: TOK_FLATTEN, value: "[]", start: start};
          } else {
              return {type: TOK_LBRACKET, value: "[", start: start};
          }
      },

      _consumeOperator: function(stream$$1) {
          var start = this._current;
          var startingChar = stream$$1[start];
          this._current++;
          if (startingChar === "!") {
              if (stream$$1[this._current] === "=") {
                  this._current++;
                  return {type: TOK_NE, value: "!=", start: start};
              } else {
                return {type: TOK_NOT, value: "!", start: start};
              }
          } else if (startingChar === "<") {
              if (stream$$1[this._current] === "=") {
                  this._current++;
                  return {type: TOK_LTE, value: "<=", start: start};
              } else {
                  return {type: TOK_LT, value: "<", start: start};
              }
          } else if (startingChar === ">") {
              if (stream$$1[this._current] === "=") {
                  this._current++;
                  return {type: TOK_GTE, value: ">=", start: start};
              } else {
                  return {type: TOK_GT, value: ">", start: start};
              }
          } else if (startingChar === "=") {
              if (stream$$1[this._current] === "=") {
                  this._current++;
                  return {type: TOK_EQ, value: "==", start: start};
              }
          }
      },

      _consumeLiteral: function(stream$$1) {
          this._current++;
          var start = this._current;
          var maxLength = stream$$1.length;
          var literal;
          while(stream$$1[this._current] !== "`" && this._current < maxLength) {
              // You can escape a literal char or you can escape the escape.
              var current = this._current;
              if (stream$$1[current] === "\\" && (stream$$1[current + 1] === "\\" ||
                                               stream$$1[current + 1] === "`")) {
                  current += 2;
              } else {
                  current++;
              }
              this._current = current;
          }
          var literalString = trimLeft(stream$$1.slice(start, this._current));
          literalString = literalString.replace("\\`", "`");
          if (this._looksLikeJSON(literalString)) {
              literal = JSON.parse(literalString);
          } else {
              // Try to JSON parse it as "<literal>"
              literal = JSON.parse("\"" + literalString + "\"");
          }
          // +1 gets us to the ending "`", +1 to move on to the next char.
          this._current++;
          return literal;
      },

      _looksLikeJSON: function(literalString) {
          var startingChars = "[{\"";
          var jsonLiterals = ["true", "false", "null"];
          var numberLooking = "-0123456789";

          if (literalString === "") {
              return false;
          } else if (startingChars.indexOf(literalString[0]) >= 0) {
              return true;
          } else if (jsonLiterals.indexOf(literalString) >= 0) {
              return true;
          } else if (numberLooking.indexOf(literalString[0]) >= 0) {
              try {
                  JSON.parse(literalString);
                  return true;
              } catch (ex) {
                  return false;
              }
          } else {
              return false;
          }
      }
  };

      var bindingPower = {};
      bindingPower[TOK_EOF] = 0;
      bindingPower[TOK_UNQUOTEDIDENTIFIER] = 0;
      bindingPower[TOK_QUOTEDIDENTIFIER] = 0;
      bindingPower[TOK_RBRACKET] = 0;
      bindingPower[TOK_RPAREN] = 0;
      bindingPower[TOK_COMMA] = 0;
      bindingPower[TOK_RBRACE] = 0;
      bindingPower[TOK_NUMBER] = 0;
      bindingPower[TOK_CURRENT] = 0;
      bindingPower[TOK_EXPREF] = 0;
      bindingPower[TOK_PIPE] = 1;
      bindingPower[TOK_OR] = 2;
      bindingPower[TOK_AND] = 3;
      bindingPower[TOK_EQ] = 5;
      bindingPower[TOK_GT] = 5;
      bindingPower[TOK_LT] = 5;
      bindingPower[TOK_GTE] = 5;
      bindingPower[TOK_LTE] = 5;
      bindingPower[TOK_NE] = 5;
      bindingPower[TOK_FLATTEN] = 9;
      bindingPower[TOK_STAR] = 20;
      bindingPower[TOK_FILTER] = 21;
      bindingPower[TOK_DOT] = 40;
      bindingPower[TOK_NOT] = 45;
      bindingPower[TOK_LBRACE] = 50;
      bindingPower[TOK_LBRACKET] = 55;
      bindingPower[TOK_LPAREN] = 60;

  function Parser() {
  }

  Parser.prototype = {
      parse: function(expression) {
          this._loadTokens(expression);
          this.index = 0;
          var ast = this.expression(0);
          if (this._lookahead(0) !== TOK_EOF) {
              var t = this._lookaheadToken(0);
              var error = new Error(
                  "Unexpected token type: " + t.type + ", value: " + t.value);
              error.name = "ParserError";
              throw error;
          }
          return ast;
      },

      _loadTokens: function(expression) {
          var lexer = new Lexer();
          var tokens = lexer.tokenize(expression);
          tokens.push({type: TOK_EOF, value: "", start: expression.length});
          this.tokens = tokens;
      },

      expression: function(rbp) {
          var leftToken = this._lookaheadToken(0);
          this._advance();
          var left = this.nud(leftToken);
          var currentToken = this._lookahead(0);
          while (rbp < bindingPower[currentToken]) {
              this._advance();
              left = this.led(currentToken, left);
              currentToken = this._lookahead(0);
          }
          return left;
      },

      _lookahead: function(number) {
          return this.tokens[this.index + number].type;
      },

      _lookaheadToken: function(number) {
          return this.tokens[this.index + number];
      },

      _advance: function() {
          this.index++;
      },

      nud: function(token) {
        var left;
        var right;
        var expression;
        switch (token.type) {
          case TOK_LITERAL:
            return {type: "Literal", value: token.value};
          case TOK_UNQUOTEDIDENTIFIER:
            return {type: "Field", name: token.value};
          case TOK_QUOTEDIDENTIFIER:
            var node = {type: "Field", name: token.value};
            if (this._lookahead(0) === TOK_LPAREN) {
                throw new Error("Quoted identifier not allowed for function names.");
            } else {
                return node;
            }
            break;
          case TOK_NOT:
            right = this.expression(bindingPower.Not);
            return {type: "NotExpression", children: [right]};
          case TOK_STAR:
            left = {type: "Identity"};
            right = null;
            if (this._lookahead(0) === TOK_RBRACKET) {
                // This can happen in a multiselect,
                // [a, b, *]
                right = {type: "Identity"};
            } else {
                right = this._parseProjectionRHS(bindingPower.Star);
            }
            return {type: "ValueProjection", children: [left, right]};
          case TOK_FILTER:
            return this.led(token.type, {type: "Identity"});
          case TOK_LBRACE:
            return this._parseMultiselectHash();
          case TOK_FLATTEN:
            left = {type: TOK_FLATTEN, children: [{type: "Identity"}]};
            right = this._parseProjectionRHS(bindingPower.Flatten);
            return {type: "Projection", children: [left, right]};
          case TOK_LBRACKET:
            if (this._lookahead(0) === TOK_NUMBER || this._lookahead(0) === TOK_COLON) {
                right = this._parseIndexExpression();
                return this._projectIfSlice({type: "Identity"}, right);
            } else if (this._lookahead(0) === TOK_STAR &&
                       this._lookahead(1) === TOK_RBRACKET) {
                this._advance();
                this._advance();
                right = this._parseProjectionRHS(bindingPower.Star);
                return {type: "Projection",
                        children: [{type: "Identity"}, right]};
            } else {
                return this._parseMultiselectList();
            }
            break;
          case TOK_CURRENT:
            return {type: TOK_CURRENT};
          case TOK_EXPREF:
            expression = this.expression(bindingPower.Expref);
            return {type: "ExpressionReference", children: [expression]};
          case TOK_LPAREN:
            var args = [];
            while (this._lookahead(0) !== TOK_RPAREN) {
              if (this._lookahead(0) === TOK_CURRENT) {
                expression = {type: TOK_CURRENT};
                this._advance();
              } else {
                expression = this.expression(0);
              }
              args.push(expression);
            }
            this._match(TOK_RPAREN);
            return args[0];
          default:
            this._errorToken(token);
        }
      },

      led: function(tokenName, left) {
        var right;
        switch(tokenName) {
          case TOK_DOT:
            var rbp = bindingPower.Dot;
            if (this._lookahead(0) !== TOK_STAR) {
                right = this._parseDotRHS(rbp);
                return {type: "Subexpression", children: [left, right]};
            } else {
                // Creating a projection.
                this._advance();
                right = this._parseProjectionRHS(rbp);
                return {type: "ValueProjection", children: [left, right]};
            }
            break;
          case TOK_PIPE:
            right = this.expression(bindingPower.Pipe);
            return {type: TOK_PIPE, children: [left, right]};
          case TOK_OR:
            right = this.expression(bindingPower.Or);
            return {type: "OrExpression", children: [left, right]};
          case TOK_AND:
            right = this.expression(bindingPower.And);
            return {type: "AndExpression", children: [left, right]};
          case TOK_LPAREN:
            var name = left.name;
            var args = [];
            var expression, node;
            while (this._lookahead(0) !== TOK_RPAREN) {
              if (this._lookahead(0) === TOK_CURRENT) {
                expression = {type: TOK_CURRENT};
                this._advance();
              } else {
                expression = this.expression(0);
              }
              if (this._lookahead(0) === TOK_COMMA) {
                this._match(TOK_COMMA);
              }
              args.push(expression);
            }
            this._match(TOK_RPAREN);
            node = {type: "Function", name: name, children: args};
            return node;
          case TOK_FILTER:
            var condition = this.expression(0);
            this._match(TOK_RBRACKET);
            if (this._lookahead(0) === TOK_FLATTEN) {
              right = {type: "Identity"};
            } else {
              right = this._parseProjectionRHS(bindingPower.Filter);
            }
            return {type: "FilterProjection", children: [left, right, condition]};
          case TOK_FLATTEN:
            var leftNode = {type: TOK_FLATTEN, children: [left]};
            var rightNode = this._parseProjectionRHS(bindingPower.Flatten);
            return {type: "Projection", children: [leftNode, rightNode]};
          case TOK_EQ:
          case TOK_NE:
          case TOK_GT:
          case TOK_GTE:
          case TOK_LT:
          case TOK_LTE:
            return this._parseComparator(left, tokenName);
          case TOK_LBRACKET:
            var token = this._lookaheadToken(0);
            if (token.type === TOK_NUMBER || token.type === TOK_COLON) {
                right = this._parseIndexExpression();
                return this._projectIfSlice(left, right);
            } else {
                this._match(TOK_STAR);
                this._match(TOK_RBRACKET);
                right = this._parseProjectionRHS(bindingPower.Star);
                return {type: "Projection", children: [left, right]};
            }
            break;
          default:
            this._errorToken(this._lookaheadToken(0));
        }
      },

      _match: function(tokenType) {
          if (this._lookahead(0) === tokenType) {
              this._advance();
          } else {
              var t = this._lookaheadToken(0);
              var error = new Error("Expected " + tokenType + ", got: " + t.type);
              error.name = "ParserError";
              throw error;
          }
      },

      _errorToken: function(token) {
          var error = new Error("Invalid token (" +
                                token.type + "): \"" +
                                token.value + "\"");
          error.name = "ParserError";
          throw error;
      },


      _parseIndexExpression: function() {
          if (this._lookahead(0) === TOK_COLON || this._lookahead(1) === TOK_COLON) {
              return this._parseSliceExpression();
          } else {
              var node = {
                  type: "Index",
                  value: this._lookaheadToken(0).value};
              this._advance();
              this._match(TOK_RBRACKET);
              return node;
          }
      },

      _projectIfSlice: function(left, right) {
          var indexExpr = {type: "IndexExpression", children: [left, right]};
          if (right.type === "Slice") {
              return {
                  type: "Projection",
                  children: [indexExpr, this._parseProjectionRHS(bindingPower.Star)]
              };
          } else {
              return indexExpr;
          }
      },

      _parseSliceExpression: function() {
          // [start:end:step] where each part is optional, as well as the last
          // colon.
          var parts = [null, null, null];
          var index = 0;
          var currentToken = this._lookahead(0);
          while (currentToken !== TOK_RBRACKET && index < 3) {
              if (currentToken === TOK_COLON) {
                  index++;
                  this._advance();
              } else if (currentToken === TOK_NUMBER) {
                  parts[index] = this._lookaheadToken(0).value;
                  this._advance();
              } else {
                  var t = this._lookahead(0);
                  var error = new Error("Syntax error, unexpected token: " +
                                        t.value + "(" + t.type + ")");
                  error.name = "Parsererror";
                  throw error;
              }
              currentToken = this._lookahead(0);
          }
          this._match(TOK_RBRACKET);
          return {
              type: "Slice",
              children: parts
          };
      },

      _parseComparator: function(left, comparator) {
        var right = this.expression(bindingPower[comparator]);
        return {type: "Comparator", name: comparator, children: [left, right]};
      },

      _parseDotRHS: function(rbp) {
          var lookahead = this._lookahead(0);
          var exprTokens = [TOK_UNQUOTEDIDENTIFIER, TOK_QUOTEDIDENTIFIER, TOK_STAR];
          if (exprTokens.indexOf(lookahead) >= 0) {
              return this.expression(rbp);
          } else if (lookahead === TOK_LBRACKET) {
              this._match(TOK_LBRACKET);
              return this._parseMultiselectList();
          } else if (lookahead === TOK_LBRACE) {
              this._match(TOK_LBRACE);
              return this._parseMultiselectHash();
          }
      },

      _parseProjectionRHS: function(rbp) {
          var right;
          if (bindingPower[this._lookahead(0)] < 10) {
              right = {type: "Identity"};
          } else if (this._lookahead(0) === TOK_LBRACKET) {
              right = this.expression(rbp);
          } else if (this._lookahead(0) === TOK_FILTER) {
              right = this.expression(rbp);
          } else if (this._lookahead(0) === TOK_DOT) {
              this._match(TOK_DOT);
              right = this._parseDotRHS(rbp);
          } else {
              var t = this._lookaheadToken(0);
              var error = new Error("Sytanx error, unexpected token: " +
                                    t.value + "(" + t.type + ")");
              error.name = "ParserError";
              throw error;
          }
          return right;
      },

      _parseMultiselectList: function() {
          var expressions = [];
          while (this._lookahead(0) !== TOK_RBRACKET) {
              var expression = this.expression(0);
              expressions.push(expression);
              if (this._lookahead(0) === TOK_COMMA) {
                  this._match(TOK_COMMA);
                  if (this._lookahead(0) === TOK_RBRACKET) {
                    throw new Error("Unexpected token Rbracket");
                  }
              }
          }
          this._match(TOK_RBRACKET);
          return {type: "MultiSelectList", children: expressions};
      },

      _parseMultiselectHash: function() {
        var pairs = [];
        var identifierTypes = [TOK_UNQUOTEDIDENTIFIER, TOK_QUOTEDIDENTIFIER];
        var keyToken, keyName, value, node;
        for (;;) {
          keyToken = this._lookaheadToken(0);
          if (identifierTypes.indexOf(keyToken.type) < 0) {
            throw new Error("Expecting an identifier token, got: " +
                            keyToken.type);
          }
          keyName = keyToken.value;
          this._advance();
          this._match(TOK_COLON);
          value = this.expression(0);
          node = {type: "KeyValuePair", name: keyName, value: value};
          pairs.push(node);
          if (this._lookahead(0) === TOK_COMMA) {
            this._match(TOK_COMMA);
          } else if (this._lookahead(0) === TOK_RBRACE) {
            this._match(TOK_RBRACE);
            break;
          }
        }
        return {type: "MultiSelectHash", children: pairs};
      }
  };


  function TreeInterpreter(runtime) {
    this.runtime = runtime;
  }

  TreeInterpreter.prototype = {
      search: function(node, value) {
          return this.visit(node, value);
      },

      visit: function(node, value) {
          var matched, current, result, first, second, field, left, right, collected, i;
          switch (node.type) {
            case "Field":
              if (value === null ) {
                  return null;
              } else if (isObject(value)) {
                  field = value[node.name];
                  if (field === undefined) {
                      return null;
                  } else {
                      return field;
                  }
              } else {
                return null;
              }
              break;
            case "Subexpression":
              result = this.visit(node.children[0], value);
              for (i = 1; i < node.children.length; i++) {
                  result = this.visit(node.children[1], result);
                  if (result === null) {
                      return null;
                  }
              }
              return result;
            case "IndexExpression":
              left = this.visit(node.children[0], value);
              right = this.visit(node.children[1], left);
              return right;
            case "Index":
              if (!isArray(value)) {
                return null;
              }
              var index = node.value;
              if (index < 0) {
                index = value.length + index;
              }
              result = value[index];
              if (result === undefined) {
                result = null;
              }
              return result;
            case "Slice":
              if (!isArray(value)) {
                return null;
              }
              var sliceParams = node.children.slice(0);
              var computed = this.computeSliceParams(value.length, sliceParams);
              var start = computed[0];
              var stop = computed[1];
              var step = computed[2];
              result = [];
              if (step > 0) {
                  for (i = start; i < stop; i += step) {
                      result.push(value[i]);
                  }
              } else {
                  for (i = start; i > stop; i += step) {
                      result.push(value[i]);
                  }
              }
              return result;
            case "Projection":
              // Evaluate left child.
              var base = this.visit(node.children[0], value);
              if (!isArray(base)) {
                return null;
              }
              collected = [];
              for (i = 0; i < base.length; i++) {
                current = this.visit(node.children[1], base[i]);
                if (current !== null) {
                  collected.push(current);
                }
              }
              return collected;
            case "ValueProjection":
              // Evaluate left child.
              base = this.visit(node.children[0], value);
              if (!isObject(base)) {
                return null;
              }
              collected = [];
              var values = objValues(base);
              for (i = 0; i < values.length; i++) {
                current = this.visit(node.children[1], values[i]);
                if (current !== null) {
                  collected.push(current);
                }
              }
              return collected;
            case "FilterProjection":
              base = this.visit(node.children[0], value);
              if (!isArray(base)) {
                return null;
              }
              var filtered = [];
              var finalResults = [];
              for (i = 0; i < base.length; i++) {
                matched = this.visit(node.children[2], base[i]);
                if (!isFalse(matched)) {
                  filtered.push(base[i]);
                }
              }
              for (var j = 0; j < filtered.length; j++) {
                current = this.visit(node.children[1], filtered[j]);
                if (current !== null) {
                  finalResults.push(current);
                }
              }
              return finalResults;
            case "Comparator":
              first = this.visit(node.children[0], value);
              second = this.visit(node.children[1], value);
              switch(node.name) {
                case TOK_EQ:
                  result = strictDeepEqual(first, second);
                  break;
                case TOK_NE:
                  result = !strictDeepEqual(first, second);
                  break;
                case TOK_GT:
                  result = first > second;
                  break;
                case TOK_GTE:
                  result = first >= second;
                  break;
                case TOK_LT:
                  result = first < second;
                  break;
                case TOK_LTE:
                  result = first <= second;
                  break;
                default:
                  throw new Error("Unknown comparator: " + node.name);
              }
              return result;
            case TOK_FLATTEN:
              var original = this.visit(node.children[0], value);
              if (!isArray(original)) {
                return null;
              }
              var merged = [];
              for (i = 0; i < original.length; i++) {
                current = original[i];
                if (isArray(current)) {
                  merged.push.apply(merged, current);
                } else {
                  merged.push(current);
                }
              }
              return merged;
            case "Identity":
              return value;
            case "MultiSelectList":
              if (value === null) {
                return null;
              }
              collected = [];
              for (i = 0; i < node.children.length; i++) {
                  collected.push(this.visit(node.children[i], value));
              }
              return collected;
            case "MultiSelectHash":
              if (value === null) {
                return null;
              }
              collected = {};
              var child;
              for (i = 0; i < node.children.length; i++) {
                child = node.children[i];
                collected[child.name] = this.visit(child.value, value);
              }
              return collected;
            case "OrExpression":
              matched = this.visit(node.children[0], value);
              if (isFalse(matched)) {
                  matched = this.visit(node.children[1], value);
              }
              return matched;
            case "AndExpression":
              first = this.visit(node.children[0], value);

              if (isFalse(first) === true) {
                return first;
              }
              return this.visit(node.children[1], value);
            case "NotExpression":
              first = this.visit(node.children[0], value);
              return isFalse(first);
            case "Literal":
              return node.value;
            case TOK_PIPE:
              left = this.visit(node.children[0], value);
              return this.visit(node.children[1], left);
            case TOK_CURRENT:
              return value;
            case "Function":
              var resolvedArgs = [];
              for (i = 0; i < node.children.length; i++) {
                  resolvedArgs.push(this.visit(node.children[i], value));
              }
              return this.runtime.callFunction(node.name, resolvedArgs);
            case "ExpressionReference":
              var refNode = node.children[0];
              // Tag the node with a specific attribute so the type
              // checker verify the type.
              refNode.jmespathType = TOK_EXPREF;
              return refNode;
            default:
              throw new Error("Unknown node type: " + node.type);
          }
      },

      computeSliceParams: function(arrayLength, sliceParams) {
        var start = sliceParams[0];
        var stop = sliceParams[1];
        var step = sliceParams[2];
        var computed = [null, null, null];
        if (step === null) {
          step = 1;
        } else if (step === 0) {
          var error = new Error("Invalid slice, step cannot be 0");
          error.name = "RuntimeError";
          throw error;
        }
        var stepValueNegative = step < 0 ? true : false;

        if (start === null) {
            start = stepValueNegative ? arrayLength - 1 : 0;
        } else {
            start = this.capSliceRange(arrayLength, start, step);
        }

        if (stop === null) {
            stop = stepValueNegative ? -1 : arrayLength;
        } else {
            stop = this.capSliceRange(arrayLength, stop, step);
        }
        computed[0] = start;
        computed[1] = stop;
        computed[2] = step;
        return computed;
      },

      capSliceRange: function(arrayLength, actualValue, step) {
          if (actualValue < 0) {
              actualValue += arrayLength;
              if (actualValue < 0) {
                  actualValue = step < 0 ? -1 : 0;
              }
          } else if (actualValue >= arrayLength) {
              actualValue = step < 0 ? arrayLength - 1 : arrayLength;
          }
          return actualValue;
      }

  };

  function Runtime(interpreter) {
    this._interpreter = interpreter;
    this.functionTable = {
        // name: [function, <signature>]
        // The <signature> can be:
        //
        // {
        //   args: [[type1, type2], [type1, type2]],
        //   variadic: true|false
        // }
        //
        // Each arg in the arg list is a list of valid types
        // (if the function is overloaded and supports multiple
        // types.  If the type is "any" then no type checking
        // occurs on the argument.  Variadic is optional
        // and if not provided is assumed to be false.
        abs: {_func: this._functionAbs, _signature: [{types: [TYPE_NUMBER]}]},
        avg: {_func: this._functionAvg, _signature: [{types: [TYPE_ARRAY_NUMBER]}]},
        ceil: {_func: this._functionCeil, _signature: [{types: [TYPE_NUMBER]}]},
        contains: {
            _func: this._functionContains,
            _signature: [{types: [TYPE_STRING, TYPE_ARRAY]},
                        {types: [TYPE_ANY]}]},
        "ends_with": {
            _func: this._functionEndsWith,
            _signature: [{types: [TYPE_STRING]}, {types: [TYPE_STRING]}]},
        floor: {_func: this._functionFloor, _signature: [{types: [TYPE_NUMBER]}]},
        length: {
            _func: this._functionLength,
            _signature: [{types: [TYPE_STRING, TYPE_ARRAY, TYPE_OBJECT]}]},
        map: {
            _func: this._functionMap,
            _signature: [{types: [TYPE_EXPREF]}, {types: [TYPE_ARRAY]}]},
        max: {
            _func: this._functionMax,
            _signature: [{types: [TYPE_ARRAY_NUMBER, TYPE_ARRAY_STRING]}]},
        "merge": {
            _func: this._functionMerge,
            _signature: [{types: [TYPE_OBJECT], variadic: true}]
        },
        "max_by": {
          _func: this._functionMaxBy,
          _signature: [{types: [TYPE_ARRAY]}, {types: [TYPE_EXPREF]}]
        },
        sum: {_func: this._functionSum, _signature: [{types: [TYPE_ARRAY_NUMBER]}]},
        "starts_with": {
            _func: this._functionStartsWith,
            _signature: [{types: [TYPE_STRING]}, {types: [TYPE_STRING]}]},
        min: {
            _func: this._functionMin,
            _signature: [{types: [TYPE_ARRAY_NUMBER, TYPE_ARRAY_STRING]}]},
        "min_by": {
          _func: this._functionMinBy,
          _signature: [{types: [TYPE_ARRAY]}, {types: [TYPE_EXPREF]}]
        },
        type: {_func: this._functionType, _signature: [{types: [TYPE_ANY]}]},
        keys: {_func: this._functionKeys, _signature: [{types: [TYPE_OBJECT]}]},
        values: {_func: this._functionValues, _signature: [{types: [TYPE_OBJECT]}]},
        sort: {_func: this._functionSort, _signature: [{types: [TYPE_ARRAY_STRING, TYPE_ARRAY_NUMBER]}]},
        "sort_by": {
          _func: this._functionSortBy,
          _signature: [{types: [TYPE_ARRAY]}, {types: [TYPE_EXPREF]}]
        },
        join: {
            _func: this._functionJoin,
            _signature: [
                {types: [TYPE_STRING]},
                {types: [TYPE_ARRAY_STRING]}
            ]
        },
        reverse: {
            _func: this._functionReverse,
            _signature: [{types: [TYPE_STRING, TYPE_ARRAY]}]},
        "to_array": {_func: this._functionToArray, _signature: [{types: [TYPE_ANY]}]},
        "to_string": {_func: this._functionToString, _signature: [{types: [TYPE_ANY]}]},
        "to_number": {_func: this._functionToNumber, _signature: [{types: [TYPE_ANY]}]},
        "not_null": {
            _func: this._functionNotNull,
            _signature: [{types: [TYPE_ANY], variadic: true}]
        }
    };
  }

  Runtime.prototype = {
    callFunction: function(name, resolvedArgs) {
      var functionEntry = this.functionTable[name];
      if (functionEntry === undefined) {
          throw new Error("Unknown function: " + name + "()");
      }
      this._validateArgs(name, resolvedArgs, functionEntry._signature);
      return functionEntry._func.call(this, resolvedArgs);
    },

    _validateArgs: function(name, args, signature) {
        // Validating the args requires validating
        // the correct arity and the correct type of each arg.
        // If the last argument is declared as variadic, then we need
        // a minimum number of args to be required.  Otherwise it has to
        // be an exact amount.
        var pluralized;
        if (signature[signature.length - 1].variadic) {
            if (args.length < signature.length) {
                pluralized = signature.length === 1 ? " argument" : " arguments";
                throw new Error("ArgumentError: " + name + "() " +
                                "takes at least" + signature.length + pluralized +
                                " but received " + args.length);
            }
        } else if (args.length !== signature.length) {
            pluralized = signature.length === 1 ? " argument" : " arguments";
            throw new Error("ArgumentError: " + name + "() " +
                            "takes " + signature.length + pluralized +
                            " but received " + args.length);
        }
        var currentSpec;
        var actualType;
        var typeMatched;
        for (var i = 0; i < signature.length; i++) {
            typeMatched = false;
            currentSpec = signature[i].types;
            actualType = this._getTypeName(args[i]);
            for (var j = 0; j < currentSpec.length; j++) {
                if (this._typeMatches(actualType, currentSpec[j], args[i])) {
                    typeMatched = true;
                    break;
                }
            }
            if (!typeMatched) {
                throw new Error("TypeError: " + name + "() " +
                                "expected argument " + (i + 1) +
                                " to be type " + currentSpec +
                                " but received type " + actualType +
                                " instead.");
            }
        }
    },

    _typeMatches: function(actual, expected, argValue) {
        if (expected === TYPE_ANY) {
            return true;
        }
        if (expected === TYPE_ARRAY_STRING ||
            expected === TYPE_ARRAY_NUMBER ||
            expected === TYPE_ARRAY) {
            // The expected type can either just be array,
            // or it can require a specific subtype (array of numbers).
            //
            // The simplest case is if "array" with no subtype is specified.
            if (expected === TYPE_ARRAY) {
                return actual === TYPE_ARRAY;
            } else if (actual === TYPE_ARRAY) {
                // Otherwise we need to check subtypes.
                // I think this has potential to be improved.
                var subtype;
                if (expected === TYPE_ARRAY_NUMBER) {
                  subtype = TYPE_NUMBER;
                } else if (expected === TYPE_ARRAY_STRING) {
                  subtype = TYPE_STRING;
                }
                for (var i = 0; i < argValue.length; i++) {
                    if (!this._typeMatches(
                            this._getTypeName(argValue[i]), subtype,
                                             argValue[i])) {
                        return false;
                    }
                }
                return true;
            }
        } else {
            return actual === expected;
        }
    },
    _getTypeName: function(obj) {
        switch (Object.prototype.toString.call(obj)) {
            case "[object String]":
              return TYPE_STRING;
            case "[object Number]":
              return TYPE_NUMBER;
            case "[object Array]":
              return TYPE_ARRAY;
            case "[object Boolean]":
              return TYPE_BOOLEAN;
            case "[object Null]":
              return TYPE_NULL;
            case "[object Object]":
              // Check if it's an expref.  If it has, it's been
              // tagged with a jmespathType attr of 'Expref';
              if (obj.jmespathType === TOK_EXPREF) {
                return TYPE_EXPREF;
              } else {
                return TYPE_OBJECT;
              }
        }
    },

    _functionStartsWith: function(resolvedArgs) {
        return resolvedArgs[0].lastIndexOf(resolvedArgs[1]) === 0;
    },

    _functionEndsWith: function(resolvedArgs) {
        var searchStr = resolvedArgs[0];
        var suffix = resolvedArgs[1];
        return searchStr.indexOf(suffix, searchStr.length - suffix.length) !== -1;
    },

    _functionReverse: function(resolvedArgs) {
        var typeName = this._getTypeName(resolvedArgs[0]);
        if (typeName === TYPE_STRING) {
          var originalStr = resolvedArgs[0];
          var reversedStr = "";
          for (var i = originalStr.length - 1; i >= 0; i--) {
              reversedStr += originalStr[i];
          }
          return reversedStr;
        } else {
          var reversedArray = resolvedArgs[0].slice(0);
          reversedArray.reverse();
          return reversedArray;
        }
    },

    _functionAbs: function(resolvedArgs) {
      return Math.abs(resolvedArgs[0]);
    },

    _functionCeil: function(resolvedArgs) {
        return Math.ceil(resolvedArgs[0]);
    },

    _functionAvg: function(resolvedArgs) {
        var sum = 0;
        var inputArray = resolvedArgs[0];
        for (var i = 0; i < inputArray.length; i++) {
            sum += inputArray[i];
        }
        return sum / inputArray.length;
    },

    _functionContains: function(resolvedArgs) {
        return resolvedArgs[0].indexOf(resolvedArgs[1]) >= 0;
    },

    _functionFloor: function(resolvedArgs) {
        return Math.floor(resolvedArgs[0]);
    },

    _functionLength: function(resolvedArgs) {
       if (!isObject(resolvedArgs[0])) {
         return resolvedArgs[0].length;
       } else {
         // As far as I can tell, there's no way to get the length
         // of an object without O(n) iteration through the object.
         return Object.keys(resolvedArgs[0]).length;
       }
    },

    _functionMap: function(resolvedArgs) {
      var mapped = [];
      var interpreter = this._interpreter;
      var exprefNode = resolvedArgs[0];
      var elements = resolvedArgs[1];
      for (var i = 0; i < elements.length; i++) {
          mapped.push(interpreter.visit(exprefNode, elements[i]));
      }
      return mapped;
    },

    _functionMerge: function(resolvedArgs) {
      var merged = {};
      for (var i = 0; i < resolvedArgs.length; i++) {
        var current = resolvedArgs[i];
        for (var key in current) {
          merged[key] = current[key];
        }
      }
      return merged;
    },

    _functionMax: function(resolvedArgs) {
      if (resolvedArgs[0].length > 0) {
        var typeName = this._getTypeName(resolvedArgs[0][0]);
        if (typeName === TYPE_NUMBER) {
          return Math.max.apply(Math, resolvedArgs[0]);
        } else {
          var elements = resolvedArgs[0];
          var maxElement = elements[0];
          for (var i = 1; i < elements.length; i++) {
              if (maxElement.localeCompare(elements[i]) < 0) {
                  maxElement = elements[i];
              }
          }
          return maxElement;
        }
      } else {
          return null;
      }
    },

    _functionMin: function(resolvedArgs) {
      if (resolvedArgs[0].length > 0) {
        var typeName = this._getTypeName(resolvedArgs[0][0]);
        if (typeName === TYPE_NUMBER) {
          return Math.min.apply(Math, resolvedArgs[0]);
        } else {
          var elements = resolvedArgs[0];
          var minElement = elements[0];
          for (var i = 1; i < elements.length; i++) {
              if (elements[i].localeCompare(minElement) < 0) {
                  minElement = elements[i];
              }
          }
          return minElement;
        }
      } else {
        return null;
      }
    },

    _functionSum: function(resolvedArgs) {
      var sum = 0;
      var listToSum = resolvedArgs[0];
      for (var i = 0; i < listToSum.length; i++) {
        sum += listToSum[i];
      }
      return sum;
    },

    _functionType: function(resolvedArgs) {
        switch (this._getTypeName(resolvedArgs[0])) {
          case TYPE_NUMBER:
            return "number";
          case TYPE_STRING:
            return "string";
          case TYPE_ARRAY:
            return "array";
          case TYPE_OBJECT:
            return "object";
          case TYPE_BOOLEAN:
            return "boolean";
          case TYPE_EXPREF:
            return "expref";
          case TYPE_NULL:
            return "null";
        }
    },

    _functionKeys: function(resolvedArgs) {
        return Object.keys(resolvedArgs[0]);
    },

    _functionValues: function(resolvedArgs) {
        var obj = resolvedArgs[0];
        var keys = Object.keys(obj);
        var values = [];
        for (var i = 0; i < keys.length; i++) {
            values.push(obj[keys[i]]);
        }
        return values;
    },

    _functionJoin: function(resolvedArgs) {
        var joinChar = resolvedArgs[0];
        var listJoin = resolvedArgs[1];
        return listJoin.join(joinChar);
    },

    _functionToArray: function(resolvedArgs) {
        if (this._getTypeName(resolvedArgs[0]) === TYPE_ARRAY) {
            return resolvedArgs[0];
        } else {
            return [resolvedArgs[0]];
        }
    },

    _functionToString: function(resolvedArgs) {
        if (this._getTypeName(resolvedArgs[0]) === TYPE_STRING) {
            return resolvedArgs[0];
        } else {
            return JSON.stringify(resolvedArgs[0]);
        }
    },

    _functionToNumber: function(resolvedArgs) {
        var typeName = this._getTypeName(resolvedArgs[0]);
        var convertedValue;
        if (typeName === TYPE_NUMBER) {
            return resolvedArgs[0];
        } else if (typeName === TYPE_STRING) {
            convertedValue = +resolvedArgs[0];
            if (!isNaN(convertedValue)) {
                return convertedValue;
            }
        }
        return null;
    },

    _functionNotNull: function(resolvedArgs) {
        for (var i = 0; i < resolvedArgs.length; i++) {
            if (this._getTypeName(resolvedArgs[i]) !== TYPE_NULL) {
                return resolvedArgs[i];
            }
        }
        return null;
    },

    _functionSort: function(resolvedArgs) {
        var sortedArray = resolvedArgs[0].slice(0);
        sortedArray.sort();
        return sortedArray;
    },

    _functionSortBy: function(resolvedArgs) {
        var sortedArray = resolvedArgs[0].slice(0);
        if (sortedArray.length === 0) {
            return sortedArray;
        }
        var interpreter = this._interpreter;
        var exprefNode = resolvedArgs[1];
        var requiredType = this._getTypeName(
            interpreter.visit(exprefNode, sortedArray[0]));
        if ([TYPE_NUMBER, TYPE_STRING].indexOf(requiredType) < 0) {
            throw new Error("TypeError");
        }
        var that = this;
        // In order to get a stable sort out of an unstable
        // sort algorithm, we decorate/sort/undecorate (DSU)
        // by creating a new list of [index, element] pairs.
        // In the cmp function, if the evaluated elements are
        // equal, then the index will be used as the tiebreaker.
        // After the decorated list has been sorted, it will be
        // undecorated to extract the original elements.
        var decorated = [];
        for (var i = 0; i < sortedArray.length; i++) {
          decorated.push([i, sortedArray[i]]);
        }
        decorated.sort(function(a, b) {
          var exprA = interpreter.visit(exprefNode, a[1]);
          var exprB = interpreter.visit(exprefNode, b[1]);
          if (that._getTypeName(exprA) !== requiredType) {
              throw new Error(
                  "TypeError: expected " + requiredType + ", received " +
                  that._getTypeName(exprA));
          } else if (that._getTypeName(exprB) !== requiredType) {
              throw new Error(
                  "TypeError: expected " + requiredType + ", received " +
                  that._getTypeName(exprB));
          }
          if (exprA > exprB) {
            return 1;
          } else if (exprA < exprB) {
            return -1;
          } else {
            // If they're equal compare the items by their
            // order to maintain relative order of equal keys
            // (i.e. to get a stable sort).
            return a[0] - b[0];
          }
        });
        // Undecorate: extract out the original list elements.
        for (var j = 0; j < decorated.length; j++) {
          sortedArray[j] = decorated[j][1];
        }
        return sortedArray;
    },

    _functionMaxBy: function(resolvedArgs) {
      var exprefNode = resolvedArgs[1];
      var resolvedArray = resolvedArgs[0];
      var keyFunction = this.createKeyFunction(exprefNode, [TYPE_NUMBER, TYPE_STRING]);
      var maxNumber = -Infinity;
      var maxRecord;
      var current;
      for (var i = 0; i < resolvedArray.length; i++) {
        current = keyFunction(resolvedArray[i]);
        if (current > maxNumber) {
          maxNumber = current;
          maxRecord = resolvedArray[i];
        }
      }
      return maxRecord;
    },

    _functionMinBy: function(resolvedArgs) {
      var exprefNode = resolvedArgs[1];
      var resolvedArray = resolvedArgs[0];
      var keyFunction = this.createKeyFunction(exprefNode, [TYPE_NUMBER, TYPE_STRING]);
      var minNumber = Infinity;
      var minRecord;
      var current;
      for (var i = 0; i < resolvedArray.length; i++) {
        current = keyFunction(resolvedArray[i]);
        if (current < minNumber) {
          minNumber = current;
          minRecord = resolvedArray[i];
        }
      }
      return minRecord;
    },

    createKeyFunction: function(exprefNode, allowedTypes) {
      var that = this;
      var interpreter = this._interpreter;
      var keyFunc = function(x) {
        var current = interpreter.visit(exprefNode, x);
        if (allowedTypes.indexOf(that._getTypeName(current)) < 0) {
          var msg = "TypeError: expected one of " + allowedTypes +
                    ", received " + that._getTypeName(current);
          throw new Error(msg);
        }
        return current;
      };
      return keyFunc;
    }

  };

  function compile(stream$$1) {
    var parser = new Parser();
    var ast = parser.parse(stream$$1);
    return ast;
  }

  function tokenize(stream$$1) {
      var lexer = new Lexer();
      return lexer.tokenize(stream$$1);
  }

  function search(data, expression) {
      var parser = new Parser();
      // This needs to be improved.  Both the interpreter and runtime depend on
      // each other.  The runtime needs the interpreter to support exprefs.
      // There's likely a clean way to avoid the cyclic dependency.
      var runtime = new Runtime();
      var interpreter = new TreeInterpreter(runtime);
      runtime._interpreter = interpreter;
      var node = parser.parse(expression);
      return interpreter.search(node, data);
  }

  exports.tokenize = tokenize;
  exports.compile = compile;
  exports.search = search;
  exports.strictDeepEqual = strictDeepEqual;
})(exports);
});

var inherit$2 = core.util.inherit;
var domain$1 = core.util.domain;


/**
 * @api private
 */
var hardErrorStates = {success: 1, error: 1, complete: 1};

function isTerminalState(machine) {
  return Object.prototype.hasOwnProperty.call(hardErrorStates, machine._asm.currentState);
}

var fsm = new state_machine();
fsm.setupStates = function() {
  var transition = function(_, done) {
    var self = this;
    self._haltHandlersOnError = false;

    self.emit(self._asm.currentState, function(err) {
      if (err) {
        if (isTerminalState(self)) {
          if (domain$1 && self.domain instanceof domain$1.Domain) {
            err.domainEmitter = self;
            err.domain = self.domain;
            err.domainThrown = false;
            self.domain.emit('error', err);
          } else {
            throw err;
          }
        } else {
          self.response.error = err;
          done(err);
        }
      } else {
        done(self.response.error);
      }
    });

  };

  this.addState('validate', 'build', 'error', transition);
  this.addState('build', 'afterBuild', 'restart', transition);
  this.addState('afterBuild', 'sign', 'restart', transition);
  this.addState('sign', 'send', 'retry', transition);
  this.addState('retry', 'afterRetry', 'afterRetry', transition);
  this.addState('afterRetry', 'sign', 'error', transition);
  this.addState('send', 'validateResponse', 'retry', transition);
  this.addState('validateResponse', 'extractData', 'extractError', transition);
  this.addState('extractError', 'extractData', 'retry', transition);
  this.addState('extractData', 'success', 'retry', transition);
  this.addState('restart', 'build', 'error', transition);
  this.addState('success', 'complete', 'complete', transition);
  this.addState('error', 'complete', 'complete', transition);
  this.addState('complete', null, null, transition);
};
fsm.setupStates();

/**
 * ## Asynchronous Requests
 *
 * All requests made through the SDK are asynchronous and use a
 * callback interface. Each service method that kicks off a request
 * returns an `AWS.Request` object that you can use to register
 * callbacks.
 *
 * For example, the following service method returns the request
 * object as "request", which can be used to register callbacks:
 *
 * ```javascript
 * // request is an AWS.Request object
 * var request = ec2.describeInstances();
 *
 * // register callbacks on request to retrieve response data
 * request.on('success', function(response) {
 *   console.log(response.data);
 * });
 * ```
 *
 * When a request is ready to be sent, the {send} method should
 * be called:
 *
 * ```javascript
 * request.send();
 * ```
 *
 * Since registered callbacks may or may not be idempotent, requests should only
 * be sent once. To perform the same operation multiple times, you will need to
 * create multiple request objects, each with its own registered callbacks.
 *
 * ## Removing Default Listeners for Events
 *
 * Request objects are built with default listeners for the various events,
 * depending on the service type. In some cases, you may want to remove
 * some built-in listeners to customize behaviour. Doing this requires
 * access to the built-in listener functions, which are exposed through
 * the {AWS.EventListeners.Core} namespace. For instance, you may
 * want to customize the HTTP handler used when sending a request. In this
 * case, you can remove the built-in listener associated with the 'send'
 * event, the {AWS.EventListeners.Core.SEND} listener and add your own.
 *
 * ## Multiple Callbacks and Chaining
 *
 * You can register multiple callbacks on any request object. The
 * callbacks can be registered for different events, or all for the
 * same event. In addition, you can chain callback registration, for
 * example:
 *
 * ```javascript
 * request.
 *   on('success', function(response) {
 *     console.log("Success!");
 *   }).
 *   on('error', function(response) {
 *     console.log("Error!");
 *   }).
 *   on('complete', function(response) {
 *     console.log("Always!");
 *   }).
 *   send();
 * ```
 *
 * The above example will print either "Success! Always!", or "Error! Always!",
 * depending on whether the request succeeded or not.
 *
 * @!attribute httpRequest
 *   @readonly
 *   @!group HTTP Properties
 *   @return [AWS.HttpRequest] the raw HTTP request object
 *     containing request headers and body information
 *     sent by the service.
 *
 * @!attribute startTime
 *   @readonly
 *   @!group Operation Properties
 *   @return [Date] the time that the request started
 *
 * @!group Request Building Events
 *
 * @!event validate(request)
 *   Triggered when a request is being validated. Listeners
 *   should throw an error if the request should not be sent.
 *   @param request [Request] the request object being sent
 *   @see AWS.EventListeners.Core.VALIDATE_CREDENTIALS
 *   @see AWS.EventListeners.Core.VALIDATE_REGION
 *   @example Ensuring that a certain parameter is set before sending a request
 *     var req = s3.putObject(params);
 *     req.on('validate', function() {
 *       if (!req.params.Body.match(/^Hello\s/)) {
 *         throw new Error('Body must start with "Hello "');
 *       }
 *     });
 *     req.send(function(err, data) { ... });
 *
 * @!event build(request)
 *   Triggered when the request payload is being built. Listeners
 *   should fill the necessary information to send the request
 *   over HTTP.
 *   @param (see AWS.Request~validate)
 *   @example Add a custom HTTP header to a request
 *     var req = s3.putObject(params);
 *     req.on('build', function() {
 *       req.httpRequest.headers['Custom-Header'] = 'value';
 *     });
 *     req.send(function(err, data) { ... });
 *
 * @!event sign(request)
 *   Triggered when the request is being signed. Listeners should
 *   add the correct authentication headers and/or adjust the body,
 *   depending on the authentication mechanism being used.
 *   @param (see AWS.Request~validate)
 *
 * @!group Request Sending Events
 *
 * @!event send(response)
 *   Triggered when the request is ready to be sent. Listeners
 *   should call the underlying transport layer to initiate
 *   the sending of the request.
 *   @param response [Response] the response object
 *   @context [Request] the request object that was sent
 *   @see AWS.EventListeners.Core.SEND
 *
 * @!event retry(response)
 *   Triggered when a request failed and might need to be retried or redirected.
 *   If the response is retryable, the listener should set the
 *   `response.error.retryable` property to `true`, and optionally set
 *   `response.error.retryDelay` to the millisecond delay for the next attempt.
 *   In the case of a redirect, `response.error.redirect` should be set to
 *   `true` with `retryDelay` set to an optional delay on the next request.
 *
 *   If a listener decides that a request should not be retried,
 *   it should set both `retryable` and `redirect` to false.
 *
 *   Note that a retryable error will be retried at most
 *   {AWS.Config.maxRetries} times (based on the service object's config).
 *   Similarly, a request that is redirected will only redirect at most
 *   {AWS.Config.maxRedirects} times.
 *
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *   @example Adding a custom retry for a 404 response
 *     request.on('retry', function(response) {
 *       // this resource is not yet available, wait 10 seconds to get it again
 *       if (response.httpResponse.statusCode === 404 && response.error) {
 *         response.error.retryable = true;   // retry this error
 *         response.error.retryDelay = 10000; // wait 10 seconds
 *       }
 *     });
 *
 * @!group Data Parsing Events
 *
 * @!event extractError(response)
 *   Triggered on all non-2xx requests so that listeners can extract
 *   error details from the response body. Listeners to this event
 *   should set the `response.error` property.
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @!event extractData(response)
 *   Triggered in successful requests to allow listeners to
 *   de-serialize the response body into `response.data`.
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @!group Completion Events
 *
 * @!event success(response)
 *   Triggered when the request completed successfully.
 *   `response.data` will contain the response data and
 *   `response.error` will be null.
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @!event error(error, response)
 *   Triggered when an error occurs at any point during the
 *   request. `response.error` will contain details about the error
 *   that occurred. `response.data` will be null.
 *   @param error [Error] the error object containing details about
 *     the error that occurred.
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @!event complete(response)
 *   Triggered whenever a request cycle completes. `response.error`
 *   should be checked, since the request may have failed.
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @!group HTTP Events
 *
 * @!event httpHeaders(statusCode, headers, response, statusMessage)
 *   Triggered when headers are sent by the remote server
 *   @param statusCode [Integer] the HTTP response code
 *   @param headers [map<String,String>] the response headers
 *   @param (see AWS.Request~send)
 *   @param statusMessage [String] A status message corresponding to the HTTP
 *                                 response code
 *   @context (see AWS.Request~send)
 *
 * @!event httpData(chunk, response)
 *   Triggered when data is sent by the remote server
 *   @param chunk [Buffer] the buffer data containing the next data chunk
 *     from the server
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *   @see AWS.EventListeners.Core.HTTP_DATA
 *
 * @!event httpUploadProgress(progress, response)
 *   Triggered when the HTTP request has uploaded more data
 *   @param progress [map] An object containing the `loaded` and `total` bytes
 *     of the request.
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *   @note This event will not be emitted in Node.js 0.8.x.
 *
 * @!event httpDownloadProgress(progress, response)
 *   Triggered when the HTTP request has downloaded more data
 *   @param progress [map] An object containing the `loaded` and `total` bytes
 *     of the request.
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *   @note This event will not be emitted in Node.js 0.8.x.
 *
 * @!event httpError(error, response)
 *   Triggered when the HTTP request failed
 *   @param error [Error] the error object that was thrown
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @!event httpDone(response)
 *   Triggered when the server is finished sending data
 *   @param (see AWS.Request~send)
 *   @context (see AWS.Request~send)
 *
 * @see AWS.Response
 */
core.Request = inherit$2({

  /**
   * Creates a request for an operation on a given service with
   * a set of input parameters.
   *
   * @param service [AWS.Service] the service to perform the operation on
   * @param operation [String] the operation to perform on the service
   * @param params [Object] parameters to send to the operation.
   *   See the operation's documentation for the format of the
   *   parameters.
   */
  constructor: function Request(service, operation, params) {
    var endpoint = service.endpoint;
    var region = service.config.region;
    var customUserAgent = service.config.customUserAgent;

    // global endpoints sign as us-east-1
    if (service.isGlobalEndpoint) region = 'us-east-1';

    this.domain = domain$1 && domain$1.active;
    this.service = service;
    this.operation = operation;
    this.params = params || {};
    this.httpRequest = new core.HttpRequest(endpoint, region);
    this.httpRequest.appendToUserAgent(customUserAgent);
    this.startTime = service.getSkewCorrectedDate();

    this.response = new core.Response(this);
    this._asm = new state_machine(fsm.states, 'validate');
    this._haltHandlersOnError = false;

    core.SequentialExecutor.call(this);
    this.emit = this.emitEvent;
  },

  /**
   * @!group Sending a Request
   */

  /**
   * @overload send(callback = null)
   *   Sends the request object.
   *
   *   @callback callback function(err, data)
   *     If a callback is supplied, it is called when a response is returned
   *     from the service.
   *     @context [AWS.Request] the request object being sent.
   *     @param err [Error] the error object returned from the request.
   *       Set to `null` if the request is successful.
   *     @param data [Object] the de-serialized data returned from
   *       the request. Set to `null` if a request error occurs.
   *   @example Sending a request with a callback
   *     request = s3.putObject({Bucket: 'bucket', Key: 'key'});
   *     request.send(function(err, data) { console.log(err, data); });
   *   @example Sending a request with no callback (using event handlers)
   *     request = s3.putObject({Bucket: 'bucket', Key: 'key'});
   *     request.on('complete', function(response) { ... }); // register a callback
   *     request.send();
   */
  send: function send(callback) {
    if (callback) {
      // append to user agent
      this.httpRequest.appendToUserAgent('callback');
      this.on('complete', function (resp) {
        callback.call(resp, resp.error, resp.data);
      });
    }
    this.runTo();

    return this.response;
  },

  /**
   * @!method  promise()
   *   Sends the request and returns a 'thenable' promise.
   *
   *   Two callbacks can be provided to the `then` method on the returned promise.
   *   The first callback will be called if the promise is fulfilled, and the second
   *   callback will be called if the promise is rejected.
   *   @callback fulfilledCallback function(data)
   *     Called if the promise is fulfilled.
   *     @param data [Object] the de-serialized data returned from the request.
   *   @callback rejectedCallback function(error)
   *     Called if the promise is rejected.
   *     @param error [Error] the error object returned from the request.
   *   @return [Promise] A promise that represents the state of the request.
   *   @example Sending a request using promises.
   *     var request = s3.putObject({Bucket: 'bucket', Key: 'key'});
   *     var result = request.promise();
   *     result.then(function(data) { ... }, function(error) { ... });
   */

  /**
   * @api private
   */
  build: function build(callback) {
    return this.runTo('send', callback);
  },

  /**
   * @api private
   */
  runTo: function runTo(state, done) {
    this._asm.runTo(state, done, this);
    return this;
  },

  /**
   * Aborts a request, emitting the error and complete events.
   *
   * @!macro nobrowser
   * @example Aborting a request after sending
   *   var params = {
   *     Bucket: 'bucket', Key: 'key',
   *     Body: new Buffer(1024 * 1024 * 5) // 5MB payload
   *   };
   *   var request = s3.putObject(params);
   *   request.send(function (err, data) {
   *     if (err) console.log("Error:", err.code, err.message);
   *     else console.log(data);
   *   });
   *
   *   // abort request in 1 second
   *   setTimeout(request.abort.bind(request), 1000);
   *
   *   // prints "Error: RequestAbortedError Request aborted by user"
   * @return [AWS.Request] the same request object, for chaining.
   * @since v1.4.0
   */
  abort: function abort() {
    this.removeAllListeners('validateResponse');
    this.removeAllListeners('extractError');
    this.on('validateResponse', function addAbortedError(resp) {
      resp.error = core.util.error(new Error('Request aborted by user'), {
         code: 'RequestAbortedError', retryable: false
      });
    });

    if (this.httpRequest.stream && !this.httpRequest.stream.didCallback) { // abort HTTP stream
      this.httpRequest.stream.abort();
      if (this.httpRequest._abortCallback) {
         this.httpRequest._abortCallback();
      } else {
        this.removeAllListeners('send'); // haven't sent yet, so let's not
      }
    }

    return this;
  },

  /**
   * Iterates over each page of results given a pageable request, calling
   * the provided callback with each page of data. After all pages have been
   * retrieved, the callback is called with `null` data.
   *
   * @note This operation can generate multiple requests to a service.
   * @example Iterating over multiple pages of objects in an S3 bucket
   *   var pages = 1;
   *   s3.listObjects().eachPage(function(err, data) {
   *     if (err) return;
   *     console.log("Page", pages++);
   *     console.log(data);
   *   });
   * @example Iterating over multiple pages with an asynchronous callback
   *   s3.listObjects(params).eachPage(function(err, data, done) {
   *     doSomethingAsyncAndOrExpensive(function() {
   *       // The next page of results isn't fetched until done is called
   *       done();
   *     });
   *   });
   * @callback callback function(err, data, [doneCallback])
   *   Called with each page of resulting data from the request. If the
   *   optional `doneCallback` is provided in the function, it must be called
   *   when the callback is complete.
   *
   *   @param err [Error] an error object, if an error occurred.
   *   @param data [Object] a single page of response data. If there is no
   *     more data, this object will be `null`.
   *   @param doneCallback [Function] an optional done callback. If this
   *     argument is defined in the function declaration, it should be called
   *     when the next page is ready to be retrieved. This is useful for
   *     controlling serial pagination across asynchronous operations.
   *   @return [Boolean] if the callback returns `false`, pagination will
   *     stop.
   *
   * @see AWS.Request.eachItem
   * @see AWS.Response.nextPage
   * @since v1.4.0
   */
  eachPage: function eachPage(callback) {
    // Make all callbacks async-ish
    callback = core.util.fn.makeAsync(callback, 3);

    function wrappedCallback(response) {
      callback.call(response, response.error, response.data, function (result) {
        if (result === false) return;

        if (response.hasNextPage()) {
          response.nextPage().on('complete', wrappedCallback).send();
        } else {
          callback.call(response, null, null, core.util.fn.noop);
        }
      });
    }

    this.on('complete', wrappedCallback).send();
  },

  /**
   * Enumerates over individual items of a request, paging the responses if
   * necessary.
   *
   * @api experimental
   * @since v1.4.0
   */
  eachItem: function eachItem(callback) {
    var self = this;
    function wrappedCallback(err, data) {
      if (err) return callback(err, null);
      if (data === null) return callback(null, null);

      var config = self.service.paginationConfig(self.operation);
      var resultKey = config.resultKey;
      if (Array.isArray(resultKey)) resultKey = resultKey[0];
      var items = jmespath.search(data, resultKey);
      var continueIteration = true;
      core.util.arrayEach(items, function(item) {
        continueIteration = callback(null, item);
        if (continueIteration === false) {
          return core.util.abort;
        }
      });
      return continueIteration;
    }

    this.eachPage(wrappedCallback);
  },

  /**
   * @return [Boolean] whether the operation can return multiple pages of
   *   response data.
   * @see AWS.Response.eachPage
   * @since v1.4.0
   */
  isPageable: function isPageable() {
    return this.service.paginationConfig(this.operation) ? true : false;
  },

  /**
   * Sends the request and converts the request object into a readable stream
   * that can be read from or piped into a writable stream.
   *
   * @note The data read from a readable stream contains only
   *   the raw HTTP body contents.
   * @example Manually reading from a stream
   *   request.createReadStream().on('data', function(data) {
   *     console.log("Got data:", data.toString());
   *   });
   * @example Piping a request body into a file
   *   var out = fs.createWriteStream('/path/to/outfile.jpg');
   *   s3.service.getObject(params).createReadStream().pipe(out);
   * @return [Stream] the readable stream object that can be piped
   *   or read from (by registering 'data' event listeners).
   * @!macro nobrowser
   */
  createReadStream: function createReadStream() {
    var streams = core.util.stream;
    var req = this;
    var stream$$1 = null;

    if (core.HttpClient.streamsApiVersion === 2) {
      stream$$1 = new streams.PassThrough();
      process.nextTick(function() { req.send(); });
    } else {
      stream$$1 = new streams.Stream();
      stream$$1.readable = true;

      stream$$1.sent = false;
      stream$$1.on('newListener', function(event) {
        if (!stream$$1.sent && event === 'data') {
          stream$$1.sent = true;
          process.nextTick(function() { req.send(); });
        }
      });
    }

    this.on('error', function(err) {
      stream$$1.emit('error', err);
    });

    this.on('httpHeaders', function streamHeaders(statusCode, headers, resp) {
      if (statusCode < 300) {
        req.removeListener('httpData', core.EventListeners.Core.HTTP_DATA);
        req.removeListener('httpError', core.EventListeners.Core.HTTP_ERROR);
        req.on('httpError', function streamHttpError(error) {
          resp.error = error;
          resp.error.retryable = false;
        });

        var shouldCheckContentLength = false;
        var expectedLen;
        if (req.httpRequest.method !== 'HEAD') {
          expectedLen = parseInt(headers['content-length'], 10);
        }
        if (expectedLen !== undefined && !isNaN(expectedLen) && expectedLen >= 0) {
          shouldCheckContentLength = true;
          var receivedLen = 0;
        }

        var checkContentLengthAndEmit = function checkContentLengthAndEmit() {
          if (shouldCheckContentLength && receivedLen !== expectedLen) {
            stream$$1.emit('error', core.util.error(
              new Error('Stream content length mismatch. Received ' +
                receivedLen + ' of ' + expectedLen + ' bytes.'),
              { code: 'StreamContentLengthMismatch' }
            ));
          } else if (core.HttpClient.streamsApiVersion === 2) {
            stream$$1.end();
          } else {
            stream$$1.emit('end');
          }
        };

        var httpStream = resp.httpResponse.createUnbufferedStream();

        if (core.HttpClient.streamsApiVersion === 2) {
          if (shouldCheckContentLength) {
            var lengthAccumulator = new streams.PassThrough();
            lengthAccumulator._write = function(chunk) {
              if (chunk && chunk.length) {
                receivedLen += chunk.length;
              }
              return streams.PassThrough.prototype._write.apply(this, arguments);
            };

            lengthAccumulator.on('end', checkContentLengthAndEmit);
            stream$$1.on('error', function(err) {
              shouldCheckContentLength = false;
              httpStream.unpipe(lengthAccumulator);
              lengthAccumulator.emit('end');
              lengthAccumulator.end();
            });
            httpStream.pipe(lengthAccumulator).pipe(stream$$1, { end: false });
          } else {
            httpStream.pipe(stream$$1);
          }
        } else {

          if (shouldCheckContentLength) {
            httpStream.on('data', function(arg) {
              if (arg && arg.length) {
                receivedLen += arg.length;
              }
            });
          }

          httpStream.on('data', function(arg) {
            stream$$1.emit('data', arg);
          });
          httpStream.on('end', checkContentLengthAndEmit);
        }

        httpStream.on('error', function(err) {
          shouldCheckContentLength = false;
          stream$$1.emit('error', err);
        });
      }
    });

    return stream$$1;
  },

  /**
   * @param [Array,Response] args This should be the response object,
   *   or an array of args to send to the event.
   * @api private
   */
  emitEvent: function emit(eventName, args, done) {
    if (typeof args === 'function') { done = args; args = null; }
    if (!done) done = function() { };
    if (!args) args = this.eventParameters(eventName, this.response);

    var origEmit = core.SequentialExecutor.prototype.emit;
    origEmit.call(this, eventName, args, function (err) {
      if (err) this.response.error = err;
      done.call(this, err);
    });
  },

  /**
   * @api private
   */
  eventParameters: function eventParameters(eventName) {
    switch (eventName) {
      case 'restart':
      case 'validate':
      case 'sign':
      case 'build':
      case 'afterValidate':
      case 'afterBuild':
        return [this];
      case 'error':
        return [this.response.error, this.response];
      default:
        return [this.response];
    }
  },

  /**
   * @api private
   */
  presign: function presign(expires, callback) {
    if (!callback && typeof expires === 'function') {
      callback = expires;
      expires = null;
    }
    return new core.Signers.Presign().sign(this.toGet(), expires, callback);
  },

  /**
   * @api private
   */
  isPresigned: function isPresigned() {
    return Object.prototype.hasOwnProperty.call(this.httpRequest.headers, 'presigned-expires');
  },

  /**
   * @api private
   */
  toUnauthenticated: function toUnauthenticated() {
    this.removeListener('validate', core.EventListeners.Core.VALIDATE_CREDENTIALS);
    this.removeListener('sign', core.EventListeners.Core.SIGN);
    return this;
  },

  /**
   * @api private
   */
  toGet: function toGet() {
    if (this.service.api.protocol === 'query' ||
        this.service.api.protocol === 'ec2') {
      this.removeListener('build', this.buildAsGet);
      this.addListener('build', this.buildAsGet);
    }
    return this;
  },

  /**
   * @api private
   */
  buildAsGet: function buildAsGet(request) {
    request.httpRequest.method = 'GET';
    request.httpRequest.path = request.service.endpoint.path +
                               '?' + request.httpRequest.body;
    request.httpRequest.body = '';

    // don't need these headers on a GET request
    delete request.httpRequest.headers['Content-Length'];
    delete request.httpRequest.headers['Content-Type'];
  },

  /**
   * @api private
   */
  haltHandlersOnError: function haltHandlersOnError() {
    this._haltHandlersOnError = true;
  }
});

/**
 * @api private
 */
core.Request.addPromisesToClass = function addPromisesToClass(PromiseDependency) {
  this.prototype.promise = function promise() {
    var self = this;
    // append to user agent
    this.httpRequest.appendToUserAgent('promise');
    return new PromiseDependency(function(resolve, reject) {
      self.on('complete', function(resp) {
        if (resp.error) {
          reject(resp.error);
        } else {
          // define $response property so that it is not enumberable
          // this prevents circular reference errors when stringifying the JSON object
          resolve(Object.defineProperty(
            resp.data || {},
            '$response',
            {value: resp}
          ));
        }
      });
      self.runTo();
    });
  };
};

/**
 * @api private
 */
core.Request.deletePromisesFromClass = function deletePromisesFromClass() {
  delete this.prototype.promise;
};

core.util.addPromises(core.Request);

core.util.mixin(core.Request, core.SequentialExecutor);

var inherit$3 = core.util.inherit;


/**
 * This class encapsulates the response information
 * from a service request operation sent through {AWS.Request}.
 * The response object has two main properties for getting information
 * back from a request:
 *
 * ## The `data` property
 *
 * The `response.data` property contains the serialized object data
 * retrieved from the service request. For instance, for an
 * Amazon DynamoDB `listTables` method call, the response data might
 * look like:
 *
 * ```
 * > resp.data
 * { TableNames:
 *    [ 'table1', 'table2', ... ] }
 * ```
 *
 * The `data` property can be null if an error occurs (see below).
 *
 * ## The `error` property
 *
 * In the event of a service error (or transfer error), the
 * `response.error` property will be filled with the given
 * error data in the form:
 *
 * ```
 * { code: 'SHORT_UNIQUE_ERROR_CODE',
 *   message: 'Some human readable error message' }
 * ```
 *
 * In the case of an error, the `data` property will be `null`.
 * Note that if you handle events that can be in a failure state,
 * you should always check whether `response.error` is set
 * before attempting to access the `response.data` property.
 *
 * @!attribute data
 *   @readonly
 *   @!group Data Properties
 *   @note Inside of a {AWS.Request~httpData} event, this
 *     property contains a single raw packet instead of the
 *     full de-serialized service response.
 *   @return [Object] the de-serialized response data
 *     from the service.
 *
 * @!attribute error
 *   An structure containing information about a service
 *   or networking error.
 *   @readonly
 *   @!group Data Properties
 *   @note This attribute is only filled if a service or
 *     networking error occurs.
 *   @return [Error]
 *     * code [String] a unique short code representing the
 *       error that was emitted.
 *     * message [String] a longer human readable error message
 *     * retryable [Boolean] whether the error message is
 *       retryable.
 *     * statusCode [Numeric] in the case of a request that reached the service,
 *       this value contains the response status code.
 *     * time [Date] the date time object when the error occurred.
 *     * hostname [String] set when a networking error occurs to easily
 *       identify the endpoint of the request.
 *     * region [String] set when a networking error occurs to easily
 *       identify the region of the request.
 *
 * @!attribute requestId
 *   @readonly
 *   @!group Data Properties
 *   @return [String] the unique request ID associated with the response.
 *     Log this value when debugging requests for AWS support.
 *
 * @!attribute retryCount
 *   @readonly
 *   @!group Operation Properties
 *   @return [Integer] the number of retries that were
 *     attempted before the request was completed.
 *
 * @!attribute redirectCount
 *   @readonly
 *   @!group Operation Properties
 *   @return [Integer] the number of redirects that were
 *     followed before the request was completed.
 *
 * @!attribute httpResponse
 *   @readonly
 *   @!group HTTP Properties
 *   @return [AWS.HttpResponse] the raw HTTP response object
 *     containing the response headers and body information
 *     from the server.
 *
 * @see AWS.Request
 */
core.Response = inherit$3({

  /**
   * @api private
   */
  constructor: function Response(request) {
    this.request = request;
    this.data = null;
    this.error = null;
    this.retryCount = 0;
    this.redirectCount = 0;
    this.httpResponse = new core.HttpResponse();
    if (request) {
      this.maxRetries = request.service.numRetries();
      this.maxRedirects = request.service.config.maxRedirects;
    }
  },

  /**
   * Creates a new request for the next page of response data, calling the
   * callback with the page data if a callback is provided.
   *
   * @callback callback function(err, data)
   *   Called when a page of data is returned from the next request.
   *
   *   @param err [Error] an error object, if an error occurred in the request
   *   @param data [Object] the next page of data, or null, if there are no
   *     more pages left.
   * @return [AWS.Request] the request object for the next page of data
   * @return [null] if no callback is provided and there are no pages left
   *   to retrieve.
   * @since v1.4.0
   */
  nextPage: function nextPage(callback) {
    var config;
    var service = this.request.service;
    var operation = this.request.operation;
    try {
      config = service.paginationConfig(operation, true);
    } catch (e) { this.error = e; }

    if (!this.hasNextPage()) {
      if (callback) callback(this.error, null);
      else if (this.error) throw this.error;
      return null;
    }

    var params = core.util.copy(this.request.params);
    if (!this.nextPageTokens) {
      return callback ? callback(null, null) : null;
    } else {
      var inputTokens = config.inputToken;
      if (typeof inputTokens === 'string') inputTokens = [inputTokens];
      for (var i = 0; i < inputTokens.length; i++) {
        params[inputTokens[i]] = this.nextPageTokens[i];
      }
      return service.makeRequest(this.request.operation, params, callback);
    }
  },

  /**
   * @return [Boolean] whether more pages of data can be returned by further
   *   requests
   * @since v1.4.0
   */
  hasNextPage: function hasNextPage() {
    this.cacheNextPageTokens();
    if (this.nextPageTokens) return true;
    if (this.nextPageTokens === undefined) return undefined;
    else return false;
  },

  /**
   * @api private
   */
  cacheNextPageTokens: function cacheNextPageTokens() {
    if (Object.prototype.hasOwnProperty.call(this, 'nextPageTokens')) return this.nextPageTokens;
    this.nextPageTokens = undefined;

    var config = this.request.service.paginationConfig(this.request.operation);
    if (!config) return this.nextPageTokens;

    this.nextPageTokens = null;
    if (config.moreResults) {
      if (!jmespath.search(this.data, config.moreResults)) {
        return this.nextPageTokens;
      }
    }

    var exprs = config.outputToken;
    if (typeof exprs === 'string') exprs = [exprs];
    core.util.arrayEach.call(this, exprs, function (expr) {
      var output = jmespath.search(this.data, expr);
      if (output) {
        this.nextPageTokens = this.nextPageTokens || [];
        this.nextPageTokens.push(output);
      }
    });

    return this.nextPageTokens;
  }

});

/**
 * Copyright 2012-2013 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You
 * may not use this file except in compliance with the License. A copy of
 * the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */


var inherit$4 = core.util.inherit;


/**
 * @api private
 */
function CHECK_ACCEPTORS(resp) {
  var waiter = resp.request._waiter;
  var acceptors = waiter.config.acceptors;
  var acceptorMatched = false;
  var state = 'retry';

  acceptors.forEach(function(acceptor) {
    if (!acceptorMatched) {
      var matcher = waiter.matchers[acceptor.matcher];
      if (matcher && matcher(resp, acceptor.expected, acceptor.argument)) {
        acceptorMatched = true;
        state = acceptor.state;
      }
    }
  });

  if (!acceptorMatched && resp.error) state = 'failure';

  if (state === 'success') {
    waiter.setSuccess(resp);
  } else {
    waiter.setError(resp, state === 'retry');
  }
}

/**
 * @api private
 */
core.ResourceWaiter = inherit$4({
  /**
   * Waits for a given state on a service object
   * @param service [Service] the service object to wait on
   * @param state [String] the state (defined in waiter configuration) to wait
   *   for.
   * @example Create a waiter for running EC2 instances
   *   var ec2 = new AWS.EC2;
   *   var waiter = new AWS.ResourceWaiter(ec2, 'instanceRunning');
   */
  constructor: function constructor(service, state) {
    this.service = service;
    this.state = state;
    this.loadWaiterConfig(this.state);
  },

  service: null,

  state: null,

  config: null,

  matchers: {
    path: function(resp, expected, argument) {
      try {
        var result = jmespath.search(resp.data, argument);
      } catch (err) {
        return false;
      }

      return jmespath.strictDeepEqual(result,expected);
    },

    pathAll: function(resp, expected, argument) {
      try {
        var results = jmespath.search(resp.data, argument);
      } catch (err) {
        return false;
      }

      if (!Array.isArray(results)) results = [results];
      var numResults = results.length;
      if (!numResults) return false;
      for (var ind = 0 ; ind < numResults; ind++) {
        if (!jmespath.strictDeepEqual(results[ind], expected)) {
          return false;
        }
      }
      return true;
    },

    pathAny: function(resp, expected, argument) {
      try {
        var results = jmespath.search(resp.data, argument);
      } catch (err) {
        return false;
      }

      if (!Array.isArray(results)) results = [results];
      var numResults = results.length;
      for (var ind = 0 ; ind < numResults; ind++) {
        if (jmespath.strictDeepEqual(results[ind], expected)) {
          return true;
        }
      }
      return false;
    },

    status: function(resp, expected) {
      var statusCode = resp.httpResponse.statusCode;
      return (typeof statusCode === 'number') && (statusCode === expected);
    },

    error: function(resp, expected) {
      if (typeof expected === 'string' && resp.error) {
        return expected === resp.error.code;
      }
      // if expected is not string, can be boolean indicating presence of error
      return expected === !!resp.error;
    }
  },

  listeners: new core.SequentialExecutor().addNamedListeners(function(add) {
    add('RETRY_CHECK', 'retry', function(resp) {
      var waiter = resp.request._waiter;
      if (resp.error && resp.error.code === 'ResourceNotReady') {
        resp.error.retryDelay = (waiter.config.delay || 0) * 1000;
      }
    });

    add('CHECK_OUTPUT', 'extractData', CHECK_ACCEPTORS);

    add('CHECK_ERROR', 'extractError', CHECK_ACCEPTORS);
  }),

  /**
   * @return [AWS.Request]
   */
  wait: function wait(params, callback) {
    if (typeof params === 'function') {
      callback = params; params = undefined;
    }

    if (params && params.$waiter) {
      params = core.util.copy(params);
      if (typeof params.$waiter.delay === 'number') {
        this.config.delay = params.$waiter.delay;
      }
      if (typeof params.$waiter.maxAttempts === 'number') {
        this.config.maxAttempts = params.$waiter.maxAttempts;
      }
      delete params.$waiter;
    }

    var request = this.service.makeRequest(this.config.operation, params);
    request._waiter = this;
    request.response.maxRetries = this.config.maxAttempts;
    request.addListeners(this.listeners);

    if (callback) request.send(callback);
    return request;
  },

  setSuccess: function setSuccess(resp) {
    resp.error = null;
    resp.data = resp.data || {};
    resp.request.removeAllListeners('extractData');
  },

  setError: function setError(resp, retryable) {
    resp.data = null;
    resp.error = core.util.error(resp.error || new Error(), {
      code: 'ResourceNotReady',
      message: 'Resource is not in the state ' + this.state,
      retryable: retryable
    });
  },

  /**
   * Loads waiter configuration from API configuration
   *
   * @api private
   */
  loadWaiterConfig: function loadWaiterConfig(state) {
    if (!this.service.api.waiters[state]) {
      throw new core.util.error(new Error(), {
        code: 'StateNotFoundError',
        message: 'State ' + state + ' not found.'
      });
    }

    this.config = core.util.copy(this.service.api.waiters[state]);
  }
});

var inherit$6 = core.util.inherit;

/**
 * @api private
 */
core.Signers.V2 = inherit$6(core.Signers.RequestSigner, {
  addAuthorization: function addAuthorization(credentials, date) {

    if (!date) date = core.util.date.getDate();

    var r = this.request;

    r.params.Timestamp = core.util.date.iso8601(date);
    r.params.SignatureVersion = '2';
    r.params.SignatureMethod = 'HmacSHA256';
    r.params.AWSAccessKeyId = credentials.accessKeyId;

    if (credentials.sessionToken) {
      r.params.SecurityToken = credentials.sessionToken;
    }

    delete r.params.Signature; // delete old Signature for re-signing
    r.params.Signature = this.signature(credentials);

    r.body = core.util.queryParamsToString(r.params);
    r.headers['Content-Length'] = r.body.length;
  },

  signature: function signature(credentials) {
    return core.util.crypto.hmac(credentials.secretAccessKey, this.stringToSign(), 'base64');
  },

  stringToSign: function stringToSign() {
    var parts = [];
    parts.push(this.request.method);
    parts.push(this.request.endpoint.host.toLowerCase());
    parts.push(this.request.pathname());
    parts.push(core.util.queryParamsToString(this.request.params));
    return parts.join('\n');
  }

});

var v2 = core.Signers.V2;

var inherit$7 = core.util.inherit;

/**
 * @api private
 */
core.Signers.V3 = inherit$7(core.Signers.RequestSigner, {
  addAuthorization: function addAuthorization(credentials, date) {

    var datetime = core.util.date.rfc822(date);

    this.request.headers['X-Amz-Date'] = datetime;

    if (credentials.sessionToken) {
      this.request.headers['x-amz-security-token'] = credentials.sessionToken;
    }

    this.request.headers['X-Amzn-Authorization'] =
      this.authorization(credentials, datetime);

  },

  authorization: function authorization(credentials) {
    return 'AWS3 ' +
      'AWSAccessKeyId=' + credentials.accessKeyId + ',' +
      'Algorithm=HmacSHA256,' +
      'SignedHeaders=' + this.signedHeaders() + ',' +
      'Signature=' + this.signature(credentials);
  },

  signedHeaders: function signedHeaders() {
    var headers = [];
    core.util.arrayEach(this.headersToSign(), function iterator(h) {
      headers.push(h.toLowerCase());
    });
    return headers.sort().join(';');
  },

  canonicalHeaders: function canonicalHeaders() {
    var headers = this.request.headers;
    var parts = [];
    core.util.arrayEach(this.headersToSign(), function iterator(h) {
      parts.push(h.toLowerCase().trim() + ':' + String(headers[h]).trim());
    });
    return parts.sort().join('\n') + '\n';
  },

  headersToSign: function headersToSign() {
    var headers = [];
    core.util.each(this.request.headers, function iterator(k) {
      if (k === 'Host' || k === 'Content-Encoding' || k.match(/^X-Amz/i)) {
        headers.push(k);
      }
    });
    return headers;
  },

  signature: function signature(credentials) {
    return core.util.crypto.hmac(credentials.secretAccessKey, this.stringToSign(), 'base64');
  },

  stringToSign: function stringToSign() {
    var parts = [];
    parts.push(this.request.method);
    parts.push('/');
    parts.push('');
    parts.push(this.canonicalHeaders());
    parts.push(this.request.body);
    return core.util.crypto.sha256(parts.join('\n'));
  }

});

var v3 = core.Signers.V3;

var inherit$8 = core.util.inherit;



/**
 * @api private
 */
core.Signers.V3Https = inherit$8(core.Signers.V3, {
  authorization: function authorization(credentials) {
    return 'AWS3-HTTPS ' +
      'AWSAccessKeyId=' + credentials.accessKeyId + ',' +
      'Algorithm=HmacSHA256,' +
      'Signature=' + this.signature(credentials);
  },

  stringToSign: function stringToSign() {
    return this.request.headers['X-Amz-Date'];
  }
});

var v3https = core.Signers.V3Https;

/**
 * @api private
 */
var cachedSecret = {};

/**
 * @api private
 */
var cacheQueue = [];

/**
 * @api private
 */
var maxCacheEntries = 50;

/**
 * @api private
 */
var v4Identifier = 'aws4_request';

var v4_credentials = {
  /**
   * @api private
   *
   * @param date [String]
   * @param region [String]
   * @param serviceName [String]
   * @return [String]
   */
  createScope: function createScope(date, region, serviceName) {
    return [
      date.substr(0, 8),
      region,
      serviceName,
      v4Identifier
    ].join('/');
  },

  /**
   * @api private
   *
   * @param credentials [Credentials]
   * @param date [String]
   * @param region [String]
   * @param service [String]
   * @param shouldCache [Boolean]
   * @return [String]
   */
  getSigningKey: function getSigningKey(
    credentials,
    date,
    region,
    service,
    shouldCache
  ) {
    var credsIdentifier = core.util.crypto
      .hmac(credentials.secretAccessKey, credentials.accessKeyId, 'base64');
    var cacheKey = [credsIdentifier, date, region, service].join('_');
    shouldCache = shouldCache !== false;
    if (shouldCache && (cacheKey in cachedSecret)) {
      return cachedSecret[cacheKey];
    }

    var kDate = core.util.crypto.hmac(
      'AWS4' + credentials.secretAccessKey,
      date,
      'buffer'
    );
    var kRegion = core.util.crypto.hmac(kDate, region, 'buffer');
    var kService = core.util.crypto.hmac(kRegion, service, 'buffer');

    var signingKey = core.util.crypto.hmac(kService, v4Identifier, 'buffer');
    if (shouldCache) {
      cachedSecret[cacheKey] = signingKey;
      cacheQueue.push(cacheKey);
      if (cacheQueue.length > maxCacheEntries) {
        // remove the oldest entry (not the least recently used)
        delete cachedSecret[cacheQueue.shift()];
      }
    }

    return signingKey;
  },

  /**
   * @api private
   *
   * Empties the derived signing key cache. Made available for testing purposes
   * only.
   */
  emptyCache: function emptyCache() {
    cachedSecret = {};
    cacheQueue = [];
  }
};

var inherit$9 = core.util.inherit;

/**
 * @api private
 */
var expiresHeader = 'presigned-expires';

/**
 * @api private
 */
core.Signers.V4 = inherit$9(core.Signers.RequestSigner, {
  constructor: function V4(request, serviceName, options) {
    core.Signers.RequestSigner.call(this, request);
    this.serviceName = serviceName;
    options = options || {};
    this.signatureCache = typeof options.signatureCache === 'boolean' ? options.signatureCache : true;
    this.operation = options.operation;
  },

  algorithm: 'AWS4-HMAC-SHA256',

  addAuthorization: function addAuthorization(credentials, date) {
    var datetime = core.util.date.iso8601(date).replace(/[:\-]|\.\d{3}/g, '');

    if (this.isPresigned()) {
      this.updateForPresigned(credentials, datetime);
    } else {
      this.addHeaders(credentials, datetime);
    }

    this.request.headers['Authorization'] =
      this.authorization(credentials, datetime);
  },

  addHeaders: function addHeaders(credentials, datetime) {
    this.request.headers['X-Amz-Date'] = datetime;
    if (credentials.sessionToken) {
      this.request.headers['x-amz-security-token'] = credentials.sessionToken;
    }
  },

  updateForPresigned: function updateForPresigned(credentials, datetime) {
    var credString = this.credentialString(datetime);
    var qs = {
      'X-Amz-Date': datetime,
      'X-Amz-Algorithm': this.algorithm,
      'X-Amz-Credential': credentials.accessKeyId + '/' + credString,
      'X-Amz-Expires': this.request.headers[expiresHeader],
      'X-Amz-SignedHeaders': this.signedHeaders()
    };

    if (credentials.sessionToken) {
      qs['X-Amz-Security-Token'] = credentials.sessionToken;
    }

    if (this.request.headers['Content-Type']) {
      qs['Content-Type'] = this.request.headers['Content-Type'];
    }
    if (this.request.headers['Content-MD5']) {
      qs['Content-MD5'] = this.request.headers['Content-MD5'];
    }
    if (this.request.headers['Cache-Control']) {
      qs['Cache-Control'] = this.request.headers['Cache-Control'];
    }

    // need to pull in any other X-Amz-* headers
    core.util.each.call(this, this.request.headers, function(key, value) {
      if (key === expiresHeader) return;
      if (this.isSignableHeader(key)) {
        var lowerKey = key.toLowerCase();
        // Metadata should be normalized
        if (lowerKey.indexOf('x-amz-meta-') === 0) {
          qs[lowerKey] = value;
        } else if (lowerKey.indexOf('x-amz-') === 0) {
          qs[key] = value;
        }
      }
    });

    var sep = this.request.path.indexOf('?') >= 0 ? '&' : '?';
    this.request.path += sep + core.util.queryParamsToString(qs);
  },

  authorization: function authorization(credentials, datetime) {
    var parts = [];
    var credString = this.credentialString(datetime);
    parts.push(this.algorithm + ' Credential=' +
      credentials.accessKeyId + '/' + credString);
    parts.push('SignedHeaders=' + this.signedHeaders());
    parts.push('Signature=' + this.signature(credentials, datetime));
    return parts.join(', ');
  },

  signature: function signature(credentials, datetime) {
    var signingKey = v4_credentials.getSigningKey(
      credentials,
      datetime.substr(0, 8),
      this.request.region,
      this.serviceName,
      this.signatureCache
    );
    return core.util.crypto.hmac(signingKey, this.stringToSign(datetime), 'hex');
  },

  stringToSign: function stringToSign(datetime) {
    var parts = [];
    parts.push('AWS4-HMAC-SHA256');
    parts.push(datetime);
    parts.push(this.credentialString(datetime));
    parts.push(this.hexEncodedHash(this.canonicalString()));
    return parts.join('\n');
  },

  canonicalString: function canonicalString() {
    var parts = [], pathname = this.request.pathname();
    if (this.serviceName !== 's3') pathname = core.util.uriEscapePath(pathname);

    parts.push(this.request.method);
    parts.push(pathname);
    parts.push(this.request.search());
    parts.push(this.canonicalHeaders() + '\n');
    parts.push(this.signedHeaders());
    parts.push(this.hexEncodedBodyHash());
    return parts.join('\n');
  },

  canonicalHeaders: function canonicalHeaders() {
    var headers = [];
    core.util.each.call(this, this.request.headers, function (key, item) {
      headers.push([key, item]);
    });
    headers.sort(function (a, b) {
      return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1;
    });
    var parts = [];
    core.util.arrayEach.call(this, headers, function (item) {
      var key = item[0].toLowerCase();
      if (this.isSignableHeader(key)) {
        var value = item[1];
        if (typeof value === 'undefined' || value === null || typeof value.toString !== 'function') {
          throw core.util.error(new Error('Header ' + key + ' contains invalid value'), {
            code: 'InvalidHeader'
          });
        }
        parts.push(key + ':' +
          this.canonicalHeaderValues(value.toString()));
      }
    });
    return parts.join('\n');
  },

  canonicalHeaderValues: function canonicalHeaderValues(values) {
    return values.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
  },

  signedHeaders: function signedHeaders() {
    var keys = [];
    core.util.each.call(this, this.request.headers, function (key) {
      key = key.toLowerCase();
      if (this.isSignableHeader(key)) keys.push(key);
    });
    return keys.sort().join(';');
  },

  credentialString: function credentialString(datetime) {
    return v4_credentials.createScope(
      datetime.substr(0, 8),
      this.request.region,
      this.serviceName
    );
  },

  hexEncodedHash: function hash(string) {
    return core.util.crypto.sha256(string, 'hex');
  },

  hexEncodedBodyHash: function hexEncodedBodyHash() {
    var request = this.request;
    if (this.isPresigned() && this.serviceName === 's3' && !request.body) {
      return 'UNSIGNED-PAYLOAD';
    } else if (request.headers['X-Amz-Content-Sha256']) {
      return request.headers['X-Amz-Content-Sha256'];
    } else {
      return this.hexEncodedHash(this.request.body || '');
    }
  },

  unsignableHeaders: [
    'authorization',
    'content-type',
    'content-length',
    'user-agent',
    expiresHeader,
    'expect',
    'x-amzn-trace-id'
  ],

  isSignableHeader: function isSignableHeader(key) {
    if (key.toLowerCase().indexOf('x-amz-') === 0) return true;
    return this.unsignableHeaders.indexOf(key) < 0;
  },

  isPresigned: function isPresigned() {
    return this.request.headers[expiresHeader] ? true : false;
  }

});

var v4 = core.Signers.V4;

var inherit$10 = core.util.inherit;

/**
 * @api private
 */
core.Signers.S3 = inherit$10(core.Signers.RequestSigner, {
  /**
   * When building the stringToSign, these sub resource params should be
   * part of the canonical resource string with their NON-decoded values
   */
  subResources: {
    'acl': 1,
    'accelerate': 1,
    'analytics': 1,
    'cors': 1,
    'lifecycle': 1,
    'delete': 1,
    'inventory': 1,
    'location': 1,
    'logging': 1,
    'metrics': 1,
    'notification': 1,
    'partNumber': 1,
    'policy': 1,
    'requestPayment': 1,
    'replication': 1,
    'restore': 1,
    'tagging': 1,
    'torrent': 1,
    'uploadId': 1,
    'uploads': 1,
    'versionId': 1,
    'versioning': 1,
    'versions': 1,
    'website': 1
  },

  // when building the stringToSign, these querystring params should be
  // part of the canonical resource string with their NON-encoded values
  responseHeaders: {
    'response-content-type': 1,
    'response-content-language': 1,
    'response-expires': 1,
    'response-cache-control': 1,
    'response-content-disposition': 1,
    'response-content-encoding': 1
  },

  addAuthorization: function addAuthorization(credentials, date) {
    if (!this.request.headers['presigned-expires']) {
      this.request.headers['X-Amz-Date'] = core.util.date.rfc822(date);
    }

    if (credentials.sessionToken) {
      // presigned URLs require this header to be lowercased
      this.request.headers['x-amz-security-token'] = credentials.sessionToken;
    }

    var signature = this.sign(credentials.secretAccessKey, this.stringToSign());
    var auth = 'AWS ' + credentials.accessKeyId + ':' + signature;

    this.request.headers['Authorization'] = auth;
  },

  stringToSign: function stringToSign() {
    var r = this.request;

    var parts = [];
    parts.push(r.method);
    parts.push(r.headers['Content-MD5'] || '');
    parts.push(r.headers['Content-Type'] || '');

    // This is the "Date" header, but we use X-Amz-Date.
    // The S3 signing mechanism requires us to pass an empty
    // string for this Date header regardless.
    parts.push(r.headers['presigned-expires'] || '');

    var headers = this.canonicalizedAmzHeaders();
    if (headers) parts.push(headers);
    parts.push(this.canonicalizedResource());

    return parts.join('\n');

  },

  canonicalizedAmzHeaders: function canonicalizedAmzHeaders() {

    var amzHeaders = [];

    core.util.each(this.request.headers, function (name) {
      if (name.match(/^x-amz-/i))
        amzHeaders.push(name);
    });

    amzHeaders.sort(function (a, b) {
      return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
    });

    var parts = [];
    core.util.arrayEach.call(this, amzHeaders, function (name) {
      parts.push(name.toLowerCase() + ':' + String(this.request.headers[name]));
    });

    return parts.join('\n');

  },

  canonicalizedResource: function canonicalizedResource() {

    var r = this.request;

    var parts = r.path.split('?');
    var path$$1 = parts[0];
    var querystring$$1 = parts[1];

    var resource = '';

    if (r.virtualHostedBucket)
      resource += '/' + r.virtualHostedBucket;

    resource += path$$1;

    if (querystring$$1) {

      // collect a list of sub resources and query params that need to be signed
      var resources = [];

      core.util.arrayEach.call(this, querystring$$1.split('&'), function (param) {
        var name = param.split('=')[0];
        var value = param.split('=')[1];
        if (this.subResources[name] || this.responseHeaders[name]) {
          var subresource = { name: name };
          if (value !== undefined) {
            if (this.subResources[name]) {
              subresource.value = value;
            } else {
              subresource.value = decodeURIComponent(value);
            }
          }
          resources.push(subresource);
        }
      });

      resources.sort(function (a, b) { return a.name < b.name ? -1 : 1; });

      if (resources.length) {

        querystring$$1 = [];
        core.util.arrayEach(resources, function (res) {
          if (res.value === undefined) {
            querystring$$1.push(res.name);
          } else {
            querystring$$1.push(res.name + '=' + res.value);
          }
        });

        resource += '?' + querystring$$1.join('&');
      }

    }

    return resource;

  },

  sign: function sign(secret, string) {
    return core.util.crypto.hmac(secret, string, 'base64', 'sha1');
  }
});

var s3 = core.Signers.S3;

var inherit$11 = core.util.inherit;

/**
 * @api private
 */
var expiresHeader$1 = 'presigned-expires';

/**
 * @api private
 */
function signedUrlBuilder(request) {
  var expires = request.httpRequest.headers[expiresHeader$1];
  var signerClass = request.service.getSignerClass(request);

  delete request.httpRequest.headers['User-Agent'];
  delete request.httpRequest.headers['X-Amz-User-Agent'];

  if (signerClass === core.Signers.V4) {
    if (expires > 604800) { // one week expiry is invalid
      var message = 'Presigning does not support expiry time greater ' +
                    'than a week with SigV4 signing.';
      throw core.util.error(new Error(), {
        code: 'InvalidExpiryTime', message: message, retryable: false
      });
    }
    request.httpRequest.headers[expiresHeader$1] = expires;
  } else if (signerClass === core.Signers.S3) {
    var now = request.service ? request.service.getSkewCorrectedDate() : core.util.date.getDate();
    request.httpRequest.headers[expiresHeader$1] = parseInt(
      core.util.date.unixTimestamp(now) + expires, 10).toString();
  } else {
    throw core.util.error(new Error(), {
      message: 'Presigning only supports S3 or SigV4 signing.',
      code: 'UnsupportedSigner', retryable: false
    });
  }
}

/**
 * @api private
 */
function signedUrlSigner(request) {
  var endpoint = request.httpRequest.endpoint;
  var parsedUrl = core.util.urlParse(request.httpRequest.path);
  var queryParams = {};

  if (parsedUrl.search) {
    queryParams = core.util.queryStringParse(parsedUrl.search.substr(1));
  }

  var auth = request.httpRequest.headers['Authorization'].split(' ');
  if (auth[0] === 'AWS') {
    auth = auth[1].split(':');
    queryParams['AWSAccessKeyId'] = auth[0];
    queryParams['Signature'] = auth[1];

    core.util.each(request.httpRequest.headers, function (key, value) {
      if (key === expiresHeader$1) key = 'Expires';
      if (key.indexOf('x-amz-meta-') === 0) {
        // Delete existing, potentially not normalized key
        delete queryParams[key];
        key = key.toLowerCase();
      }
      queryParams[key] = value;
    });
    delete request.httpRequest.headers[expiresHeader$1];
    delete queryParams['Authorization'];
    delete queryParams['Host'];
  } else if (auth[0] === 'AWS4-HMAC-SHA256') { // SigV4 signing
    auth.shift();
    var rest = auth.join(' ');
    var signature = rest.match(/Signature=(.*?)(?:,|\s|\r?\n|$)/)[1];
    queryParams['X-Amz-Signature'] = signature;
    delete queryParams['Expires'];
  }

  // build URL
  endpoint.pathname = parsedUrl.pathname;
  endpoint.search = core.util.queryParamsToString(queryParams);
}

/**
 * @api private
 */
core.Signers.Presign = inherit$11({
  /**
   * @api private
   */
  sign: function sign(request, expireTime, callback) {
    request.httpRequest.headers[expiresHeader$1] = expireTime || 3600;
    request.on('build', signedUrlBuilder);
    request.on('sign', signedUrlSigner);
    request.removeListener('afterBuild',
      core.EventListeners.Core.SET_CONTENT_LENGTH);
    request.removeListener('afterBuild',
      core.EventListeners.Core.COMPUTE_SHA256);

    request.emit('beforePresign', [request]);

    if (callback) {
      request.build(function() {
        if (this.response.error) callback(this.response.error);
        else {
          callback(null, core.util.urlFormat(request.httpRequest.endpoint));
        }
      });
    } else {
      request.build();
      if (request.response.error) throw request.response.error;
      return core.util.urlFormat(request.httpRequest.endpoint);
    }
  }
});

var presign = core.Signers.Presign;

var inherit$5 = core.util.inherit;

/**
 * @api private
 */
core.Signers.RequestSigner = inherit$5({
  constructor: function RequestSigner(request) {
    this.request = request;
  },

  setServiceClientId: function setServiceClientId(id) {
    this.serviceClientId = id;
  },

  getServiceClientId: function getServiceClientId() {
    return this.serviceClientId;
  }
});

core.Signers.RequestSigner.getVersion = function getVersion(version) {
  switch (version) {
    case 'v2': return core.Signers.V2;
    case 'v3': return core.Signers.V3;
    case 'v4': return core.Signers.V4;
    case 's3': return core.Signers.S3;
    case 'v3https': return core.Signers.V3Https;
  }
  throw new Error('Unknown signing version ' + version);
};

/**
 * @api private
 */
core.ParamValidator = core.util.inherit({
  /**
   * Create a new validator object.
   *
   * @param validation [Boolean|map] whether input parameters should be
   *     validated against the operation description before sending the
   *     request. Pass a map to enable any of the following specific
   *     validation features:
   *
   *     * **min** [Boolean] &mdash; Validates that a value meets the min
   *       constraint. This is enabled by default when paramValidation is set
   *       to `true`.
   *     * **max** [Boolean] &mdash; Validates that a value meets the max
   *       constraint.
   *     * **pattern** [Boolean] &mdash; Validates that a string value matches a
   *       regular expression.
   *     * **enum** [Boolean] &mdash; Validates that a string value matches one
   *       of the allowable enum values.
   */
  constructor: function ParamValidator(validation) {
    if (validation === true || validation === undefined) {
      validation = {'min': true};
    }
    this.validation = validation;
  },

  validate: function validate(shape, params, context) {
    this.errors = [];
    this.validateMember(shape, params || {}, context || 'params');

    if (this.errors.length > 1) {
      var msg = this.errors.join('\n* ');
      msg = 'There were ' + this.errors.length +
        ' validation errors:\n* ' + msg;
      throw core.util.error(new Error(msg),
        {code: 'MultipleValidationErrors', errors: this.errors});
    } else if (this.errors.length === 1) {
      throw this.errors[0];
    } else {
      return true;
    }
  },

  fail: function fail(code, message) {
    this.errors.push(core.util.error(new Error(message), {code: code}));
  },

  validateStructure: function validateStructure(shape, params, context) {
    this.validateType(params, context, ['object'], 'structure');

    var paramName;
    for (var i = 0; shape.required && i < shape.required.length; i++) {
      paramName = shape.required[i];
      var value = params[paramName];
      if (value === undefined || value === null) {
        this.fail('MissingRequiredParameter',
          'Missing required key \'' + paramName + '\' in ' + context);
      }
    }

    // validate hash members
    for (paramName in params) {
      if (!Object.prototype.hasOwnProperty.call(params, paramName)) continue;

      var paramValue = params[paramName],
          memberShape = shape.members[paramName];

      if (memberShape !== undefined) {
        var memberContext = [context, paramName].join('.');
        this.validateMember(memberShape, paramValue, memberContext);
      } else {
        this.fail('UnexpectedParameter',
          'Unexpected key \'' + paramName + '\' found in ' + context);
      }
    }

    return true;
  },

  validateMember: function validateMember(shape, param, context) {
    switch (shape.type) {
      case 'structure':
        return this.validateStructure(shape, param, context);
      case 'list':
        return this.validateList(shape, param, context);
      case 'map':
        return this.validateMap(shape, param, context);
      default:
        return this.validateScalar(shape, param, context);
    }
  },

  validateList: function validateList(shape, params, context) {
    if (this.validateType(params, context, [Array])) {
      this.validateRange(shape, params.length, context, 'list member count');
      // validate array members
      for (var i = 0; i < params.length; i++) {
        this.validateMember(shape.member, params[i], context + '[' + i + ']');
      }
    }
  },

  validateMap: function validateMap(shape, params, context) {
    if (this.validateType(params, context, ['object'], 'map')) {
      // Build up a count of map members to validate range traits.
      var mapCount = 0;
      for (var param in params) {
        if (!Object.prototype.hasOwnProperty.call(params, param)) continue;
        // Validate any map key trait constraints
        this.validateMember(shape.key, param,
                            context + '[key=\'' + param + '\']');
        this.validateMember(shape.value, params[param],
                            context + '[\'' + param + '\']');
        mapCount++;
      }
      this.validateRange(shape, mapCount, context, 'map member count');
    }
  },

  validateScalar: function validateScalar(shape, value, context) {
    switch (shape.type) {
      case null:
      case undefined:
      case 'string':
        return this.validateString(shape, value, context);
      case 'base64':
      case 'binary':
        return this.validatePayload(value, context);
      case 'integer':
      case 'float':
        return this.validateNumber(shape, value, context);
      case 'boolean':
        return this.validateType(value, context, ['boolean']);
      case 'timestamp':
        return this.validateType(value, context, [Date,
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/, 'number'],
          'Date object, ISO-8601 string, or a UNIX timestamp');
      default:
        return this.fail('UnkownType', 'Unhandled type ' +
                         shape.type + ' for ' + context);
    }
  },

  validateString: function validateString(shape, value, context) {
    var validTypes = ['string'];
    if (shape.isJsonValue) {
      validTypes = validTypes.concat(['number', 'object', 'boolean']);
    }
    if (value !== null && this.validateType(value, context, validTypes)) {
      this.validateEnum(shape, value, context);
      this.validateRange(shape, value.length, context, 'string length');
      this.validatePattern(shape, value, context);
    }
  },

  validatePattern: function validatePattern(shape, value, context) {
    if (this.validation['pattern'] && shape['pattern'] !== undefined) {
      if (!(new RegExp(shape['pattern'])).test(value)) {
        this.fail('PatternMatchError', 'Provided value "' + value + '" '
          + 'does not match regex pattern /' + shape['pattern'] + '/ for '
          + context);
      }
    }
  },

  validateRange: function validateRange(shape, value, context, descriptor) {
    if (this.validation['min']) {
      if (shape['min'] !== undefined && value < shape['min']) {
        this.fail('MinRangeError', 'Expected ' + descriptor + ' >= '
          + shape['min'] + ', but found ' + value + ' for ' + context);
      }
    }
    if (this.validation['max']) {
      if (shape['max'] !== undefined && value > shape['max']) {
        this.fail('MaxRangeError', 'Expected ' + descriptor + ' <= '
          + shape['max'] + ', but found ' + value + ' for ' + context);
      }
    }
  },

  validateEnum: function validateRange(shape, value, context) {
    if (this.validation['enum'] && shape['enum'] !== undefined) {
      // Fail if the string value is not present in the enum list
      if (shape['enum'].indexOf(value) === -1) {
        this.fail('EnumError', 'Found string value of ' + value + ', but '
          + 'expected ' + shape['enum'].join('|') + ' for ' + context);
      }
    }
  },

  validateType: function validateType(value, context, acceptedTypes, type) {
    // We will not log an error for null or undefined, but we will return
    // false so that callers know that the expected type was not strictly met.
    if (value === null || value === undefined) return false;

    var foundInvalidType = false;
    for (var i = 0; i < acceptedTypes.length; i++) {
      if (typeof acceptedTypes[i] === 'string') {
        if (typeof value === acceptedTypes[i]) return true;
      } else if (acceptedTypes[i] instanceof RegExp) {
        if ((value || '').toString().match(acceptedTypes[i])) return true;
      } else {
        if (value instanceof acceptedTypes[i]) return true;
        if (core.util.isType(value, acceptedTypes[i])) return true;
        if (!type && !foundInvalidType) acceptedTypes = acceptedTypes.slice();
        acceptedTypes[i] = core.util.typeName(acceptedTypes[i]);
      }
      foundInvalidType = true;
    }

    var acceptedType = type;
    if (!acceptedType) {
      acceptedType = acceptedTypes.join(', ').replace(/,([^,]+)$/, ', or$1');
    }

    var vowel = acceptedType.match(/^[aeiou]/i) ? 'n' : '';
    this.fail('InvalidParameterType', 'Expected ' + context + ' to be a' +
              vowel + ' ' + acceptedType);
    return false;
  },

  validateNumber: function validateNumber(shape, value, context) {
    if (value === null || value === undefined) return;
    if (typeof value === 'string') {
      var castedValue = parseFloat(value);
      if (castedValue.toString() === value) value = castedValue;
    }
    if (this.validateType(value, context, ['number'])) {
      this.validateRange(shape, value, context, 'numeric value');
    }
  },

  validatePayload: function validatePayload(value, context) {
    if (value === null || value === undefined) return;
    if (typeof value === 'string') return;
    if (value && typeof value.byteLength === 'number') return; // typed arrays
    if (core.util.isNode()) { // special check for buffer/stream in Node.js
      var Stream = core.util.stream.Stream;
      if (core.util.Buffer.isBuffer(value) || value instanceof Stream) return;
    }

    var types = ['Buffer', 'Stream', 'File', 'Blob', 'ArrayBuffer', 'DataView'];
    if (value) {
      for (var i = 0; i < types.length; i++) {
        if (core.util.isType(value, types[i])) return;
        if (core.util.typeName(value.constructor) === types[i]) return;
      }
    }

    this.fail('InvalidParameterType', 'Expected ' + context + ' to be a ' +
      'string, Buffer, Stream, Blob, or typed array object');
  }
});

/**
 * The main AWS namespace
 */
var AWS$2 = { util: util_1 };

/**
 * @api private
 * @!macro [new] nobrowser
 *   @note This feature is not supported in the browser environment of the SDK.
 */
var _hidden = {}; _hidden.toString(); // hack to parse macro

var core = AWS$2;

AWS$2.util.update(AWS$2, {

  /**
   * @constant
   */
  VERSION: '2.169.0',

  /**
   * @api private
   */
  Signers: {},

  /**
   * @api private
   */
  Protocol: {
    Json: json,
    Query: query,
    Rest: rest,
    RestJson: rest_json,
    RestXml: rest_xml
  },

  /**
   * @api private
   */
  XML: {
    Builder: builder_1,
    Parser: null // conditionally set based on environment
  },

  /**
   * @api private
   */
  JSON: {
    Builder: builder,
    Parser: parser
  },

  /**
   * @api private
   */
  Model: {
    Api: api,
    Operation: operation,
    Shape: shape,
    Paginator: paginator,
    ResourceWaiter: resource_waiter
  },

  /**
   * @api private
   */
  apiLoader: api_loader
});













/**
 * @readonly
 * @return [AWS.SequentialExecutor] a collection of global event listeners that
 *   are attached to every sent request.
 * @see AWS.Request AWS.Request for a list of events to listen for
 * @example Logging the time taken to send a request
 *   AWS.events.on('send', function startSend(resp) {
 *     resp.startTime = new Date().getTime();
 *   }).on('complete', function calculateTime(resp) {
 *     var time = (new Date().getTime() - resp.startTime) / 1000;
 *     console.log('Request took ' + time + ' seconds');
 *   });
 *
 *   new AWS.S3().listBuckets(); // prints 'Request took 0.285 seconds'
 */
AWS$2.events = new AWS$2.SequentialExecutor();

var acm = {"name":"ACM","cors":true};
var apigateway = {"name":"APIGateway","cors":true};
var applicationautoscaling = {"prefix":"application-autoscaling","name":"ApplicationAutoScaling","cors":true};
var appstream = {"name":"AppStream"};
var autoscaling = {"name":"AutoScaling","cors":true};
var batch = {"name":"Batch"};
var budgets = {"name":"Budgets"};
var clouddirectory = {"name":"CloudDirectory"};
var cloudformation = {"name":"CloudFormation","cors":true};
var cloudfront = {"name":"CloudFront","versions":["2013-05-12*","2013-11-11*","2014-05-31*","2014-10-21*","2014-11-06*","2015-04-17*","2015-07-27*","2015-09-17*","2016-01-13*","2016-01-28*","2016-08-01*","2016-08-20*","2016-09-07*","2016-09-29*","2016-11-25*"],"cors":true};
var cloudhsm = {"name":"CloudHSM","cors":true};
var cloudsearch = {"name":"CloudSearch"};
var cloudsearchdomain = {"name":"CloudSearchDomain"};
var cloudtrail = {"name":"CloudTrail","cors":true};
var cloudwatch = {"prefix":"monitoring","name":"CloudWatch","cors":true};
var cloudwatchevents = {"prefix":"events","name":"CloudWatchEvents","versions":["2014-02-03*"],"cors":true};
var cloudwatchlogs = {"prefix":"logs","name":"CloudWatchLogs","cors":true};
var codebuild = {"name":"CodeBuild"};
var codecommit = {"name":"CodeCommit","cors":true};
var codedeploy = {"name":"CodeDeploy","cors":true};
var codepipeline = {"name":"CodePipeline","cors":true};
var cognitoidentity = {"prefix":"cognito-identity","name":"CognitoIdentity","cors":true};
var cognitoidentityserviceprovider = {"prefix":"cognito-idp","name":"CognitoIdentityServiceProvider","cors":true};
var cognitosync = {"prefix":"cognito-sync","name":"CognitoSync","cors":true};
var configservice = {"prefix":"config","name":"ConfigService","cors":true};
var cur = {"name":"CUR","cors":true};
var datapipeline = {"name":"DataPipeline"};
var devicefarm = {"name":"DeviceFarm","cors":true};
var directconnect = {"name":"DirectConnect","cors":true};
var directoryservice = {"prefix":"ds","name":"DirectoryService"};
var discovery = {"name":"Discovery"};
var dms = {"name":"DMS"};
var dynamodb$1 = {"name":"DynamoDB","cors":true};
var dynamodbstreams = {"prefix":"streams.dynamodb","name":"DynamoDBStreams","cors":true};
var ec2 = {"name":"EC2","versions":["2013-06-15*","2013-10-15*","2014-02-01*","2014-05-01*","2014-06-15*","2014-09-01*","2014-10-01*","2015-03-01*","2015-04-15*","2015-10-01*","2016-04-01*","2016-09-15*"],"cors":true};
var ecr = {"name":"ECR","cors":true};
var ecs = {"name":"ECS","cors":true};
var efs = {"prefix":"elasticfilesystem","name":"EFS","cors":true};
var elasticache = {"name":"ElastiCache","versions":["2012-11-15*","2014-03-24*","2014-07-15*","2014-09-30*"],"cors":true};
var elasticbeanstalk = {"name":"ElasticBeanstalk","cors":true};
var elb = {"prefix":"elasticloadbalancing","name":"ELB","cors":true};
var elbv2 = {"prefix":"elasticloadbalancingv2","name":"ELBv2","cors":true};
var emr = {"prefix":"elasticmapreduce","name":"EMR","cors":true};
var es = {"name":"ES"};
var elastictranscoder = {"name":"ElasticTranscoder","cors":true};
var firehose = {"name":"Firehose","cors":true};
var gamelift = {"name":"GameLift","cors":true};
var glacier = {"name":"Glacier"};
var health = {"name":"Health"};
var iam = {"name":"IAM"};
var importexport = {"name":"ImportExport"};
var inspector = {"name":"Inspector","versions":["2015-08-18*"],"cors":true};
var iot = {"name":"Iot","cors":true};
var iotdata = {"prefix":"iot-data","name":"IotData","cors":true};
var kinesis = {"name":"Kinesis","cors":true};
var kinesisanalytics = {"name":"KinesisAnalytics"};
var kms = {"name":"KMS","cors":true};
var lambda = {"name":"Lambda","cors":true};
var lexruntime = {"prefix":"runtime.lex","name":"LexRuntime","cors":true};
var lightsail = {"name":"Lightsail"};
var machinelearning = {"name":"MachineLearning","cors":true};
var marketplacecommerceanalytics = {"name":"MarketplaceCommerceAnalytics","cors":true};
var marketplacemetering = {"prefix":"meteringmarketplace","name":"MarketplaceMetering"};
var mturk = {"prefix":"mturk-requester","name":"MTurk","cors":true};
var mobileanalytics = {"name":"MobileAnalytics","cors":true};
var opsworks = {"name":"OpsWorks","cors":true};
var opsworkscm = {"name":"OpsWorksCM"};
var organizations = {"name":"Organizations"};
var pinpoint = {"name":"Pinpoint"};
var polly = {"name":"Polly","cors":true};
var rds = {"name":"RDS","versions":["2014-09-01*"],"cors":true};
var redshift = {"name":"Redshift","cors":true};
var rekognition = {"name":"Rekognition","cors":true};
var resourcegroupstaggingapi = {"name":"ResourceGroupsTaggingAPI"};
var route53 = {"name":"Route53","cors":true};
var route53domains = {"name":"Route53Domains","cors":true};
var s3$2 = {"name":"S3","dualstackAvailable":true,"cors":true};
var servicecatalog = {"name":"ServiceCatalog","cors":true};
var ses = {"prefix":"email","name":"SES","cors":true};
var shield = {"name":"Shield"};
var simpledb = {"prefix":"sdb","name":"SimpleDB"};
var sms = {"name":"SMS"};
var snowball = {"name":"Snowball"};
var sns = {"name":"SNS","cors":true};
var sqs = {"name":"SQS","cors":true};
var ssm = {"name":"SSM","cors":true};
var storagegateway = {"name":"StorageGateway","cors":true};
var stepfunctions = {"prefix":"states","name":"StepFunctions"};
var sts = {"name":"STS","cors":true};
var support = {"name":"Support"};
var swf = {"name":"SWF"};
var xray = {"name":"XRay"};
var waf = {"name":"WAF","cors":true};
var wafregional = {"prefix":"waf-regional","name":"WAFRegional"};
var workdocs = {"name":"WorkDocs","cors":true};
var workspaces = {"name":"WorkSpaces"};
var codestar = {"name":"CodeStar"};
var lexmodelbuildingservice = {"prefix":"lex-models","name":"LexModelBuildingService","cors":true};
var marketplaceentitlementservice = {"prefix":"entitlement.marketplace","name":"MarketplaceEntitlementService"};
var athena = {"name":"Athena"};
var greengrass = {"name":"Greengrass"};
var dax = {"name":"DAX"};
var migrationhub = {"prefix":"AWSMigrationHub","name":"MigrationHub"};
var cloudhsmv2 = {"name":"CloudHSMV2"};
var glue = {"name":"Glue"};
var mobile = {"name":"Mobile"};
var pricing = {"name":"Pricing"};
var costexplorer = {"prefix":"ce","name":"CostExplorer"};
var mediaconvert = {"name":"MediaConvert"};
var medialive = {"name":"MediaLive"};
var mediapackage = {"name":"MediaPackage"};
var mediastore = {"name":"MediaStore"};
var mediastoredata = {"prefix":"mediastore-data","name":"MediaStoreData"};
var appsync = {"name":"AppSync"};
var guardduty = {"name":"GuardDuty"};
var mq = {"name":"MQ"};
var comprehend = {"name":"Comprehend"};
var iotjobsdataplane = {"prefix":"iot-jobs-data","name":"IoTJobsDataPlane"};
var kinesisvideoarchivedmedia = {"prefix":"kinesis-video-archived-media","name":"KinesisVideoArchivedMedia"};
var kinesisvideomedia = {"prefix":"kinesis-video-media","name":"KinesisVideoMedia"};
var kinesisvideo = {"name":"KinesisVideo"};
var sagemakerruntime = {"prefix":"runtime.sagemaker","name":"SageMakerRuntime"};
var sagemaker = {"name":"SageMaker"};
var translate$2 = {"name":"Translate"};
var resourcegroups = {"prefix":"resource-groups","name":"ResourceGroups"};
var alexaforbusiness = {"name":"AlexaForBusiness"};
var cloud9 = {"name":"Cloud9"};
var serverlessapplicationrepository = {"prefix":"serverlessrepo","name":"ServerlessApplicationRepository"};
var servicediscovery = {"name":"ServiceDiscovery"};
var workmail = {"name":"WorkMail"};
var metadata = {
	acm: acm,
	apigateway: apigateway,
	applicationautoscaling: applicationautoscaling,
	appstream: appstream,
	autoscaling: autoscaling,
	batch: batch,
	budgets: budgets,
	clouddirectory: clouddirectory,
	cloudformation: cloudformation,
	cloudfront: cloudfront,
	cloudhsm: cloudhsm,
	cloudsearch: cloudsearch,
	cloudsearchdomain: cloudsearchdomain,
	cloudtrail: cloudtrail,
	cloudwatch: cloudwatch,
	cloudwatchevents: cloudwatchevents,
	cloudwatchlogs: cloudwatchlogs,
	codebuild: codebuild,
	codecommit: codecommit,
	codedeploy: codedeploy,
	codepipeline: codepipeline,
	cognitoidentity: cognitoidentity,
	cognitoidentityserviceprovider: cognitoidentityserviceprovider,
	cognitosync: cognitosync,
	configservice: configservice,
	cur: cur,
	datapipeline: datapipeline,
	devicefarm: devicefarm,
	directconnect: directconnect,
	directoryservice: directoryservice,
	discovery: discovery,
	dms: dms,
	dynamodb: dynamodb$1,
	dynamodbstreams: dynamodbstreams,
	ec2: ec2,
	ecr: ecr,
	ecs: ecs,
	efs: efs,
	elasticache: elasticache,
	elasticbeanstalk: elasticbeanstalk,
	elb: elb,
	elbv2: elbv2,
	emr: emr,
	es: es,
	elastictranscoder: elastictranscoder,
	firehose: firehose,
	gamelift: gamelift,
	glacier: glacier,
	health: health,
	iam: iam,
	importexport: importexport,
	inspector: inspector,
	iot: iot,
	iotdata: iotdata,
	kinesis: kinesis,
	kinesisanalytics: kinesisanalytics,
	kms: kms,
	lambda: lambda,
	lexruntime: lexruntime,
	lightsail: lightsail,
	machinelearning: machinelearning,
	marketplacecommerceanalytics: marketplacecommerceanalytics,
	marketplacemetering: marketplacemetering,
	mturk: mturk,
	mobileanalytics: mobileanalytics,
	opsworks: opsworks,
	opsworkscm: opsworkscm,
	organizations: organizations,
	pinpoint: pinpoint,
	polly: polly,
	rds: rds,
	redshift: redshift,
	rekognition: rekognition,
	resourcegroupstaggingapi: resourcegroupstaggingapi,
	route53: route53,
	route53domains: route53domains,
	s3: s3$2,
	servicecatalog: servicecatalog,
	ses: ses,
	shield: shield,
	simpledb: simpledb,
	sms: sms,
	snowball: snowball,
	sns: sns,
	sqs: sqs,
	ssm: ssm,
	storagegateway: storagegateway,
	stepfunctions: stepfunctions,
	sts: sts,
	support: support,
	swf: swf,
	xray: xray,
	waf: waf,
	wafregional: wafregional,
	workdocs: workdocs,
	workspaces: workspaces,
	codestar: codestar,
	lexmodelbuildingservice: lexmodelbuildingservice,
	marketplaceentitlementservice: marketplaceentitlementservice,
	athena: athena,
	greengrass: greengrass,
	dax: dax,
	migrationhub: migrationhub,
	cloudhsmv2: cloudhsmv2,
	glue: glue,
	mobile: mobile,
	pricing: pricing,
	costexplorer: costexplorer,
	mediaconvert: mediaconvert,
	medialive: medialive,
	mediapackage: mediapackage,
	mediastore: mediastore,
	mediastoredata: mediastoredata,
	appsync: appsync,
	guardduty: guardduty,
	mq: mq,
	comprehend: comprehend,
	iotjobsdataplane: iotjobsdataplane,
	kinesisvideoarchivedmedia: kinesisvideoarchivedmedia,
	kinesisvideomedia: kinesisvideomedia,
	kinesisvideo: kinesisvideo,
	sagemakerruntime: sagemakerruntime,
	sagemaker: sagemaker,
	translate: translate$2,
	resourcegroups: resourcegroups,
	alexaforbusiness: alexaforbusiness,
	cloud9: cloud9,
	serverlessapplicationrepository: serverlessapplicationrepository,
	servicediscovery: servicediscovery,
	workmail: workmail
};

var metadata$1 = Object.freeze({
	acm: acm,
	apigateway: apigateway,
	applicationautoscaling: applicationautoscaling,
	appstream: appstream,
	autoscaling: autoscaling,
	batch: batch,
	budgets: budgets,
	clouddirectory: clouddirectory,
	cloudformation: cloudformation,
	cloudfront: cloudfront,
	cloudhsm: cloudhsm,
	cloudsearch: cloudsearch,
	cloudsearchdomain: cloudsearchdomain,
	cloudtrail: cloudtrail,
	cloudwatch: cloudwatch,
	cloudwatchevents: cloudwatchevents,
	cloudwatchlogs: cloudwatchlogs,
	codebuild: codebuild,
	codecommit: codecommit,
	codedeploy: codedeploy,
	codepipeline: codepipeline,
	cognitoidentity: cognitoidentity,
	cognitoidentityserviceprovider: cognitoidentityserviceprovider,
	cognitosync: cognitosync,
	configservice: configservice,
	cur: cur,
	datapipeline: datapipeline,
	devicefarm: devicefarm,
	directconnect: directconnect,
	directoryservice: directoryservice,
	discovery: discovery,
	dms: dms,
	dynamodb: dynamodb$1,
	dynamodbstreams: dynamodbstreams,
	ec2: ec2,
	ecr: ecr,
	ecs: ecs,
	efs: efs,
	elasticache: elasticache,
	elasticbeanstalk: elasticbeanstalk,
	elb: elb,
	elbv2: elbv2,
	emr: emr,
	es: es,
	elastictranscoder: elastictranscoder,
	firehose: firehose,
	gamelift: gamelift,
	glacier: glacier,
	health: health,
	iam: iam,
	importexport: importexport,
	inspector: inspector,
	iot: iot,
	iotdata: iotdata,
	kinesis: kinesis,
	kinesisanalytics: kinesisanalytics,
	kms: kms,
	lambda: lambda,
	lexruntime: lexruntime,
	lightsail: lightsail,
	machinelearning: machinelearning,
	marketplacecommerceanalytics: marketplacecommerceanalytics,
	marketplacemetering: marketplacemetering,
	mturk: mturk,
	mobileanalytics: mobileanalytics,
	opsworks: opsworks,
	opsworkscm: opsworkscm,
	organizations: organizations,
	pinpoint: pinpoint,
	polly: polly,
	rds: rds,
	redshift: redshift,
	rekognition: rekognition,
	resourcegroupstaggingapi: resourcegroupstaggingapi,
	route53: route53,
	route53domains: route53domains,
	s3: s3$2,
	servicecatalog: servicecatalog,
	ses: ses,
	shield: shield,
	simpledb: simpledb,
	sms: sms,
	snowball: snowball,
	sns: sns,
	sqs: sqs,
	ssm: ssm,
	storagegateway: storagegateway,
	stepfunctions: stepfunctions,
	sts: sts,
	support: support,
	swf: swf,
	xray: xray,
	waf: waf,
	wafregional: wafregional,
	workdocs: workdocs,
	workspaces: workspaces,
	codestar: codestar,
	lexmodelbuildingservice: lexmodelbuildingservice,
	marketplaceentitlementservice: marketplaceentitlementservice,
	athena: athena,
	greengrass: greengrass,
	dax: dax,
	migrationhub: migrationhub,
	cloudhsmv2: cloudhsmv2,
	glue: glue,
	mobile: mobile,
	pricing: pricing,
	costexplorer: costexplorer,
	mediaconvert: mediaconvert,
	medialive: medialive,
	mediapackage: mediapackage,
	mediastore: mediastore,
	mediastoredata: mediastoredata,
	appsync: appsync,
	guardduty: guardduty,
	mq: mq,
	comprehend: comprehend,
	iotjobsdataplane: iotjobsdataplane,
	kinesisvideoarchivedmedia: kinesisvideoarchivedmedia,
	kinesisvideomedia: kinesisvideomedia,
	kinesisvideo: kinesisvideo,
	sagemakerruntime: sagemakerruntime,
	sagemaker: sagemaker,
	translate: translate$2,
	resourcegroups: resourcegroups,
	alexaforbusiness: alexaforbusiness,
	cloud9: cloud9,
	serverlessapplicationrepository: serverlessapplicationrepository,
	servicediscovery: servicediscovery,
	workmail: workmail,
	default: metadata
});

// Unique ID creation requires a high quality random # generator.  In node.js
// this is pretty straight-forward - we use the crypto API.

var rb = crypto.randomBytes;

function rng() {
  return rb(16);
}

var rng_1 = rng;

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  return bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

var bytesToUuid_1 = bytesToUuid;

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

// random #'s we need to init node and clockseq
var _seedBytes = rng_1();

// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
var _nodeId = [
  _seedBytes[0] | 0x01,
  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
];

// Per 4.2.2, randomize (14 bit) clockseq
var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};

  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  var node = options.node || _nodeId;
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid_1(b);
}

var v1_1 = v1;

function v4$2(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng_1)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid_1(rnds);
}

var v4_1 = v4$2;

var uuid = v4_1;
uuid.v1 = v1_1;
uuid.v4 = v4_1;

var uuid_1 = uuid;

var require$$2$5 = ( metadata$1 && metadata ) || metadata$1;

/* eslint guard-for-in:0 */
var AWS$1;

/**
 * A set of utility methods for use with the AWS SDK.
 *
 * @!attribute abort
 *   Return this value from an iterator function {each} or {arrayEach}
 *   to break out of the iteration.
 *   @example Breaking out of an iterator function
 *     AWS.util.each({a: 1, b: 2, c: 3}, function(key, value) {
 *       if (key == 'b') return AWS.util.abort;
 *     });
 *   @see each
 *   @see arrayEach
 * @api private
 */
var util$1 = {
  environment: 'nodejs',
  engine: function engine() {
    if (util$1.isBrowser() && typeof navigator !== 'undefined') {
      return navigator.userAgent;
    } else {
      var engine = process.platform + '/' + process.version;
      if (process.env.AWS_EXECUTION_ENV) {
        engine += ' exec-env/' + process.env.AWS_EXECUTION_ENV;
      }
      return engine;
    }
  },

  userAgent: function userAgent() {
    var name = util$1.environment;
    var agent = 'aws-sdk-' + name + '/' + core.VERSION;
    if (name === 'nodejs') agent += ' ' + util$1.engine();
    return agent;
  },

  isBrowser: function isBrowser() { return process && process.browser; },
  isNode: function isNode() { return !util$1.isBrowser(); },
  uriEscape: function uriEscape(string) {
    var output = encodeURIComponent(string);
    output = output.replace(/[^A-Za-z0-9_.~\-%]+/g, escape);

    // AWS percent-encodes some extra non-standard characters in a URI
    output = output.replace(/[*]/g, function(ch) {
      return '%' + ch.charCodeAt(0).toString(16).toUpperCase();
    });

    return output;
  },

  uriEscapePath: function uriEscapePath(string) {
    var parts = [];
    util$1.arrayEach(string.split('/'), function (part) {
      parts.push(util$1.uriEscape(part));
    });
    return parts.join('/');
  },

  urlParse: function urlParse(url$$1) {
    return util$1.url.parse(url$$1);
  },

  urlFormat: function urlFormat(url$$1) {
    return util$1.url.format(url$$1);
  },

  queryStringParse: function queryStringParse(qs) {
    return util$1.querystring.parse(qs);
  },

  queryParamsToString: function queryParamsToString(params) {
    var items = [];
    var escape = util$1.uriEscape;
    var sortedKeys = Object.keys(params).sort();

    util$1.arrayEach(sortedKeys, function(name) {
      var value = params[name];
      var ename = escape(name);
      var result = ename + '=';
      if (Array.isArray(value)) {
        var vals = [];
        util$1.arrayEach(value, function(item) { vals.push(escape(item)); });
        result = ename + '=' + vals.sort().join('&' + ename + '=');
      } else if (value !== undefined && value !== null) {
        result = ename + '=' + escape(value);
      }
      items.push(result);
    });

    return items.join('&');
  },

  readFileSync: function readFileSync$$1(path$$1) {
    if (util$1.isBrowser()) return null;
    return fs__default.readFileSync(path$$1, 'utf-8');
  },

  base64: {
    encode: function encode64(string) {
      if (typeof string === 'number') {
        throw util$1.error(new Error('Cannot base64 encode number ' + string));
      }
      if (string === null || typeof string === 'undefined') {
        return string;
      }
      var buf = (typeof util$1.Buffer.from === 'function' && util$1.Buffer.from !== Uint8Array.from) ? util$1.Buffer.from(string) : new util$1.Buffer(string);
      return buf.toString('base64');
    },

    decode: function decode64(string) {
      if (typeof string === 'number') {
        throw util$1.error(new Error('Cannot base64 decode number ' + string));
      }
      if (string === null || typeof string === 'undefined') {
        return string;
      }
      return (typeof util$1.Buffer.from === 'function' && util$1.Buffer.from !== Uint8Array.from) ? util$1.Buffer.from(string, 'base64') : new util$1.Buffer(string, 'base64');
    }

  },

  buffer: {
    toStream: function toStream(buffer$$1) {
      if (!util$1.Buffer.isBuffer(buffer$$1)) buffer$$1 = new util$1.Buffer(buffer$$1);

      var readable = new (util$1.stream.Readable)();
      var pos = 0;
      readable._read = function(size) {
        if (pos >= buffer$$1.length) return readable.push(null);

        var end = pos + size;
        if (end > buffer$$1.length) end = buffer$$1.length;
        readable.push(buffer$$1.slice(pos, end));
        pos = end;
      };

      return readable;
    },

    /**
     * Concatenates a list of Buffer objects.
     */
    concat: function(buffers) {
      var length = 0,
          offset = 0,
          buffer$$1 = null, i;

      for (i = 0; i < buffers.length; i++) {
        length += buffers[i].length;
      }

      buffer$$1 = new util$1.Buffer(length);

      for (i = 0; i < buffers.length; i++) {
        buffers[i].copy(buffer$$1, offset);
        offset += buffers[i].length;
      }

      return buffer$$1;
    }
  },

  string: {
    byteLength: function byteLength(string) {
      if (string === null || string === undefined) return 0;
      if (typeof string === 'string') string = new util$1.Buffer(string);

      if (typeof string.byteLength === 'number') {
        return string.byteLength;
      } else if (typeof string.length === 'number') {
        return string.length;
      } else if (typeof string.size === 'number') {
        return string.size;
      } else if (typeof string.path === 'string') {
        return fs__default.lstatSync(string.path).size;
      } else {
        throw util$1.error(new Error('Cannot determine length of ' + string),
          { object: string });
      }
    },

    upperFirst: function upperFirst(string) {
      return string[0].toUpperCase() + string.substr(1);
    },

    lowerFirst: function lowerFirst(string) {
      return string[0].toLowerCase() + string.substr(1);
    }
  },

  ini: {
    parse: function string(ini) {
      var currentSection, map = {};
      util$1.arrayEach(ini.split(/\r?\n/), function(line) {
        line = line.split(/(^|\s)[;#]/)[0]; // remove comments
        var section = line.match(/^\s*\[([^\[\]]+)\]\s*$/);
        if (section) {
          currentSection = section[1];
        } else if (currentSection) {
          var item = line.match(/^\s*(.+?)\s*=\s*(.+?)\s*$/);
          if (item) {
            map[currentSection] = map[currentSection] || {};
            map[currentSection][item[1]] = item[2];
          }
        }
      });

      return map;
    }
  },

  fn: {
    noop: function() {},

    /**
     * Turn a synchronous function into as "async" function by making it call
     * a callback. The underlying function is called with all but the last argument,
     * which is treated as the callback. The callback is passed passed a first argument
     * of null on success to mimick standard node callbacks.
     */
    makeAsync: function makeAsync(fn, expectedArgs) {
      if (expectedArgs && expectedArgs <= fn.length) {
        return fn;
      }

      return function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var callback = args.pop();
        var result = fn.apply(null, args);
        callback(result);
      };
    }
  },

  /**
   * Date and time utility functions.
   */
  date: {

    /**
     * @return [Date] the current JavaScript date object. Since all
     *   AWS services rely on this date object, you can override
     *   this function to provide a special time value to AWS service
     *   requests.
     */
    getDate: function getDate() {
      if (!AWS$1) AWS$1 = core;
      if (AWS$1.config.systemClockOffset) { // use offset when non-zero
        return new Date(new Date().getTime() + AWS$1.config.systemClockOffset);
      } else {
        return new Date();
      }
    },

    /**
     * @return [String] the date in ISO-8601 format
     */
    iso8601: function iso8601(date) {
      if (date === undefined) { date = util$1.date.getDate(); }
      return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
    },

    /**
     * @return [String] the date in RFC 822 format
     */
    rfc822: function rfc822(date) {
      if (date === undefined) { date = util$1.date.getDate(); }
      return date.toUTCString();
    },

    /**
     * @return [Integer] the UNIX timestamp value for the current time
     */
    unixTimestamp: function unixTimestamp(date) {
      if (date === undefined) { date = util$1.date.getDate(); }
      return date.getTime() / 1000;
    },

    /**
     * @param [String,number,Date] date
     * @return [Date]
     */
    from: function format(date) {
      if (typeof date === 'number') {
        return new Date(date * 1000); // unix timestamp
      } else {
        return new Date(date);
      }
    },

    /**
     * Given a Date or date-like value, this function formats the
     * date into a string of the requested value.
     * @param [String,number,Date] date
     * @param [String] formatter Valid formats are:
     #   * 'iso8601'
     #   * 'rfc822'
     #   * 'unixTimestamp'
     * @return [String]
     */
    format: function format(date, formatter) {
      if (!formatter) formatter = 'iso8601';
      return util$1.date[formatter](util$1.date.from(date));
    },

    parseTimestamp: function parseTimestamp(value) {
      if (typeof value === 'number') { // unix timestamp (number)
        return new Date(value * 1000);
      } else if (value.match(/^\d+$/)) { // unix timestamp
        return new Date(value * 1000);
      } else if (value.match(/^\d{4}/)) { // iso8601
        return new Date(value);
      } else if (value.match(/^\w{3},/)) { // rfc822
        return new Date(value);
      } else {
        throw util$1.error(
          new Error('unhandled timestamp format: ' + value),
          {code: 'TimestampParserError'});
      }
    }

  },

  crypto: {
    crc32Table: [
     0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA, 0x076DC419,
     0x706AF48F, 0xE963A535, 0x9E6495A3, 0x0EDB8832, 0x79DCB8A4,
     0xE0D5E91E, 0x97D2D988, 0x09B64C2B, 0x7EB17CBD, 0xE7B82D07,
     0x90BF1D91, 0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE,
     0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7, 0x136C9856,
     0x646BA8C0, 0xFD62F97A, 0x8A65C9EC, 0x14015C4F, 0x63066CD9,
     0xFA0F3D63, 0x8D080DF5, 0x3B6E20C8, 0x4C69105E, 0xD56041E4,
     0xA2677172, 0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B,
     0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940, 0x32D86CE3,
     0x45DF5C75, 0xDCD60DCF, 0xABD13D59, 0x26D930AC, 0x51DE003A,
     0xC8D75180, 0xBFD06116, 0x21B4F4B5, 0x56B3C423, 0xCFBA9599,
     0xB8BDA50F, 0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924,
     0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D, 0x76DC4190,
     0x01DB7106, 0x98D220BC, 0xEFD5102A, 0x71B18589, 0x06B6B51F,
     0x9FBFE4A5, 0xE8B8D433, 0x7807C9A2, 0x0F00F934, 0x9609A88E,
     0xE10E9818, 0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01,
     0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E, 0x6C0695ED,
     0x1B01A57B, 0x8208F4C1, 0xF50FC457, 0x65B0D9C6, 0x12B7E950,
     0x8BBEB8EA, 0xFCB9887C, 0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3,
     0xFBD44C65, 0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2,
     0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB, 0x4369E96A,
     0x346ED9FC, 0xAD678846, 0xDA60B8D0, 0x44042D73, 0x33031DE5,
     0xAA0A4C5F, 0xDD0D7CC9, 0x5005713C, 0x270241AA, 0xBE0B1010,
     0xC90C2086, 0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F,
     0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4, 0x59B33D17,
     0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD, 0xEDB88320, 0x9ABFB3B6,
     0x03B6E20C, 0x74B1D29A, 0xEAD54739, 0x9DD277AF, 0x04DB2615,
     0x73DC1683, 0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8,
     0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1, 0xF00F9344,
     0x8708A3D2, 0x1E01F268, 0x6906C2FE, 0xF762575D, 0x806567CB,
     0x196C3671, 0x6E6B06E7, 0xFED41B76, 0x89D32BE0, 0x10DA7A5A,
     0x67DD4ACC, 0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5,
     0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252, 0xD1BB67F1,
     0xA6BC5767, 0x3FB506DD, 0x48B2364B, 0xD80D2BDA, 0xAF0A1B4C,
     0x36034AF6, 0x41047A60, 0xDF60EFC3, 0xA867DF55, 0x316E8EEF,
     0x4669BE79, 0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236,
     0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F, 0xC5BA3BBE,
     0xB2BD0B28, 0x2BB45A92, 0x5CB36A04, 0xC2D7FFA7, 0xB5D0CF31,
     0x2CD99E8B, 0x5BDEAE1D, 0x9B64C2B0, 0xEC63F226, 0x756AA39C,
     0x026D930A, 0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713,
     0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38, 0x92D28E9B,
     0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21, 0x86D3D2D4, 0xF1D4E242,
     0x68DDB3F8, 0x1FDA836E, 0x81BE16CD, 0xF6B9265B, 0x6FB077E1,
     0x18B74777, 0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C,
     0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45, 0xA00AE278,
     0xD70DD2EE, 0x4E048354, 0x3903B3C2, 0xA7672661, 0xD06016F7,
     0x4969474D, 0x3E6E77DB, 0xAED16A4A, 0xD9D65ADC, 0x40DF0B66,
     0x37D83BF0, 0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9,
     0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6, 0xBAD03605,
     0xCDD70693, 0x54DE5729, 0x23D967BF, 0xB3667A2E, 0xC4614AB8,
     0x5D681B02, 0x2A6F2B94, 0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B,
     0x2D02EF8D],

    crc32: function crc32(data) {
      var tbl = util$1.crypto.crc32Table;
      var crc = 0 ^ -1;

      if (typeof data === 'string') {
        data = new util$1.Buffer(data);
      }

      for (var i = 0; i < data.length; i++) {
        var code = data.readUInt8(i);
        crc = (crc >>> 8) ^ tbl[(crc ^ code) & 0xFF];
      }
      return (crc ^ -1) >>> 0;
    },

    hmac: function hmac(key, string, digest, fn) {
      if (!digest) digest = 'binary';
      if (digest === 'buffer') { digest = undefined; }
      if (!fn) fn = 'sha256';
      if (typeof string === 'string') string = new util$1.Buffer(string);
      return util$1.crypto.lib.createHmac(fn, key).update(string).digest(digest);
    },

    md5: function md5(data, digest, callback) {
      return util$1.crypto.hash('md5', data, digest, callback);
    },

    sha256: function sha256(data, digest, callback) {
      return util$1.crypto.hash('sha256', data, digest, callback);
    },

    hash: function(algorithm, data, digest, callback) {
      var hash = util$1.crypto.createHash(algorithm);
      if (!digest) { digest = 'binary'; }
      if (digest === 'buffer') { digest = undefined; }
      if (typeof data === 'string') data = new util$1.Buffer(data);
      var sliceFn = util$1.arraySliceFn(data);
      var isBuffer = util$1.Buffer.isBuffer(data);
      //Identifying objects with an ArrayBuffer as buffers
      if (util$1.isBrowser() && typeof ArrayBuffer !== 'undefined' && data && data.buffer instanceof ArrayBuffer) isBuffer = true;

      if (callback && typeof data === 'object' &&
          typeof data.on === 'function' && !isBuffer) {
        data.on('data', function(chunk) { hash.update(chunk); });
        data.on('error', function(err) { callback(err); });
        data.on('end', function() { callback(null, hash.digest(digest)); });
      } else if (callback && sliceFn && !isBuffer &&
                 typeof FileReader !== 'undefined') {
        // this might be a File/Blob
        var index = 0, size = 1024 * 512;
        var reader = new FileReader();
        reader.onerror = function() {
          callback(new Error('Failed to read data.'));
        };
        reader.onload = function() {
          var buf = new util$1.Buffer(new Uint8Array(reader.result));
          hash.update(buf);
          index += buf.length;
          reader._continueReading();
        };
        reader._continueReading = function() {
          if (index >= data.size) {
            callback(null, hash.digest(digest));
            return;
          }

          var back = index + size;
          if (back > data.size) back = data.size;
          reader.readAsArrayBuffer(sliceFn.call(data, index, back));
        };

        reader._continueReading();
      } else {
        if (util$1.isBrowser() && typeof data === 'object' && !isBuffer) {
          data = new util$1.Buffer(new Uint8Array(data));
        }
        var out = hash.update(data).digest(digest);
        if (callback) callback(null, out);
        return out;
      }
    },

    toHex: function toHex(data) {
      var out = [];
      for (var i = 0; i < data.length; i++) {
        out.push(('0' + data.charCodeAt(i).toString(16)).substr(-2, 2));
      }
      return out.join('');
    },

    createHash: function createHash(algorithm) {
      return util$1.crypto.lib.createHash(algorithm);
    }

  },

  /** @!ignore */

  /* Abort constant */
  abort: {},

  each: function each(object, iterFunction) {
    for (var key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        var ret = iterFunction.call(this, key, object[key]);
        if (ret === util$1.abort) break;
      }
    }
  },

  arrayEach: function arrayEach(array, iterFunction) {
    for (var idx in array) {
      if (Object.prototype.hasOwnProperty.call(array, idx)) {
        var ret = iterFunction.call(this, array[idx], parseInt(idx, 10));
        if (ret === util$1.abort) break;
      }
    }
  },

  update: function update(obj1, obj2) {
    util$1.each(obj2, function iterator(key, item) {
      obj1[key] = item;
    });
    return obj1;
  },

  merge: function merge(obj1, obj2) {
    return util$1.update(util$1.copy(obj1), obj2);
  },

  copy: function copy(object) {
    if (object === null || object === undefined) return object;
    var dupe = {};
    // jshint forin:false
    for (var key in object) {
      dupe[key] = object[key];
    }
    return dupe;
  },

  isEmpty: function isEmpty(obj) {
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        return false;
      }
    }
    return true;
  },

  arraySliceFn: function arraySliceFn(obj) {
    var fn = obj.slice || obj.webkitSlice || obj.mozSlice;
    return typeof fn === 'function' ? fn : null;
  },

  isType: function isType(obj, type) {
    // handle cross-"frame" objects
    if (typeof type === 'function') type = util$1.typeName(type);
    return Object.prototype.toString.call(obj) === '[object ' + type + ']';
  },

  typeName: function typeName(type) {
    if (Object.prototype.hasOwnProperty.call(type, 'name')) return type.name;
    var str = type.toString();
    var match = str.match(/^\s*function (.+)\(/);
    return match ? match[1] : str;
  },

  error: function error(err, options) {
    var originalError = null;
    if (typeof err.message === 'string' && err.message !== '') {
      if (typeof options === 'string' || (options && options.message)) {
        originalError = util$1.copy(err);
        originalError.message = err.message;
      }
    }
    err.message = err.message || null;

    if (typeof options === 'string') {
      err.message = options;
    } else if (typeof options === 'object' && options !== null) {
      util$1.update(err, options);
      if (options.message)
        err.message = options.message;
      if (options.code || options.name)
        err.code = options.code || options.name;
      if (options.stack)
        err.stack = options.stack;
    }

    if (typeof Object.defineProperty === 'function') {
      Object.defineProperty(err, 'name', {writable: true, enumerable: false});
      Object.defineProperty(err, 'message', {enumerable: true});
    }

    err.name = options && options.name || err.name || err.code || 'Error';
    err.time = new Date();

    if (originalError) err.originalError = originalError;

    return err;
  },

  /**
   * @api private
   */
  inherit: function inherit(klass, features) {
    var newObject = null;
    if (features === undefined) {
      features = klass;
      klass = Object;
      newObject = {};
    } else {
      var ctor = function ConstructorWrapper() {};
      ctor.prototype = klass.prototype;
      newObject = new ctor();
    }

    // constructor not supplied, create pass-through ctor
    if (features.constructor === Object) {
      features.constructor = function() {
        if (klass !== Object) {
          return klass.apply(this, arguments);
        }
      };
    }

    features.constructor.prototype = newObject;
    util$1.update(features.constructor.prototype, features);
    features.constructor.__super__ = klass;
    return features.constructor;
  },

  /**
   * @api private
   */
  mixin: function mixin() {
    var klass = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
      // jshint forin:false
      for (var prop in arguments[i].prototype) {
        var fn = arguments[i].prototype[prop];
        if (prop !== 'constructor') {
          klass.prototype[prop] = fn;
        }
      }
    }
    return klass;
  },

  /**
   * @api private
   */
  hideProperties: function hideProperties(obj, props) {
    if (typeof Object.defineProperty !== 'function') return;

    util$1.arrayEach(props, function (key) {
      Object.defineProperty(obj, key, {
        enumerable: false, writable: true, configurable: true });
    });
  },

  /**
   * @api private
   */
  property: function property(obj, name, value, enumerable, isValue) {
    var opts = {
      configurable: true,
      enumerable: enumerable !== undefined ? enumerable : true
    };
    if (typeof value === 'function' && !isValue) {
      opts.get = value;
    }
    else {
      opts.value = value; opts.writable = true;
    }

    Object.defineProperty(obj, name, opts);
  },

  /**
   * @api private
   */
  memoizedProperty: function memoizedProperty(obj, name, get, enumerable) {
    var cachedValue = null;

    // build enumerable attribute for each value with lazy accessor.
    util$1.property(obj, name, function() {
      if (cachedValue === null) {
        cachedValue = get();
      }
      return cachedValue;
    }, enumerable);
  },

  /**
   * TODO Remove in major version revision
   * This backfill populates response data without the
   * top-level payload name.
   *
   * @api private
   */
  hoistPayloadMember: function hoistPayloadMember(resp) {
    var req = resp.request;
    var operation = req.operation;
    var output = req.service.api.operations[operation].output;
    if (output.payload) {
      var payloadMember = output.members[output.payload];
      var responsePayload = resp.data[output.payload];
      if (payloadMember.type === 'structure') {
        util$1.each(responsePayload, function(key, value) {
          util$1.property(resp.data, key, value, false);
        });
      }
    }
  },

  /**
   * Compute SHA-256 checksums of streams
   *
   * @api private
   */
  computeSha256: function computeSha256(body, done) {
    if (util$1.isNode()) {
      var Stream = util$1.stream.Stream;
      var fs$$1 = fs__default;
      if (body instanceof Stream) {
        if (typeof body.path === 'string') { // assume file object
          var settings = {};
          if (typeof body.start === 'number') {
            settings.start = body.start;
          }
          if (typeof body.end === 'number') {
            settings.end = body.end;
          }
          body = fs$$1.createReadStream(body.path, settings);
        } else { // TODO support other stream types
          return done(new Error('Non-file stream objects are ' +
                                'not supported with SigV4'));
        }
      }
    }

    util$1.crypto.sha256(body, 'hex', function(err, sha) {
      if (err) done(err);
      else done(null, sha);
    });
  },

  /**
   * @api private
   */
  isClockSkewed: function isClockSkewed(serverTime) {
    if (serverTime) {
      util$1.property(AWS$1.config, 'isClockSkewed',
        Math.abs(new Date().getTime() - serverTime) >= 300000, false);
      return AWS$1.config.isClockSkewed;
    }
  },

  applyClockOffset: function applyClockOffset(serverTime) {
    if (serverTime)
      AWS$1.config.systemClockOffset = serverTime - new Date().getTime();
  },

  /**
   * @api private
   */
  extractRequestId: function extractRequestId(resp) {
    var requestId = resp.httpResponse.headers['x-amz-request-id'] ||
                     resp.httpResponse.headers['x-amzn-requestid'];

    if (!requestId && resp.data && resp.data.ResponseMetadata) {
      requestId = resp.data.ResponseMetadata.RequestId;
    }

    if (requestId) {
      resp.requestId = requestId;
    }

    if (resp.error) {
      resp.error.requestId = requestId;
    }
  },

  /**
   * @api private
   */
  addPromises: function addPromises(constructors, PromiseDependency) {
    if (PromiseDependency === undefined && AWS$1 && AWS$1.config) {
      PromiseDependency = AWS$1.config.getPromisesDependency();
    }
    if (PromiseDependency === undefined && typeof Promise !== 'undefined') {
      PromiseDependency = Promise;
    }
    if (typeof PromiseDependency !== 'function') var deletePromises = true;
    if (!Array.isArray(constructors)) constructors = [constructors];

    for (var ind = 0; ind < constructors.length; ind++) {
      var constructor = constructors[ind];
      if (deletePromises) {
        if (constructor.deletePromisesFromClass) {
          constructor.deletePromisesFromClass();
        }
      } else if (constructor.addPromisesToClass) {
        constructor.addPromisesToClass(PromiseDependency);
      }
    }
  },

  /**
   * @api private
   */
  promisifyMethod: function promisifyMethod(methodName, PromiseDependency) {
    return function promise() {
      var self = this;
      return new PromiseDependency(function(resolve, reject) {
        self[methodName](function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    };
  },

  /**
   * @api private
   */
  isDualstackAvailable: function isDualstackAvailable(service) {
    if (!service) return false;
    var metadata = require$$2$5;
    if (typeof service !== 'string') service = service.serviceIdentifier;
    if (typeof service !== 'string' || !metadata.hasOwnProperty(service)) return false;
    return !!metadata[service].dualstackAvailable;
  },

  /**
   * @api private
   */
  calculateRetryDelay: function calculateRetryDelay(retryCount, retryDelayOptions) {
    if (!retryDelayOptions) retryDelayOptions = {};
    var customBackoff = retryDelayOptions.customBackoff || null;
    if (typeof customBackoff === 'function') {
      return customBackoff(retryCount);
    }
    var base = typeof retryDelayOptions.base === 'number' ? retryDelayOptions.base : 100;
    var delay = Math.random() * (Math.pow(2, retryCount) * base);
    return delay;
  },

  /**
   * @api private
   */
  handleRequestWithRetries: function handleRequestWithRetries(httpRequest, options, cb) {
    if (!options) options = {};
    var http$$1 = AWS$1.HttpClient.getInstance();
    var httpOptions = options.httpOptions || {};
    var retryCount = 0;

    var errCallback = function(err) {
      var maxRetries = options.maxRetries || 0;
      if (err && err.code === 'TimeoutError') err.retryable = true;
      if (err && err.retryable && retryCount < maxRetries) {
        retryCount++;
        var delay = util$1.calculateRetryDelay(retryCount, options.retryDelayOptions);
        setTimeout(sendRequest, delay + (err.retryAfter || 0));
      } else {
        cb(err);
      }
    };

    var sendRequest = function() {
      var data = '';
      http$$1.handleRequest(httpRequest, httpOptions, function(httpResponse) {
        httpResponse.on('data', function(chunk) { data += chunk.toString(); });
        httpResponse.on('end', function() {
          var statusCode = httpResponse.statusCode;
          if (statusCode < 300) {
            cb(null, data);
          } else {
            var retryAfter = parseInt(httpResponse.headers['retry-after'], 10) * 1000 || 0;
            var err = util$1.error(new Error(),
              { retryable: statusCode >= 500 || statusCode === 429 }
            );
            if (retryAfter && err.retryable) err.retryAfter = retryAfter;
            errCallback(err);
          }
        });
      }, errCallback);
    };

    AWS$1.util.defer(sendRequest);
  },

  /**
   * @api private
   */
  uuid: {
    v4: function uuidV4() {
      return uuid_1.v4();
    }
  },

  /**
   * @api private
   */
  convertPayloadToString: function convertPayloadToString(resp) {
    var req = resp.request;
    var operation = req.operation;
    var rules = req.service.api.operations[operation].output || {};
    if (rules.payload && resp.data[rules.payload]) {
      resp.data[rules.payload] = resp.data[rules.payload].toString();
    }
  },

  /**
   * @api private
   */
  defer: function defer(callback) {
    if (typeof process === 'object' && typeof process.nextTick === 'function') {
      process.nextTick(callback);
    } else if (typeof setImmediate === 'function') {
      setImmediate(callback);
    } else {
      setTimeout(callback, 0);
    }
  },

  /**
   * @api private
   */
  defaultProfile: 'default',

  /**
   * @api private
   */
  configOptInEnv: 'AWS_SDK_LOAD_CONFIG',

  /**
   * @api private
   */
  sharedCredentialsFileEnv: 'AWS_SHARED_CREDENTIALS_FILE',

  /**
   * @api private
   */
  sharedConfigFileEnv: 'AWS_CONFIG_FILE'
};

var util_1 = util$1;

core.util.update(core.STS.prototype, {
  /**
   * @overload credentialsFrom(data, credentials = null)
   *   Creates a credentials object from STS response data containing
   *   credentials information. Useful for quickly setting AWS credentials.
   *
   *   @note This is a low-level utility function. If you want to load temporary
   *     credentials into your process for subsequent requests to AWS resources,
   *     you should use {AWS.TemporaryCredentials} instead.
   *   @param data [map] data retrieved from a call to {getFederatedToken},
   *     {getSessionToken}, {assumeRole}, or {assumeRoleWithWebIdentity}.
   *   @param credentials [AWS.Credentials] an optional credentials object to
   *     fill instead of creating a new object. Useful when modifying an
   *     existing credentials object from a refresh call.
   *   @return [AWS.TemporaryCredentials] the set of temporary credentials
   *     loaded from a raw STS operation response.
   *   @example Using credentialsFrom to load global AWS credentials
   *     var sts = new AWS.STS();
   *     sts.getSessionToken(function (err, data) {
   *       if (err) console.log("Error getting credentials");
   *       else {
   *         AWS.config.credentials = sts.credentialsFrom(data);
   *       }
   *     });
   *   @see AWS.TemporaryCredentials
   */
  credentialsFrom: function credentialsFrom(data, credentials) {
    if (!data) return null;
    if (!credentials) credentials = new core.TemporaryCredentials();
    credentials.expired = false;
    credentials.accessKeyId = data.Credentials.AccessKeyId;
    credentials.secretAccessKey = data.Credentials.SecretAccessKey;
    credentials.sessionToken = data.Credentials.SessionToken;
    credentials.expireTime = data.Credentials.Expiration;
    return credentials;
  },

  assumeRoleWithWebIdentity: function assumeRoleWithWebIdentity(params, callback) {
    return this.makeUnauthenticatedRequest('assumeRoleWithWebIdentity', params, callback);
  },

  assumeRoleWithSAML: function assumeRoleWithSAML(params, callback) {
    return this.makeUnauthenticatedRequest('assumeRoleWithSAML', params, callback);
  }
});

var version = "2.0";
var metadata$2 = {"apiVersion":"2011-06-15","endpointPrefix":"sts","globalEndpoint":"sts.amazonaws.com","protocol":"query","serviceAbbreviation":"AWS STS","serviceFullName":"AWS Security Token Service","signatureVersion":"v4","uid":"sts-2011-06-15","xmlNamespace":"https://sts.amazonaws.com/doc/2011-06-15/"};
var operations = {"AssumeRole":{"input":{"type":"structure","required":["RoleArn","RoleSessionName"],"members":{"RoleArn":{},"RoleSessionName":{},"Policy":{},"DurationSeconds":{"type":"integer"},"ExternalId":{},"SerialNumber":{},"TokenCode":{}}},"output":{"resultWrapper":"AssumeRoleResult","type":"structure","members":{"Credentials":{"shape":"Sa"},"AssumedRoleUser":{"shape":"Sf"},"PackedPolicySize":{"type":"integer"}}}},"AssumeRoleWithSAML":{"input":{"type":"structure","required":["RoleArn","PrincipalArn","SAMLAssertion"],"members":{"RoleArn":{},"PrincipalArn":{},"SAMLAssertion":{},"Policy":{},"DurationSeconds":{"type":"integer"}}},"output":{"resultWrapper":"AssumeRoleWithSAMLResult","type":"structure","members":{"Credentials":{"shape":"Sa"},"AssumedRoleUser":{"shape":"Sf"},"PackedPolicySize":{"type":"integer"},"Subject":{},"SubjectType":{},"Issuer":{},"Audience":{},"NameQualifier":{}}}},"AssumeRoleWithWebIdentity":{"input":{"type":"structure","required":["RoleArn","RoleSessionName","WebIdentityToken"],"members":{"RoleArn":{},"RoleSessionName":{},"WebIdentityToken":{},"ProviderId":{},"Policy":{},"DurationSeconds":{"type":"integer"}}},"output":{"resultWrapper":"AssumeRoleWithWebIdentityResult","type":"structure","members":{"Credentials":{"shape":"Sa"},"SubjectFromWebIdentityToken":{},"AssumedRoleUser":{"shape":"Sf"},"PackedPolicySize":{"type":"integer"},"Provider":{},"Audience":{}}}},"DecodeAuthorizationMessage":{"input":{"type":"structure","required":["EncodedMessage"],"members":{"EncodedMessage":{}}},"output":{"resultWrapper":"DecodeAuthorizationMessageResult","type":"structure","members":{"DecodedMessage":{}}}},"GetCallerIdentity":{"input":{"type":"structure","members":{}},"output":{"resultWrapper":"GetCallerIdentityResult","type":"structure","members":{"UserId":{},"Account":{},"Arn":{}}}},"GetFederationToken":{"input":{"type":"structure","required":["Name"],"members":{"Name":{},"Policy":{},"DurationSeconds":{"type":"integer"}}},"output":{"resultWrapper":"GetFederationTokenResult","type":"structure","members":{"Credentials":{"shape":"Sa"},"FederatedUser":{"type":"structure","required":["FederatedUserId","Arn"],"members":{"FederatedUserId":{},"Arn":{}}},"PackedPolicySize":{"type":"integer"}}}},"GetSessionToken":{"input":{"type":"structure","members":{"DurationSeconds":{"type":"integer"},"SerialNumber":{},"TokenCode":{}}},"output":{"resultWrapper":"GetSessionTokenResult","type":"structure","members":{"Credentials":{"shape":"Sa"}}}}};
var shapes = {"Sa":{"type":"structure","required":["AccessKeyId","SecretAccessKey","SessionToken","Expiration"],"members":{"AccessKeyId":{},"SecretAccessKey":{},"SessionToken":{},"Expiration":{"type":"timestamp"}}},"Sf":{"type":"structure","required":["AssumedRoleId","Arn"],"members":{"AssumedRoleId":{},"Arn":{}}}};
var sts20110615_min = {
	version: version,
	metadata: metadata$2,
	operations: operations,
	shapes: shapes
};

var sts20110615_min$1 = Object.freeze({
	version: version,
	metadata: metadata$2,
	operations: operations,
	shapes: shapes,
	default: sts20110615_min
});

var pagination = {};
var sts20110615_paginators = {
	pagination: pagination
};

var sts20110615_paginators$1 = Object.freeze({
	pagination: pagination,
	default: sts20110615_paginators
});

var require$$2$6 = ( sts20110615_min$1 && sts20110615_min ) || sts20110615_min$1;

var require$$3$5 = ( sts20110615_paginators$1 && sts20110615_paginators ) || sts20110615_paginators$1;

var Service$1 = core.Service;
var apiLoader$2 = core.apiLoader;

apiLoader$2.services['sts'] = {};
core.STS = Service$1.defineService('sts', ['2011-06-15']);

Object.defineProperty(apiLoader$2.services['sts'], '2011-06-15', {
  get: function get() {
    var model = require$$2$6;
    model.paginators = require$$3$5.pagination;
    return model;
  },
  enumerable: true,
  configurable: true
});

var sts$1 = core.STS;

/**
 * Represents temporary credentials retrieved from {AWS.STS}. Without any
 * extra parameters, credentials will be fetched from the
 * {AWS.STS.getSessionToken} operation. If an IAM role is provided, the
 * {AWS.STS.assumeRole} operation will be used to fetch credentials for the
 * role instead.
 *
 * To setup temporary credentials, configure a set of master credentials
 * using the standard credentials providers (environment, EC2 instance metadata,
 * or from the filesystem), then set the global credentials to a new
 * temporary credentials object:
 *
 * ```javascript
 * // Note that environment credentials are loaded by default,
 * // the following line is shown for clarity:
 * AWS.config.credentials = new AWS.EnvironmentCredentials('AWS');
 *
 * // Now set temporary credentials seeded from the master credentials
 * AWS.config.credentials = new AWS.TemporaryCredentials();
 *
 * // subsequent requests will now use temporary credentials from AWS STS.
 * new AWS.S3().listBucket(function(err, data) { ... });
 * ```
 *
 * @!attribute masterCredentials
 *   @return [AWS.Credentials] the master (non-temporary) credentials used to
 *     get and refresh temporary credentials from AWS STS.
 * @note (see constructor)
 */
core.TemporaryCredentials = core.util.inherit(core.Credentials, {
  /**
   * Creates a new temporary credentials object.
   *
   * @note In order to create temporary credentials, you first need to have
   *   "master" credentials configured in {AWS.Config.credentials}. These
   *   master credentials are necessary to retrieve the temporary credentials,
   *   as well as refresh the credentials when they expire.
   * @param params [map] a map of options that are passed to the
   *   {AWS.STS.assumeRole} or {AWS.STS.getSessionToken} operations.
   *   If a `RoleArn` parameter is passed in, credentials will be based on the
   *   IAM role.
   * @param masterCredentials [AWS.Credentials] the master (non-temporary) credentials
   *  used to get and refresh temporary credentials from AWS STS.
   * @example Creating a new credentials object for generic temporary credentials
   *   AWS.config.credentials = new AWS.TemporaryCredentials();
   * @example Creating a new credentials object for an IAM role
   *   AWS.config.credentials = new AWS.TemporaryCredentials({
   *     RoleArn: 'arn:aws:iam::1234567890:role/TemporaryCredentials',
   *   });
   * @see AWS.STS.assumeRole
   * @see AWS.STS.getSessionToken
   */
  constructor: function TemporaryCredentials(params, masterCredentials) {
    core.Credentials.call(this);
    this.loadMasterCredentials(masterCredentials);
    this.expired = true;

    this.params = params || {};
    if (this.params.RoleArn) {
      this.params.RoleSessionName =
        this.params.RoleSessionName || 'temporary-credentials';
    }
  },

  /**
   * Refreshes credentials using {AWS.STS.assumeRole} or
   * {AWS.STS.getSessionToken}, depending on whether an IAM role ARN was passed
   * to the credentials {constructor}.
   *
   * @callback callback function(err)
   *   Called when the STS service responds (or fails). When
   *   this callback is called with no error, it means that the credentials
   *   information has been loaded into the object (as the `accessKeyId`,
   *   `secretAccessKey`, and `sessionToken` properties).
   *   @param err [Error] if an error occurred, this value will be filled
   * @see get
   */
  refresh: function refresh(callback) {
    var self = this;
    self.createClients();
    if (!callback) callback = function(err) { if (err) throw err; };

    self.masterCredentials.get(function() {
      self.service.config.credentials = self.masterCredentials;
      var operation = self.params.RoleArn ?
        self.service.assumeRole : self.service.getSessionToken;
      operation.call(self.service, function (err, data) {
        if (!err) {
          self.service.credentialsFrom(data, self);
        }
        callback(err);
      });
    });
  },

  /**
   * @api private
   */
  loadMasterCredentials: function loadMasterCredentials(masterCredentials) {
    this.masterCredentials = masterCredentials || core.config.credentials;
    while (this.masterCredentials.masterCredentials) {
      this.masterCredentials = this.masterCredentials.masterCredentials;
    }

    if (typeof this.masterCredentials.get !== 'function') {
      this.masterCredentials = new core.Credentials(this.masterCredentials);
    }
  },

  /**
   * @api private
   */
  createClients: function() {
    this.service = this.service || new sts$1({params: this.params});
  }

});

/**
 * Represents credentials retrieved from STS Web Identity Federation support.
 *
 * By default this provider gets credentials using the
 * {AWS.STS.assumeRoleWithWebIdentity} service operation. This operation
 * requires a `RoleArn` containing the ARN of the IAM trust policy for the
 * application for which credentials will be given. In addition, the
 * `WebIdentityToken` must be set to the token provided by the identity
 * provider. See {constructor} for an example on creating a credentials
 * object with proper `RoleArn` and `WebIdentityToken` values.
 *
 * ## Refreshing Credentials from Identity Service
 *
 * In addition to AWS credentials expiring after a given amount of time, the
 * login token from the identity provider will also expire. Once this token
 * expires, it will not be usable to refresh AWS credentials, and another
 * token will be needed. The SDK does not manage refreshing of the token value,
 * but this can be done through a "refresh token" supported by most identity
 * providers. Consult the documentation for the identity provider for refreshing
 * tokens. Once the refreshed token is acquired, you should make sure to update
 * this new token in the credentials object's {params} property. The following
 * code will update the WebIdentityToken, assuming you have retrieved an updated
 * token from the identity provider:
 *
 * ```javascript
 * AWS.config.credentials.params.WebIdentityToken = updatedToken;
 * ```
 *
 * Future calls to `credentials.refresh()` will now use the new token.
 *
 * @!attribute params
 *   @return [map] the map of params passed to
 *     {AWS.STS.assumeRoleWithWebIdentity}. To update the token, set the
 *     `params.WebIdentityToken` property.
 * @!attribute data
 *   @return [map] the raw data response from the call to
 *     {AWS.STS.assumeRoleWithWebIdentity}. Use this if you want to get
 *     access to other properties from the response.
 */
core.WebIdentityCredentials = core.util.inherit(core.Credentials, {
  /**
   * Creates a new credentials object.
   * @param (see AWS.STS.assumeRoleWithWebIdentity)
   * @example Creating a new credentials object
   *   AWS.config.credentials = new AWS.WebIdentityCredentials({
   *     RoleArn: 'arn:aws:iam::1234567890:role/WebIdentity',
   *     WebIdentityToken: 'ABCDEFGHIJKLMNOP', // token from identity service
   *     RoleSessionName: 'web' // optional name, defaults to web-identity
   *   }, {
   *     // optionally provide configuration to apply to the underlying AWS.STS service client
   *     // if configuration is not provided, then configuration will be pulled from AWS.config
   *
   *     // specify timeout options
   *     httpOptions: {
   *       timeout: 100
   *     }
   *   });
   * @see AWS.STS.assumeRoleWithWebIdentity
   * @see AWS.Config
   */
  constructor: function WebIdentityCredentials(params, clientConfig) {
    core.Credentials.call(this);
    this.expired = true;
    this.params = params;
    this.params.RoleSessionName = this.params.RoleSessionName || 'web-identity';
    this.data = null;
    this._clientConfig = core.util.copy(clientConfig || {});
  },

  /**
   * Refreshes credentials using {AWS.STS.assumeRoleWithWebIdentity}
   *
   * @callback callback function(err)
   *   Called when the STS service responds (or fails). When
   *   this callback is called with no error, it means that the credentials
   *   information has been loaded into the object (as the `accessKeyId`,
   *   `secretAccessKey`, and `sessionToken` properties).
   *   @param err [Error] if an error occurred, this value will be filled
   * @see get
   */
  refresh: function refresh(callback) {
    var self = this;
    self.createClients();
    if (!callback) callback = function(err) { if (err) throw err; };

    self.service.assumeRoleWithWebIdentity(function (err, data) {
      self.data = null;
      if (!err) {
        self.data = data;
        self.service.credentialsFrom(data, self);
      }
      callback(err);
    });
  },

  /**
   * @api private
   */
  createClients: function() {
    if (!this.service) {
      var stsConfig = core.util.merge({}, this._clientConfig);
      stsConfig.params = this.params;
      this.service = new sts$1(stsConfig);
    }
  }

});

core.util.update(core.CognitoIdentity.prototype, {
  getOpenIdToken: function getOpenIdToken(params, callback) {
    return this.makeUnauthenticatedRequest('getOpenIdToken', params, callback);
  },

  getId: function getId(params, callback) {
    return this.makeUnauthenticatedRequest('getId', params, callback);
  },

  getCredentialsForIdentity: function getCredentialsForIdentity(params, callback) {
    return this.makeUnauthenticatedRequest('getCredentialsForIdentity', params, callback);
  }
});

var version$1 = "2.0";
var metadata$3 = {"apiVersion":"2014-06-30","endpointPrefix":"cognito-identity","jsonVersion":"1.1","protocol":"json","serviceFullName":"Amazon Cognito Identity","signatureVersion":"v4","targetPrefix":"AWSCognitoIdentityService","uid":"cognito-identity-2014-06-30"};
var operations$1 = {"CreateIdentityPool":{"input":{"type":"structure","required":["IdentityPoolName","AllowUnauthenticatedIdentities"],"members":{"IdentityPoolName":{},"AllowUnauthenticatedIdentities":{"type":"boolean"},"SupportedLoginProviders":{"shape":"S4"},"DeveloperProviderName":{},"OpenIdConnectProviderARNs":{"shape":"S8"},"CognitoIdentityProviders":{"shape":"Sa"},"SamlProviderARNs":{"shape":"Sf"}}},"output":{"shape":"Sg"}},"DeleteIdentities":{"input":{"type":"structure","required":["IdentityIdsToDelete"],"members":{"IdentityIdsToDelete":{"type":"list","member":{}}}},"output":{"type":"structure","members":{"UnprocessedIdentityIds":{"type":"list","member":{"type":"structure","members":{"IdentityId":{},"ErrorCode":{}}}}}}},"DeleteIdentityPool":{"input":{"type":"structure","required":["IdentityPoolId"],"members":{"IdentityPoolId":{}}}},"DescribeIdentity":{"input":{"type":"structure","required":["IdentityId"],"members":{"IdentityId":{}}},"output":{"shape":"Sr"}},"DescribeIdentityPool":{"input":{"type":"structure","required":["IdentityPoolId"],"members":{"IdentityPoolId":{}}},"output":{"shape":"Sg"}},"GetCredentialsForIdentity":{"input":{"type":"structure","required":["IdentityId"],"members":{"IdentityId":{},"Logins":{"shape":"Sw"},"CustomRoleArn":{}}},"output":{"type":"structure","members":{"IdentityId":{},"Credentials":{"type":"structure","members":{"AccessKeyId":{},"SecretKey":{},"SessionToken":{},"Expiration":{"type":"timestamp"}}}}}},"GetId":{"input":{"type":"structure","required":["IdentityPoolId"],"members":{"AccountId":{},"IdentityPoolId":{},"Logins":{"shape":"Sw"}}},"output":{"type":"structure","members":{"IdentityId":{}}}},"GetIdentityPoolRoles":{"input":{"type":"structure","required":["IdentityPoolId"],"members":{"IdentityPoolId":{}}},"output":{"type":"structure","members":{"IdentityPoolId":{},"Roles":{"shape":"S18"},"RoleMappings":{"shape":"S1a"}}}},"GetOpenIdToken":{"input":{"type":"structure","required":["IdentityId"],"members":{"IdentityId":{},"Logins":{"shape":"Sw"}}},"output":{"type":"structure","members":{"IdentityId":{},"Token":{}}}},"GetOpenIdTokenForDeveloperIdentity":{"input":{"type":"structure","required":["IdentityPoolId","Logins"],"members":{"IdentityPoolId":{},"IdentityId":{},"Logins":{"shape":"Sw"},"TokenDuration":{"type":"long"}}},"output":{"type":"structure","members":{"IdentityId":{},"Token":{}}}},"ListIdentities":{"input":{"type":"structure","required":["IdentityPoolId","MaxResults"],"members":{"IdentityPoolId":{},"MaxResults":{"type":"integer"},"NextToken":{},"HideDisabled":{"type":"boolean"}}},"output":{"type":"structure","members":{"IdentityPoolId":{},"Identities":{"type":"list","member":{"shape":"Sr"}},"NextToken":{}}}},"ListIdentityPools":{"input":{"type":"structure","required":["MaxResults"],"members":{"MaxResults":{"type":"integer"},"NextToken":{}}},"output":{"type":"structure","members":{"IdentityPools":{"type":"list","member":{"type":"structure","members":{"IdentityPoolId":{},"IdentityPoolName":{}}}},"NextToken":{}}}},"LookupDeveloperIdentity":{"input":{"type":"structure","required":["IdentityPoolId"],"members":{"IdentityPoolId":{},"IdentityId":{},"DeveloperUserIdentifier":{},"MaxResults":{"type":"integer"},"NextToken":{}}},"output":{"type":"structure","members":{"IdentityId":{},"DeveloperUserIdentifierList":{"type":"list","member":{}},"NextToken":{}}}},"MergeDeveloperIdentities":{"input":{"type":"structure","required":["SourceUserIdentifier","DestinationUserIdentifier","DeveloperProviderName","IdentityPoolId"],"members":{"SourceUserIdentifier":{},"DestinationUserIdentifier":{},"DeveloperProviderName":{},"IdentityPoolId":{}}},"output":{"type":"structure","members":{"IdentityId":{}}}},"SetIdentityPoolRoles":{"input":{"type":"structure","required":["IdentityPoolId","Roles"],"members":{"IdentityPoolId":{},"Roles":{"shape":"S18"},"RoleMappings":{"shape":"S1a"}}}},"UnlinkDeveloperIdentity":{"input":{"type":"structure","required":["IdentityId","IdentityPoolId","DeveloperProviderName","DeveloperUserIdentifier"],"members":{"IdentityId":{},"IdentityPoolId":{},"DeveloperProviderName":{},"DeveloperUserIdentifier":{}}}},"UnlinkIdentity":{"input":{"type":"structure","required":["IdentityId","Logins","LoginsToRemove"],"members":{"IdentityId":{},"Logins":{"shape":"Sw"},"LoginsToRemove":{"shape":"Ss"}}}},"UpdateIdentityPool":{"input":{"shape":"Sg"},"output":{"shape":"Sg"}}};
var shapes$1 = {"S4":{"type":"map","key":{},"value":{}},"S8":{"type":"list","member":{}},"Sa":{"type":"list","member":{"type":"structure","members":{"ProviderName":{},"ClientId":{},"ServerSideTokenCheck":{"type":"boolean"}}}},"Sf":{"type":"list","member":{}},"Sg":{"type":"structure","required":["IdentityPoolId","IdentityPoolName","AllowUnauthenticatedIdentities"],"members":{"IdentityPoolId":{},"IdentityPoolName":{},"AllowUnauthenticatedIdentities":{"type":"boolean"},"SupportedLoginProviders":{"shape":"S4"},"DeveloperProviderName":{},"OpenIdConnectProviderARNs":{"shape":"S8"},"CognitoIdentityProviders":{"shape":"Sa"},"SamlProviderARNs":{"shape":"Sf"}}},"Sr":{"type":"structure","members":{"IdentityId":{},"Logins":{"shape":"Ss"},"CreationDate":{"type":"timestamp"},"LastModifiedDate":{"type":"timestamp"}}},"Ss":{"type":"list","member":{}},"Sw":{"type":"map","key":{},"value":{}},"S18":{"type":"map","key":{},"value":{}},"S1a":{"type":"map","key":{},"value":{"type":"structure","required":["Type"],"members":{"Type":{},"AmbiguousRoleResolution":{},"RulesConfiguration":{"type":"structure","required":["Rules"],"members":{"Rules":{"type":"list","member":{"type":"structure","required":["Claim","MatchType","Value","RoleARN"],"members":{"Claim":{},"MatchType":{},"Value":{},"RoleARN":{}}}}}}}}}};
var cognitoIdentity20140630_min = {
	version: version$1,
	metadata: metadata$3,
	operations: operations$1,
	shapes: shapes$1
};

var cognitoIdentity20140630_min$1 = Object.freeze({
	version: version$1,
	metadata: metadata$3,
	operations: operations$1,
	shapes: shapes$1,
	default: cognitoIdentity20140630_min
});

var pagination$1 = {};
var cognitoIdentity20140630_paginators = {
	pagination: pagination$1
};

var cognitoIdentity20140630_paginators$1 = Object.freeze({
	pagination: pagination$1,
	default: cognitoIdentity20140630_paginators
});

var require$$2$7 = ( cognitoIdentity20140630_min$1 && cognitoIdentity20140630_min ) || cognitoIdentity20140630_min$1;

var require$$3$6 = ( cognitoIdentity20140630_paginators$1 && cognitoIdentity20140630_paginators ) || cognitoIdentity20140630_paginators$1;

var Service$2 = core.Service;
var apiLoader$3 = core.apiLoader;

apiLoader$3.services['cognitoidentity'] = {};
core.CognitoIdentity = Service$2.defineService('cognitoidentity', ['2014-06-30']);

Object.defineProperty(apiLoader$3.services['cognitoidentity'], '2014-06-30', {
  get: function get() {
    var model = require$$2$7;
    model.paginators = require$$3$6.pagination;
    return model;
  },
  enumerable: true,
  configurable: true
});

var cognitoidentity$1 = core.CognitoIdentity;

/**
 * Represents credentials retrieved from STS Web Identity Federation using
 * the Amazon Cognito Identity service.
 *
 * By default this provider gets credentials using the
 * {AWS.CognitoIdentity.getCredentialsForIdentity} service operation, which
 * requires either an `IdentityId` or an `IdentityPoolId` (Amazon Cognito
 * Identity Pool ID), which is used to call {AWS.CognitoIdentity.getId} to
 * obtain an `IdentityId`. If the identity or identity pool is not configured in
 * the Amazon Cognito Console to use IAM roles with the appropriate permissions,
 * then additionally a `RoleArn` is required containing the ARN of the IAM trust
 * policy for the Amazon Cognito role that the user will log into. If a `RoleArn`
 * is provided, then this provider gets credentials using the
 * {AWS.STS.assumeRoleWithWebIdentity} service operation, after first getting an
 * Open ID token from {AWS.CognitoIdentity.getOpenIdToken}.
 *
 * In addition, if this credential provider is used to provide authenticated
 * login, the `Logins` map may be set to the tokens provided by the respective
 * identity providers. See {constructor} for an example on creating a credentials
 * object with proper property values.
 *
 * ## Refreshing Credentials from Identity Service
 *
 * In addition to AWS credentials expiring after a given amount of time, the
 * login token from the identity provider will also expire. Once this token
 * expires, it will not be usable to refresh AWS credentials, and another
 * token will be needed. The SDK does not manage refreshing of the token value,
 * but this can be done through a "refresh token" supported by most identity
 * providers. Consult the documentation for the identity provider for refreshing
 * tokens. Once the refreshed token is acquired, you should make sure to update
 * this new token in the credentials object's {params} property. The following
 * code will update the WebIdentityToken, assuming you have retrieved an updated
 * token from the identity provider:
 *
 * ```javascript
 * AWS.config.credentials.params.Logins['graph.facebook.com'] = updatedToken;
 * ```
 *
 * Future calls to `credentials.refresh()` will now use the new token.
 *
 * @!attribute params
 *   @return [map] the map of params passed to
 *     {AWS.CognitoIdentity.getId},
 *     {AWS.CognitoIdentity.getOpenIdToken}, and
 *     {AWS.STS.assumeRoleWithWebIdentity}. To update the token, set the
 *     `params.WebIdentityToken` property.
 * @!attribute data
 *   @return [map] the raw data response from the call to
 *     {AWS.CognitoIdentity.getCredentialsForIdentity}, or
 *     {AWS.STS.assumeRoleWithWebIdentity}. Use this if you want to get
 *     access to other properties from the response.
 * @!attribute identityId
 *   @return [String] the Cognito ID returned by the last call to
 *     {AWS.CognitoIdentity.getOpenIdToken}. This ID represents the actual
 *     final resolved identity ID from Amazon Cognito.
 */
core.CognitoIdentityCredentials = core.util.inherit(core.Credentials, {
  /**
   * @api private
   */
  localStorageKey: {
    id: 'aws.cognito.identity-id.',
    providers: 'aws.cognito.identity-providers.'
  },

  /**
   * Creates a new credentials object.
   * @example Creating a new credentials object
   *   AWS.config.credentials = new AWS.CognitoIdentityCredentials({
   *
   *     // either IdentityPoolId or IdentityId is required
   *     // See the IdentityPoolId param for AWS.CognitoIdentity.getID (linked below)
   *     // See the IdentityId param for AWS.CognitoIdentity.getCredentialsForIdentity
   *     // or AWS.CognitoIdentity.getOpenIdToken (linked below)
   *     IdentityPoolId: 'us-east-1:1699ebc0-7900-4099-b910-2df94f52a030',
   *     IdentityId: 'us-east-1:128d0a74-c82f-4553-916d-90053e4a8b0f'
   *
   *     // optional, only necessary when the identity pool is not configured
   *     // to use IAM roles in the Amazon Cognito Console
   *     // See the RoleArn param for AWS.STS.assumeRoleWithWebIdentity (linked below)
   *     RoleArn: 'arn:aws:iam::1234567890:role/MYAPP-CognitoIdentity',
   *
   *     // optional tokens, used for authenticated login
   *     // See the Logins param for AWS.CognitoIdentity.getID (linked below)
   *     Logins: {
   *       'graph.facebook.com': 'FBTOKEN',
   *       'www.amazon.com': 'AMAZONTOKEN',
   *       'accounts.google.com': 'GOOGLETOKEN',
   *       'api.twitter.com': 'TWITTERTOKEN',
   *       'www.digits.com': 'DIGITSTOKEN'
   *     },
   *
   *     // optional name, defaults to web-identity
   *     // See the RoleSessionName param for AWS.STS.assumeRoleWithWebIdentity (linked below)
   *     RoleSessionName: 'web',
   *
   *     // optional, only necessary when application runs in a browser
   *     // and multiple users are signed in at once, used for caching
   *     LoginId: 'example@gmail.com'
   *
   *   }, {
   *      // optionally provide configuration to apply to the underlying service clients
   *      // if configuration is not provided, then configuration will be pulled from AWS.config
   *
   *      // region should match the region your identity pool is located in
   *      region: 'us-east-1',
   *
   *      // specify timeout options
   *      httpOptions: {
   *        timeout: 100
   *      }
   *   });
   * @see AWS.CognitoIdentity.getId
   * @see AWS.CognitoIdentity.getCredentialsForIdentity
   * @see AWS.STS.assumeRoleWithWebIdentity
   * @see AWS.CognitoIdentity.getOpenIdToken
   * @see AWS.Config
   * @note If a region is not provided in the global AWS.config, or
   *   specified in the `clientConfig` to the CognitoIdentityCredentials
   *   constructor, you may encounter a 'Missing credentials in config' error
   *   when calling making a service call.
   */
  constructor: function CognitoIdentityCredentials(params, clientConfig) {
    core.Credentials.call(this);
    this.expired = true;
    this.params = params;
    this.data = null;
    this._identityId = null;
    this._clientConfig = core.util.copy(clientConfig || {});
    this.loadCachedId();
    var self = this;
    Object.defineProperty(this, 'identityId', {
      get: function() {
        self.loadCachedId();
        return self._identityId || self.params.IdentityId;
      },
      set: function(identityId) {
        self._identityId = identityId;
      }
    });
  },

  /**
   * Refreshes credentials using {AWS.CognitoIdentity.getCredentialsForIdentity},
   * or {AWS.STS.assumeRoleWithWebIdentity}.
   *
   * @callback callback function(err)
   *   Called when the STS service responds (or fails). When
   *   this callback is called with no error, it means that the credentials
   *   information has been loaded into the object (as the `accessKeyId`,
   *   `secretAccessKey`, and `sessionToken` properties).
   *   @param err [Error] if an error occurred, this value will be filled
   * @see AWS.Credentials.get
   */
  refresh: function refresh(callback) {
    var self = this;
    self.createClients();
    self.data = null;
    self._identityId = null;
    self.getId(function(err) {
      if (!err) {
        if (!self.params.RoleArn) {
          self.getCredentialsForIdentity(callback);
        } else {
          self.getCredentialsFromSTS(callback);
        }
      } else {
        self.clearIdOnNotAuthorized(err);
        callback(err);
      }
    });
  },

  /**
   * Clears the cached Cognito ID associated with the currently configured
   * identity pool ID. Use this to manually invalidate your cache if
   * the identity pool ID was deleted.
   */
  clearCachedId: function clearCache() {
    this._identityId = null;
    delete this.params.IdentityId;

    var poolId = this.params.IdentityPoolId;
    var loginId = this.params.LoginId || '';
    delete this.storage[this.localStorageKey.id + poolId + loginId];
    delete this.storage[this.localStorageKey.providers + poolId + loginId];
  },

  /**
   * @api private
   */
  clearIdOnNotAuthorized: function clearIdOnNotAuthorized(err) {
    var self = this;
    if (err.code == 'NotAuthorizedException') {
      self.clearCachedId();
    }
  },

  /**
   * Retrieves a Cognito ID, loading from cache if it was already retrieved
   * on this device.
   *
   * @callback callback function(err, identityId)
   *   @param err [Error, null] an error object if the call failed or null if
   *     it succeeded.
   *   @param identityId [String, null] if successful, the callback will return
   *     the Cognito ID.
   * @note If not loaded explicitly, the Cognito ID is loaded and stored in
   *   localStorage in the browser environment of a device.
   * @api private
   */
  getId: function getId(callback) {
    var self = this;
    if (typeof self.params.IdentityId === 'string') {
      return callback(null, self.params.IdentityId);
    }

    self.cognito.getId(function(err, data) {
      if (!err && data.IdentityId) {
        self.params.IdentityId = data.IdentityId;
        callback(null, data.IdentityId);
      } else {
        callback(err);
      }
    });
  },


  /**
   * @api private
   */
  loadCredentials: function loadCredentials(data, credentials) {
    if (!data || !credentials) return;
    credentials.expired = false;
    credentials.accessKeyId = data.Credentials.AccessKeyId;
    credentials.secretAccessKey = data.Credentials.SecretKey;
    credentials.sessionToken = data.Credentials.SessionToken;
    credentials.expireTime = data.Credentials.Expiration;
  },

  /**
   * @api private
   */
  getCredentialsForIdentity: function getCredentialsForIdentity(callback) {
    var self = this;
    self.cognito.getCredentialsForIdentity(function(err, data) {
      if (!err) {
        self.cacheId(data);
        self.data = data;
        self.loadCredentials(self.data, self);
      } else {
        self.clearIdOnNotAuthorized(err);
      }
      callback(err);
    });
  },

  /**
   * @api private
   */
  getCredentialsFromSTS: function getCredentialsFromSTS(callback) {
    var self = this;
    self.cognito.getOpenIdToken(function(err, data) {
      if (!err) {
        self.cacheId(data);
        self.params.WebIdentityToken = data.Token;
        self.webIdentityCredentials.refresh(function(webErr) {
          if (!webErr) {
            self.data = self.webIdentityCredentials.data;
            self.sts.credentialsFrom(self.data, self);
          }
          callback(webErr);
        });
      } else {
        self.clearIdOnNotAuthorized(err);
        callback(err);
      }
    });
  },

  /**
   * @api private
   */
  loadCachedId: function loadCachedId() {
    var self = this;

    // in the browser we source default IdentityId from localStorage
    if (core.util.isBrowser() && !self.params.IdentityId) {
      var id = self.getStorage('id');
      if (id && self.params.Logins) {
        var actualProviders = Object.keys(self.params.Logins);
        var cachedProviders =
          (self.getStorage('providers') || '').split(',');

        // only load ID if at least one provider used this ID before
        var intersect = cachedProviders.filter(function(n) {
          return actualProviders.indexOf(n) !== -1;
        });
        if (intersect.length !== 0) {
          self.params.IdentityId = id;
        }
      } else if (id) {
        self.params.IdentityId = id;
      }
    }
  },

  /**
   * @api private
   */
  createClients: function() {
    var clientConfig = this._clientConfig;
    this.webIdentityCredentials = this.webIdentityCredentials ||
      new core.WebIdentityCredentials(this.params, clientConfig);
    if (!this.cognito) {
      var cognitoConfig = core.util.merge({}, clientConfig);
      cognitoConfig.params = this.params;
      this.cognito = new cognitoidentity$1(cognitoConfig);
    }
    this.sts = this.sts || new sts$1(clientConfig);
  },

  /**
   * @api private
   */
  cacheId: function cacheId(data) {
    this._identityId = data.IdentityId;
    this.params.IdentityId = this._identityId;

    // cache this IdentityId in browser localStorage if possible
    if (core.util.isBrowser()) {
      this.setStorage('id', data.IdentityId);

      if (this.params.Logins) {
        this.setStorage('providers', Object.keys(this.params.Logins).join(','));
      }
    }
  },

  /**
   * @api private
   */
  getStorage: function getStorage(key) {
    return this.storage[this.localStorageKey[key] + this.params.IdentityPoolId + (this.params.LoginId || '')];
  },

  /**
   * @api private
   */
  setStorage: function setStorage(key, val) {
    try {
      this.storage[this.localStorageKey[key] + this.params.IdentityPoolId + (this.params.LoginId || '')] = val;
    } catch (_) {}
  },

  /**
   * @api private
   */
  storage: (function() {
    try {
      var storage = core.util.isBrowser() && window.localStorage !== null && typeof window.localStorage === 'object' ?
          window.localStorage : {};

      // Test set/remove which would throw an error in Safari's private browsing
      storage['aws.test-storage'] = 'foobar';
      delete storage['aws.test-storage'];

      return storage;
    } catch (_) {
      return {};
    }
  })()
});

/**
 * Represents credentials retrieved from STS SAML support.
 *
 * By default this provider gets credentials using the
 * {AWS.STS.assumeRoleWithSAML} service operation. This operation
 * requires a `RoleArn` containing the ARN of the IAM trust policy for the
 * application for which credentials will be given, as well as a `PrincipalArn`
 * representing the ARN for the SAML identity provider. In addition, the
 * `SAMLAssertion` must be set to the token provided by the identity
 * provider. See {constructor} for an example on creating a credentials
 * object with proper `RoleArn`, `PrincipalArn`, and `SAMLAssertion` values.
 *
 * ## Refreshing Credentials from Identity Service
 *
 * In addition to AWS credentials expiring after a given amount of time, the
 * login token from the identity provider will also expire. Once this token
 * expires, it will not be usable to refresh AWS credentials, and another
 * token will be needed. The SDK does not manage refreshing of the token value,
 * but this can be done through a "refresh token" supported by most identity
 * providers. Consult the documentation for the identity provider for refreshing
 * tokens. Once the refreshed token is acquired, you should make sure to update
 * this new token in the credentials object's {params} property. The following
 * code will update the SAMLAssertion, assuming you have retrieved an updated
 * token from the identity provider:
 *
 * ```javascript
 * AWS.config.credentials.params.SAMLAssertion = updatedToken;
 * ```
 *
 * Future calls to `credentials.refresh()` will now use the new token.
 *
 * @!attribute params
 *   @return [map] the map of params passed to
 *     {AWS.STS.assumeRoleWithSAML}. To update the token, set the
 *     `params.SAMLAssertion` property.
 */
core.SAMLCredentials = core.util.inherit(core.Credentials, {
  /**
   * Creates a new credentials object.
   * @param (see AWS.STS.assumeRoleWithSAML)
   * @example Creating a new credentials object
   *   AWS.config.credentials = new AWS.SAMLCredentials({
   *     RoleArn: 'arn:aws:iam::1234567890:role/SAMLRole',
   *     PrincipalArn: 'arn:aws:iam::1234567890:role/SAMLPrincipal',
   *     SAMLAssertion: 'base64-token', // base64-encoded token from IdP
   *   });
   * @see AWS.STS.assumeRoleWithSAML
   */
  constructor: function SAMLCredentials(params) {
    core.Credentials.call(this);
    this.expired = true;
    this.params = params;
  },

  /**
   * Refreshes credentials using {AWS.STS.assumeRoleWithSAML}
   *
   * @callback callback function(err)
   *   Called when the STS service responds (or fails). When
   *   this callback is called with no error, it means that the credentials
   *   information has been loaded into the object (as the `accessKeyId`,
   *   `secretAccessKey`, and `sessionToken` properties).
   *   @param err [Error] if an error occurred, this value will be filled
   * @see get
   */
  refresh: function refresh(callback) {
    var self = this;
    self.createClients();
    if (!callback) callback = function(err) { if (err) throw err; };

    self.service.assumeRoleWithSAML(function (err, data) {
      if (!err) {
        self.service.credentialsFrom(data, self);
      }
      callback(err);
    });
  },

  /**
   * @api private
   */
  createClients: function() {
    this.service = this.service || new sts$1({params: this.params});
  }

});

var sax = createCommonjsModule(function (module, exports) {
(function (sax) { // wrapper for non-node envs
  sax.parser = function (strict, opt) { return new SAXParser(strict, opt) };
  sax.SAXParser = SAXParser;
  sax.SAXStream = SAXStream;
  sax.createStream = createStream;

  // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
  // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
  // since that's the earliest that a buffer overrun could occur.  This way, checks are
  // as rare as required, but as often as necessary to ensure never crossing this bound.
  // Furthermore, buffers are only tested at most once per write(), so passing a very
  // large string into write() might have undesirable effects, but this is manageable by
  // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
  // edge case, result in creating at most one complete copy of the string passed in.
  // Set to Infinity to have unlimited buffers.
  sax.MAX_BUFFER_LENGTH = 64 * 1024;

  var buffers = [
    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
    'procInstName', 'procInstBody', 'entity', 'attribName',
    'attribValue', 'cdata', 'script'
  ];

  sax.EVENTS = [
    'text',
    'processinginstruction',
    'sgmldeclaration',
    'doctype',
    'comment',
    'opentagstart',
    'attribute',
    'opentag',
    'closetag',
    'opencdata',
    'cdata',
    'closecdata',
    'error',
    'end',
    'ready',
    'script',
    'opennamespace',
    'closenamespace'
  ];

  function SAXParser (strict, opt) {
    if (!(this instanceof SAXParser)) {
      return new SAXParser(strict, opt)
    }

    var parser = this;
    clearBuffers(parser);
    parser.q = parser.c = '';
    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
    parser.opt = opt || {};
    parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
    parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase';
    parser.tags = [];
    parser.closed = parser.closedRoot = parser.sawRoot = false;
    parser.tag = parser.error = null;
    parser.strict = !!strict;
    parser.noscript = !!(strict || parser.opt.noscript);
    parser.state = S.BEGIN;
    parser.strictEntities = parser.opt.strictEntities;
    parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
    parser.attribList = [];

    // namespaces form a prototype chain.
    // it always points at the current tag,
    // which protos to its parent tag.
    if (parser.opt.xmlns) {
      parser.ns = Object.create(rootNS);
    }

    // mostly just for error reporting
    parser.trackPosition = parser.opt.position !== false;
    if (parser.trackPosition) {
      parser.position = parser.line = parser.column = 0;
    }
    emit(parser, 'onready');
  }

  if (!Object.create) {
    Object.create = function (o) {
      function F () {}
      F.prototype = o;
      var newf = new F();
      return newf
    };
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      var a = [];
      for (var i in o) if (o.hasOwnProperty(i)) a.push(i);
      return a
    };
  }

  function checkBufferLength (parser) {
    var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
    var maxActual = 0;
    for (var i = 0, l = buffers.length; i < l; i++) {
      var len = parser[buffers[i]].length;
      if (len > maxAllowed) {
        // Text/cdata nodes can get big, and since they're buffered,
        // we can get here under normal conditions.
        // Avoid issues by emitting the text node now,
        // so at least it won't get any bigger.
        switch (buffers[i]) {
          case 'textNode':
            closeText(parser);
            break

          case 'cdata':
            emitNode(parser, 'oncdata', parser.cdata);
            parser.cdata = '';
            break

          case 'script':
            emitNode(parser, 'onscript', parser.script);
            parser.script = '';
            break

          default:
            error(parser, 'Max buffer length exceeded: ' + buffers[i]);
        }
      }
      maxActual = Math.max(maxActual, len);
    }
    // schedule the next check for the earliest possible buffer overrun.
    var m = sax.MAX_BUFFER_LENGTH - maxActual;
    parser.bufferCheckPosition = m + parser.position;
  }

  function clearBuffers (parser) {
    for (var i = 0, l = buffers.length; i < l; i++) {
      parser[buffers[i]] = '';
    }
  }

  function flushBuffers (parser) {
    closeText(parser);
    if (parser.cdata !== '') {
      emitNode(parser, 'oncdata', parser.cdata);
      parser.cdata = '';
    }
    if (parser.script !== '') {
      emitNode(parser, 'onscript', parser.script);
      parser.script = '';
    }
  }

  SAXParser.prototype = {
    end: function () { end(this); },
    write: write,
    resume: function () { this.error = null; return this },
    close: function () { return this.write(null) },
    flush: function () { flushBuffers(this); }
  };

  var Stream;
  try {
    Stream = stream.Stream;
  } catch (ex) {
    Stream = function () {};
  }

  var streamWraps = sax.EVENTS.filter(function (ev) {
    return ev !== 'error' && ev !== 'end'
  });

  function createStream (strict, opt) {
    return new SAXStream(strict, opt)
  }

  function SAXStream (strict, opt) {
    if (!(this instanceof SAXStream)) {
      return new SAXStream(strict, opt)
    }

    Stream.apply(this);

    this._parser = new SAXParser(strict, opt);
    this.writable = true;
    this.readable = true;

    var me = this;

    this._parser.onend = function () {
      me.emit('end');
    };

    this._parser.onerror = function (er) {
      me.emit('error', er);

      // if didn't throw, then means error was handled.
      // go ahead and clear error, so we can write again.
      me._parser.error = null;
    };

    this._decoder = null;

    streamWraps.forEach(function (ev) {
      Object.defineProperty(me, 'on' + ev, {
        get: function () {
          return me._parser['on' + ev]
        },
        set: function (h) {
          if (!h) {
            me.removeAllListeners(ev);
            me._parser['on' + ev] = h;
            return h
          }
          me.on(ev, h);
        },
        enumerable: true,
        configurable: false
      });
    });
  }

  SAXStream.prototype = Object.create(Stream.prototype, {
    constructor: {
      value: SAXStream
    }
  });

  SAXStream.prototype.write = function (data) {
    if (typeof Buffer === 'function' &&
      typeof Buffer.isBuffer === 'function' &&
      Buffer.isBuffer(data)) {
      if (!this._decoder) {
        var SD = string_decoder.StringDecoder;
        this._decoder = new SD('utf8');
      }
      data = this._decoder.write(data);
    }

    this._parser.write(data.toString());
    this.emit('data', data);
    return true
  };

  SAXStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) {
      this.write(chunk);
    }
    this._parser.end();
    return true
  };

  SAXStream.prototype.on = function (ev, handler) {
    var me = this;
    if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
      me._parser['on' + ev] = function () {
        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
        args.splice(0, 0, ev);
        me.emit.apply(me, args);
      };
    }

    return Stream.prototype.on.call(me, ev, handler)
  };

  // character classes and tokens
  var whitespace = '\r\n\t ';

  // this really needs to be replaced with character classes.
  // XML allows all manner of ridiculous numbers and digits.
  var number = '0124356789';
  var letter = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // (Letter | "_" | ":")
  var quote = '\'"';
  var attribEnd = whitespace + '>';
  var CDATA = '[CDATA[';
  var DOCTYPE = 'DOCTYPE';
  var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
  var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/';
  var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };

  // turn all the string character sets into character class objects.
  whitespace = charClass(whitespace);
  number = charClass(number);
  letter = charClass(letter);

  // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
  // This implementation works on strings, a single character at a time
  // as such, it cannot ever support astral-plane characters (10000-EFFFF)
  // without a significant breaking change to either this  parser, or the
  // JavaScript language.  Implementation of an emoji-capable xml parser
  // is left as an exercise for the reader.
  var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;

  var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040\.\d-]/;

  var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
  var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040\.\d-]/;

  quote = charClass(quote);
  attribEnd = charClass(attribEnd);

  function charClass (str) {
    return str.split('').reduce(function (s, c) {
      s[c] = true;
      return s
    }, {})
  }

  function isRegExp (c) {
    return Object.prototype.toString.call(c) === '[object RegExp]'
  }

  function is (charclass, c) {
    return isRegExp(charclass) ? !!c.match(charclass) : charclass[c]
  }

  function not (charclass, c) {
    return !is(charclass, c)
  }

  var S = 0;
  sax.STATE = {
    BEGIN: S++, // leading byte order mark or whitespace
    BEGIN_WHITESPACE: S++, // leading whitespace
    TEXT: S++, // general stuff
    TEXT_ENTITY: S++, // &amp and such.
    OPEN_WAKA: S++, // <
    SGML_DECL: S++, // <!BLARG
    SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
    DOCTYPE: S++, // <!DOCTYPE
    DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
    DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
    DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
    COMMENT_STARTING: S++, // <!-
    COMMENT: S++, // <!--
    COMMENT_ENDING: S++, // <!-- blah -
    COMMENT_ENDED: S++, // <!-- blah --
    CDATA: S++, // <![CDATA[ something
    CDATA_ENDING: S++, // ]
    CDATA_ENDING_2: S++, // ]]
    PROC_INST: S++, // <?hi
    PROC_INST_BODY: S++, // <?hi there
    PROC_INST_ENDING: S++, // <?hi "there" ?
    OPEN_TAG: S++, // <strong
    OPEN_TAG_SLASH: S++, // <strong /
    ATTRIB: S++, // <a
    ATTRIB_NAME: S++, // <a foo
    ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
    ATTRIB_VALUE: S++, // <a foo=
    ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
    ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
    ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
    ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
    ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
    CLOSE_TAG: S++, // </a
    CLOSE_TAG_SAW_WHITE: S++, // </a   >
    SCRIPT: S++, // <script> ...
    SCRIPT_ENDING: S++ // <script> ... <
  };

  sax.XML_ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'"
  };

  sax.ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'",
    'AElig': 198,
    'Aacute': 193,
    'Acirc': 194,
    'Agrave': 192,
    'Aring': 197,
    'Atilde': 195,
    'Auml': 196,
    'Ccedil': 199,
    'ETH': 208,
    'Eacute': 201,
    'Ecirc': 202,
    'Egrave': 200,
    'Euml': 203,
    'Iacute': 205,
    'Icirc': 206,
    'Igrave': 204,
    'Iuml': 207,
    'Ntilde': 209,
    'Oacute': 211,
    'Ocirc': 212,
    'Ograve': 210,
    'Oslash': 216,
    'Otilde': 213,
    'Ouml': 214,
    'THORN': 222,
    'Uacute': 218,
    'Ucirc': 219,
    'Ugrave': 217,
    'Uuml': 220,
    'Yacute': 221,
    'aacute': 225,
    'acirc': 226,
    'aelig': 230,
    'agrave': 224,
    'aring': 229,
    'atilde': 227,
    'auml': 228,
    'ccedil': 231,
    'eacute': 233,
    'ecirc': 234,
    'egrave': 232,
    'eth': 240,
    'euml': 235,
    'iacute': 237,
    'icirc': 238,
    'igrave': 236,
    'iuml': 239,
    'ntilde': 241,
    'oacute': 243,
    'ocirc': 244,
    'ograve': 242,
    'oslash': 248,
    'otilde': 245,
    'ouml': 246,
    'szlig': 223,
    'thorn': 254,
    'uacute': 250,
    'ucirc': 251,
    'ugrave': 249,
    'uuml': 252,
    'yacute': 253,
    'yuml': 255,
    'copy': 169,
    'reg': 174,
    'nbsp': 160,
    'iexcl': 161,
    'cent': 162,
    'pound': 163,
    'curren': 164,
    'yen': 165,
    'brvbar': 166,
    'sect': 167,
    'uml': 168,
    'ordf': 170,
    'laquo': 171,
    'not': 172,
    'shy': 173,
    'macr': 175,
    'deg': 176,
    'plusmn': 177,
    'sup1': 185,
    'sup2': 178,
    'sup3': 179,
    'acute': 180,
    'micro': 181,
    'para': 182,
    'middot': 183,
    'cedil': 184,
    'ordm': 186,
    'raquo': 187,
    'frac14': 188,
    'frac12': 189,
    'frac34': 190,
    'iquest': 191,
    'times': 215,
    'divide': 247,
    'OElig': 338,
    'oelig': 339,
    'Scaron': 352,
    'scaron': 353,
    'Yuml': 376,
    'fnof': 402,
    'circ': 710,
    'tilde': 732,
    'Alpha': 913,
    'Beta': 914,
    'Gamma': 915,
    'Delta': 916,
    'Epsilon': 917,
    'Zeta': 918,
    'Eta': 919,
    'Theta': 920,
    'Iota': 921,
    'Kappa': 922,
    'Lambda': 923,
    'Mu': 924,
    'Nu': 925,
    'Xi': 926,
    'Omicron': 927,
    'Pi': 928,
    'Rho': 929,
    'Sigma': 931,
    'Tau': 932,
    'Upsilon': 933,
    'Phi': 934,
    'Chi': 935,
    'Psi': 936,
    'Omega': 937,
    'alpha': 945,
    'beta': 946,
    'gamma': 947,
    'delta': 948,
    'epsilon': 949,
    'zeta': 950,
    'eta': 951,
    'theta': 952,
    'iota': 953,
    'kappa': 954,
    'lambda': 955,
    'mu': 956,
    'nu': 957,
    'xi': 958,
    'omicron': 959,
    'pi': 960,
    'rho': 961,
    'sigmaf': 962,
    'sigma': 963,
    'tau': 964,
    'upsilon': 965,
    'phi': 966,
    'chi': 967,
    'psi': 968,
    'omega': 969,
    'thetasym': 977,
    'upsih': 978,
    'piv': 982,
    'ensp': 8194,
    'emsp': 8195,
    'thinsp': 8201,
    'zwnj': 8204,
    'zwj': 8205,
    'lrm': 8206,
    'rlm': 8207,
    'ndash': 8211,
    'mdash': 8212,
    'lsquo': 8216,
    'rsquo': 8217,
    'sbquo': 8218,
    'ldquo': 8220,
    'rdquo': 8221,
    'bdquo': 8222,
    'dagger': 8224,
    'Dagger': 8225,
    'bull': 8226,
    'hellip': 8230,
    'permil': 8240,
    'prime': 8242,
    'Prime': 8243,
    'lsaquo': 8249,
    'rsaquo': 8250,
    'oline': 8254,
    'frasl': 8260,
    'euro': 8364,
    'image': 8465,
    'weierp': 8472,
    'real': 8476,
    'trade': 8482,
    'alefsym': 8501,
    'larr': 8592,
    'uarr': 8593,
    'rarr': 8594,
    'darr': 8595,
    'harr': 8596,
    'crarr': 8629,
    'lArr': 8656,
    'uArr': 8657,
    'rArr': 8658,
    'dArr': 8659,
    'hArr': 8660,
    'forall': 8704,
    'part': 8706,
    'exist': 8707,
    'empty': 8709,
    'nabla': 8711,
    'isin': 8712,
    'notin': 8713,
    'ni': 8715,
    'prod': 8719,
    'sum': 8721,
    'minus': 8722,
    'lowast': 8727,
    'radic': 8730,
    'prop': 8733,
    'infin': 8734,
    'ang': 8736,
    'and': 8743,
    'or': 8744,
    'cap': 8745,
    'cup': 8746,
    'int': 8747,
    'there4': 8756,
    'sim': 8764,
    'cong': 8773,
    'asymp': 8776,
    'ne': 8800,
    'equiv': 8801,
    'le': 8804,
    'ge': 8805,
    'sub': 8834,
    'sup': 8835,
    'nsub': 8836,
    'sube': 8838,
    'supe': 8839,
    'oplus': 8853,
    'otimes': 8855,
    'perp': 8869,
    'sdot': 8901,
    'lceil': 8968,
    'rceil': 8969,
    'lfloor': 8970,
    'rfloor': 8971,
    'lang': 9001,
    'rang': 9002,
    'loz': 9674,
    'spades': 9824,
    'clubs': 9827,
    'hearts': 9829,
    'diams': 9830
  };

  Object.keys(sax.ENTITIES).forEach(function (key) {
    var e = sax.ENTITIES[key];
    var s = typeof e === 'number' ? String.fromCharCode(e) : e;
    sax.ENTITIES[key] = s;
  });

  for (var s in sax.STATE) {
    sax.STATE[sax.STATE[s]] = s;
  }

  // shorthand
  S = sax.STATE;

  function emit (parser, event, data) {
    parser[event] && parser[event](data);
  }

  function emitNode (parser, nodeType, data) {
    if (parser.textNode) closeText(parser);
    emit(parser, nodeType, data);
  }

  function closeText (parser) {
    parser.textNode = textopts(parser.opt, parser.textNode);
    if (parser.textNode) emit(parser, 'ontext', parser.textNode);
    parser.textNode = '';
  }

  function textopts (opt, text) {
    if (opt.trim) text = text.trim();
    if (opt.normalize) text = text.replace(/\s+/g, ' ');
    return text
  }

  function error (parser, er) {
    closeText(parser);
    if (parser.trackPosition) {
      er += '\nLine: ' + parser.line +
        '\nColumn: ' + parser.column +
        '\nChar: ' + parser.c;
    }
    er = new Error(er);
    parser.error = er;
    emit(parser, 'onerror', er);
    return parser
  }

  function end (parser) {
    if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag');
    if ((parser.state !== S.BEGIN) &&
      (parser.state !== S.BEGIN_WHITESPACE) &&
      (parser.state !== S.TEXT)) {
      error(parser, 'Unexpected end');
    }
    closeText(parser);
    parser.c = '';
    parser.closed = true;
    emit(parser, 'onend');
    SAXParser.call(parser, parser.strict, parser.opt);
    return parser
  }

  function strictFail (parser, message) {
    if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
      throw new Error('bad call to strictFail')
    }
    if (parser.strict) {
      error(parser, message);
    }
  }

  function newTag (parser) {
    if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]();
    var parent = parser.tags[parser.tags.length - 1] || parser;
    var tag = parser.tag = { name: parser.tagName, attributes: {} };

    // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
    if (parser.opt.xmlns) {
      tag.ns = parent.ns;
    }
    parser.attribList.length = 0;
    emitNode(parser, 'onopentagstart', tag);
  }

  function qname (name, attribute) {
    var i = name.indexOf(':');
    var qualName = i < 0 ? [ '', name ] : name.split(':');
    var prefix = qualName[0];
    var local = qualName[1];

    // <x "xmlns"="http://foo">
    if (attribute && name === 'xmlns') {
      prefix = 'xmlns';
      local = '';
    }

    return { prefix: prefix, local: local }
  }

  function attrib (parser) {
    if (!parser.strict) {
      parser.attribName = parser.attribName[parser.looseCase]();
    }

    if (parser.attribList.indexOf(parser.attribName) !== -1 ||
      parser.tag.attributes.hasOwnProperty(parser.attribName)) {
      parser.attribName = parser.attribValue = '';
      return
    }

    if (parser.opt.xmlns) {
      var qn = qname(parser.attribName, true);
      var prefix = qn.prefix;
      var local = qn.local;

      if (prefix === 'xmlns') {
        // namespace binding attribute. push the binding into scope
        if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
          strictFail(parser,
            'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue);
        } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
          strictFail(parser,
            'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue);
        } else {
          var tag = parser.tag;
          var parent = parser.tags[parser.tags.length - 1] || parser;
          if (tag.ns === parent.ns) {
            tag.ns = Object.create(parent.ns);
          }
          tag.ns[local] = parser.attribValue;
        }
      }

      // defer onattribute events until all attributes have been seen
      // so any new bindings can take effect. preserve attribute order
      // so deferred events can be emitted in document order
      parser.attribList.push([parser.attribName, parser.attribValue]);
    } else {
      // in non-xmlns mode, we can emit the event right away
      parser.tag.attributes[parser.attribName] = parser.attribValue;
      emitNode(parser, 'onattribute', {
        name: parser.attribName,
        value: parser.attribValue
      });
    }

    parser.attribName = parser.attribValue = '';
  }

  function openTag (parser, selfClosing) {
    if (parser.opt.xmlns) {
      // emit namespace binding events
      var tag = parser.tag;

      // add namespace info to tag
      var qn = qname(parser.tagName);
      tag.prefix = qn.prefix;
      tag.local = qn.local;
      tag.uri = tag.ns[qn.prefix] || '';

      if (tag.prefix && !tag.uri) {
        strictFail(parser, 'Unbound namespace prefix: ' +
          JSON.stringify(parser.tagName));
        tag.uri = qn.prefix;
      }

      var parent = parser.tags[parser.tags.length - 1] || parser;
      if (tag.ns && parent.ns !== tag.ns) {
        Object.keys(tag.ns).forEach(function (p) {
          emitNode(parser, 'onopennamespace', {
            prefix: p,
            uri: tag.ns[p]
          });
        });
      }

      // handle deferred onattribute events
      // Note: do not apply default ns to attributes:
      //   http://www.w3.org/TR/REC-xml-names/#defaulting
      for (var i = 0, l = parser.attribList.length; i < l; i++) {
        var nv = parser.attribList[i];
        var name = nv[0];
        var value = nv[1];
        var qualName = qname(name, true);
        var prefix = qualName.prefix;
        var local = qualName.local;
        var uri = prefix === '' ? '' : (tag.ns[prefix] || '');
        var a = {
          name: name,
          value: value,
          prefix: prefix,
          local: local,
          uri: uri
        };

        // if there's any attributes with an undefined namespace,
        // then fail on them now.
        if (prefix && prefix !== 'xmlns' && !uri) {
          strictFail(parser, 'Unbound namespace prefix: ' +
            JSON.stringify(prefix));
          a.uri = prefix;
        }
        parser.tag.attributes[name] = a;
        emitNode(parser, 'onattribute', a);
      }
      parser.attribList.length = 0;
    }

    parser.tag.isSelfClosing = !!selfClosing;

    // process the tag
    parser.sawRoot = true;
    parser.tags.push(parser.tag);
    emitNode(parser, 'onopentag', parser.tag);
    if (!selfClosing) {
      // special case for <script> in non-strict mode.
      if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
        parser.state = S.SCRIPT;
      } else {
        parser.state = S.TEXT;
      }
      parser.tag = null;
      parser.tagName = '';
    }
    parser.attribName = parser.attribValue = '';
    parser.attribList.length = 0;
  }

  function closeTag (parser) {
    if (!parser.tagName) {
      strictFail(parser, 'Weird empty close tag.');
      parser.textNode += '</>';
      parser.state = S.TEXT;
      return
    }

    if (parser.script) {
      if (parser.tagName !== 'script') {
        parser.script += '</' + parser.tagName + '>';
        parser.tagName = '';
        parser.state = S.SCRIPT;
        return
      }
      emitNode(parser, 'onscript', parser.script);
      parser.script = '';
    }

    // first make sure that the closing tag actually exists.
    // <a><b></c></b></a> will close everything, otherwise.
    var t = parser.tags.length;
    var tagName = parser.tagName;
    if (!parser.strict) {
      tagName = tagName[parser.looseCase]();
    }
    var closeTo = tagName;
    while (t--) {
      var close = parser.tags[t];
      if (close.name !== closeTo) {
        // fail the first time in strict mode
        strictFail(parser, 'Unexpected close tag');
      } else {
        break
      }
    }

    // didn't find it.  we already failed for strict, so just abort.
    if (t < 0) {
      strictFail(parser, 'Unmatched closing tag: ' + parser.tagName);
      parser.textNode += '</' + parser.tagName + '>';
      parser.state = S.TEXT;
      return
    }
    parser.tagName = tagName;
    var s = parser.tags.length;
    while (s-- > t) {
      var tag = parser.tag = parser.tags.pop();
      parser.tagName = parser.tag.name;
      emitNode(parser, 'onclosetag', parser.tagName);

      var x = {};
      for (var i in tag.ns) {
        x[i] = tag.ns[i];
      }

      var parent = parser.tags[parser.tags.length - 1] || parser;
      if (parser.opt.xmlns && tag.ns !== parent.ns) {
        // remove namespace bindings introduced by tag
        Object.keys(tag.ns).forEach(function (p) {
          var n = tag.ns[p];
          emitNode(parser, 'onclosenamespace', { prefix: p, uri: n });
        });
      }
    }
    if (t === 0) parser.closedRoot = true;
    parser.tagName = parser.attribValue = parser.attribName = '';
    parser.attribList.length = 0;
    parser.state = S.TEXT;
  }

  function parseEntity (parser) {
    var entity = parser.entity;
    var entityLC = entity.toLowerCase();
    var num;
    var numStr = '';

    if (parser.ENTITIES[entity]) {
      return parser.ENTITIES[entity]
    }
    if (parser.ENTITIES[entityLC]) {
      return parser.ENTITIES[entityLC]
    }
    entity = entityLC;
    if (entity.charAt(0) === '#') {
      if (entity.charAt(1) === 'x') {
        entity = entity.slice(2);
        num = parseInt(entity, 16);
        numStr = num.toString(16);
      } else {
        entity = entity.slice(1);
        num = parseInt(entity, 10);
        numStr = num.toString(10);
      }
    }
    entity = entity.replace(/^0+/, '');
    if (numStr.toLowerCase() !== entity) {
      strictFail(parser, 'Invalid character entity');
      return '&' + parser.entity + ';'
    }

    return String.fromCodePoint(num)
  }

  function beginWhiteSpace (parser, c) {
    if (c === '<') {
      parser.state = S.OPEN_WAKA;
      parser.startTagPosition = parser.position;
    } else if (not(whitespace, c)) {
      // have to process this as a text node.
      // weird, but happens.
      strictFail(parser, 'Non-whitespace before first tag.');
      parser.textNode = c;
      parser.state = S.TEXT;
    }
  }

  function charAt (chunk, i) {
    var result = '';
    if (i < chunk.length) {
      result = chunk.charAt(i);
    }
    return result
  }

  function write (chunk) {
    var parser = this;
    if (this.error) {
      throw this.error
    }
    if (parser.closed) {
      return error(parser,
        'Cannot write after close. Assign an onready handler.')
    }
    if (chunk === null) {
      return end(parser)
    }
    if (typeof chunk === 'object') {
      chunk = chunk.toString();
    }
    var i = 0;
    var c = '';
    while (true) {
      c = charAt(chunk, i++);
      parser.c = c;
      if (!c) {
        break
      }
      if (parser.trackPosition) {
        parser.position++;
        if (c === '\n') {
          parser.line++;
          parser.column = 0;
        } else {
          parser.column++;
        }
      }
      switch (parser.state) {
        case S.BEGIN:
          parser.state = S.BEGIN_WHITESPACE;
          if (c === '\uFEFF') {
            continue
          }
          beginWhiteSpace(parser, c);
          continue

        case S.BEGIN_WHITESPACE:
          beginWhiteSpace(parser, c);
          continue

        case S.TEXT:
          if (parser.sawRoot && !parser.closedRoot) {
            var starti = i - 1;
            while (c && c !== '<' && c !== '&') {
              c = charAt(chunk, i++);
              if (c && parser.trackPosition) {
                parser.position++;
                if (c === '\n') {
                  parser.line++;
                  parser.column = 0;
                } else {
                  parser.column++;
                }
              }
            }
            parser.textNode += chunk.substring(starti, i - 1);
          }
          if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
            parser.state = S.OPEN_WAKA;
            parser.startTagPosition = parser.position;
          } else {
            if (not(whitespace, c) && (!parser.sawRoot || parser.closedRoot)) {
              strictFail(parser, 'Text data outside of root node.');
            }
            if (c === '&') {
              parser.state = S.TEXT_ENTITY;
            } else {
              parser.textNode += c;
            }
          }
          continue

        case S.SCRIPT:
          // only non-strict
          if (c === '<') {
            parser.state = S.SCRIPT_ENDING;
          } else {
            parser.script += c;
          }
          continue

        case S.SCRIPT_ENDING:
          if (c === '/') {
            parser.state = S.CLOSE_TAG;
          } else {
            parser.script += '<' + c;
            parser.state = S.SCRIPT;
          }
          continue

        case S.OPEN_WAKA:
          // either a /, ?, !, or text is coming next.
          if (c === '!') {
            parser.state = S.SGML_DECL;
            parser.sgmlDecl = '';
          } else if (is(whitespace, c)) {
            // wait for it...
          } else if (is(nameStart, c)) {
            parser.state = S.OPEN_TAG;
            parser.tagName = c;
          } else if (c === '/') {
            parser.state = S.CLOSE_TAG;
            parser.tagName = '';
          } else if (c === '?') {
            parser.state = S.PROC_INST;
            parser.procInstName = parser.procInstBody = '';
          } else {
            strictFail(parser, 'Unencoded <');
            // if there was some whitespace, then add that in.
            if (parser.startTagPosition + 1 < parser.position) {
              var pad = parser.position - parser.startTagPosition;
              c = new Array(pad).join(' ') + c;
            }
            parser.textNode += '<' + c;
            parser.state = S.TEXT;
          }
          continue

        case S.SGML_DECL:
          if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
            emitNode(parser, 'onopencdata');
            parser.state = S.CDATA;
            parser.sgmlDecl = '';
            parser.cdata = '';
          } else if (parser.sgmlDecl + c === '--') {
            parser.state = S.COMMENT;
            parser.comment = '';
            parser.sgmlDecl = '';
          } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
            parser.state = S.DOCTYPE;
            if (parser.doctype || parser.sawRoot) {
              strictFail(parser,
                'Inappropriately located doctype declaration');
            }
            parser.doctype = '';
            parser.sgmlDecl = '';
          } else if (c === '>') {
            emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl);
            parser.sgmlDecl = '';
            parser.state = S.TEXT;
          } else if (is(quote, c)) {
            parser.state = S.SGML_DECL_QUOTED;
            parser.sgmlDecl += c;
          } else {
            parser.sgmlDecl += c;
          }
          continue

        case S.SGML_DECL_QUOTED:
          if (c === parser.q) {
            parser.state = S.SGML_DECL;
            parser.q = '';
          }
          parser.sgmlDecl += c;
          continue

        case S.DOCTYPE:
          if (c === '>') {
            parser.state = S.TEXT;
            emitNode(parser, 'ondoctype', parser.doctype);
            parser.doctype = true; // just remember that we saw it.
          } else {
            parser.doctype += c;
            if (c === '[') {
              parser.state = S.DOCTYPE_DTD;
            } else if (is(quote, c)) {
              parser.state = S.DOCTYPE_QUOTED;
              parser.q = c;
            }
          }
          continue

        case S.DOCTYPE_QUOTED:
          parser.doctype += c;
          if (c === parser.q) {
            parser.q = '';
            parser.state = S.DOCTYPE;
          }
          continue

        case S.DOCTYPE_DTD:
          parser.doctype += c;
          if (c === ']') {
            parser.state = S.DOCTYPE;
          } else if (is(quote, c)) {
            parser.state = S.DOCTYPE_DTD_QUOTED;
            parser.q = c;
          }
          continue

        case S.DOCTYPE_DTD_QUOTED:
          parser.doctype += c;
          if (c === parser.q) {
            parser.state = S.DOCTYPE_DTD;
            parser.q = '';
          }
          continue

        case S.COMMENT:
          if (c === '-') {
            parser.state = S.COMMENT_ENDING;
          } else {
            parser.comment += c;
          }
          continue

        case S.COMMENT_ENDING:
          if (c === '-') {
            parser.state = S.COMMENT_ENDED;
            parser.comment = textopts(parser.opt, parser.comment);
            if (parser.comment) {
              emitNode(parser, 'oncomment', parser.comment);
            }
            parser.comment = '';
          } else {
            parser.comment += '-' + c;
            parser.state = S.COMMENT;
          }
          continue

        case S.COMMENT_ENDED:
          if (c !== '>') {
            strictFail(parser, 'Malformed comment');
            // allow <!-- blah -- bloo --> in non-strict mode,
            // which is a comment of " blah -- bloo "
            parser.comment += '--' + c;
            parser.state = S.COMMENT;
          } else {
            parser.state = S.TEXT;
          }
          continue

        case S.CDATA:
          if (c === ']') {
            parser.state = S.CDATA_ENDING;
          } else {
            parser.cdata += c;
          }
          continue

        case S.CDATA_ENDING:
          if (c === ']') {
            parser.state = S.CDATA_ENDING_2;
          } else {
            parser.cdata += ']' + c;
            parser.state = S.CDATA;
          }
          continue

        case S.CDATA_ENDING_2:
          if (c === '>') {
            if (parser.cdata) {
              emitNode(parser, 'oncdata', parser.cdata);
            }
            emitNode(parser, 'onclosecdata');
            parser.cdata = '';
            parser.state = S.TEXT;
          } else if (c === ']') {
            parser.cdata += ']';
          } else {
            parser.cdata += ']]' + c;
            parser.state = S.CDATA;
          }
          continue

        case S.PROC_INST:
          if (c === '?') {
            parser.state = S.PROC_INST_ENDING;
          } else if (is(whitespace, c)) {
            parser.state = S.PROC_INST_BODY;
          } else {
            parser.procInstName += c;
          }
          continue

        case S.PROC_INST_BODY:
          if (!parser.procInstBody && is(whitespace, c)) {
            continue
          } else if (c === '?') {
            parser.state = S.PROC_INST_ENDING;
          } else {
            parser.procInstBody += c;
          }
          continue

        case S.PROC_INST_ENDING:
          if (c === '>') {
            emitNode(parser, 'onprocessinginstruction', {
              name: parser.procInstName,
              body: parser.procInstBody
            });
            parser.procInstName = parser.procInstBody = '';
            parser.state = S.TEXT;
          } else {
            parser.procInstBody += '?' + c;
            parser.state = S.PROC_INST_BODY;
          }
          continue

        case S.OPEN_TAG:
          if (is(nameBody, c)) {
            parser.tagName += c;
          } else {
            newTag(parser);
            if (c === '>') {
              openTag(parser);
            } else if (c === '/') {
              parser.state = S.OPEN_TAG_SLASH;
            } else {
              if (not(whitespace, c)) {
                strictFail(parser, 'Invalid character in tag name');
              }
              parser.state = S.ATTRIB;
            }
          }
          continue

        case S.OPEN_TAG_SLASH:
          if (c === '>') {
            openTag(parser, true);
            closeTag(parser);
          } else {
            strictFail(parser, 'Forward-slash in opening tag not followed by >');
            parser.state = S.ATTRIB;
          }
          continue

        case S.ATTRIB:
          // haven't read the attribute name yet.
          if (is(whitespace, c)) {
            continue
          } else if (c === '>') {
            openTag(parser);
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH;
          } else if (is(nameStart, c)) {
            parser.attribName = c;
            parser.attribValue = '';
            parser.state = S.ATTRIB_NAME;
          } else {
            strictFail(parser, 'Invalid attribute name');
          }
          continue

        case S.ATTRIB_NAME:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE;
          } else if (c === '>') {
            strictFail(parser, 'Attribute without value');
            parser.attribValue = parser.attribName;
            attrib(parser);
            openTag(parser);
          } else if (is(whitespace, c)) {
            parser.state = S.ATTRIB_NAME_SAW_WHITE;
          } else if (is(nameBody, c)) {
            parser.attribName += c;
          } else {
            strictFail(parser, 'Invalid attribute name');
          }
          continue

        case S.ATTRIB_NAME_SAW_WHITE:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE;
          } else if (is(whitespace, c)) {
            continue
          } else {
            strictFail(parser, 'Attribute without value');
            parser.tag.attributes[parser.attribName] = '';
            parser.attribValue = '';
            emitNode(parser, 'onattribute', {
              name: parser.attribName,
              value: ''
            });
            parser.attribName = '';
            if (c === '>') {
              openTag(parser);
            } else if (is(nameStart, c)) {
              parser.attribName = c;
              parser.state = S.ATTRIB_NAME;
            } else {
              strictFail(parser, 'Invalid attribute name');
              parser.state = S.ATTRIB;
            }
          }
          continue

        case S.ATTRIB_VALUE:
          if (is(whitespace, c)) {
            continue
          } else if (is(quote, c)) {
            parser.q = c;
            parser.state = S.ATTRIB_VALUE_QUOTED;
          } else {
            strictFail(parser, 'Unquoted attribute value');
            parser.state = S.ATTRIB_VALUE_UNQUOTED;
            parser.attribValue = c;
          }
          continue

        case S.ATTRIB_VALUE_QUOTED:
          if (c !== parser.q) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_Q;
            } else {
              parser.attribValue += c;
            }
            continue
          }
          attrib(parser);
          parser.q = '';
          parser.state = S.ATTRIB_VALUE_CLOSED;
          continue

        case S.ATTRIB_VALUE_CLOSED:
          if (is(whitespace, c)) {
            parser.state = S.ATTRIB;
          } else if (c === '>') {
            openTag(parser);
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH;
          } else if (is(nameStart, c)) {
            strictFail(parser, 'No whitespace between attributes');
            parser.attribName = c;
            parser.attribValue = '';
            parser.state = S.ATTRIB_NAME;
          } else {
            strictFail(parser, 'Invalid attribute name');
          }
          continue

        case S.ATTRIB_VALUE_UNQUOTED:
          if (not(attribEnd, c)) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_U;
            } else {
              parser.attribValue += c;
            }
            continue
          }
          attrib(parser);
          if (c === '>') {
            openTag(parser);
          } else {
            parser.state = S.ATTRIB;
          }
          continue

        case S.CLOSE_TAG:
          if (!parser.tagName) {
            if (is(whitespace, c)) {
              continue
            } else if (not(nameStart, c)) {
              if (parser.script) {
                parser.script += '</' + c;
                parser.state = S.SCRIPT;
              } else {
                strictFail(parser, 'Invalid tagname in closing tag.');
              }
            } else {
              parser.tagName = c;
            }
          } else if (c === '>') {
            closeTag(parser);
          } else if (is(nameBody, c)) {
            parser.tagName += c;
          } else if (parser.script) {
            parser.script += '</' + parser.tagName;
            parser.tagName = '';
            parser.state = S.SCRIPT;
          } else {
            if (not(whitespace, c)) {
              strictFail(parser, 'Invalid tagname in closing tag');
            }
            parser.state = S.CLOSE_TAG_SAW_WHITE;
          }
          continue

        case S.CLOSE_TAG_SAW_WHITE:
          if (is(whitespace, c)) {
            continue
          }
          if (c === '>') {
            closeTag(parser);
          } else {
            strictFail(parser, 'Invalid characters in closing tag');
          }
          continue

        case S.TEXT_ENTITY:
        case S.ATTRIB_VALUE_ENTITY_Q:
        case S.ATTRIB_VALUE_ENTITY_U:
          var returnState;
          var buffer$$1;
          switch (parser.state) {
            case S.TEXT_ENTITY:
              returnState = S.TEXT;
              buffer$$1 = 'textNode';
              break

            case S.ATTRIB_VALUE_ENTITY_Q:
              returnState = S.ATTRIB_VALUE_QUOTED;
              buffer$$1 = 'attribValue';
              break

            case S.ATTRIB_VALUE_ENTITY_U:
              returnState = S.ATTRIB_VALUE_UNQUOTED;
              buffer$$1 = 'attribValue';
              break
          }

          if (c === ';') {
            parser[buffer$$1] += parseEntity(parser);
            parser.entity = '';
            parser.state = returnState;
          } else if (is(parser.entity.length ? entityBody : entityStart, c)) {
            parser.entity += c;
          } else {
            strictFail(parser, 'Invalid character in entity name');
            parser[buffer$$1] += '&' + parser.entity + c;
            parser.entity = '';
            parser.state = returnState;
          }

          continue

        default:
          throw new Error(parser, 'Unknown state: ' + parser.state)
      }
    } // while

    if (parser.position >= parser.bufferCheckPosition) {
      checkBufferLength(parser);
    }
    return parser
  }

  /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
  if (!String.fromCodePoint) {
    (function () {
      var stringFromCharCode = String.fromCharCode;
      var floor = Math.floor;
      var fromCodePoint = function () {
        var MAX_SIZE = 0x4000;
        var codeUnits = [];
        var highSurrogate;
        var lowSurrogate;
        var index = -1;
        var length = arguments.length;
        if (!length) {
          return ''
        }
        var result = '';
        while (++index < length) {
          var codePoint = Number(arguments[index]);
          if (
            !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
            codePoint < 0 || // not a valid Unicode code point
            codePoint > 0x10FFFF || // not a valid Unicode code point
            floor(codePoint) !== codePoint // not an integer
          ) {
            throw RangeError('Invalid code point: ' + codePoint)
          }
          if (codePoint <= 0xFFFF) { // BMP code point
            codeUnits.push(codePoint);
          } else { // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000;
            highSurrogate = (codePoint >> 10) + 0xD800;
            lowSurrogate = (codePoint % 0x400) + 0xDC00;
            codeUnits.push(highSurrogate, lowSurrogate);
          }
          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
            result += stringFromCharCode.apply(null, codeUnits);
            codeUnits.length = 0;
          }
        }
        return result
      };
      if (Object.defineProperty) {
        Object.defineProperty(String, 'fromCodePoint', {
          value: fromCodePoint,
          configurable: true,
          writable: true
        });
      } else {
        String.fromCodePoint = fromCodePoint;
      }
    }());
  }
})(exports);
});

var bom = createCommonjsModule(function (module, exports) {
// Generated by CoffeeScript 1.10.0
(function() {
  exports.stripBOM = function(str) {
    if (str[0] === '\uFEFF') {
      return str.substring(1);
    } else {
      return str;
    }
  };

}).call(commonjsGlobal);
});

var bom_1 = bom.stripBOM;

var processors = createCommonjsModule(function (module, exports) {
// Generated by CoffeeScript 1.10.0
(function() {
  var prefixMatch;

  prefixMatch = new RegExp(/(?!xmlns)^.*:/);

  exports.normalize = function(str) {
    return str.toLowerCase();
  };

  exports.firstCharLowerCase = function(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  };

  exports.stripPrefix = function(str) {
    return str.replace(prefixMatch, '');
  };

  exports.parseNumbers = function(str) {
    if (!isNaN(str)) {
      str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str);
    }
    return str;
  };

  exports.parseBooleans = function(str) {
    if (/^(?:true|false)$/i.test(str)) {
      str = str.toLowerCase() === 'true';
    }
    return str;
  };

}).call(commonjsGlobal);
});

var processors_1 = processors.normalize;
var processors_2 = processors.firstCharLowerCase;
var processors_3 = processors.stripPrefix;
var processors_4 = processors.parseNumbers;
var processors_5 = processors.parseBooleans;

var xml2js = createCommonjsModule(function (module, exports) {
// Generated by CoffeeScript 1.10.0
(function() {
  var bom$$1, builder, escapeCDATA, events$$1, isEmpty, processName, processors$$1, requiresCDATA, sax$$1, setImmediate, wrapCDATA,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  sax$$1 = sax;

  events$$1 = events;

  builder = lib;

  bom$$1 = bom;

  processors$$1 = processors;

  setImmediate = timers.setImmediate;

  isEmpty = function(thing) {
    return typeof thing === "object" && (thing != null) && Object.keys(thing).length === 0;
  };

  processName = function(processors$$1, processedName) {
    var i, len, process;
    for (i = 0, len = processors$$1.length; i < len; i++) {
      process = processors$$1[i];
      processedName = process(processedName);
    }
    return processedName;
  };

  requiresCDATA = function(entry) {
    return entry.indexOf('&') >= 0 || entry.indexOf('>') >= 0 || entry.indexOf('<') >= 0;
  };

  wrapCDATA = function(entry) {
    return "<![CDATA[" + (escapeCDATA(entry)) + "]]>";
  };

  escapeCDATA = function(entry) {
    return entry.replace(']]>', ']]]]><![CDATA[>');
  };

  exports.processors = processors$$1;

  exports.defaults = {
    "0.1": {
      explicitCharkey: false,
      trim: true,
      normalize: true,
      normalizeTags: false,
      attrkey: "@",
      charkey: "#",
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: false,
      explicitRoot: false,
      validator: null,
      xmlns: false,
      explicitChildren: false,
      childkey: '@@',
      charsAsChildren: false,
      includeWhiteChars: false,
      async: false,
      strict: true,
      attrNameProcessors: null,
      attrValueProcessors: null,
      tagNameProcessors: null,
      valueProcessors: null,
      emptyTag: ''
    },
    "0.2": {
      explicitCharkey: false,
      trim: false,
      normalize: false,
      normalizeTags: false,
      attrkey: "$",
      charkey: "_",
      explicitArray: true,
      ignoreAttrs: false,
      mergeAttrs: false,
      explicitRoot: true,
      validator: null,
      xmlns: false,
      explicitChildren: false,
      preserveChildrenOrder: false,
      childkey: '$$',
      charsAsChildren: false,
      includeWhiteChars: false,
      async: false,
      strict: true,
      attrNameProcessors: null,
      attrValueProcessors: null,
      tagNameProcessors: null,
      valueProcessors: null,
      rootName: 'root',
      xmldec: {
        'version': '1.0',
        'encoding': 'UTF-8',
        'standalone': true
      },
      doctype: null,
      renderOpts: {
        'pretty': true,
        'indent': '  ',
        'newline': '\n'
      },
      headless: false,
      chunkSize: 10000,
      emptyTag: '',
      cdata: false
    }
  };

  exports.ValidationError = (function(superClass) {
    extend(ValidationError, superClass);

    function ValidationError(message) {
      this.message = message;
    }

    return ValidationError;

  })(Error);

  exports.Builder = (function() {
    function Builder(opts) {
      var key, ref, value;
      this.options = {};
      ref = exports.defaults["0.2"];
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        value = ref[key];
        this.options[key] = value;
      }
      for (key in opts) {
        if (!hasProp.call(opts, key)) continue;
        value = opts[key];
        this.options[key] = value;
      }
    }

    Builder.prototype.buildObject = function(rootObj) {
      var attrkey, charkey, render, rootElement, rootName;
      attrkey = this.options.attrkey;
      charkey = this.options.charkey;
      if ((Object.keys(rootObj).length === 1) && (this.options.rootName === exports.defaults['0.2'].rootName)) {
        rootName = Object.keys(rootObj)[0];
        rootObj = rootObj[rootName];
      } else {
        rootName = this.options.rootName;
      }
      render = (function(_this) {
        return function(element, obj) {
          var attr, child, entry, index, key, value;
          if (typeof obj !== 'object') {
            if (_this.options.cdata && requiresCDATA(obj)) {
              element.raw(wrapCDATA(obj));
            } else {
              element.txt(obj);
            }
          } else {
            for (key in obj) {
              if (!hasProp.call(obj, key)) continue;
              child = obj[key];
              if (key === attrkey) {
                if (typeof child === "object") {
                  for (attr in child) {
                    value = child[attr];
                    element = element.att(attr, value);
                  }
                }
              } else if (key === charkey) {
                if (_this.options.cdata && requiresCDATA(child)) {
                  element = element.raw(wrapCDATA(child));
                } else {
                  element = element.txt(child);
                }
              } else if (Array.isArray(child)) {
                for (index in child) {
                  if (!hasProp.call(child, index)) continue;
                  entry = child[index];
                  if (typeof entry === 'string') {
                    if (_this.options.cdata && requiresCDATA(entry)) {
                      element = element.ele(key).raw(wrapCDATA(entry)).up();
                    } else {
                      element = element.ele(key, entry).up();
                    }
                  } else {
                    element = render(element.ele(key), entry).up();
                  }
                }
              } else if (typeof child === "object") {
                element = render(element.ele(key), child).up();
              } else {
                if (typeof child === 'string' && _this.options.cdata && requiresCDATA(child)) {
                  element = element.ele(key).raw(wrapCDATA(child)).up();
                } else {
                  if (child == null) {
                    child = '';
                  }
                  element = element.ele(key, child.toString()).up();
                }
              }
            }
          }
          return element;
        };
      })(this);
      rootElement = builder.create(rootName, this.options.xmldec, this.options.doctype, {
        headless: this.options.headless,
        allowSurrogateChars: this.options.allowSurrogateChars
      });
      return render(rootElement, rootObj).end(this.options.renderOpts);
    };

    return Builder;

  })();

  exports.Parser = (function(superClass) {
    extend(Parser, superClass);

    function Parser(opts) {
      this.parseString = bind(this.parseString, this);
      this.reset = bind(this.reset, this);
      this.assignOrPush = bind(this.assignOrPush, this);
      this.processAsync = bind(this.processAsync, this);
      var key, ref, value;
      if (!(this instanceof exports.Parser)) {
        return new exports.Parser(opts);
      }
      this.options = {};
      ref = exports.defaults["0.2"];
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        value = ref[key];
        this.options[key] = value;
      }
      for (key in opts) {
        if (!hasProp.call(opts, key)) continue;
        value = opts[key];
        this.options[key] = value;
      }
      if (this.options.xmlns) {
        this.options.xmlnskey = this.options.attrkey + "ns";
      }
      if (this.options.normalizeTags) {
        if (!this.options.tagNameProcessors) {
          this.options.tagNameProcessors = [];
        }
        this.options.tagNameProcessors.unshift(processors$$1.normalize);
      }
      this.reset();
    }

    Parser.prototype.processAsync = function() {
      var chunk, err;
      try {
        if (this.remaining.length <= this.options.chunkSize) {
          chunk = this.remaining;
          this.remaining = '';
          this.saxParser = this.saxParser.write(chunk);
          return this.saxParser.close();
        } else {
          chunk = this.remaining.substr(0, this.options.chunkSize);
          this.remaining = this.remaining.substr(this.options.chunkSize, this.remaining.length);
          this.saxParser = this.saxParser.write(chunk);
          return setImmediate(this.processAsync);
        }
      } catch (error1) {
        err = error1;
        if (!this.saxParser.errThrown) {
          this.saxParser.errThrown = true;
          return this.emit(err);
        }
      }
    };

    Parser.prototype.assignOrPush = function(obj, key, newValue) {
      if (!(key in obj)) {
        if (!this.options.explicitArray) {
          return obj[key] = newValue;
        } else {
          return obj[key] = [newValue];
        }
      } else {
        if (!(obj[key] instanceof Array)) {
          obj[key] = [obj[key]];
        }
        return obj[key].push(newValue);
      }
    };

    Parser.prototype.reset = function() {
      var attrkey, charkey, ontext, stack;
      this.removeAllListeners();
      this.saxParser = sax$$1.parser(this.options.strict, {
        trim: false,
        normalize: false,
        xmlns: this.options.xmlns
      });
      this.saxParser.errThrown = false;
      this.saxParser.onerror = (function(_this) {
        return function(error) {
          _this.saxParser.resume();
          if (!_this.saxParser.errThrown) {
            _this.saxParser.errThrown = true;
            return _this.emit("error", error);
          }
        };
      })(this);
      this.saxParser.onend = (function(_this) {
        return function() {
          if (!_this.saxParser.ended) {
            _this.saxParser.ended = true;
            return _this.emit("end", _this.resultObject);
          }
        };
      })(this);
      this.saxParser.ended = false;
      this.EXPLICIT_CHARKEY = this.options.explicitCharkey;
      this.resultObject = null;
      stack = [];
      attrkey = this.options.attrkey;
      charkey = this.options.charkey;
      this.saxParser.onopentag = (function(_this) {
        return function(node) {
          var key, newValue, obj, processedKey, ref;
          obj = {};
          obj[charkey] = "";
          if (!_this.options.ignoreAttrs) {
            ref = node.attributes;
            for (key in ref) {
              if (!hasProp.call(ref, key)) continue;
              if (!(attrkey in obj) && !_this.options.mergeAttrs) {
                obj[attrkey] = {};
              }
              newValue = _this.options.attrValueProcessors ? processName(_this.options.attrValueProcessors, node.attributes[key]) : node.attributes[key];
              processedKey = _this.options.attrNameProcessors ? processName(_this.options.attrNameProcessors, key) : key;
              if (_this.options.mergeAttrs) {
                _this.assignOrPush(obj, processedKey, newValue);
              } else {
                obj[attrkey][processedKey] = newValue;
              }
            }
          }
          obj["#name"] = _this.options.tagNameProcessors ? processName(_this.options.tagNameProcessors, node.name) : node.name;
          if (_this.options.xmlns) {
            obj[_this.options.xmlnskey] = {
              uri: node.uri,
              local: node.local
            };
          }
          return stack.push(obj);
        };
      })(this);
      this.saxParser.onclosetag = (function(_this) {
        return function() {
          var cdata, emptyStr, err, error1, key, node, nodeName, obj, objClone, old, s, xpath;
          obj = stack.pop();
          nodeName = obj["#name"];
          if (!_this.options.explicitChildren || !_this.options.preserveChildrenOrder) {
            delete obj["#name"];
          }
          if (obj.cdata === true) {
            cdata = obj.cdata;
            delete obj.cdata;
          }
          s = stack[stack.length - 1];
          if (obj[charkey].match(/^\s*$/) && !cdata) {
            emptyStr = obj[charkey];
            delete obj[charkey];
          } else {
            if (_this.options.trim) {
              obj[charkey] = obj[charkey].trim();
            }
            if (_this.options.normalize) {
              obj[charkey] = obj[charkey].replace(/\s{2,}/g, " ").trim();
            }
            obj[charkey] = _this.options.valueProcessors ? processName(_this.options.valueProcessors, obj[charkey]) : obj[charkey];
            if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
              obj = obj[charkey];
            }
          }
          if (isEmpty(obj)) {
            obj = _this.options.emptyTag !== '' ? _this.options.emptyTag : emptyStr;
          }
          if (_this.options.validator != null) {
            xpath = "/" + ((function() {
              var i, len, results;
              results = [];
              for (i = 0, len = stack.length; i < len; i++) {
                node = stack[i];
                results.push(node["#name"]);
              }
              return results;
            })()).concat(nodeName).join("/");
            try {
              obj = _this.options.validator(xpath, s && s[nodeName], obj);
            } catch (error1) {
              err = error1;
              _this.emit("error", err);
            }
          }
          if (_this.options.explicitChildren && !_this.options.mergeAttrs && typeof obj === 'object') {
            if (!_this.options.preserveChildrenOrder) {
              node = {};
              if (_this.options.attrkey in obj) {
                node[_this.options.attrkey] = obj[_this.options.attrkey];
                delete obj[_this.options.attrkey];
              }
              if (!_this.options.charsAsChildren && _this.options.charkey in obj) {
                node[_this.options.charkey] = obj[_this.options.charkey];
                delete obj[_this.options.charkey];
              }
              if (Object.getOwnPropertyNames(obj).length > 0) {
                node[_this.options.childkey] = obj;
              }
              obj = node;
            } else if (s) {
              s[_this.options.childkey] = s[_this.options.childkey] || [];
              objClone = {};
              for (key in obj) {
                if (!hasProp.call(obj, key)) continue;
                objClone[key] = obj[key];
              }
              s[_this.options.childkey].push(objClone);
              delete obj["#name"];
              if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
                obj = obj[charkey];
              }
            }
          }
          if (stack.length > 0) {
            return _this.assignOrPush(s, nodeName, obj);
          } else {
            if (_this.options.explicitRoot) {
              old = obj;
              obj = {};
              obj[nodeName] = old;
            }
            _this.resultObject = obj;
            _this.saxParser.ended = true;
            return _this.emit("end", _this.resultObject);
          }
        };
      })(this);
      ontext = (function(_this) {
        return function(text) {
          var charChild, s;
          s = stack[stack.length - 1];
          if (s) {
            s[charkey] += text;
            if (_this.options.explicitChildren && _this.options.preserveChildrenOrder && _this.options.charsAsChildren && (_this.options.includeWhiteChars || text.replace(/\\n/g, '').trim() !== '')) {
              s[_this.options.childkey] = s[_this.options.childkey] || [];
              charChild = {
                '#name': '__text__'
              };
              charChild[charkey] = text;
              if (_this.options.normalize) {
                charChild[charkey] = charChild[charkey].replace(/\s{2,}/g, " ").trim();
              }
              s[_this.options.childkey].push(charChild);
            }
            return s;
          }
        };
      })(this);
      this.saxParser.ontext = ontext;
      return this.saxParser.oncdata = (function(_this) {
        return function(text) {
          var s;
          s = ontext(text);
          if (s) {
            return s.cdata = true;
          }
        };
      })(this);
    };

    Parser.prototype.parseString = function(str, cb) {
      var err;
      if ((cb != null) && typeof cb === "function") {
        this.on("end", function(result) {
          this.reset();
          return cb(null, result);
        });
        this.on("error", function(err) {
          this.reset();
          return cb(err);
        });
      }
      try {
        str = str.toString();
        if (str.trim() === '') {
          this.emit("end", null);
          return true;
        }
        str = bom$$1.stripBOM(str);
        if (this.options.async) {
          this.remaining = str;
          setImmediate(this.processAsync);
          return this.saxParser;
        }
        return this.saxParser.write(str).close();
      } catch (error1) {
        err = error1;
        if (!(this.saxParser.errThrown || this.saxParser.ended)) {
          this.emit('error', err);
          return this.saxParser.errThrown = true;
        } else if (this.saxParser.ended) {
          throw err;
        }
      }
    };

    return Parser;

  })(events$$1.EventEmitter);

  exports.parseString = function(str, a, b) {
    var cb, options, parser;
    if (b != null) {
      if (typeof b === 'function') {
        cb = b;
      }
      if (typeof a === 'object') {
        options = a;
      }
    } else {
      if (typeof a === 'function') {
        cb = a;
      }
      options = {};
    }
    parser = new exports.Parser(options);
    return parser.parseString(str, cb);
  };

}).call(commonjsGlobal);
});

var xml2js_1 = xml2js.processors;
var xml2js_2 = xml2js.defaults;
var xml2js_3 = xml2js.ValidationError;
var xml2js_4 = xml2js.Builder;
var xml2js_5 = xml2js.Parser;
var xml2js_6 = xml2js.parseString;

var util$3 = core.util;
var Shape$2 = core.Model.Shape;



/**
 * @api private
 */
var options = {  // options passed to xml2js parser
  explicitCharkey: false, // undocumented
  trim: false,            // trim the leading/trailing whitespace from text nodes
  normalize: false,       // trim interior whitespace inside text nodes
  explicitRoot: false,    // return the root node in the resulting object?
  emptyTag: null,         // the default value for empty nodes
  explicitArray: true,    // always put child nodes in an array
  ignoreAttrs: false,     // ignore attributes, only create text nodes
  mergeAttrs: false,      // merge attributes and child elements
  validator: null         // a callable validator
};

function NodeXmlParser() { }

NodeXmlParser.prototype.parse = function(xml, shape) {
  shape = shape || {};

  var result = null;
  var error = null;

  var parser = new xml2js.Parser(options);
  parser.parseString(xml, function (e, r) {
    error = e;
    result = r;
  });

  if (result) {
    var data = parseXml(result, shape);
    if (result.ResponseMetadata) {
      data.ResponseMetadata = parseXml(result.ResponseMetadata[0], {});
    }
    return data;
  } else if (error) {
    throw util$3.error(error, {code: 'XMLParserError', retryable: true});
  } else { // empty xml document
    return parseXml({}, shape);
  }
};

function parseXml(xml, shape) {
  switch (shape.type) {
    case 'structure': return parseStructure(xml, shape);
    case 'map': return parseMap(xml, shape);
    case 'list': return parseList(xml, shape);
    case undefined: case null: return parseUnknown(xml);
    default: return parseScalar(xml, shape);
  }
}

function parseStructure(xml, shape) {
  var data = {};
  if (xml === null) return data;

  util$3.each(shape.members, function(memberName, memberShape) {
    var xmlName = memberShape.name;
    if (Object.prototype.hasOwnProperty.call(xml, xmlName) && Array.isArray(xml[xmlName])) {
      var xmlChild = xml[xmlName];
      if (!memberShape.flattened) xmlChild = xmlChild[0];

      data[memberName] = parseXml(xmlChild, memberShape);
    } else if (memberShape.isXmlAttribute &&
               xml.$ && Object.prototype.hasOwnProperty.call(xml.$, xmlName)) {
      data[memberName] = parseScalar(xml.$[xmlName], memberShape);
    } else if (memberShape.type === 'list') {
      data[memberName] = memberShape.defaultValue;
    }
  });

  return data;
}

function parseMap(xml, shape) {
  var data = {};
  if (xml === null) return data;

  var xmlKey = shape.key.name || 'key';
  var xmlValue = shape.value.name || 'value';
  var iterable = shape.flattened ? xml : xml.entry;

  if (Array.isArray(iterable)) {
    util$3.arrayEach(iterable, function(child) {
      data[child[xmlKey][0]] = parseXml(child[xmlValue][0], shape.value);
    });
  }

  return data;
}

function parseList(xml, shape) {
  var data = [];
  var name = shape.member.name || 'member';
  if (shape.flattened) {
    util$3.arrayEach(xml, function(xmlChild) {
      data.push(parseXml(xmlChild, shape.member));
    });
  } else if (xml && Array.isArray(xml[name])) {
    util$3.arrayEach(xml[name], function(child) {
      data.push(parseXml(child, shape.member));
    });
  }

  return data;
}

function parseScalar(text, shape) {
  if (text && text.$ && text.$.encoding === 'base64') {
    shape = new Shape$2.create({type: text.$.encoding});
  }
  if (text && text._) text = text._;

  if (typeof shape.toType === 'function') {
    return shape.toType(text);
  } else {
    return text;
  }
}

function parseUnknown(xml) {
  if (xml === undefined || xml === null) return '';
  if (typeof xml === 'string') return xml;

  // parse a list
  if (Array.isArray(xml)) {
    var arr = [];
    for (i = 0; i < xml.length; i++) {
      arr.push(parseXml(xml[i], {}));
    }
    return arr;
  }

  // empty object
  var keys = Object.keys(xml), i;
  if (keys.length === 0 || keys === ['$']) {
    return {};
  }

  // object, parse as structure
  var data = {};
  for (i = 0; i < keys.length; i++) {
    var key = keys[i], value = xml[key];
    if (key === '$') continue;
    if (value.length > 1) { // this member is a list
      data[key] = parseList(value, {member: {}});
    } else { // this member is a single item
      data[key] = parseXml(value[0], {});
    }
  }
  return data;
}

var node_parser = NodeXmlParser;

var Stream = core.util.stream.Stream;
var TransformStream = core.util.stream.Transform;
var ReadableStream = core.util.stream.Readable;


/**
 * @api private
 */
core.NodeHttpClient = core.util.inherit({
  handleRequest: function handleRequest(httpRequest, httpOptions, callback, errCallback) {
    var self = this;
    var endpoint = httpRequest.endpoint;
    var pathPrefix = '';
    if (!httpOptions) httpOptions = {};
    if (httpOptions.proxy) {
      pathPrefix = endpoint.protocol + '//' + endpoint.hostname;
      if (endpoint.port !== 80 && endpoint.port !== 443) {
        pathPrefix += ':' + endpoint.port;
      }
      endpoint = new core.Endpoint(httpOptions.proxy);
    }

    var useSSL = endpoint.protocol === 'https:';
    var http$$1 = useSSL ? https : http;
    var options = {
      host: endpoint.hostname,
      port: endpoint.port,
      method: httpRequest.method,
      headers: httpRequest.headers,
      path: pathPrefix + httpRequest.path
    };

    if (useSSL && !httpOptions.agent) {
      options.agent = this.sslAgent();
    }

    core.util.update(options, httpOptions);
    delete options.proxy; // proxy isn't an HTTP option
    delete options.timeout; // timeout isn't an HTTP option

    var stream$$1 = http$$1.request(options, function (httpResp) {
      if (stream$$1.didCallback) return;

      callback(httpResp);
      httpResp.emit(
        'headers',
        httpResp.statusCode,
        httpResp.headers,
        httpResp.statusMessage
      );
    });
    httpRequest.stream = stream$$1; // attach stream to httpRequest
    stream$$1.didCallback = false;

    // connection timeout support
    if (httpOptions.connectTimeout) {
      stream$$1.on('socket', function(socket) {
        if (socket.connecting) {
          var timeoutId = setTimeout(function connectTimeout() {
            if (stream$$1.didCallback) return; stream$$1.didCallback = true;

            stream$$1.abort();
            errCallback(core.util.error(
              new Error('Socket timed out without establishing a connection'),
              {code: 'TimeoutError'}
            ));
          }, httpOptions.connectTimeout);
          socket.on('connect', (function(tId) {
            return function () {
              clearTimeout(tId);
            };
          })(timeoutId));
        }
      });
    }

    // timeout support
    stream$$1.setTimeout(httpOptions.timeout || 0, function() {
      if (stream$$1.didCallback) return; stream$$1.didCallback = true;

      var msg = 'Connection timed out after ' + httpOptions.timeout + 'ms';
      errCallback(core.util.error(new Error(msg), {code: 'TimeoutError'}));
      stream$$1.abort();
    });

    stream$$1.on('error', function() {
      if (stream$$1.didCallback) return; stream$$1.didCallback = true;
      errCallback.apply(stream$$1, arguments);
    });

    var expect = httpRequest.headers.Expect || httpRequest.headers.expect;
    if (expect === '100-continue') {
      stream$$1.on('continue', function() {
        self.writeBody(stream$$1, httpRequest);
      });
    } else {
      this.writeBody(stream$$1, httpRequest);
    }

    return stream$$1;
  },

  writeBody: function writeBody(stream$$1, httpRequest) {
    var body = httpRequest.body;
    var totalBytes = parseInt(httpRequest.headers['Content-Length'], 10);

    if (body instanceof Stream) {
      // For progress support of streaming content -
      // pipe the data through a transform stream to emit 'sendProgress' events
      var progressStream = this.progressStream(stream$$1, totalBytes);
      if (progressStream) {
        body.pipe(progressStream).pipe(stream$$1);
      } else {
        body.pipe(stream$$1);
      }
    } else if (body) {
      // The provided body is a buffer/string and is already fully available in memory -
      // For performance it's best to send it as a whole by calling stream.end(body),
      // Callers expect a 'sendProgress' event which is best emitted once
      // the http request stream has been fully written and all data flushed.
      // The use of totalBytes is important over body.length for strings where
      // length is char length and not byte length.
      stream$$1.once('finish', function() {
        stream$$1.emit('sendProgress', {
          loaded: totalBytes,
          total: totalBytes
        });
      });
      stream$$1.end(body);
    } else {
      // no request body
      stream$$1.end();
    }
  },

  sslAgent: function sslAgent() {
    var https$$1 = https;

    if (!core.NodeHttpClient.sslAgent) {
      core.NodeHttpClient.sslAgent = new https$$1.Agent({rejectUnauthorized: true});
      core.NodeHttpClient.sslAgent.setMaxListeners(0);

      // delegate maxSockets to globalAgent, set a default limit of 50 if current value is Infinity.
      // Users can bypass this default by supplying their own Agent as part of SDK configuration.
      Object.defineProperty(core.NodeHttpClient.sslAgent, 'maxSockets', {
        enumerable: true,
        get: function() {
          var defaultMaxSockets = 50;
          var globalAgent = https$$1.globalAgent;
          if (globalAgent && globalAgent.maxSockets !== Infinity && typeof globalAgent.maxSockets === 'number') {
            return globalAgent.maxSockets;
          }
          return defaultMaxSockets;
        }
      });
    }
    return core.NodeHttpClient.sslAgent;
  },

  progressStream: function progressStream(stream$$1, totalBytes) {
    if (typeof TransformStream === 'undefined') {
      // for node 0.8 there is no streaming progress
      return;
    }
    var loadedBytes = 0;
    var reporter = new TransformStream();
    reporter._transform = function(chunk, encoding, callback) {
      if (chunk) {
        loadedBytes += chunk.length;
        stream$$1.emit('sendProgress', {
          loaded: loadedBytes,
          total: totalBytes
        });
      }
      callback(null, chunk);
    };
    return reporter;
  },

  emitter: null
});

/**
 * @!ignore
 */

/**
 * @api private
 */
core.HttpClient.prototype = core.NodeHttpClient.prototype;

/**
 * @api private
 */
core.HttpClient.streamsApiVersion = ReadableStream ? 2 : 1;

var inherit$12 = core.util.inherit;

/**
 * Represents a metadata service available on EC2 instances. Using the
 * {request} method, you can receieve metadata about any available resource
 * on the metadata service.
 *
 * @!attribute [r] httpOptions
 *   @return [map] a map of options to pass to the underlying HTTP request:
 *
 *     * **timeout** (Number) &mdash; a timeout value in milliseconds to wait
 *       before aborting the connection. Set to 0 for no timeout.
 *
 * @!macro nobrowser
 */
core.MetadataService = inherit$12({
  /**
   * @return [String] the hostname of the instance metadata service
   */
  host: '169.254.169.254',

  /**
   * @!ignore
   */

  /**
   * Default HTTP options. By default, the metadata service is set to not
   * timeout on long requests. This means that on non-EC2 machines, this
   * request will never return. If you are calling this operation from an
   * environment that may not always run on EC2, set a `timeout` value so
   * the SDK will abort the request after a given number of milliseconds.
   */
  httpOptions: { timeout: 0 },

  /**
   * Creates a new MetadataService object with a given set of options.
   *
   * @option options host [String] the hostname of the instance metadata
   *   service
   * @option options httpOptions [map] a map of options to pass to the
   *   underlying HTTP request:
   *
   *   * **timeout** (Number) &mdash; a timeout value in milliseconds to wait
   *     before aborting the connection. Set to 0 for no timeout.
   * @option options maxRetries [Integer] the maximum number of retries to
   *   perform for timeout errors
   * @option options retryDelayOptions [map] A set of options to configure the
   *   retry delay on retryable errors. See AWS.Config for details.
   */
  constructor: function MetadataService(options) {
    core.util.update(this, options);
  },

  /**
   * Sends a request to the instance metadata service for a given resource.
   *
   * @param path [String] the path of the resource to get
   * @callback callback function(err, data)
   *   Called when a response is available from the service.
   *   @param err [Error, null] if an error occurred, this value will be set
   *   @param data [String, null] if the request was successful, the body of
   *     the response
   */
  request: function request(path$$1, callback) {
    path$$1 = path$$1 || '/';
    var httpRequest = new core.HttpRequest('http://' + this.host + path$$1);
    httpRequest.method = 'GET';
    core.util.handleRequestWithRetries(httpRequest, this, callback);
  },

  /**
  * @api private
  */
  loadCredentialsCallbacks: [],

  /**
   * Loads a set of credentials stored in the instance metadata service
   *
   * @api private
   * @callback callback function(err, credentials)
   *   Called when credentials are loaded from the resource
   *   @param err [Error] if an error occurred, this value will be set
   *   @param credentials [Object] the raw JSON object containing all
   *     metadata from the credentials resource
   */
  loadCredentials: function loadCredentials(callback) {
    var self = this;
    var basePath = '/latest/meta-data/iam/security-credentials/';
    self.loadCredentialsCallbacks.push(callback);
    if (self.loadCredentialsCallbacks.length > 1) { return; }

    function callbacks(err, creds) {
      var cb;
      while ((cb = self.loadCredentialsCallbacks.shift()) !== undefined) {
        cb(err, creds);
      }
    }

    self.request(basePath, function (err, roleName) {
      if (err) callbacks(err);
      else {
        roleName = roleName.split('\n')[0]; // grab first (and only) role
        self.request(basePath + roleName, function (credErr, credData) {
          if (credErr) callbacks(credErr);
          else {
            try {
              var credentials = JSON.parse(credData);
              callbacks(null, credentials);
            } catch (parseError) {
              callbacks(parseError);
            }
          }
        });
      }
    });
  }
});

/**
 * Represents credentials received from the metadata service on an EC2 instance.
 *
 * By default, this class will connect to the metadata service using
 * {AWS.MetadataService} and attempt to load any available credentials. If it
 * can connect, and credentials are available, these will be used with zero
 * configuration.
 *
 * This credentials class will by default timeout after 1 second of inactivity
 * and retry 3 times.
 * If your requests to the EC2 metadata service are timing out, you can increase
 * these values by configuring them directly:
 *
 * ```javascript
 * AWS.config.credentials = new AWS.EC2MetadataCredentials({
 *   httpOptions: { timeout: 5000 }, // 5 second timeout
 *   maxRetries: 10, // retry 10 times
 *   retryDelayOptions: { base: 200 } // see AWS.Config for information
 * });
 * ```
 *
 * @see AWS.Config.retryDelayOptions
 *
 * @!macro nobrowser
 */
core.EC2MetadataCredentials = core.util.inherit(core.Credentials, {
  constructor: function EC2MetadataCredentials(options) {
    core.Credentials.call(this);

    options = options ? core.util.copy(options) : {};
    options = core.util.merge(
      {maxRetries: this.defaultMaxRetries}, options);
    if (!options.httpOptions) options.httpOptions = {};
    options.httpOptions = core.util.merge(
      {timeout: this.defaultTimeout}, options.httpOptions);

    this.metadataService = new core.MetadataService(options);
    this.metadata = {};
  },

  /**
   * @api private
   */
  defaultTimeout: 1000,

  /**
   * @api private
   */
  defaultMaxRetries: 3,

  /**
   * Loads the credentials from the instance metadata service
   *
   * @callback callback function(err)
   *   Called when the instance metadata service responds (or fails). When
   *   this callback is called with no error, it means that the credentials
   *   information has been loaded into the object (as the `accessKeyId`,
   *   `secretAccessKey`, and `sessionToken` properties).
   *   @param err [Error] if an error occurred, this value will be filled
   * @see get
   */
  refresh: function refresh(callback) {
    var self = this;
    if (!callback) callback = function(err) { if (err) throw err; };

    self.metadataService.loadCredentials(function (err, creds) {
      if (!err) {
        self.expired = false;
        self.metadata = creds;
        self.accessKeyId = creds.AccessKeyId;
        self.secretAccessKey = creds.SecretAccessKey;
        self.sessionToken = creds.Token;
        self.expireTime = new Date(creds.Expiration);
      }
      callback(err);
    });
  }
});

var ENV_RELATIVE_URI = 'AWS_CONTAINER_CREDENTIALS_RELATIVE_URI';
var ENV_FULL_URI = 'AWS_CONTAINER_CREDENTIALS_FULL_URI';
var ENV_AUTH_TOKEN = 'AWS_CONTAINER_AUTHORIZATION_TOKEN';
var FULL_URI_UNRESTRICTED_PROTOCOLS = ['https:'];
var FULL_URI_ALLOWED_PROTOCOLS = ['http:', 'https:'];
var FULL_URI_ALLOWED_HOSTNAMES = ['localhost', '127.0.0.1'];
var RELATIVE_URI_HOST = '169.254.170.2';

/**
 * Represents credentials received from specified URI.
 *
 * This class will request refreshable credentials from the relative URI
 * specified by the AWS_REMOTE_CREDENTIALS_RELATIVE_URI or the
 * AWS_REMOTE_CREDENTIALS_FULL_URI environment variable. If valid credentials
 * are returned in the response, these will be used with zero configuration.
 *
 * This credentials class will by default timeout after 1 second of inactivity
 * and retry 3 times.
 * If your requests to the relative URI are timing out, you can increase
 * the value by configuring them directly:
 *
 * ```javascript
 * AWS.config.credentials = new AWS.RemoteCredentials({
 *   httpOptions: { timeout: 5000 }, // 5 second timeout
 *   maxRetries: 10, // retry 10 times
 *   retryDelayOptions: { base: 200 } // see AWS.Config for information
 * });
 * ```
 *
 * @see AWS.Config.retryDelayOptions
 *
 * @!macro nobrowser
 */
core.RemoteCredentials = core.util.inherit(core.Credentials, {
  constructor: function RemoteCredentials(options) {
    core.Credentials.call(this);
    options = options ? core.util.copy(options) : {};
    if (!options.httpOptions) options.httpOptions = {};
    options.httpOptions = core.util.merge(
      this.httpOptions, options.httpOptions);
    core.util.update(this, options);
  },

  /**
   * @api private
   */
  httpOptions: { timeout: 1000 },

  /**
   * @api private
   */
  maxRetries: 3,

  /**
   * @api private
   */
  isConfiguredForEcsCredentials: function isConfiguredForEcsCredentials() {
    return Boolean(
        process &&
        process.env &&
        (process.env[ENV_RELATIVE_URI] || process.env[ENV_FULL_URI])
    );
  },

  /**
   * @api private
   */
  getECSFullUri: function getECSFullUri() {
    if (process && process.env) {
      var relative = process.env[ENV_RELATIVE_URI],
          full = process.env[ENV_FULL_URI];
      if (relative) {
        return 'http://' + RELATIVE_URI_HOST + relative;
      } else if (full) {
        var parsed = core.util.urlParse(full);
        if (FULL_URI_ALLOWED_PROTOCOLS.indexOf(parsed.protocol) < 0) {
          throw core.util.error(
            new Error('Unsupported protocol:  AWS.RemoteCredentials supports '
              + FULL_URI_ALLOWED_PROTOCOLS.join(',') + ' only; '
              + parsed.protocol + ' requested.'),
            { code: 'ECSCredentialsProviderFailure' }
          );
        }

        if (FULL_URI_UNRESTRICTED_PROTOCOLS.indexOf(parsed.protocol) < 0 &&
            FULL_URI_ALLOWED_HOSTNAMES.indexOf(parsed.hostname) < 0) {
          throw core.util.error(
            new Error('Unsupported hostname: AWS.RemoteCredentials only supports '
              + FULL_URI_ALLOWED_HOSTNAMES.join(',') + ' for ' + parsed.protocol + '; '
              + parsed.protocol + '//' + parsed.hostname + ' requested.'),
            { code: 'ECSCredentialsProviderFailure' }
          );
        }

        return full;
      }
    }
  },

  /**
   * @api private
   */
  getECSAuthToken: function getECSAuthToken() {
    if (process && process.env && process.env[ENV_FULL_URI]) {
      return process.env[ENV_AUTH_TOKEN];
    }
  },

  /**
   * @api private
   */
  credsFormatIsValid: function credsFormatIsValid(credData) {
    return (!!credData.accessKeyId && !!credData.secretAccessKey &&
      !!credData.sessionToken && !!credData.expireTime);
  },

  /**
   * @api private
   */
  formatCreds: function formatCreds(credData) {
    if (!!credData.credentials) {
      credData = credData.credentials;
    }

    return {
      expired: false,
      accessKeyId: credData.accessKeyId || credData.AccessKeyId,
      secretAccessKey: credData.secretAccessKey || credData.SecretAccessKey,
      sessionToken: credData.sessionToken || credData.Token,
      expireTime: new Date(credData.expiration || credData.Expiration)
    };
  },

  /**
   * @api private
   */
  request: function request(url$$1, callback) {
    var httpRequest = new core.HttpRequest(url$$1);
    httpRequest.method = 'GET';
    httpRequest.headers.Accept = 'application/json';
    var token = this.getECSAuthToken();
    if (token) {
      httpRequest.headers.Authorization = token;
    }
    core.util.handleRequestWithRetries(httpRequest, this, callback);
  },

  /**
   * @api private
   */
  refreshQueue: [],

  /**
   * Loads the credentials from the relative URI specified by container
   *
   * @callback callback function(err)
   *   Called when the request to the relative URI responds (or fails). When
   *   this callback is called with no error, it means that the credentials
   *   information has been loaded into the object (as the `accessKeyId`,
   *   `secretAccessKey`, `sessionToken`, and `expireTime` properties).
   *   @param err [Error] if an error occurred, this value will be filled
   * @see get
   */
  refresh: function refresh(callback) {
    var self = this;
    var refreshQueue = self.refreshQueue;
    if (!callback) callback = function(err) { if (err) throw err; };
    refreshQueue.push({
      provider: self,
      errCallback: callback
    });
    if (refreshQueue.length > 1) { return; }

    function callbacks(err, creds) {
      var call, cb;
      while ((call = refreshQueue.shift()) !== undefined) {
        cb = call.errCallback;
        if (!err) core.util.update(call.provider, creds);
        cb(err);
      }
    }

    if (process === undefined) {
      callbacks(core.util.error(
        new Error('No process info available'),
        { code: 'ECSCredentialsProviderFailure' }
      ));
      return;
    }
    var fullUri = this.getECSFullUri();
    if (fullUri === undefined) {
      callbacks(core.util.error(
        new Error('Variable ' + ENV_RELATIVE_URI + ' or ' + ENV_FULL_URI +
          ' must be set to use AWS.RemoteCredentials.'),
        { code: 'ECSCredentialsProviderFailure' }
      ));
      return;
    }

    this.request(fullUri, function(err, data) {
      if (!err) {
        try {
          data = JSON.parse(data);
          var creds = self.formatCreds(data);
          if (!self.credsFormatIsValid(creds)) {
            throw core.util.error(
              new Error('Response data is not in valid format'),
              { code: 'ECSCredentialsProviderFailure' }
            );
          }
        } catch (dataError) {
          err = dataError;
        }
      }
      callbacks(err, creds);
    });
  }
});

/**
 * Represents credentials received from relative URI specified in the ECS container.
 *
 * This class will request refreshable credentials from the relative URI
 * specified by the AWS_CONTAINER_CREDENTIALS_RELATIVE_URI or the
 * AWS_CONTAINER_CREDENTIALS_FULL_URI environment variable. If valid credentials
 * are returned in the response, these will be used with zero configuration.
 *
 * This credentials class will by default timeout after 1 second of inactivity
 * and retry 3 times.
 * If your requests to the relative URI are timing out, you can increase
 * the value by configuring them directly:
 *
 * ```javascript
 * AWS.config.credentials = new AWS.ECSCredentials({
 *   httpOptions: { timeout: 5000 }, // 5 second timeout
 *   maxRetries: 10, // retry 10 times
 *   retryDelayOptions: { base: 200 } // see AWS.Config for information
 * });
 * ```
 *
 * @see AWS.Config.retryDelayOptions
 *
 * @!macro nobrowser
 */
core.ECSCredentials = core.RemoteCredentials;

/**
 * Represents credentials from the environment.
 *
 * By default, this class will look for the matching environment variables
 * prefixed by a given {envPrefix}. The un-prefixed environment variable names
 * for each credential value is listed below:
 *
 * ```javascript
 * accessKeyId: ACCESS_KEY_ID
 * secretAccessKey: SECRET_ACCESS_KEY
 * sessionToken: SESSION_TOKEN
 * ```
 *
 * With the default prefix of 'AWS', the environment variables would be:
 *
 *     AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN
 *
 * @!attribute envPrefix
 *   @readonly
 *   @return [String] the prefix for the environment variable names excluding
 *     the separating underscore ('_').
 */
core.EnvironmentCredentials = core.util.inherit(core.Credentials, {

  /**
   * Creates a new EnvironmentCredentials class with a given variable
   * prefix {envPrefix}. For example, to load credentials using the 'AWS'
   * prefix:
   *
   * ```javascript
   * var creds = new AWS.EnvironmentCredentials('AWS');
   * creds.accessKeyId == 'AKID' // from AWS_ACCESS_KEY_ID env var
   * ```
   *
   * @param envPrefix [String] the prefix to use (e.g., 'AWS') for environment
   *   variables. Do not include the separating underscore.
   */
  constructor: function EnvironmentCredentials(envPrefix) {
    core.Credentials.call(this);
    this.envPrefix = envPrefix;
    this.get(function() {});
  },

  /**
   * Loads credentials from the environment using the prefixed
   * environment variables.
   *
   * @callback callback function(err)
   *   Called after the (prefixed) ACCESS_KEY_ID, SECRET_ACCESS_KEY, and
   *   SESSION_TOKEN environment variables are read. When this callback is
   *   called with no error, it means that the credentials information has
   *   been loaded into the object (as the `accessKeyId`, `secretAccessKey`,
   *   and `sessionToken` properties).
   *   @param err [Error] if an error occurred, this value will be filled
   * @see get
   */
  refresh: function refresh(callback) {
    if (!callback) callback = function(err) { if (err) throw err; };

    if (!process || !process.env) {
      callback(core.util.error(
        new Error('No process info or environment variables available'),
        { code: 'EnvironmentCredentialsProviderFailure' }
      ));
      return;
    }

    var keys = ['ACCESS_KEY_ID', 'SECRET_ACCESS_KEY', 'SESSION_TOKEN'];
    var values = [];

    for (var i = 0; i < keys.length; i++) {
      var prefix = '';
      if (this.envPrefix) prefix = this.envPrefix + '_';
      values[i] = process.env[prefix + keys[i]];
      if (!values[i] && keys[i] !== 'SESSION_TOKEN') {
        callback(core.util.error(
          new Error('Variable ' + prefix + keys[i] + ' not set.'),
        { code: 'EnvironmentCredentialsProviderFailure' }
        ));
        return;
      }
    }

    this.expired = false;
    core.Credentials.apply(this, values);
    callback();
  }

});

/**
 * Represents credentials from a JSON file on disk.
 * If the credentials expire, the SDK can {refresh} the credentials
 * from the file.
 *
 * The format of the file should be similar to the options passed to
 * {AWS.Config}:
 *
 * ```javascript
 * {accessKeyId: 'akid', secretAccessKey: 'secret', sessionToken: 'optional'}
 * ```
 *
 * @example Loading credentials from disk
 *   var creds = new AWS.FileSystemCredentials('./configuration.json');
 *   creds.accessKeyId == 'AKID'
 *
 * @!attribute filename
 *   @readonly
 *   @return [String] the path to the JSON file on disk containing the
 *     credentials.
 * @!macro nobrowser
 */
core.FileSystemCredentials = core.util.inherit(core.Credentials, {

  /**
   * @overload AWS.FileSystemCredentials(filename)
   *   Creates a new FileSystemCredentials object from a filename
   *
   *   @param filename [String] the path on disk to the JSON file to load.
   */
  constructor: function FileSystemCredentials(filename) {
    core.Credentials.call(this);
    this.filename = filename;
    this.get(function() {});
  },

  /**
   * Loads the credentials from the {filename} on disk.
   *
   * @callback callback function(err)
   *   Called after the JSON file on disk is read and parsed. When this callback
   *   is called with no error, it means that the credentials information
   *   has been loaded into the object (as the `accessKeyId`, `secretAccessKey`,
   *   and `sessionToken` properties).
   *   @param err [Error] if an error occurred, this value will be filled
   * @see get
   */
  refresh: function refresh(callback) {
    if (!callback) callback = function(err) { if (err) throw err; };
    try {
      var creds = JSON.parse(core.util.readFileSync(this.filename));
      core.Credentials.call(this, creds);
      if (!this.accessKeyId || !this.secretAccessKey) {
        throw core.util.error(
          new Error('Credentials not set in ' + this.filename),
        { code: 'FileSystemCredentialsProviderFailure' }
        );
      }
      this.expired = false;
      callback();
    } catch (err) {
      callback(err);
    }
  }

});

/**
 * @api private
 */
var shared_ini = core.util.inherit({
  constructor: function SharedIniFile(options) {
    options = options || {};

    this.isConfig = options.isConfig === true;
    this.filename = options.filename || this.getDefaultFilepath();
  },

  ensureFileLoaded: function loadFile() {
    if (!this.parsedContents) {
      this.parsedContents = core.util.ini.parse(
        core.util.readFileSync(this.filename)
      );
    }
  },

  getDefaultFilepath: function getDefaultFilepath() {
    return path__default.join(
      this.getHomeDir(),
      '.aws',
      this.isConfig ? 'config' : 'credentials'
    );
  },

  getHomeDir: function getHomeDir() {
    var env = process.env;
    var home = env.HOME ||
      env.USERPROFILE ||
      (env.HOMEPATH ? ((env.HOMEDRIVE || 'C:/') + env.HOMEPATH) : null);

    if (home) {
      return home;
    }

    if (typeof os.homedir === 'function') {
      return os.homedir();
    }

    throw core.util.error(
      new Error('Cannot load credentials, HOME path not set')
    );
  },

  getProfile: function loadProfile(profile) {
    this.ensureFileLoaded();

    var profileIndex = profile !== core.util.defaultProfile && this.isConfig ?
      'profile ' + profile : profile;

    return this.parsedContents[profileIndex];
  },

  getProfiles: function loadProfileNames() {
    this.ensureFileLoaded();
    var isConfig = this.isConfig;

    return Object.keys(this.parsedContents).map(function(profileName) {
      if (isConfig) {
        return profileName.replace(/^profile\s/, '');
      }

      return profileName;
    });
  }
});

/**
 * Represents credentials loaded from shared credentials file
 * (defaulting to ~/.aws/credentials or defined by the
 * `AWS_SHARED_CREDENTIALS_FILE` environment variable).
 *
 * ## Using the shared credentials file
 *
 * This provider is checked by default in the Node.js environment. To use the
 * credentials file provider, simply add your access and secret keys to the
 * ~/.aws/credentials file in the following format:
 *
 *     [default]
 *     aws_access_key_id = AKID...
 *     aws_secret_access_key = YOUR_SECRET_KEY
 *
 * ## Using custom profiles
 *
 * The SDK supports loading credentials for separate profiles. This can be done
 * in two ways:
 *
 * 1. Set the `AWS_PROFILE` environment variable in your process prior to
 *    loading the SDK.
 * 2. Directly load the AWS.SharedIniFileCredentials provider:
 *
 * ```javascript
 * var creds = new AWS.SharedIniFileCredentials({profile: 'myprofile'});
 * AWS.config.credentials = creds;
 * ```
 *
 * @!macro nobrowser
 */
core.SharedIniFileCredentials = core.util.inherit(core.Credentials, {
  /**
   * Creates a new SharedIniFileCredentials object.
   *
   * @param options [map] a set of options
   * @option options profile [String] (AWS_PROFILE env var or 'default')
   *   the name of the profile to load.
   * @option options filename [String] ('~/.aws/credentials' or defined by
   *   AWS_SHARED_CREDENTIALS_FILE process env var)
   *   the filename to use when loading credentials.
   * @option options disableAssumeRole [Boolean] (false) True to disable
   *   support for profiles that assume an IAM role. If true, and an assume
   *   role profile is selected, an error is raised.
   */
  constructor: function SharedIniFileCredentials(options) {
    core.Credentials.call(this);

    options = options || {};

    this.filename = options.filename;
    this.profile = options.profile || process.env.AWS_PROFILE || core.util.defaultProfile;
    this.disableAssumeRole = Boolean(options.disableAssumeRole);
    this.get(function() {});
  },

  /**
   * Loads the credentials from the shared credentials file
   *
   * @callback callback function(err)
   *   Called after the shared INI file on disk is read and parsed. When this
   *   callback is called with no error, it means that the credentials
   *   information has been loaded into the object (as the `accessKeyId`,
   *   `secretAccessKey`, and `sessionToken` properties).
   *   @param err [Error] if an error occurred, this value will be filled
   * @see get
   */
  refresh: function refresh(callback) {
    if (!callback) callback = function(err) { if (err) throw err; };
    try {
      var profiles = {};
      var i, availableProfiles;
      if (process.env[core.util.configOptInEnv]) {
        var config = new shared_ini({
          isConfig: true,
          filename: process.env[core.util.sharedConfigFileEnv]
        });
        for (i = 0, availableProfiles = config.getProfiles(); i < availableProfiles.length; i++) {
          profiles[availableProfiles[i]] = config.getProfile(availableProfiles[i]);
        }
      }
      var creds = new shared_ini({
        filename: this.filename ||
          (process.env[core.util.configOptInEnv] && process.env[core.util.sharedCredentialsFileEnv])
      });
      for (i = 0, availableProfiles = creds.getProfiles(); i < availableProfiles.length; i++) {
        profiles[availableProfiles[i]] = creds.getProfile(availableProfiles[i]);
      }
      var profile = profiles[this.profile] || {};

      if (Object.keys(profile).length === 0) {
        throw core.util.error(
          new Error('Profile ' + this.profile + ' not found'),
          { code: 'SharedIniFileCredentialsProviderFailure' }
        );
      }

      if (profile['role_arn']) {
        this.loadRoleProfile(profiles, profile, callback);
        return;
      }

      this.accessKeyId = profile['aws_access_key_id'];
      this.secretAccessKey = profile['aws_secret_access_key'];
      this.sessionToken = profile['aws_session_token'];

      if (!this.accessKeyId || !this.secretAccessKey) {
        throw core.util.error(
          new Error('Credentials not set for profile ' + this.profile),
          { code: 'SharedIniFileCredentialsProviderFailure' }
        );
      }
      this.expired = false;
      callback();
    } catch (err) {
      callback(err);
    }
  },

  /**
   * @api private
   */
  loadRoleProfile: function loadRoleProfile(creds, roleProfile, callback) {
    if (this.disableAssumeRole) {
      throw core.util.error(
        new Error('Role assumption profiles are disabled. ' +
                  'Failed to load profile ' + this.profile +
                  ' from ' + creds.filename),
        { code: 'SharedIniFileCredentialsProviderFailure' }
      );
    }

    var self = this;
    var roleArn = roleProfile['role_arn'];
    var roleSessionName = roleProfile['role_session_name'];
    var externalId = roleProfile['external_id'];
    var sourceProfileName = roleProfile['source_profile'];

    if (!sourceProfileName) {
      throw core.util.error(
        new Error('source_profile is not set using profile ' + this.profile),
        { code: 'SharedIniFileCredentialsProviderFailure' }
      );
    }

    var sourceProfile = creds[sourceProfileName];

    if (typeof sourceProfile !== 'object') {
      throw core.util.error(
        new Error('source_profile ' + sourceProfileName + ' using profile '
          + this.profile + ' does not exist'),
        { code: 'SharedIniFileCredentialsProviderFailure' }
      );
    }

    this.roleArn = roleArn;

    var sourceCredentials = {
      accessKeyId: sourceProfile['aws_access_key_id'],
      secretAccessKey: sourceProfile['aws_secret_access_key'],
      sessionToken: sourceProfile['aws_session_token']
    };

    if (!sourceCredentials.accessKeyId || !sourceCredentials.secretAccessKey) {
      throw core.util.error(
        new Error('Credentials not set in source_profile ' +
                  sourceProfileName + ' using profile ' + this.profile),
        { code: 'SharedIniFileCredentialsProviderFailure' }
      );
    }

    var sts = new sts$1({
      credentials: new core.Credentials(sourceCredentials)
    });

    var roleParams = {
      RoleArn: roleArn,
      RoleSessionName: roleSessionName || 'aws-sdk-js-' + Date.now()
    };

    if (externalId) {
      roleParams.ExternalId = externalId;
    }

    sts.assumeRole(roleParams, function (err, data) {
      if (err) {
        callback(err);
        return;
      }

      self.accessKeyId = data.Credentials.AccessKeyId;
      self.secretAccessKey = data.Credentials.SecretAccessKey;
      self.sessionToken = data.Credentials.SessionToken;
      self.expireTime = data.Credentials.Expiration;
      callback();
    });
  }
});

// node.js specific modules
util_1.crypto.lib = crypto;
util_1.Buffer = buffer.Buffer;
util_1.domain = domain;
util_1.stream = stream;
util_1.url = url;
util_1.querystring = querystring;
util_1.environment = 'nodejs';
var AWS;
var node_loader = AWS = core;








// Load the xml2js XML parser
AWS.XML.Parser = node_parser;

// Load Node HTTP client


// Load custom credential providers









// Setup default chain providers
// If this changes, please update documentation for
// AWS.CredentialProviderChain.defaultProviders in
// credentials/credential_provider_chain.js
AWS.CredentialProviderChain.defaultProviders = [
  function () { return new AWS.EnvironmentCredentials('AWS'); },
  function () { return new AWS.EnvironmentCredentials('AMAZON'); },
  function () { return new AWS.SharedIniFileCredentials(); },
  function () {
    if (AWS.ECSCredentials.prototype.isConfiguredForEcsCredentials()) {
      return new AWS.ECSCredentials();
    }
    return new AWS.EC2MetadataCredentials();
  }
];

// Update configuration keys
AWS.util.update(AWS.Config.prototype.keys, {
  credentials: function () {
    var credentials = null;
    new AWS.CredentialProviderChain([
      function () { return new AWS.EnvironmentCredentials('AWS'); },
      function () { return new AWS.EnvironmentCredentials('AMAZON'); },
      function () { return new AWS.SharedIniFileCredentials({ disableAssumeRole: true }); }
    ]).resolve(function(err, creds) {
      if (!err) credentials = creds;
    });
    return credentials;
  },
  credentialProvider: function() {
    return new AWS.CredentialProviderChain();
  },
  logger: function () {
    return process.env.AWSJS_DEBUG ? console : null;
  },
  region: function() {
    var env = process.env;
    var region = env.AWS_REGION || env.AMAZON_REGION;
    if (env[AWS.util.configOptInEnv]) {
      var toCheck = [
        {filename: env[AWS.util.sharedCredentialsFileEnv]},
        {isConfig: true, filename: env[AWS.util.sharedConfigFileEnv]}
      ];
      while (!region && toCheck.length) {
        var configFile = new shared_ini(toCheck.shift());
        var profile = configFile.getProfile(
          env.AWS_PROFILE || AWS.util.defaultProfile
        );
        region = profile && profile.region;
      }
    }
    return region;
  }
});

// Reset configuration
AWS.config = new AWS.Config();

var util$6 = core.util;

function typeOf$1(data) {
  if (data === null && typeof data === 'object') {
    return 'null';
  } else if (data !== undefined && isBinary(data)) {
    return 'Binary';
  } else if (data !== undefined && data.constructor) {
    return util$6.typeName(data.constructor);
  } else if (data !== undefined && typeof data === 'object') {
    // this object is the result of Object.create(null), hence the absence of a
    // defined constructor
    return 'Object';
  } else {
    return 'undefined';
  }
}

function isBinary(data) {
  var types = [
    'Buffer', 'File', 'Blob', 'ArrayBuffer', 'DataView',
    'Int8Array', 'Uint8Array', 'Uint8ClampedArray',
    'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array',
    'Float32Array', 'Float64Array'
  ];
  if (util$6.isNode()) {
    var Stream = util$6.stream.Stream;
    if (util$6.Buffer.isBuffer(data) || data instanceof Stream) {
      return true;
    }
  }

  for (var i = 0; i < types.length; i++) {
    if (data !== undefined && data.constructor) {
      if (util$6.isType(data, types[i])) return true;
      if (util$6.typeName(data.constructor) === types[i]) return true;
    }
  }

  return false;
}

var types = {
  typeOf: typeOf$1,
  isBinary: isBinary
};

var util$7 = core.util;
var typeOf$2 = types.typeOf;

var memberTypeToSetType = {
  'String': 'String',
  'Number': 'Number',
  'NumberValue': 'Number',
  'Binary': 'Binary'
};

/**
 * @api private
 */
var DynamoDBSet = util$7.inherit({

  constructor: function Set(list, options) {
    options = options || {};
    this.initialize(list, options.validate);
  },

  initialize: function(list, validate) {
    var self = this;
    self.values = [].concat(list);
    self.detectType();
    if (validate) {
      self.validate();
    }
  },

  detectType: function() {
    this.type = memberTypeToSetType[typeOf$2(this.values[0])];
    if (!this.type) {
      throw util$7.error(new Error(), {
        code: 'InvalidSetType',
        message: 'Sets can contain string, number, or binary values'
      });
    }
  },

  validate: function() {
    var self = this;
    var length = self.values.length;
    var values = self.values;
    for (var i = 0; i < length; i++) {
      if (memberTypeToSetType[typeOf$2(values[i])] !== self.type) {
        throw util$7.error(new Error(), {
          code: 'InvalidType',
          message: self.type + ' Set contains ' + typeOf$2(values[i]) + ' value'
        });
      }
    }
  }

});

var set = DynamoDBSet;

var util$8 = core.util;

/**
 * An object recognizable as a numeric value that stores the underlying number
 * as a string.
 *
 * Intended to be a deserialization target for the DynamoDB Document Client when
 * the `wrapNumbers` flag is set. This allows for numeric values that lose
 * precision when converted to JavaScript's `number` type.
 */
var DynamoDBNumberValue = util$8.inherit({
  constructor: function NumberValue(value) {
    this.value = value.toString();
  },

  /**
   * Render the underlying value as a number when converting to JSON.
   */
  toJSON: function () {
    return this.toNumber();
  },

  /**
   * Convert the underlying value to a JavaScript number.
   */
  toNumber: function () {
    return Number(this.value);
  },

  /**
   * Return a string representing the unaltered value provided to the
   * constructor.
   */
  toString: function () {
    return this.value;
  }
});

var numberValue = DynamoDBNumberValue;

var util$5 = core.util;
var typeOf = types.typeOf;



core.DynamoDB.Converter = {
  /**
   * Convert a JavaScript value to its equivalent DynamoDB AttributeValue type
   *
   * @param data [any] The data to convert to a DynamoDB AttributeValue
   * @param options [map]
   * @option options convertEmptyValues [Boolean] Whether to automatically
   *                                              convert empty strings, blobs,
   *                                              and sets to `null`
   * @option options wrapNumbers [Boolean]  Whether to return numbers as a
   *                                        NumberValue object instead of
   *                                        converting them to native JavaScript
   *                                        numbers. This allows for the safe
   *                                        round-trip transport of numbers of
   *                                        arbitrary size.
   * @return [map] An object in the Amazon DynamoDB AttributeValue format
   *
   * @see AWS.DynamoDB.Converter.marshall AWS.DynamoDB.Converter.marshall to
   *    convert entire records (rather than individual attributes)
   */
  input: function convertInput(data, options) {
    options = options || {};
    var type = typeOf(data);
    if (type === 'Object') {
      return formatMap(data, options);
    } else if (type === 'Array') {
      return formatList(data, options);
    } else if (type === 'Set') {
      return formatSet(data, options);
    } else if (type === 'String') {
      if (data.length === 0 && options.convertEmptyValues) {
        return convertInput(null);
      }
      return { S: data };
    } else if (type === 'Number' || type === 'NumberValue') {
      return { N: data.toString() };
    } else if (type === 'Binary') {
      if (data.length === 0 && options.convertEmptyValues) {
        return convertInput(null);
      }
      return { B: data };
    } else if (type === 'Boolean') {
      return { BOOL: data };
    } else if (type === 'null') {
      return { NULL: true };
    } else if (type !== 'undefined' && type !== 'Function') {
      // this value has a custom constructor
      return formatMap(data, options);
    }
  },

  /**
   * Convert a JavaScript object into a DynamoDB record.
   *
   * @param data [any] The data to convert to a DynamoDB record
   * @param options [map]
   * @option options convertEmptyValues [Boolean] Whether to automatically
   *                                              convert empty strings, blobs,
   *                                              and sets to `null`
   * @option options wrapNumbers [Boolean]  Whether to return numbers as a
   *                                        NumberValue object instead of
   *                                        converting them to native JavaScript
   *                                        numbers. This allows for the safe
   *                                        round-trip transport of numbers of
   *                                        arbitrary size.
   *
   * @return [map] An object in the DynamoDB record format.
   *
   * @example Convert a JavaScript object into a DynamoDB record
   *  var marshalled = AWS.DynamoDB.Converter.marshall({
   *    string: 'foo',
   *    list: ['fizz', 'buzz', 'pop'],
   *    map: {
   *      nestedMap: {
   *        key: 'value',
   *      }
   *    },
   *    number: 123,
   *    nullValue: null,
   *    boolValue: true,
   *    stringSet: new DynamoDBSet(['foo', 'bar', 'baz'])
   *  });
   */
  marshall: function marshallItem(data, options) {
    return core.DynamoDB.Converter.input(data, options).M;
  },

  /**
   * Convert a DynamoDB AttributeValue object to its equivalent JavaScript type.
   *
   * @param data [map] An object in the Amazon DynamoDB AttributeValue format
   * @param options [map]
   * @option options convertEmptyValues [Boolean] Whether to automatically
   *                                              convert empty strings, blobs,
   *                                              and sets to `null`
   * @option options wrapNumbers [Boolean]  Whether to return numbers as a
   *                                        NumberValue object instead of
   *                                        converting them to native JavaScript
   *                                        numbers. This allows for the safe
   *                                        round-trip transport of numbers of
   *                                        arbitrary size.
   *
   * @return [Object|Array|String|Number|Boolean|null]
   *
   * @see AWS.DynamoDB.Converter.unmarshall AWS.DynamoDB.Converter.unmarshall to
   *    convert entire records (rather than individual attributes)
   */
  output: function convertOutput(data, options) {
    options = options || {};
    var list, map, i;
    for (var type in data) {
      var values = data[type];
      if (type === 'M') {
        map = {};
        for (var key in values) {
          map[key] = convertOutput(values[key], options);
        }
        return map;
      } else if (type === 'L') {
        list = [];
        for (i = 0; i < values.length; i++) {
          list.push(convertOutput(values[i], options));
        }
        return list;
      } else if (type === 'SS') {
        list = [];
        for (i = 0; i < values.length; i++) {
          list.push(values[i] + '');
        }
        return new set(list);
      } else if (type === 'NS') {
        list = [];
        for (i = 0; i < values.length; i++) {
          list.push(convertNumber(values[i], options.wrapNumbers));
        }
        return new set(list);
      } else if (type === 'BS') {
        list = [];
        for (i = 0; i < values.length; i++) {
          list.push(new util$5.Buffer(values[i]));
        }
        return new set(list);
      } else if (type === 'S') {
        return values + '';
      } else if (type === 'N') {
        return convertNumber(values, options.wrapNumbers);
      } else if (type === 'B') {
        return new util$5.Buffer(values);
      } else if (type === 'BOOL') {
        return (values === 'true' || values === 'TRUE' || values === true);
      } else if (type === 'NULL') {
        return null;
      }
    }
  },

  /**
   * Convert a DynamoDB record into a JavaScript object.
   *
   * @param data [any] The DynamoDB record
   * @param options [map]
   * @option options convertEmptyValues [Boolean] Whether to automatically
   *                                              convert empty strings, blobs,
   *                                              and sets to `null`
   * @option options wrapNumbers [Boolean]  Whether to return numbers as a
   *                                        NumberValue object instead of
   *                                        converting them to native JavaScript
   *                                        numbers. This allows for the safe
   *                                        round-trip transport of numbers of
   *                                        arbitrary size.
   *
   * @return [map] An object whose properties have been converted from
   *    DynamoDB's AttributeValue format into their corresponding native
   *    JavaScript types.
   *
   * @example Convert a record received from a DynamoDB stream
   *  var unmarshalled = AWS.DynamoDB.Converter.unmarshall({
   *    string: {S: 'foo'},
   *    list: {L: [{S: 'fizz'}, {S: 'buzz'}, {S: 'pop'}]},
   *    map: {
   *      M: {
   *        nestedMap: {
   *          M: {
   *            key: {S: 'value'}
   *          }
   *        }
   *      }
   *    },
   *    number: {N: '123'},
   *    nullValue: {NULL: true},
   *    boolValue: {BOOL: true}
   *  });
   */
  unmarshall: function unmarshall(data, options) {
    return core.DynamoDB.Converter.output({M: data}, options);
  }
};

/**
 * @api private
 * @param data [Array]
 * @param options [map]
 */
function formatList(data, options) {
  var list = {L: []};
  for (var i = 0; i < data.length; i++) {
    list['L'].push(core.DynamoDB.Converter.input(data[i], options));
  }
  return list;
}

/**
 * @api private
 * @param value [String]
 * @param wrapNumbers [Boolean]
 */
function convertNumber(value, wrapNumbers) {
  return wrapNumbers ? new numberValue(value) : Number(value);
}

/**
 * @api private
 * @param data [map]
 * @param options [map]
 */
function formatMap(data, options) {
  var map = {M: {}};
  for (var key in data) {
    var formatted = core.DynamoDB.Converter.input(data[key], options);
    if (formatted !== void 0) {
      map['M'][key] = formatted;
    }
  }
  return map;
}

/**
 * @api private
 */
function formatSet(data, options) {
  options = options || {};
  var values = data.values;
  if (options.convertEmptyValues) {
    values = filterEmptySetValues(data);
    if (values.length === 0) {
      return core.DynamoDB.Converter.input(null);
    }
  }

  var map = {};
  switch (data.type) {
    case 'String': map['SS'] = values; break;
    case 'Binary': map['BS'] = values; break;
    case 'Number': map['NS'] = values.map(function (value) {
      return value.toString();
    });
  }
  return map;
}

/**
 * @api private
 */
function filterEmptySetValues(set$$1) {
    var nonEmptyValues = [];
    var potentiallyEmptyTypes = {
        String: true,
        Binary: true,
        Number: false
    };
    if (potentiallyEmptyTypes[set$$1.type]) {
        for (var i = 0; i < set$$1.values.length; i++) {
            if (set$$1.values[i].length === 0) {
                continue;
            }
            nonEmptyValues.push(set$$1.values[i]);
        }

        return nonEmptyValues;
    }

    return set$$1.values;
}

var converter = core.DynamoDB.Converter;

var util$4 = core.util;


var Translator = function(options) {
  options = options || {};
  this.attrValue = options.attrValue;
  this.convertEmptyValues = Boolean(options.convertEmptyValues);
  this.wrapNumbers = Boolean(options.wrapNumbers);
};

Translator.prototype.translateInput = function(value, shape) {
  this.mode = 'input';
  return this.translate(value, shape);
};

Translator.prototype.translateOutput = function(value, shape) {
  this.mode = 'output';
  return this.translate(value, shape);
};

Translator.prototype.translate = function(value, shape) {
  var self = this;
  if (!shape || value === undefined) return undefined;

  if (shape.shape === self.attrValue) {
    return converter[self.mode](value, {
      convertEmptyValues: self.convertEmptyValues,
      wrapNumbers: self.wrapNumbers,
    });
  }
  switch (shape.type) {
    case 'structure': return self.translateStructure(value, shape);
    case 'map': return self.translateMap(value, shape);
    case 'list': return self.translateList(value, shape);
    default: return self.translateScalar(value, shape);
  }
};

Translator.prototype.translateStructure = function(structure, shape) {
  var self = this;
  if (structure == null) return undefined;

  var struct = {};
  util$4.each(structure, function(name, value) {
    var memberShape = shape.members[name];
    if (memberShape) {
      var result = self.translate(value, memberShape);
      if (result !== undefined) struct[name] = result;
    }
  });
  return struct;
};

Translator.prototype.translateList = function(list, shape) {
  var self = this;
  if (list == null) return undefined;

  var out = [];
  util$4.arrayEach(list, function(value) {
    var result = self.translate(value, shape.member);
    if (result === undefined) out.push(null);
    else out.push(result);
  });
  return out;
};

Translator.prototype.translateMap = function(map, shape) {
  var self = this;
  if (map == null) return undefined;

  var out = {};
  util$4.each(map, function(key, value) {
    var result = self.translate(value, shape.value);
    if (result === undefined) out[key] = null;
    else out[key] = result;
  });
  return out;
};

Translator.prototype.translateScalar = function(value, shape) {
  return shape.toType(value);
};

var translator = Translator;

/**
 * The document client simplifies working with items in Amazon DynamoDB
 * by abstracting away the notion of attribute values. This abstraction
 * annotates native JavaScript types supplied as input parameters, as well
 * as converts annotated response data to native JavaScript types.
 *
 * ## Marshalling Input and Unmarshalling Response Data
 *
 * The document client affords developers the use of native JavaScript types
 * instead of `AttributeValue`s to simplify the JavaScript development
 * experience with Amazon DynamoDB. JavaScript objects passed in as parameters
 * are marshalled into `AttributeValue` shapes required by Amazon DynamoDB.
 * Responses from DynamoDB are unmarshalled into plain JavaScript objects
 * by the `DocumentClient`. The `DocumentClient`, does not accept
 * `AttributeValue`s in favor of native JavaScript types.
 *
 * |                             JavaScript Type                            | DynamoDB AttributeValue |
 * |:----------------------------------------------------------------------:|-------------------------|
 * | String                                                                 | S                       |
 * | Number                                                                 | N                       |
 * | Boolean                                                                | BOOL                    |
 * | null                                                                   | NULL                    |
 * | Array                                                                  | L                       |
 * | Object                                                                 | M                       |
 * | Buffer, File, Blob, ArrayBuffer, DataView, and JavaScript typed arrays | B                       |
 *
 * ## Support for Sets
 *
 * The `DocumentClient` offers a convenient way to create sets from
 * JavaScript Arrays. The type of set is inferred from the first element
 * in the array. DynamoDB supports string, number, and binary sets. To
 * learn more about supported types see the
 * [Amazon DynamoDB Data Model Documentation](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DataModel.html)
 * For more information see {AWS.DynamoDB.DocumentClient.createSet}
 *
 */
core.DynamoDB.DocumentClient = core.util.inherit({

  /**
   * @api private
   */
  operations: {
    batchGetItem: 'batchGet',
    batchWriteItem: 'batchWrite',
    putItem: 'put',
    getItem: 'get',
    deleteItem: 'delete',
    updateItem: 'update',
    scan: 'scan',
    query: 'query'
  },

  /**
   * Creates a DynamoDB document client with a set of configuration options.
   *
   * @option options params [map] An optional map of parameters to bind to every
   *   request sent by this service object.
   * @option options service [AWS.DynamoDB] An optional pre-configured instance
   *  of the AWS.DynamoDB service object to use for requests. The object may
   *  bound parameters used by the document client.
   * @option options convertEmptyValues [Boolean] set to true if you would like
   *  the document client to convert empty values (0-length strings, binary
   *  buffers, and sets) to be converted to NULL types when persisting to
   *  DynamoDB.
   * @see AWS.DynamoDB.constructor
   *
   */
  constructor: function DocumentClient(options) {
    var self = this;
    self.options = options || {};
    self.configure(self.options);
  },

  /**
   * @api private
   */
  configure: function configure(options) {
    var self = this;
    self.service = options.service;
    self.bindServiceObject(options);
    self.attrValue = options.attrValue =
      self.service.api.operations.putItem.input.members.Item.value.shape;
  },

  /**
   * @api private
   */
  bindServiceObject: function bindServiceObject(options) {
    var self = this;
    options = options || {};

    if (!self.service) {
      self.service = new core.DynamoDB(options);
    } else {
      var config = core.util.copy(self.service.config);
      self.service = new self.service.constructor.__super__(config);
      self.service.config.params =
        core.util.merge(self.service.config.params || {}, options.params);
    }
  },

  /**
   * Returns the attributes of one or more items from one or more tables
   * by delegating to `AWS.DynamoDB.batchGetItem()`.
   *
   * Supply the same parameters as {AWS.DynamoDB.batchGetItem} with
   * `AttributeValue`s substituted by native JavaScript types.
   *
   * @see AWS.DynamoDB.batchGetItem
   * @example Get items from multiple tables
   *  var params = {
   *    RequestItems: {
   *      'Table-1': {
   *        Keys: [
   *          {
   *             HashKey: 'haskey',
   *             NumberRangeKey: 1
   *          }
   *        ]
   *      },
   *      'Table-2': {
   *        Keys: [
   *          { foo: 'bar' },
   *        ]
   *      }
   *    }
   *  };
   *
   *  var documentClient = new AWS.DynamoDB.DocumentClient();
   *
   *  documentClient.batchGet(params, function(err, data) {
   *    if (err) console.log(err);
   *    else console.log(data);
   *  });
   *
   */
  batchGet: function(params, callback) {
    var self = this;
    var request = self.service.batchGetItem(params);
    self.setupRequest(request);
    self.setupResponse(request);
    if (typeof callback === 'function') {
      request.send(callback);
    }
    return request;
  },

  /**
   * Puts or deletes multiple items in one or more tables by delegating
   * to `AWS.DynamoDB.batchWriteItem()`.
   *
   * Supply the same parameters as {AWS.DynamoDB.batchWriteItem} with
   * `AttributeValue`s substituted by native JavaScript types.
   *
   * @see AWS.DynamoDB.batchWriteItem
   * @example Write to and delete from a table
   *  var params = {
   *    RequestItems: {
   *      'Table-1': [
   *        {
   *          DeleteRequest: {
   *            Key: { HashKey: 'someKey' }
   *          }
   *        },
   *        {
   *          PutRequest: {
   *            Item: {
   *              HashKey: 'anotherKey',
   *              NumAttribute: 1,
   *              BoolAttribute: true,
   *              ListAttribute: [1, 'two', false],
   *              MapAttribute: { foo: 'bar' }
   *            }
   *          }
   *        }
   *      ]
   *    }
   *  };
   *
   *  var documentClient = new AWS.DynamoDB.DocumentClient();
   *
   *  documentClient.batchWrite(params, function(err, data) {
   *    if (err) console.log(err);
   *    else console.log(data);
   *  });
   *
   */
  batchWrite: function(params, callback) {
    var self = this;
    var request = self.service.batchWriteItem(params);
    self.setupRequest(request);
    self.setupResponse(request);
    if (typeof callback === 'function') {
      request.send(callback);
    }
    return request;
  },

  /**
   * Deletes a single item in a table by primary key by delegating to
   * `AWS.DynamoDB.deleteItem()`
   *
   * Supply the same parameters as {AWS.DynamoDB.deleteItem} with
   * `AttributeValue`s substituted by native JavaScript types.
   *
   * @see AWS.DynamoDB.deleteItem
   * @example Delete an item from a table
   *  var params = {
   *    TableName : 'Table',
   *    Key: {
   *      HashKey: 'hashkey',
   *      NumberRangeKey: 1
   *    }
   *  };
   *
   *  var documentClient = new AWS.DynamoDB.DocumentClient();
   *
   *  documentClient.delete(params, function(err, data) {
   *    if (err) console.log(err);
   *    else console.log(data);
   *  });
   *
   */
  delete: function(params, callback) {
    var self = this;
    var request = self.service.deleteItem(params);
    self.setupRequest(request);
    self.setupResponse(request);
    if (typeof callback === 'function') {
      request.send(callback);
    }
    return request;
  },

  /**
   * Returns a set of attributes for the item with the given primary key
   * by delegating to `AWS.DynamoDB.getItem()`.
   *
   * Supply the same parameters as {AWS.DynamoDB.getItem} with
   * `AttributeValue`s substituted by native JavaScript types.
   *
   * @see AWS.DynamoDB.getItem
   * @example Get an item from a table
   *  var params = {
   *    TableName : 'Table',
   *    Key: {
   *      HashKey: 'hashkey'
   *    }
   *  };
   *
   *  var documentClient = new AWS.DynamoDB.DocumentClient();
   *
   *  documentClient.get(params, function(err, data) {
   *    if (err) console.log(err);
   *    else console.log(data);
   *  });
   *
   */
  get: function(params, callback) {
    var self = this;
    var request = self.service.getItem(params);
    self.setupRequest(request);
    self.setupResponse(request);
    if (typeof callback === 'function') {
      request.send(callback);
    }
    return request;
  },

  /**
   * Creates a new item, or replaces an old item with a new item by
   * delegating to `AWS.DynamoDB.putItem()`.
   *
   * Supply the same parameters as {AWS.DynamoDB.putItem} with
   * `AttributeValue`s substituted by native JavaScript types.
   *
   * @see AWS.DynamoDB.putItem
   * @example Create a new item in a table
   *  var params = {
   *    TableName : 'Table',
   *    Item: {
   *       HashKey: 'haskey',
   *       NumAttribute: 1,
   *       BoolAttribute: true,
   *       ListAttribute: [1, 'two', false],
   *       MapAttribute: { foo: 'bar'},
   *       NullAttribute: null
   *    }
   *  };
   *
   *  var documentClient = new AWS.DynamoDB.DocumentClient();
   *
   *  documentClient.put(params, function(err, data) {
   *    if (err) console.log(err);
   *    else console.log(data);
   *  });
   *
   */
  put: function put(params, callback) {
    var self = this;
    var request = self.service.putItem(params);
    self.setupRequest(request);
    self.setupResponse(request);
    if (typeof callback === 'function') {
      request.send(callback);
    }
    return request;
  },

  /**
   * Edits an existing item's attributes, or adds a new item to the table if
   * it does not already exist by delegating to `AWS.DynamoDB.updateItem()`.
   *
   * Supply the same parameters as {AWS.DynamoDB.updateItem} with
   * `AttributeValue`s substituted by native JavaScript types.
   *
   * @see AWS.DynamoDB.updateItem
   * @example Update an item with expressions
   *  var params = {
   *    TableName: 'Table',
   *    Key: { HashKey : 'hashkey' },
   *    UpdateExpression: 'set #a = :x + :y',
   *    ConditionExpression: '#a < :MAX',
   *    ExpressionAttributeNames: {'#a' : 'Sum'},
   *    ExpressionAttributeValues: {
   *      ':x' : 20,
   *      ':y' : 45,
   *      ':MAX' : 100,
   *    }
   *  };
   *
   *  var documentClient = new AWS.DynamoDB.DocumentClient();
   *
   *  documentClient.update(params, function(err, data) {
   *     if (err) console.log(err);
   *     else console.log(data);
   *  });
   *
   */
  update: function(params, callback) {
    var self = this;
    var request = self.service.updateItem(params);
    self.setupRequest(request);
    self.setupResponse(request);
    if (typeof callback === 'function') {
      request.send(callback);
    }
    return request;
  },

  /**
   * Returns one or more items and item attributes by accessing every item
   * in a table or a secondary index.
   *
   * Supply the same parameters as {AWS.DynamoDB.scan} with
   * `AttributeValue`s substituted by native JavaScript types.
   *
   * @see AWS.DynamoDB.scan
   * @example Scan the table with a filter expression
   *  var params = {
   *    TableName : 'Table',
   *    FilterExpression : 'Year = :this_year',
   *    ExpressionAttributeValues : {':this_year' : 2015}
   *  };
   *
   *  var documentClient = new AWS.DynamoDB.DocumentClient();
   *
   *  documentClient.scan(params, function(err, data) {
   *     if (err) console.log(err);
   *     else console.log(data);
   *  });
   *
   */
  scan: function(params, callback) {
    var self = this;
    var request = self.service.scan(params);
    self.setupRequest(request);
    self.setupResponse(request);
    if (typeof callback === 'function') {
      request.send(callback);
    }
    return request;
  },

   /**
    * Directly access items from a table by primary key or a secondary index.
    *
    * Supply the same parameters as {AWS.DynamoDB.query} with
    * `AttributeValue`s substituted by native JavaScript types.
    *
    * @see AWS.DynamoDB.query
    * @example Query an index
    *  var params = {
    *    TableName: 'Table',
    *    IndexName: 'Index',
    *    KeyConditionExpression: 'HashKey = :hkey and RangeKey > :rkey',
    *    ExpressionAttributeValues: {
    *      ':hkey': 'key',
    *      ':rkey': 2015
    *    }
    *  };
    *
    *  var documentClient = new AWS.DynamoDB.DocumentClient();
    *
    *  documentClient.query(params, function(err, data) {
    *     if (err) console.log(err);
    *     else console.log(data);
    *  });
    *
    */
  query: function(params, callback) {
    var self = this;
    var request = self.service.query(params);
    self.setupRequest(request);
    self.setupResponse(request);
    if (typeof callback === 'function') {
      request.send(callback);
    }
    return request;
  },

  /**
   * Creates a set of elements inferring the type of set from
   * the type of the first element. Amazon DynamoDB currently supports
   * the number sets, string sets, and binary sets. For more information
   * about DynamoDB data types see the documentation on the
   * [Amazon DynamoDB Data Model](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DataModel.html#DataModel.DataTypes).
   *
   * @param list [Array] Collection to represent your DynamoDB Set
   * @param options [map]
   *  * **validate** [Boolean] set to true if you want to validate the type
   *    of each element in the set. Defaults to `false`.
   * @example Creating a number set
   *  var documentClient = new AWS.DynamoDB.DocumentClient();
   *
   *  var params = {
   *    Item: {
   *      hashkey: 'hashkey'
   *      numbers: documentClient.createSet([1, 2, 3]);
   *    }
   *  };
   *
   *  documentClient.put(params, function(err, data) {
   *    if (err) console.log(err);
   *    else console.log(data);
   *  });
   *
   */
  createSet: function(list, options) {
    options = options || {};
    return new set(list, options);
  },

  /**
   * @api private
   */
  getTranslator: function() {
    return new translator(this.options);
  },

  /**
   * @api private
   */
  setupRequest: function setupRequest(request) {
    var self = this;
    var translator$$1 = self.getTranslator();
    var operation = request.operation;
    var inputShape = request.service.api.operations[operation].input;
    request._events.validate.unshift(function(req) {
      req.rawParams = core.util.copy(req.params);
      req.params = translator$$1.translateInput(req.rawParams, inputShape);
    });
  },

  /**
   * @api private
   */
  setupResponse: function setupResponse(request) {
    var self = this;
    var translator$$1 = self.getTranslator();
    var outputShape = self.service.api.operations[request.operation].output;
    request.on('extractData', function(response) {
      response.data = translator$$1.translateOutput(response.data, outputShape);
    });

    var response = request.response;
    response.nextPage = function(cb) {
      var resp = this;
      var req = resp.request;
      var config;
      var service = req.service;
      var operation = req.operation;
      try {
        config = service.paginationConfig(operation, true);
      } catch (e) { resp.error = e; }

      if (!resp.hasNextPage()) {
        if (cb) cb(resp.error, null);
        else if (resp.error) throw resp.error;
        return null;
      }

      var params = core.util.copy(req.rawParams);
      if (!resp.nextPageTokens) {
        return cb ? cb(null, null) : null;
      } else {
        var inputTokens = config.inputToken;
        if (typeof inputTokens === 'string') inputTokens = [inputTokens];
        for (var i = 0; i < inputTokens.length; i++) {
          params[inputTokens[i]] = resp.nextPageTokens[i];
        }
        return self[operation](params, cb);
      }
    };
  }

});

var document_client = core.DynamoDB.DocumentClient;

core.util.update(core.DynamoDB.prototype, {
  /**
   * @api private
   */
  setupRequestListeners: function setupRequestListeners(request) {
    if (request.service.config.dynamoDbCrc32) {
      request.removeListener('extractData', core.EventListeners.Json.EXTRACT_DATA);
      request.addListener('extractData', this.checkCrc32);
      request.addListener('extractData', core.EventListeners.Json.EXTRACT_DATA);
    }
  },

  /**
   * @api private
   */
  checkCrc32: function checkCrc32(resp) {
    if (!resp.httpResponse.streaming && !resp.request.service.crc32IsValid(resp)) {
      resp.data = null;
      resp.error = core.util.error(new Error(), {
        code: 'CRC32CheckFailed',
        message: 'CRC32 integrity check failed',
        retryable: true
      });
      resp.request.haltHandlersOnError();
      throw (resp.error);
    }
  },

  /**
   * @api private
   */
  crc32IsValid: function crc32IsValid(resp) {
    var crc = resp.httpResponse.headers['x-amz-crc32'];
    if (!crc) return true; // no (valid) CRC32 header
    return parseInt(crc, 10) === core.util.crypto.crc32(resp.httpResponse.body);
  },

  /**
   * @api private
   */
  defaultRetryCount: 10,

  /**
   * @api private
   */
  retryDelays: function retryDelays(retryCount) {
    var retryDelayOptions = core.util.copy(this.config.retryDelayOptions);

    if (typeof retryDelayOptions.base !== 'number') {
        retryDelayOptions.base = 50; // default for dynamodb
    }
    var delay = core.util.calculateRetryDelay(retryCount, retryDelayOptions);
    return delay;
  }
});

var version$2 = "2.0";
var metadata$4 = {"apiVersion":"2011-12-05","endpointPrefix":"dynamodb","jsonVersion":"1.0","protocol":"json","serviceAbbreviation":"DynamoDB","serviceFullName":"Amazon DynamoDB","serviceId":"DynamoDB","signatureVersion":"v4","targetPrefix":"DynamoDB_20111205","uid":"dynamodb-2011-12-05"};
var operations$2 = {"BatchGetItem":{"input":{"type":"structure","required":["RequestItems"],"members":{"RequestItems":{"shape":"S2"}}},"output":{"type":"structure","members":{"Responses":{"type":"map","key":{},"value":{"type":"structure","members":{"Items":{"shape":"Sk"},"ConsumedCapacityUnits":{"type":"double"}}}},"UnprocessedKeys":{"shape":"S2"}}}},"BatchWriteItem":{"input":{"type":"structure","required":["RequestItems"],"members":{"RequestItems":{"shape":"So"}}},"output":{"type":"structure","members":{"Responses":{"type":"map","key":{},"value":{"type":"structure","members":{"ConsumedCapacityUnits":{"type":"double"}}}},"UnprocessedItems":{"shape":"So"}}}},"CreateTable":{"input":{"type":"structure","required":["TableName","KeySchema","ProvisionedThroughput"],"members":{"TableName":{},"KeySchema":{"shape":"Sy"},"ProvisionedThroughput":{"shape":"S12"}}},"output":{"type":"structure","members":{"TableDescription":{"shape":"S15"}}}},"DeleteItem":{"input":{"type":"structure","required":["TableName","Key"],"members":{"TableName":{},"Key":{"shape":"S6"},"Expected":{"shape":"S1b"},"ReturnValues":{}}},"output":{"type":"structure","members":{"Attributes":{"shape":"Sl"},"ConsumedCapacityUnits":{"type":"double"}}}},"DeleteTable":{"input":{"type":"structure","required":["TableName"],"members":{"TableName":{}}},"output":{"type":"structure","members":{"TableDescription":{"shape":"S15"}}}},"DescribeTable":{"input":{"type":"structure","required":["TableName"],"members":{"TableName":{}}},"output":{"type":"structure","members":{"Table":{"shape":"S15"}}}},"GetItem":{"input":{"type":"structure","required":["TableName","Key"],"members":{"TableName":{},"Key":{"shape":"S6"},"AttributesToGet":{"shape":"Se"},"ConsistentRead":{"type":"boolean"}}},"output":{"type":"structure","members":{"Item":{"shape":"Sl"},"ConsumedCapacityUnits":{"type":"double"}}}},"ListTables":{"input":{"type":"structure","members":{"ExclusiveStartTableName":{},"Limit":{"type":"integer"}}},"output":{"type":"structure","members":{"TableNames":{"type":"list","member":{}},"LastEvaluatedTableName":{}}}},"PutItem":{"input":{"type":"structure","required":["TableName","Item"],"members":{"TableName":{},"Item":{"shape":"Ss"},"Expected":{"shape":"S1b"},"ReturnValues":{}}},"output":{"type":"structure","members":{"Attributes":{"shape":"Sl"},"ConsumedCapacityUnits":{"type":"double"}}}},"Query":{"input":{"type":"structure","required":["TableName","HashKeyValue"],"members":{"TableName":{},"AttributesToGet":{"shape":"Se"},"Limit":{"type":"integer"},"ConsistentRead":{"type":"boolean"},"Count":{"type":"boolean"},"HashKeyValue":{"shape":"S7"},"RangeKeyCondition":{"shape":"S1u"},"ScanIndexForward":{"type":"boolean"},"ExclusiveStartKey":{"shape":"S6"}}},"output":{"type":"structure","members":{"Items":{"shape":"Sk"},"Count":{"type":"integer"},"LastEvaluatedKey":{"shape":"S6"},"ConsumedCapacityUnits":{"type":"double"}}}},"Scan":{"input":{"type":"structure","required":["TableName"],"members":{"TableName":{},"AttributesToGet":{"shape":"Se"},"Limit":{"type":"integer"},"Count":{"type":"boolean"},"ScanFilter":{"type":"map","key":{},"value":{"shape":"S1u"}},"ExclusiveStartKey":{"shape":"S6"}}},"output":{"type":"structure","members":{"Items":{"shape":"Sk"},"Count":{"type":"integer"},"ScannedCount":{"type":"integer"},"LastEvaluatedKey":{"shape":"S6"},"ConsumedCapacityUnits":{"type":"double"}}}},"UpdateItem":{"input":{"type":"structure","required":["TableName","Key","AttributeUpdates"],"members":{"TableName":{},"Key":{"shape":"S6"},"AttributeUpdates":{"type":"map","key":{},"value":{"type":"structure","members":{"Value":{"shape":"S7"},"Action":{}}}},"Expected":{"shape":"S1b"},"ReturnValues":{}}},"output":{"type":"structure","members":{"Attributes":{"shape":"Sl"},"ConsumedCapacityUnits":{"type":"double"}}}},"UpdateTable":{"input":{"type":"structure","required":["TableName","ProvisionedThroughput"],"members":{"TableName":{},"ProvisionedThroughput":{"shape":"S12"}}},"output":{"type":"structure","members":{"TableDescription":{"shape":"S15"}}}}};
var shapes$2 = {"S2":{"type":"map","key":{},"value":{"type":"structure","required":["Keys"],"members":{"Keys":{"type":"list","member":{"shape":"S6"}},"AttributesToGet":{"shape":"Se"},"ConsistentRead":{"type":"boolean"}}}},"S6":{"type":"structure","required":["HashKeyElement"],"members":{"HashKeyElement":{"shape":"S7"},"RangeKeyElement":{"shape":"S7"}}},"S7":{"type":"structure","members":{"S":{},"N":{},"B":{"type":"blob"},"SS":{"type":"list","member":{}},"NS":{"type":"list","member":{}},"BS":{"type":"list","member":{"type":"blob"}}}},"Se":{"type":"list","member":{}},"Sk":{"type":"list","member":{"shape":"Sl"}},"Sl":{"type":"map","key":{},"value":{"shape":"S7"}},"So":{"type":"map","key":{},"value":{"type":"list","member":{"type":"structure","members":{"PutRequest":{"type":"structure","required":["Item"],"members":{"Item":{"shape":"Ss"}}},"DeleteRequest":{"type":"structure","required":["Key"],"members":{"Key":{"shape":"S6"}}}}}}},"Ss":{"type":"map","key":{},"value":{"shape":"S7"}},"Sy":{"type":"structure","required":["HashKeyElement"],"members":{"HashKeyElement":{"shape":"Sz"},"RangeKeyElement":{"shape":"Sz"}}},"Sz":{"type":"structure","required":["AttributeName","AttributeType"],"members":{"AttributeName":{},"AttributeType":{}}},"S12":{"type":"structure","required":["ReadCapacityUnits","WriteCapacityUnits"],"members":{"ReadCapacityUnits":{"type":"long"},"WriteCapacityUnits":{"type":"long"}}},"S15":{"type":"structure","members":{"TableName":{},"KeySchema":{"shape":"Sy"},"TableStatus":{},"CreationDateTime":{"type":"timestamp"},"ProvisionedThroughput":{"type":"structure","members":{"LastIncreaseDateTime":{"type":"timestamp"},"LastDecreaseDateTime":{"type":"timestamp"},"NumberOfDecreasesToday":{"type":"long"},"ReadCapacityUnits":{"type":"long"},"WriteCapacityUnits":{"type":"long"}}},"TableSizeBytes":{"type":"long"},"ItemCount":{"type":"long"}}},"S1b":{"type":"map","key":{},"value":{"type":"structure","members":{"Value":{"shape":"S7"},"Exists":{"type":"boolean"}}}},"S1u":{"type":"structure","required":["ComparisonOperator"],"members":{"AttributeValueList":{"type":"list","member":{"shape":"S7"}},"ComparisonOperator":{}}}};
var dynamodb20111205_min = {
	version: version$2,
	metadata: metadata$4,
	operations: operations$2,
	shapes: shapes$2
};

var dynamodb20111205_min$1 = Object.freeze({
	version: version$2,
	metadata: metadata$4,
	operations: operations$2,
	shapes: shapes$2,
	default: dynamodb20111205_min
});

var pagination$2 = {"BatchGetItem":{"input_token":"RequestItems","output_token":"UnprocessedKeys"},"ListTables":{"input_token":"ExclusiveStartTableName","limit_key":"Limit","output_token":"LastEvaluatedTableName","result_key":"TableNames"},"Query":{"input_token":"ExclusiveStartKey","limit_key":"Limit","output_token":"LastEvaluatedKey","result_key":"Items"},"Scan":{"input_token":"ExclusiveStartKey","limit_key":"Limit","output_token":"LastEvaluatedKey","result_key":"Items"}};
var dynamodb20111205_paginators = {
	pagination: pagination$2
};

var dynamodb20111205_paginators$1 = Object.freeze({
	pagination: pagination$2,
	default: dynamodb20111205_paginators
});

var version$3 = 2;
var waiters = {"TableExists":{"delay":20,"operation":"DescribeTable","maxAttempts":25,"acceptors":[{"expected":"ACTIVE","matcher":"path","state":"success","argument":"Table.TableStatus"},{"expected":"ResourceNotFoundException","matcher":"error","state":"retry"}]},"TableNotExists":{"delay":20,"operation":"DescribeTable","maxAttempts":25,"acceptors":[{"expected":"ResourceNotFoundException","matcher":"error","state":"success"}]}};
var dynamodb20111205_waiters2 = {
	version: version$3,
	waiters: waiters
};

var dynamodb20111205_waiters2$1 = Object.freeze({
	version: version$3,
	waiters: waiters,
	default: dynamodb20111205_waiters2
});

var version$4 = "2.0";
var metadata$5 = {"apiVersion":"2012-08-10","endpointPrefix":"dynamodb","jsonVersion":"1.0","protocol":"json","serviceAbbreviation":"DynamoDB","serviceFullName":"Amazon DynamoDB","serviceId":"DynamoDB","signatureVersion":"v4","targetPrefix":"DynamoDB_20120810","uid":"dynamodb-2012-08-10"};
var operations$3 = {"BatchGetItem":{"input":{"type":"structure","required":["RequestItems"],"members":{"RequestItems":{"shape":"S2"},"ReturnConsumedCapacity":{}}},"output":{"type":"structure","members":{"Responses":{"type":"map","key":{},"value":{"shape":"Sr"}},"UnprocessedKeys":{"shape":"S2"},"ConsumedCapacity":{"shape":"St"}}}},"BatchWriteItem":{"input":{"type":"structure","required":["RequestItems"],"members":{"RequestItems":{"shape":"S10"},"ReturnConsumedCapacity":{},"ReturnItemCollectionMetrics":{}}},"output":{"type":"structure","members":{"UnprocessedItems":{"shape":"S10"},"ItemCollectionMetrics":{"type":"map","key":{},"value":{"type":"list","member":{"shape":"S1a"}}},"ConsumedCapacity":{"shape":"St"}}}},"CreateBackup":{"input":{"type":"structure","required":["TableName","BackupName"],"members":{"TableName":{},"BackupName":{}}},"output":{"type":"structure","members":{"BackupDetails":{"shape":"S1h"}}}},"CreateGlobalTable":{"input":{"type":"structure","required":["GlobalTableName","ReplicationGroup"],"members":{"GlobalTableName":{},"ReplicationGroup":{"shape":"S1n"}}},"output":{"type":"structure","members":{"GlobalTableDescription":{"shape":"S1r"}}}},"CreateTable":{"input":{"type":"structure","required":["AttributeDefinitions","TableName","KeySchema","ProvisionedThroughput"],"members":{"AttributeDefinitions":{"shape":"S1y"},"TableName":{},"KeySchema":{"shape":"S22"},"LocalSecondaryIndexes":{"type":"list","member":{"type":"structure","required":["IndexName","KeySchema","Projection"],"members":{"IndexName":{},"KeySchema":{"shape":"S22"},"Projection":{"shape":"S27"}}}},"GlobalSecondaryIndexes":{"type":"list","member":{"type":"structure","required":["IndexName","KeySchema","Projection","ProvisionedThroughput"],"members":{"IndexName":{},"KeySchema":{"shape":"S22"},"Projection":{"shape":"S27"},"ProvisionedThroughput":{"shape":"S2d"}}}},"ProvisionedThroughput":{"shape":"S2d"},"StreamSpecification":{"shape":"S2f"}}},"output":{"type":"structure","members":{"TableDescription":{"shape":"S2j"}}}},"DeleteBackup":{"input":{"type":"structure","required":["BackupArn"],"members":{"BackupArn":{}}},"output":{"type":"structure","members":{"BackupDescription":{"shape":"S32"}}}},"DeleteItem":{"input":{"type":"structure","required":["TableName","Key"],"members":{"TableName":{},"Key":{"shape":"S6"},"Expected":{"shape":"S3f"},"ConditionalOperator":{},"ReturnValues":{},"ReturnConsumedCapacity":{},"ReturnItemCollectionMetrics":{},"ConditionExpression":{},"ExpressionAttributeNames":{"shape":"Sm"},"ExpressionAttributeValues":{"shape":"S3n"}}},"output":{"type":"structure","members":{"Attributes":{"shape":"Ss"},"ConsumedCapacity":{"shape":"Su"},"ItemCollectionMetrics":{"shape":"S1a"}}}},"DeleteTable":{"input":{"type":"structure","required":["TableName"],"members":{"TableName":{}}},"output":{"type":"structure","members":{"TableDescription":{"shape":"S2j"}}}},"DescribeBackup":{"input":{"type":"structure","required":["BackupArn"],"members":{"BackupArn":{}}},"output":{"type":"structure","members":{"BackupDescription":{"shape":"S32"}}}},"DescribeContinuousBackups":{"input":{"type":"structure","required":["TableName"],"members":{"TableName":{}}},"output":{"type":"structure","members":{"ContinuousBackupsDescription":{"type":"structure","required":["ContinuousBackupsStatus"],"members":{"ContinuousBackupsStatus":{}}}}}},"DescribeGlobalTable":{"input":{"type":"structure","required":["GlobalTableName"],"members":{"GlobalTableName":{}}},"output":{"type":"structure","members":{"GlobalTableDescription":{"shape":"S1r"}}}},"DescribeLimits":{"input":{"type":"structure","members":{}},"output":{"type":"structure","members":{"AccountMaxReadCapacityUnits":{"type":"long"},"AccountMaxWriteCapacityUnits":{"type":"long"},"TableMaxReadCapacityUnits":{"type":"long"},"TableMaxWriteCapacityUnits":{"type":"long"}}}},"DescribeTable":{"input":{"type":"structure","required":["TableName"],"members":{"TableName":{}}},"output":{"type":"structure","members":{"Table":{"shape":"S2j"}}}},"DescribeTimeToLive":{"input":{"type":"structure","required":["TableName"],"members":{"TableName":{}}},"output":{"type":"structure","members":{"TimeToLiveDescription":{"shape":"S3b"}}}},"GetItem":{"input":{"type":"structure","required":["TableName","Key"],"members":{"TableName":{},"Key":{"shape":"S6"},"AttributesToGet":{"shape":"Sj"},"ConsistentRead":{"type":"boolean"},"ReturnConsumedCapacity":{},"ProjectionExpression":{},"ExpressionAttributeNames":{"shape":"Sm"}}},"output":{"type":"structure","members":{"Item":{"shape":"Ss"},"ConsumedCapacity":{"shape":"Su"}}}},"ListBackups":{"input":{"type":"structure","members":{"TableName":{},"Limit":{"type":"integer"},"TimeRangeLowerBound":{"type":"timestamp"},"TimeRangeUpperBound":{"type":"timestamp"},"ExclusiveStartBackupArn":{}}},"output":{"type":"structure","members":{"BackupSummaries":{"type":"list","member":{"type":"structure","members":{"TableName":{},"TableId":{},"TableArn":{},"BackupArn":{},"BackupName":{},"BackupCreationDateTime":{"type":"timestamp"},"BackupStatus":{},"BackupSizeBytes":{"type":"long"}}}},"LastEvaluatedBackupArn":{}}}},"ListGlobalTables":{"input":{"type":"structure","members":{"ExclusiveStartGlobalTableName":{},"Limit":{"type":"integer"},"RegionName":{}}},"output":{"type":"structure","members":{"GlobalTables":{"type":"list","member":{"type":"structure","members":{"GlobalTableName":{},"ReplicationGroup":{"shape":"S1n"}}}},"LastEvaluatedGlobalTableName":{}}}},"ListTables":{"input":{"type":"structure","members":{"ExclusiveStartTableName":{},"Limit":{"type":"integer"}}},"output":{"type":"structure","members":{"TableNames":{"type":"list","member":{}},"LastEvaluatedTableName":{}}}},"ListTagsOfResource":{"input":{"type":"structure","required":["ResourceArn"],"members":{"ResourceArn":{},"NextToken":{}}},"output":{"type":"structure","members":{"Tags":{"shape":"S4s"},"NextToken":{}}}},"PutItem":{"input":{"type":"structure","required":["TableName","Item"],"members":{"TableName":{},"Item":{"shape":"S14"},"Expected":{"shape":"S3f"},"ReturnValues":{},"ReturnConsumedCapacity":{},"ReturnItemCollectionMetrics":{},"ConditionalOperator":{},"ConditionExpression":{},"ExpressionAttributeNames":{"shape":"Sm"},"ExpressionAttributeValues":{"shape":"S3n"}}},"output":{"type":"structure","members":{"Attributes":{"shape":"Ss"},"ConsumedCapacity":{"shape":"Su"},"ItemCollectionMetrics":{"shape":"S1a"}}}},"Query":{"input":{"type":"structure","required":["TableName"],"members":{"TableName":{},"IndexName":{},"Select":{},"AttributesToGet":{"shape":"Sj"},"Limit":{"type":"integer"},"ConsistentRead":{"type":"boolean"},"KeyConditions":{"type":"map","key":{},"value":{"shape":"S51"}},"QueryFilter":{"shape":"S52"},"ConditionalOperator":{},"ScanIndexForward":{"type":"boolean"},"ExclusiveStartKey":{"shape":"S6"},"ReturnConsumedCapacity":{},"ProjectionExpression":{},"FilterExpression":{},"KeyConditionExpression":{},"ExpressionAttributeNames":{"shape":"Sm"},"ExpressionAttributeValues":{"shape":"S3n"}}},"output":{"type":"structure","members":{"Items":{"shape":"Sr"},"Count":{"type":"integer"},"ScannedCount":{"type":"integer"},"LastEvaluatedKey":{"shape":"S6"},"ConsumedCapacity":{"shape":"Su"}}}},"RestoreTableFromBackup":{"input":{"type":"structure","required":["TargetTableName","BackupArn"],"members":{"TargetTableName":{},"BackupArn":{}}},"output":{"type":"structure","members":{"TableDescription":{"shape":"S2j"}}}},"Scan":{"input":{"type":"structure","required":["TableName"],"members":{"TableName":{},"IndexName":{},"AttributesToGet":{"shape":"Sj"},"Limit":{"type":"integer"},"Select":{},"ScanFilter":{"shape":"S52"},"ConditionalOperator":{},"ExclusiveStartKey":{"shape":"S6"},"ReturnConsumedCapacity":{},"TotalSegments":{"type":"integer"},"Segment":{"type":"integer"},"ProjectionExpression":{},"FilterExpression":{},"ExpressionAttributeNames":{"shape":"Sm"},"ExpressionAttributeValues":{"shape":"S3n"},"ConsistentRead":{"type":"boolean"}}},"output":{"type":"structure","members":{"Items":{"shape":"Sr"},"Count":{"type":"integer"},"ScannedCount":{"type":"integer"},"LastEvaluatedKey":{"shape":"S6"},"ConsumedCapacity":{"shape":"Su"}}}},"TagResource":{"input":{"type":"structure","required":["ResourceArn","Tags"],"members":{"ResourceArn":{},"Tags":{"shape":"S4s"}}}},"UntagResource":{"input":{"type":"structure","required":["ResourceArn","TagKeys"],"members":{"ResourceArn":{},"TagKeys":{"type":"list","member":{}}}}},"UpdateGlobalTable":{"input":{"type":"structure","required":["GlobalTableName","ReplicaUpdates"],"members":{"GlobalTableName":{},"ReplicaUpdates":{"type":"list","member":{"type":"structure","members":{"Create":{"type":"structure","required":["RegionName"],"members":{"RegionName":{}}},"Delete":{"type":"structure","required":["RegionName"],"members":{"RegionName":{}}}}}}}},"output":{"type":"structure","members":{"GlobalTableDescription":{"shape":"S1r"}}}},"UpdateItem":{"input":{"type":"structure","required":["TableName","Key"],"members":{"TableName":{},"Key":{"shape":"S6"},"AttributeUpdates":{"type":"map","key":{},"value":{"type":"structure","members":{"Value":{"shape":"S8"},"Action":{}}}},"Expected":{"shape":"S3f"},"ConditionalOperator":{},"ReturnValues":{},"ReturnConsumedCapacity":{},"ReturnItemCollectionMetrics":{},"UpdateExpression":{},"ConditionExpression":{},"ExpressionAttributeNames":{"shape":"Sm"},"ExpressionAttributeValues":{"shape":"S3n"}}},"output":{"type":"structure","members":{"Attributes":{"shape":"Ss"},"ConsumedCapacity":{"shape":"Su"},"ItemCollectionMetrics":{"shape":"S1a"}}}},"UpdateTable":{"input":{"type":"structure","required":["TableName"],"members":{"AttributeDefinitions":{"shape":"S1y"},"TableName":{},"ProvisionedThroughput":{"shape":"S2d"},"GlobalSecondaryIndexUpdates":{"type":"list","member":{"type":"structure","members":{"Update":{"type":"structure","required":["IndexName","ProvisionedThroughput"],"members":{"IndexName":{},"ProvisionedThroughput":{"shape":"S2d"}}},"Create":{"type":"structure","required":["IndexName","KeySchema","Projection","ProvisionedThroughput"],"members":{"IndexName":{},"KeySchema":{"shape":"S22"},"Projection":{"shape":"S27"},"ProvisionedThroughput":{"shape":"S2d"}}},"Delete":{"type":"structure","required":["IndexName"],"members":{"IndexName":{}}}}}},"StreamSpecification":{"shape":"S2f"}}},"output":{"type":"structure","members":{"TableDescription":{"shape":"S2j"}}}},"UpdateTimeToLive":{"input":{"type":"structure","required":["TableName","TimeToLiveSpecification"],"members":{"TableName":{},"TimeToLiveSpecification":{"shape":"S5z"}}},"output":{"type":"structure","members":{"TimeToLiveSpecification":{"shape":"S5z"}}}}};
var shapes$3 = {"S2":{"type":"map","key":{},"value":{"type":"structure","required":["Keys"],"members":{"Keys":{"type":"list","member":{"shape":"S6"}},"AttributesToGet":{"shape":"Sj"},"ConsistentRead":{"type":"boolean"},"ProjectionExpression":{},"ExpressionAttributeNames":{"shape":"Sm"}}}},"S6":{"type":"map","key":{},"value":{"shape":"S8"}},"S8":{"type":"structure","members":{"S":{},"N":{},"B":{"type":"blob"},"SS":{"type":"list","member":{}},"NS":{"type":"list","member":{}},"BS":{"type":"list","member":{"type":"blob"}},"M":{"type":"map","key":{},"value":{"shape":"S8"}},"L":{"type":"list","member":{"shape":"S8"}},"NULL":{"type":"boolean"},"BOOL":{"type":"boolean"}}},"Sj":{"type":"list","member":{}},"Sm":{"type":"map","key":{},"value":{}},"Sr":{"type":"list","member":{"shape":"Ss"}},"Ss":{"type":"map","key":{},"value":{"shape":"S8"}},"St":{"type":"list","member":{"shape":"Su"}},"Su":{"type":"structure","members":{"TableName":{},"CapacityUnits":{"type":"double"},"Table":{"shape":"Sw"},"LocalSecondaryIndexes":{"shape":"Sx"},"GlobalSecondaryIndexes":{"shape":"Sx"}}},"Sw":{"type":"structure","members":{"CapacityUnits":{"type":"double"}}},"Sx":{"type":"map","key":{},"value":{"shape":"Sw"}},"S10":{"type":"map","key":{},"value":{"type":"list","member":{"type":"structure","members":{"PutRequest":{"type":"structure","required":["Item"],"members":{"Item":{"shape":"S14"}}},"DeleteRequest":{"type":"structure","required":["Key"],"members":{"Key":{"shape":"S6"}}}}}}},"S14":{"type":"map","key":{},"value":{"shape":"S8"}},"S1a":{"type":"structure","members":{"ItemCollectionKey":{"type":"map","key":{},"value":{"shape":"S8"}},"SizeEstimateRangeGB":{"type":"list","member":{"type":"double"}}}},"S1h":{"type":"structure","required":["BackupArn","BackupName","BackupStatus","BackupCreationDateTime"],"members":{"BackupArn":{},"BackupName":{},"BackupSizeBytes":{"type":"long"},"BackupStatus":{},"BackupCreationDateTime":{"type":"timestamp"}}},"S1n":{"type":"list","member":{"type":"structure","members":{"RegionName":{}}}},"S1r":{"type":"structure","members":{"ReplicationGroup":{"type":"list","member":{"type":"structure","members":{"RegionName":{}}}},"GlobalTableArn":{},"CreationDateTime":{"type":"timestamp"},"GlobalTableStatus":{},"GlobalTableName":{}}},"S1y":{"type":"list","member":{"type":"structure","required":["AttributeName","AttributeType"],"members":{"AttributeName":{},"AttributeType":{}}}},"S22":{"type":"list","member":{"type":"structure","required":["AttributeName","KeyType"],"members":{"AttributeName":{},"KeyType":{}}}},"S27":{"type":"structure","members":{"ProjectionType":{},"NonKeyAttributes":{"type":"list","member":{}}}},"S2d":{"type":"structure","required":["ReadCapacityUnits","WriteCapacityUnits"],"members":{"ReadCapacityUnits":{"type":"long"},"WriteCapacityUnits":{"type":"long"}}},"S2f":{"type":"structure","members":{"StreamEnabled":{"type":"boolean"},"StreamViewType":{}}},"S2j":{"type":"structure","members":{"AttributeDefinitions":{"shape":"S1y"},"TableName":{},"KeySchema":{"shape":"S22"},"TableStatus":{},"CreationDateTime":{"type":"timestamp"},"ProvisionedThroughput":{"shape":"S2l"},"TableSizeBytes":{"type":"long"},"ItemCount":{"type":"long"},"TableArn":{},"TableId":{},"LocalSecondaryIndexes":{"type":"list","member":{"type":"structure","members":{"IndexName":{},"KeySchema":{"shape":"S22"},"Projection":{"shape":"S27"},"IndexSizeBytes":{"type":"long"},"ItemCount":{"type":"long"},"IndexArn":{}}}},"GlobalSecondaryIndexes":{"type":"list","member":{"type":"structure","members":{"IndexName":{},"KeySchema":{"shape":"S22"},"Projection":{"shape":"S27"},"IndexStatus":{},"Backfilling":{"type":"boolean"},"ProvisionedThroughput":{"shape":"S2l"},"IndexSizeBytes":{"type":"long"},"ItemCount":{"type":"long"},"IndexArn":{}}}},"StreamSpecification":{"shape":"S2f"},"LatestStreamLabel":{},"LatestStreamArn":{},"RestoreSummary":{"type":"structure","required":["RestoreDateTime","RestoreInProgress"],"members":{"SourceBackupArn":{},"SourceTableArn":{},"RestoreDateTime":{"type":"timestamp"},"RestoreInProgress":{"type":"boolean"}}}}},"S2l":{"type":"structure","members":{"LastIncreaseDateTime":{"type":"timestamp"},"LastDecreaseDateTime":{"type":"timestamp"},"NumberOfDecreasesToday":{"type":"long"},"ReadCapacityUnits":{"type":"long"},"WriteCapacityUnits":{"type":"long"}}},"S32":{"type":"structure","members":{"BackupDetails":{"shape":"S1h"},"SourceTableDetails":{"type":"structure","required":["TableName","TableId","KeySchema","TableCreationDateTime","ProvisionedThroughput"],"members":{"TableName":{},"TableId":{},"TableArn":{},"TableSizeBytes":{"type":"long"},"KeySchema":{"shape":"S22"},"TableCreationDateTime":{"type":"timestamp"},"ProvisionedThroughput":{"shape":"S2d"},"ItemCount":{"type":"long"}}},"SourceTableFeatureDetails":{"type":"structure","members":{"LocalSecondaryIndexes":{"type":"list","member":{"type":"structure","members":{"IndexName":{},"KeySchema":{"shape":"S22"},"Projection":{"shape":"S27"}}}},"GlobalSecondaryIndexes":{"type":"list","member":{"type":"structure","members":{"IndexName":{},"KeySchema":{"shape":"S22"},"Projection":{"shape":"S27"},"ProvisionedThroughput":{"shape":"S2d"}}}},"StreamDescription":{"shape":"S2f"},"TimeToLiveDescription":{"shape":"S3b"}}}}},"S3b":{"type":"structure","members":{"TimeToLiveStatus":{},"AttributeName":{}}},"S3f":{"type":"map","key":{},"value":{"type":"structure","members":{"Value":{"shape":"S8"},"Exists":{"type":"boolean"},"ComparisonOperator":{},"AttributeValueList":{"shape":"S3j"}}}},"S3j":{"type":"list","member":{"shape":"S8"}},"S3n":{"type":"map","key":{},"value":{"shape":"S8"}},"S4s":{"type":"list","member":{"type":"structure","required":["Key","Value"],"members":{"Key":{},"Value":{}}}},"S51":{"type":"structure","required":["ComparisonOperator"],"members":{"AttributeValueList":{"shape":"S3j"},"ComparisonOperator":{}}},"S52":{"type":"map","key":{},"value":{"shape":"S51"}},"S5z":{"type":"structure","required":["Enabled","AttributeName"],"members":{"Enabled":{"type":"boolean"},"AttributeName":{}}}};
var dynamodb20120810_min = {
	version: version$4,
	metadata: metadata$5,
	operations: operations$3,
	shapes: shapes$3
};

var dynamodb20120810_min$1 = Object.freeze({
	version: version$4,
	metadata: metadata$5,
	operations: operations$3,
	shapes: shapes$3,
	default: dynamodb20120810_min
});

var pagination$3 = {"BatchGetItem":{"input_token":"RequestItems","output_token":"UnprocessedKeys"},"ListTables":{"input_token":"ExclusiveStartTableName","limit_key":"Limit","output_token":"LastEvaluatedTableName","result_key":"TableNames"},"Query":{"input_token":"ExclusiveStartKey","limit_key":"Limit","output_token":"LastEvaluatedKey","result_key":"Items"},"Scan":{"input_token":"ExclusiveStartKey","limit_key":"Limit","output_token":"LastEvaluatedKey","result_key":"Items"}};
var dynamodb20120810_paginators = {
	pagination: pagination$3
};

var dynamodb20120810_paginators$1 = Object.freeze({
	pagination: pagination$3,
	default: dynamodb20120810_paginators
});

var version$5 = 2;
var waiters$1 = {"TableExists":{"delay":20,"operation":"DescribeTable","maxAttempts":25,"acceptors":[{"expected":"ACTIVE","matcher":"path","state":"success","argument":"Table.TableStatus"},{"expected":"ResourceNotFoundException","matcher":"error","state":"retry"}]},"TableNotExists":{"delay":20,"operation":"DescribeTable","maxAttempts":25,"acceptors":[{"expected":"ResourceNotFoundException","matcher":"error","state":"success"}]}};
var dynamodb20120810_waiters2 = {
	version: version$5,
	waiters: waiters$1
};

var dynamodb20120810_waiters2$1 = Object.freeze({
	version: version$5,
	waiters: waiters$1,
	default: dynamodb20120810_waiters2
});

var require$$2$10 = ( dynamodb20111205_min$1 && dynamodb20111205_min ) || dynamodb20111205_min$1;

var require$$3$8 = ( dynamodb20111205_paginators$1 && dynamodb20111205_paginators ) || dynamodb20111205_paginators$1;

var require$$4$4 = ( dynamodb20111205_waiters2$1 && dynamodb20111205_waiters2 ) || dynamodb20111205_waiters2$1;

var require$$5$5 = ( dynamodb20120810_min$1 && dynamodb20120810_min ) || dynamodb20120810_min$1;

var require$$6$3 = ( dynamodb20120810_paginators$1 && dynamodb20120810_paginators ) || dynamodb20120810_paginators$1;

var require$$7$2 = ( dynamodb20120810_waiters2$1 && dynamodb20120810_waiters2 ) || dynamodb20120810_waiters2$1;

var Service = core.Service;
var apiLoader = core.apiLoader;

apiLoader.services['dynamodb'] = {};
core.DynamoDB = Service.defineService('dynamodb', ['2011-12-05', '2012-08-10']);

Object.defineProperty(apiLoader.services['dynamodb'], '2011-12-05', {
  get: function get() {
    var model = require$$2$10;
    model.paginators = require$$3$8.pagination;
    model.waiters = require$$4$4.waiters;
    return model;
  },
  enumerable: true,
  configurable: true
});
Object.defineProperty(apiLoader.services['dynamodb'], '2012-08-10', {
  get: function get() {
    var model = require$$5$5;
    model.paginators = require$$6$3.pagination;
    model.waiters = require$$7$2.waiters;
    return model;
  },
  enumerable: true,
  configurable: true
});

var dynamodb = core.DynamoDB;

var dynamodb_1 = dynamodb.DocumentClient;

var DynamoDbRepositoryImplementation = /** @class */ (function () {
    function DynamoDbRepositoryImplementation(caracteristics, dynamoDbClient) {
        if (dynamoDbClient === void 0) { dynamoDbClient = new dynamodb_1({ region: process.env.AWS_REGION }); }
        this.caracteristics = caracteristics;
        this.dynamoDbClient = dynamoDbClient;
    }
    Object.defineProperty(DynamoDbRepositoryImplementation.prototype, "tableName", {
        get: function () {
            return this.caracteristics.tableName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamoDbRepositoryImplementation.prototype, "keyName", {
        get: function () {
            return this.caracteristics.keyName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamoDbRepositoryImplementation.prototype, "readCapacity", {
        get: function () {
            return this.caracteristics.readCapacity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamoDbRepositoryImplementation.prototype, "writeCapacity", {
        get: function () {
            return this.caracteristics.writeCapacity;
        },
        enumerable: true,
        configurable: true
    });
    DynamoDbRepositoryImplementation.prototype.findAll = function () {
        var scanParams = {
            TableName: this.tableName
        };
        return this.dynamoDbClient.scan(scanParams)
            .promise()
            .then(function (scanResult) { return scanResult.Items; });
    };
    DynamoDbRepositoryImplementation.prototype.findById = function (id) {
        var getParams = {
            TableName: this.tableName,
        };
        getParams.Key = {};
        getParams.Key[this.keyName] = id;
        return this.dynamoDbClient.get(getParams)
            .promise()
            .then(function (getResult) { return getResult.Item; });
    };
    DynamoDbRepositoryImplementation.prototype.findBy = function (field, value) {
        var scanParams = {
            TableName: this.tableName
        };
        scanParams.ScanFilter = {};
        scanParams.ScanFilter[field] = {
            ComparisonOperator: 'EQ',
            AttributeValueList: [value]
        };
        return this.dynamoDbClient.scan(scanParams)
            .promise()
            .then(function (queryResult) { return queryResult.Items; });
    };
    DynamoDbRepositoryImplementation.prototype.save = function (entity) {
        var putParams = {
            TableName: this.tableName,
            Item: entity
        };
        return this.dynamoDbClient.put(putParams).promise();
    };
    DynamoDbRepositoryImplementation.prototype.deleteById = function (id) {
        var deleteParams = {
            TableName: this.tableName
        };
        deleteParams.Key = {};
        deleteParams.Key[this.keyName] = id;
        return this.dynamoDbClient.delete(deleteParams).promise();
    };
    DynamoDbRepositoryImplementation.prototype.deleteAll = function () {
        var _this = this;
        return this.findAll()
            .then(function (items) { return Promise.all(items.map(function (item) { return _this.deleteById(item[_this.keyName]); })); });
    };
    return DynamoDbRepositoryImplementation;
}());

var DynamoDbRepositoryProxy = /** @class */ (function () {
    function DynamoDbRepositoryProxy(dynamoDbRepository, dynamoDbClient) {
        if (dynamoDbClient === void 0) { dynamoDbClient = new dynamodb({ region: process.env.AWS_REGION }); }
        this.dynamoDbRepository = dynamoDbRepository;
        this.dynamoDbClient = dynamoDbClient;
    }
    DynamoDbRepositoryProxy.prototype.createIfNotExists = function () {
        var _this = this;
        var createTableParams = {
            TableName: this.dynamoDbRepository.tableName,
            AttributeDefinitions: [{
                    AttributeName: this.dynamoDbRepository.keyName,
                    AttributeType: 'S'
                }],
            KeySchema: [{
                    AttributeName: this.dynamoDbRepository.keyName,
                    KeyType: 'HASH'
                }],
            ProvisionedThroughput: {
                ReadCapacityUnits: this.dynamoDbRepository.readCapacity,
                WriteCapacityUnits: this.dynamoDbRepository.writeCapacity
            }
        };
        return this.dynamoDbClient.listTables().promise()
            .then(function (results) {
            if (results.TableNames.some(function (name) { return _this.dynamoDbRepository.tableName === name; })) {
                return Promise.resolve({});
            }
            else {
                return _this.dynamoDbClient.createTable(createTableParams).promise()
                    .then(function () { return _this.dynamoDbClient.waitFor('tableExists', { TableName: _this.dynamoDbRepository.tableName }).promise(); });
            }
        });
    };
    DynamoDbRepositoryProxy.prototype.findAll = function () {
        var _this = this;
        return this.createIfNotExists()
            .then(function () { return _this.dynamoDbRepository.findAll(); });
    };
    DynamoDbRepositoryProxy.prototype.findById = function (id) {
        var _this = this;
        return this.createIfNotExists()
            .then(function () { return _this.dynamoDbRepository.findById(id); });
    };
    DynamoDbRepositoryProxy.prototype.findBy = function (field, value) {
        var _this = this;
        return this.createIfNotExists()
            .then(function () { return _this.dynamoDbRepository.findBy(field, value); });
    };
    DynamoDbRepositoryProxy.prototype.save = function (entity) {
        var _this = this;
        return this.createIfNotExists()
            .then(function () { return _this.dynamoDbRepository.save(entity); });
    };
    DynamoDbRepositoryProxy.prototype.deleteById = function (id) {
        var _this = this;
        return this.createIfNotExists()
            .then(function () { return _this.dynamoDbRepository.deleteById(id); });
    };
    DynamoDbRepositoryProxy.prototype.deleteAll = function () {
        var _this = this;
        return this.createIfNotExists()
            .then(function () { return _this.dynamoDbRepository.deleteAll(); });
    };
    return DynamoDbRepositoryProxy;
}());

var DynamoDbBuilder = /** @class */ (function () {
    function DynamoDbBuilder() {
        this.keyName = 'id';
        this.readCapacity = 1;
        this.writeCapacity = 1;
        this.mustCreateBeforeUse = false;
    }
    DynamoDbBuilder.prototype.withTableName = function (tableName) {
        this.tableName = tableName;
        return this;
    };
    DynamoDbBuilder.prototype.withKeyName = function (keyname) {
        this.keyName = keyname;
        return this;
    };
    DynamoDbBuilder.prototype.withReadCapacity = function (readCapacity) {
        this.readCapacity = readCapacity;
        return this;
    };
    DynamoDbBuilder.prototype.withWriteCapacity = function (writeCapacity) {
        this.writeCapacity = writeCapacity;
        return this;
    };
    DynamoDbBuilder.prototype.createIfNotExists = function () {
        this.mustCreateBeforeUse = true;
        return this;
    };
    DynamoDbBuilder.prototype.build = function () {
        if (!process.env.AWS_REGION) {
            throw new Error('AWS_REGION environment variable must be set');
        }
        if (!this.tableName) {
            throw new Error('Table name is mandatory');
        }
        if (this.mustCreateBeforeUse) {
            return new DynamoDbRepositoryProxy(new DynamoDbRepositoryImplementation({
                tableName: this.tableName,
                keyName: this.keyName,
                readCapacity: this.readCapacity,
                writeCapacity: this.writeCapacity
            }));
        }
        return new DynamoDbRepositoryImplementation({
            tableName: this.tableName,
            keyName: this.keyName,
            readCapacity: this.readCapacity,
            writeCapacity: this.writeCapacity
        });
    };
    return DynamoDbBuilder;
}());

var byteLength = core.util.string.byteLength;
var Buffer$1 = core.util.Buffer;

/**
 * The managed uploader allows for easy and efficient uploading of buffers,
 * blobs, or streams, using a configurable amount of concurrency to perform
 * multipart uploads where possible. This abstraction also enables uploading
 * streams of unknown size due to the use of multipart uploads.
 *
 * To construct a managed upload object, see the {constructor} function.
 *
 * ## Tracking upload progress
 *
 * The managed upload object can also track progress by attaching an
 * 'httpUploadProgress' listener to the upload manager. This event is similar
 * to {AWS.Request~httpUploadProgress} but groups all concurrent upload progress
 * into a single event. See {AWS.S3.ManagedUpload~httpUploadProgress} for more
 * information.
 *
 * ## Handling Multipart Cleanup
 *
 * By default, this class will automatically clean up any multipart uploads
 * when an individual part upload fails. This behavior can be disabled in order
 * to manually handle failures by setting the `leavePartsOnError` configuration
 * option to `true` when initializing the upload object.
 *
 * @!event httpUploadProgress(progress)
 *   Triggered when the uploader has uploaded more data.
 *   @note The `total` property may not be set if the stream being uploaded has
 *     not yet finished chunking. In this case the `total` will be undefined
 *     until the total stream size is known.
 *   @note This event will not be emitted in Node.js 0.8.x.
 *   @param progress [map] An object containing the `loaded` and `total` bytes
 *     of the request and the `key` of the S3 object. Note that `total` may be undefined until the payload
 *     size is known.
 *   @context (see AWS.Request~send)
 */
core.S3.ManagedUpload = core.util.inherit({
  /**
   * Creates a managed upload object with a set of configuration options.
   *
   * @note A "Body" parameter is required to be set prior to calling {send}.
   * @option options params [map] a map of parameters to pass to the upload
   *   requests. The "Body" parameter is required to be specified either on
   *   the service or in the params option.
   * @note ContentMD5 should not be provided when using the managed upload object.
   *   Instead, setting "computeChecksums" to true will enable automatic ContentMD5 generation
   *   by the managed upload object.
   * @option options queueSize [Number] (4) the size of the concurrent queue
   *   manager to upload parts in parallel. Set to 1 for synchronous uploading
   *   of parts. Note that the uploader will buffer at most queueSize * partSize
   *   bytes into memory at any given time.
   * @option options partSize [Number] (5mb) the size in bytes for each
   *   individual part to be uploaded. Adjust the part size to ensure the number
   *   of parts does not exceed {maxTotalParts}. See {minPartSize} for the
   *   minimum allowed part size.
   * @option options leavePartsOnError [Boolean] (false) whether to abort the
   *   multipart upload if an error occurs. Set to true if you want to handle
   *   failures manually.
   * @option options service [AWS.S3] an optional S3 service object to use for
   *   requests. This object might have bound parameters used by the uploader.
   * @option options tags [Array<map>] The tags to apply to the uploaded object.
   *   Each tag should have a `Key` and `Value` keys.
   * @example Creating a default uploader for a stream object
   *   var upload = new AWS.S3.ManagedUpload({
   *     params: {Bucket: 'bucket', Key: 'key', Body: stream}
   *   });
   * @example Creating an uploader with concurrency of 1 and partSize of 10mb
   *   var upload = new AWS.S3.ManagedUpload({
   *     partSize: 10 * 1024 * 1024, queueSize: 1,
   *     params: {Bucket: 'bucket', Key: 'key', Body: stream}
   *   });
   * @example Creating an uploader with tags
   *   var upload = new AWS.S3.ManagedUpload({
   *     params: {Bucket: 'bucket', Key: 'key', Body: stream},
   *     tags: [{Key: 'tag1', Value: 'value1'}, {Key: 'tag2', Value: 'value2'}]
   *   });
   * @see send
   */
  constructor: function ManagedUpload(options) {
    var self = this;
    core.SequentialExecutor.call(self);
    self.body = null;
    self.sliceFn = null;
    self.callback = null;
    self.parts = {};
    self.completeInfo = [];
    self.fillQueue = function() {
      self.callback(new Error('Unsupported body payload ' + typeof self.body));
    };

    self.configure(options);
  },

  /**
   * @api private
   */
  configure: function configure(options) {
    options = options || {};
    this.partSize = this.minPartSize;

    if (options.queueSize) this.queueSize = options.queueSize;
    if (options.partSize) this.partSize = options.partSize;
    if (options.leavePartsOnError) this.leavePartsOnError = true;
    if (options.tags) {
      if (!Array.isArray(options.tags)) {
        throw new Error('Tags must be specified as an array; ' +
          typeof options.tags + ' provided.');
      }
      this.tags = options.tags;
    }

    if (this.partSize < this.minPartSize) {
      throw new Error('partSize must be greater than ' +
                      this.minPartSize);
    }

    this.service = options.service;
    this.bindServiceObject(options.params);
    this.validateBody();
    this.adjustTotalBytes();
  },

  /**
   * @api private
   */
  leavePartsOnError: false,

  /**
   * @api private
   */
  queueSize: 4,

  /**
   * @api private
   */
  partSize: null,

  /**
   * @readonly
   * @return [Number] the minimum number of bytes for an individual part
   *   upload.
   */
  minPartSize: 1024 * 1024 * 5,

  /**
   * @readonly
   * @return [Number] the maximum allowed number of parts in a multipart upload.
   */
  maxTotalParts: 10000,

  /**
   * Initiates the managed upload for the payload.
   *
   * @callback callback function(err, data)
   *   @param err [Error] an error or null if no error occurred.
   *   @param data [map] The response data from the successful upload:
   *     * `Location` (String) the URL of the uploaded object
   *     * `ETag` (String) the ETag of the uploaded object
   *     * `Bucket` (String) the bucket to which the object was uploaded
   *     * `Key` (String) the key to which the object was uploaded
   * @example Sending a managed upload object
   *   var params = {Bucket: 'bucket', Key: 'key', Body: stream};
   *   var upload = new AWS.S3.ManagedUpload({params: params});
   *   upload.send(function(err, data) {
   *     console.log(err, data);
   *   });
   */
  send: function(callback) {
    var self = this;
    self.failed = false;
    self.callback = callback || function(err) { if (err) throw err; };

    var runFill = true;
    if (self.sliceFn) {
      self.fillQueue = self.fillBuffer;
    } else if (core.util.isNode()) {
      var Stream = core.util.stream.Stream;
      if (self.body instanceof Stream) {
        runFill = false;
        self.fillQueue = self.fillStream;
        self.partBuffers = [];
        self.body.
          on('error', function(err) { self.cleanup(err); }).
          on('readable', function() { self.fillQueue(); }).
          on('end', function() {
            self.isDoneChunking = true;
            self.numParts = self.totalPartNumbers;
            self.fillQueue.call(self);

            if (self.isDoneChunking && self.totalPartNumbers >= 1 && self.doneParts === self.numParts) {
              self.finishMultiPart();
            }
          });
      }
    }

    if (runFill) self.fillQueue.call(self);
  },

  /**
   * @!method  promise()
   *   Returns a 'thenable' promise.
   *
   *   Two callbacks can be provided to the `then` method on the returned promise.
   *   The first callback will be called if the promise is fulfilled, and the second
   *   callback will be called if the promise is rejected.
   *   @callback fulfilledCallback function(data)
   *     Called if the promise is fulfilled.
   *     @param data [map] The response data from the successful upload:
   *       `Location` (String) the URL of the uploaded object
   *       `ETag` (String) the ETag of the uploaded object
   *       `Bucket` (String) the bucket to which the object was uploaded
   *       `Key` (String) the key to which the object was uploaded
   *   @callback rejectedCallback function(err)
   *     Called if the promise is rejected.
   *     @param err [Error] an error or null if no error occurred.
   *   @return [Promise] A promise that represents the state of the upload request.
   *   @example Sending an upload request using promises.
   *     var upload = s3.upload({Bucket: 'bucket', Key: 'key', Body: stream});
   *     var promise = upload.promise();
   *     promise.then(function(data) { ... }, function(err) { ... });
   */

  /**
   * Aborts a managed upload, including all concurrent upload requests.
   * @note By default, calling this function will cleanup a multipart upload
   *   if one was created. To leave the multipart upload around after aborting
   *   a request, configure `leavePartsOnError` to `true` in the {constructor}.
   * @note Calling {abort} in the browser environment will not abort any requests
   *   that are already in flight. If a multipart upload was created, any parts
   *   not yet uploaded will not be sent, and the multipart upload will be cleaned up.
   * @example Aborting an upload
   *   var params = {
   *     Bucket: 'bucket', Key: 'key',
   *     Body: new Buffer(1024 * 1024 * 25) // 25MB payload
   *   };
   *   var upload = s3.upload(params);
   *   upload.send(function (err, data) {
   *     if (err) console.log("Error:", err.code, err.message);
   *     else console.log(data);
   *   });
   *
   *   // abort request in 1 second
   *   setTimeout(upload.abort.bind(upload), 1000);
   */
  abort: function() {
    this.cleanup(core.util.error(new Error('Request aborted by user'), {
      code: 'RequestAbortedError', retryable: false
    }));
  },

  /**
   * @api private
   */
  validateBody: function validateBody() {
    var self = this;
    self.body = self.service.config.params.Body;
    if (typeof self.body === 'string') {
      self.body = new core.util.Buffer(self.body);
    } else if (!self.body) {
      throw new Error('params.Body is required');
    }
    self.sliceFn = core.util.arraySliceFn(self.body);
  },

  /**
   * @api private
   */
  bindServiceObject: function bindServiceObject(params) {
    params = params || {};
    var self = this;
    // bind parameters to new service object
    if (!self.service) {
      self.service = new core.S3({params: params});
    } else {
      var service = self.service;
      var config = core.util.copy(service.config);
      config.signatureVersion = service.getSignatureVersion();
      self.service = new service.constructor.__super__(config);
      self.service.config.params =
        core.util.merge(self.service.config.params || {}, params);
    }
  },

  /**
   * @api private
   */
  adjustTotalBytes: function adjustTotalBytes() {
    var self = this;
    try { // try to get totalBytes
      self.totalBytes = byteLength(self.body);
    } catch (e) { }

    // try to adjust partSize if we know payload length
    if (self.totalBytes) {
      var newPartSize = Math.ceil(self.totalBytes / self.maxTotalParts);
      if (newPartSize > self.partSize) self.partSize = newPartSize;
    } else {
      self.totalBytes = undefined;
    }
  },

  /**
   * @api private
   */
  isDoneChunking: false,

  /**
   * @api private
   */
  partPos: 0,

  /**
   * @api private
   */
  totalChunkedBytes: 0,

  /**
   * @api private
   */
  totalUploadedBytes: 0,

  /**
   * @api private
   */
  totalBytes: undefined,

  /**
   * @api private
   */
  numParts: 0,

  /**
   * @api private
   */
  totalPartNumbers: 0,

  /**
   * @api private
   */
  activeParts: 0,

  /**
   * @api private
   */
  doneParts: 0,

  /**
   * @api private
   */
  parts: null,

  /**
   * @api private
   */
  completeInfo: null,

  /**
   * @api private
   */
  failed: false,

  /**
   * @api private
   */
  multipartReq: null,

  /**
   * @api private
   */
  partBuffers: null,

  /**
   * @api private
   */
  partBufferLength: 0,

  /**
   * @api private
   */
  fillBuffer: function fillBuffer() {
    var self = this;
    var bodyLen = byteLength(self.body);

    if (bodyLen === 0) {
      self.isDoneChunking = true;
      self.numParts = 1;
      self.nextChunk(self.body);
      return;
    }

    while (self.activeParts < self.queueSize && self.partPos < bodyLen) {
      var endPos = Math.min(self.partPos + self.partSize, bodyLen);
      var buf = self.sliceFn.call(self.body, self.partPos, endPos);
      self.partPos += self.partSize;

      if (byteLength(buf) < self.partSize || self.partPos === bodyLen) {
        self.isDoneChunking = true;
        self.numParts = self.totalPartNumbers + 1;
      }
      self.nextChunk(buf);
    }
  },

  /**
   * @api private
   */
  fillStream: function fillStream() {
    var self = this;
    if (self.activeParts >= self.queueSize) return;

    var buf = self.body.read(self.partSize - self.partBufferLength) ||
              self.body.read();
    if (buf) {
      self.partBuffers.push(buf);
      self.partBufferLength += buf.length;
      self.totalChunkedBytes += buf.length;
    }

    if (self.partBufferLength >= self.partSize) {
      // if we have single buffer we avoid copyfull concat
      var pbuf = self.partBuffers.length === 1 ?
        self.partBuffers[0] : Buffer$1.concat(self.partBuffers);
      self.partBuffers = [];
      self.partBufferLength = 0;

      // if we have more than partSize, push the rest back on the queue
      if (pbuf.length > self.partSize) {
        var rest = pbuf.slice(self.partSize);
        self.partBuffers.push(rest);
        self.partBufferLength += rest.length;
        pbuf = pbuf.slice(0, self.partSize);
      }

      self.nextChunk(pbuf);
    }

    if (self.isDoneChunking && !self.isDoneSending) {
      // if we have single buffer we avoid copyfull concat
      pbuf = self.partBuffers.length === 1 ?
          self.partBuffers[0] : Buffer$1.concat(self.partBuffers);
      self.partBuffers = [];
      self.partBufferLength = 0;
      self.totalBytes = self.totalChunkedBytes;
      self.isDoneSending = true;

      if (self.numParts === 0 || pbuf.length > 0) {
        self.numParts++;
        self.nextChunk(pbuf);
      }
    }

    self.body.read(0);
  },

  /**
   * @api private
   */
  nextChunk: function nextChunk(chunk) {
    var self = this;
    if (self.failed) return null;

    var partNumber = ++self.totalPartNumbers;
    if (self.isDoneChunking && partNumber === 1) {
      var params = {Body: chunk};
      if (this.tags) {
        params.Tagging = this.getTaggingHeader();
      }
      var req = self.service.putObject(params);
      req._managedUpload = self;
      req.on('httpUploadProgress', self.progress).send(self.finishSinglePart);
      return null;
    } else if (self.service.config.params.ContentMD5) {
      var err = core.util.error(new Error('The Content-MD5 you specified is invalid for multi-part uploads.'), {
        code: 'InvalidDigest', retryable: false
      });

      self.cleanup(err);
      return null;
    }

    if (self.completeInfo[partNumber] && self.completeInfo[partNumber].ETag !== null) {
      return null; // Already uploaded this part.
    }

    self.activeParts++;
    if (!self.service.config.params.UploadId) {

      if (!self.multipartReq) { // create multipart
        self.multipartReq = self.service.createMultipartUpload();
        self.multipartReq.on('success', function(resp) {
          self.service.config.params.UploadId = resp.data.UploadId;
          self.multipartReq = null;
        });
        self.queueChunks(chunk, partNumber);
        self.multipartReq.on('error', function(err) {
          self.cleanup(err);
        });
        self.multipartReq.send();
      } else {
        self.queueChunks(chunk, partNumber);
      }
    } else { // multipart is created, just send
      self.uploadPart(chunk, partNumber);
    }
  },

  /**
   * @api private
   */
  getTaggingHeader: function getTaggingHeader() {
    var kvPairStrings = [];
    for (var i = 0; i < this.tags.length; i++) {
      kvPairStrings.push(core.util.uriEscape(this.tags[i].Key) + '=' +
        core.util.uriEscape(this.tags[i].Value));
    }

    return kvPairStrings.join('&');
  },

  /**
   * @api private
   */
  uploadPart: function uploadPart(chunk, partNumber) {
    var self = this;

    var partParams = {
      Body: chunk,
      ContentLength: core.util.string.byteLength(chunk),
      PartNumber: partNumber
    };

    var partInfo = {ETag: null, PartNumber: partNumber};
    self.completeInfo[partNumber] = partInfo;

    var req = self.service.uploadPart(partParams);
    self.parts[partNumber] = req;
    req._lastUploadedBytes = 0;
    req._managedUpload = self;
    req.on('httpUploadProgress', self.progress);
    req.send(function(err, data) {
      delete self.parts[partParams.PartNumber];
      self.activeParts--;

      if (!err && (!data || !data.ETag)) {
        var message = 'No access to ETag property on response.';
        if (core.util.isBrowser()) {
          message += ' Check CORS configuration to expose ETag header.';
        }

        err = core.util.error(new Error(message), {
          code: 'ETagMissing', retryable: false
        });
      }
      if (err) return self.cleanup(err);

      partInfo.ETag = data.ETag;
      self.doneParts++;
      if (self.isDoneChunking && self.doneParts === self.numParts) {
        self.finishMultiPart();
      } else {
        self.fillQueue.call(self);
      }
    });
  },

  /**
   * @api private
   */
  queueChunks: function queueChunks(chunk, partNumber) {
    var self = this;
    self.multipartReq.on('success', function() {
      self.uploadPart(chunk, partNumber);
    });
  },

  /**
   * @api private
   */
  cleanup: function cleanup(err) {
    var self = this;
    if (self.failed) return;

    // clean up stream
    if (typeof self.body.removeAllListeners === 'function' &&
        typeof self.body.resume === 'function') {
      self.body.removeAllListeners('readable');
      self.body.removeAllListeners('end');
      self.body.resume();
    }

    // cleanup multipartReq listeners
    if (self.multipartReq) {
      self.multipartReq.removeAllListeners('success');
      self.multipartReq.removeAllListeners('error');
      self.multipartReq.removeAllListeners('complete');
      delete self.multipartReq;
    }

    if (self.service.config.params.UploadId && !self.leavePartsOnError) {
      self.service.abortMultipartUpload().send();
    } else if (self.leavePartsOnError) {
      self.isDoneChunking = false;
    }

    core.util.each(self.parts, function(partNumber, part) {
      part.removeAllListeners('complete');
      part.abort();
    });

    self.activeParts = 0;
    self.partPos = 0;
    self.numParts = 0;
    self.totalPartNumbers = 0;
    self.parts = {};
    self.failed = true;
    self.callback(err);
  },

  /**
   * @api private
   */
  finishMultiPart: function finishMultiPart() {
    var self = this;
    var completeParams = { MultipartUpload: { Parts: self.completeInfo.slice(1) } };
    self.service.completeMultipartUpload(completeParams, function(err, data) {
      if (err) {
        return self.cleanup(err);
      }

      if (data && typeof data.Location === 'string') {
        data.Location = data.Location.replace(/%2F/g, '/');
      }

      if (Array.isArray(self.tags)) {
        self.service.putObjectTagging(
          {Tagging: {TagSet: self.tags}},
          function(e, d) {
            if (e) {
              self.callback(e);
            } else {
              self.callback(e, data);
            }
          }
        );
      } else {
        self.callback(err, data);
      }
    });
  },

  /**
   * @api private
   */
  finishSinglePart: function finishSinglePart(err, data) {
    var upload = this.request._managedUpload;
    var httpReq = this.request.httpRequest;
    var endpoint = httpReq.endpoint;
    if (err) return upload.callback(err);
    data.Location =
      [endpoint.protocol, '//', endpoint.host, httpReq.path].join('');
    data.key = this.request.params.Key; // will stay undocumented
    data.Key = this.request.params.Key;
    data.Bucket = this.request.params.Bucket;
    upload.callback(err, data);
  },

  /**
   * @api private
   */
  progress: function progress(info) {
    var upload = this._managedUpload;
    if (this.operation === 'putObject') {
      info.part = 1;
      info.key = this.params.Key;
    } else {
      upload.totalUploadedBytes += info.loaded - this._lastUploadedBytes;
      this._lastUploadedBytes = info.loaded;
      info = {
        loaded: upload.totalUploadedBytes,
        total: upload.totalBytes,
        part: this.params.PartNumber,
        key: this.params.Key
      };
    }
    upload.emit('httpUploadProgress', [info]);
  }
});

core.util.mixin(core.S3.ManagedUpload, core.SequentialExecutor);

/**
 * @api private
 */
core.S3.ManagedUpload.addPromisesToClass = function addPromisesToClass(PromiseDependency) {
  this.prototype.promise = core.util.promisifyMethod('send', PromiseDependency);
};

/**
 * @api private
 */
core.S3.ManagedUpload.deletePromisesFromClass = function deletePromisesFromClass() {
  delete this.prototype.promise;
};

core.util.addPromises(core.S3.ManagedUpload);

var managed_upload = core.S3.ManagedUpload;

// Pull in managed upload extension


/**
 * @api private
 */
var operationsWith200StatusCodeError = {
  'completeMultipartUpload': true,
  'copyObject': true,
  'uploadPartCopy': true
};

/**
 * @api private
 */
 var regionRedirectErrorCodes = [
  'AuthorizationHeaderMalformed', // non-head operations on virtual-hosted global bucket endpoints
  'BadRequest', // head operations on virtual-hosted global bucket endpoints
  'PermanentRedirect', // non-head operations on path-style or regional endpoints
  301 // head operations on path-style or regional endpoints
 ];

core.util.update(core.S3.prototype, {
  /**
   * @api private
   */
  getSignatureVersion: function getSignatureVersion(request) {
    var defaultApiVersion = this.api.signatureVersion;
    var userDefinedVersion = this._originalConfig ? this._originalConfig.signatureVersion : null;
    var regionDefinedVersion = this.config.signatureVersion;
    var isPresigned = request ? request.isPresigned() : false;
    /*
      1) User defined version specified:
        a) always return user defined version
      2) No user defined version specified:
        a) default to lowest version the region supports
        b) If using presigned urls, default to lowest version the region supports
    */
    if (userDefinedVersion) {
      userDefinedVersion = userDefinedVersion === 'v2' ? 's3' : userDefinedVersion;
      return userDefinedVersion;
    }
    if (isPresigned !== true) {
      defaultApiVersion = 'v4';
    } else if (regionDefinedVersion) {
      defaultApiVersion = regionDefinedVersion;
    }
    return defaultApiVersion;
  },

  /**
   * @api private
   */
  getSignerClass: function getSignerClass(request) {
    var signatureVersion = this.getSignatureVersion(request);
    return core.Signers.RequestSigner.getVersion(signatureVersion);
  },

  /**
   * @api private
   */
  validateService: function validateService() {
    var msg;
    var messages = [];

    // default to us-east-1 when no region is provided
    if (!this.config.region) this.config.region = 'us-east-1';

    if (!this.config.endpoint && this.config.s3BucketEndpoint) {
      messages.push('An endpoint must be provided when configuring ' +
                    '`s3BucketEndpoint` to true.');
    }
    if (messages.length === 1) {
      msg = messages[0];
    } else if (messages.length > 1) {
      msg = 'Multiple configuration errors:\n' + messages.join('\n');
    }
    if (msg) {
      throw core.util.error(new Error(),
        {name: 'InvalidEndpoint', message: msg});
    }
  },

  /**
   * @api private
   */
  shouldDisableBodySigning: function shouldDisableBodySigning(request) {
    var signerClass = this.getSignerClass();
    if (this.config.s3DisableBodySigning === true && signerClass === core.Signers.V4
        && request.httpRequest.endpoint.protocol === 'https:') {
      return true;
    }
    return false;
  },

  /**
   * @api private
   */
  setupRequestListeners: function setupRequestListeners(request) {
    request.addListener('validate', this.validateScheme);
    request.addListener('validate', this.validateBucketEndpoint);
    request.addListener('validate', this.correctBucketRegionFromCache);
    request.addListener('validate', this.validateBucketName);
    request.addListener('build', this.addContentType);
    request.addListener('build', this.populateURI);
    request.addListener('build', this.computeContentMd5);
    request.addListener('build', this.computeSseCustomerKeyMd5);
    request.addListener('afterBuild', this.addExpect100Continue);
    request.removeListener('validate',
      core.EventListeners.Core.VALIDATE_REGION);
    request.addListener('extractError', this.extractError);
    request.onAsync('extractError', this.requestBucketRegion);
    request.addListener('extractData', this.extractData);
    request.addListener('extractData', core.util.hoistPayloadMember);
    request.addListener('beforePresign', this.prepareSignedUrl);
    if (core.util.isBrowser()) {
      request.onAsync('retry', this.reqRegionForNetworkingError);
    }
    if (this.shouldDisableBodySigning(request))  {
      request.removeListener('afterBuild', core.EventListeners.Core.COMPUTE_SHA256);
      request.addListener('afterBuild', this.disableBodySigning);
    }
  },

  /**
   * @api private
   */
  validateScheme: function(req) {
    var params = req.params,
        scheme = req.httpRequest.endpoint.protocol,
        sensitive = params.SSECustomerKey || params.CopySourceSSECustomerKey;
    if (sensitive && scheme !== 'https:') {
      var msg = 'Cannot send SSE keys over HTTP. Set \'sslEnabled\'' +
        'to \'true\' in your configuration';
      throw core.util.error(new Error(),
        { code: 'ConfigError', message: msg });
    }
  },

  /**
   * @api private
   */
  validateBucketEndpoint: function(req) {
    if (!req.params.Bucket && req.service.config.s3BucketEndpoint) {
      var msg = 'Cannot send requests to root API with `s3BucketEndpoint` set.';
      throw core.util.error(new Error(),
        { code: 'ConfigError', message: msg });
    }
  },

  /**
   * @api private
   */
  validateBucketName: function validateBucketName(req) {
    var service = req.service;
    var signatureVersion = service.getSignatureVersion(req);
    // Only validate buckets when using sigv4
    if (signatureVersion !== 'v4') {
      return;
    }
    var bucket = req.params && req.params.Bucket;
    var key = req.params && req.params.Key;
    var slashIndex = bucket && bucket.indexOf('/');
    if (bucket && slashIndex >= 0) {
      if (typeof key === 'string') {
        req.params = core.util.copy(req.params);
        // Need to include trailing slash to match sigv2 behavior
        var prefix = bucket.substr(slashIndex + 1) || '';
        req.params.Key = prefix + '/' + key;
        req.params.Bucket = bucket.substr(0, slashIndex);
      } else {
        var msg = 'Bucket names cannot contain forward slashes. Bucket: ' + bucket;
        throw core.util.error(new Error(),
          { code: 'InvalidBucket', message: msg });
      }
    }
  },

  /**
   * @api private
   */
  isValidAccelerateOperation: function isValidAccelerateOperation(operation) {
    var invalidOperations = [
      'createBucket',
      'deleteBucket',
      'listBuckets'
    ];
    return invalidOperations.indexOf(operation) === -1;
  },


  /**
   * S3 prefers dns-compatible bucket names to be moved from the uri path
   * to the hostname as a sub-domain.  This is not possible, even for dns-compat
   * buckets when using SSL and the bucket name contains a dot ('.').  The
   * ssl wildcard certificate is only 1-level deep.
   *
   * @api private
   */
  populateURI: function populateURI(req) {
    var httpRequest = req.httpRequest;
    var b = req.params.Bucket;
    var service = req.service;
    var endpoint = httpRequest.endpoint;
    if (b) {
      if (!service.pathStyleBucketName(b)) {
        if (service.config.useAccelerateEndpoint && service.isValidAccelerateOperation(req.operation)) {
          if (service.config.useDualstack) {
            endpoint.hostname = b + '.s3-accelerate.dualstack.amazonaws.com';
          } else {
            endpoint.hostname = b + '.s3-accelerate.amazonaws.com';
          }
        } else if (!service.config.s3BucketEndpoint) {
          endpoint.hostname =
            b + '.' + endpoint.hostname;
        }

        var port = endpoint.port;
        if (port !== 80 && port !== 443) {
          endpoint.host = endpoint.hostname + ':' +
            endpoint.port;
        } else {
          endpoint.host = endpoint.hostname;
        }

        httpRequest.virtualHostedBucket = b; // needed for signing the request
        service.removeVirtualHostedBucketFromPath(req);
      }
    }
  },

  /**
   * Takes the bucket name out of the path if bucket is virtual-hosted
   *
   * @api private
   */
  removeVirtualHostedBucketFromPath: function removeVirtualHostedBucketFromPath(req) {
    var httpRequest = req.httpRequest;
    var bucket = httpRequest.virtualHostedBucket;
    if (bucket && httpRequest.path) {
      httpRequest.path = httpRequest.path.replace(new RegExp('/' + bucket), '');
      if (httpRequest.path[0] !== '/') {
        httpRequest.path = '/' + httpRequest.path;
      }
    }
  },

  /**
   * Adds Expect: 100-continue header if payload is greater-or-equal 1MB
   * @api private
   */
  addExpect100Continue: function addExpect100Continue(req) {
    var len = req.httpRequest.headers['Content-Length'];
    if (core.util.isNode() && len >= 1024 * 1024) {
      req.httpRequest.headers['Expect'] = '100-continue';
    }
  },

  /**
   * Adds a default content type if none is supplied.
   *
   * @api private
   */
  addContentType: function addContentType(req) {
    var httpRequest = req.httpRequest;
    if (httpRequest.method === 'GET' || httpRequest.method === 'HEAD') {
      // Content-Type is not set in GET/HEAD requests
      delete httpRequest.headers['Content-Type'];
      return;
    }

    if (!httpRequest.headers['Content-Type']) { // always have a Content-Type
      httpRequest.headers['Content-Type'] = 'application/octet-stream';
    }

    var contentType = httpRequest.headers['Content-Type'];
    if (core.util.isBrowser()) {
      if (typeof httpRequest.body === 'string' && !contentType.match(/;\s*charset=/)) {
        var charset = '; charset=UTF-8';
        httpRequest.headers['Content-Type'] += charset;
      } else {
        var replaceFn = function(_, prefix, charsetName) {
          return prefix + charsetName.toUpperCase();
        };

        httpRequest.headers['Content-Type'] =
          contentType.replace(/(;\s*charset=)(.+)$/, replaceFn);
      }
    }
  },

  /**
   * @api private
   */
  computableChecksumOperations: {
    putBucketCors: true,
    putBucketLifecycle: true,
    putBucketLifecycleConfiguration: true,
    putBucketTagging: true,
    deleteObjects: true,
    putBucketReplication: true
  },

  /**
   * Checks whether checksums should be computed for the request.
   * If the request requires checksums to be computed, this will always
   * return true, otherwise it depends on whether {AWS.Config.computeChecksums}
   * is set.
   *
   * @param req [AWS.Request] the request to check against
   * @return [Boolean] whether to compute checksums for a request.
   * @api private
   */
  willComputeChecksums: function willComputeChecksums(req) {
    if (this.computableChecksumOperations[req.operation]) return true;
    if (!this.config.computeChecksums) return false;

    // TODO: compute checksums for Stream objects
    if (!core.util.Buffer.isBuffer(req.httpRequest.body) &&
        typeof req.httpRequest.body !== 'string') {
      return false;
    }

    var rules = req.service.api.operations[req.operation].input.members;

    // Sha256 signing disabled, and not a presigned url
    if (req.service.shouldDisableBodySigning(req) && !Object.prototype.hasOwnProperty.call(req.httpRequest.headers, 'presigned-expires')) {
      if (rules.ContentMD5 && !req.params.ContentMD5) {
        return true;
      }
    }

    // V4 signer uses SHA256 signatures so only compute MD5 if it is required
    if (req.service.getSignerClass(req) === core.Signers.V4) {
      if (rules.ContentMD5 && !rules.ContentMD5.required) return false;
    }

    if (rules.ContentMD5 && !req.params.ContentMD5) return true;
  },

  /**
   * A listener that computes the Content-MD5 and sets it in the header.
   * @see AWS.S3.willComputeChecksums
   * @api private
   */
  computeContentMd5: function computeContentMd5(req) {
    if (req.service.willComputeChecksums(req)) {
      var md5 = core.util.crypto.md5(req.httpRequest.body, 'base64');
      req.httpRequest.headers['Content-MD5'] = md5;
    }
  },

  /**
   * @api private
   */
  computeSseCustomerKeyMd5: function computeSseCustomerKeyMd5(req) {
    var keys = {
      SSECustomerKey: 'x-amz-server-side-encryption-customer-key-MD5',
      CopySourceSSECustomerKey: 'x-amz-copy-source-server-side-encryption-customer-key-MD5'
    };
    core.util.each(keys, function(key, header) {
      if (req.params[key]) {
        var value = core.util.crypto.md5(req.params[key], 'base64');
        req.httpRequest.headers[header] = value;
      }
    });
  },

  /**
   * Returns true if the bucket name should be left in the URI path for
   * a request to S3.  This function takes into account the current
   * endpoint protocol (e.g. http or https).
   *
   * @api private
   */
  pathStyleBucketName: function pathStyleBucketName(bucketName) {
    // user can force path style requests via the configuration
    if (this.config.s3ForcePathStyle) return true;
    if (this.config.s3BucketEndpoint) return false;

    if (this.dnsCompatibleBucketName(bucketName)) {
      return (this.config.sslEnabled && bucketName.match(/\./)) ? true : false;
    } else {
      return true; // not dns compatible names must always use path style
    }
  },

  /**
   * Returns true if the bucket name is DNS compatible.  Buckets created
   * outside of the classic region MUST be DNS compatible.
   *
   * @api private
   */
  dnsCompatibleBucketName: function dnsCompatibleBucketName(bucketName) {
    var b = bucketName;
    var domain$$1 = new RegExp(/^[a-z0-9][a-z0-9\.\-]{1,61}[a-z0-9]$/);
    var ipAddress = new RegExp(/(\d+\.){3}\d+/);
    var dots = new RegExp(/\.\./);
    return (b.match(domain$$1) && !b.match(ipAddress) && !b.match(dots)) ? true : false;
  },

  /**
   * @return [Boolean] whether response contains an error
   * @api private
   */
  successfulResponse: function successfulResponse(resp) {
    var req = resp.request;
    var httpResponse = resp.httpResponse;
    if (operationsWith200StatusCodeError[req.operation] &&
        httpResponse.body.toString().match('<Error>')) {
      return false;
    } else {
      return httpResponse.statusCode < 300;
    }
  },

  /**
   * @return [Boolean] whether the error can be retried
   * @api private
   */
  retryableError: function retryableError(error, request) {
    if (operationsWith200StatusCodeError[request.operation] &&
        error.statusCode === 200) {
      return true;
    } else if (request._requestRegionForBucket &&
        request.service.bucketRegionCache[request._requestRegionForBucket]) {
      return false;
    } else if (error && error.code === 'RequestTimeout') {
      return true;
    } else if (error &&
        regionRedirectErrorCodes.indexOf(error.code) != -1 &&
        error.region && error.region != request.httpRequest.region) {
      request.httpRequest.region = error.region;
      if (error.statusCode === 301) {
        request.service.updateReqBucketRegion(request);
      }
      return true;
    } else {
      var _super = core.Service.prototype.retryableError;
      return _super.call(this, error, request);
    }
  },

  /**
   * Updates httpRequest with region. If region is not provided, then
   * the httpRequest will be updated based on httpRequest.region
   *
   * @api private
   */
  updateReqBucketRegion: function updateReqBucketRegion(request, region) {
    var httpRequest = request.httpRequest;
    if (typeof region === 'string' && region.length) {
      httpRequest.region = region;
    }
    if (!httpRequest.endpoint.host.match(/s3(?!-accelerate).*\.amazonaws\.com$/)) {
      return;
    }
    var service = request.service;
    var s3Config = service.config;
    var s3BucketEndpoint = s3Config.s3BucketEndpoint;
    if (s3BucketEndpoint) {
      delete s3Config.s3BucketEndpoint;
    }
    var newConfig = core.util.copy(s3Config);
    delete newConfig.endpoint;
    newConfig.region = httpRequest.region;

    httpRequest.endpoint = (new core.S3(newConfig)).endpoint;
    service.populateURI(request);
    s3Config.s3BucketEndpoint = s3BucketEndpoint;
    httpRequest.headers.Host = httpRequest.endpoint.host;

    if (request._asm.currentState === 'validate') {
      request.removeListener('build', service.populateURI);
      request.addListener('build', service.removeVirtualHostedBucketFromPath);
    }
  },

  /**
   * Provides a specialized parser for getBucketLocation -- all other
   * operations are parsed by the super class.
   *
   * @api private
   */
  extractData: function extractData(resp) {
    var req = resp.request;
    if (req.operation === 'getBucketLocation') {
      var match = resp.httpResponse.body.toString().match(/>(.+)<\/Location/);
      delete resp.data['_'];
      if (match) {
        resp.data.LocationConstraint = match[1];
      } else {
        resp.data.LocationConstraint = '';
      }
    }
    var bucket = req.params.Bucket || null;
    if (req.operation === 'deleteBucket' && typeof bucket === 'string' && !resp.error) {
      req.service.clearBucketRegionCache(bucket);
    } else {
      var headers = resp.httpResponse.headers || {};
      var region = headers['x-amz-bucket-region'] || null;
      if (!region && req.operation === 'createBucket' && !resp.error) {
        var createBucketConfiguration = req.params.CreateBucketConfiguration;
        if (!createBucketConfiguration) {
          region = 'us-east-1';
        } else if (createBucketConfiguration.LocationConstraint === 'EU') {
          region = 'eu-west-1';
        } else {
          region = createBucketConfiguration.LocationConstraint;
        }
      }
      if (region) {
          if (bucket && region !== req.service.bucketRegionCache[bucket]) {
            req.service.bucketRegionCache[bucket] = region;
          }
      }
    }
    req.service.extractRequestIds(resp);
  },

  /**
   * Extracts an error object from the http response.
   *
   * @api private
   */
  extractError: function extractError(resp) {
    var codes = {
      304: 'NotModified',
      403: 'Forbidden',
      400: 'BadRequest',
      404: 'NotFound'
    };

    var req = resp.request;
    var code = resp.httpResponse.statusCode;
    var body = resp.httpResponse.body || '';

    var headers = resp.httpResponse.headers || {};
    var region = headers['x-amz-bucket-region'] || null;
    var bucket = req.params.Bucket || null;
    var bucketRegionCache = req.service.bucketRegionCache;
    if (region && bucket && region !== bucketRegionCache[bucket]) {
      bucketRegionCache[bucket] = region;
    }

    var cachedRegion;
    if (codes[code] && body.length === 0) {
      if (bucket && !region) {
        cachedRegion = bucketRegionCache[bucket] || null;
        if (cachedRegion !== req.httpRequest.region) {
          region = cachedRegion;
        }
      }
      resp.error = core.util.error(new Error(), {
        code: codes[code],
        message: null,
        region: region
      });
    } else {
      var data = new core.XML.Parser().parse(body.toString());

      if (data.Region && !region) {
        region = data.Region;
        if (bucket && region !== bucketRegionCache[bucket]) {
          bucketRegionCache[bucket] = region;
        }
      } else if (bucket && !region && !data.Region) {
        cachedRegion = bucketRegionCache[bucket] || null;
        if (cachedRegion !== req.httpRequest.region) {
          region = cachedRegion;
        }
      }

      resp.error = core.util.error(new Error(), {
        code: data.Code || code,
        message: data.Message || null,
        region: region
      });
    }
    req.service.extractRequestIds(resp);
  },

  /**
   * If region was not obtained synchronously, then send async request
   * to get bucket region for errors resulting from wrong region.
   *
   * @api private
   */
  requestBucketRegion: function requestBucketRegion(resp, done) {
    var error = resp.error;
    var req = resp.request;
    var bucket = req.params.Bucket || null;

    if (!error || !bucket || error.region || req.operation === 'listObjects' ||
        (core.util.isNode() && req.operation === 'headBucket') ||
        (error.statusCode === 400 && req.operation !== 'headObject') ||
        regionRedirectErrorCodes.indexOf(error.code) === -1) {
      return done();
    }
    var reqOperation = core.util.isNode() ? 'headBucket' : 'listObjects';
    var reqParams = {Bucket: bucket};
    if (reqOperation === 'listObjects') reqParams.MaxKeys = 0;
    var regionReq = req.service[reqOperation](reqParams);
    regionReq._requestRegionForBucket = bucket;
    regionReq.send(function() {
      var region = req.service.bucketRegionCache[bucket] || null;
      error.region = region;
      done();
    });
  },

   /**
   * For browser only. If NetworkingError received, will attempt to obtain
   * the bucket region.
   *
   * @api private
   */
   reqRegionForNetworkingError: function reqRegionForNetworkingError(resp, done) {
    if (!core.util.isBrowser()) {
      return done();
    }
    var error = resp.error;
    var request = resp.request;
    var bucket = request.params.Bucket;
    if (!error || error.code !== 'NetworkingError' || !bucket ||
        request.httpRequest.region === 'us-east-1') {
      return done();
    }
    var service = request.service;
    var bucketRegionCache = service.bucketRegionCache;
    var cachedRegion = bucketRegionCache[bucket] || null;

    if (cachedRegion && cachedRegion !== request.httpRequest.region) {
      service.updateReqBucketRegion(request, cachedRegion);
      done();
    } else if (!service.dnsCompatibleBucketName(bucket)) {
      service.updateReqBucketRegion(request, 'us-east-1');
      if (bucketRegionCache[bucket] !== 'us-east-1') {
        bucketRegionCache[bucket] = 'us-east-1';
      }
      done();
    } else if (request.httpRequest.virtualHostedBucket) {
      var getRegionReq = service.listObjects({Bucket: bucket, MaxKeys: 0});
      service.updateReqBucketRegion(getRegionReq, 'us-east-1');
      getRegionReq._requestRegionForBucket = bucket;

      getRegionReq.send(function() {
        var region = service.bucketRegionCache[bucket] || null;
        if (region && region !== request.httpRequest.region) {
          service.updateReqBucketRegion(request, region);
        }
        done();
      });
    } else {
      // DNS-compatible path-style
      // (s3ForcePathStyle or bucket name with dot over https)
      // Cannot obtain region information for this case
      done();
    }
   },

  /**
   * Cache for bucket region.
   *
   * @api private
   */
   bucketRegionCache: {},

  /**
   * Clears bucket region cache.
   *
   * @api private
   */
   clearBucketRegionCache: function(buckets) {
    var bucketRegionCache = this.bucketRegionCache;
    if (!buckets) {
      buckets = Object.keys(bucketRegionCache);
    } else if (typeof buckets === 'string') {
      buckets = [buckets];
    }
    for (var i = 0; i < buckets.length; i++) {
      delete bucketRegionCache[buckets[i]];
    }
    return bucketRegionCache;
   },

   /**
    * Corrects request region if bucket's cached region is different
    *
    * @api private
    */
  correctBucketRegionFromCache: function correctBucketRegionFromCache(req) {
    var bucket = req.params.Bucket || null;
    if (bucket) {
      var service = req.service;
      var requestRegion = req.httpRequest.region;
      var cachedRegion = service.bucketRegionCache[bucket];
      if (cachedRegion && cachedRegion !== requestRegion) {
        service.updateReqBucketRegion(req, cachedRegion);
      }
    }
  },

  /**
   * Extracts S3 specific request ids from the http response.
   *
   * @api private
   */
  extractRequestIds: function extractRequestIds(resp) {
    var extendedRequestId = resp.httpResponse.headers ? resp.httpResponse.headers['x-amz-id-2'] : null;
    var cfId = resp.httpResponse.headers ? resp.httpResponse.headers['x-amz-cf-id'] : null;
    resp.extendedRequestId = extendedRequestId;
    resp.cfId = cfId;

    if (resp.error) {
      resp.error.requestId = resp.requestId || null;
      resp.error.extendedRequestId = extendedRequestId;
      resp.error.cfId = cfId;
    }
  },

  /**
   * Get a pre-signed URL for a given operation name.
   *
   * @note You must ensure that you have static or previously resolved
   *   credentials if you call this method synchronously (with no callback),
   *   otherwise it may not properly sign the request. If you cannot guarantee
   *   this (you are using an asynchronous credential provider, i.e., EC2
   *   IAM roles), you should always call this method with an asynchronous
   *   callback.
   * @note Not all operation parameters are supported when using pre-signed
   *   URLs. Certain parameters, such as `SSECustomerKey`, `ACL`, `Expires`,
   *   `ContentLength`, or `Tagging` must be provided as headers when sending a
   *   request. If you are using pre-signed URLs to upload from a browser and
   *   need to use these fields, see {createPresignedPost}.
   * @param operation [String] the name of the operation to call
   * @param params [map] parameters to pass to the operation. See the given
   *   operation for the expected operation parameters. In addition, you can
   *   also pass the "Expires" parameter to inform S3 how long the URL should
   *   work for.
   * @option params Expires [Integer] (900) the number of seconds to expire
   *   the pre-signed URL operation in. Defaults to 15 minutes.
   * @param callback [Function] if a callback is provided, this function will
   *   pass the URL as the second parameter (after the error parameter) to
   *   the callback function.
   * @return [String] if called synchronously (with no callback), returns the
   *   signed URL.
   * @return [null] nothing is returned if a callback is provided.
   * @example Pre-signing a getObject operation (synchronously)
   *   var params = {Bucket: 'bucket', Key: 'key'};
   *   var url = s3.getSignedUrl('getObject', params);
   *   console.log('The URL is', url);
   * @example Pre-signing a putObject (asynchronously)
   *   var params = {Bucket: 'bucket', Key: 'key'};
   *   s3.getSignedUrl('putObject', params, function (err, url) {
   *     console.log('The URL is', url);
   *   });
   * @example Pre-signing a putObject operation with a specific payload
   *   var params = {Bucket: 'bucket', Key: 'key', Body: 'body'};
   *   var url = s3.getSignedUrl('putObject', params);
   *   console.log('The URL is', url);
   * @example Passing in a 1-minute expiry time for a pre-signed URL
   *   var params = {Bucket: 'bucket', Key: 'key', Expires: 60};
   *   var url = s3.getSignedUrl('getObject', params);
   *   console.log('The URL is', url); // expires in 60 seconds
   */
  getSignedUrl: function getSignedUrl(operation, params, callback) {
    params = core.util.copy(params || {});
    var expires = params.Expires || 900;
    delete params.Expires; // we can't validate this
    var request = this.makeRequest(operation, params);

    if (callback) {
      core.util.defer(function() {
        request.presign(expires, callback);
      });
    } else {
      return request.presign(expires, callback);
    }
  },


  /**
   * Get a pre-signed POST policy to support uploading to S3 directly from an
   * HTML form.
   *
   * @param params [map]
   * @option params Bucket [String]     The bucket to which the post should be
   *                                    uploaded
   * @option params Expires [Integer]   (3600) The number of seconds for which
   *                                    the presigned policy should be valid.
   * @option params Conditions [Array]  An array of conditions that must be met
   *                                    for the presigned policy to allow the
   *                                    upload. This can include required tags,
   *                                    the accepted range for content lengths,
   *                                    etc.
   * @see http://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-HTTPPOSTConstructPolicy.html
   * @option params Fields [map]        Fields to include in the form. All
   *                                    values passed in as fields will be
   *                                    signed as exact match conditions.
   * @param callback [Function]
   *
   * @note All fields passed in when creating presigned post data will be signed
   *   as exact match conditions. Any fields that will be interpolated by S3
   *   must be added to the fields hash after signing, and an appropriate
   *   condition for such fields must be explicitly added to the Conditions
   *   array passed to this function before signing.
   *
   * @example Presiging post data with a known key
   *   var params = {
   *     Bucket: 'bucket',
   *     Fields: {
   *       key: 'key'
   *     }
   *   };
   *   s3.createPresignedPost(params, function(err, data) {
   *     if (err) {
   *       console.error('Presigning post data encountered an error', err);
   *     } else {
   *       console.log('The post data is', data);
   *     }
   *   });
   *
   * @example Presigning post data with an interpolated key
   *   var params = {
   *     Bucket: 'bucket',
   *     Conditions: [
   *       ['starts-with', '$key', 'path/to/uploads/']
   *     ]
   *   };
   *   s3.createPresignedPost(params, function(err, data) {
   *     if (err) {
   *       console.error('Presigning post data encountered an error', err);
   *     } else {
   *       data.Fields.key = 'path/to/uploads/${filename}';
   *       console.log('The post data is', data);
   *     }
   *   });
   *
   * @note You must ensure that you have static or previously resolved
   *   credentials if you call this method synchronously (with no callback),
   *   otherwise it may not properly sign the request. If you cannot guarantee
   *   this (you are using an asynchronous credential provider, i.e., EC2
   *   IAM roles), you should always call this method with an asynchronous
   *   callback.
   *
   * @return [map]  If called synchronously (with no callback), returns a hash
   *                with the url to set as the form action and a hash of fields
   *                to include in the form.
   * @return [null] Nothing is returned if a callback is provided.
   *
   * @callback callback function (err, data)
   *  @param err [Error] the error object returned from the policy signer
   *  @param data [map] The data necessary to construct an HTML form
   *  @param data.url [String] The URL to use as the action of the form
   *  @param data.fields [map] A hash of fields that must be included in the
   *                           form for the upload to succeed. This hash will
   *                           include the signed POST policy, your access key
   *                           ID and security token (if present), etc. These
   *                           may be safely included as input elements of type
   *                           'hidden.'
   */
  createPresignedPost: function createPresignedPost(params, callback) {
    if (typeof params === 'function' && callback === undefined) {
      callback = params;
      params = null;
    }

    params = core.util.copy(params || {});
    var boundParams = this.config.params || {};
    var bucket = params.Bucket || boundParams.Bucket,
      self = this,
      config = this.config,
      endpoint = core.util.copy(this.endpoint);
    if (!config.s3BucketEndpoint) {
      endpoint.pathname = '/' + bucket;
    }

    function finalizePost() {
      return {
        url: core.util.urlFormat(endpoint),
        fields: self.preparePostFields(
          config.credentials,
          config.region,
          bucket,
          params.Fields,
          params.Conditions,
          params.Expires
        )
      };
    }

    if (callback) {
      config.getCredentials(function (err) {
        if (err) {
          callback(err);
        }

        callback(null, finalizePost());
      });
    } else {
      return finalizePost();
    }
  },

  /**
   * @api private
   */
  preparePostFields: function preparePostFields(
    credentials,
    region,
    bucket,
    fields,
    conditions,
    expiresInSeconds
  ) {
    var now = this.getSkewCorrectedDate();
    if (!credentials || !region || !bucket) {
      throw new Error('Unable to create a POST object policy without a bucket,'
        + ' region, and credentials');
    }
    fields = core.util.copy(fields || {});
    conditions = (conditions || []).slice(0);
    expiresInSeconds = expiresInSeconds || 3600;

    var signingDate = core.util.date.iso8601(now).replace(/[:\-]|\.\d{3}/g, '');
    var shortDate = signingDate.substr(0, 8);
    var scope = v4_credentials.createScope(shortDate, region, 's3');
    var credential = credentials.accessKeyId + '/' + scope;

    fields['bucket'] = bucket;
    fields['X-Amz-Algorithm'] = 'AWS4-HMAC-SHA256';
    fields['X-Amz-Credential'] = credential;
    fields['X-Amz-Date'] = signingDate;
    if (credentials.sessionToken) {
      fields['X-Amz-Security-Token'] = credentials.sessionToken;
    }
    for (var field in fields) {
      if (fields.hasOwnProperty(field)) {
        var condition = {};
        condition[field] = fields[field];
        conditions.push(condition);
      }
    }

    fields.Policy = this.preparePostPolicy(
      new Date(now.valueOf() + expiresInSeconds * 1000),
      conditions
    );
    fields['X-Amz-Signature'] = core.util.crypto.hmac(
      v4_credentials.getSigningKey(credentials, shortDate, region, 's3', true),
      fields.Policy,
      'hex'
    );

    return fields;
  },

  /**
   * @api private
   */
  preparePostPolicy: function preparePostPolicy(expiration, conditions) {
    return core.util.base64.encode(JSON.stringify({
      expiration: core.util.date.iso8601(expiration),
      conditions: conditions
    }));
  },

  /**
   * @api private
   */
  prepareSignedUrl: function prepareSignedUrl(request) {
    request.addListener('validate', request.service.noPresignedContentLength);
    request.removeListener('build', request.service.addContentType);
    if (!request.params.Body) {
      // no Content-MD5/SHA-256 if body is not provided
      request.removeListener('build', request.service.computeContentMd5);
    } else {
      request.addListener('afterBuild', core.EventListeners.Core.COMPUTE_SHA256);
    }
  },

  /**
   * @api private
   * @param request
   */
  disableBodySigning: function disableBodySigning(request) {
    var headers = request.httpRequest.headers;
    // Add the header to anything that isn't a presigned url, unless that presigned url had a body defined
    if (!Object.prototype.hasOwnProperty.call(headers, 'presigned-expires')) {
      headers['X-Amz-Content-Sha256'] = 'UNSIGNED-PAYLOAD';
    }
  },

  /**
   * @api private
   */
  noPresignedContentLength: function noPresignedContentLength(request) {
    if (request.params.ContentLength !== undefined) {
      throw core.util.error(new Error(), {code: 'UnexpectedParameter',
        message: 'ContentLength is not supported in pre-signed URLs.'});
    }
  },

  createBucket: function createBucket(params, callback) {
    // When creating a bucket *outside* the classic region, the location
    // constraint must be set for the bucket and it must match the endpoint.
    // This chunk of code will set the location constraint param based
    // on the region (when possible), but it will not override a passed-in
    // location constraint.
    if (typeof params === 'function' || !params) {
      callback = callback || params;
      params = {};
    }
    var hostname = this.endpoint.hostname;
    if (hostname !== this.api.globalEndpoint && !params.CreateBucketConfiguration) {
      params.CreateBucketConfiguration = { LocationConstraint: this.config.region };
    }
    return this.makeRequest('createBucket', params, callback);
  },

  /**
   * @see AWS.S3.ManagedUpload
   * @overload upload(params = {}, [options], [callback])
   *   Uploads an arbitrarily sized buffer, blob, or stream, using intelligent
   *   concurrent handling of parts if the payload is large enough. You can
   *   configure the concurrent queue size by setting `options`. Note that this
   *   is the only operation for which the SDK can retry requests with stream
   *   bodies.
   *
   *   @param (see AWS.S3.putObject)
   *   @option (see AWS.S3.ManagedUpload.constructor)
   *   @return [AWS.S3.ManagedUpload] the managed upload object that can call
   *     `send()` or track progress.
   *   @example Uploading a stream object
   *     var params = {Bucket: 'bucket', Key: 'key', Body: stream};
   *     s3.upload(params, function(err, data) {
   *       console.log(err, data);
   *     });
   *   @example Uploading a stream with concurrency of 1 and partSize of 10mb
   *     var params = {Bucket: 'bucket', Key: 'key', Body: stream};
   *     var options = {partSize: 10 * 1024 * 1024, queueSize: 1};
   *     s3.upload(params, options, function(err, data) {
   *       console.log(err, data);
   *     });
   * @callback callback function(err, data)
   *   @param err [Error] an error or null if no error occurred.
   *   @param data [map] The response data from the successful upload:
   *   @param data.Location [String] the URL of the uploaded object
   *   @param data.ETag [String] the ETag of the uploaded object
   *   @param data.Bucket [String]  the bucket to which the object was uploaded
   *   @param data.Key [String] the key to which the object was uploaded
   */
  upload: function upload(params, options, callback) {
    if (typeof options === 'function' && callback === undefined) {
      callback = options;
      options = null;
    }

    options = options || {};
    options = core.util.merge(options || {}, {service: this, params: params});

    var uploader = new core.S3.ManagedUpload(options);
    if (typeof callback === 'function') uploader.send(callback);
    return uploader;
  }
});

var version$6 = "2.0";
var metadata$6 = {"apiVersion":"2006-03-01","checksumFormat":"md5","endpointPrefix":"s3","globalEndpoint":"s3.amazonaws.com","protocol":"rest-xml","serviceAbbreviation":"Amazon S3","serviceFullName":"Amazon Simple Storage Service","serviceId":"S3","signatureVersion":"s3","timestampFormat":"rfc822","uid":"s3-2006-03-01"};
var operations$4 = {"AbortMultipartUpload":{"http":{"method":"DELETE","requestUri":"/{Bucket}/{Key+}"},"input":{"type":"structure","required":["Bucket","Key","UploadId"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Key":{"location":"uri","locationName":"Key"},"UploadId":{"location":"querystring","locationName":"uploadId"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"}}},"output":{"type":"structure","members":{"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"}}}},"CompleteMultipartUpload":{"http":{"requestUri":"/{Bucket}/{Key+}"},"input":{"type":"structure","required":["Bucket","Key","UploadId"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Key":{"location":"uri","locationName":"Key"},"MultipartUpload":{"locationName":"CompleteMultipartUpload","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"},"type":"structure","members":{"Parts":{"locationName":"Part","type":"list","member":{"type":"structure","members":{"ETag":{},"PartNumber":{"type":"integer"}}},"flattened":true}}},"UploadId":{"location":"querystring","locationName":"uploadId"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"}},"payload":"MultipartUpload"},"output":{"type":"structure","members":{"Location":{},"Bucket":{},"Key":{},"Expiration":{"location":"header","locationName":"x-amz-expiration"},"ETag":{},"ServerSideEncryption":{"location":"header","locationName":"x-amz-server-side-encryption"},"VersionId":{"location":"header","locationName":"x-amz-version-id"},"SSEKMSKeyId":{"shape":"Sj","location":"header","locationName":"x-amz-server-side-encryption-aws-kms-key-id"},"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"}}}},"CopyObject":{"http":{"method":"PUT","requestUri":"/{Bucket}/{Key+}"},"input":{"type":"structure","required":["Bucket","CopySource","Key"],"members":{"ACL":{"location":"header","locationName":"x-amz-acl"},"Bucket":{"location":"uri","locationName":"Bucket"},"CacheControl":{"location":"header","locationName":"Cache-Control"},"ContentDisposition":{"location":"header","locationName":"Content-Disposition"},"ContentEncoding":{"location":"header","locationName":"Content-Encoding"},"ContentLanguage":{"location":"header","locationName":"Content-Language"},"ContentType":{"location":"header","locationName":"Content-Type"},"CopySource":{"location":"header","locationName":"x-amz-copy-source"},"CopySourceIfMatch":{"location":"header","locationName":"x-amz-copy-source-if-match"},"CopySourceIfModifiedSince":{"location":"header","locationName":"x-amz-copy-source-if-modified-since","type":"timestamp"},"CopySourceIfNoneMatch":{"location":"header","locationName":"x-amz-copy-source-if-none-match"},"CopySourceIfUnmodifiedSince":{"location":"header","locationName":"x-amz-copy-source-if-unmodified-since","type":"timestamp"},"Expires":{"location":"header","locationName":"Expires","type":"timestamp"},"GrantFullControl":{"location":"header","locationName":"x-amz-grant-full-control"},"GrantRead":{"location":"header","locationName":"x-amz-grant-read"},"GrantReadACP":{"location":"header","locationName":"x-amz-grant-read-acp"},"GrantWriteACP":{"location":"header","locationName":"x-amz-grant-write-acp"},"Key":{"location":"uri","locationName":"Key"},"Metadata":{"shape":"S11","location":"headers","locationName":"x-amz-meta-"},"MetadataDirective":{"location":"header","locationName":"x-amz-metadata-directive"},"TaggingDirective":{"location":"header","locationName":"x-amz-tagging-directive"},"ServerSideEncryption":{"location":"header","locationName":"x-amz-server-side-encryption"},"StorageClass":{"location":"header","locationName":"x-amz-storage-class"},"WebsiteRedirectLocation":{"location":"header","locationName":"x-amz-website-redirect-location"},"SSECustomerAlgorithm":{"location":"header","locationName":"x-amz-server-side-encryption-customer-algorithm"},"SSECustomerKey":{"shape":"S19","location":"header","locationName":"x-amz-server-side-encryption-customer-key"},"SSECustomerKeyMD5":{"location":"header","locationName":"x-amz-server-side-encryption-customer-key-MD5"},"SSEKMSKeyId":{"shape":"Sj","location":"header","locationName":"x-amz-server-side-encryption-aws-kms-key-id"},"CopySourceSSECustomerAlgorithm":{"location":"header","locationName":"x-amz-copy-source-server-side-encryption-customer-algorithm"},"CopySourceSSECustomerKey":{"shape":"S1c","location":"header","locationName":"x-amz-copy-source-server-side-encryption-customer-key"},"CopySourceSSECustomerKeyMD5":{"location":"header","locationName":"x-amz-copy-source-server-side-encryption-customer-key-MD5"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"},"Tagging":{"location":"header","locationName":"x-amz-tagging"}}},"output":{"type":"structure","members":{"CopyObjectResult":{"type":"structure","members":{"ETag":{},"LastModified":{"type":"timestamp"}}},"Expiration":{"location":"header","locationName":"x-amz-expiration"},"CopySourceVersionId":{"location":"header","locationName":"x-amz-copy-source-version-id"},"VersionId":{"location":"header","locationName":"x-amz-version-id"},"ServerSideEncryption":{"location":"header","locationName":"x-amz-server-side-encryption"},"SSECustomerAlgorithm":{"location":"header","locationName":"x-amz-server-side-encryption-customer-algorithm"},"SSECustomerKeyMD5":{"location":"header","locationName":"x-amz-server-side-encryption-customer-key-MD5"},"SSEKMSKeyId":{"shape":"Sj","location":"header","locationName":"x-amz-server-side-encryption-aws-kms-key-id"},"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"}},"payload":"CopyObjectResult"},"alias":"PutObjectCopy"},"CreateBucket":{"http":{"method":"PUT","requestUri":"/{Bucket}"},"input":{"type":"structure","required":["Bucket"],"members":{"ACL":{"location":"header","locationName":"x-amz-acl"},"Bucket":{"location":"uri","locationName":"Bucket"},"CreateBucketConfiguration":{"locationName":"CreateBucketConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"},"type":"structure","members":{"LocationConstraint":{}}},"GrantFullControl":{"location":"header","locationName":"x-amz-grant-full-control"},"GrantRead":{"location":"header","locationName":"x-amz-grant-read"},"GrantReadACP":{"location":"header","locationName":"x-amz-grant-read-acp"},"GrantWrite":{"location":"header","locationName":"x-amz-grant-write"},"GrantWriteACP":{"location":"header","locationName":"x-amz-grant-write-acp"}},"payload":"CreateBucketConfiguration"},"output":{"type":"structure","members":{"Location":{"location":"header","locationName":"Location"}}},"alias":"PutBucket"},"CreateMultipartUpload":{"http":{"requestUri":"/{Bucket}/{Key+}?uploads"},"input":{"type":"structure","required":["Bucket","Key"],"members":{"ACL":{"location":"header","locationName":"x-amz-acl"},"Bucket":{"location":"uri","locationName":"Bucket"},"CacheControl":{"location":"header","locationName":"Cache-Control"},"ContentDisposition":{"location":"header","locationName":"Content-Disposition"},"ContentEncoding":{"location":"header","locationName":"Content-Encoding"},"ContentLanguage":{"location":"header","locationName":"Content-Language"},"ContentType":{"location":"header","locationName":"Content-Type"},"Expires":{"location":"header","locationName":"Expires","type":"timestamp"},"GrantFullControl":{"location":"header","locationName":"x-amz-grant-full-control"},"GrantRead":{"location":"header","locationName":"x-amz-grant-read"},"GrantReadACP":{"location":"header","locationName":"x-amz-grant-read-acp"},"GrantWriteACP":{"location":"header","locationName":"x-amz-grant-write-acp"},"Key":{"location":"uri","locationName":"Key"},"Metadata":{"shape":"S11","location":"headers","locationName":"x-amz-meta-"},"ServerSideEncryption":{"location":"header","locationName":"x-amz-server-side-encryption"},"StorageClass":{"location":"header","locationName":"x-amz-storage-class"},"WebsiteRedirectLocation":{"location":"header","locationName":"x-amz-website-redirect-location"},"SSECustomerAlgorithm":{"location":"header","locationName":"x-amz-server-side-encryption-customer-algorithm"},"SSECustomerKey":{"shape":"S19","location":"header","locationName":"x-amz-server-side-encryption-customer-key"},"SSECustomerKeyMD5":{"location":"header","locationName":"x-amz-server-side-encryption-customer-key-MD5"},"SSEKMSKeyId":{"shape":"Sj","location":"header","locationName":"x-amz-server-side-encryption-aws-kms-key-id"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"},"Tagging":{"location":"header","locationName":"x-amz-tagging"}}},"output":{"type":"structure","members":{"AbortDate":{"location":"header","locationName":"x-amz-abort-date","type":"timestamp"},"AbortRuleId":{"location":"header","locationName":"x-amz-abort-rule-id"},"Bucket":{"locationName":"Bucket"},"Key":{},"UploadId":{},"ServerSideEncryption":{"location":"header","locationName":"x-amz-server-side-encryption"},"SSECustomerAlgorithm":{"location":"header","locationName":"x-amz-server-side-encryption-customer-algorithm"},"SSECustomerKeyMD5":{"location":"header","locationName":"x-amz-server-side-encryption-customer-key-MD5"},"SSEKMSKeyId":{"shape":"Sj","location":"header","locationName":"x-amz-server-side-encryption-aws-kms-key-id"},"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"}}},"alias":"InitiateMultipartUpload"},"DeleteBucket":{"http":{"method":"DELETE","requestUri":"/{Bucket}"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}}},"DeleteBucketAnalyticsConfiguration":{"http":{"method":"DELETE","requestUri":"/{Bucket}?analytics"},"input":{"type":"structure","required":["Bucket","Id"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Id":{"location":"querystring","locationName":"id"}}}},"DeleteBucketCors":{"http":{"method":"DELETE","requestUri":"/{Bucket}?cors"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}}},"DeleteBucketEncryption":{"http":{"method":"DELETE","requestUri":"/{Bucket}?encryption"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}}},"DeleteBucketInventoryConfiguration":{"http":{"method":"DELETE","requestUri":"/{Bucket}?inventory"},"input":{"type":"structure","required":["Bucket","Id"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Id":{"location":"querystring","locationName":"id"}}}},"DeleteBucketLifecycle":{"http":{"method":"DELETE","requestUri":"/{Bucket}?lifecycle"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}}},"DeleteBucketMetricsConfiguration":{"http":{"method":"DELETE","requestUri":"/{Bucket}?metrics"},"input":{"type":"structure","required":["Bucket","Id"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Id":{"location":"querystring","locationName":"id"}}}},"DeleteBucketPolicy":{"http":{"method":"DELETE","requestUri":"/{Bucket}?policy"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}}},"DeleteBucketReplication":{"http":{"method":"DELETE","requestUri":"/{Bucket}?replication"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}}},"DeleteBucketTagging":{"http":{"method":"DELETE","requestUri":"/{Bucket}?tagging"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}}},"DeleteBucketWebsite":{"http":{"method":"DELETE","requestUri":"/{Bucket}?website"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}}},"DeleteObject":{"http":{"method":"DELETE","requestUri":"/{Bucket}/{Key+}"},"input":{"type":"structure","required":["Bucket","Key"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Key":{"location":"uri","locationName":"Key"},"MFA":{"location":"header","locationName":"x-amz-mfa"},"VersionId":{"location":"querystring","locationName":"versionId"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"}}},"output":{"type":"structure","members":{"DeleteMarker":{"location":"header","locationName":"x-amz-delete-marker","type":"boolean"},"VersionId":{"location":"header","locationName":"x-amz-version-id"},"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"}}}},"DeleteObjectTagging":{"http":{"method":"DELETE","requestUri":"/{Bucket}/{Key+}?tagging"},"input":{"type":"structure","required":["Bucket","Key"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Key":{"location":"uri","locationName":"Key"},"VersionId":{"location":"querystring","locationName":"versionId"}}},"output":{"type":"structure","members":{"VersionId":{"location":"header","locationName":"x-amz-version-id"}}}},"DeleteObjects":{"http":{"requestUri":"/{Bucket}?delete"},"input":{"type":"structure","required":["Bucket","Delete"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Delete":{"locationName":"Delete","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"},"type":"structure","required":["Objects"],"members":{"Objects":{"locationName":"Object","type":"list","member":{"type":"structure","required":["Key"],"members":{"Key":{},"VersionId":{}}},"flattened":true},"Quiet":{"type":"boolean"}}},"MFA":{"location":"header","locationName":"x-amz-mfa"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"}},"payload":"Delete"},"output":{"type":"structure","members":{"Deleted":{"type":"list","member":{"type":"structure","members":{"Key":{},"VersionId":{},"DeleteMarker":{"type":"boolean"},"DeleteMarkerVersionId":{}}},"flattened":true},"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"},"Errors":{"locationName":"Error","type":"list","member":{"type":"structure","members":{"Key":{},"VersionId":{},"Code":{},"Message":{}}},"flattened":true}}},"alias":"DeleteMultipleObjects"},"GetBucketAccelerateConfiguration":{"http":{"method":"GET","requestUri":"/{Bucket}?accelerate"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"output":{"type":"structure","members":{"Status":{}}}},"GetBucketAcl":{"http":{"method":"GET","requestUri":"/{Bucket}?acl"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"output":{"type":"structure","members":{"Owner":{"shape":"S2v"},"Grants":{"shape":"S2y","locationName":"AccessControlList"}}}},"GetBucketAnalyticsConfiguration":{"http":{"method":"GET","requestUri":"/{Bucket}?analytics"},"input":{"type":"structure","required":["Bucket","Id"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Id":{"location":"querystring","locationName":"id"}}},"output":{"type":"structure","members":{"AnalyticsConfiguration":{"shape":"S37"}},"payload":"AnalyticsConfiguration"}},"GetBucketCors":{"http":{"method":"GET","requestUri":"/{Bucket}?cors"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"output":{"type":"structure","members":{"CORSRules":{"shape":"S3n","locationName":"CORSRule"}}}},"GetBucketEncryption":{"http":{"method":"GET","requestUri":"/{Bucket}?encryption"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"output":{"type":"structure","members":{"ServerSideEncryptionConfiguration":{"shape":"S40"}},"payload":"ServerSideEncryptionConfiguration"}},"GetBucketInventoryConfiguration":{"http":{"method":"GET","requestUri":"/{Bucket}?inventory"},"input":{"type":"structure","required":["Bucket","Id"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Id":{"location":"querystring","locationName":"id"}}},"output":{"type":"structure","members":{"InventoryConfiguration":{"shape":"S46"}},"payload":"InventoryConfiguration"}},"GetBucketLifecycle":{"http":{"method":"GET","requestUri":"/{Bucket}?lifecycle"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"output":{"type":"structure","members":{"Rules":{"shape":"S4m","locationName":"Rule"}}},"deprecated":true},"GetBucketLifecycleConfiguration":{"http":{"method":"GET","requestUri":"/{Bucket}?lifecycle"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"output":{"type":"structure","members":{"Rules":{"shape":"S51","locationName":"Rule"}}}},"GetBucketLocation":{"http":{"method":"GET","requestUri":"/{Bucket}?location"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"output":{"type":"structure","members":{"LocationConstraint":{}}}},"GetBucketLogging":{"http":{"method":"GET","requestUri":"/{Bucket}?logging"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"output":{"type":"structure","members":{"LoggingEnabled":{"shape":"S5b"}}}},"GetBucketMetricsConfiguration":{"http":{"method":"GET","requestUri":"/{Bucket}?metrics"},"input":{"type":"structure","required":["Bucket","Id"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Id":{"location":"querystring","locationName":"id"}}},"output":{"type":"structure","members":{"MetricsConfiguration":{"shape":"S5j"}},"payload":"MetricsConfiguration"}},"GetBucketNotification":{"http":{"method":"GET","requestUri":"/{Bucket}?notification"},"input":{"shape":"S5m"},"output":{"shape":"S5n"},"deprecated":true},"GetBucketNotificationConfiguration":{"http":{"method":"GET","requestUri":"/{Bucket}?notification"},"input":{"shape":"S5m"},"output":{"shape":"S5y"}},"GetBucketPolicy":{"http":{"method":"GET","requestUri":"/{Bucket}?policy"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"output":{"type":"structure","members":{"Policy":{}},"payload":"Policy"}},"GetBucketReplication":{"http":{"method":"GET","requestUri":"/{Bucket}?replication"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"output":{"type":"structure","members":{"ReplicationConfiguration":{"shape":"S6h"}},"payload":"ReplicationConfiguration"}},"GetBucketRequestPayment":{"http":{"method":"GET","requestUri":"/{Bucket}?requestPayment"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"output":{"type":"structure","members":{"Payer":{}}}},"GetBucketTagging":{"http":{"method":"GET","requestUri":"/{Bucket}?tagging"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"output":{"type":"structure","required":["TagSet"],"members":{"TagSet":{"shape":"S3d"}}}},"GetBucketVersioning":{"http":{"method":"GET","requestUri":"/{Bucket}?versioning"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"output":{"type":"structure","members":{"Status":{},"MFADelete":{"locationName":"MfaDelete"}}}},"GetBucketWebsite":{"http":{"method":"GET","requestUri":"/{Bucket}?website"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"output":{"type":"structure","members":{"RedirectAllRequestsTo":{"shape":"S75"},"IndexDocument":{"shape":"S78"},"ErrorDocument":{"shape":"S7a"},"RoutingRules":{"shape":"S7b"}}}},"GetObject":{"http":{"method":"GET","requestUri":"/{Bucket}/{Key+}"},"input":{"type":"structure","required":["Bucket","Key"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"IfMatch":{"location":"header","locationName":"If-Match"},"IfModifiedSince":{"location":"header","locationName":"If-Modified-Since","type":"timestamp"},"IfNoneMatch":{"location":"header","locationName":"If-None-Match"},"IfUnmodifiedSince":{"location":"header","locationName":"If-Unmodified-Since","type":"timestamp"},"Key":{"location":"uri","locationName":"Key"},"Range":{"location":"header","locationName":"Range"},"ResponseCacheControl":{"location":"querystring","locationName":"response-cache-control"},"ResponseContentDisposition":{"location":"querystring","locationName":"response-content-disposition"},"ResponseContentEncoding":{"location":"querystring","locationName":"response-content-encoding"},"ResponseContentLanguage":{"location":"querystring","locationName":"response-content-language"},"ResponseContentType":{"location":"querystring","locationName":"response-content-type"},"ResponseExpires":{"location":"querystring","locationName":"response-expires","type":"timestamp"},"VersionId":{"location":"querystring","locationName":"versionId"},"SSECustomerAlgorithm":{"location":"header","locationName":"x-amz-server-side-encryption-customer-algorithm"},"SSECustomerKey":{"shape":"S19","location":"header","locationName":"x-amz-server-side-encryption-customer-key"},"SSECustomerKeyMD5":{"location":"header","locationName":"x-amz-server-side-encryption-customer-key-MD5"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"},"PartNumber":{"location":"querystring","locationName":"partNumber","type":"integer"}}},"output":{"type":"structure","members":{"Body":{"streaming":true,"type":"blob"},"DeleteMarker":{"location":"header","locationName":"x-amz-delete-marker","type":"boolean"},"AcceptRanges":{"location":"header","locationName":"accept-ranges"},"Expiration":{"location":"header","locationName":"x-amz-expiration"},"Restore":{"location":"header","locationName":"x-amz-restore"},"LastModified":{"location":"header","locationName":"Last-Modified","type":"timestamp"},"ContentLength":{"location":"header","locationName":"Content-Length","type":"long"},"ETag":{"location":"header","locationName":"ETag"},"MissingMeta":{"location":"header","locationName":"x-amz-missing-meta","type":"integer"},"VersionId":{"location":"header","locationName":"x-amz-version-id"},"CacheControl":{"location":"header","locationName":"Cache-Control"},"ContentDisposition":{"location":"header","locationName":"Content-Disposition"},"ContentEncoding":{"location":"header","locationName":"Content-Encoding"},"ContentLanguage":{"location":"header","locationName":"Content-Language"},"ContentRange":{"location":"header","locationName":"Content-Range"},"ContentType":{"location":"header","locationName":"Content-Type"},"Expires":{"location":"header","locationName":"Expires","type":"timestamp"},"WebsiteRedirectLocation":{"location":"header","locationName":"x-amz-website-redirect-location"},"ServerSideEncryption":{"location":"header","locationName":"x-amz-server-side-encryption"},"Metadata":{"shape":"S11","location":"headers","locationName":"x-amz-meta-"},"SSECustomerAlgorithm":{"location":"header","locationName":"x-amz-server-side-encryption-customer-algorithm"},"SSECustomerKeyMD5":{"location":"header","locationName":"x-amz-server-side-encryption-customer-key-MD5"},"SSEKMSKeyId":{"shape":"Sj","location":"header","locationName":"x-amz-server-side-encryption-aws-kms-key-id"},"StorageClass":{"location":"header","locationName":"x-amz-storage-class"},"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"},"ReplicationStatus":{"location":"header","locationName":"x-amz-replication-status"},"PartsCount":{"location":"header","locationName":"x-amz-mp-parts-count","type":"integer"},"TagCount":{"location":"header","locationName":"x-amz-tagging-count","type":"integer"}},"payload":"Body"}},"GetObjectAcl":{"http":{"method":"GET","requestUri":"/{Bucket}/{Key+}?acl"},"input":{"type":"structure","required":["Bucket","Key"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Key":{"location":"uri","locationName":"Key"},"VersionId":{"location":"querystring","locationName":"versionId"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"}}},"output":{"type":"structure","members":{"Owner":{"shape":"S2v"},"Grants":{"shape":"S2y","locationName":"AccessControlList"},"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"}}}},"GetObjectTagging":{"http":{"method":"GET","requestUri":"/{Bucket}/{Key+}?tagging"},"input":{"type":"structure","required":["Bucket","Key"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Key":{"location":"uri","locationName":"Key"},"VersionId":{"location":"querystring","locationName":"versionId"}}},"output":{"type":"structure","required":["TagSet"],"members":{"VersionId":{"location":"header","locationName":"x-amz-version-id"},"TagSet":{"shape":"S3d"}}}},"GetObjectTorrent":{"http":{"method":"GET","requestUri":"/{Bucket}/{Key+}?torrent"},"input":{"type":"structure","required":["Bucket","Key"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Key":{"location":"uri","locationName":"Key"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"}}},"output":{"type":"structure","members":{"Body":{"streaming":true,"type":"blob"},"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"}},"payload":"Body"}},"HeadBucket":{"http":{"method":"HEAD","requestUri":"/{Bucket}"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}}},"HeadObject":{"http":{"method":"HEAD","requestUri":"/{Bucket}/{Key+}"},"input":{"type":"structure","required":["Bucket","Key"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"IfMatch":{"location":"header","locationName":"If-Match"},"IfModifiedSince":{"location":"header","locationName":"If-Modified-Since","type":"timestamp"},"IfNoneMatch":{"location":"header","locationName":"If-None-Match"},"IfUnmodifiedSince":{"location":"header","locationName":"If-Unmodified-Since","type":"timestamp"},"Key":{"location":"uri","locationName":"Key"},"Range":{"location":"header","locationName":"Range"},"VersionId":{"location":"querystring","locationName":"versionId"},"SSECustomerAlgorithm":{"location":"header","locationName":"x-amz-server-side-encryption-customer-algorithm"},"SSECustomerKey":{"shape":"S19","location":"header","locationName":"x-amz-server-side-encryption-customer-key"},"SSECustomerKeyMD5":{"location":"header","locationName":"x-amz-server-side-encryption-customer-key-MD5"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"},"PartNumber":{"location":"querystring","locationName":"partNumber","type":"integer"}}},"output":{"type":"structure","members":{"DeleteMarker":{"location":"header","locationName":"x-amz-delete-marker","type":"boolean"},"AcceptRanges":{"location":"header","locationName":"accept-ranges"},"Expiration":{"location":"header","locationName":"x-amz-expiration"},"Restore":{"location":"header","locationName":"x-amz-restore"},"LastModified":{"location":"header","locationName":"Last-Modified","type":"timestamp"},"ContentLength":{"location":"header","locationName":"Content-Length","type":"long"},"ETag":{"location":"header","locationName":"ETag"},"MissingMeta":{"location":"header","locationName":"x-amz-missing-meta","type":"integer"},"VersionId":{"location":"header","locationName":"x-amz-version-id"},"CacheControl":{"location":"header","locationName":"Cache-Control"},"ContentDisposition":{"location":"header","locationName":"Content-Disposition"},"ContentEncoding":{"location":"header","locationName":"Content-Encoding"},"ContentLanguage":{"location":"header","locationName":"Content-Language"},"ContentType":{"location":"header","locationName":"Content-Type"},"Expires":{"location":"header","locationName":"Expires","type":"timestamp"},"WebsiteRedirectLocation":{"location":"header","locationName":"x-amz-website-redirect-location"},"ServerSideEncryption":{"location":"header","locationName":"x-amz-server-side-encryption"},"Metadata":{"shape":"S11","location":"headers","locationName":"x-amz-meta-"},"SSECustomerAlgorithm":{"location":"header","locationName":"x-amz-server-side-encryption-customer-algorithm"},"SSECustomerKeyMD5":{"location":"header","locationName":"x-amz-server-side-encryption-customer-key-MD5"},"SSEKMSKeyId":{"shape":"Sj","location":"header","locationName":"x-amz-server-side-encryption-aws-kms-key-id"},"StorageClass":{"location":"header","locationName":"x-amz-storage-class"},"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"},"ReplicationStatus":{"location":"header","locationName":"x-amz-replication-status"},"PartsCount":{"location":"header","locationName":"x-amz-mp-parts-count","type":"integer"}}}},"ListBucketAnalyticsConfigurations":{"http":{"method":"GET","requestUri":"/{Bucket}?analytics"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"ContinuationToken":{"location":"querystring","locationName":"continuation-token"}}},"output":{"type":"structure","members":{"IsTruncated":{"type":"boolean"},"ContinuationToken":{},"NextContinuationToken":{},"AnalyticsConfigurationList":{"locationName":"AnalyticsConfiguration","type":"list","member":{"shape":"S37"},"flattened":true}}}},"ListBucketInventoryConfigurations":{"http":{"method":"GET","requestUri":"/{Bucket}?inventory"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"ContinuationToken":{"location":"querystring","locationName":"continuation-token"}}},"output":{"type":"structure","members":{"ContinuationToken":{},"InventoryConfigurationList":{"locationName":"InventoryConfiguration","type":"list","member":{"shape":"S46"},"flattened":true},"IsTruncated":{"type":"boolean"},"NextContinuationToken":{}}}},"ListBucketMetricsConfigurations":{"http":{"method":"GET","requestUri":"/{Bucket}?metrics"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"ContinuationToken":{"location":"querystring","locationName":"continuation-token"}}},"output":{"type":"structure","members":{"IsTruncated":{"type":"boolean"},"ContinuationToken":{},"NextContinuationToken":{},"MetricsConfigurationList":{"locationName":"MetricsConfiguration","type":"list","member":{"shape":"S5j"},"flattened":true}}}},"ListBuckets":{"http":{"method":"GET"},"output":{"type":"structure","members":{"Buckets":{"type":"list","member":{"locationName":"Bucket","type":"structure","members":{"Name":{},"CreationDate":{"type":"timestamp"}}}},"Owner":{"shape":"S2v"}}},"alias":"GetService"},"ListMultipartUploads":{"http":{"method":"GET","requestUri":"/{Bucket}?uploads"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Delimiter":{"location":"querystring","locationName":"delimiter"},"EncodingType":{"location":"querystring","locationName":"encoding-type"},"KeyMarker":{"location":"querystring","locationName":"key-marker"},"MaxUploads":{"location":"querystring","locationName":"max-uploads","type":"integer"},"Prefix":{"location":"querystring","locationName":"prefix"},"UploadIdMarker":{"location":"querystring","locationName":"upload-id-marker"}}},"output":{"type":"structure","members":{"Bucket":{},"KeyMarker":{},"UploadIdMarker":{},"NextKeyMarker":{},"Prefix":{},"Delimiter":{},"NextUploadIdMarker":{},"MaxUploads":{"type":"integer"},"IsTruncated":{"type":"boolean"},"Uploads":{"locationName":"Upload","type":"list","member":{"type":"structure","members":{"UploadId":{},"Key":{},"Initiated":{"type":"timestamp"},"StorageClass":{},"Owner":{"shape":"S2v"},"Initiator":{"shape":"S97"}}},"flattened":true},"CommonPrefixes":{"shape":"S98"},"EncodingType":{}}}},"ListObjectVersions":{"http":{"method":"GET","requestUri":"/{Bucket}?versions"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Delimiter":{"location":"querystring","locationName":"delimiter"},"EncodingType":{"location":"querystring","locationName":"encoding-type"},"KeyMarker":{"location":"querystring","locationName":"key-marker"},"MaxKeys":{"location":"querystring","locationName":"max-keys","type":"integer"},"Prefix":{"location":"querystring","locationName":"prefix"},"VersionIdMarker":{"location":"querystring","locationName":"version-id-marker"}}},"output":{"type":"structure","members":{"IsTruncated":{"type":"boolean"},"KeyMarker":{},"VersionIdMarker":{},"NextKeyMarker":{},"NextVersionIdMarker":{},"Versions":{"locationName":"Version","type":"list","member":{"type":"structure","members":{"ETag":{},"Size":{"type":"integer"},"StorageClass":{},"Key":{},"VersionId":{},"IsLatest":{"type":"boolean"},"LastModified":{"type":"timestamp"},"Owner":{"shape":"S2v"}}},"flattened":true},"DeleteMarkers":{"locationName":"DeleteMarker","type":"list","member":{"type":"structure","members":{"Owner":{"shape":"S2v"},"Key":{},"VersionId":{},"IsLatest":{"type":"boolean"},"LastModified":{"type":"timestamp"}}},"flattened":true},"Name":{},"Prefix":{},"Delimiter":{},"MaxKeys":{"type":"integer"},"CommonPrefixes":{"shape":"S98"},"EncodingType":{}}},"alias":"GetBucketObjectVersions"},"ListObjects":{"http":{"method":"GET","requestUri":"/{Bucket}"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Delimiter":{"location":"querystring","locationName":"delimiter"},"EncodingType":{"location":"querystring","locationName":"encoding-type"},"Marker":{"location":"querystring","locationName":"marker"},"MaxKeys":{"location":"querystring","locationName":"max-keys","type":"integer"},"Prefix":{"location":"querystring","locationName":"prefix"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"}}},"output":{"type":"structure","members":{"IsTruncated":{"type":"boolean"},"Marker":{},"NextMarker":{},"Contents":{"shape":"S9q"},"Name":{},"Prefix":{},"Delimiter":{},"MaxKeys":{"type":"integer"},"CommonPrefixes":{"shape":"S98"},"EncodingType":{}}},"alias":"GetBucket"},"ListObjectsV2":{"http":{"method":"GET","requestUri":"/{Bucket}?list-type=2"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Delimiter":{"location":"querystring","locationName":"delimiter"},"EncodingType":{"location":"querystring","locationName":"encoding-type"},"MaxKeys":{"location":"querystring","locationName":"max-keys","type":"integer"},"Prefix":{"location":"querystring","locationName":"prefix"},"ContinuationToken":{"location":"querystring","locationName":"continuation-token"},"FetchOwner":{"location":"querystring","locationName":"fetch-owner","type":"boolean"},"StartAfter":{"location":"querystring","locationName":"start-after"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"}}},"output":{"type":"structure","members":{"IsTruncated":{"type":"boolean"},"Contents":{"shape":"S9q"},"Name":{},"Prefix":{},"Delimiter":{},"MaxKeys":{"type":"integer"},"CommonPrefixes":{"shape":"S98"},"EncodingType":{},"KeyCount":{"type":"integer"},"ContinuationToken":{},"NextContinuationToken":{},"StartAfter":{}}}},"ListParts":{"http":{"method":"GET","requestUri":"/{Bucket}/{Key+}"},"input":{"type":"structure","required":["Bucket","Key","UploadId"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Key":{"location":"uri","locationName":"Key"},"MaxParts":{"location":"querystring","locationName":"max-parts","type":"integer"},"PartNumberMarker":{"location":"querystring","locationName":"part-number-marker","type":"integer"},"UploadId":{"location":"querystring","locationName":"uploadId"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"}}},"output":{"type":"structure","members":{"AbortDate":{"location":"header","locationName":"x-amz-abort-date","type":"timestamp"},"AbortRuleId":{"location":"header","locationName":"x-amz-abort-rule-id"},"Bucket":{},"Key":{},"UploadId":{},"PartNumberMarker":{"type":"integer"},"NextPartNumberMarker":{"type":"integer"},"MaxParts":{"type":"integer"},"IsTruncated":{"type":"boolean"},"Parts":{"locationName":"Part","type":"list","member":{"type":"structure","members":{"PartNumber":{"type":"integer"},"LastModified":{"type":"timestamp"},"ETag":{},"Size":{"type":"integer"}}},"flattened":true},"Initiator":{"shape":"S97"},"Owner":{"shape":"S2v"},"StorageClass":{},"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"}}}},"PutBucketAccelerateConfiguration":{"http":{"method":"PUT","requestUri":"/{Bucket}?accelerate"},"input":{"type":"structure","required":["Bucket","AccelerateConfiguration"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"AccelerateConfiguration":{"locationName":"AccelerateConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"},"type":"structure","members":{"Status":{}}}},"payload":"AccelerateConfiguration"}},"PutBucketAcl":{"http":{"method":"PUT","requestUri":"/{Bucket}?acl"},"input":{"type":"structure","required":["Bucket"],"members":{"ACL":{"location":"header","locationName":"x-amz-acl"},"AccessControlPolicy":{"shape":"Sa8","locationName":"AccessControlPolicy","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"}},"Bucket":{"location":"uri","locationName":"Bucket"},"ContentMD5":{"location":"header","locationName":"Content-MD5"},"GrantFullControl":{"location":"header","locationName":"x-amz-grant-full-control"},"GrantRead":{"location":"header","locationName":"x-amz-grant-read"},"GrantReadACP":{"location":"header","locationName":"x-amz-grant-read-acp"},"GrantWrite":{"location":"header","locationName":"x-amz-grant-write"},"GrantWriteACP":{"location":"header","locationName":"x-amz-grant-write-acp"}},"payload":"AccessControlPolicy"}},"PutBucketAnalyticsConfiguration":{"http":{"method":"PUT","requestUri":"/{Bucket}?analytics"},"input":{"type":"structure","required":["Bucket","Id","AnalyticsConfiguration"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Id":{"location":"querystring","locationName":"id"},"AnalyticsConfiguration":{"shape":"S37","locationName":"AnalyticsConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"}}},"payload":"AnalyticsConfiguration"}},"PutBucketCors":{"http":{"method":"PUT","requestUri":"/{Bucket}?cors"},"input":{"type":"structure","required":["Bucket","CORSConfiguration"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"CORSConfiguration":{"locationName":"CORSConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"},"type":"structure","required":["CORSRules"],"members":{"CORSRules":{"shape":"S3n","locationName":"CORSRule"}}},"ContentMD5":{"location":"header","locationName":"Content-MD5"}},"payload":"CORSConfiguration"}},"PutBucketEncryption":{"http":{"method":"PUT","requestUri":"/{Bucket}?encryption"},"input":{"type":"structure","required":["Bucket","ServerSideEncryptionConfiguration"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"ContentMD5":{"location":"header","locationName":"Content-MD5"},"ServerSideEncryptionConfiguration":{"shape":"S40","locationName":"ServerSideEncryptionConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"}}},"payload":"ServerSideEncryptionConfiguration"}},"PutBucketInventoryConfiguration":{"http":{"method":"PUT","requestUri":"/{Bucket}?inventory"},"input":{"type":"structure","required":["Bucket","Id","InventoryConfiguration"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Id":{"location":"querystring","locationName":"id"},"InventoryConfiguration":{"shape":"S46","locationName":"InventoryConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"}}},"payload":"InventoryConfiguration"}},"PutBucketLifecycle":{"http":{"method":"PUT","requestUri":"/{Bucket}?lifecycle"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"ContentMD5":{"location":"header","locationName":"Content-MD5"},"LifecycleConfiguration":{"locationName":"LifecycleConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"},"type":"structure","required":["Rules"],"members":{"Rules":{"shape":"S4m","locationName":"Rule"}}}},"payload":"LifecycleConfiguration"},"deprecated":true},"PutBucketLifecycleConfiguration":{"http":{"method":"PUT","requestUri":"/{Bucket}?lifecycle"},"input":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"LifecycleConfiguration":{"locationName":"LifecycleConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"},"type":"structure","required":["Rules"],"members":{"Rules":{"shape":"S51","locationName":"Rule"}}}},"payload":"LifecycleConfiguration"}},"PutBucketLogging":{"http":{"method":"PUT","requestUri":"/{Bucket}?logging"},"input":{"type":"structure","required":["Bucket","BucketLoggingStatus"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"BucketLoggingStatus":{"locationName":"BucketLoggingStatus","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"},"type":"structure","members":{"LoggingEnabled":{"shape":"S5b"}}},"ContentMD5":{"location":"header","locationName":"Content-MD5"}},"payload":"BucketLoggingStatus"}},"PutBucketMetricsConfiguration":{"http":{"method":"PUT","requestUri":"/{Bucket}?metrics"},"input":{"type":"structure","required":["Bucket","Id","MetricsConfiguration"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Id":{"location":"querystring","locationName":"id"},"MetricsConfiguration":{"shape":"S5j","locationName":"MetricsConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"}}},"payload":"MetricsConfiguration"}},"PutBucketNotification":{"http":{"method":"PUT","requestUri":"/{Bucket}?notification"},"input":{"type":"structure","required":["Bucket","NotificationConfiguration"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"ContentMD5":{"location":"header","locationName":"Content-MD5"},"NotificationConfiguration":{"shape":"S5n","locationName":"NotificationConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"}}},"payload":"NotificationConfiguration"},"deprecated":true},"PutBucketNotificationConfiguration":{"http":{"method":"PUT","requestUri":"/{Bucket}?notification"},"input":{"type":"structure","required":["Bucket","NotificationConfiguration"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"NotificationConfiguration":{"shape":"S5y","locationName":"NotificationConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"}}},"payload":"NotificationConfiguration"}},"PutBucketPolicy":{"http":{"method":"PUT","requestUri":"/{Bucket}?policy"},"input":{"type":"structure","required":["Bucket","Policy"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"ContentMD5":{"location":"header","locationName":"Content-MD5"},"ConfirmRemoveSelfBucketAccess":{"location":"header","locationName":"x-amz-confirm-remove-self-bucket-access","type":"boolean"},"Policy":{}},"payload":"Policy"}},"PutBucketReplication":{"http":{"method":"PUT","requestUri":"/{Bucket}?replication"},"input":{"type":"structure","required":["Bucket","ReplicationConfiguration"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"ContentMD5":{"location":"header","locationName":"Content-MD5"},"ReplicationConfiguration":{"shape":"S6h","locationName":"ReplicationConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"}}},"payload":"ReplicationConfiguration"}},"PutBucketRequestPayment":{"http":{"method":"PUT","requestUri":"/{Bucket}?requestPayment"},"input":{"type":"structure","required":["Bucket","RequestPaymentConfiguration"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"ContentMD5":{"location":"header","locationName":"Content-MD5"},"RequestPaymentConfiguration":{"locationName":"RequestPaymentConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"},"type":"structure","required":["Payer"],"members":{"Payer":{}}}},"payload":"RequestPaymentConfiguration"}},"PutBucketTagging":{"http":{"method":"PUT","requestUri":"/{Bucket}?tagging"},"input":{"type":"structure","required":["Bucket","Tagging"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"ContentMD5":{"location":"header","locationName":"Content-MD5"},"Tagging":{"shape":"Sau","locationName":"Tagging","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"}}},"payload":"Tagging"}},"PutBucketVersioning":{"http":{"method":"PUT","requestUri":"/{Bucket}?versioning"},"input":{"type":"structure","required":["Bucket","VersioningConfiguration"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"ContentMD5":{"location":"header","locationName":"Content-MD5"},"MFA":{"location":"header","locationName":"x-amz-mfa"},"VersioningConfiguration":{"locationName":"VersioningConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"},"type":"structure","members":{"MFADelete":{"locationName":"MfaDelete"},"Status":{}}}},"payload":"VersioningConfiguration"}},"PutBucketWebsite":{"http":{"method":"PUT","requestUri":"/{Bucket}?website"},"input":{"type":"structure","required":["Bucket","WebsiteConfiguration"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"ContentMD5":{"location":"header","locationName":"Content-MD5"},"WebsiteConfiguration":{"locationName":"WebsiteConfiguration","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"},"type":"structure","members":{"ErrorDocument":{"shape":"S7a"},"IndexDocument":{"shape":"S78"},"RedirectAllRequestsTo":{"shape":"S75"},"RoutingRules":{"shape":"S7b"}}}},"payload":"WebsiteConfiguration"}},"PutObject":{"http":{"method":"PUT","requestUri":"/{Bucket}/{Key+}"},"input":{"type":"structure","required":["Bucket","Key"],"members":{"ACL":{"location":"header","locationName":"x-amz-acl"},"Body":{"streaming":true,"type":"blob"},"Bucket":{"location":"uri","locationName":"Bucket"},"CacheControl":{"location":"header","locationName":"Cache-Control"},"ContentDisposition":{"location":"header","locationName":"Content-Disposition"},"ContentEncoding":{"location":"header","locationName":"Content-Encoding"},"ContentLanguage":{"location":"header","locationName":"Content-Language"},"ContentLength":{"location":"header","locationName":"Content-Length","type":"long"},"ContentMD5":{"location":"header","locationName":"Content-MD5"},"ContentType":{"location":"header","locationName":"Content-Type"},"Expires":{"location":"header","locationName":"Expires","type":"timestamp"},"GrantFullControl":{"location":"header","locationName":"x-amz-grant-full-control"},"GrantRead":{"location":"header","locationName":"x-amz-grant-read"},"GrantReadACP":{"location":"header","locationName":"x-amz-grant-read-acp"},"GrantWriteACP":{"location":"header","locationName":"x-amz-grant-write-acp"},"Key":{"location":"uri","locationName":"Key"},"Metadata":{"shape":"S11","location":"headers","locationName":"x-amz-meta-"},"ServerSideEncryption":{"location":"header","locationName":"x-amz-server-side-encryption"},"StorageClass":{"location":"header","locationName":"x-amz-storage-class"},"WebsiteRedirectLocation":{"location":"header","locationName":"x-amz-website-redirect-location"},"SSECustomerAlgorithm":{"location":"header","locationName":"x-amz-server-side-encryption-customer-algorithm"},"SSECustomerKey":{"shape":"S19","location":"header","locationName":"x-amz-server-side-encryption-customer-key"},"SSECustomerKeyMD5":{"location":"header","locationName":"x-amz-server-side-encryption-customer-key-MD5"},"SSEKMSKeyId":{"shape":"Sj","location":"header","locationName":"x-amz-server-side-encryption-aws-kms-key-id"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"},"Tagging":{"location":"header","locationName":"x-amz-tagging"}},"payload":"Body"},"output":{"type":"structure","members":{"Expiration":{"location":"header","locationName":"x-amz-expiration"},"ETag":{"location":"header","locationName":"ETag"},"ServerSideEncryption":{"location":"header","locationName":"x-amz-server-side-encryption"},"VersionId":{"location":"header","locationName":"x-amz-version-id"},"SSECustomerAlgorithm":{"location":"header","locationName":"x-amz-server-side-encryption-customer-algorithm"},"SSECustomerKeyMD5":{"location":"header","locationName":"x-amz-server-side-encryption-customer-key-MD5"},"SSEKMSKeyId":{"shape":"Sj","location":"header","locationName":"x-amz-server-side-encryption-aws-kms-key-id"},"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"}}}},"PutObjectAcl":{"http":{"method":"PUT","requestUri":"/{Bucket}/{Key+}?acl"},"input":{"type":"structure","required":["Bucket","Key"],"members":{"ACL":{"location":"header","locationName":"x-amz-acl"},"AccessControlPolicy":{"shape":"Sa8","locationName":"AccessControlPolicy","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"}},"Bucket":{"location":"uri","locationName":"Bucket"},"ContentMD5":{"location":"header","locationName":"Content-MD5"},"GrantFullControl":{"location":"header","locationName":"x-amz-grant-full-control"},"GrantRead":{"location":"header","locationName":"x-amz-grant-read"},"GrantReadACP":{"location":"header","locationName":"x-amz-grant-read-acp"},"GrantWrite":{"location":"header","locationName":"x-amz-grant-write"},"GrantWriteACP":{"location":"header","locationName":"x-amz-grant-write-acp"},"Key":{"location":"uri","locationName":"Key"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"},"VersionId":{"location":"querystring","locationName":"versionId"}},"payload":"AccessControlPolicy"},"output":{"type":"structure","members":{"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"}}}},"PutObjectTagging":{"http":{"method":"PUT","requestUri":"/{Bucket}/{Key+}?tagging"},"input":{"type":"structure","required":["Bucket","Key","Tagging"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Key":{"location":"uri","locationName":"Key"},"VersionId":{"location":"querystring","locationName":"versionId"},"ContentMD5":{"location":"header","locationName":"Content-MD5"},"Tagging":{"shape":"Sau","locationName":"Tagging","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"}}},"payload":"Tagging"},"output":{"type":"structure","members":{"VersionId":{"location":"header","locationName":"x-amz-version-id"}}}},"RestoreObject":{"http":{"requestUri":"/{Bucket}/{Key+}?restore"},"input":{"type":"structure","required":["Bucket","Key"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"Key":{"location":"uri","locationName":"Key"},"VersionId":{"location":"querystring","locationName":"versionId"},"RestoreRequest":{"locationName":"RestoreRequest","xmlNamespace":{"uri":"http://s3.amazonaws.com/doc/2006-03-01/"},"type":"structure","members":{"Days":{"type":"integer"},"GlacierJobParameters":{"type":"structure","required":["Tier"],"members":{"Tier":{}}},"Type":{},"Tier":{},"Description":{},"SelectParameters":{"type":"structure","required":["InputSerialization","ExpressionType","Expression","OutputSerialization"],"members":{"InputSerialization":{"type":"structure","members":{"CSV":{"type":"structure","members":{"FileHeaderInfo":{},"Comments":{},"QuoteEscapeCharacter":{},"RecordDelimiter":{},"FieldDelimiter":{},"QuoteCharacter":{}}}}},"ExpressionType":{},"Expression":{},"OutputSerialization":{"type":"structure","members":{"CSV":{"type":"structure","members":{"QuoteFields":{},"QuoteEscapeCharacter":{},"RecordDelimiter":{},"FieldDelimiter":{},"QuoteCharacter":{}}}}}}},"OutputLocation":{"type":"structure","members":{"S3":{"type":"structure","required":["BucketName","Prefix"],"members":{"BucketName":{},"Prefix":{},"Encryption":{"type":"structure","required":["EncryptionType"],"members":{"EncryptionType":{},"KMSKeyId":{"shape":"Sj"},"KMSContext":{}}},"CannedACL":{},"AccessControlList":{"shape":"S2y"},"Tagging":{"shape":"Sau"},"UserMetadata":{"type":"list","member":{"locationName":"MetadataEntry","type":"structure","members":{"Name":{},"Value":{}}}},"StorageClass":{}}}}}}},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"}},"payload":"RestoreRequest"},"output":{"type":"structure","members":{"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"},"RestoreOutputPath":{"location":"header","locationName":"x-amz-restore-output-path"}}},"alias":"PostObjectRestore"},"UploadPart":{"http":{"method":"PUT","requestUri":"/{Bucket}/{Key+}"},"input":{"type":"structure","required":["Bucket","Key","PartNumber","UploadId"],"members":{"Body":{"streaming":true,"type":"blob"},"Bucket":{"location":"uri","locationName":"Bucket"},"ContentLength":{"location":"header","locationName":"Content-Length","type":"long"},"ContentMD5":{"location":"header","locationName":"Content-MD5"},"Key":{"location":"uri","locationName":"Key"},"PartNumber":{"location":"querystring","locationName":"partNumber","type":"integer"},"UploadId":{"location":"querystring","locationName":"uploadId"},"SSECustomerAlgorithm":{"location":"header","locationName":"x-amz-server-side-encryption-customer-algorithm"},"SSECustomerKey":{"shape":"S19","location":"header","locationName":"x-amz-server-side-encryption-customer-key"},"SSECustomerKeyMD5":{"location":"header","locationName":"x-amz-server-side-encryption-customer-key-MD5"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"}},"payload":"Body"},"output":{"type":"structure","members":{"ServerSideEncryption":{"location":"header","locationName":"x-amz-server-side-encryption"},"ETag":{"location":"header","locationName":"ETag"},"SSECustomerAlgorithm":{"location":"header","locationName":"x-amz-server-side-encryption-customer-algorithm"},"SSECustomerKeyMD5":{"location":"header","locationName":"x-amz-server-side-encryption-customer-key-MD5"},"SSEKMSKeyId":{"shape":"Sj","location":"header","locationName":"x-amz-server-side-encryption-aws-kms-key-id"},"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"}}}},"UploadPartCopy":{"http":{"method":"PUT","requestUri":"/{Bucket}/{Key+}"},"input":{"type":"structure","required":["Bucket","CopySource","Key","PartNumber","UploadId"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"},"CopySource":{"location":"header","locationName":"x-amz-copy-source"},"CopySourceIfMatch":{"location":"header","locationName":"x-amz-copy-source-if-match"},"CopySourceIfModifiedSince":{"location":"header","locationName":"x-amz-copy-source-if-modified-since","type":"timestamp"},"CopySourceIfNoneMatch":{"location":"header","locationName":"x-amz-copy-source-if-none-match"},"CopySourceIfUnmodifiedSince":{"location":"header","locationName":"x-amz-copy-source-if-unmodified-since","type":"timestamp"},"CopySourceRange":{"location":"header","locationName":"x-amz-copy-source-range"},"Key":{"location":"uri","locationName":"Key"},"PartNumber":{"location":"querystring","locationName":"partNumber","type":"integer"},"UploadId":{"location":"querystring","locationName":"uploadId"},"SSECustomerAlgorithm":{"location":"header","locationName":"x-amz-server-side-encryption-customer-algorithm"},"SSECustomerKey":{"shape":"S19","location":"header","locationName":"x-amz-server-side-encryption-customer-key"},"SSECustomerKeyMD5":{"location":"header","locationName":"x-amz-server-side-encryption-customer-key-MD5"},"CopySourceSSECustomerAlgorithm":{"location":"header","locationName":"x-amz-copy-source-server-side-encryption-customer-algorithm"},"CopySourceSSECustomerKey":{"shape":"S1c","location":"header","locationName":"x-amz-copy-source-server-side-encryption-customer-key"},"CopySourceSSECustomerKeyMD5":{"location":"header","locationName":"x-amz-copy-source-server-side-encryption-customer-key-MD5"},"RequestPayer":{"location":"header","locationName":"x-amz-request-payer"}}},"output":{"type":"structure","members":{"CopySourceVersionId":{"location":"header","locationName":"x-amz-copy-source-version-id"},"CopyPartResult":{"type":"structure","members":{"ETag":{},"LastModified":{"type":"timestamp"}}},"ServerSideEncryption":{"location":"header","locationName":"x-amz-server-side-encryption"},"SSECustomerAlgorithm":{"location":"header","locationName":"x-amz-server-side-encryption-customer-algorithm"},"SSECustomerKeyMD5":{"location":"header","locationName":"x-amz-server-side-encryption-customer-key-MD5"},"SSEKMSKeyId":{"shape":"Sj","location":"header","locationName":"x-amz-server-side-encryption-aws-kms-key-id"},"RequestCharged":{"location":"header","locationName":"x-amz-request-charged"}},"payload":"CopyPartResult"}}};
var shapes$4 = {"Sj":{"type":"string","sensitive":true},"S11":{"type":"map","key":{},"value":{}},"S19":{"type":"blob","sensitive":true},"S1c":{"type":"blob","sensitive":true},"S2v":{"type":"structure","members":{"DisplayName":{},"ID":{}}},"S2y":{"type":"list","member":{"locationName":"Grant","type":"structure","members":{"Grantee":{"shape":"S30"},"Permission":{}}}},"S30":{"type":"structure","required":["Type"],"members":{"DisplayName":{},"EmailAddress":{},"ID":{},"Type":{"locationName":"xsi:type","xmlAttribute":true},"URI":{}},"xmlNamespace":{"prefix":"xsi","uri":"http://www.w3.org/2001/XMLSchema-instance"}},"S37":{"type":"structure","required":["Id","StorageClassAnalysis"],"members":{"Id":{},"Filter":{"type":"structure","members":{"Prefix":{},"Tag":{"shape":"S3a"},"And":{"type":"structure","members":{"Prefix":{},"Tags":{"shape":"S3d","flattened":true,"locationName":"Tag"}}}}},"StorageClassAnalysis":{"type":"structure","members":{"DataExport":{"type":"structure","required":["OutputSchemaVersion","Destination"],"members":{"OutputSchemaVersion":{},"Destination":{"type":"structure","required":["S3BucketDestination"],"members":{"S3BucketDestination":{"type":"structure","required":["Format","Bucket"],"members":{"Format":{},"BucketAccountId":{},"Bucket":{},"Prefix":{}}}}}}}}}}},"S3a":{"type":"structure","required":["Key","Value"],"members":{"Key":{},"Value":{}}},"S3d":{"type":"list","member":{"shape":"S3a","locationName":"Tag"}},"S3n":{"type":"list","member":{"type":"structure","required":["AllowedMethods","AllowedOrigins"],"members":{"AllowedHeaders":{"locationName":"AllowedHeader","type":"list","member":{},"flattened":true},"AllowedMethods":{"locationName":"AllowedMethod","type":"list","member":{},"flattened":true},"AllowedOrigins":{"locationName":"AllowedOrigin","type":"list","member":{},"flattened":true},"ExposeHeaders":{"locationName":"ExposeHeader","type":"list","member":{},"flattened":true},"MaxAgeSeconds":{"type":"integer"}}},"flattened":true},"S40":{"type":"structure","required":["Rules"],"members":{"Rules":{"locationName":"Rule","type":"list","member":{"type":"structure","members":{"ApplyServerSideEncryptionByDefault":{"type":"structure","required":["SSEAlgorithm"],"members":{"SSEAlgorithm":{},"KMSMasterKeyID":{"shape":"Sj"}}}}},"flattened":true}}},"S46":{"type":"structure","required":["Destination","IsEnabled","Id","IncludedObjectVersions","Schedule"],"members":{"Destination":{"type":"structure","required":["S3BucketDestination"],"members":{"S3BucketDestination":{"type":"structure","required":["Bucket","Format"],"members":{"AccountId":{},"Bucket":{},"Format":{},"Prefix":{},"Encryption":{"type":"structure","members":{"SSES3":{"locationName":"SSE-S3","type":"structure","members":{}},"SSEKMS":{"locationName":"SSE-KMS","type":"structure","required":["KeyId"],"members":{"KeyId":{"shape":"Sj"}}}}}}}}},"IsEnabled":{"type":"boolean"},"Filter":{"type":"structure","required":["Prefix"],"members":{"Prefix":{}}},"Id":{},"IncludedObjectVersions":{},"OptionalFields":{"type":"list","member":{"locationName":"Field"}},"Schedule":{"type":"structure","required":["Frequency"],"members":{"Frequency":{}}}}},"S4m":{"type":"list","member":{"type":"structure","required":["Prefix","Status"],"members":{"Expiration":{"shape":"S4o"},"ID":{},"Prefix":{},"Status":{},"Transition":{"shape":"S4t"},"NoncurrentVersionTransition":{"shape":"S4v"},"NoncurrentVersionExpiration":{"shape":"S4w"},"AbortIncompleteMultipartUpload":{"shape":"S4x"}}},"flattened":true},"S4o":{"type":"structure","members":{"Date":{"shape":"S4p"},"Days":{"type":"integer"},"ExpiredObjectDeleteMarker":{"type":"boolean"}}},"S4p":{"type":"timestamp","timestampFormat":"iso8601"},"S4t":{"type":"structure","members":{"Date":{"shape":"S4p"},"Days":{"type":"integer"},"StorageClass":{}}},"S4v":{"type":"structure","members":{"NoncurrentDays":{"type":"integer"},"StorageClass":{}}},"S4w":{"type":"structure","members":{"NoncurrentDays":{"type":"integer"}}},"S4x":{"type":"structure","members":{"DaysAfterInitiation":{"type":"integer"}}},"S51":{"type":"list","member":{"type":"structure","required":["Status"],"members":{"Expiration":{"shape":"S4o"},"ID":{},"Prefix":{"deprecated":true},"Filter":{"type":"structure","members":{"Prefix":{},"Tag":{"shape":"S3a"},"And":{"type":"structure","members":{"Prefix":{},"Tags":{"shape":"S3d","flattened":true,"locationName":"Tag"}}}}},"Status":{},"Transitions":{"locationName":"Transition","type":"list","member":{"shape":"S4t"},"flattened":true},"NoncurrentVersionTransitions":{"locationName":"NoncurrentVersionTransition","type":"list","member":{"shape":"S4v"},"flattened":true},"NoncurrentVersionExpiration":{"shape":"S4w"},"AbortIncompleteMultipartUpload":{"shape":"S4x"}}},"flattened":true},"S5b":{"type":"structure","members":{"TargetBucket":{},"TargetGrants":{"type":"list","member":{"locationName":"Grant","type":"structure","members":{"Grantee":{"shape":"S30"},"Permission":{}}}},"TargetPrefix":{}}},"S5j":{"type":"structure","required":["Id"],"members":{"Id":{},"Filter":{"type":"structure","members":{"Prefix":{},"Tag":{"shape":"S3a"},"And":{"type":"structure","members":{"Prefix":{},"Tags":{"shape":"S3d","flattened":true,"locationName":"Tag"}}}}}}},"S5m":{"type":"structure","required":["Bucket"],"members":{"Bucket":{"location":"uri","locationName":"Bucket"}}},"S5n":{"type":"structure","members":{"TopicConfiguration":{"type":"structure","members":{"Id":{},"Events":{"shape":"S5q","locationName":"Event"},"Event":{"deprecated":true},"Topic":{}}},"QueueConfiguration":{"type":"structure","members":{"Id":{},"Event":{"deprecated":true},"Events":{"shape":"S5q","locationName":"Event"},"Queue":{}}},"CloudFunctionConfiguration":{"type":"structure","members":{"Id":{},"Event":{"deprecated":true},"Events":{"shape":"S5q","locationName":"Event"},"CloudFunction":{},"InvocationRole":{}}}}},"S5q":{"type":"list","member":{},"flattened":true},"S5y":{"type":"structure","members":{"TopicConfigurations":{"locationName":"TopicConfiguration","type":"list","member":{"type":"structure","required":["TopicArn","Events"],"members":{"Id":{},"TopicArn":{"locationName":"Topic"},"Events":{"shape":"S5q","locationName":"Event"},"Filter":{"shape":"S61"}}},"flattened":true},"QueueConfigurations":{"locationName":"QueueConfiguration","type":"list","member":{"type":"structure","required":["QueueArn","Events"],"members":{"Id":{},"QueueArn":{"locationName":"Queue"},"Events":{"shape":"S5q","locationName":"Event"},"Filter":{"shape":"S61"}}},"flattened":true},"LambdaFunctionConfigurations":{"locationName":"CloudFunctionConfiguration","type":"list","member":{"type":"structure","required":["LambdaFunctionArn","Events"],"members":{"Id":{},"LambdaFunctionArn":{"locationName":"CloudFunction"},"Events":{"shape":"S5q","locationName":"Event"},"Filter":{"shape":"S61"}}},"flattened":true}}},"S61":{"type":"structure","members":{"Key":{"locationName":"S3Key","type":"structure","members":{"FilterRules":{"locationName":"FilterRule","type":"list","member":{"type":"structure","members":{"Name":{},"Value":{}}},"flattened":true}}}}},"S6h":{"type":"structure","required":["Role","Rules"],"members":{"Role":{},"Rules":{"locationName":"Rule","type":"list","member":{"type":"structure","required":["Prefix","Status","Destination"],"members":{"ID":{},"Prefix":{},"Status":{},"SourceSelectionCriteria":{"type":"structure","members":{"SseKmsEncryptedObjects":{"type":"structure","required":["Status"],"members":{"Status":{}}}}},"Destination":{"type":"structure","required":["Bucket"],"members":{"Bucket":{},"Account":{},"StorageClass":{},"AccessControlTranslation":{"type":"structure","required":["Owner"],"members":{"Owner":{}}},"EncryptionConfiguration":{"type":"structure","members":{"ReplicaKmsKeyID":{}}}}}}},"flattened":true}}},"S75":{"type":"structure","required":["HostName"],"members":{"HostName":{},"Protocol":{}}},"S78":{"type":"structure","required":["Suffix"],"members":{"Suffix":{}}},"S7a":{"type":"structure","required":["Key"],"members":{"Key":{}}},"S7b":{"type":"list","member":{"locationName":"RoutingRule","type":"structure","required":["Redirect"],"members":{"Condition":{"type":"structure","members":{"HttpErrorCodeReturnedEquals":{},"KeyPrefixEquals":{}}},"Redirect":{"type":"structure","members":{"HostName":{},"HttpRedirectCode":{},"Protocol":{},"ReplaceKeyPrefixWith":{},"ReplaceKeyWith":{}}}}}},"S97":{"type":"structure","members":{"ID":{},"DisplayName":{}}},"S98":{"type":"list","member":{"type":"structure","members":{"Prefix":{}}},"flattened":true},"S9q":{"type":"list","member":{"type":"structure","members":{"Key":{},"LastModified":{"type":"timestamp"},"ETag":{},"Size":{"type":"integer"},"StorageClass":{},"Owner":{"shape":"S2v"}}},"flattened":true},"Sa8":{"type":"structure","members":{"Grants":{"shape":"S2y","locationName":"AccessControlList"},"Owner":{"shape":"S2v"}}},"Sau":{"type":"structure","required":["TagSet"],"members":{"TagSet":{"shape":"S3d"}}}};
var s320060301_min = {
	version: version$6,
	metadata: metadata$6,
	operations: operations$4,
	shapes: shapes$4
};

var s320060301_min$1 = Object.freeze({
	version: version$6,
	metadata: metadata$6,
	operations: operations$4,
	shapes: shapes$4,
	default: s320060301_min
});

var pagination$4 = {"ListBuckets":{"result_key":"Buckets"},"ListMultipartUploads":{"input_token":["KeyMarker","UploadIdMarker"],"limit_key":"MaxUploads","more_results":"IsTruncated","output_token":["NextKeyMarker","NextUploadIdMarker"],"result_key":["Uploads","CommonPrefixes"]},"ListObjectVersions":{"input_token":["KeyMarker","VersionIdMarker"],"limit_key":"MaxKeys","more_results":"IsTruncated","output_token":["NextKeyMarker","NextVersionIdMarker"],"result_key":["Versions","DeleteMarkers","CommonPrefixes"]},"ListObjects":{"input_token":"Marker","limit_key":"MaxKeys","more_results":"IsTruncated","output_token":"NextMarker || Contents[-1].Key","result_key":["Contents","CommonPrefixes"]},"ListObjectsV2":{"input_token":"ContinuationToken","limit_key":"MaxKeys","output_token":"NextContinuationToken","result_key":["Contents","CommonPrefixes"]},"ListParts":{"input_token":"PartNumberMarker","limit_key":"MaxParts","more_results":"IsTruncated","output_token":"NextPartNumberMarker","result_key":"Parts"}};
var s320060301_paginators = {
	pagination: pagination$4
};

var s320060301_paginators$1 = Object.freeze({
	pagination: pagination$4,
	default: s320060301_paginators
});

var version$7 = 2;
var waiters$2 = {"BucketExists":{"delay":5,"operation":"HeadBucket","maxAttempts":20,"acceptors":[{"expected":200,"matcher":"status","state":"success"},{"expected":301,"matcher":"status","state":"success"},{"expected":403,"matcher":"status","state":"success"},{"expected":404,"matcher":"status","state":"retry"}]},"BucketNotExists":{"delay":5,"operation":"HeadBucket","maxAttempts":20,"acceptors":[{"expected":404,"matcher":"status","state":"success"}]},"ObjectExists":{"delay":5,"operation":"HeadObject","maxAttempts":20,"acceptors":[{"expected":200,"matcher":"status","state":"success"},{"expected":404,"matcher":"status","state":"retry"}]},"ObjectNotExists":{"delay":5,"operation":"HeadObject","maxAttempts":20,"acceptors":[{"expected":404,"matcher":"status","state":"success"}]}};
var s320060301_waiters2 = {
	version: version$7,
	waiters: waiters$2
};

var s320060301_waiters2$1 = Object.freeze({
	version: version$7,
	waiters: waiters$2,
	default: s320060301_waiters2
});

var require$$2$11 = ( s320060301_min$1 && s320060301_min ) || s320060301_min$1;

var require$$3$9 = ( s320060301_paginators$1 && s320060301_paginators ) || s320060301_paginators$1;

var require$$4$5 = ( s320060301_waiters2$1 && s320060301_waiters2 ) || s320060301_waiters2$1;

var Service$3 = core.Service;
var apiLoader$4 = core.apiLoader;

apiLoader$4.services['s3'] = {};
core.S3 = Service$3.defineService('s3', ['2006-03-01']);

Object.defineProperty(apiLoader$4.services['s3'], '2006-03-01', {
  get: function get() {
    var model = require$$2$11;
    model.paginators = require$$3$9.pagination;
    model.waiters = require$$4$5.waiters;
    return model;
  },
  enumerable: true,
  configurable: true
});

var s3$3 = core.S3;



var S3 = Object.freeze({
	default: s3$3,
	__moduleExports: s3$3
});

var S3ConfigurationService = /** @class */ (function () {
    function S3ConfigurationService(_bucketName, fileName, contents, mustCreateBeforeUse, s3Client) {
        if (s3Client === void 0) { s3Client = new S3({ region: process.env.AWS_REGION }); }
        this._bucketName = _bucketName;
        this.fileName = fileName;
        this.contents = contents;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
        this.s3Client = s3Client;
    }
    Object.defineProperty(S3ConfigurationService.prototype, "bucketName", {
        get: function () {
            return this._bucketName;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get a configuration value using its key (based on JSON object)
     * @param {string} configurationKey
     * @returns {Promise<any>}
     */
    S3ConfigurationService.prototype.get = function (configurationKey) {
        return this.loadConfiguration()
            .then(function (configuration) {
            if (configuration[configurationKey] !== undefined) {
                return Promise.resolve(configuration[configurationKey]);
            }
            else {
                throw new Error("No key '" + configurationKey + "' present in configuration");
            }
        });
    };
    /**
     * Get the configuration object
     * @returns {Promise<any>}
     */
    S3ConfigurationService.prototype.all = function () {
        return this.loadConfiguration();
    };
    S3ConfigurationService.prototype.createBucketIfNecesary = function () {
        var _this = this;
        if (this.mustCreateBeforeUse) {
            return this.s3Client.listBuckets().promise()
                .then(function (results) { return results.Buckets; })
                .then(function (buckets) {
                if (buckets.some(function (bucket) { return bucket.Name === _this.bucketName; })) {
                    return Promise.resolve({});
                }
                else {
                    return _this.s3Client.createBucket({ Bucket: _this.bucketName }).promise()
                        .then(function () { return _this.s3Client.waitFor('bucketExists', { Bucket: _this.bucketName }); });
                }
            });
        }
        else {
            return Promise.resolve({});
        }
    };
    S3ConfigurationService.prototype.overrideConfiguration = function () {
        var _this = this;
        if (this.contents) {
            return this.s3Client.upload({
                Bucket: this.bucketName,
                Key: this.fileName,
                Body: JSON.stringify(this.contents, null, 2)
            }).promise()
                .then(function () { return _this.s3Client.waitFor('objectExists', { Bucket: _this.bucketName, Key: _this.fileName }); });
        }
        else {
            return Promise.resolve({});
        }
    };
    S3ConfigurationService.prototype.loadConfiguration = function () {
        var _this = this;
        if (this.configuration) {
            return Promise.resolve(this.configuration);
        }
        else {
            return this.createBucketIfNecesary()
                .then(function () { return _this.overrideConfiguration(); })
                .then(function () {
                var getObjectParams = {
                    Bucket: _this._bucketName,
                    Key: _this.fileName
                };
                return _this.s3Client.getObject(getObjectParams).promise();
            })
                .then(function (result) {
                _this.configuration = JSON.parse(result.Body.toString());
                return _this.configuration;
            })
                .catch(function (exception) {
                throw new Error(_this.fileName + " file does not exist in bucket");
            });
        }
    };
    return S3ConfigurationService;
}());

var S3ConfigurationBuilder = /** @class */ (function () {
    function S3ConfigurationBuilder(bucketName, mustCreateBeforeUse) {
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
        this.sourceFileName = 'config.json';
    }
    S3ConfigurationBuilder.prototype.withSourceFileName = function (sourceFileName) {
        this.sourceFileName = sourceFileName;
        return this;
    };
    S3ConfigurationBuilder.prototype.withContents = function (contents) {
        this.contents = contents;
        return this;
    };
    S3ConfigurationBuilder.prototype.withFileContents = function (filePath) {
        try {
            var fileContent = fs.readFileSync(filePath);
            this.contents = JSON.parse(fileContent.toString());
            return this;
        }
        catch (exception) {
            throw new Error('File ' + filePath + ' does not exist');
        }
    };
    S3ConfigurationBuilder.prototype.build = function () {
        return new S3ConfigurationService(this.bucketName, this.sourceFileName, this.contents, this.mustCreateBeforeUse);
    };
    return S3ConfigurationBuilder;
}());

var S3StorageService = /** @class */ (function () {
    function S3StorageService(bucketName, mustCreateBeforeUse, s3Client) {
        if (s3Client === void 0) { s3Client = new S3({ region: process.env.AWS_REGION }); }
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
        this.s3Client = s3Client;
    }
    /**
     * List files in bucket using an optional predicate
     * @param {(file) => boolean} predicate
     * @returns {Promise<any>}
     */
    S3StorageService.prototype.listFiles = function (predicate) {
        var _this = this;
        if (predicate === void 0) { predicate = function (file) { return true; }; }
        return this.createBucketIfNecesary()
            .then(function () { return _this.s3Client.listObjects({ Bucket: _this.bucketName }).promise(); })
            .then(function (files) { return files.Contents.map(function (file) { return file.Key; }); })
            .then(function (filesNames) { return filesNames.filter(predicate); })
            .catch(function (exception) {
            throw new Error("listFiles function : " + exception);
        });
    };
    /**
     * Reads file with path in bucket and returns a Buffer
     * @param {string} filePath
     * @returns {Promise<any>}
     */
    S3StorageService.prototype.readFile = function (filePath) {
        var _this = this;
        return this.createBucketIfNecesary()
            .then(function () { return _this.s3Client.getObject({
            Bucket: _this.bucketName,
            Key: filePath
        }).promise(); })
            .then(function (file) { return file.Body; })
            .catch(function (exception) {
            throw new Error("readFile function : " + exception);
        });
    };
    /**
     * Writes file with path in bucket
     * @param {string} filePath
     * @param {Buffer} fileContent
     * @returns {Promise<any>}
     */
    S3StorageService.prototype.writeFile = function (filePath, fileContent) {
        var _this = this;
        return this.createBucketIfNecesary()
            .then(function () { return _this.s3Client.upload({
            Bucket: _this.bucketName,
            Key: filePath,
            Body: fileContent
        }).promise(); })
            .catch(function (exception) {
            throw new Error("writeFile function : " + exception);
        });
    };
    /**
     * Deletes a file in bucket using its path
     * @param {string} filePath
     * @returns {Promise<any>}
     */
    S3StorageService.prototype.deleteFile = function (filePath) {
        var _this = this;
        return this.createBucketIfNecesary()
            .then(function () { return _this.s3Client.deleteObject({
            Bucket: _this.bucketName,
            Key: filePath
        }).promise(); })
            .catch(function (exception) {
            throw new Error("deleteFile function : " + exception);
        });
    };
    /**
     * Copies a file in bucket using source and destination paths
     * @param {string} sourceFilePath
     * @param {string} destinationFilePath
     * @returns {Promise<any>}
     */
    S3StorageService.prototype.copyFile = function (sourceFilePath, destinationFilePath) {
        var _this = this;
        if (sourceFilePath === destinationFilePath) {
            return Promise.reject('copyFile function : source and destination must have different paths');
        }
        return this.createBucketIfNecesary()
            .then(function () { return _this.s3Client.copyObject({
            Bucket: _this.bucketName,
            CopySource: _this.bucketName + "/" + sourceFilePath,
            Key: destinationFilePath
        }).promise(); })
            .catch(function (exception) {
            throw new Error("copyFile function : " + exception);
        });
    };
    S3StorageService.prototype.createBucketIfNecesary = function () {
        var _this = this;
        if (this.mustCreateBeforeUse) {
            return this.s3Client.listBuckets().promise()
                .then(function (results) { return results.Buckets; })
                .then(function (buckets) {
                if (buckets.some(function (bucket) { return bucket.Name === _this.bucketName; })) {
                    return Promise.resolve({});
                }
                else {
                    return _this.s3Client.createBucket({ Bucket: _this.bucketName }).promise()
                        .then(function () { return _this.s3Client.waitFor('bucketExists', { Bucket: _this.bucketName }); });
                }
            });
        }
        else {
            return Promise.resolve({});
        }
    };
    return S3StorageService;
}());

var S3StorageBuilder = /** @class */ (function () {
    function S3StorageBuilder(bucketName, mustCreateBeforeUse) {
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
    }
    S3StorageBuilder.prototype.build = function () {
        return new S3StorageService(this.bucketName, this.mustCreateBeforeUse);
    };
    return S3StorageBuilder;
}());

var S3HostingService = /** @class */ (function () {
    function S3HostingService(bucketName, mustCreateBeforeUse, s3Client) {
        if (s3Client === void 0) { s3Client = new S3({ region: process.env.AWS_REGION }); }
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
        this.s3Client = s3Client;
    }
    S3HostingService.prototype.uploadFilesFromDirectory = function (sourceDirectoryPath, destinationPathInBucket) {
        var _this = this;
        if (destinationPathInBucket === void 0) { destinationPathInBucket = ''; }
        if (!fs.existsSync(sourceDirectoryPath)) {
            return Promise.reject('uploadFilesFromDirectory function : directory does not exist');
        }
        if (!fs.statSync(sourceDirectoryPath).isDirectory()) {
            return Promise.reject('uploadFilesFromDirectory function : ' + sourceDirectoryPath + ' is not a directory');
        }
        if (destinationPathInBucket.startsWith('/')) {
            return Promise.reject("uploadFilesFromDirectory function : destination path should not start with a '/'");
        }
        if (destinationPathInBucket !== '' && !destinationPathInBucket.endsWith('/')) {
            return Promise.reject("uploadFilesFromDirectory function : destination path should end with a '/'");
        }
        var files = [].concat.apply([], this.walkDirectorySync(sourceDirectoryPath));
        return this.createBucketIfNecesary()
            .then(function () { return _this.exposeBucketAsPublicWebsite(); })
            .then(function () { return Promise.all(files.map(function (file) { return _this.s3Client.upload({
            Bucket: _this.bucketName,
            Key: destinationPathInBucket + file.substring(path.normalize(sourceDirectoryPath).length + 1),
            Body: fs.readFileSync(file)
        }).promise(); })).catch(function (exception) {
            throw new Error("uploadFilesFromDirectory function : " + exception);
        }); });
    };
    S3HostingService.prototype.createBucketIfNecesary = function () {
        var _this = this;
        if (this.mustCreateBeforeUse) {
            return this.s3Client.listBuckets().promise()
                .then(function (results) { return results.Buckets; })
                .then(function (buckets) {
                if (buckets.some(function (bucket) { return bucket.Name === _this.bucketName; })) {
                    return Promise.resolve({});
                }
                else {
                    return _this.s3Client.createBucket({ Bucket: _this.bucketName }).promise()
                        .then(function () { return _this.s3Client.waitFor('bucketExists', { Bucket: _this.bucketName }); });
                }
            });
        }
        else {
            return Promise.resolve({});
        }
    };
    S3HostingService.prototype.exposeBucketAsPublicWebsite = function () {
        var _this = this;
        var policyContent = fs.readFileSync(__dirname + '/s3-hosting.policy.json').toString();
        policyContent = policyContent.replace(new RegExp(/\$bucketName\$/, 'g'), this.bucketName);
        var bucketPolicyParams = {
            Bucket: this.bucketName,
            Policy: policyContent
        };
        var bucketWebsiteParams = {
            Bucket: this.bucketName,
            WebsiteConfiguration: {
                IndexDocument: {
                    Suffix: 'index.html'
                }
            }
        };
        return this.s3Client.putBucketPolicy(bucketPolicyParams).promise()
            .then(function () { return _this.s3Client.putBucketWebsite(bucketWebsiteParams).promise(); });
    };
    S3HostingService.prototype.walkDirectorySync = function (directoryPath, filelist) {
        var _this = this;
        if (filelist === void 0) { filelist = []; }
        return fs.readdirSync(directoryPath)
            .map(function (filePath) { return fs.statSync(path.join(directoryPath, filePath)).isDirectory()
            ? _this.walkDirectorySync(path.join(directoryPath, filePath), filelist)
            : filelist.concat(path.join(directoryPath, filePath))[0]; });
    };
    return S3HostingService;
}());

var S3HostingBuilder = /** @class */ (function () {
    function S3HostingBuilder(bucketName, mustCreateBeforeUse) {
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
    }
    S3HostingBuilder.prototype.build = function () {
        return new S3HostingService(this.bucketName, this.mustCreateBeforeUse);
    };
    return S3HostingBuilder;
}());

var S3Builder = /** @class */ (function () {
    function S3Builder() {
        this.mustCreateBeforeUse = false;
    }
    S3Builder.prototype.withBucketName = function (bucketName) {
        this.bucketName = bucketName;
        return this;
    };
    S3Builder.prototype.createIfNotExists = function () {
        this.mustCreateBeforeUse = true;
        return this;
    };
    S3Builder.prototype.asConfigurationService = function () {
        this.checkAwsRegionEnvironmentVariableIsPresent();
        this.checkBucketNameWasProvide();
        return new S3ConfigurationBuilder(this.bucketName, this.mustCreateBeforeUse);
    };
    S3Builder.prototype.asStorageService = function () {
        this.checkAwsRegionEnvironmentVariableIsPresent();
        this.checkBucketNameWasProvide();
        return new S3StorageBuilder(this.bucketName, this.mustCreateBeforeUse);
    };
    S3Builder.prototype.asHostingService = function () {
        this.checkAwsRegionEnvironmentVariableIsPresent();
        this.checkBucketNameWasProvide();
        return new S3HostingBuilder(this.bucketName, this.mustCreateBeforeUse);
    };
    S3Builder.prototype.checkAwsRegionEnvironmentVariableIsPresent = function () {
        if (!process.env.AWS_REGION) {
            throw new Error('AWS_REGION environment variable must be set');
        }
    };
    S3Builder.prototype.checkBucketNameWasProvide = function () {
        if (!this.bucketName) {
            throw new Error('Bucket name is mandatory');
        }
    };
    return S3Builder;
}());

var version$8 = "2.0";
var metadata$7 = {"uid":"sns-2010-03-31","apiVersion":"2010-03-31","endpointPrefix":"sns","protocol":"query","serviceAbbreviation":"Amazon SNS","serviceFullName":"Amazon Simple Notification Service","signatureVersion":"v4","xmlNamespace":"http://sns.amazonaws.com/doc/2010-03-31/"};
var operations$5 = {"AddPermission":{"input":{"type":"structure","required":["TopicArn","Label","AWSAccountId","ActionName"],"members":{"TopicArn":{},"Label":{},"AWSAccountId":{"type":"list","member":{}},"ActionName":{"type":"list","member":{}}}}},"CheckIfPhoneNumberIsOptedOut":{"input":{"type":"structure","required":["phoneNumber"],"members":{"phoneNumber":{}}},"output":{"resultWrapper":"CheckIfPhoneNumberIsOptedOutResult","type":"structure","members":{"isOptedOut":{"type":"boolean"}}}},"ConfirmSubscription":{"input":{"type":"structure","required":["TopicArn","Token"],"members":{"TopicArn":{},"Token":{},"AuthenticateOnUnsubscribe":{}}},"output":{"resultWrapper":"ConfirmSubscriptionResult","type":"structure","members":{"SubscriptionArn":{}}}},"CreatePlatformApplication":{"input":{"type":"structure","required":["Name","Platform","Attributes"],"members":{"Name":{},"Platform":{},"Attributes":{"shape":"Sj"}}},"output":{"resultWrapper":"CreatePlatformApplicationResult","type":"structure","members":{"PlatformApplicationArn":{}}}},"CreatePlatformEndpoint":{"input":{"type":"structure","required":["PlatformApplicationArn","Token"],"members":{"PlatformApplicationArn":{},"Token":{},"CustomUserData":{},"Attributes":{"shape":"Sj"}}},"output":{"resultWrapper":"CreatePlatformEndpointResult","type":"structure","members":{"EndpointArn":{}}}},"CreateTopic":{"input":{"type":"structure","required":["Name"],"members":{"Name":{}}},"output":{"resultWrapper":"CreateTopicResult","type":"structure","members":{"TopicArn":{}}}},"DeleteEndpoint":{"input":{"type":"structure","required":["EndpointArn"],"members":{"EndpointArn":{}}}},"DeletePlatformApplication":{"input":{"type":"structure","required":["PlatformApplicationArn"],"members":{"PlatformApplicationArn":{}}}},"DeleteTopic":{"input":{"type":"structure","required":["TopicArn"],"members":{"TopicArn":{}}}},"GetEndpointAttributes":{"input":{"type":"structure","required":["EndpointArn"],"members":{"EndpointArn":{}}},"output":{"resultWrapper":"GetEndpointAttributesResult","type":"structure","members":{"Attributes":{"shape":"Sj"}}}},"GetPlatformApplicationAttributes":{"input":{"type":"structure","required":["PlatformApplicationArn"],"members":{"PlatformApplicationArn":{}}},"output":{"resultWrapper":"GetPlatformApplicationAttributesResult","type":"structure","members":{"Attributes":{"shape":"Sj"}}}},"GetSMSAttributes":{"input":{"type":"structure","members":{"attributes":{"type":"list","member":{}}}},"output":{"resultWrapper":"GetSMSAttributesResult","type":"structure","members":{"attributes":{"shape":"Sj"}}}},"GetSubscriptionAttributes":{"input":{"type":"structure","required":["SubscriptionArn"],"members":{"SubscriptionArn":{}}},"output":{"resultWrapper":"GetSubscriptionAttributesResult","type":"structure","members":{"Attributes":{"type":"map","key":{},"value":{}}}}},"GetTopicAttributes":{"input":{"type":"structure","required":["TopicArn"],"members":{"TopicArn":{}}},"output":{"resultWrapper":"GetTopicAttributesResult","type":"structure","members":{"Attributes":{"type":"map","key":{},"value":{}}}}},"ListEndpointsByPlatformApplication":{"input":{"type":"structure","required":["PlatformApplicationArn"],"members":{"PlatformApplicationArn":{},"NextToken":{}}},"output":{"resultWrapper":"ListEndpointsByPlatformApplicationResult","type":"structure","members":{"Endpoints":{"type":"list","member":{"type":"structure","members":{"EndpointArn":{},"Attributes":{"shape":"Sj"}}}},"NextToken":{}}}},"ListPhoneNumbersOptedOut":{"input":{"type":"structure","members":{"nextToken":{}}},"output":{"resultWrapper":"ListPhoneNumbersOptedOutResult","type":"structure","members":{"phoneNumbers":{"type":"list","member":{}},"nextToken":{}}}},"ListPlatformApplications":{"input":{"type":"structure","members":{"NextToken":{}}},"output":{"resultWrapper":"ListPlatformApplicationsResult","type":"structure","members":{"PlatformApplications":{"type":"list","member":{"type":"structure","members":{"PlatformApplicationArn":{},"Attributes":{"shape":"Sj"}}}},"NextToken":{}}}},"ListSubscriptions":{"input":{"type":"structure","members":{"NextToken":{}}},"output":{"resultWrapper":"ListSubscriptionsResult","type":"structure","members":{"Subscriptions":{"shape":"S1n"},"NextToken":{}}}},"ListSubscriptionsByTopic":{"input":{"type":"structure","required":["TopicArn"],"members":{"TopicArn":{},"NextToken":{}}},"output":{"resultWrapper":"ListSubscriptionsByTopicResult","type":"structure","members":{"Subscriptions":{"shape":"S1n"},"NextToken":{}}}},"ListTopics":{"input":{"type":"structure","members":{"NextToken":{}}},"output":{"resultWrapper":"ListTopicsResult","type":"structure","members":{"Topics":{"type":"list","member":{"type":"structure","members":{"TopicArn":{}}}},"NextToken":{}}}},"OptInPhoneNumber":{"input":{"type":"structure","required":["phoneNumber"],"members":{"phoneNumber":{}}},"output":{"resultWrapper":"OptInPhoneNumberResult","type":"structure","members":{}}},"Publish":{"input":{"type":"structure","required":["Message"],"members":{"TopicArn":{},"TargetArn":{},"PhoneNumber":{},"Message":{},"Subject":{},"MessageStructure":{},"MessageAttributes":{"type":"map","key":{"locationName":"Name"},"value":{"locationName":"Value","type":"structure","required":["DataType"],"members":{"DataType":{},"StringValue":{},"BinaryValue":{"type":"blob"}}}}}},"output":{"resultWrapper":"PublishResult","type":"structure","members":{"MessageId":{}}}},"RemovePermission":{"input":{"type":"structure","required":["TopicArn","Label"],"members":{"TopicArn":{},"Label":{}}}},"SetEndpointAttributes":{"input":{"type":"structure","required":["EndpointArn","Attributes"],"members":{"EndpointArn":{},"Attributes":{"shape":"Sj"}}}},"SetPlatformApplicationAttributes":{"input":{"type":"structure","required":["PlatformApplicationArn","Attributes"],"members":{"PlatformApplicationArn":{},"Attributes":{"shape":"Sj"}}}},"SetSMSAttributes":{"input":{"type":"structure","required":["attributes"],"members":{"attributes":{"shape":"Sj"}}},"output":{"resultWrapper":"SetSMSAttributesResult","type":"structure","members":{}}},"SetSubscriptionAttributes":{"input":{"type":"structure","required":["SubscriptionArn","AttributeName"],"members":{"SubscriptionArn":{},"AttributeName":{},"AttributeValue":{}}}},"SetTopicAttributes":{"input":{"type":"structure","required":["TopicArn","AttributeName"],"members":{"TopicArn":{},"AttributeName":{},"AttributeValue":{}}}},"Subscribe":{"input":{"type":"structure","required":["TopicArn","Protocol"],"members":{"TopicArn":{},"Protocol":{},"Endpoint":{}}},"output":{"resultWrapper":"SubscribeResult","type":"structure","members":{"SubscriptionArn":{}}}},"Unsubscribe":{"input":{"type":"structure","required":["SubscriptionArn"],"members":{"SubscriptionArn":{}}}}};
var shapes$5 = {"Sj":{"type":"map","key":{},"value":{}},"S1n":{"type":"list","member":{"type":"structure","members":{"SubscriptionArn":{},"Owner":{},"Protocol":{},"Endpoint":{},"TopicArn":{}}}}};
var sns20100331_min = {
	version: version$8,
	metadata: metadata$7,
	operations: operations$5,
	shapes: shapes$5
};

var sns20100331_min$1 = Object.freeze({
	version: version$8,
	metadata: metadata$7,
	operations: operations$5,
	shapes: shapes$5,
	default: sns20100331_min
});

var pagination$5 = {"ListEndpointsByPlatformApplication":{"input_token":"NextToken","output_token":"NextToken","result_key":"Endpoints"},"ListPlatformApplications":{"input_token":"NextToken","output_token":"NextToken","result_key":"PlatformApplications"},"ListSubscriptions":{"input_token":"NextToken","output_token":"NextToken","result_key":"Subscriptions"},"ListSubscriptionsByTopic":{"input_token":"NextToken","output_token":"NextToken","result_key":"Subscriptions"},"ListTopics":{"input_token":"NextToken","output_token":"NextToken","result_key":"Topics"}};
var sns20100331_paginators = {
	pagination: pagination$5
};

var sns20100331_paginators$1 = Object.freeze({
	pagination: pagination$5,
	default: sns20100331_paginators
});

var require$$1$10 = ( sns20100331_min$1 && sns20100331_min ) || sns20100331_min$1;

var require$$2$12 = ( sns20100331_paginators$1 && sns20100331_paginators ) || sns20100331_paginators$1;

var Service$4 = core.Service;
var apiLoader$5 = core.apiLoader;

apiLoader$5.services['sns'] = {};
core.SNS = Service$4.defineService('sns', ['2010-03-31']);
Object.defineProperty(apiLoader$5.services['sns'], '2010-03-31', {
  get: function get() {
    var model = require$$1$10;
    model.paginators = require$$2$12.pagination;
    return model;
  },
  enumerable: true,
  configurable: true
});

var sns$1 = core.SNS;



var SNS = Object.freeze({
	default: sns$1,
	__moduleExports: sns$1
});

var SnsProxy = /** @class */ (function () {
    function SnsProxy(sns, snsClient) {
        if (snsClient === void 0) { snsClient = new SNS({ region: process.env.AWS_REGION }); }
        this.sns = sns;
        this.snsClient = snsClient;
    }
    SnsProxy.prototype.createIfNotExists = function () {
        var _this = this;
        return this.snsClient.listTopics().promise()
            .then(function (results) {
            if (results.Topics.some(function (topic) { return topic.TopicArn.indexOf(_this.sns.topicName) !== -1; })) {
                return Promise.resolve({});
            }
            else {
                return _this.snsClient.createTopic({ Name: _this.sns.topicName }).promise();
            }
        });
    };
    SnsProxy.prototype.publishMessage = function (message) {
        var _this = this;
        return this.createIfNotExists()
            .then(function () { return _this.sns.publishMessage(message); });
    };
    return SnsProxy;
}());

var SnsImplementation = /** @class */ (function () {
    function SnsImplementation(_topicName, snsClient) {
        if (snsClient === void 0) { snsClient = new SNS({ region: process.env.AWS_REGION }); }
        this._topicName = _topicName;
        this.snsClient = snsClient;
    }
    SnsImplementation.prototype.publishMessage = function (message) {
        var _this = this;
        return this.findTopicArn()
            .then(function (topicArn) { return _this.snsClient.publish({
            TopicArn: topicArn,
            Message: JSON.stringify(message)
        }).promise(); });
    };
    SnsImplementation.prototype.findTopicArn = function () {
        var _this = this;
        return this.snsClient.listTopics().promise()
            .then(function (results) { return results.Topics.find(function (topic) { return topic.TopicArn.indexOf(_this._topicName) !== -1; }); })
            .then(function (topic) { return topic.TopicArn; });
    };
    Object.defineProperty(SnsImplementation.prototype, "topicName", {
        get: function () {
            return this._topicName;
        },
        enumerable: true,
        configurable: true
    });
    return SnsImplementation;
}());

var SnsBuilder = /** @class */ (function () {
    function SnsBuilder() {
        this.mustCreateBeforeUse = false;
    }
    SnsBuilder.prototype.withTopicName = function (topicName) {
        this.topicName = topicName;
        return this;
    };
    SnsBuilder.prototype.createIfNotExists = function () {
        this.mustCreateBeforeUse = true;
        return this;
    };
    SnsBuilder.prototype.build = function () {
        if (!process.env.AWS_REGION) {
            throw new Error('AWS_REGION environment variable must be set');
        }
        if (!this.topicName) {
            throw new Error('Topic name is mandatory');
        }
        if (this.mustCreateBeforeUse) {
            return new SnsProxy(new SnsImplementation(this.topicName));
        }
        return new SnsImplementation(this.topicName);
    };
    return SnsBuilder;
}());

// DynamoDB

exports.DynamoDbBuilder = DynamoDbBuilder;
exports.DynamoDbRepositoryImplementation = DynamoDbRepositoryImplementation;
exports.DynamoDbRepositoryProxy = DynamoDbRepositoryProxy;
exports.S3Builder = S3Builder;
exports.S3ConfigurationBuilder = S3ConfigurationBuilder;
exports.S3HostingBuilder = S3HostingBuilder;
exports.S3StorageBuilder = S3StorageBuilder;
exports.S3ConfigurationService = S3ConfigurationService;
exports.S3HostingService = S3HostingService;
exports.S3StorageService = S3StorageService;
exports.SnsBuilder = SnsBuilder;
exports.SnsImplementation = SnsImplementation;
exports.SnsProxy = SnsProxy;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=aws-sdk-fluent-builder.umd.js.map
