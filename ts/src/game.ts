module SimpleGame{

    export class Game extends Phaser.Game{

        constructor(){
            super(512,512, Phaser.AUTO, 'content', null);

            // add states
            this.state.add('game', new State.Game_state);
            this.state.start('game');
        }
    }
}

window.onload = function(){
    var game = new SimpleGame.Game();
}