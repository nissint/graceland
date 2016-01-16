
var graceland = require( './graceland.js' );
graceland.register({ 
   id: 'fpConfig', 
   value: {
      filename: '/tmp/testfile.txt'
   },
   init: function() {
      console.log( "<<runngin config function>>" );
   }
});
