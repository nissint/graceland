

var Graceland = function() {

   var Player = function( playerInfo ) {
      this.started = false;
      this.instance = null;
      this.init = playerInfo.init || null;
      this.factory = playerInfo.factory || null;
      this.value = playerInfo.value || null;

      if ( this.factory ) {
         var stripCommentsReg = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
         var argNamesReg = /([^\s,]+)/g;
         var fnStr = this.factory.toString().replace( stripCommentsReg, '' ); 
         var result = fnStr.slice( fnStr.indexOf('(')+1, fnStr.indexOf(')')).match( argNamesReg );
         this.parameters = result || [];
      }
   }

   var players = {}

   function _register( playerInfo ) {

      if ( players[ playerInfo.id ] ) {
         throw new Error( "Player already registered with id: " + playerInfo.id )
      }

      if ( ! playerInfo.factory && ! playerInfo.value ) {
         throw new Error( "No value or factory exists in Player: " + playerInfo.id );
      }
      
      var player = new Player( playerInfo );
      console.log( "ID: " + playerInfo.id + ", PLAYER: " + player );
      players[ playerInfo.id ] = player;
      console.log( playerInfo.id + " is registered with Graceland" );
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
         return player.instance;
      } else {
         player.instance = player.value;
         return player.instance;
      }
   }

   function _play() {
      Object.keys( players ).forEach( function( id ) {
         console.log( "Attempting to tune " + id  );
         var player = players[ id ];
         player.instance = _getInstance( player );
      });
   }

   return {
      register: _register,
      play: _play
   }
}

module.exports = new Graceland()
