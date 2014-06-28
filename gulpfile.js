var gulp = require('gulp');

var del = require('del');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');

gulp.task('clean',function(cb) {
	del(['dist'],cb);
});

gulp.task('build',['clean'],function() {
	gulp.src('lib/index.js')
		.pipe(uglify())
		.pipe(browserify({standalone:'Foswig'}))
		.pipe(concat('foswig.js'))
		.pipe(gulp.dest('dist'));
});

gulp.task('watch',function() {
	gulp.watch('foswig.js', ['build']);
});

gulp.task('default',['build']);
