
var graceland = require( './graceland.js' );

var FileReaderFactory = function( fpConfig ) {
   
   var fs = require( 'fs' );
   var text;

   function _init() {
      text = filereader.read( config.filename );
   }

   function _read( fileName, success ) {
      fs.readFile( fileName, function( err, data ) {
         if ( err ) {
            throw new Error( "Error accessing file (" + fileName + "): " + err  );
         }
         success( data );  
      });
   }

   return {
      read: _read
   }
}

graceland.register({ 
   id: 'filereader', 
   factory: FileReaderFactory 
});
