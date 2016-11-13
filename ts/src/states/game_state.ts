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

        // Players
        runner : Objects.Runner;
        gunner : Objects.Gunner;

        spawner : Phaser.Group;
        spawn_system : Objects.Spawn_System;

        // groups
        pandas : Phaser.Group;
        colliders: Phaser.Group;

        gray_filter : Phaser.Filter;

        //winState
        playState: string = "load";

        progressPercent: number = 0;
        peakProgressPercent: number = 0;

        // music
        music : Phaser.Sound;

        preload(){
            //settings data file
            this.game.load.json('settings', 'assets/data/settings.json');

            // create a bitmap data
            // http://phaser.io/examples/v2/bitmapdata/cached-bitmapdata
            this.bmd_unit_white = this.game.add.bitmapData(this.unit, this.unit);
            this.bmd_unit_white.context.fillStyle = 'rgb(255,255,255)';
            this.bmd_unit_white.context.fillRect(0,0,24,24);
            
            this.game.cache.addBitmapData('unit_white', this.bmd_unit_white);

            this.game.load.image('bullet', 'assets/img/shmup-bullet.png');
            this.game.load.image('ship', 'assets/img/thrust_ship.png');
            this.game.load.image('gunner_turret', 'assets/img/gunner_turret_40.png');

            // grayscale shader
            this.game.load.script('gray', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/Gray.js');

            this.game.load.tilemap('world', 'assets/data/world.json', null, Phaser.Tilemap.TILED_JSON);
            //this.game.load.image('world_tileset', 'assets/img/tiny32.png');
            this.game.load.image('world_tileset', 'assets/img/tiny32_coloured.png');

            //spritesheet
            //this.game.load.spritesheet('ghosts', 'assets/img/tiny32_ghost.png', 30, 32)
            this.game.load.spritesheet('panda_happy', 'assets/img/panda_happy32.png', 32, 32)
            this.game.load.spritesheet('runner', 'assets/img/runner_spritesheet.png', 22, 30);
            //this.game.load.spritesheet('ghosts', 'assets/img/runner_spritesheet.png', 22, 30);



            //Sounds

            //Videos
        }

        create(){
            // play background music
            this.music = game.add.audio('Music_Together');
            this.music.loop = true;
            this.music.volume = global_music_volume;
            this.music.play();


            //load the settingsJSON and which is now referenced throughout instead of using global_variables.
            settings = this.game.cache.getJSON('settings');

            this.playState = "play";
            
            var obj = null; //reused lots.

            this.gray_filter = this.game.add.filter('Gray');
            this.gray_filter.gray = 0.5;

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

            this.start_demo();

            //dev controls
            if (settings.devMode){
                ///num keys to change all the pandas states?
                //this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onUp.add(this.changeAllPandasState, this, null, "hostile");
                //this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onUp.add(this.changeAllPandasState, this, null, "stunned");
                this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onUp.add(this.changeWorldScale, this, null, 2.0);
            this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onUp.add(this.changeWorldScale, this, null, 1.0);
            this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onUp.add(this.changeWorldScale, this, null, 0.66);
                this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR).onUp.add(this.changeWorldScale, this, null, 0.5);

                this.game.input.keyboard.addKey(Phaser.Keyboard.SIX).onUp.add(this.spawn_trigger, this, null);

                this.game.input.keyboard.addKey(Phaser.Keyboard.SEVEN).onUp.add(this.rescueAllPandas, this, null);
                this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onUp.add(this.changeAllPandasState, this, null, "attached");
                this.game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onUp.add(this.changeAllPandasState, this, null, "sleepy");

                this.game.input.keyboard.addKey(Phaser.Keyboard.EIGHT).onUp.add(this.removeOnePandaFromGunner, this);

                this.game.input.keyboard.addKey(Phaser.Keyboard.PAGE_UP).onUp.add(this.winTheGame, this);
                this.game.input.keyboard.addKey(Phaser.Keyboard.PAGE_DOWN).onUp.add(this.loseTheGame, this);

                this.game.input.keyboard.addKey(Phaser.Keyboard.HOME).onUp.add(function(){ this.spawn_system.autoSpawn = true; }, this);
                this.game.input.keyboard.addKey(Phaser.Keyboard.END).onUp.add(function(){ this.spawn_system.autoSpawn = false; }, this);
            //this.game.time.events.repeat(Phaser.Timer.SECOND, 3, this.createFollowingPanda, this);
            }
        }

        start_demo(){
            var skip_demo = false;
            if (skip_demo)
            {
                this.spawnPandaInState(0,0, "rescued");
                this.spawnPandaInState(200,50, "rescued");
                this.spawnPandaInState(50,200, "rescued");

                this.game.stage.filters = null;
                this.startPlay();
                return;
            }

            this.playState = "demo";
            
            this.changeWorldScale(null, 2.0);
            this.game.stage.filters = [this.gray_filter];

            //init
            this.gunner.force_not_firing = true ;
            this.gunner.force_target = new Phaser.Point(this.gunner.position.x, this.gunner.position.y - 100);
            this.runner.force_target = new Phaser.Point(this.runner.position.x, this.runner.position.y);
            
            //spawn the lives for the gunner
            var panda1 = this.spawnPandaInState(this.gunner.x - 260, this.gunner.y, "hostile");
            this.pandas.add(panda1);
            var panda2 = this.spawnPandaInState(this.gunner.x - 50, this.gunner.y - 400, "hostile");
            this.pandas.add(panda2);
            var panda3 = this.spawnPandaInState(this.gunner.x + 100, this.gunner.y - 400, "hostile");
            this.pandas.add(panda3);

            // shot them            
            this.game.time.events.repeat(Phaser.Timer.SECOND * 2, 1, function(){
                // aim panda1
                this.gunner.force_target = panda1.position;
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 3, 1, function(){
                // stun it!
                this.gunner.fire();
                this.gunner.force_target = new Phaser.Point(this.gunner.force_target);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 3.6, 1, function(){
                // the runner try to catch it
                this.runner.force_target = new Phaser.Point(panda1.x, this.runner.y);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 4, 1, function(){
                // runner keep going and catch it
                this.runner.force_target = panda1.position;
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 4.2, 1, function(){
                // the runner starts to  bring it back
                this.runner.force_target = new Phaser.Point(this.gunner.x, this.gunner.y + 50);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 5, 1, function(){
                // bring it back safe
                this.runner.force_target = new Phaser.Point(this.gunner.x + 80, this.gunner.y);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 5.8, 1, function(){
                // panda2 is coming, aim it!
                this.gunner.force_target = panda2.position;
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 6.2, 1, function(){
                // stun it!
                this.gunner.fire();   
                this.gunner.force_target = new Phaser.Point(this.gunner.force_target);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 6.8, 1, function(){
                // runner try to catch it
                this.runner.force_target = panda2.position;
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 7.2, 1, function(){
                // but wait.. panda3 is coming
                this.runner.force_target = new Phaser.Point(this.gunner.x + 80, this.gunner.y);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 7.5, 1, function(){
                // gunner aim panda3                
                this.gunner.force_target = panda3.position;
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 8, 1, function(){
                // stun it!
                this.gunner.fire();
                this.gunner.force_target = new Phaser.Point(this.gunner.force_target);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 9, 1, function(){
                // then runner can safely catch both of them
                this.runner.force_target = panda2.position;
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 10, 1, function(){
                // bring them back home
                this.runner.force_target = new Phaser.Point(this.gunner.position.x + 50, this.gunner.position.y + 10);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 11, 1, function(){
                this.stop_demo();
            }, this);

            //ended
        }

        stop_demo(){
            //this.game.time.events.removeAll();
            this.gunner.force_not_firing = false;
            this.gunner.force_target = null;
            this.runner.force_target = null;

            this.game.stage.filters = null;
            this.startPlay();
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

            if (this.playState == "won" || this.playState =="lost"){
                this.spawn_system.autoSpawn = false; //disable spawns
            }

            if (this.playState == "tutorial"){

            }
            
            if (this.playState=="play"){
                this.updateProgress()

                ///DID YOU LOSE YET?
                if (this.progressPercent == 0){
                    /*this.loseTheGame();
                    this.changeAllPandasState(null, "sleepy");
                    this.game.paused = true;*/
                }

                ////DID YOU WIN YET??
                if (this.progressPercent == 100){
                    this.winTheGame();
                }
            };

            if (this.playState=="won"){
                this.rescueAllPandas();
            }

            //character collisions
            this.game.physics.arcade.overlap(this.runner, this.pandas, this.runner.collidePanda, function(){ return this.runner.state != 'warping';}, this); 
            this.game.physics.arcade.overlap(this.gunner, this.pandas, this.gunner.collidePanda, null, this);
            this.game.physics.arcade.overlap(this.runner, this.gunner, this.runner.collideGunner, null, this); //don't walk through the gunner

            //level collisions
            this.game.physics.arcade.collide(this.runner, this.level.collision_layer, null, function(){ return this.runner.state != 'warping';}, this);
            //this.game.physics.arcade.collide(this.pandas, this.level.collision_layer); 
            this.game.physics.arcade.collide(this.pandas, this.level.collision_layer, null, function(panda, layer){  
                    if (panda.state == 'rescued'){
                        return false; //don't colide
                    } else { 
                        return true; 
                    }   
                }, this);

            //bullet collisions
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.pandas, this.shotPanda, null, this);
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.runner, this.shotRunner, function(){ return this.runner.state != 'warping';}, this);

        }

        render(){

            //Progress
            var progressText = "Love: " + this.progressPercent + "%"
            this.game.debug.text(progressText, 20, 0+20); //progress Text in top left
			
            var debugBoundingBoxes = false;
            if (settings.devMode){

                if (settings.debugBoundingBoxes){
                    //bounding boxes
                    this.game.debug.body(this.gunner);
                    this.game.debug.body(this.runner);

                    this.pandas.forEach(panda => {
                        this.game.debug.body(panda);                    
                    }, null, true);

                    this.gunner.anchor
                }
                
                this.game.debug.text(this.playState, this.game.width - 40, 10) //top right playstate;

                //this.game.debug.text("object in world_objects: " + this.world_objects.total, 10, this.game.height - 60);
                this.game.debug.text("Spawner enabled: " + this.spawn_system.autoSpawn, 10, this.game.height - 60);
                //this.game.debug.text("Gunner position" + this.gunner.x + ", "+ this.gunner.y, 10, this.game.height - 40);
                this.game.debug.text("Pandas in play: " + this.pandas.total, 10, this.game.height - 40);
                this.game.debug.text("Runner: " + this.runner.alive + " " + this.runner.state + " with " + (this.runner.linked_pandas.total -1) + " pandas in tow." , 10, this.game.height - 20);
            }

                //this.game.debug.text("gunner: " + this.gunner.x + " " + this.gunner.y, 10, 280);

        }

        winTheGame(){
            this.playState="won";
            var str = "YOU\nBOTH\nWON!!!!";
            var style = { font: "65px Arial", fill: "#ff0044", align: "center" };
            var text = this.add.text(this.gunner.position.x, this.gunner.position.y, str, style);
            text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
            text.anchor.set(0.5);
            AddToWorldObjects(text);
        }

        loseTheGame(){
            this.playState="lost";
            var str = "YOU\nBOTH\nLOST";
            var style = { font: "65px Arial", fill: "#ff0044", align: "center" };
            var text = this.add.text(this.gunner.position.x, this.gunner.position.y, str, style);
            text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
            text.anchor.set(0.5);
            AddToWorldObjects(text);
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

            var pobj : Objects.Panda;
            if (state == "rescued")
            {
                pobj = new Objects.Panda(this.game, x, y, "sleepy");
                this.gunner.rescuePanda(pobj);
            }
            else
            {
                pobj = new Objects.Panda(this.game, x, y, state);
                pobj.target = this.gunner.position; //pandas target the Gunner by default
            }

            // recalculate bounding box
            var a = pobj.width * this.world_objects.scale.x;
            var b = pobj.height * this.world_objects.scale.y;
            pobj.body.setSize(a,b,0.5*(pobj.width-a), 0.5*(pobj.height-b));

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
            panda.kill();
        }

        rescueAllPandas(){
            //rescue all remaining pandas
            if (this.pandas.length>0){
                this.pandas.forEach(function(panda: Phaser.Sprite){
                    console.log("rescuing panda " + panda);
                    this.gunner.rescuePanda(panda);
                }, this);
            }
        }

        startPlay(){
            //start playing the game after tutorial
            this.playState = "play";
            this.spawn_system.autoSpawn = true;
        }

        updateProgress(){
            ///Update progress
            var prevProgressPercent = this.progressPercent;
            var newProgressPercent = Math.floor(this.gunner.recruits.length / settings.gameplay.gunner.winRecruits * 100);
            newProgressPercent = clamp(newProgressPercent, 0, 100); //clamp it 0-100
            this.progressPercent = newProgressPercent;
            
            this.peakProgressPercent = clamp(newProgressPercent, this.peakProgressPercent, 100) //increase (never decrease the peakProgressPercent);

            if (newProgressPercent > prevProgressPercent){ //only call when it increased
                console.log("you progressed from " + prevProgressPercent + " to " + newProgressPercent + " AND YOUR PEAK is " + this.peakProgressPercent);
                if (this.peakProgressPercent >= 70){
                    this.changeWorldScale(this, 0.5);
                } else if (this.peakProgressPercent >= 50) {
                    this.changeWorldScale(this, 0.66);
                } else if (this.peakProgressPercent >= 40){
                    this.changeWorldScale(this, 1.0);
                }
            }
                
            

            
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
var settings; //object loaded via json

function clamp(num, min, max){
    return Math.min(Math.max(num, 0), 100);
}