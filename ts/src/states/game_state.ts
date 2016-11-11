module State{
    export class Game_state extends Phaser.State{

        unit = 12;
        bmd_unit_white : Phaser.BitmapData;
        
        level : Array<string>;
        starty = 50;

        cursors : Phaser.CursorKeys;

        // Players
        runner : Objects.Runner;

        // groups
        pandas : Phaser.Group;

        /*
        spawn_point : Array<number>; 
        walls : Phaser.Group;
        coins : Phaser.Group;
        enemies : Phaser.Group; 
        */

        weapon : Phaser.Weapon;
        fire_button : Phaser.Key;

        preload(){
            // create a bitmap data
            // http://phaser.io/examples/v2/bitmapdata/cached-bitmapdata
            this.bmd_unit_white = this.game.add.bitmapData(this.unit, this.unit);
            this.bmd_unit_white.context.fillStyle = 'rgb(255,255,255)';
            this.bmd_unit_white.context.fillRect(0,0,24,24);
            
            this.game.cache.addBitmapData('unit_white', this.bmd_unit_white);

            this.game.load.image('bullet', 'assets/img/shmup-bullet.png');
            this.game.load.image('ship', 'assets/img/thrust_ship.png');
        }


        create(){
            var obj = null; //reused lots.

            this.weapon = this.game.add.weapon(30, 'bullet');

            //  The bullet will be automatically killed when it leaves the world bounds
            this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;

            //  The speed at which the bullet is fired
            this.weapon.bulletSpeed = 600;

            //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
            this.weapon.fireRate = 100;

            // create runner player
            this.runner = new Objects.Runner(this.game, 50, 50, 150);
            this.game.add.existing(this.runner);
            this.game.physics.arcade.enable(this.runner);

            //Setup groups
            this.pandas = this.game.add.group();
            
            //spawn some pandas
            obj = new Objects.Panda(this.game, 100, 100, "stunned");
            obj.name = "Aik"
	        this.pandas.add(obj);
	        this.game.physics.enable(obj, Phaser.Physics.ARCADE);

            obj = new Objects.Panda(this.game, 150, 100, "hostile");
            obj.name = "Gavin"
	        this.pandas.add(obj);
	        this.game.physics.enable(obj, Phaser.Physics.ARCADE);

            //Setup Controls
            this.cursors = this.input.keyboard.createCursorKeys();

            /*
            //dev controls
            ///num keys to change all the pandas states?
            //  Here we create 3 hotkeys, keys 1-3 and bind them all to their own functions
            //listeners not working
            var key1, key2, key3;
            key1 = this.game.input.keyboard.addKey(Phaser.Keyboard.ONE);
            key1.onDown.add(changePandasState("hostile"), this);

            key2 = this.game.input.keyboard.addKey(Phaser.Keyboard.TWO);
            key2.onDown.add(changePandasState("stunned"), this);

            key3 = this.game.input.keyboard.addKey(Phaser.Keyboard.THREE);
            key3.onDown.add(changePandasState("rescued"), this);


            function changePandasState(state: string){
                console.log("changing all the pandas to " + state);

                //this.pandas.callAllExists(changeState(state), true)
            }
            */

        }

        update(){
            //collisions
            this.game.physics.arcade.overlap(this.runner, this.pandas, this.runner.collidePanda, null, this);         


            //Runner movement
            var runnerSpeed = this.runner.speed;

            this.runner.body.velocity.setTo(0, 0) //reset player movement (if no keys pressed will stop moving)

            //horizontal movement
            if (this.cursors.left.isDown) 
                this.runner.body.velocity.x = -runnerSpeed;
            else if (this.cursors.right.isDown) 
                this.runner.body.velocity.x = runnerSpeed;

            //vertical movement
            if (this.cursors.up.isDown)
                this.runner.body.velocity.y = -runnerSpeed;
            else if (this.cursors.down.isDown)
                this.runner.body.velocity.y = runnerSpeed;

        }

        /*
        create(){
            this.cursors = this.game.input.keyboard.createCursorKeys();

            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.world.enableBody = true;

            this.game.stage.backgroundColor = '#3598db';

            this.level = [
                'xxxxxxxxxxxxxxxxxxxx',
                'x        !         x',
                'x                  x',
                'x s      o      o  x',
                'x                  x',
                '!    o ! x         x',
                'xxxxxxxxxx!!!xxx!xxx',
            ];

            // create level
            this.walls = this.game.add.group();
            this.coins = this.game.add.group();
            this.enemies = this.game.add.group();

            // create player
            obj = new Objects.Player(this.game, -this.unit, -this.unit);
            this.game.add.existing(obj);
            this.game.physics.enable(obj, Phaser.Physics.ARCADE);
            obj.body.gravity.y = 300;
            this.player = obj;
            
            for(var i=0; i<this.level.length; ++i){
                for(var j=0; j<this.level[i].length; ++j){

                    var obj = null;
                    if(this.level[i][j] == 's'){
                        this.spawn_point = [5+this.unit*j, this.starty+this.unit*i];
                    }

                    if(this.level[i][j] == 'x'){
                        obj = new Objects.Wall(this.game, 5+this.unit*j, this.starty+this.unit*i);
                        this.walls.add(obj);
                        this.game.physics.enable(obj, Phaser.Physics.ARCADE);
                        obj.body.immovable = true;
                    }

                    if(this.level[i][j] == 'o'){
                        obj = new Objects.Coin(this.game, 5+this.unit*j, this.starty+this.unit*i);
                        this.coins.add(obj);
                        this.game.physics.enable(obj, Phaser.Physics.ARCADE);
                        //obj.body.immovable = true;
                    }

                    if(this.level[i][j] == '!'){
                        obj = new Objects.Enemy(this.game, 5+this.unit*j, this.starty+this.unit*i);
                        this.enemies.add(obj);
                        this.game.physics.enable(obj, Phaser.Physics.ARCADE);
                    }
                }
            }

            this.spawn_player();
        }

        update(){
            this.game.physics.arcade.collide(this.player, this.walls);
            this.game.physics.arcade.overlap(this.player, this.coins, this.take_coin, null, this);
            this.game.physics.arcade.overlap(this.player, this.enemies, this.restart, null, this);

            // handle input
            if (this.cursors.left.isDown) 
                this.player.body.velocity.x = -100;
            else if (this.cursors.right.isDown) 
                this.player.body.velocity.x = 100;
            else 
                this.player.body.velocity.x = 0;

            // Make the player jump if he is touching the ground
            // this.player.body.touching => this flag is reset every frames
            if (this.cursors.up.isDown && this.player.body.touching.down) 
                this.player.body.velocity.y = -125;
        }

        spawn_player(){
            this.player.position.set(this.spawn_point[0], this.spawn_point[1]);
        }

        take_coin( player : Objects.Player, coin : Objects.Coin){
            coin.kill();
        }

        restart(){
            this.spawn_player();
        }
        */
    }
}