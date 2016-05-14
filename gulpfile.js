/**
 * * * * * * * * *
 * TASKS GRAPH
 * * * * * * * * *
 * clean        => cleanRelease => cleanDistAll => cleanExtNodeModules
 * cleanAll     => cleanRelease => cleanDistAll => cleanExtNodeModules => cleanRootNodeModules
 * build        => cleanDistSrcOnly => installExtNpmDependencies
 * makeArchive  => build
 * package      => clean => makeArchive
 *
 * * * * * * * * *
 * COMMANDS
 * * * * * * * * *
 * gulp clean
 * gulp build [--debug, --release]
 * gulp package [--debug, --release]
 */

/**
 * Required node module for running gulp tasks
 */
var fs = require('fs');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var util = require('gulp-util');
var exec = require('child_process').exec;
var options = require('./modules/gulp-options');

/**
 * Global folder variable
 */
var ROOT_FOLDER = __dirname;
var HOOK_FOLDER = ROOT_FOLDER + '/hook/';
var EXT_FOLDER = HOOK_FOLDER + '/extension/';
var DIST_FOLDER = ROOT_FOLDER + '/dist/';
var PACKAGE_FOLDER = ROOT_FOLDER + '/package/';

/**
 * Global folder variable
 */
var EXT_SCRIPTS = [
    'hook/extension/config/env.js',
    'hook/extension/modules/*.js',
    'hook/extension/node_modules/chart.js/Chart.min.js',
    'hook/extension/node_modules/fiber/src/fiber.min.js',
    'hook/extension/node_modules/fancybox/dist/js/jquery.fancybox.pack.js',
    'hook/extension/modules/*.js',
    'hook/extension/js/**/*.js'
];

var EXT_STYLESHEETS = [
    'hook/extension/node_modules/fancybox/dist/css/jquery.fancybox.css',
    'hook/extension/css/extendedData.css'
];

var EXT_RESSOURCES = [
    'hook/extension/manifest.json',
    'hook/extension/icons/*',
    'hook/extension/node_modules/fancybox/dist/img/*.*',
];

var OPT_FILES = [
    'hook/extension/node_modules/angular-material/angular-material.css',
    'hook/extension/node_modules/angular-material-icons/angular-material-icons.css',
    'hook/extension/node_modules/angular/angular.js',
    'hook/extension/node_modules/angular-route/angular-route.js',
    'hook/extension/node_modules/angular-sanitize/angular-sanitize.js',
    'hook/extension/node_modules/angular-animate/angular-animate.js',
    'hook/extension/node_modules/angular-aria/angular-aria.js',
    'hook/extension/node_modules/angular-messages/angular-messages.js',
    'hook/extension/node_modules/angular-material/angular-material.js',
    'hook/extension/node_modules/angular-material-icons/angular-material-icons.js',
    'hook/extension/node_modules/underscore/underscore-min.js'
];

/**
 * Detect DEBUG & REALEASE MODES
 */
var REALEASE_MODE = (options.has('release')) ? true : false;

var DEBUG_MODE = !REALEASE_MODE;

if (REALEASE_MODE) {
    util.log('RELEASE MODE ENABLED.');
}
if (DEBUG_MODE) {
    util.log('DEBUG MODE ENABLED.');
}

/**
 * Gulp Tasks
 */
gulp.task('build', ['cleanDistSrcOnly', 'installExtNpmDependencies'], function() {

    util.log('Start extension core and options files copy');

    /**
     * Extension core
     */
    gulp.src(EXT_SCRIPTS, {
            base: 'hook/extension'
        })
        // .pipe(plugins.if(REALEASE_MODE, plugins.concat('script.js'))) // Concat if release
        // .pipe(plugins.if(REALEASE_MODE, gulp.dest(DIST_FOLDER + '/js/'), gulp.dest(DIST_FOLDER)));
        .pipe(gulp.dest(DIST_FOLDER));

    gulp.src(EXT_STYLESHEETS, {
            base: 'hook/extension'
        })
        .pipe(gulp.dest(DIST_FOLDER));


    gulp.src(EXT_RESSOURCES, {
            base: 'hook/extension'
        })
        .pipe(gulp.dest(DIST_FOLDER));

    /**
     * Options JS and Css Mixed
     */

    gulp.src(OPT_FILES, {
        base: 'hook/extension'
    }).pipe(gulp.dest(DIST_FOLDER));

    return gulp.src("hook/extension/options/**/*.*", {
            base: 'hook/extension'
        })
        .pipe(gulp.dest(DIST_FOLDER));

});

