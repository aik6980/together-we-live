module Objects{

    export class Player extends Phaser.Sprite{

        constructor(game : Phaser.Game, x: number, y: number){
            //super(game, x, y, game.cache.getBitmapData('unit_white'));
            super(game, x, y, 'ship');

            this.anchor.set(0.5);
        }

        update(){

        }
    }
}