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
import fs from 'fs';
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
        'The class requires two parameters: -context (Context)- and'
        + ' -isRelease (Boolen)'
      );
    }
    this.pathLocator = new PathLocator(paths);
    this[sIsRelease] = isRelease;
  }

  /*
    Create a cover object adding the image name, the paths to all formats
  */
  createCover(coverName) {
    return {
      file: coverName,
      format: {
        original: path.join(this.pathLocator.getPath('to.covers'), coverName),
        small: path.join(this.pathLocator.getPath('to.covers'), `small-${coverName}`)
      }
    };
  }

  /*
   Method to create an url and an index for each slide
   */
  fixSlides(slides) {
    return slides.map((slide, i) => {
      slide.index = i + 1;
      slide.url = utils.generateSlideUrl(slide.title, slide.index);
      if (slide.cover && typeof slide.cover === 'string') {
        slide.cover = this.createCover(slide.cover);
      }
      return slide;
    });
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
            slide.url,
            _data,
            this[sIsRelease]
          )
        );
      });
      return Promise.all(promises)
        .then(results => resolve(results))
        .catch(error => reject(error));
    });
  }

  /*
   Method to compile the needed view for a given version
   */
  compileViews(data, cb) {
    return new Promise((resolve, reject) => {
      data.slides = this.fixSlides(data.slides);
      Promise.all([
        this.compileIndexView(data),
        this.compileSlideViews(data)
      ])
        .then(results => {
          if (cb) {
            cb(null, results);
          }
          resolve(results);
        })
        .catch(error => {
          if (cb) {
            cb(error);
          }
          reject(error);
        });
    });
  }

  /*
   Method to compile the selected theme style
   */
  compileStyles(sassConfig, themeConfig, cb) {
    return new Promise((resolve, reject) => {
      if (!sassConfig.functions) {
        sassConfig.functions = {};
      }
      // Add template data to sass function
      sassConfig.functions['getThemeConfig()'] = () => {
        return sassUtils.castToSass(themeConfig);
      };
      tasks.compileStyle(
        path.join(this.pathLocator.getPath('sources.styles'), '**', '*.scss'),
        this.pathLocator.getPath('destinations.styles'),
        'style.css',
        sassConfig,
        this[sIsRelease]
        )
        .then(results => {
          if (cb) {
            cb(null, results);
          }
          resolve(results);
        })
        .catch(error => {
          if (cb) {
            cb(error);
          }
          reject(error);
        });
    });
  }

  /*
   Method to compile scripts
   */
  compileJavascripts() {
    return tasks.copy(
      path.join(this.pathLocator.getPath('sources.javascript'), '**', '*.js'),
      this.pathLocator.getPath('destinations.javascript')
    );
  }

  /*
   Method to compile fonts
   */
  copyFonts() {
    return tasks.copy(
      path.join(this.pathLocator.getPath('sources.fonts'), '**', '*.{eot,ttf,otf,woff,svg}'),
      this.pathLocator.getPath('destinations.fonts')
    );
  }

  /*
   Method to copy deck images (covers included):
   */
  copyDeckImages() {
    return tasks.copy(
      path.join(this.pathLocator.getPath('sources.deckImages'), '**', '*.{svg,png,jpg,jpeg,gif}'),
      this.pathLocator.getPath('destinations.deckImages')
    );
  }

  /*
   Method to resize covers Images
   */
  resizeCovers() {
    return new Promise((resolve, reject) => {
      const promises = [];
      // TODO: Get theme config from data
      const settings = {
        width: 300,
        quality: 90
      };
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
    });
  }

  /*
    Copy the deck images, then resize the cover.
  */
  compileDeckImages() {
    return new Promise((resolve, reject) => {
      this.copyDeckImages()
        .then(() => {
          this.resizeCovers()
            .then(() => resolve())
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  /*
   Method to compile theme images
   */
  copyImages() {
    return tasks.copy(
      path.join(this.pathLocator.getPath('sources.images'), '**', '*.{svg,png,jpg,jpeg,gif}'),
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
