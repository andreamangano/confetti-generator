'use strict';
import objectPath from 'object-path';
class PathLocator {
  constructor(objPaths) {
    if (arguments.length === 1
      && objPaths !== 'undefined'
      && typeof objPaths !== 'object') {
      throw new Error('The parameter -objPaths- must be a string.');
    }
    if (objPaths) {
      this._paths = objPaths;
    } else {
      this._paths = {};
    }
  }

  setPath(path, value) {
    objectPath.set(this._paths, path, value);
  }

  getPath(path) {
    return objectPath.get(this._paths, path);
  }

  get paths() {
    return this._paths;
  }

  set paths(obj) {
    this._paths = obj;
  }
}
export default PathLocator;

