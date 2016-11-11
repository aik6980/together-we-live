//pandas are wondering the map, they can be friends, enemies, collectibles and lives

module Objects{

    export class Panda extends Phaser.Sprite{
        state: string = "hostile"
        name: string;

        constructor(game : Phaser.Game, x: number, y: number, startState: string){
            super(game, x, y, game.cache.getBitmapData('unit_white'));
            this.state = startState;

            //game.physics.enable(this, Phaser.Physics.ARCADE); //does this work here?
            
        }

        attachTo(attachee){
            console.log("Panda should get attachd to the attache", attachee);
        }

        changeState(targetState: string){
            this.state = targetState;
        }

        update(){
            
            //state based colour changes
            switch (this.state){
                case "hostile":
                    this.tint = Phaser.Color.getColor(255,0,0); //red
                    break;
                case "stunned":
                    this.tint = Phaser.Color.getColor(0, 255, 255); //yellow
                    break;
                case "rescued":
                    this.tint = Phaser.Color.getColor(0, 255, 0); //green
                default:
                    this.tint = Phaser.Color.getColor(255, 255, 255); //white
            }
            
        }
    }
}