/**
 * Init task
 */
gulp.task('installExtNpmDependencies', function(initDone) {

    util.log('Installing extension NPM dependencies');

    // Switch to ./hook/extension folder
    process.chdir(EXT_FOLDER);

    exec('npm install', function(error, stdout, stderr) {

        if (error) {
            util.log(error);
            util.log(stderr);
        } else {
            if (stdout) {
                util.log(stdout);
                util.log('Install done.');
            } else {
                util.log('Nothing to install');
            }

            util.log('Use generated "dist/" folder as chrome unpacked extension folder. You will have to execute "gulp build" command before. Helper: "gulp watch" command will automatically trigger "gulp build" command on a file change event.');

            // Switch back to ./hook/extension/../.. aka "root" folder
            process.chdir(ROOT_FOLDER);
            initDone();
        }
    });
});

/**
 * Archiving
 */
gulp.task('makeArchive', ['build'], function() {

    util.log('Now creating package archive');

    var generateReleaseName = function(manifestFile) {
        var manifestData = JSON.parse(fs.readFileSync(manifestFile).toString());
        var d = new Date();
        return 'StravistiX_v' + manifestData.version + '_' + d.toDateString().split(' ').join('_') + '_' + d.toLocaleTimeString().split(':').join('_') + '.zip';
    };

    var buildName = generateReleaseName(DIST_FOLDER + '/manifest.json');

    return gulp.src(DIST_FOLDER + '/**')
        .pipe(plugins.zip(buildName))
        .pipe(gulp.dest(PACKAGE_FOLDER));

});


/**
 * Cleaning task
 */

gulp.task('cleanDistSrcOnly', function() {

    util.log('Cleaning dist/ folder, except dist/node_modules folder');
    return gulp.src([
            DIST_FOLDER + '/*',
            '!' + DIST_FOLDER + '/node_modules/',
        ])
        .pipe(plugins.clean({
            force: true
        }));
});

gulp.task('cleanDistAll', function() {

    util.log('Cleaning dist/ folder completly');
    return gulp.src(DIST_FOLDER)
        .pipe(plugins.clean({
            force: true
        }));
});

gulp.task('cleanRelease', function() {

    util.log('Cleaning package/ folder');
    return gulp.src(PACKAGE_FOLDER)
        .pipe(plugins.clean({
            force: true
        }));
});

gulp.task('cleanExtNodeModules', ['cleanDistAll'], function() {

    util.log('Cleaning extension node_modules/ folder');

    return gulp.src('hook/extension/node_modules/')
        .pipe(plugins.clean({
            force: true
        }));
});

gulp.task('cleanRootNodeModules', ['cleanDistAll'], function() {

    util.log('Cleaning root extension node_modules/ folder');

    return gulp.src('node_modules/')
        .pipe(plugins.clean({
            force: true
        }));
});

/**
 * Defining tasks
 */
// Do init install and build to dist/
gulp.task('default', ['build']);

// Result in a zip file into builds/
gulp.task('package', ['clean', 'makeArchive']);

gulp.task('watch', function() {
    gulp.watch('hook/extension/**/*', ['build']);
});

// Clean dist/, package/, hook/extension/node_modules/
gulp.task('clean', ['cleanRelease', 'cleanDistAll', 'cleanExtNodeModules']);

gulp.task('cleanAll', ['clean', 'cleanRootNodeModules']);
