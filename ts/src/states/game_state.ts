module State{
    type pandaStates = "hostile" | "stunned" | "attached" | "rescued" | "sleepy";
    
    export class Game_state extends Phaser.State{  
        unit = 16;
        bmd_unit_white : Phaser.BitmapData;
        bmd_unit_black : Phaser.BitmapData;
        
        starty = 50;

        // world
        level : Level.Level;
        world_objects : Phaser.Group;
        devMode: boolean = global_devMode;

        // Players
        runner : Objects.Runner;
        gunner : Objects.Gunner;

        spawner : Phaser.Group;
        spawn_system : Objects.Spawn_System;

        // groups
        pandas : Phaser.Group;
        colliders: Phaser.Group;

        gray_filter : Phaser.Filter;

        preload(){
            // create a bitmap data
            // http://phaser.io/examples/v2/bitmapdata/cached-bitmapdata
            this.bmd_unit_white = this.game.add.bitmapData(this.unit, this.unit);
            this.bmd_unit_white.context.fillStyle = 'rgb(255,255,255)';
            this.bmd_unit_white.context.fillRect(0,0,24,24);
            
            this.game.cache.addBitmapData('unit_white', this.bmd_unit_white);

            this.game.load.image('bullet', 'assets/img/shmup-bullet.png');
            this.game.load.image('ship', 'assets/img/thrust_ship.png');

            // grayscale shader
            this.game.load.script('gray', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/Gray.js');

            this.game.load.tilemap('world', 'assets/data/world.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.image('world_tileset', 'assets/img/tiny32.png');

            //spritesheet
            this.game.load.spritesheet('ghosts', 'assets/img/tiny32_ghost.png', 30, 32)

            //Sounds

            //Videos
        }

        create(){
            var obj = null; //reused lots.

            this.gray_filter = this.game.add.filter('Gray');

            //create level
            this.level = new Level.Level(this.game);
            this.level.load(this);

            //gray.gray = 1.0;
            //create pandas group
            this.pandas = this.game.add.group();
            this.colliders = this.game.add.group();
            global_colliders = this.colliders;

            this.spawner = this.game.add.group();
            this.spawn_system = new Objects.Spawn_System(this);
            console.log("this.spawn_system created ", this.spawn_system);
            
            /*//make 3 lives
            this.spawn_system.spawnInState("rescued");
            this.spawn_system.spawnInState("rescued");
            this.spawn_system.spawnInState("rescued");
            console.log("spawned 3 lives");*/

            this.spawn_system.spawnCountdownStart();

            // world scaling helper
            this.world_objects = this.game.add.group();
            global_world_objects = this.world_objects;
            
            this.world_objects.add(this.pandas);
            this.world_objects.add(this.spawner);

            this.level.add_gameobjects(this);

            //dev controls
            if (this.devMode){
                ///num keys to change all the pandas states?
                //this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onUp.add(this.changeAllPandasState, this, null, "hostile");
                //this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onUp.add(this.changeAllPandasState, this, null, "stunned");
                this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onUp.add(this.changeWorldScale, this, null, 2.0);
                this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onUp.add(this.changeWorldScale, this, null, 1.5);
                this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onUp.add(this.changeWorldScale, this, null, 1.0);
                this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR).onUp.add(this.changeWorldScale, this, null, 0.5);

                this.game.input.keyboard.addKey(Phaser.Keyboard.SIX).onUp.add(this.spawn_trigger, this, null);

                this.game.input.keyboard.addKey(Phaser.Keyboard.SEVEN).onUp.add(this.changeAllPandasState, this, null, "rescued");
                this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onUp.add(this.changeAllPandasState, this, null, "attached");
                this.game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onUp.add(this.changeAllPandasState, this, null, "sleepy");

                this.game.input.keyboard.addKey(Phaser.Keyboard.EIGHT).onUp.add(this.removeOnePandaFromGunner, this);

                this.game.input.keyboard.addKey(Phaser.Keyboard.PAGE_UP).onUp.add(this.winTheGame, this);
                this.game.input.keyboard.addKey(Phaser.Keyboard.PAGE_DOWN).onUp.add(this.loseTheGame, this);
            //this.game.time.events.repeat(Phaser.Timer.SECOND, 3, this.createFollowingPanda, this);
            }
        }

        spawn_trigger(args){
            this.spawn_system.spawn();
        }

        changeWorldScale(args, scale:number){
            this.level.changeWorldScale(scale, this);
        }

        update(){
            this.level.update_game_state(this);
            ///Collisions
            //N.b. the player when "warping" is not checked for collision;

            ///DID YOU LOSE YET?
            if (this.gunner.recruits.length == 0){
                this.loseTheGame();
                //this.game.paused = true;
            }

            ////DID YOU WIN YET??
            if (this.gunner.recruits.length >= gameplay_gunner_winRecruits){
                this.winTheGame();
                this.game.paused = true;
            }
            

            //character collisions
            this.game.physics.arcade.overlap(this.runner, this.pandas, this.runner.collidePanda, function(){ return this.runner.state != 'warping';}, this); 
            this.game.physics.arcade.overlap(this.gunner, this.pandas, this.gunner.collidePanda, null, this);
            this.game.physics.arcade.collide(this.runner, this.gunner, this.runner.collideGunner, null, this); //don't walk through the gunner

            //level collisions
            this.game.physics.arcade.collide(this.runner, this.level.collision_layer, null, function(){ return this.runner.state != 'warping';}, this); 
            if (this.pandas.length > 0){
                this.game.physics.arcade.collide(this.pandas, this.level.collision_layer, null, function(){  console.log(this); return this.panda.state != 'rescued'}, this.pandas);
            }

            //bullet collisions
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.pandas, this.shotPanda, null, this);
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.runner, this.shotRunner, function(){ return this.runner.state != 'warping';}, this);

        }

        render(){

            //Progress
            var progressText = "Rescued: " + this.gunner.recruits.length + " / " + gameplay_gunner_winRecruits
            this.game.debug.text(progressText, 20, 0+20); //progress Text in top left
			
            var debugBoundingBoxes = false;
            if (this.devMode)

                if (debugBoundingBoxes){
                    //bounding boxes
                    this.game.debug.body(this.gunner);
                    this.game.debug.body(this.runner);

                    this.pandas.forEach(panda => {
                        this.game.debug.body(panda);                    
                    }, null, true);

                    this.gunner.anchor
                }
                
                this.game.debug.text("object in world_objects: " + this.world_objects.total, 10, this.game.height - 60);
                //this.game.debug.text("Gunner position" + this.gunner.x + ", "+ this.gunner.y, 10, this.game.height - 40);
                this.game.debug.text("Pandas in play: " + this.pandas.total, 10, this.game.height - 40);
                this.game.debug.text("Runner: " + this.runner.alive + " " + this.runner.state + " with " + (this.runner.linked_pandas.total -1) + " pandas in tow." , 10, this.game.height - 20);

                //this.game.debug.text("gunner: " + this.gunner.x + " " + this.gunner.y, 10, 280);

        }

        winTheGame(){
            //(currently text not appearing for long though - need to change state, freeze the spawns etc)
            console.log("winTheGame()");
            var str = "YOU WON!!!!";
            this.game.debug.text(str, 250, 250);
            //this.game.add.text(this.game.width/2, this.game.height/2, winText);
            var style = { font: "65px Arial", fill: "#ff0044", align: "center" };
            var text = this.add.text(this.world.centerX, this.world.centerY, str, style);
            text.anchor.set(0.5);
        }

        loseTheGame(){
            console.log("loseTheGame()");
            var str = "YOU\nBOTH\nLOST";
            this.game.debug.text(str, 250, 250);
            //this.game.add.text(this.game.width/2, this.game.height/2, winText);
            var style = { font: "65px Arial", fill: "#ff0044", align: "center" };
            var text = this.add.text(this.world.centerX, this.world.centerY, str, style);
            text.anchor.set(0.5);
        }

        shotPanda(bullet, panda)
        {			            
			if (panda.state != "rescued")
            {
                bullet.kill();
                panda.stun();
            }
        }

        shotRunner(runner, bullet){
            //this is bizarre but documented - group vs sprite passes the callback parameters in the sprite first order.
            //The two objects will be passed to this function in the same order in which you specified them, unless you are checking Group vs. Sprite, in which case Sprite will always be the first parameter." 
            bullet.kill();
            runner.changeState("shot");
        }

        spawnPanda(x, y){
            //spawn panda in default Hostile stance
            return this.spawnPandaInState(x, y, "hostile");
        }

        spawnPandaInState(x, y, state: pandaStates){
            var pobj = new Objects.Panda(this.game, x, y, state);
            pobj.body.height = pobj.body.height * this.level.current_scale;
            pobj.body.width = pobj.body.width * this.level.current_scale;
            pobj.target = this.gunner.position; //pandas target the Gunner by default
            return pobj;
        }

        changeAllPandasState(args, state: string){
            this.pandas.forEachExists(function(panda) { panda.changeState(state); }, null );
            //this.pandas.setAll('state', state);
            console.log("Made all the pandas " + state);
    }

        createRescuedPanda()
        {            
            var panda = this.spawnPanda(this.gunner.x - 40, this.gunner.y);
            this.gunner.rescuePanda(panda);
        }

        createHostilePanda()
        {            
            var panda = this.spawnPanda(this.gunner.position.x + 300, this.gunner.position.y + 300);
            this.pandas.add(panda);
            panda.changeState("hostile");
        }

        createFollowingPanda()
        {            
            var panda = this.spawnPanda(this.runner.position.x, this.runner.position.y);
            this.pandas.add(panda);
            this.runner.attachPanda(panda);
        }

        removeOnePandaFromGunner()
        {
            var panda = this.gunner.recruits.getAt(0) as Objects.Panda;
            this.gunner.removePanda(panda);
        }
    }
}

