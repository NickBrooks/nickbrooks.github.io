// Require all the things
const gulp = require('gulp'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    minifyCSS = require('gulp-minify-css'),
    prefixer = require('gulp-autoprefixer'),
    connect = require('gulp-connect'),
    del = require('del'),
    cp = require('child_process');

// Set the boring path variables
const base_path = './',
    src = base_path + '_dev',
    dist = base_path + 'dist',
    paths = {
        js: src + '/js/*.js',
        scss: [src + '/sass/*.scss',
            src + '/sass/**/* .scss',
            src + '/sass/**/**/*.scss'],
        jekyll: ['index.html', '_posts/*', '_layouts/*', '_includes/*', 'dist/*', 'dist/**/*']
    };


// Compile sass to css
gulp.task('compile-sass', () => {
    return gulp.src(paths.scss)
        .pipe(plumber((error) => {
            gutil.log(gutil.colors.red(error.message));
            gulp.task('compile-sass').emit('end');
        }))
        .pipe(sass())
        .pipe(prefixer('last 3 versions', 'ie 9'))
        .pipe(minifyCSS())
        .pipe(rename({ dirname: dist + '/css' }))
        .pipe(gulp.dest('./'));
});

// Rebuild Jekyll 
gulp.task('build-jekyll', (code) => {
    return cp.spawn('C:\\Ruby23\\bin\\jekyll.bat', ['serve', '--incremental'], { stdio: 'inherit' })
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
    gulp.watch(paths.scss, ['compile-sass']);
    gulp.watch(paths.jekyll, ['build-jekyll']);
});

// Clean up the crumbs
gulp.task('clean', function () {
    return del(['dist/', '_site']);
});

// Start everything with the default task
gulp.task('default', ['clean', 'compile-sass', 'build-jekyll', 'server', 'watch']);