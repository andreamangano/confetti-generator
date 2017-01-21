'use strict';
require('babel-polyfill');
import _ from 'lodash';
import * as tasks from './tasks';
import * as utils from './utils';
import PathLocator from './pathLocator';
import sass from 'node-sass';
import sassUtilsPkg from 'node-sass-utils';
import marked from 'marked';
import path from 'path';
const sassUtils = sassUtilsPkg(sass);
const slideNavigation = require('./slideNavigation');
const sIsRelease = Symbol('release');
/*
 The generator class aims to generate all needed assets for the speaker deck.
 It takes a config obj to retrieve the source and destination paths and a
 parameter to define the working environment.
 */
class Generator {
  constructor(paths, isRelease) {
    /*
     Check on the arguments count
     */
    if (arguments.length !== 2) {
      throw new Error(
        `The class requires two parameters: -context (Context)- and -isRelease (Boolean)`
      );
    }
    this.pathLocator = new PathLocator(paths);
    this[sIsRelease] = isRelease;
  }

  /*
   Utility function to generate the url of a single slide
   */
  generateSlideUrl(title, index) {
    // Clean the title to make it an sane url
    // It will be the name of the page for the given slide
    const cleanedSlideTitle = utils.cleanUrl(title.toLowerCase());
    // Add html extension
    const pageName = `${cleanedSlideTitle}.html`;
    // Return the path where the html page will be placed
    return `slides/${index}/${pageName}`;
  }

  /*
    Create a cover object adding the image name and the paths of all formats
  */
  generateSlideCoverPaths(coverName) {
    return {
      file: coverName,
      format: {
        original: path.join(this.pathLocator.getPath('to.covers'), coverName),
        small: path.join(this.pathLocator.getPath('to.covers'), `small-${coverName}`)
      }
    };
  }

  fixSlide(slide, index) {
    slide.index = index + 1;
    const baseUrl = this.generateSlideUrl(slide.title, slide.index);
    slide.url = baseUrl;
    slide.path = baseUrl;
    if (slide.cover && typeof slide.cover === 'string') {
      slide.cover = this.generateSlideCoverPaths(slide.cover);
    }
    return slide;
  }

  /*
   Method to compile the index view (from the selected theme)
   of a given language
   */
  compileIndexView(locals) {
    return tasks.compileView(
      path.join(this.pathLocator.getPath('sources.views'), 'index.pug'),
      this.pathLocator.getPath('destinations.index'),
      'index.html',
      locals,
      this[sIsRelease]
    );
  }

  /*
   Method to compile the page template for every single slide
   */
  compileSlideViews(data) {
    return new Promise((resolve, reject) => {
      const _data = _.cloneDeep(data);
      const promises = [];
      _data.slides.forEach((slide, i) => {
        if (slide.description) {
          slide.description = marked(slide.description);
        }
        // Set current slide object as local data
        _data.slide = slide;
        // Set slider navigation as local data
        _data.sliderNav = slideNavigation.create(_data.slides, i);
        promises.push(
          tasks.compileView(
            path.join(this.pathLocator.getPath('sources.views'), 'slide.pug'),
            this.pathLocator.getPath('destinations.slide'),
            slide.path,
            _data,
            this[sIsRelease]
          )
        );
      });
      Promise.all(promises)
        .then(results => resolve(results))
        .catch(error => reject(error));
    });
  }

  /*
   Method to compile the needed views
   */
  compileViews(data) {
    return new Promise((resolve, reject) => {
      if (data.cover && typeof data.cover === 'string') {
        data.cover = this.generateSlideCoverPaths(data.cover);
      }
      data.slides.map((slide, i) => {
        return this.fixSlide(slide, i);
      });

      Promise.all([
        this.compileIndexView(data),
        this.compileSlideViews(data)
      ])
        .then(results => resolve(results))
        .catch(error => reject(error));
    });
  }

  setSassFunctions(config) {
    const functions = {};
    functions['getThemeConfig()'] = () => {
      return sassUtils.castToSass(config);
    };
    return functions;
    // TODO: cast  items attributes colors to sass colors
  }

