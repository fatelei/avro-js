var fs = require('fs');

/**
 * Read Files written by DataFileWriter
 * @param {Object} reader
 * @param {Object} datumReader
 */
function DataFileReader(path, datumReader) {
  this._fd = fs.openSync(path);
  this._datum_decoder = null;
  this._datumReader = datumReader;
  this._fileLength = this.getFileLength();
}

/**
 * Get the size of file.
 * @api public
 */
DataFileReader.prototype.getFileLength = function () {
  var stats = fs.fstatSync(this._fd);
  return stats.size;
};

/**
 * Get the magic block.
 * @api private 
 */
DataFileReader.prototype._readHeader = function () {
  
};

/**
 * Close the file reader.
 */
DataFileReader.prototype.close = function () {
  fs.close(this._fd);
};