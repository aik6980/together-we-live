//The runner is the player that goes and collect

module Objects{

    type runnerStates = "alive" | "shot" | "scared" | "warping" | "dead";

    export class Runner extends Phaser.Sprite{
        speed: number =  settings.gameplay.runner.baseSpeed;

        state:  runnerStates = "alive";

        linked_pandas : Phaser.LinkedList; //when checking total 1 means just the runner is in the chain

        cursors: Phaser.CursorKeys;
        myGunner: Gunner;

        preWarpCountdown: number;

        force_target : Phaser.Point;

        constructor(game : Phaser.Game, x: number, y: number){
            super(game, x, y, 'runner');
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            this.changeState(this.state);

            this.cursors = this.game.input.keyboard.createCursorKeys();

            this.linked_pandas = new Phaser.LinkedList();
            this.linked_pandas.add(this); //add self at top of list
            this.anchor.setTo(0.5);

            //Animations
            this.animations.add('idle', [0]);
            this.animations.add('left', [1]);
            this.animations.add('right', [2]);
            this.animations.add('down', [3]);
            this.animations.add('up', [0]);
            this.animations.add('idle', [0]);

        }

        update(){
            this.body.velocity.setTo(0, 0) //reset runner movement (if no keys pressed will stop moving)

            switch (this.state){
                case "dead":
                    //console.log("the runner is dead?");
                    //this.die(); //die already!
                    break;
                case "alive": //move around
                    this.movement();
                    break;
                case "warping": //fly to turret home.
                    moveToTarget(this, this.myGunner.position, 0, 300)
                    break;
                default:
                    break;
            }
            

        }     

        movement(){
            var chainSlowDown = (1 - (this.linked_pandas.total-1) / settings.gameplay.runner.chainLengthSlowDown)
            if (chainSlowDown > settings.gameplay.runner.chainMaxSlowDown) //don't get too slow
                chainSlowDown = settings.gameplay.runner.chainMaxSlowDown;

            chainSlowDown = 1; //overwrite for now
            var gospeed = this.speed * chainSlowDown;

            var leftOrRight: number = 0; //-1 = left, 0 =none, +1 = right
            var upOrDown: number = 0; //-1 = Up, 0= none, +1 = down
            
            if (this.force_target == null)
            {
                //Runner movement
                if (this.cursors.left.isDown) {
                    leftOrRight = -1;
                } else if (this.cursors.right.isDown) {
                    leftOrRight = +1;
                }

                if (this.cursors.up.isDown) {
                    upOrDown = -1;
                } else if (this.cursors.down.isDown) {
                    upOrDown = +1;
                }
            }
            else
            {
                var diff_x = this.force_target.x - this.x;
                var diff_y = this.force_target.y - this.y;

                if (diff_x > 10)
                    leftOrRight = 1;
                else if (diff_x < -10)
                    leftOrRight = -1;

                if (diff_y > 10)
                    upOrDown = 1;
                else if (diff_y < -10)
                    upOrDown = -1;
            }

            this.body.velocity.x = gospeed * leftOrRight;
            this.body.velocity.y = gospeed * upOrDown;

            if (upOrDown == +1){ //up and diagonal up
                this.animations.play("up");
            } else if (upOrDown == -1 && leftOrRight == 0){ //directly down
                this.animations.play("down");
            } else if (leftOrRight == -1){ //left and diagnonal down left
                this.animations.play("left");
            } else if (leftOrRight == 1){ //right and diagnonal down right
                this.animations.play("right");
            } else {
                this.animations.play("idle");
            }
        }   

        changeState(targetState: runnerStates){
                var prevState = this.state;
                this.state = targetState;

                switch (targetState){
                    case "dead":
                        this.die();
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
                        this.tint = 0xFFFFFF //removes tint
                        //setCollisionWithWalls(this, true); //see note below toggling this on runner had bizarre consequences!
                        this.speed = settings.gameplay.runner.baseSpeed;
                        this.alpha = 1;
                        break;
                    case "warping":
                        //blue and fly to turret home (in update)
                        this.tint = Phaser.Color.getColor(0, 0, 200); //blueish
                        //////setCollisionWithWalls(this, false); //This broke it so bad! only the first warping would work! Now there is just a clause on the levelCollission to let warping pass. Error is something to do with it being or not being in a group and somehow no longer existing?? 
                        this.alpha = 0.3;
                        break;
                    default:
                        break;
                }

                if (targetState == "shot" || targetState == "scared"){
                    //console.log("prepare to warp!!!");
                    this.game.time.events.add(settings.gameplay.runner.prewarpTime, this.changeState, this, "warping"); //timer works but 2nd time runner dies stays dead
                }
            }        

        collideGunner(runner: Runner, gunner: Gunner){
            if (runner.state == "warping"){
                runner.changeState("alive");
            }
        }
        
        collidePanda(runner: Runner, panda: Panda){
            switch (panda.state){
                case "hostile":
                    if (runner.linked_pandas.total-1 == 0) {
                        runner.changeState("scared");
                    } else {
                        console.log(runner.linked_pandas.last);
                        runner.detachPanda(runner.linked_pandas.last);
                    }
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