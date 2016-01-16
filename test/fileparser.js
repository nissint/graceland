
var graceland = require( './graceland.js' );

var FileParserFactory = function( filereader, fpConfig ) {
   
   var text;

   function _init() {
      filereader.read( fpConfig.filename, function( text ) {
         console.log( "TEXT: " + text );
      });
   }

   function _getText() {
      return text;
   }

   return {
      getText: _getText,
      init: _init
   }
}

graceland.register({ 
   id: 'fileParser', 
   factory: FileParserFactory
});
