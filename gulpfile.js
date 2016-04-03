/**
 * bookmarklet-seed
 * http://github.com/kuus/bookmarklet-seed
 *
 * Copyright (c) 2014-2016 kuus <kunderikuus@gmail.com> (http://github.com/kuus/)
 * Released under MIT License
 */

'use strict';

// it should be unique enough, and it has to be a valid js variable name (with dot notation),
// so no dashes, no spaces, no dots, etc.
var UNIQUEID = 'kuusbkmrkletsd';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var argv = require('minimist')(process.argv.slice(2));
var browserSync = require('browser-sync');
var jsesc = require('jsesc');
var fs = require('fs');
var pkg = require('./package.json');
var tpl = require('lodash.template');
var banner = tpl([
  '/*!',
  ' * <%- pkg.config.namePretty %> v<%- pkg.version %> (<%- pkg.homepage %>)',
  ' * <%- pkg.description %>',
  ' *',
  ' * by <%- pkg.author.name %> <<%- pkg.author.email %>> (<%- pkg.author.url %>)',
  ' * <%- pkg.license.type %> <%- pkg.config.startYear %><% if (new Date().getFullYear() > pkg.config.startYear) { %>-<%- new Date().getFullYear() %><% } %><% if (pkg.license.url) { %> (<%- pkg.license.url %>)<% } %>',
  ' */\n'
].join('\n'))({ pkg: pkg });

var injectTagTemplates = '<!-- inject:templates -->';
var injectTagStyles = '<!-- inject:styles -->';
var injectTagApp = '<!-- inject:app -->';

gulp.task('watch', function() {
  gulp.watch('src/**/*', ['assemble']);
});

gulp.task('styles', function() {
  return gulp.src('src/**/*.scss')
    .pipe($.plumber())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      require('autoprefixer')({browsers: ['> 1%', 'last 2 versions', 'ie 8']}),
      require('css-mqpacker')({sort: true})
    ]))
    .pipe($.cssnano())
    .pipe(gulp.dest('.tmp'));
});

gulp.task('scripts', function() {
  return gulp.src('src/**/*.js')
    .pipe($.uglify())
    .pipe(gulp.dest('.tmp'));
});

gulp.task('templates', function() {
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest('.tmp'));
});

gulp.task('inline', ['styles', 'scripts', 'templates'], function() {
  return gulp.src('.tmp/app/*.html')
    .pipe($.inlineSource('.tmp/app'))
    .pipe(gulp.dest('.tmp/app'));
});

gulp.task('minify', ['inline'], function() {
  return gulp.src('.tmp/**/*.html')
    .pipe($.htmlmin({ removeComments: true, loose: true, minifyJS: true, minifyCSS: true, collapseWhitespace: true }))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('assemble', ['minify'], function() {
  var template = fs.readFileSync('.tmp/bookmarklet-skeleton.html', 'utf8');
  var style = fs.readFileSync('.tmp/bookmarklet-skeleton.css', 'utf8');
  var app = fs.readFileSync('.tmp/app/index.html', 'utf8');

  return gulp.src('src/bookmarklet-skeleton.js')
    .pipe($.rename(pkg.name + '.js'))
    .pipe($.replace(injectTagTemplates, jsesc(template)))
    .pipe($.replace(injectTagStyles, jsesc(style)))
    .pipe($.replace(injectTagApp, jsesc(app)))
    .pipe($.replace('UNIQUEID', UNIQUEID))
    .pipe($.header(banner))
    .pipe(gulp.dest('dist'))
    // create also a minified version
    .pipe($.uglify())
    .pipe($.rename(pkg.name + '.min.js'))
    .pipe($.header(banner))
    .pipe(gulp.dest('dist'))
    // and also a file ready to be copy-pasted in a new bookmarklet
    .pipe($.uglify())
    .pipe($.rename(pkg.name + '.url.js'))
    .pipe($.header('javascript:'))
    .pipe(gulp.dest('dist'));
});

gulp.task('browser-sync', function() {
  return browserSync.init(['index.html', 'dist/*.js'], {
    notify: false,
    open: !!argv.open,
    startPath: '/',
    server: {
      baseDir: ['', '.tmp']
    }
  });
});

gulp.task('default', ['watch', 'browser-sync']);
