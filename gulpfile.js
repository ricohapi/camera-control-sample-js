var gulp = require('gulp'),
  eslint = require('gulp-eslint'),
  webserver = require('gulp-webserver'),
  webpack = require('webpack-stream'),
  webpackConfig = require('./webpack.config.js');

gulp.task('server', function () {
    gulp.src('')
        .pipe(webserver({
            host: 'localhost',
            port: 8033,
            open: true,
            fallback: 'samples/index.html'
        }));
});

gulp.task('build', function() {
  return gulp.src('')
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(''));
});

gulp.task('lint', function() {
  return gulp.src(['src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});
