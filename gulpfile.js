var gulp = require('gulp');
var babel = require('gulp-babel');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');

var FILE_PATH = {
    js: 'src/js/*.js',
    sass: 'src/css/*.scss'
};

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

gulp.task('default', ['js', 'sass']);

gulp.task('watch', function(){
    gulp.watch(FILE_PATH.js, ['js'])
    gulp.watch(FILE_PATH.sass, ['sass'])
});
