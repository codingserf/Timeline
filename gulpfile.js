var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');

var cssfiles = [
    'dist/css/reset.css',
    'dist/css/font-awesome.css',
    'dist/css/common.css'
];
var jslibfiles = [
    'libs/jquery/1.11.1/jquery.min.js',
    'libs/greensock/src/minified/TweenLite.min.js',
    'libs/greensock/src/minified/TimelineLite.min.js',
    'libs/greensock/src/minified/plugins/CSSPlugin.min.js',
    'libs/highcharts/js/highcharts.src.js',
    'libs/socketio/1.3.4/socket.io.js',
    'libs/codingserf/util.js'
];

var browserSync = require('browser-sync');

// Static server
gulp.task('browser-sync', function() {
    browserSync({
        server: {

            //指定服务器启动根目录
            baseDir: "./dist"
        }
    });

    //监听文件变化实时更新
    gulp.watch("./dist/**/*.*").on('change', browserSync.reload);
});
// 语法检查
/*gulp.task('jshint', function () {
    return gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});*/
//压缩图片
gulp.task('imagemin-assets',function(){
    return gulp.src('assets/images/**/*')
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(gulp.dest('dist/assets/images'));
});
gulp.task('imagemin-css',function(){
    return gulp.src('less/images/**/*')
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(gulp.dest('dist/css/images'));
});
gulp.task('imagemin',['imagemin-assets','imagemin-css']);
//压缩库
gulp.task('libs', function(){
    return gulp.src(jslibfiles)
        .pipe(uglify())
        .pipe(concat('libs.min.js'))
        .pipe(gulp.dest('dist/js/'));
});
// 压缩js
gulp.task('minify-js', function (){
     return gulp.src('src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(concat('all.min.js'))
        .pipe(gulp.dest('dist/js/'));
});

gulp.task('less',function () {
	return gulp.src('less/*.less')
    	.pipe(less())
    	.pipe(gulp.dest('dist/css/'));
});
gulp.task('minify-css',['less'],function () {
    return gulp.src(cssfiles)
        .pipe(minifyCSS())
        .pipe(concat('all.min.css'))
        .pipe(gulp.dest('dist/css/'));
});
    
// 监视文件的变化
gulp.task('watch', function () {
    gulp.watch('less/*.less', ['minify-css']);
    gulp.watch('src/*.js', ['minify-js']);
});

// 注册缺省任务
gulp.task('default', ['minify-css', 'minify-js', 'watch']);