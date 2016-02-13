## Graceland Dependency Injection Framework
![Graceland](https://github.com/qtpeters/graceland/blob/master/wiki/images/GracelandGuitar_vectorized.png)
### Installing the library

In order to install this library you need to install dependencies with:

    npm install graceland --save-dev

### Adding Graceland to your project 

Require Graceland register a library and a factory, start Graceland and use your api:
```
var graceland = require( 'graceland' );

graceland.register({
   id: 'fs',
   lib: require( 'fs' );
});

graceland.register({
   id: 'myFactory',
   factory: function( fs ) {

      // Do something with fs 
      function _doImportantFileSystemThing() {
         ...
      }

      return {
         doFsThing: _doImportantFileSystemThing
      }
   }
});

// Start Graceland
graceland.start();

// Get your factory
var myFactory = graceland.get( 'myFactory' );

// Do important file system thing
myFactory.doFsThing();

```

### Why this is better

#### Unit Testing

Unit tests are hard enough to write, injecting libraries into your code makes mocking a lot easier.

```
var graceland = require( 'graceland' );

graceland.register({
   id: 'fs',
   lib: jasmine.createSpyObj( "mockFs", [ "readdir" ] );
});

graceland.register({
   id: 'myFactory',
   factory: require( "myFactory" )
});

describe( "Testing myFactory", function() {

   it( "Will use the injected file system library", function() {
      graceland.get( 'myFactory' ).doFsThing();
      expect( graceland.get( 'fs' ).readdir ).toHaveBeenCalled();
   });

});
```
Using Graceland, one can avoid re-defining require or doing other shifty things to test their code.  


### Running tests

To run a test suite execute:

    grunt

