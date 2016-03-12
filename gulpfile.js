var gulp = require('gulp');
require('babel-core/register');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha');
var runSequence = require("run-sequence");
var del = require('del');
var eslint = require('gulp-eslint');
var eslintIfFixed = require('gulp-eslint-if-fixed');
var path = require('path');

var paths = {
  es6: ['es6/**/*.js'],
  es5: 'es5',
  es5Files: 'es5/*.js',
  test: 'test/**/*.js'
};

gulp.task('clean', function() {
  del([paths.es5Files]);
});

gulp.task('babel', function () {
  return gulp.src(paths.es6)
    .pipe(babel())
    .pipe(gulp.dest(paths.es5));
});

gulp.task('watch', function() {
  gulp.watch(paths.es6, ['test']);
});

gulp.task('default', ['watch']);

gulp.task('test', function(callback) {
  runSequence('clean', 'babel', 'mocha', callback);
});

gulp.task('mocha', function () {
  return gulp.src(paths.test)
    .pipe(mocha({
      timeout: 10000
    }))
    .once('error', function (e) {
      console.error(e);
      process.exit(1);
    });
});

gulp.task('lint', function () {
  return gulp.src(paths.es6)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});
gulp.task('lint-fix', function() {
  return gulp.src(paths.es6)
    .pipe(eslint({fix:true}))
    .pipe(eslint.format())
    .pipe(eslintIfFixed('es6'));
});
