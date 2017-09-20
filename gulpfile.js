const gulp = require('gulp');

/* TS/JS */
const ts = require('gulp-typescript');
const gulpDebug = require('gulp-debug');
const gulpPlumber = require('gulp-plumber');
const tslint = require('gulp-tslint');
/* Mixed */
const sourcemaps = require('gulp-sourcemaps');
const runSequence = require('run-sequence');
const watch = require('gulp-watch');
const path = require('path');

const appPath = 'api/';

const tsFiles = [
    appPath + '**/!(*.spec)+(.ts)'
];

gulp.task('scripts', function () {
    let tsProject = ts.createProject('tsconfig.json', {
        typescript: require('typescript'),
    });
    let tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .js
        .pipe(sourcemaps.write('.', {
            includeContent: true,
            sourceRoot: function (file) { return file.base; }
        }))
        .pipe(gulp.dest(''));
});

gulp.task('tslint', function () {
    // the following task transiples the ts files in project
    gulp.src(tsFiles)
        .pipe(tslint({
            formatter: "prose",
            program: require('tslint').Linter.createProgram("./tsconfig.json"),
        }))
        .pipe(tslint.report({ summarizeFailureOutput: true, }));
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
    return gulp.watch(tsFiles, function (file) {
        console.log('compiling ' + file.path + '...');
        return compileTs(file.path, true);
    });
});

function compileTs(files, watchMode) {
    let tsProject = ts.createProject('tsconfig.json', { typescript: require('typescript') });

    return gulp.src(files, { base: '.', outDir: '.' })
        .pipe(gulpPlumber())
        .pipe(tslint({
            formatter: "prose",
            program: require('tslint').Linter.createProgram("./tsconfig.json"),
        }))
        .pipe(tslint.report({ summarizeFailureOutput: true, }))
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .js
        .pipe(sourcemaps.write('.', {
            includeContent: true,
            sourceRoot: function (file) { return file.base; }
        }))
        .pipe(gulpDebug({ title: 'compiled' }))
        .pipe(gulp.dest('.'));
}
