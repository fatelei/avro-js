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
 * Retrieve the non-reserved properties from a dictionary of properties
 * @param  {Object} allProps
 * @param  {Array}  reservedProps
 * @return {Object}
 * @api private
 */
var getOtherProps = function (allProps, reservedProps) {
  var keys = Object.keys(allProps);
  var length = keys.length;
  var i = 0;
  var tmp = {};
  var curKey = null;

  for (i = 0; i < length; i++) {
    curKey = keys[i];
    if (reservedProps.indexOf(curKey) === -1) {
      tmp[curKey] = allProps[curKey];
    }
  }

  return tmp;
};

var makeAvscObject = function (json_data, names) {
  if (PRIMITIVE_TYPES.indexOf(json_data) !== -1) {
    return;
  }

  if (Array.isArray(json_data)) {
    return;
  }

  var _type = json_data.type;
  if (_type === undefined) {
    throw new Error('No "type" property: ' + _type);
  }

  var otherProps = getOtherProps(json_data, SCHEMA_RESERVED_PROPS);

  if (PRIMITIVE_TYPES.indexOf(_type) !== -1) {

  } else if (NAMED_TYPES.indexOf(_type) !== -1) {
    var name = json_data.name;
    var namespace = json_data.namespace || names.default_namespace;
    switch (name) {
    case 'fixed':
      break;
    case 'enum':
      break;
    case 'record':
    case 'error':
      break;
    default:
      throw new Error('Unknown Named Type: ' + name);
    }
  } else if (VALID_TYPES.indexOf(_type) !== -1) {
    switch (_type) {
    case 'array':
      break;
    case 'map':
      break;
    case 'error_union':
      break;
    }
  } else {
    throw new Error('Undefined type: ' + _type);
  }
};

/**
 * Constructs the Schema from the JSON text.
 * @param  {String} jsonStr
 * @return {Object} A schema object.
 * @api public
 */
var parse = function (jsonStr) {
  try {
    var json_data = JSON.parse(jsonStr);
    return makeAvscObject(json_data);
  } catch (err) {
    throw err;
  }
};

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

  Object.defineProperty(this, 'props', {
    writable: false,
    value: this._props
  });
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
  }

  if (nameAttr === "") {
    throw new Error('Name must be non-empty string or None');
  }

  if (!(spaceAttr === undefined || typeof spaceAttr === 'string')) {
    throw new Error('Space must be non-empty string or None');
  }

  if (spaceAttr === "") {
    throw new Error('Space must be non-empty string or None');
  }

  if (!(defaultSpace === undefined || typeof defaultSpace === 'string')) {
    throw new Error('Default space must be non-empty string or None');
  }

  if (defaultSpace === "") {
    throw new Error('Default space must be non-empty string or None');
  }

  var _full = null;

  if (nameAttr.indexOf('.') < 0) {
    if (spaceAttr !== undefined && spaceAttr !== '') {
      _full = util.format('%s.%s', spaceAttr, nameAttr);
    } else if (defaultSpace !== undefined && defaultSpace !== '') {
      _full = util.format('%s.%s', defaultSpace, nameAttr);
    } else {
      _full = nameAttr;
    }
  } else {
    _full = nameAttr;
  }

  this._full = _full;
  Object.defineProperty(this, 'fullname', {
    writable: false,
    value: _full
  });
}

/**
 * Back out a namespace from full name.
 * @return {String}
 */
Name.prototype.getSpace = function () {
  if (!this._full) {
    return null;
  }

  if (this._full.indexOf('.') !== -1) {
    return this._full.split('.').pop(-1);
  }

  return '';
};


/**
 * Track name set and default namespace during parsing.
 * @param {String} defalutNamespace
 */
function Names(defalutNamespace) {
  this.names = {};
  this.defalutNamespace = defalutNamespace;
}

Names.prototype.hasName = function (nameAttr, spaceAttr) {
  var test = new Name(nameAttr, spaceAttr, this.defalutNamespace);
  return this.names.hasOwnProperty(test.fullname);
};

Names.prototype.getName = function (nameAttr, spaceAttr) {
  var test = new Name(nameAttr, spaceAttr, this.defalutNamespace);
  var value = this.names[test];

  return value === undefined ? null : value;
};

/**
 * given a properties, return properties with namespace removed if
 * it matches the own default namespace
 * @param  {Object} properties
 * @return {Object}
 * @api private
 */
Names.prototype.pruneNamespace = function (properties) {
  if (this.defalutNamespace === undefined || this.defalutNamespace === null) {
    return properties;
  }

  var namespace = properties.namespace;
  if (!namespace || namespace !== this.defalutNamespace) {
    return properties;
  }

  var prunable = {};
  var keys = Object.keys(properties);
  var length = keys.length;
  var i;
  var tmpKey;

  for (i = 0; i < length; i++) {
    tmpKey = keys[i];
    if (tmpKey !== 'namespace') {
      prunable[tmpKey] = properties[tmpKey];
    }
  }

  return prunable;
};

