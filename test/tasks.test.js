'use strict';
import * as tasks from './../src/lib/tasks';
import path from 'path';
import fs from 'fs';
import del from 'del';

//------
// TASKS
//------
describe('Tasks', function() {
  // increase default timeout in case assert operations take too long (i/o usage)
  this.timeout(8000);
  const temp = path.join(__dirname, 'temp');

  //-------------
  // COMPILE VIEW
  //-------------
  describe('compileView(src, dest, fileName, locals, release)', function() {
    const _src = path.join(temp, 'template.pug');
    const _srcWrongFile = path.join(temp, 'template-2.pug');
    const _expectedFile = 'template-compiled.html';
    const _locals = {name: 'Bob'};

    before(function() {
      fs.writeFileSync(_src, "h1= 'Hello ' + name", 'utf8');
    });

    after(function() {
      del([_src, _srcWrongFile, path.join(temp, _expectedFile)]);
    });

    const testBundleFile = (release, done) => {
      del([path.join(temp, _expectedFile)]).then(paths => {
        tasks.compileView(_src, temp, _expectedFile, _locals, release).then(()=> {
          fs.existsSync(path.join(temp, _expectedFile)).should.equal(true);
          done();
        });
      });
    };

    it('should bundle into a single file (Production Env)', function(done) {
      testBundleFile(true, done);
    });

    it('should bundle into a single file (Development Env)', function(done) {
      testBundleFile(false, done);
    });

    it('should pass -locals- to template', function(done) {
      del([path.join(temp, _expectedFile)]).then(paths => {
        tasks.compileView(_src, temp, _expectedFile, _locals, true).then(()=> {
          fs.readFileSync(path.join(temp, _expectedFile)).toString('utf8').should.contain(_locals.name);
          done();
        });
      });
    });

    it('throw on gulp-rename error', function(done) {
      // Pass wrong parameter fileName
      tasks.compileView(_src, temp, null, _locals, true).should.be.rejected.and.notify(done);
    });

    it('throw on gulp-pug error', function(done) {
      // Create file with wrong include
      fs.writeFileSync(_srcWrongFile, 'include ./includes/header.pug', 'utf8');
      tasks.compileView(_srcWrongFile, temp, _expectedFile, _locals, true).should.be.rejectedWith(Error).notify(done);
    });
  });

  //--------------
  // COMPILE STYLE
  //--------------
  describe('compileStyle(src, dest, filename, sassConfig, release)', function() {
    const _src = path.join(temp, 'style.scss');
    const _fileContent = `$primary-color: #ff0000; body { background-color: $primary-color; }`;
    const _expectedFile = 'style.css';
    const _sassConfig = {};

    before(function() {
      fs.writeFileSync(_src, _fileContent, 'utf8');
    });

    after(function() {
      del([_src, path.join(temp, _expectedFile), path.join(temp, `${_expectedFile}.map`)]);
    });

    const testBundleFile = (release, done) => {
      del([path.join(temp, _expectedFile)]).then(paths => {
        tasks.compileStyle(_src, temp, _expectedFile, _sassConfig, release).then(
          () => {
            fs.existsSync(path.join(temp, _expectedFile)).should.equal(true);
            done();
          });
      });
    };

    it('should bundle into a single file (Production Env)', function(done) {
      testBundleFile(true, done);
    });

    it('should bundle into a single file (Development Env)', function(done) {
      testBundleFile(false, done);
    });
  });
});