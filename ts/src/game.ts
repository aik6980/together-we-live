module SimpleGame{

    export class Game extends Phaser.Game{

        constructor(){
            super(512,512, Phaser.WEBGL, 'theGame', null);

            // add states
            this.state.add('menu', new State.Menu_state);
            this.state.add('game', new State.Game_state);
            this.state.start('menu');
        }
    }
}

// the game
var google_font_active = false;

var global_music_volume = 0.3;
var global_sfx_volume = 0.5

var game;
// The Google WebFont Loader will look for this object, so create it before loading the script.
var WebFontConfig = {

    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    active: function() {
        //console.log(game); 
        game.time.events.add(Phaser.Timer.SECOND, function(){ google_font_active = true; }, this); 
    },

    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
      families: ['Press Start 2P']
    }

};

window.onload = function(){
    game = new SimpleGame.Game();
}