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
   lib: require( 'fs' )
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
graceland.play();

// Get your factory
var myFactory = graceland.get( 'myFactory' );

// Do important file system thing
myFactory.doFsThing();

```

### Entity Registration

There are three different types of entities that can be registered with Graceland:

#### Factories 
* When registered with Graceland, Factories are used to create an instance and that instance is what is injected into to other factories. There are two optional functions one 
  can define on the instance returned by the factory:
  * init - runs before the instance creation and can be used for further runtime initialization of the factory instance.
  * destroy - runs before Graceland exits and can be used for teardown of the factory instance.
  * Example:
``` 
graceland.register({
   id: 'myFactory',

   // Inject fs and otherFactoryInstance
   factory: function( fs, otherFactoryInstance ) {

      // Do something
      function _doWork() {
         ...
      }

      return {
         doWork: _doWork,
         init: function() { // Do init },
         destroy: function() { // Do teardown } 
      }
   }
});
```
#### Libraries
* Libraries are usually third party objects like fs or http.  Graceland does nothing to these entities except pass them in. There is an optional 'prep' function you can define in the configuration object you create for the register function that will be executed before being injected.
  * Example:
```
graceland.register({
   id: 'fs',
   lib: require( 'fs' ),
   prep: function( fs ) {
      // Do Something to prep fs
      return fs;
   }
});
```
#### Values
* Values are simple strings, objects or numerical values that one my want to inject into factories for configuration.
  * Example:
```
graceland.register({
   id: 'importantValue',
   value: { 
      username: 'user', 
      password: 'pwd' 
   }
});
```

### Starting Graceland

When all the entities are registered, a call to:
```
graceland.play();
```
will start the application.

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

