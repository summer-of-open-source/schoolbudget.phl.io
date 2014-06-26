/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    nodestatic: {
      server: {
        options: {
          port: 8080,
          keepalive: true
        }
      }
    }
  });

  // Default task.
  grunt.loadNpmTasks('grunt-nodestatic');
  grunt.registerTask('default', ['nodestatic']);

};