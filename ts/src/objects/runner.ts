//The runner is the player that goes and collect

module Objects{

    type runnerStates = "alive" | "shot" | "scared" | "warpingHome" | "dead";

    export class Runner extends Phaser.Sprite{
        speed: number = 100;
        state:  runnerStates = "alive";
        cursors: Phaser.CursorKeys;

        

        constructor(game : Phaser.Game, x: number, y: number, speed: number){
            super(game, x, y, game.cache.getBitmapData('unit_white'));
            //super(game.add.sprite(x, y, "ghosts"));
            this.changeState(this.state);

            this.cursors = this.game.input.keyboard.createCursorKeys();
        }

        update(){
            this.body.velocity.setTo(0, 0) //reset runner movement (if no keys pressed will stop moving)
            //TODO Runner collission with walls?
            
            switch (this.state){
                case "dead":
                    this.kill(); //die already!
                    break;
                case "shot": //shot or scared
                case "scared":
                    console.log("runner was " + this.state + " so will be warpingHome");
                    this.changeState("warpingHome");
                    break;
                case "alive":
                    this.movement();
                    break;
                case "warpingHome":
                    //blue and fly to turret home.
                    moveToTarget(this, new Phaser.Point(200, 200), 100)
                    break;
                default:
                    break;
            }
            

        }     


        movement(){
            //Runner Movement
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
                        console.log("I'm shot or scared and I'm actually " + targetState);
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

        collideGunner(runner: Runner, gunner: Gunner){
            console.log("runner collided with gunner while in state " + runner.state);
            if (runner.state == "warpingHome"){
                console.log("runner revived by warping home to gunner");
                runner.changeState("alive");
            }
        }
        
        collidePanda(runner: Runner, panda: Panda){
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
    }
}