  /*
   Method to compile the selected theme style
   */
  compileStyles(sassConfig, themeConfig) {
    return new Promise((resolve, reject) => {
      sassConfig.functions = _.merge(
        sassConfig.functions || {},
        this.setSassFunctions(themeConfig));
      tasks.compileStyle(
        path.join(this.pathLocator.getPath('sources.styles'), '**', '*.scss'),
        this.pathLocator.getPath('destinations.styles'),
        'styles.css',
        sassConfig,
        this[sIsRelease]
      )
        .then(results => resolve(results))
        .catch(error => reject(error));
    });
  }

  /*
   Method to compile scripts
   */
  compileJavascripts(sourcesPath) {
    const _sourcesPath = sourcesPath || path.join(this.pathLocator.getPath('sources.javascript'), '**', '*.js');
    return tasks.compileJavascripts(
      _sourcesPath,
      this.pathLocator.getPath('destinations.javascript'),
      this[sIsRelease]
    );
  }

  /*
   Method to compile fonts
   */
  copyFonts(sourcesPath) {
    const _sourcesPath = sourcesPath || path.join(this.pathLocator.getPath('sources.fonts'), '**', '*.{eot,ttf,otf,woff,svg}');
    return tasks.copy(
      _sourcesPath,
      this.pathLocator.getPath('destinations.fonts')
    );
  }

  /*
   Method to copy deck images (covers included):
   */
  copyDeckImages(sourcesPath, destinationPath) {
    const _sourcesPath = sourcesPath || path.join(this.pathLocator.getPath('sources.deckImages'), '**', '*.{svg,png,jpg,jpeg,gif}');
    const _destinationPath = destinationPath || this.pathLocator.getPath('destinations.deckImages');
    return tasks.copy(
      _sourcesPath,
      _destinationPath
    );
  }

  /*
   Method to resize covers Images
   */
  resizeCovers(sourcesPath) {
    return new Promise((resolve, reject) => {
      const promises = [];
      // TODO: Get theme config from data
      const settings = {
        width: 300,
        quality: 90
      };

      if (sourcesPath) {
        const fileName = sourcesPath.replace(/^.*[/\\]/, '');
        tasks.resizeImage(
          sourcesPath,
          path.join(this.pathLocator.getPath('destinations.covers'), `small-${fileName}`),
          settings)
            .then(() => resolve())
            .catch(error => reject(error));
      } else {
        const coversDir = this.pathLocator.getPath('sources.covers');
        if (utils.dirExists(coversDir)) {
          utils.listFile(this.pathLocator.getPath('sources.covers'))
            .filter(file => {
              return /\.(jpe?g|png|gif)$/i.test(file);
            })
            .forEach((file, i) => {
              promises[i] = tasks.resizeImage(
                path.join(this.pathLocator.getPath('sources.covers'), file),
                path.join(this.pathLocator.getPath('destinations.covers'), `small-${file}`),
                settings
              );
            });
        }
        return Promise.all(promises)
          .then(results => resolve(results))
          .catch(error => reject(error));
      }
    });
  }

  /*
    Copy the deck images, then resize the cover.
  */
  compileDeckImages(sourcesPath, destinationPath) {
    return new Promise((resolve, reject) => {
      this.copyDeckImages(sourcesPath, destinationPath)
        .then(() => {
          this.resizeCovers(sourcesPath)
            .then(() => resolve())
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  /*
   Method to compile theme images
   */
  copyImages(sourcesPath) {
    const _sourcesPath = sourcesPath || path.join(this.pathLocator.getPath('sources.images'), '**', '*.{svg,png,jpg,jpeg,gif}');
    return tasks.copy(
      _sourcesPath,
      this.pathLocator.getPath('destinations.images')
    );
  }

  /*
   Method to generate all stuff
   */
  generate(data) {
    return Promise.all([
      this.copyFonts(),
      this.copyImages(),
      this.compileDeckImages(),
      this.compileJavascripts(),
      this.compileStyles(data.compilers.sass, data.themeConfig),
      this.compileViews(data)
    ]);
  }
}
export default Generator;