/**
 * Add a new schema object to the name set.
 * @param {String} nameAttr  [Name value read in schema]
 * @param {String} spaceAttr [Namespace value read in schema]
 * @param {Object} newSchema [New schema]
 * @return {Object} [The name that was just added]
 */
Names.prototype.addName = function (nameAttr, spaceAttr, newSchema) {
  var toAdd = new Name(nameAttr, spaceAttr, this.defalutNamespace);
  var fullname = toAdd.fullname;

  if (VALID_TYPES.indexOf(fullname) !== -1) {
    throw new Error(fullname + ' is a reserved type name');
  }

  if (this.names.hasOwnProperty(fullname)) {
    throw new Error('The name ' + fullname + ' is already in user.');
  }

  this.names[fullname] = newSchema;
  return toAdd;
};

/**
 * Named Schemas specified in NAMED_TYPES.
 */
function NamedSchema(type, name, namespace, names, otherProps) {
  if (!name) {
    throw new Error('Named Schemas must have a non-empty name.');
  }

  if (typeof name !== 'string') {
    throw new Error('The name property must be a string.');
  }

  if (namespace && typeof namespace !== 'string') {
    throw new Error('The namespace property must be a string.');
  }

  Schema.call(this, type, otherProps);

  var newName = names.addName(name, namespace, this);
  this.setProp('name', name);

  if (namespace) {
    this.setProp('namespace', newName.getSpace());
  }

  this._fullname = newName.fullname;

  Object.defineProperty(this, 'name', {
    writable: false,
    value: this.getProp('name')
  });

  Object.defineProperty(this, 'namespace', {
    writable: false,
    value: this.getProp('namespace')
  });

  Object.defineProperty(this, 'fullname', {
    writable: false,
    value: this._fullname
  });
}

util.inherits(NamedSchema, Schema);

NamedSchema.prototype.nameRef = function (names) {
  if (this.namespace === names.defalutNamespace) {
    return this.name;
  }

  return this.fullname;
};


function Field(type, name, hasDefault, _default, order, names, doc, otherProps) {
  if (!name) {
    throw new Error('Fields must have a non-empty name.');
  }

  if (typeof name === 'string') {
    throw new Error('The name property must be a string.');
  }

  if (order && VALID_FIELD_SORT_ORDERS.indexOf(order) === -1) {
    throw new Error('The order property ' + order + ' is not valid');
  }

  // Add members.
  this._props = {};
  this._hasDefault = hasDefault;

  var typeSchema;
  var keys = Object.keys(otherProps);
  var length = keys.length;
  var i;
  var tmpKey;

  for (i = 0; i < length; i++) {
    tmpKey = keys[i];
    this._props[tmpKey] = otherProps[tmpKey];
  }

  if (typeof type === 'string' && name && names.hasName(type, null)) {
    typeSchema = names.getName(type, null);
  } else {
    try {
      typeSchema = makeAvscObject(type, names);
    } catch (err) {
      throw new Error(util.format('Type property %s not a valid Avro schema: %s', type, err));
    }
  }

  this.setProp('type', typeSchema);
  this.setProp('name', name);
  this.type = typeSchema;
  this.name = name;

  if (hasDefault) {
    this.setProp('default', _default);
  }

  if (order) {
    this.setProp('order', order);
  }

  if (doc) {
    this.setProp('doc', doc);
  }

  Object.defineProperty(this, 'default', {
    writable: false,
    value: _default,
  });

  Object.defineProperty(this, 'hasDefault', {
    writable: false,
    value: hasDefault
  });

  Object.defineProperty(this, 'order', {
    writable: false,
    value: order
  });

  Object.defineProperty(this, 'doc', {
    writable: false,
    value: doc
  });

  Object.defineProperty(this, 'props', {
    writable: false,
    value: this._props
  });
}

Field.prototype.getProp = function (key) {
  return this._props[key];
};

Field.prototype.setProp = function (key, value) {
  this._props[key] = value;
};

Field.prototype.toJSON = function (names) {
  if (!names) {
    names = new Names();
  }

  var toDump = {};
  var keys = Object.keys(this._props);
  var length = keys.length;
  var i = 0;
  var tmpKey;

  for (i = 0; i < length; i++) {
    tmpKey = keys[i];
    toDump[tmpKey] = this._props[tmpKey];
  }

  toDump.type = this.type.toJSON(names);
};

/**
 * Primitive Types
 */
