

var Graceland = function() {

   var Player = function( playerInfo ) {
      this.started = false;
      this.instance = null;
      this.init = playerInfo.init || null;
      this.factory = playerInfo.factory || null;
      this.value = playerInfo.value || null;

      var result;
      if ( typeof( this.factory) === 'function' ) {
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

      if ( ! playerInfo.factory && ! playerInfo.value ) {
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
      if ( player.factory ) {
         var args = [];
         player.parameters.forEach( function( pId ) {
            var pPlayer = players[ pId ];   
            
            if ( ! pPlayer ) {
               console.log( Object.keys( players ) );
               throw new Error( "Missing dependency: " + pId );
            }

            args.push( _getInstance( pPlayer ) );
         });

         player.instance = player.factory.apply( null, args );

         if ( player.instance.init ) {
            player.instance.init();
         }

         player.instance
         return player.instance;
      } else {
         player.instance = player.value;
         return player.instance;
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

   function _clear() {
      Object.keys( players ).forEach( function( id ) {
         var p = players[ id ];
         if ( p.instance && ( p.instance.destroy === 'function' ) ) {
            console.log( "RIGHT HERE: " + players[ id ].instance.destroy );
            players[ id ].instance.destroy();
         }

         delete players[ id ];
      });

      players = {};
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
