//pandas are wondering the map, they can be friends, enemies, collectibles and lives

module Objects{

    type pandaStates = "hostile" | "stunned" | "attached" | "rescued" | "released" | "sleepy";

    export class Panda extends Phaser.Sprite{
        state: pandaStates;
        name: string;
        target : Phaser.Point;
        attachedTo: Phaser.Sprite;
        colorNum: number;
        size: number; //not implemeted yet
        stuntime: number = 0; //stun time remaining

        idle_time : number = 0;

        sound_stunned : Phaser.Sound;

        constructor(game : Phaser.Game, x: number, y: number, startState: pandaStates){        
            super(game, x, y, 'panda_sad');

            this.anchor.set(0.5,0.5);
            this.game.physics.enable(this, Phaser.Physics.ARCADE); //enable physics on the newly created Panda
            setCollisionWithWalls(this, false); //panda ghosts can float through walls.
            
            //Animations
            this.animations.add('idle', [0]);
            this.animations.add('stunned', [0,1]);
            this.animations.add('down', [2,3,4]);
            this.animations.add('left', [5,6,7]);
            this.animations.add('right', [8,9,10]);
            this.animations.add('up', [0,1]);
            this.animations.add('dancing', [2,3,4,5,6,8,9,7,6,9,10])
            //add the dancing animation;

            //offset bounding box to be a little larger than the 30x32 sprite (also make it square)
            //this.body.setSize(24, 24, 3, 4);
            this.changeState(startState);

            this.sound_stunned = this.game.add.audio('Turret_HitsGhost2');
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
                case "released":
                    this.update_released();
                    break;
                case "sleepy":
                    this.update_sleepy();
                    break;
                default:
                    break;                
            }

            if (this.state == "rescued" || this.state == "released"
                || (this.body.velocity.x == 0 && this.body.velocity.y == 0))
            {
                if (true || this.animations.currentAnim.name != 'idle') //override to true
                {
                    if (this.idle_time <= 0)
                    {
                        if (this.state=="rescued"){
                            this.play('dancing', 10, true);
                        } else {
                            this.play('idle', 10, true);
                        }
                    }
                    else
                    {
                        this.idle_time -= this.game.time.elapsedMS;
                    }
                }
            }
            else if (this.state == "stunned")
            {
                if (true || this.animations.currentAnim.name != 'stun') //override true
                {
                    this.play('stun', 20, true);
                }
            }
            else
            {
                this.idle_time = 500;

                var direction = Math.atan2(this.body.velocity.x, this.body.velocity.y);

                if (direction > 3 * Math.PI / 4 || direction < -3 * Math.PI / 4)
                {                    
                    if (this.animations.currentAnim.name != 'up')
                    {
                        if (this.body.velocity.x == 0 ||
                            direction > 9 * Math.PI / 10 || direction < -9 * Math.PI / 10)
                        {
                            this.play('up', 20, true);
                        }
                        else if (this.body.velocity.x < 0)
                        {
                            if (this.animations.currentAnim.name != 'left')
                            {
                                this.play('up', 20, true);
                            }
                        }
                        else
                        {
                            if (this.animations.currentAnim.name != 'right')
                            {
                                this.play('up', 20, true);
                            }
                        }
                    }
                }
                else if (direction > Math.PI / 4)
                {                       
                    if (this.animations.currentAnim.name != 'right')
                    {                        
                        if (this.body.velocity.y == 0 ||
                            (direction > 4 * Math.PI / 10 && direction < 6 * Math.PI / 10))
                        {
                            this.play('right', 20, true);
                        }
                        else if (this.body.velocity.y < 0)
                        {
                            if (this.animations.currentAnim.name != 'up')
                            {
                                this.play('right', 20, true);
                            }
                        }
                        else
                        {
                            if (this.animations.currentAnim.name != 'down')
                            {
                                this.play('right', 20, true);
                            }
                        }
                    }
                }
                else if (direction < -Math.PI / 4)
                {                            
                    if (this.animations.currentAnim.name != 'left')
                    {                  
                        if (this.body.velocity.y == 0 ||
                            (direction < -4 * Math.PI / 10 && direction > -6 * Math.PI / 10))
                        {
                            this.play('left', 20, true);
                        }
                        else if (this.body.velocity.y < 0)
                        {
                            if (this.animations.currentAnim.name != 'up')
                            {
                                this.play('left', 20, true);
                            }
                        }
                        else
                        {
                            if (this.animations.currentAnim.name != 'down')
                            {
                                this.play('left', 20, true);
                            }
                        }
                    }
                }
                else
                {    
                    if (this.animations.currentAnim.name != 'down')
                    {
                        if (this.body.velocity.x == 0 ||
                            (direction > Math.PI / -10 && direction < Math.PI / 10))
                        {
                            this.play('down', 20, true);
                        }
                        else if (this.body.velocity.x < 0)
                        {
                            if (this.animations.currentAnim.name != 'left')
                            {
                                this.play('down', 20, true);
                            }
                        }
                        else
                        {
                            if (this.animations.currentAnim.name != 'right')
                            {
                                this.play('down', 20, true);
                            }
                        }
                    }
                }
            }
        }
        
        attachTo(attachee: Phaser.Sprite){
            this.changeState("attached");
            this.attachedTo = attachee;
        }

        stun()
        {
            this.detachPanda(this);
            /*switch (this.state){ //check curernt state
                case "hostile":*/
                    this.stuntime = settings.gameplay.panda.stunTime;
                    this.game.time.events.add(this.stuntime, this.stunTimeEnd, this);
                    /*break;
                default:
                    break;
            }*/
            this.changeState("stunned");
        }

        stunTimeEnd(){
            if (this.state == "stunned"){ //check that panda is still stunned - don't want attached or rescued ones going hostile.
                this.changeState("hostile");
            }
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
                    this.loadTexture("panda_sad", 0, false);
                    this.colorNum = Phaser.Color.getColor(255,0,0); //red
                    break;
                case "stunned":                    
                    this.sound_stunned.play(null,null,global_sfx_volume);
                    this.loadTexture("panda_stun", 0, false);
                    //console.log("we have stunnd panda so the key is now " + this.key);
                    this.idle_time = 0.0;
                    this.colorNum = Phaser.Color.getColor(0, 255, 255); //yellow                   
                    break;
                case "attached":
                    this.loadTexture("panda_stun", 0, false);
                    this.colorNum = Phaser.Color.getColor(30, 10, 250); //blue
                    break;
                case "rescued":
                    this.loadTexture("panda_happy", 0, false);
                    this.idle_time = 0.0;
                    this.colorNum = Phaser.Color.getColor(0, 150, 0); //green
                    break;
                case "released":
                    this.idle_time = 0.0;
                    // keep color from previous state
                    break;
                case "sleepy":
                    this.key="panda_stun"
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
                moveToTarget(this, this.target, 0, null);
            }
        }

        update_stunned(){
            //remain stunned for X seconds
            //wobble (tween)
            this.alpha = 0.8;
        }

        update_attached(){
            //follow the leader! 
            if (this.attachedTo != null)
            {
                moveToTarget(this, this.attachedTo.position, 20, null)
            }
        }

        update_rescued(){
            //follow the gunner's anchor position
            moveToTarget(this, this.target, 0, 100)
        }

        update_released(){
            //follow the target far away
            moveToTarget(this, this.target, 10, 100)

            // TODO
            // check offscreen for killing
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