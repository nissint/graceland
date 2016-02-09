/*
 * Define all of Graceland's errors here.
 */
module.exports = (function() {
   
   var CreateError = function( str ) {
      return new Error( str );
   }

   return {

      NO_ID: function( info ) {
         CreateError( "A player must have an ID" );
      },

      SELF_INJECTION: function( info ) {
         CreateError( "Factory (" + info.id  + ") is trying inject itself, this is not allowed" );
      },

      CREATED_NOTHING: function( info ) {
         CreateError( "Factory (" + info.id  + ") did not create anything. Factories must create something." );
      },

      MISSING_DEPENDENCY: function( info ) {
         CreateError( "Factory (" + info.playerId  + ") is missing a dependency (" + info.paramId  + ")" );
      },

      NO_SUCH_PLAYER: function( info ) { 
         CreateError( "No such Player(" + info.id + ") has been registered." );
      },

      NEEDS_INJECTABLE: function( info ) { 
         CreateError( "Player " + info.id + " must define a factory, lib or value" );
      },

      NOT_PLAYING: function( info ) {
         CreateError( "Graceland is not playing" );
      },

      ALREADY_PLAYING: function( info ) { 
         CreateError( "Graceland is already playing" );
      },

      NO_PLAYERS: function( info ) {
         CreateError( "Graceland cannot play without players" );
      }
   }
}());
