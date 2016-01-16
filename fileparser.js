
var graceland = require( './graceland.js' );

var FileParserFactory = function( filereader, fpConfig ) {
   
   var text;

   function _init() {
      text = filereader.read( config.filename );
   }

   function _getText() {
      return text;
   }

   return {
      init: _init,
      getText: _getText
   }
}

graceland.register({ 
   id: 'fileParser', 
   factory: FileParserFactory 
});
