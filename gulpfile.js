var gulp = require('gulp');
var minify = require('gulp-babel-minify');
var htmlmin = require('gulp-htmlmin');
var cssmin = require('gulp-cssmin');
var concat = require('gulp-concat');
var zip = require('gulp-zip');
var fs = require('fs');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var watch = require('gulp-watch');
var inlineimg = require('gulp-inline-image-html');

// Chalk colors
var error = chalk.bold.red;
var success = chalk.green;
var regular = chalk.white;

gulp.task('watch', (done) => {
    gulp.watch('./src/js/**/*.js', gulp.series('build-js', 'zip', 'check'));
    gulp.watch('./src/html/**/*.html', gulp.series('build-html', 'check'));
    gulp.watch('./src/css/**/*.css', gulp.series('build-css', 'check'));
    gulp.watch('./src/assets/images/**/*', gulp.series('build-assets','check'));
    gulp.watch('./src/assets/inlineimages/**/*', gulp.series('build-html','check'));
});

gulp.task('init', (done) => {
    mkdirp('./src', function(err) {
        mkdirp('./src/js', function(err) {
            mkdirp('./src/html', function(err) {
                mkdirp('./src/css', function(err) {
                    mkdirp('./src/assets', function(err) {
                        done();
                    });
                });
            });
        });
    });
});

gulp.task('build-js', (done) => {
    return gulp.src(`./src/js/**/*`)
        .pipe(concat('game.js'))
        .pipe(minify())
        .pipe(gulp.dest('./build/'));
});

gulp.task('build-html', (done) => {
    return gulp.src('./src/html/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(inlineimg('./src/assets/inlineimages'))
        .pipe(gulp.dest('./build/'));
});

gulp.task('build-css', (done) => {
    return gulp.src('./src/css/**/*.css')
        .pipe(cssmin())
        .pipe(gulp.dest('./build/'));
});

gulp.task('build-assets', (done) => {
    return gulp.src('./src/assets/images/**/*')
        .pipe(gulp.dest('./build/'));
});

gulp.task('zip', (done) => {
    return gulp.src('./build/**/*')
        .pipe(zip('entry.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('check', gulp.series('zip', (done) => {
    var stats = fs.statSync("./dist/entry.zip");
    var fileSize = stats.size;
    if(fileSize > 13312) {
        console.log(error("Your zip compressed game is larger than 13kb!"));
        console.log(regular("Your zip compressed game is " + fileSize + " bytes"));
    } else {
        console.log(success("Your zip compressed game is " + fileSize + " bytes!"));
    }
    done();
}));

gulp.task('build', gulp.series('build-html', 'build-css', 'build-js', 'check', (done) => {
    done();
}));