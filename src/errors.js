/*
 * Define all of Graceland's errors here.
 */
module.exports = (function() {
   
   var CreateError = function( str ) {
      return new Error( str );
   }

   return {
		NO_ID: CreateError( "A player must have an ID" ),
      SELF_INJECTION: CreateError( "A Factory cannot inject itself" ),
      CREATED_NOTHING: CreateError( "Factory did not create anything" ),
      MISSING_DEPENDENCY: CreateError( "Factory is missing a dependency" ),
      NO_SUCH_PLAYER: CreateError( "No such Player has been registered." ),
      NEEDS_INJECTABLE: CreateError( "Player must define a factory, lib or value" ),
      NOT_PLAYING: CreateError( "Graceland is not playing" ),
      ALREADY_PLAYING: CreateError( "Graceland is already playing" ),
		NO_PLAYERS: CreateError( "Graceland cannot play without players" )
   }
}());
