var gulp = require('gulp');
var babel = require('gulp-babel');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var browserify = require('browserify');

var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var assign = require('lodash.assign');

var FILE_PATH = {
  js: 'src/js/*.js',
  sass: 'src/css/*.scss'
};

var bOpts = {
  entries: ['./examples/js/demo.coffee'],
  extensions: ['.coffee']
};

var b = browserify(bOpts);

function bundle() {
  return b.bundle()
    .pipe(source('demo.js'))
    .pipe(gulp.dest('examples/js'));
}

gulp.task('js', function() {
  gulp.src(FILE_PATH.js)
  .pipe(babel())
  .pipe(gulp.dest('dist'));
});

gulp.task('sass', function() {
  gulp.src(FILE_PATH.sass)
  .pipe(plumber())
  .pipe(sass())
  .pipe(gulp.dest('dist'))
});

gulp.task('demo', function() {
  gulp.src('examples/css/demo.scss')
  .pipe(plumber())
  .pipe(sass())
  .pipe(gulp.dest('examples/css/'))

  b.bundle()
  .pipe(plumber())
  .pipe(source('demo.js'))
  .pipe(gulp.dest('./examples/js/'));
});



gulp.task('default', ['js', 'sass']);

gulp.task('watch', function(){
  gulp.watch(FILE_PATH.js, ['js']);
  gulp.watch(FILE_PATH.sass, ['sass']);
  gulp.watch(['examples/js/*','examples/css/*'], ['demo']);
});
