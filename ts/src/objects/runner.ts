//The runner is the player that goes and collect

module Objects{

    type runnerStates = "alive" | "shot" | "scared" | "warpingHome" | "dead";

    export class Runner extends Phaser.Sprite{
        speed: number = 100;
        state:  runnerStates = "alive";
        cursors: Phaser.CursorKeys;

        

        constructor(game : Phaser.Game, x: number, y: number, speed: number){
            super(game, x, y, game.cache.getBitmapData('unit_white'));
            this.changeState(this.state);

            this.cursors = this.game.input.keyboard.createCursorKeys();
        }

        update(){

            //TODO Runner collission with walls?
            
            //Runner Movement
            this.body.velocity.setTo(0, 0) //reset runner movement (if no keys pressed will stop moving)

            //horizontal movement
            if (this.cursors.left.isDown) 
                this.body.velocity.x = -this.speed;
            else if (this.cursors.right.isDown) 
                this.body.velocity.x = this.speed;

            //vertical movement
            if (this.cursors.up.isDown)
                this.body.velocity.y = -this.speed;
            else if (this.cursors.down.isDown)
                this.body.velocity.y = this.speed;
        }        

    changeState(targetState: runnerStates){
        ///MORE work needed here
            var prevState = this.state;
            this.state = targetState;

            switch (targetState){
                case "dead":
                    this.kill();
                    break;
                case "shot": //shot or scared
                case "scared":
                    this.tint = Phaser.Color.getColor(240, 0, 30); //dirty red
                    break;
                case "alive":
                    this.tint = Phaser.Color.getColor(100,50,0); //brown??
                case "warpingHome":
                    //blue and fly to turret home.
                    this.tint = Phaser.Color.getColor(0, 0, 200); //blueish
                    break;
                default:
                    break;
            }
        }        

        
        collidePanda(runner, panda){
            console.log("I collided with a "+ panda.state + " PANDA called " + panda.name);

            switch (panda.state){
                case "hostile":
                    runner.changeState("scared");
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
    }
}