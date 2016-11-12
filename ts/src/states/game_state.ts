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
        runner : Objects.Runner;
        gunner : Objects.Gunner;

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
            
            // create gunner player (first as it is centre of the world)
            this.gunner = new Objects.Gunner(this.game, this.world.centerX, this.world.centerY);
            this.game.add.existing(this.gunner);
            this.gunner.filters = [this.gray_filter];

            // create runner player
            this.runner = new Objects.Runner(this.game, 80, 60, 150)
            this.runner.myGunner = this.gunner;
            this.game.add.existing(this.runner);
            
            
            //create pandas group
            this.pandas = this.game.add.group();

            //create level
            this.level = new Level.Level(this.game);
            this.level.load(this);


            //dev controls
            if (this.devMode)
                this.changeAllPandasState(null, "sleepy");
            ///num keys to change all the pandas states?
                this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onUp.add(this.changeAllPandasState, this, null, "hostile");
                this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onUp.add(this.changeAllPandasState, this, null, "stunned");
                this.game.input.keyboard.addKey(Phaser.Keyboard.NINE).onUp.add(this.changeAllPandasState, this, null, "rescued");
                //this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onUp.add(this.changeAllPandasState, this, null, "attached");
                this.game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onUp.add(this.changeAllPandasState, this, null, "sleepy");

                this.game.input.keyboard.addKey(Phaser.Keyboard.EIGHT).onUp.add(this.removeOnPandaFromGunner, this);

            // TEST for gunner
            //this.game.time.events.repeat(Phaser.Timer.SECOND, 30, this.createRescuedPanda, this);
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
            var debugBoundingBoxes = false;
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
        }

        shotPanda(bullet, panda)
        {
			            
			if (panda.state != "rescued")
            {
                bullet.kill();
                panda.stun();
            bullet.kill();        

        }
        }

        shotRunner(runner, bullet){
            //this is bizarre but documented - group vs sprite passes the callback parameters in the sprite first order.
            //The two objects will be passed to this function in the same order in which you specified them, unless you are checking Group vs. Sprite, in which case Sprite will always be the first parameter." 
            console.log(bullet, runner)
            bullet.kill();
            runner.changeState("shot");
        }

        spawnPanda(x, y){
            var obj = new Objects.Panda(this.game, x, y, "sleepy");
            //obj.name = random name
            obj.target = this.gunner.position;
            //this.game.physics.enable(obj, Phaser.Physics.ARCADE);
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
    
    source.body.velocity.x = target.x - source.body.position.x;
    source.body.velocity.y = target.y - source.body.position.y;
    
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
