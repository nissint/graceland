var graceland = require( "../src/graceland.js" );
var E = require( "../src/errors.js" );

var config = {
   filename: '/tmp/testfile.txt'
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

describe( "Testing Graceland depencency injection", function() {
   
   beforeEach( function() {
      graceland.clear();
   });

   it ( "has a way to access player instances", function() {
 
      graceland.register({
         id: 'fpConfig',
         value: config
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
         value: config
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
         value: config
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

   it ( "runs the init function of a defined factory when the framework is started", function() {
      
      var init = jasmine.createSpy( 'mockInit' );

      var TestFactory = function() {
         return {
            init: init
         }
      }

      graceland.register({
         id: 'testId',
         factory: TestFactory
      });
      
      graceland.play();

      expect( init ).toHaveBeenCalled();
   });
   
   it ( "runs the destroy function of a defined factory when the framework is stopped", function() {
      
      var destroy = jasmine.createSpy( 'mockDestroy' );

      var TestFactory = function() {
         return {
            destroy: destroy
         }
      }

      graceland.register({
         id: 'testId',
         factory: TestFactory
      });
      
      graceland.play();
      graceland.stop();

      expect( destroy ).toHaveBeenCalled();
   });

   it ( "runs the prep function of a defined library when the framework is started", function() {
      
      var MockLibrary = jasmine.createSpy();
      var prep = jasmine.createSpy( 'mockPrep' );
      prep.and.callFake( function( mockLib ) {
         expect( mockLib ).toBe( MockLibrary );
      });

      graceland.register({
         id: 'testId',
         lib: MockLibrary,
         prep: prep
      });
      
      graceland.play();

      expect( prep ).toHaveBeenCalled();
   });
});


describe( "Testing Graceland error conditions", function() {
	   
   beforeEach( function() {
      graceland.clear();
   });

   it ( "throws an exception when a factory depends on itself ", function() {
      
      var BrokenFactory = function( bFactory ) {
         console.log( "HERE" ); 
         return {}
      }

      graceland.register({
         id: 'bFactory',
         factory: BrokenFactory
      });

      try {
         graceland.play();
      } catch( err ) {
         expect( err ).toBe( E.SELF_INJECTION({ id: 'bFactory' }) );
      }
   });


	it( "throws an exception when started twice", function() {

		graceland.register({
			id: 'testId',
			value: "WHATEVER"
		});

		graceland.play();

		try {
			graceland.play();
		} catch( err ) {
         expect( err ).toBe( E.ALREADY_PLAYING() ); 
		}
	});

	it ( "throws an exception when attempting to get a player instance while not playing", function() {

		var id = 'tf';
		
		var TestFactory = function() {
			return {}
		}

		graceland.register({
			id: id,
			factory: TestFactory
		});

		try {
			graceland.get( id );
		} catch( err ) {
         expect( err ).toBe( E.NOT_PLAYING() );
		}
	});

	it ( "throws an exception when a factory creates nothing", function() {
		
		var id = 'nf';
		
		var NotFactory = function() {}
		graceland.register({
			id: id,
			factory: NotFactory
		});

		try {
			graceland.play();
		} catch( err ) {
         expect( err ).toBe( E.CREATED_NOTHING({ id: id }) );
		}
	});

	it ( "throws an exception when a factory is missing a dependency", function() {
		
		var id = 'testId';
		
		var TestFactory = function( myMissingDep ) {
			return {}
		}

		graceland.register({
         id: id,
			factory: TestFactory
		});

		try {
			graceland.play();
		} catch( err ) {
         expect( err ).toBe( E.MISSING_DEPENDENCY({ playerId: id, paramId: 'myMissingDep' }) );
		}
	});

	it ( "throws an exception when trying to register a player while playing", function() {
	
		var TestFactory = function() {
			return {}
		}

		var TooLateTestFactory = function() {
			return {}
		}

		graceland.register({
			id: 'tf',
			factory: TestFactory
		});

		graceland.play();

		try {
			graceland.register({
				id: 'tlf',
				factory: TooLateTestFactory
			});
		} catch( err ) {
         expect( err ).toBe( E.ALREADY_PLAYING() );
		}
	});

	it ( "throws an exception if a player has no injectable defined", function() {
		
      var id = 'testId';

		try {
			graceland.register({
				id: id
			});
		} catch( err ) {
         expect( err ).toBe( E.NEEDS_INJECTABLE({ id:id }) );
		}
	});

	it ( "throws an exception if a player has no id defined", function() {
		
		try {
			graceland.register({});
		} catch( err ) {
         expect( err ).toBe( E.NO_ID() );
		}
	});

	it ( "throws an exception when attempting to access an undefined player", function() {

      var id = 'testId';

		graceland.register({
			id: id,
			value: "WHATEVER"
		});

		graceland.play();

		try {
			graceland.get( 'someNonRegisteredPlayer' );
		} catch( err ) {
         expect( err ).toBe( E.NO_SUCH_PLAYER({ id:id }) );
		}
	});
});
