'use strict';
import PathLocator from './../src/lib/pathLocator';
describe("PathLocator", function() {
  const objPaths = {
    sources: {
      index: 'index/path'
    }
  };
  describe('constructor()', function() {
    it('should be created with one properties: paths', () => {
      const _pathLocator = new PathLocator();
      _pathLocator.should.have.property('paths');
    });
    it('if no parameter is passed in, should create an empty object' +
      ' paths', function() {
      const _pathLocator = new PathLocator();
      _pathLocator.paths.should.be.an('object').and.be.empty;
    });
    it('if paths obj is passed in, should set it as paths', function() {
      const _pathLocator = new PathLocator(objPaths);
      _pathLocator.paths.should.equal(objPaths);
    });
    it('if undefined obj is passed in, should throw', function() {
      (function() {
        const _undefinedObj = undefined;
        new PathLocator(_undefinedObj);
      }).should.throw(Error);
    });
  });
  describe('paths', function() {
    it('should throw if it is not a object', function() {
      (function() {
        new PathLocator('It is a string param');
      }).should.throw(Error);
    });
    it('should return the right objPaths value', function() {
      const _pathLocator = new PathLocator(objPaths);
      _pathLocator.paths.should.equal(objPaths);
    });
    it('should set the right objPaths value', function() {
      const _pathLocator = new PathLocator(objPaths);
      const _newObjPaths = {'destinations': 'destinations/path'};
      _pathLocator.paths = _newObjPaths;
      _pathLocator.paths.should.equal(_newObjPaths);
    });
  });
  describe('getPath( path )', function() {
    it('should throw if it is not a object', function() {
      const _pathLocator = new PathLocator(objPaths);
      _pathLocator.getPath('sources.index').should.equal('index/path');
    });
  });
  describe('setPath( path, value )', function() {
    it('should throw if it is not a object', function() {
      const _pathLocator = new PathLocator(objPaths);
      const _indexPath = 'slide/path';
      _pathLocator.setPath('sources.slide', _indexPath);
      _pathLocator.getPath('sources.slide').should.equal(_indexPath);
    });
  });
});