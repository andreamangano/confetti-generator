'use strict';
import Generator from './../src/lib/generator';
import path from 'path';
import fs from 'fs';
import del from 'del';
describe('Generator', function() {

  // increase default timeout in case assert operations take too long (i/o usage)
  this.timeout(8000);
  const temp = path.join(__dirname, 'temp');
  const config = {
    sources: {
      views: temp
    },
    destinations: {
      index: temp,
      slide: temp
    },
    to: {
      covers: '/'
    }
  };
  const data = {
    theme: 'lena',
    slides: [
      {title: 'Slide 1', url: 'slides/1/slide-1.html', path: 'slides/1/slide-1.html'},
      {title: 'Slide 2', url: 'slides/2/slide-2.html', path: 'slides/2/slide-2.html'},
      {title: 'Slide 3', url: 'slides/3/slide-3.html', path: 'slides/3/slide-3.html'}
    ],
    translations: []
  };
  const generator = new Generator(config, true);
  describe('constructor( config )', function() {
    it('should be created with one properties: pathLocator', function() {
      const _generator = new Generator(config, true);
      _generator.should.have.property('pathLocator');
    });
    it(`if no parameter is passed in, should throw`, function() {
      (function() {
        new Generator();
      }).should.throw(Error);
    });
    it(`if just one parameter is passed in, should throw`, function() {
      (function() {
        new Generator(config);
      }).should.throw(Error);
    });
    it(`given more than two parameters`, function() {
      (function() {
        new Generator(config, true, {});
      }).should.throw(Error);
    });
  });
  describe('compileIndexView( locals )', function() {
    const _src = path.join(config.sources.views, 'index.pug');
    const _locals = {name: 'Bob'};
    const _expectedFile = 'index.html';
    before(function() {
      fs.writeFileSync(_src, `h1= 'Hello ' + name`, 'utf8');
    });
    it('should bundle into a single file', function(done) {
      generator.compileIndexView(_locals).then(
        () => {
          fs.existsSync(path.join(temp, _expectedFile)).should.equal(true);
          del.sync([_src, path.join(temp, _expectedFile)]);
          done();
        });
    });
  });
  describe('compileSlideViews( data )', function() {
    const _src = path.join(config.sources.views, 'slide.pug');
    const _srcWrongFile = path.join(temp, 'template-2.pug');
    before(function() {
      fs.writeFileSync(_src, `h1= 'Slide' + slide.title`, 'utf8');
      fs.writeFileSync(_srcWrongFile, 'include ./includes/header.pug', 'utf8');
    });
    it('should render all views templates', function(done) {
      generator.compileSlideViews(data).then(
        () => {
          let pathSlide;
          data.slides.forEach(slide => {
            pathSlide = path.join(temp, slide.path);
            fs.existsSync(pathSlide).should.equal(true);
          });
          del.sync([_src, path.join(temp, 'slides')]);
          done();
        });
    });
    it('rejects if something was wrong', function(done) {
      const _config = {
        sources: {
          slide: _srcWrongFile
        },
        destinations: {
          slide: path.join(temp)
        }
      };
      const _generator = new Generator(_config, true);
      _generator.compileSlideViews(data).should.be.rejected.and.notify(done);
    });
  });
  describe('generateDeck( data, sassConfig, cb)', function() {
    it.skip('should reject if a promise rejects', function() {
    });
    it.skip('should fulfill if all promises all fulfill', function() {
    });
    it.skip('should call the callback if it is defined', function(){
    });
  });
});