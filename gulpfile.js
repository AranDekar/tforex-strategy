const gulp = require('gulp');

/* TS/JS */
const ts = require('gulp-typescript');
//const babel = require('gulp-babel');
const tsconfig = require('tsconfig');
const project = tsconfig.loadSync('tsconfig.json');
const gulpDebug = require('gulp-debug');
const gulpFilter = require('gulp-filter');
const gulpPlumber = require('gulp-plumber');
const tslint = require('gulp-tslint');

/* Mixed */
const ext_replace = require('gulp-ext-replace');
const sourcemaps = require('gulp-sourcemaps');
const runSequence = require('run-sequence');
const watch = require('gulp-watch');
const path = require('path');

const appPath = 'api/';

const tsFiles = [
    appPath + '**/!(*.spec)+(.ts)'
];

gulp.task('scripts', function () {
    let tsProject = ts.createProject('tsconfig.json', { typescript: require('typescript') });
    let res = gulp.src(project.files, { base: '.', outDir: appPath })
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
        .js
        .pipe(sourcemaps.write('.', {
            includeContent: true,
            sourceRoot: function (file) { return file.cwd; }
        }))
        .pipe(gulp.dest(''));
});

gulp.task('tslint', function () {
    // the following task transiples the ts files in project
    gulp.src(tsFiles)
        .pipe(tslint({ formatter: "prose" }))
        .pipe(tslint.report('prose', { summarizeFailureOutput: true, }));
});

gulp.task('deploy', function () {
});

gulp.task('build', function (done) {
    //runSequence('scripts', done);
    runSequence('tslint', 'scripts', done);
});

gulp.task('default', function (done) {
    runSequence(['build'], done);
});

gulp.task('watch-ts', function () {
    let tsProject = ts.createProject('tsconfig.json', { typescript: require('typescript') });

    return tsProject.src()
        .pipe(watch(project.files))
        .pipe(gulpFilter((file) => { file.base = '.'; return file.event === 'change'; }))
        .pipe(gulpPlumber())
        .pipe(gulpDebug({ title: 'changed' }))
        .pipe(tslint())
        .pipe(tslint.report('prose', {
            summarizeFailureOutput: true,
            emitError: false
        }))
        .pipe(sourcemaps.init())
        .pipe(gulpDebug({ title: 'a' }))
        .pipe(ts(tsProject))
        //.js
        .pipe(gulpDebug({ title: 'b' }))
        //    .pipe(babel({ presets: ['es2015'] }))
        .pipe(gulpDebug({ title: 'compiled' }))
        .pipe(sourcemaps.write('.', { includeContent: true }))
        .pipe(gulp.dest('.'));
});
