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
            
            /*
            //create sample ghost srpite
            var sprite = this.game.add.sprite(200, 200, 'ghosts');
            sprite.animations.add('down', [0,1,2]);
            sprite.animations.add('left', [3,4,5]);
            sprite.animations.add('right', [6,7,8]);
            sprite.animations.add('up', [9,10,11]);
            sprite.animations.play('right', 5, true);
            this.game.add.tween(sprite).to({ x: this.game.width }, 10000, Phaser.Easing.Linear.None, true);
            */

            this.pandas = this.game.add.group();
            this.colliders = this.add.group();
            global_colliders = this.colliders;

            // create runner player
            this.runner = new Objects.Runner(this.game, 80, 60, 150);
            this.game.add.existing(this.runner);
            this.game.physics.arcade.enable(this.runner);

            // create gunner player
            this.gunner = new Objects.Gunner(this.game, this.world.centerX, this.world.centerY);
            this.game.add.existing(this.gunner);
            this.game.physics.arcade.enable(this.gunner);
            this.gunner.filters = [this.gray_filter];

            this.level = new Level.Level(this.game);
            this.level.load(this);


            //Setup Controls
            //Runner and Gunner now have their controls define individually

            //dev controls
            if (this.devMode)
                this.changeAllPandasState(null, "sleepy");
            ///num keys to change all the pandas states?
                this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onUp.add(this.changeAllPandasState, this, null, "hostile");
                this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onUp.add(this.changeAllPandasState, this, null, "stunned");
                this.game.input.keyboard.addKey(Phaser.Keyboard.NINE).onUp.add(this.changeAllPandasState, this, null, "rescued");
                this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onUp.add(this.changeAllPandasState, this, null, "attached");
                this.game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onUp.add(this.changeAllPandasState, this, null, "sleepy");
        }

        update(){
            this.level.update_game_state(this);

            //collisions
            this.game.physics.arcade.overlap(this.runner, this.pandas, this.runner.collidePanda, null, this); 
            this.game.physics.arcade.overlap(this.gunner, this.pandas, this.gunner.collidePanda, null, this);
            this.game.physics.arcade.collide(this.runner, this.gunner, this.runner.collideGunner, null, this); 
            //bullet collissions
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.pandas, this.shotPanda, null, this);
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.runner, this.shotRunner, null, this);
        }


        render(){
            if (this.devMode)
                //this.game.debug.bodyInfo(this.runner, 32, 32);
                this.game.debug.body(this.gunner);
                this.game.debug.body(this.runner);

                this.pandas.forEach(panda => {
                    this.game.debug.body(panda);                    
                }, null, true);
                
                /*this.pandas.forEach()
                this.pandas.forEachAlive(renderGroup, this);{
                    function renderGroup(member){
                        this.game.debug.body(member);
                    }
                }*/
        }

        shotPanda(bullet, panda)
        {
            bullet.kill();            
            panda.stun();
        }

        shotRunner(bullet, arunner){
            bullet.kill();
            this.runner.changeState("shot");
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
    }
}

//Global Functions
function moveToTarget(source: Phaser.Sprite, target: Phaser.Point, distance: number, speed: number){
    var gospeed = speed || 50
    
    source.body.velocity.x = target.x - source.body.position.x;
    source.body.velocity.y = target.y - source.body.position.y;
    
    if (source.body.velocity.x > distance || source.body.velocity.x < -distance ||
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
