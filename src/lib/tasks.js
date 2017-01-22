'use strict';
import _ from 'lodash';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import mqpacker from 'css-mqpacker';
import pump from 'pump';
// import scssLint from 'gulp-scss-lint';
import jimp from 'jimp';
import path from 'path';
const $ = gulpLoadPlugins();
/*
 Generic function to compile a single view
 */
function compileView(src, dest, fileName, locals, release) {
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
function compileJavascripts(src, dest, release) {
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
function compileStyle(src, dest, filename, sassConfig, release) {
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
      $.if(filename, $.rename(filename)),
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
function copy(src, dest) {
  // TODO: add optimizer
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
function resizeImage(src, dest, fileName, format) {
  return new Promise((resolve, reject) => {
    jimp.read(src).then(image => {
      if (image.bitmap.width > format.width) {
        image.resize(format.width, jimp.AUTO)
          .quality(format.quality);
      }
      image.write(path.join(dest, fileName), err => {
        if (err) {
          reject(err);
        }
        resolve(image);
      });
    }).catch(err => reject(err));
  });
}

function resizeImageFromFormats(src, dest, fileName, formats) {
  return new Promise((resolve, reject) => {
    const promises = [];
    Object.keys(formats).forEach((key, i) => {
      promises[i] = resizeImage(src, dest, `${key}__${fileName}`, formats[key]);
    });
    Promise.all(promises)
      .then(() => resolve())
      .catch(err => reject(err));
  });
}

export default {
  compileView,
  compileJavascripts,
  compileStyle,
  copy,
  resizeImage,
  resizeImageFromFormats
};

