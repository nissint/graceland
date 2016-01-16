
var graceland = require( './graceland.js' );

var FileReaderFactory = function( fpConfig ) {
   
   var text;

   function _init() {
      text = filereader.read( config.filename );
   }

   function _read() {
      return text;
   }

   return {
      read: _read
   }
}

graceland.register({ 
   id: 'filereader', 
   factory: FileReaderFactory 
});