//Global Functions
function moveToTarget(source: Phaser.Sprite, target: PIXI.Point, distance: number, speed: number){
    var gospeed = speed || 50
    
    source.body.velocity.x = target.x - source.position.x;
    source.body.velocity.y = target.y - source.position.y;
    
    if (distance == 0)
    {
        var magnitude_sqr = source.body.velocity.x*source.body.velocity.x+source.body.velocity.y*source.body.velocity.y;
        if (magnitude_sqr > 0)
        {
            var magnitude = Math.sqrt(magnitude_sqr);
            source.body.velocity.x *= gospeed / magnitude;
            source.body.velocity.y *= gospeed / magnitude;
        }
        else
        {
            source.body.velocity.x = 0;
            source.body.velocity.y = 0;
    }
    }
    else if (source.body.velocity.x > distance || source.body.velocity.x < -distance ||
        source.body.velocity.y > distance || source.body.velocity.y < -distance)
    {
    //the GetMagnitude() velocity function was "not found" despite existing... so Hubert just rewrote it inline :)
        var magnitude = Math.sqrt(source.body.velocity.x*source.body.velocity.x+source.body.velocity.y*source.body.velocity.y);
    source.body.velocity.x *= gospeed / magnitude;
    source.body.velocity.y *= gospeed / magnitude;
    }
    else
    {
        source.body.velocity.x = 0;
        source.body.velocity.y = 0;
    }
}

