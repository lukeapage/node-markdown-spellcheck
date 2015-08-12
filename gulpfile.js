var gulp = require('gulp');
require('babel/register');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha');
var runSequence = require("run-sequence");

var path = require('path');

var paths = {
  es6: ['es6/**/*.js'],
  es5: 'es5',
  test: 'test/**/*.js'
};
gulp.task('babel', function () {
  return gulp.src(paths.es6)
    .pipe(babel({
      loose: true
    }))
    .pipe(gulp.dest(paths.es5));
});
gulp.task('watch', function() {
  gulp.watch(paths.es6, ['test']);
});
gulp.task('default', ['watch']);

gulp.task('test', function(callback) {
  runSequence('babel', 'mocha', callback);
});
gulp.task('mocha', function () {
  return gulp.src(paths.test)
    .pipe(mocha())
    .once('error', function () {
      process.exit(1);
    })
    .once('end', function () {
      process.exit();
    });
});