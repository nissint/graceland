
/*
 * Permission is hereby granted, free of charge, to any person obtaining a copy of 
 * this software and associated documentation files (the "Software"), to deal in the 
 * Software without restriction, including without limitation the rights to use, 
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the 
 * Software, and to permit persons to whom the Software is furnished to do so, 
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all 
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS 
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER 
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN 
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var E = require( "./errors.js" );

/*
 * Graceland is a tiny dependency injection framework developed specifically
 * to make testing easier.
 *
 * The DI container, the single instance created and exported.
 */
var Graceland = function() {

   /*
    * Everything registered with Graceland becomes a player. Players
    * can have factories, libraries or values to be injected as parameters
    * in factories.
    *
    * Factories: A factory will be called with all the parameters in it's signature 
    * injected. Graceland assumes that a factory will return an object. Immediately
    * after being created, Graceland checks to see if the instance has an init() and
    * calles it if the method exists. Similarly, when Graceland.clear() is called, a
    * destroy() method is looked for on each existance and called if found.
    *
    * Libraries: A library is used when Graceland isn't to perform any instantiation
    * or dependency injection on the object.  This is useful for when one needs to inject
    * an unmolested function, class or object into a function.  It's possible that one
    * might need to do some preparation on the library after Graceland begins playing,
    * therefore a developer can define a prep() in the configuration information when
    * registering the library that will be run on startup.
    *
    * Values: Values are simple values like strings, primatives or even objects that are 
    * set as the instance value of the Player.
    *
    */
   function Player( playerInfo ) {
      
      this.id = playerInfo.id;

      this.instance = null;
      this.factory = playerInfo.factory || null;
      this.value = playerInfo.value || null;

      var result;
      if ( _isFunction( this.factory ) ) {
         var stripCommentsReg = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
         var argNamesReg = /([^\s,]+)/g;
         var fnStr = this.factory.toString().replace( stripCommentsReg, '' ); 
         result = fnStr.slice( fnStr.indexOf('(')+1, fnStr.indexOf(')')).match( argNamesReg );
      } else if ( _isDefined( playerInfo.lib ) ) {
         this.lib = playerInfo.lib;
         if ( _isDefined( playerInfo.prep ) ) 
            this.prep = playerInfo.prep;
      }

      this.parameters = result || [];
   }

   var players = {}
   var playing = false;

   /*
    * Create the player and register it. Make sure that there isn't an instance yet
    * and that it has one of the required values: factory, lib or value.
    */
   function _register( playerInfo ) {

      var player = players[ playerInfo.id ];
      if ( player && player.instance ) {
         throw E.ALREADY_INJECTED;
      }

      if ( ! playerInfo.factory && ! playerInfo.value && ! playerInfo.lib ) {
         throw E.NEEDS_INJECTABLE;
      }
      
      var player = new Player( playerInfo );
      players[ playerInfo.id ] = player;
   }

   /*
    * Get the instance using the player id.
    */
   function _getInstanceFromId( id ) {
      var player = players[ id ];

      if ( ! player ) {
         throw E.NO_PLAYER_REGISTERED;
      }

      if ( ! playing ) {
         throw E.NOT_PLAYING;
      }

      return player.instance;
   }

   /*
    * Get the instance of a player. If there is none, then recursively create 
    * parameters until one can be returned.
    */
   function _getInstance( player ) {

      /**
       * Actions to be performed if the Player is a factory used to create
       * an instance.
       */
      if ( _isFunction( player.factory ) ) {

         var args = [];
         player.parameters.forEach( function( pId ) {
         
            var pPlayer = players[ pId ];   
            
            if ( ! pPlayer ) {
               throw E.MISSING_DEPENDENCY;
            }

            if ( pId === player.id ) {
               throw E.SELF_INJECTION;
            }

            args.push( _getInstance( pPlayer ) );
         });

         player.instance = player.factory.apply( null, args );
      
         if ( ! player.instance ) {
            throw E.CREATED_NOTHING;
         }

         if ( _isFunction( player.instance.init ) ) {
            player.instance.init();
         }

         return player.instance;

      /**
       * Actions to be performed if the Player is a third party Library
       */
      } else if ( _isDefined( player.lib ) ) {

         if ( _isFunction( player.prep ) ) {
            player.instance = player.prep( player.lib );
         } else {
            player.instance = player.lib;
         }

         return player.instance;

      /**
       * Actions to be performed if the PLayer is a basic value
       */
      } else if ( _isDefined( player.value ) ) {

         player.instance = player.value;
         return player.instance;

      } else {
         // The check in register should catch this case, but this error
         // is good for when edits remove that by accident.
         throw E.NEEDS_INJECTABLE;
      }
   }

   /*
    * Activate Graceland. This will create all the instances and do all 
    * the parameter injecting.
    */
   function _play() {
      
      if ( playing ) {
         throw E.ALREADY_PLAYING;
      }

      Object.keys( players ).forEach( function( id ) {
         var player = players[ id ];
         player.instance = _getInstance( player );
      });

      playing = true;
   }

   /* 
    * Stop Graceland and delete player instances. If the player is a user defined factory 
    * and has a destroy() method defined on the instance, then that
    * should be run.
    */
   function _stop() {
     
      Object.keys( players ).forEach( function( id ) {
         var p = players[ id ];
         if ( _isFunction( p.factory ) ) {
            if ( p.instance && _isFunction( p.instance.destroy ) ) {
               players[ id ].instance.destroy();
               delete players[ id ].instance; 
            }
         }
      })

      playing = false;
   }

   function _getPlayerIds() {
      return Object.keys( players );
   }

   /*
    * clear() Shold be run when it is necesssary to clear out the player cache.
    * stop() is called before the player info is deleted
    */
   function _clear() {
      
      _stop();

      Object.keys( players ).forEach( function( id ) {
         delete players[ id ];
      });

      players = {};
   }

   /*
    * Return true if the parameter is a function.
    */
   function _isFunction( func ) {
      return ( typeof( func ) === 'function' );
   }

   /*
    * Return true if the parameter is not undefined.
    */
   function _isDefined( value ) {
      return ( typeof( value ) !== 'undefined' );
   }

   var api = {
      register: _register,
      play: _play,
      stop: _stop,
      get: _getInstanceFromId,
      clear: _clear
   }

   return api;
}

module.exports = new Graceland()
