'use strict';
import _ from 'lodash';
import * as tasks from './tasks';
import * as utils from './utils';
const PathLocator = require('./pathLocator');
const slideNavigation = require('./slideNavigation');
const sIsRelease = Symbol('release');
/*
 The generator class aims to generate all needed assets for the speaker deck.
 It takes a config obj to retrieve the source and destination paths and a
 parameter to define the working environment.
 */
class Generator {
  constructor(config, isRelease) {
    /*
     Check on the arguments count
     */
    if (arguments.length !== 2) {
      throw new Error(
        'The class requires two parameters: -context (Context)- and'
        + ' -isRelease (Boolen)'
      );
    }
    this.pathLocator = new PathLocator(config);
    this[sIsRelease] = isRelease;
  }
  /*
   Method to create an url and an index for each slide
   */
  fixSlides(slides) {
    return slides.map((slide, i) => {
      slide.index = i + 1;
      slide.url = utils.generateSlideUrl(slide.title, slide.index);
      return slide;
    });
  }
  /*
   Method to compile the index view (from the selected theme)
   of a given language
   */
  compileIndexView(locals) {
    return tasks.compileView(
      this.pathLocator.getPath('sources.index'),
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
        // Set current slide object as local data
        _data.slide = slide;
        // set slider navigation as local data
        _data.sliderNav = slideNavigation.create(_data.slides, i);
        promises.push(
          tasks.compileView(
            this.pathLocator.getPath('sources.slide'),
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
  compileStyles(sassConfig, cb) {
    return new Promise((resolve, reject) => {
      tasks.compileStyle(
        this.pathLocator.getPath('sources.style'),
        this.pathLocator.getPath('destinations.style'),
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
  compileScripts(cb) {
    // TODO
  }
  /*
   Method to compile images
   */
  compileImages(cb) {
  }
}

module.exports = Generator;
