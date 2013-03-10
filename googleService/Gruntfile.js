module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        preprocess: {
            js: {
                src: 'ui.js',
                dest: 'deploy/tmp/ui.deploy.js',

            },
            html: {
                src: 'ui.html',
                dest: 'deploy/tmp/deploy.html',
            },
            multifile: {
                files: {
                    'deploy/backend.gs': 'backend.gs.js',
                }
            },
        },
        "html-prettyprinter": {
            single: {
                src: 'deploy/tmp/deploy.html',
                dest: 'deploy/ui.html'
            }
        }
    });

    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-html-prettyprinter');

    // Default task(s).
    grunt.registerTask('default', ['preprocess', 'html-prettyprinter']);

};