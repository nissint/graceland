/*
 * Define all of Graceland's errors here.
 */
module.exports = (function() {
   
   var CreateError = function( str ) {
      return new Error( str );
   }

   return {
      SELF_INJECTION: CreateError( "A Factory cannot inject itself" ),
      CREATED_NOTHING: CreateError( "Factory didn not create anything" ),
      MISSING_DEPENDENCY: CreateError( "Factory is missing a dependency" ),
      ALREADY_INJECTED: CreateError( "Player has already been injected" ),
      NO_PLAYER_REGISTERED: CreateError( "No such Player has been registered." ),
      NEEDS_INJECTABLE: CreateError( "Player must define a factory, lib or value" ),
      NOT_PLAYING: CreateError( "Graceland is not playing" ),
      ALREADY_PLAYING: CreateError( "Graceland is already playing" )
   }
}());
