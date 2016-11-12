//The runner is the player that goes and collect

module Objects{

    type runnerStates = "alive" | "shot" | "scared" | "warping" | "dead";

    export class Runner extends Phaser.Sprite{
        speed: number =  gameplay_runner_baseSpeed;

        state:  runnerStates = "alive";

        linked_pandas : Phaser.LinkedList;

        cursors: Phaser.CursorKeys;
        myGunner: Gunner;

        constructor(game : Phaser.Game, x: number, y: number){
            super(game, x, y, game.cache.getBitmapData('unit_white'));
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            //this.myGunner = myGunner;
            this.changeState(this.state);

            this.cursors = this.game.input.keyboard.createCursorKeys();

            this.linked_pandas = new Phaser.LinkedList();
            this.linked_pandas.add(this);

            setCollisionWithWalls(this, true);
        }

        update(){
            this.body.velocity.setTo(0, 0) //reset runner movement (if no keys pressed will stop moving)
            //TODO Runner collission with walls?
            
            switch (this.state){
                case "dead":
                    this.kill(); //die already!
                    break;
                case "shot": //shot or scared
                    this.changeState("warping");
                    break;
                case "scared":
                    this.changeState("warping");
                    break;
                case "alive":
                    this.movement();
                    break;
                case "warping":
                    //blue and fly to turret home.

                    moveToTarget(this, this.myGunner.position, 0, 300)
                    break;
                default:
                    break;
            }
            

        }     

        movement(){
            var chainSlowDown = (1 - (this.linked_pandas.total-1) / gameplay_runner_chainLengthSlowDown)
            if (chainSlowDown > gameplay_runner_chainMaxSlowDown) //don't get too slow
                chainSlowDown = gameplay_runner_chainMaxSlowDown; 
            var gospeed = this.speed * chainSlowDown

            console.log(chainSlowDown, gospeed);

            //Runner Movement
            //horizontal movement
            if (this.cursors.left.isDown) 
                this.body.velocity.x = -gospeed;
            else if (this.cursors.right.isDown) 
                this.body.velocity.x = gospeed;

            //vertical movement
            if (this.cursors.up.isDown)
                this.body.velocity.y = -gospeed;
            else if (this.cursors.down.isDown)
                this.body.velocity.y = gospeed;
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
                        //play sound "ARRRRGH"
                        this.tint = Phaser.Color.getColor(255, 10, 0); //dirty red)
                        break;
                    case "scared":
                        //play sound "EEEEEEEK"
                        this.tint = Phaser.Color.getColor(0, 30, 200); //light blue-green (pale with fright?)
                        this.alpha = 0.6;
                        break;
                    case "alive":
                        this.tint = Phaser.Color.getColor(100,50,0); //brown??
                        setCollisionWithWalls(this, true);
                        this.alpha = 1.0;
                        break;
                    case "warping":
                        //blue and fly to turret home.
                        this.tint = Phaser.Color.getColor(0, 0, 200); //blueish
                        setCollisionWithWalls(this, false);
                        break;
                    default:
                        break;
                }
            }        

        collideGunner(runner: Runner, gunner: Gunner){
            //console.log("runner collided with gunner while in state " + runner.state);
            if (runner.state == "warping"){
                console.log("runner revived by warping home to gunner");
                runner.changeState("alive");
            }
        }
        
        collidePanda(runner: Runner, panda: Panda){
            switch (panda.state){
                case "hostile":
                    runner.changeState("scared");
                    break;
                case "stunned":
                    runner.attachPanda(panda);
                    break;
                default:
                    //nothing?
            }
        }

        attachPanda(panda : Panda)
        {
            panda.attachTo(this.linked_pandas.last);
            this.linked_pandas.add(panda);
    }

        detachPanda(panda)
        {
            if (panda.next != null)
            {
                panda.next.attachTo(panda.prev);
            }

            this.linked_pandas.remove(panda);
        }

        die(){
            console.log("runner is dying")
            this.kill()
        }
    }
}