function PrimitiveSchema(type) {
  if (PRIMITIVE_TYPES.indexOf(type) === -1) {
    throw new Error(type + ' is not a valid primitive type.');
  }

  Schema.call(this, type);
  this.fullname = type;
}

util.inherits(PrimitiveSchema, Schema);

PrimitiveSchema.prototype.toJSON = function () {
  if (Object.keys(this.props) === 1) {
    return this.fullname;
  }
  return this.props;
};

// Complex Types (non-recursive)
function FixedSchema(name, namespace, size, names, otherProps) {
  if (typeof size === 'number') {
    throw new Error('Fixed Schema requires a valid integer for size property.');
  }

  NamedSchema.call(this, 'fixed', name, namespace, names, otherProps);

  this.setProp('size', size);

  Object.defineProperty(this, 'size', {
    writable: false,
    value: size
  });
}

util.inherits(FixedSchema, NamedSchema);

FixedSchema.prototype.toJSON = function (names) {
  if (!names) {
    names = new Names();
  }

  if (names.names.hasOwnProperty(this.fullname)) {
    return this.nameRef(names);
  }

  names.names[this.fullname] = this;
  return names.pruneNamespace(this.props);
};

function EnumSchema(name, namespace, symbols, names, doc, otherProps) {
  if (!Array.isArray(symbols)) {
    throw new Error('Enum Schema requires a JSON array for the symbols property.');
  }

  var setSymbols = [];
  var i = 0;
  var length = symbols.length;
  var curValue;

  for (i = 0; i < length; i++) {
    curValue = symbols[i];

    if (typeof curValue !== 'string') {
      throw new Error('Enum Schems requires All symbols to be JSON strings.');
    }

    if (setSymbols.indexOf(curValue) === -1) {
      setSymbols.push(curValue);
    }
  }

  if (setSymbols.length !== length) {
    throw new Error('Duplicate symbol: ' + symbols);
  }

  NamedSchema.call(this, 'enum', name, namespace, names, otherProps);

  this.setProp('symbols', symbols);
  if (doc) {
    this.setProp('doc', doc);
  }

  Object.defineProperty(this, 'symbols', {
    writable: false,
    value: symbols
  });

  Object.defineProperty(this, 'doc', {
    writable: false,
    value: doc
  });
}

util.inherits(EnumSchema, NamedSchema);

EnumSchema.prototype.toJSON = function (names) {
  if (!names) {
    names = new Names();
  }

  if (names.names.hasOwnProperty(this.fullname)) {
    return this.nameRef(names);
  }

  names.names[this.fullname] = this;
  return names.pruneNamespace(this.props);
};

// Complex Types (recursive)
function ArraySchema(items, names, otherProps) {
  Schema.call(this, 'array', otherProps);
  var itemsSchema;
  if (typeof items === 'string' && names.hasName(items, null)) {
    itemsSchema = names.getName(items, null);
  } else {
    try {
      itemsSchema = makeAvscObject(items, names);
    } catch (err) {
      var msg = util.format('Items schema (%s) not a valid Avro schema: %s (known names: %s)', items, err);
      throw new Error(msg);
    }
  }

  this.setProp('items', itemsSchema);

  Object.defineProperty(this, 'items', {
    writable: false,
    value: itemsSchema
  });
}

util.inherits(ArraySchema, Schema);

ArraySchema.prototype.toJSON = function (names) {
  if (!names) {
    names = new Names();
  }

  var toDump = {};
  var keys = Object.keys(this.props);
  var length = keys.length;
  var i = 0;
  var tmpKey;

  for (i = 0; i < length; i++) {
    tmpKey = keys[i];
    toDump[tmpKey] = this.props[tmpKey];
  }

  var itemsSchema = this.getProp('items');
  toDump.items = itemsSchema.toJSON(names);
  return toDump;
};

function MapSchema(values, names, otherProps) {
  Schema.call(this, 'map', otherProps);
  var valueSchema;

  if (typeof values === 'string' && names.hasName(values, null)) {
    valueSchema = names.getName(values, null);
  } else {
    try {
      valueSchema = makeAvscObject(values, names);
    } catch (err) {
      throw new Error('Values schema not a valid Avro schema.');
    }
  }

  this.setProp('values', valueSchema);

  Object.defineProperty(this, 'values', {
    writable: false,
    value: valueSchema
  });
}

util.inherits(MapSchema, Schema);

MapSchema.prototype.toJSON = function (names) {
  if (!names) {
    names = new Names();
  }

  var toDump = {};
  var keys = Object.keys(this.props);
  var length = keys.length;
  var i = 0;
  var tmpKey;

  for (i = 0; i < length; i++) {
    tmpKey = keys[i];
    toDump[tmpKey] = this.props[tmpKey];
  }

  toDump.values = this.getProp('values').toJSON(names);
};