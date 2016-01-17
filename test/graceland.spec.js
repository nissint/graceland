var graceland = require( "../src/graceland.js" );

var config = {
   filename: '/tmp/testfile.txt',
   somefunction: function() {
      console.log( "<<a functon>>" );
   }
}

var FileParser = function( filereader, fpConfig ) {
   
   var text;

   function _init() {
      filereader.read( fpConfig.filename, function( inText ) {
         text = inText;
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

var FileReader = function( fpConfig ) {

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

graceland.play();

describe( "Testing Graceland depencency injection", function() {
   
   beforeEach( function() {
      graceland.clear();
   });

   it ( "has a way to access player instances", function() {
 
      graceland.register({
         id: 'filereader',
         factory: FileReader
      });

      graceland.register({
         id: 'fileparser',
         factory: FileParser
      });

      graceland.register({
         id: 'fpConfig',
         value: config,
         init: function() {
            console.log( "Preparing some stuff" );
         }
      });

      graceland.play();
      var c = graceland.get( 'fpConfig' );
      expect( c ).toBe( config );
   });

   it ( "makes unit testable code", function() {
   
      var identifiableText = "SPECIAL TEXT";

      var mockRead = jasmine.createSpy( 'read' );
      mockRead.and.callFake( function( fileName, success ) {
         expect( fileName ).toBe( config.filename );
         success( identifiableText );
      });

      var mockFactory = jasmine.createSpy( 'filereader' );
      mockFactory.and.callFake( function() {
          return {
            read: mockRead
          }
      });

      graceland.register({
         id: 'filereader',
         factory: mockFactory
      });

      graceland.register({
         id: 'fpConfig',
         value: config,
         init: function() {
            console.log( "Preparing some stuff" );
         }
      });

      graceland.register({
         id: 'fileparser',
         factory: FileParser
      });

      graceland.play();

      var fp = graceland.get( 'fileparser' );
      expect( fp.getText() ).toBe( identifiableText );
   });

   it ( "can inject third party libraries easily", function() {

      var fs = require( 'fs' );
      graceland.register({
         id: 'file_system',
         lib: fs,
         prep: function( fs ) {
            return fs;
         }
      });

      graceland.register({
         id: 'fpConfig',
         value: config,
         init: function() {
            console.log( "Preparing some stuff" );
         }
      });

      graceland.register({
         id: 'wtf',
         factory: function( fpConfig, file_system ) {
         
            expect( fpConfig ).toBeDefined();
            expect( fpConfig ).toBe( config ) ;
            expect( file_system ).toBeDefined();
            expect( file_system ).toBe( fs );

            return {};
         }
      });

      graceland.play();
   });
});
