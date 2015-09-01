/**
 * Parse schema.
 */

/**
 * Retrieve the non-reserved properties from a dictionary of properties
 * @param  {Object} allProps
 * @param  {Array}  reservedProps
 * @return {Object}
 * @api private
 */
function getOtherProps(allProps, reservedProps) {
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
}


function makeAvscObject(json_data, names) {
  if (PRIMITIVE_TYPES.indexOf(json_data) !== -1) {
    return;
  } else if (Array.isArray(json_data)) {
    return;
  } else {
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
  }
}

/**
 * Constructs the Schema from the JSON text.
 * @param  {String} jsonStr
 * @return {Object} A schema object.
 * @api public
 */
exports.parse = function (jsonStr) {
  try {
    var json_data = JSON.parse(jsonStr);
    return makeAvscObject(json_data);
  } catch (err) {
    throw err;
  }
};