// Require all the things
const gulp = require('gulp'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    minifyCSS = require('gulp-minify-css'),
    prefixer = require('gulp-autoprefixer'),
    connect = require('gulp-connect'),
    sourcemaps = require('gulp-sourcemaps'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    del = require('del'),
    cp = require('child_process');

// Set the boring path variables
const base_path = './',
    src = base_path + '_dev',
    dist = base_path + 'dist',
    paths = {
        js: src + '/js/*.js',
        scssWatch: [src + '/sass/*.scss',
            src + '/sass/**/* .scss',
            src + '/sass/**/**/*.scss'],
        scssGenerate: src + '/sass/app.scss',
        jekyll: ['index.html', '_posts/*', '_layouts/*', '_includes/*', 'dist/*', 'dist/**/*']
    };


// Compile sass to css
gulp.task('compile-sass', () => {
    return gulp.src(paths.scssGenerate)
        .pipe(plumber((error) => {
            gutil.log(gutil.colors.red(error.message));
            gulp.task('compile-sass').emit('end');
        }))
        .pipe(concat('app.css'))
        .pipe(sass())
        .pipe(prefixer('last 3 versions', 'ie 9'))
        .pipe(minifyCSS())
        .pipe(rename({ dirname: dist + '/css' }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./'));
});

// Compile js
gulp.task('compile-js', () => {
    return gulp.src(paths.js)
        .pipe(plumber((error) => {
            gutil.log(gutil.colors.red(error.message));
            gulp.task('compile-js').emit('end');
        }))
        .pipe(concat('app.js'))
        .pipe(jshint())
        .pipe(uglify())
        .pipe(rename({ dirname: dist + '/js' }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./'));
});

// Rebuild Jekyll 
gulp.task('build-jekyll', (code) => {
    return cp.spawn('C:\\Ruby23\\bin\\jekyll.bat', ['serve'], { stdio: 'inherit' })
        .on('error', (error) => gutil.log(gutil.colors.red(error.message)))
        .on('close', code)
})

// Build a super cool server
gulp.task('server', () => {
    connect.server({
        root: ['_site'],
        port: 4000
    });
})

// Watch files for new pretty things
gulp.task('watch', () => {
    gulp.watch(paths.scssWatch, ['compile-sass']);
    gulp.watch(paths.js, ['compile-js']);
    gulp.watch(paths.jekyll, ['build-jekyll']);
});

// Clean up the crumbs
gulp.task('clean', function () {
    return del(['dist/', '_site']);
});

// Start everything with the default task
gulp.task('default', ['compile-sass', 'compile-js', 'build-jekyll', 'server', 'watch']);