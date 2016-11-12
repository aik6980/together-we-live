//pandas are wondering the map, they can be friends, enemies, collectibles and lives

module Objects{

    type pandaStates = "hostile" | "stunned" | "attached" | "rescued" | "sleepy";

    export class Panda extends Phaser.Sprite{
        //state: string = "hostile";
        state: pandaStates;
        name: string;
        target : Phaser.Point;
        attachedTo: Phaser.Sprite;
        colorNum: number;
        size: number; //not implemeted yet

        constructor(game : Phaser.Game, x: number, y: number, startState: pandaStates){        
            super(game, x, y, game.cache.getBitmapData('unit_white'));
            this.changeState(startState);
            //this.state = startState;


            //game.physics.enable(this, Phaser.Physics.ARCADE); //does this work here?
            
        }

        update(){       
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;

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
            console.log("Panda should get attached to the attachee (which should be the runner)", attachee);
            this.changeState("attached");
            this.attachedTo = attachee;
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
                moveToTarget(this, this.target, null);
            }
        }

        update_stunned(){
            //remain stunned for X seconds
            //wobble (tween)
        }

        update_attached(){
            //follow the leader! 
            moveToTarget(this, this.attachedTo.position, null)

        }

        update_rescued(){
            //Party at the base
            this.body.velocity = [0,0];
            this.kill(); //and for now die but actually circle the base in a group of RescuedPandas (remember these our the lives!)

        }

        update_sleepy(){
            //stay perfectly still
            this.body.velocity = [0,0];
        }
    }
}