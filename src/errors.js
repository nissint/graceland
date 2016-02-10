/*
 * Define all of Graceland's errors here.
 */
module.exports = (function() {
   
   var CreateError = function( str ) {
      return new Error( str );
   }

   return {

      NO_ID: function( info ) {
         return CreateError( "A player must have an ID" );
      },

      SELF_INJECTION: function( info ) {
         return CreateError( "Factory (" + info.id  + ") is trying inject itself, this is not allowed" );
      },

      CREATED_NOTHING: function( info ) {
         return CreateError( "Factory (" + info.id  + ") did not create anything. Factories must create something." );
      },

      MISSING_DEPENDENCY: function( info ) {
         return CreateError( "Factory (" + info.playerId  + ") is missing a dependency (" + info.paramId  + ")" );
      },

      NO_SUCH_PLAYER: function( info ) { 
         return CreateError( "No such Player(" + info.id + ") has been registered." );
      },

      NEEDS_INJECTABLE: function( info ) { 
         return CreateError( "Player " + info.id + " must define a factory, lib or value" );
      },

      NOT_PLAYING: function( info ) {
         return CreateError( "Graceland is not playing" );
      },

      ALREADY_PLAYING: function( info ) { 
         return CreateError( "Graceland is already playing" );
      },

      NO_PLAYERS: function( info ) {
         return CreateError( "Graceland cannot play without players" );
      }
   }
}());
