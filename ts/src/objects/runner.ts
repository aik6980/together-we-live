//The runner is the player that goes and collect

module Objects{

    export class Runner extends Phaser.Sprite{
        speed: number = 100;

        constructor(game : Phaser.Game, x: number, y: number, speed: number){
            super(game, x, y, game.cache.getBitmapData('unit_white'));
            //super(game, x, y, 'ship');
            this.tint = Phaser.Color.getColor(100,50,0);
            //this.anchor.set(0.5);
        }

        collidePanda(runner, panda){
            console.log("I collided with a "+ panda.state + " PANDA called " + panda.name);

            switch (panda.state){
                case "hostile":
                    runner.die()
                    break;
                case "stunned":
                    panda.attachTo(runner)
                    break;
                default:
                    //nothing?
            }
        }

        die(){
            console.log("runner is dying")
            this.kill()
        }

        update(){

        }
    }
}