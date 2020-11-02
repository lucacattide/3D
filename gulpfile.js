'use strict';
// Inclusione Moduli
const gulp = require('gulp');
const banner = require('gulp-banner');
const pkg = require('./package.json');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const uglifyjs = require('uglify-js-harmony');
const minifier = require('gulp-uglify/minifier');
const concat = require('gulp-concat');
const stripDebug = require('gulp-strip-debug');
const size = require('gulp-size');
const csso = require('gulp-csso');
const autoprefix = require('gulp-autoprefixer');
const compass = require('gulp-compass');
const wiredep = require('wiredep').stream;
const webpack = require('gulp-webpack');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
// Dichiarazione Variabili
const comment = '/*\n' +
  ' * <%= pkg.name %> <%= pkg.version %>\n' +
  ' * <%= pkg.description %>\n' +
  ' * <%= pkg.homepage %>\n' +
  ' * <%= pkg.author %>\n' +
  ' * Rilasciato sotto licenza <%= pkg.license %>.\n' +
  '*/\n';
const comment1 = '<!--\n' +
  '<%= pkg.name %> <%= pkg.version %>\n' +
  '<%= pkg.description %>\n' +
  '<%= pkg.homepage %>\n' +
  '<%= pkg.author %>\n' +
  'Rilasciato sotto licenza <%= pkg.license %>.\n' +
  '-->\n';
// Tasks
// Immagini
gulp.task('img', () => {
  return gulp.src('./img/*')
    .pipe(imagemin())
    .pipe(gulp.dest('./img'));
});
// HTML
gulp.task('html', () => gulp.src('./html/*.html')
  .pipe(htmlmin({
    collapseWhitespace: true,
  }))
  .pipe(size())
  .pipe(gulp.dest('./html/dist'))
);
// PHP
gulp.task('php', () => gulp.src('./php/*.php')
  .pipe(htmlmin({
    collapseWhitespace: true,
  }))
  .pipe(size())
  .pipe(gulp.dest('./php/dist'))
);
// Index
gulp.task('index', () => gulp.src(['./*.html', './*.php'])
  .pipe(htmlmin({
    collapseWhitespace: true,
  }))
  .pipe(size())
  .pipe(gulp.dest('./dist'))
);
// Compass
gulp.task('compass', () => {
  gulp.src('./sass/**/*.scss')
    .pipe(compass({
      config_file: './config.rb',
      css: 'css',
      sass: 'sass',
      sourcemap: true,
    }))
    .pipe(gulp.dest('./css'));
});
// CSS
gulp.task('css', () => {
  gulp.src('./css/dist/index.css')
    .pipe(autoprefix())
    .pipe(concat('main.css'))
    .pipe(csso())
    .pipe(size())
    .pipe(gulp.dest('./css/dist'));
});
// JS + Babel
gulp.task('js', () => {
  const options = {
    preserveComments: 'license',
  };
  gulp.src('./js/index.js')
	.pipe(sourcemaps.init())
	//.pipe(stripDebug())
	.pipe(babel({
		presets: ['env'],
	}))
    .pipe(concat('./main.js'))
    .pipe(minifier(options, uglifyjs))
	.pipe(size())
	.pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./js/dist'));
});
// webpack
gulp.task('webpack', () => {
  return gulp.src('./js/dist/main.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('./js/dist'));
});
// Banner
gulp.task('banner-index', () => {
  gulp.src(['./dist/*.html', './dist/*.html'])
    .pipe(banner(comment1, {
      pkg: pkg,
    }))
    .pipe(gulp.dest('./dist'));
});
gulp.task('banner-sass', () => {
  gulp.src('./sass/dist/*.scss')
    .pipe(banner(comment, {
      pkg: pkg,
    }))
    .pipe(gulp.dest('./sass/dist'));
});
gulp.task('banner-css', () => {
  gulp.src('./css/dist/*.css')
    .pipe(banner(comment, {
      pkg: pkg,
    }))
    .pipe(gulp.dest('./css/dist'));
});
gulp.task('banner-js', () => {
  gulp.src('./js/dist/*.js')
    .pipe(banner(comment, {
      pkg: pkg,
    }))
    .pipe(gulp.dest('./js/dist'));
});
// Bower
gulp.task('bower', () => {
  gulp.src('./templates/Page.ss')
    .pipe(wiredep())
    .pipe(gulp.dest('./templates/'));
});
// Default
gulp.task('default', [
  'img',
  'compass',
  'css',
  'js',
  'webpack',
  'bower',
], () => {
  gulp.watch('./sass/**/*.scss', ['compass']);
  gulp.watch('./css/**/*.css', ['css']);
  gulp.watch('./js/**/*.js', ['js']);
  gulp.watch('./js/dist/main.js', ['webpack']);
});
// Produzione
gulp.task('dist', [
  'html',
  'php',
  'index',
  'banner-index',
  'banner-sass',
  'banner-css',
  'banner-js',
]);
