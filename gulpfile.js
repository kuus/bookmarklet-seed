// it should be unique enough, and it has to be a valid js variable name,
// so probably in camelCase, no dashes, no spaces, no dots, etc.
var UNIQUEID = 'kuus';

var CREDITS = [
  '/**',
  ' * <%= pkg.name %> v<%= pkg.version %>',
  ' * <%= pkg.homepage %>',
  ' *',
  ' * <%= pkg.description %>',
  ' *',
  ' * Copyright (c) 2014 <%= pkg.author %>',
  ' * Released under <%= pkg.license %> License',
  ' */',
  ''
];

var gulp = require('gulp');
var notify = require('gulp-notify');
var minifyHtml = require('gulp-minify-html');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var inlineSource = require('gulp-inline-source');
var header = require('gulp-header');
var browserSync = require('browser-sync');
var jsesc = require('jsesc');
var fs = require('fs');

var injectTagTemplates = '<!-- inject:templates -->';
var injectTagStyles = '<!-- inject:styles -->';
var injectTagApp = '<!-- inject:app -->';

gulp.task('watch', function() {
  gulp.watch('./src/**/*', ['assemble']);
});

gulp.task('styles', function() {
  return gulp.src('./src/**/*.scss')
    .pipe(sass({
      onError: function(error) {
        notify({
          title: 'Compile Error',
          message: '<%= error.message %>'
        })
      }
    }))
    .pipe(minifyCss())
    .pipe(autoprefixer())
    .pipe(gulp.dest('./.tmp'))
});

gulp.task('scripts', function() {
  return gulp.src('./src/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./.tmp'))
});

gulp.task('templates', function() {
  return gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./.tmp'))
});

gulp.task('inline', ['styles', 'scripts', 'templates'], function() {
  return gulp.src('./.tmp/app/*.html')
    .pipe(inlineSource('./.tmp/app'))
    .pipe(gulp.dest('./.tmp/app'));
});

gulp.task('minify', ['inline'], function() {
  return gulp.src('./.tmp/**/*.html')
    .pipe(minifyHtml({ empty: true, spare: true, quotes: true }))
    .pipe(gulp.dest('./.tmp'))
})

gulp.task('assemble', ['minify'], function() {
  var template = fs.readFileSync('./.tmp/bookmarklet-skeleton.html', 'utf8');
  var style = fs.readFileSync('./.tmp/bookmarklet-skeleton.css', 'utf8');
  var app = fs.readFileSync('./.tmp/app/index.html', 'utf8');
  var pkg = require('./package.json');
  return gulp.src('./src/bookmarklet-skeleton.js')
    .pipe(rename(pkg.name + '.js'))
    .pipe(replace(injectTagTemplates, jsesc(template)))
    .pipe(replace(injectTagStyles, jsesc(style)))
    .pipe(replace(injectTagApp, jsesc(app)))
    .pipe(replace('UNIQUEID', UNIQUEID))
    .pipe(header(CREDITS.join('\n'), { pkg: pkg }))
    .pipe(gulp.dest('./'))
    // create also a minified version
    .pipe(uglify())
    .pipe(rename(pkg.name + '.min.js'))
    .pipe(header(CREDITS.join('\n'), { pkg: pkg }))
    .pipe(gulp.dest('./'))
    // and also a file ready to be copy-pasted in a new bookmarklet
    .pipe(uglify())
    .pipe(rename(pkg.name + '.url.js'))
    .pipe(header('javascript:'))
    .pipe(gulp.dest('./'))
});

function browserSyncInit(startPath, baseDir, files) {
  browserSync.init(files, {
    notify: false,
    open: true,
    startPath: startPath,
    server: {
      baseDir: baseDir
    }
  });
}

gulp.task('browser-sync', function() {
  browserSyncInit('/', [
    '',
    '.tmp'
  ], [
    './index.html',
    './*.js',
  ]);
});

gulp.task('default', ['watch', 'browser-sync']);