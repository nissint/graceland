

module.exports = function( grunt ) {
   grunt.initConfig({
         jasmine_nodejs: {
            options: {
               specNameSuffix: 'spec.js',
               useHelpers: false,
               stopOnFailure: true,
               repoters: {
                  colors: true,
                  cleanStack: true,
                  verbosity: 4,
                  listStyle: 'indent',
                  activity: false
               }
            },
            graceland: {
               specs: [
                  'test/*.spec.js'
               ],
            }
         }
   });

   grunt.loadNpmTasks( 'grunt-jasmine-nodejs' );
   grunt.registerTask( 'default', [ 'jasmine_nodejs' ]);
}
