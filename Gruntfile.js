module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    jade: {
      compile: {
        options: {
          pretty: true,
        },
        files: {
          'public/build/login.html': 'public/views/login.jade',
          'public/build/dash.html' : 'public/views/dash.jade',
          'public/build/root.html' : 'public/views/root.jade',
          'public/build/repo-select.html' : 'public/views/repo-select.jade',
          'public/build/dash-child.html' : 'public/views/dash-child.jade'
        }
      }
    },
    watch: {
      grunt: { files: ['Gruntfile.js'] },
      jade: {
        files: 'public/views/*.jade',
        tasks: ['jade']
      }
  }
  })


  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jade','watch']);
}
