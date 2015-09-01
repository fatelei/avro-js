/**
 * 
 */

var util = require('util');

// Constants.
var PRIMITIVE_TYPES = [
  'null',
  'boolean',
  'string',
  'bytes',
  'int',
  'long',
  'float',
  'double'
];

var NAMED_TYPES = [
  'fixed',
  'enum',
  'record',
  'error'
];

var VALID_TYPES = [
  'null',
  'boolean',
  'string',
  'bytes',
  'int',
  'long',
  'float',
  'double',
  'fixed',
  'enum',
  'record',
  'error',
  'array',
  'map',
  'union',
  'request',
  'error_union'
];

var SCHEMA_RESERVED_PROPS = [
  'type',
  'name',
  'namespace',
  'fields',     // Record
  'items',      // Array
  'size',       // Fixed
  'symbols',    // Enum
  'values',     // Map
  'doc'
];

var FIELD_RESERVED_PROPS = [
  'default',
  'name',
  'doc',
  'order',
  'type'
];

var VALID_FIELD_SORT_ORDERS = [
  'ascending',
  'descending',
  'ignore'
];

/**
 * Base Schema
 * @param {Object} type
 * @param {Object} otherProps
 */
function Schema(type, otherProps) {
  if (typeof type !== 'string') {
    throw new Error('Schema type must be string.');
  }

  if (VALID_TYPES.indexOf(type) === -1) {
    throw new Error(type + ' is not a valid type.');
  }

  if (!this.hasOwnPropert('_props')) {
    this._props = {};
  }

  this.setProp('type', type);
  this.type = type;

  var tmp = otherProps || {};
  var keys = Object.keys(tmp);
  var length = keys.length;
  var i = 0;
  var tmpKey = null;

  for (i = 0; i < length; i++) {
    tmpKey = keys[i];
    this._props[tmpKey] = otherProps[tmpKey];
  }
}

Schema.prototype.getProp = function (key) {
  return this._props[key];
};

Schema.prototype.setProp = function (key, value) {
  this._props[key] = value;
};

Schema.prototype.toString = function () {
  return JSON.stringify(this.toJSON());
};


/**
 * Class to describe Avro name.
 */
function Name(nameAttr, spaceAttr, defaultSpace) {
  if (!(nameAttr === undefined || typeof nameAttr === 'string')) {
    throw new Error('Name must be non-empty string or None');
  } else if (nameAttr === "") {
    throw new Error('Name must be non-empty string or None')
  }

  if (!(spaceAttr === undefined || typeof spaceAttr === 'string')) {
    throw new Error('Space must be non-empty string or None');
  } else if (spaceAttr === "") {
    throw new Error('Space must be non-empty string or None');
  }

  if (!(defaultSpace === undefined || typeof defaultSpace === 'string')) {
    throw new Error('Default space must be non-empty string or None');
  } else if (defaultSpace === "") {
    throw new Error('Default space must be non-empty string or None');
  }

  this._full = null;

  
}



