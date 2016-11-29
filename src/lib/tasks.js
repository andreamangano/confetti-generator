'use strict';
import _ from 'lodash';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import mqpacker from 'css-mqpacker';
import scssLint from 'gulp-scss-lint';
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
    gulp.src(src)
      .pipe($.pug(pugOptions).on('error', error => reject(error)))
      .pipe($.if(release, $.htmlmin(htmlMinOptions)))
      .pipe($.rename(fileName).on('error', error => reject(error)))
      .pipe(gulp.dest(dest))
      .on('end', () => resolve());
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
    gulp.src(src)
      .pipe($.if(release, $.sourcemaps.init()))
      // .pipe($.if(release, $.cache('scsslint')))
      //  .pipe( $.if( !release, $.lint() ) )
      .pipe($.sass(sassConfig).on('error', error => reject(error)))
      .pipe($.autoprefixer({
        browsers: AUTOPREFIXER_BROWSERS,
        cascade: false
      }))
      .pipe(release ? $.cssmin() : $.util.noop())
      .pipe(
        $.if(
          release, $.postcss([
            mqpacker({
              sort: true
            })
          ])
        )
      )
      .pipe($.rename(filename))
      .pipe($.if(release, $.sourcemaps.write('.')))
      .pipe(gulp.dest(dest))
      .on('end', () => resolve())
      .on('error', error => reject(error));
  });
}