var global_colliders : Phaser.Group;
function setCollisionWithWalls(object, value : boolean)
{
    if (value)
        global_colliders.add(object);
    else
        global_colliders.remove(object);
}

var global_world_objects : Phaser.Group;
function AddToWorldObjects(object)
{
    global_world_objects.add(object);
}

function RemoveFromWorldObjects(object)
{
    global_world_objects.remove(object);
}

var global_game_scale = 1.0;


function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

////Global Gameplay variables (Time units should be ms as the functions will divide by 1000)
var global_devMode: boolean = true;

//Gunner Gameplay
var gameplay_gunner_baseTurnSpeed: number = 300;
var gameplay_gunner_startingRecruits: number = 3;
var gameplay_gunner_winRecruits: number = 10; //number of pandas required to win

//Runner Gameplay
var gameplay_runner_baseSpeed: number = 150;
var gameplay_runner_chainLengthSlowDown: number = 5;
var gameplay_runner_chainMaxSlowDown: number = 0.7;
var gameplay_runner_prewarpTime: number = 1000; //how long to wait in shot/scared state before warping 

//Panda Gameplay
var gameplay_panda_baseSpeed: number = 100;
var gameplay_panda_stunTime: number = 5000;
var gameplay_panda_stunLockCount: number = 4; //if stunlocked x times without a break will be respawned elsewhere

var gameplay_pandas_spawnRateMin: number = 500;
var gameplay_pandas_spawnRateMax: number = 3000;
var gameplay_pandas_spawnLimit: number = 50; //max number of pandas spawned (should be >= the winRecruits)
var gameplay_pandas_hostileLimit: number = 20; //NOT IMPLEMENTED YET - would be a way to do pandas - recruits = hostiles and not too many spawned (though we don't despawn)
var gameplay_pandas_spawnQuantity: number = 1; //how many to spawn at once