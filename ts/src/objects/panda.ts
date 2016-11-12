//pandas are wondering the map, they can be friends, enemies, collectibles and lives

module Objects{

    type pandaStates = "hostile" | "stunned" | "attached" | "rescued" | "sleepy";

    export class Panda extends Phaser.Sprite{
        //state: string = "hostile";
        state: pandaStates;
        name: string;

        constructor(game : Phaser.Game, x: number, y: number, startState: pandaStates){
        target : Phaser.Point;
            super(game, x, y, game.cache.getBitmapData('unit_white'));
            this.state = startState;

            //game.physics.enable(this, Phaser.Physics.ARCADE); //does this work here?
            
        }

        attachTo(attachee){
            console.log("Panda should get attachd to the attachee", attachee);
            this.changeState("attached");
        }

        changeState(targetState: pandaStates){
            this.state = targetState;

            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        }

        update(){
            
            //state based colour changes
            switch (this.state){
                case "hostile":
                    this.tint = Phaser.Color.getColor(255,0,0); //red
                    this.update_hostile();
                    break;
                case "stunned":
                    this.tint = Phaser.Color.getColor(0, 255, 255); //yellow
                    break;
                case "attached":
                    this.tint = Phaser.Color.getColor(30, 10, 250); //blue
                    break;
                case "rescued":
                    this.tint = Phaser.Color.getColor(0, 255, 0); //green
                    break;
                    break;
                case "sleepy":
                    this.tint = Phaser.Color.getColor(255, 255, 255); //white
                    break;
                default:
                    this.tint = Phaser.Color.getColor(50, 50, 50); //gray
                    break;
            }
        }

        update_hostile()
        {            
            if (this.target != null)
            {
                this.body.velocity.x = this.target.x - this.body.position.x;
                this.body.velocity.y = this.target.y - this.body.position.y;

                var magnitude = this.body.velocity.getMagnitude();
                this.body.velocity.x *= 50 / magnitude;
                this.body.velocity.y *= 50 / magnitude;

                console.log("distx:" + (this.target.x - this.body.position.x)
                 + " disty:" + (this.target.y - this.body.position.y));

                 console.log("vel=" + this.body.velocity.x + "," + this.body.velocity.y);
    }
        }
    }
}