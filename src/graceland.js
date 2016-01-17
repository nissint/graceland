

var Graceland = function() {

   function Player( playerInfo ) {
      
      this.id = playerInfo.id;

      this.instance = null;
      this.prep = playerInfo.prep || null;
      this.factory = playerInfo.factory || null;
      this.value = playerInfo.value || null;
      this.lib = playerInfo.lib || null;

      var result;
      if ( _isFunction( this.factory ) ) {
         var stripCommentsReg = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
         var argNamesReg = /([^\s,]+)/g;
         var fnStr = this.factory.toString().replace( stripCommentsReg, '' ); 
         result = fnStr.slice( fnStr.indexOf('(')+1, fnStr.indexOf(')')).match( argNamesReg );
      }

      this.parameters = result || [];
   }

   var players = {}
   var playing = false;

   function _register( playerInfo ) {

      var player = players[ playerInfo.id ];
      if ( player && player.instance ) {
         throw new Error( "Player with id (" + playerInfo.id + ") has already been injected" + playerInfo.id )
      }

      if ( ! playerInfo.factory && ! playerInfo.value && ! playerInfo.lib ) {
         throw new Error( "No value or factory exists in Player: " + playerInfo.id );
      }
      
      var player = new Player( playerInfo );
      players[ playerInfo.id ] = player;
   }

   function _getInstanceFromId( id ) {
      var player = players[ id ];

      if ( ! player ) {
         throw new Error( "No Player with id: (" + id + ") has been registered." );
      }

      if ( ! playing ) {
         throw new Error( "Graceland isn't playing, graceland.play() first." );
      }

      return player.instance;
   }

   function _getInstance( player ) {

      /**
       * Actions to be performed if the PLayer is a factory used to create
       * an instance.
       */
      if ( _isFunction( player.factory ) ) {

         var args = [];
         player.parameters.forEach( function( pId ) {
         
            var pPlayer = players[ pId ];   
            
            if ( ! pPlayer ) {
               throw new Error( "Missing dependency: " + pId );
            }

            args.push( _getInstance( pPlayer ) );
         });

         player.instance = player.factory.apply( null, args );
      
         if ( ! player.instance ) {
            throw new Error( "Factory (" + player.id + ") didn't create anything." );
         }

         if ( _isFunction( player.instance.init ) ) {
            player.instance.init();
         }

         return player.instance;

      /**
       * Actions to be performed if the Player is a third party Library
       */
      } else if ( player.lib ) {

         if ( _isFunction( player.prep ) ) {
            player.instance = player.prep( player.lib );
         } else {
            player.instance = player.lib;
         }

         return player.instance;

      /**
       * Actions to be performed if the PLayer is a basic value
       */
      } else if ( player.value ) {

         player.instance = player.value;
         return player.instance;

      } else {
         // The check in register should catch this case, but this error
         // is good for when edits remove that by accident.
         throw new Error( "No factory, library or value found." );
      }
   }

   function _play() {
      
      Object.keys( players ).forEach( function( id ) {
         var player = players[ id ];
         player.instance = _getInstance( player );
      });

      playing = true;
   }

   function _getPlayerIds() {
      return Object.keys( players );
   }

   /**
    * clear() Shold be run when it is necesssary to clear out 
    * the cache of players. If the player is a user defined factory 
    * and has a destroy() method defined on the instance, then that
    * should be run before deletion.
    */
   function _clear() {
      Object.keys( players ).forEach( function( id ) {
         var p = players[ id ];
         if ( _isFunction( p.factory ) ) {
            if ( p.instance && _isFunction( p.instance.destroy ) ) {
               players[ id ].instance.destroy();
            }
         }

         delete players[ id ];
      });

      players = {};
   }

   /*
    * Helper section, consider moving to helpers.js file
    */

   function _isFunction( func ) {
      return ( typeof( func ) === 'function' );
   }

   return {
      register: _register,
      play: _play,
      get: _getInstanceFromId,
      getPlayerIds: _getPlayerIds,
      clear: _clear
   }
}

module.exports = new Graceland()
