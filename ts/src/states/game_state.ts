module State{
    export class Game_state extends Phaser.State{

        unit = 16;
        bmd_unit_white : Phaser.BitmapData;
        bmd_unit_black : Phaser.BitmapData;
        
        starty = 50;

        // world
        level : Level.Level;

        devMode: boolean = true;

        // Players
        world_objects : Phaser.Group;
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
        }

        create(){
            var obj = null; //reused lots.

            this.gray_filter = this.game.add.filter('Gray');
            //gray.gray = 1.0;
            //create pandas group
            this.pandas = this.game.add.group();
            this.colliders = this.game.add.group();
            global_colliders = this.colliders;

            this.spawner = this.game.add.group();
            this.spawn_system = new Objects.Spawn_System(this);

            // world scaling helper
            this.world_objects = this.game.add.group();
            
            this.world_objects.add(this.pandas);
            this.world_objects.add(this.spawner);

            //create level
            this.level = new Level.Level(this.game);
            this.level.load(this);

            //dev controls
            if (this.devMode)
                this.changeAllPandasState(null, "sleepy");
            ///num keys to change all the pandas states?
            //this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onUp.add(this.changeAllPandasState, this, null, "hostile");
            //this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onUp.add(this.changeAllPandasState, this, null, "stunned");
            this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onUp.add(this.changeWorldScale, this, null, 2.0);
            this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onUp.add(this.changeWorldScale, this, null, 1.5);
            this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onUp.add(this.changeWorldScale, this, null, 1.0);
            this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR).onUp.add(this.changeWorldScale, this, null, 0.5);

            this.game.input.keyboard.addKey(Phaser.Keyboard.SIX).onUp.add(this.spawn_trigger, this, null);

            this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onUp.add(this.changeAllPandasState, this, null, "rescued");
            this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onUp.add(this.changeAllPandasState, this, null, "attached");
            this.game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onUp.add(this.changeAllPandasState, this, null, "sleepy");
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

            //character collisions
            this.game.physics.arcade.overlap(this.runner, this.pandas, this.runner.collidePanda, function(){ return this.runner.state != 'warping';}, this); 
            this.game.physics.arcade.overlap(this.gunner, this.pandas, this.gunner.collidePanda, null, this);
            this.game.physics.arcade.collide(this.runner, this.gunner, this.runner.collideGunner, null, this); //don't walk through the gunner

            //level collisions
            this.game.physics.arcade.collide(this.runner, this.level.collision_layer, null, function(){ return this.runner.state != 'warping';}, this);
            this.game.physics.arcade.collide(this.pandas, this.level.collision_layer);

            //bullet collisions
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.pandas, this.shotPanda, null, this);
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.runner, this.shotRunner, function(){ return this.runner.state != 'warping';}, this);
        }

        render(){
			
            var debugBoundingBoxes = true;
            if (this.devMode)

                if (debugBoundingBoxes){
                    //bounding boxes
                    this.game.debug.body(this.gunner);
                    this.game.debug.body(this.runner);

                    this.pandas.forEach(panda => {
                        this.game.debug.body(panda);                    
                    }, null, true);
                }

                this.game.debug.text("Runner: " + this.runner.state, 10, 300);
                this.game.debug.text("gunner: " + this.gunner.x + " " + this.gunner.y, 10, 280);
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
            var obj = new Objects.Panda(this.game, x, y, "hostile");
            obj.target = this.gunner;
            //console.log(obj.target);
            return obj;
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
            //this.pandas.add(panda);
        }

        removeOnPandaFromGunner()
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
function setCollisionWithWalls(entity, value : boolean)
{
    if (value)
        global_colliders.add(entity);
    else
        global_colliders.remove(entity);
}

////Global Gameplay variables

//Gunner Gameplay
var gameplay_gunner_baseTurnSpeed: number = 300;
var gameplay_gunner_startingPandaLives: number = 3;

//Runner Gameplay
var gameplay_runner_baseSpeed: number = 150;
var gameplay_runner_chainLengthSlowDown: number = 5;
var gameplay_runner_chainMaxSlowDown: number = 0.7; 

//Panda Gameplay
var gameplay_panda_baseSpeed: number = 100;
var gameplay_panda_stunTime: number = 5000;
var gameplay_panda_stunLockCount: number = 4; //if stunlocked x times without a break will be respawned elsewhere

var gameplay_pandas_spawnRateMin: number = 1000;
var gameplay_pandas_spawnRateMax: number = 3000;
var gameplay_pandas_maxEmbarrassment: number = 500; //maximum number of pandas

