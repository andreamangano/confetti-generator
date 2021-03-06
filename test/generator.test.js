'use strict';
import Generator from './../src/lib/generator';
import path from 'path';
import fs from 'fs';
import del from 'del';
import validator from 'tv4';
import slideSchema from './schemes/slide';
validator.addSchema('slide', slideSchema);

//----------------
// GENERATOR TESTS
//----------------
describe('Generator', function() {
  // increase default timeout in case assert operations take too long (i/o usage)
  this.timeout(8000);
  const temp = path.join(__dirname, 'temp');
  const paths = {
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
      {title: 'Slide 1', url: 'slides/1/slide-1.html', path: 'slides/1/slide-1.html', cover: 'image.jpg'},
      {title: 'Slide 2', url: 'slides/2/slide-2.html', path: 'slides/2/slide-2.html', description: 'Slide description'},
      {title: 'Slide 3', url: 'slides/3/slide-3.html', path: 'slides/3/slide-3.html'}
    ],
    translations: [],
    themeConfig: {
      colors: {
        'primary-color': '#fff'
      }
    }
  };
  const generator = new Generator(paths, true);

  //------------
  // CONSTRUCTOR
  //------------
  describe('constructor(paths)', function() {
    it('should be created with one property: pathLocator', function() {
      const _generator = new Generator(paths, true);
      _generator.should.have.property('pathLocator');
    });
    it(`if no parameter is passed in, should throw`, function() {
      (function() {
        new Generator();
      }).should.throw(Error);
    });
    it(`if just one parameter is passed in, should throw`, function() {
      (function() {
        new Generator(paths);
      }).should.throw(Error);
    });
    it(`given more than two parameters`, function() {
      (function() {
        new Generator(paths, true, {});
      }).should.throw(Error);
    });
  });

  //-------------------
  // COMPILE INDEX PAGE
  //-------------------
  describe('compileIndexView(locals)', function() {
    const _src = path.join(paths.sources.views, 'index.pug');
    const _locals = {name: 'Bob'};
    const _expectedFile = 'index.html';

    // Before tests starts
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

  //--------------------
  // COMPILE SLIDE PAGES
  //--------------------
  describe('compileSlideViews(data)', function() {
    const _src = path.join(paths.sources.views, 'slide.pug');
    const _srcWrongFile = path.join(temp, 'template-2.pug');

    // Before tests starts
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

    it('rejects whether something was wrong', function(done) {
      const _config = {
        sources: {
          slide: 'wrong-folder/'
        },
        destinations: {
          slide: path.join(temp)
        }
      };
      const _generator = new Generator(_config, true);
      _generator.compileSlideViews(data).should.be.rejected.and.notify(done);
    });
  });

  //--------------
  // GENERATE DECK
  //--------------
  describe('generateDeck( data, sassConfig, cb)', function() {

    it.skip('should reject whether a promise rejects', function() {
    });

    it.skip('should fulfill whether all promises all fulfill', function() {
    });

    it.skip('should call the callback whether it is defined', function(){
    });
  });

  //-------------------
  // GENERATE SLIDE URL
  //-------------------
  describe('generateSlideUrl( title, index )', function() {
    const urlRegex = /slides\/[0-9]*\/[a-z0-9-]*.html/;

    it('should return a string', function() {
      generator.generateSlideUrl('my title', 1).should.be.an('string');
    });

    it(`should match ${urlRegex}`, function() {
      let url = generator.generateSlideUrl('my title', 1);
      url.should.match(urlRegex);
    })
  });

  //----------
  // FIX SLIDE
  //----------
  describe('fixSlide( slide )', function() {

    it('should add some attributes to a given slides', function() {
      const fixSlide = generator.fixSlide(Object.create(data.slides[0]), 0);
      validator.validate(fixSlide, 'slide').should.equal(true);
    });
  });

  //-------------------
  // SET SASS FUNCTIONS
  //-------------------
  describe('setSassFunctions( config )', function() {

    it('should return an object with a set of functions inside', function() {
      const sassFunctions = generator.setSassFunctions();
      for (const key in sassFunctions) {
        if (sassFunctions.hasOwnProperty(key)) {
          sassFunctions[key].should.be.an('function');
        }
      }
    });
  });
});