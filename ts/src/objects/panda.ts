//pandas are wondering the map, they can be friends, enemies, collectibles and lives

module Objects{

    type pandaStates = "hostile" | "stunned" | "attached" | "rescued" | "sleepy";

    export class Panda extends Phaser.Sprite{
        state: pandaStates;
        name: string;
        target : Phaser.Sprite;
        attachedTo: Phaser.Sprite;
        colorNum: number;
        size: number; //not implemeted yet
        stuntime: number = 0; //stun time remaining
        stunlockcount: number = 0; //count of sequential stuns without being unstunned. Resets to 0 when unstunned.

        constructor(game : Phaser.Game, x: number, y: number, startState: pandaStates){        
            super(game, x, y, 'ghosts');
            
            this.game.physics.enable(this, Phaser.Physics.ARCADE); //enable physics on the newly created Panda
            setCollisionWithWalls(this, false); //panda ghosts can float through walls.
            
            //Animations
            this.animations.add('idle', [0,1]);
            this.animations.add('stunned', [1,2]);
            this.animations.add('down', [0,1,2]);
            this.animations.add('left', [3,4,5]);
            this.animations.add('right', [6,7,8]);
            this.animations.add('up', [9,10,11]);
            this.animations.play('idle', 20, true);

            //offset bounding box to be a little larger than the 30x32 sprite (also make it square)
            this.body.setSize(24, 24, 3, 4);

            this.changeState(startState);
            
            this.anchor.set(0.5,0.5);
        }

        update(){
            this.body.velocity = [0,0]; //stop moving (there is no momentum)

            switch (this.state){
                case "hostile":
                    this.update_hostile();
                    break;
                case "stunned":
                    this.update_stunned();
                    break;
                case "attached":
                    this.update_attached();
                    break;
                case "rescued":
                    this.update_rescued();
                    break;
                case "sleepy":
                    this.update_sleepy();
                    break;
                default:
                    break;                
            }
        }
        
        attachTo(attachee: Phaser.Sprite){
            this.changeState("attached");
            this.attachedTo = attachee;
        }

        stun()
        {
            this.detachPanda(this);
            switch (this.state){
                case "hostile":
                    this.stuntime = gameplay_panda_stunTime;
                    this.stunlockcount = 1;
                    break;
                case "stunned":
                    this.stuntime += gameplay_panda_stunTime; //increase stun time and lockout
                    this.stunlockcount += 1;
                    break;
                default:
                    break;
            }
            this.changeState("stunned");
        }

        rescue()
        {
            this.detachPanda(this);
            this.changeState("rescued");
        }

        changeState(targetState: pandaStates){
            var prevState = this.state;
            this.state = targetState;

            switch (targetState){ //update colour and sprite?
                case "hostile":
                    this.colorNum = Phaser.Color.getColor(255,0,0); //red
                    break;
                case "stunned":
                    this.colorNum = Phaser.Color.getColor(0, 255, 255); //yellow                   
                    break;
                case "attached":
                    this.colorNum = Phaser.Color.getColor(30, 10, 250); //blue
                    break;
                case "rescued":
                    this.colorNum = Phaser.Color.getColor(0, 255, 0); //green
                    break;
                case "sleepy":
                    this.colorNum = Phaser.Color.getColor(255, 255, 255); //white
                    break;
                default:
                    this.colorNum = Phaser.Color.getColor(50, 50, 50); //gray
                    break;
            }

                this.tint = this.colorNum;
        }

        update_hostile()
        {            
            if (this.target != null){
                moveToTarget(this, this.target.position, 0, null);
            }
        }

        update_stunned(){
            //remain stunned for X seconds
            //wobble (tween)
            this.animations.play('stunned', 10, true);
            this.alpha = 0.8;
        }

        update_attached(){
            //follow the leader! 
            moveToTarget(this, this.attachedTo.position, 20, null)
        }

        update_rescued(){
            //follow the gunner's anchor position
            moveToTarget(this, this.target.position, 0, 100)
        }

        update_sleepy(){
            //stay perfectly still (might also be hidden)
            this.attachedTo = null; //break attachment
            this.body.velocity = [0,0];
        }

        detachPanda(panda)
        {
            if (this.attachedTo != null)
            {
                (Object)(this.attachedTo).detachPanda(panda);
    }
        }
    }
}