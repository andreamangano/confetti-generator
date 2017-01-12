'use strict';
import _ from 'lodash';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import mqpacker from 'css-mqpacker';
import pump from 'pump';
// import scssLint from 'gulp-scss-lint';
import jimp from 'jimp';
const $ = gulpLoadPlugins();
/*
 Generic function to compile a single view
 */
export function compileView(src, dest, fileName, locals, release) {
  return new Promise((resolve, reject) => {
    // Set options for pug
    const pugOptions = {
      pretty: release,
      locals: _.cloneDeep(locals)
    };
    // Set options for htmlmin
    const htmlMinOptions = {
      removeComments: true,
      collapseWhitespace: true,
      minifyJS: true,
      minifyCSS: true
    };
    pump([
      gulp.src(src),
      $.pug(pugOptions),
      $.if(release, $.htmlmin(htmlMinOptions)),
      $.rename(fileName),
      gulp.dest(dest)
    ], err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}
/*
 Generic function to javascript
 */
export function compileJavascripts(src, dest, release) {
  return new Promise((resolve, reject) => {
    pump([
      gulp.src(src),
      $.if(release, $.uglify()),
      gulp.dest(dest)
    ], err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}
/*
 Generic function to compile style
 */
export function compileStyle(src, dest, filename, sassConfig, release) {
  return new Promise((resolve, reject) => {
    // TODO: move as parameter
    const AUTOPREFIXER_BROWSERS = [
      'ie >= 10',
      'ie_mob >= 10',
      'ff >= 30',
      'chrome >= 34',
      'safari >= 7',
      'opera >= 23',
      'ios >= 7',
      'android >= 4.4',
      'bb >= 10'
    ];
    pump([
      gulp.src(src),
      $.if(release, $.sourcemaps.init()),
      // $.if(release, $.cache('scsslint')),
      // $.if( !release, $.lint() ),
      $.sass(sassConfig),
      $.autoprefixer({
        browsers: AUTOPREFIXER_BROWSERS,
        cascade: false
      }),
      release ? $.cssmin() : $.util.noop(),
      $.if(
        release, $.postcss([
          mqpacker({
            sort: true
          })
        ])
      ),
      $.rename(filename),
      $.if(release, $.sourcemaps.write('.')),
      gulp.dest(dest)
    ], err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}
/*
 Generic function to copy files
 */
export function copy(src, dest) {
  return new Promise((resolve, reject) => {
    pump([
      gulp.src(src),
      gulp.dest(dest)
    ], err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}
/*
 Generic function to resize a given image
 */
export function resizeImage(src, dest, settings) {
  const _settings = Object.assign({
    width: 250,
    quality: 80
  }, settings);
  return new Promise((resolve, reject) => {
    jimp.read(src).then(image => {
      image.resize(_settings.width, jimp.AUTO)
        .quality(_settings.quality)
        .write(dest, err => {
          if (err) {
            reject(err);
          }
          resolve(image);
        });
    }).catch(err => {
      reject(err);
    });
  });
}
