module State{
    export class Game_state extends Phaser.State{

        unit = 12;
        bmd_unit_white : Phaser.BitmapData;
        bmd_unit_black : Phaser.BitmapData;
        
        level : Array<string>;
        starty = 50;

        cursors : Phaser.CursorKeys;

        // Players
        runner : Objects.Runner;
        gunner : Objects.Gunner;

        // groups
        pandas : Phaser.Group;

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

            this.game.load.script('gray', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/Gray.js');
        }


        create(){
            var obj = null; //reused lots.

            this.gray_filter = this.game.add.filter('Gray');
            //gray.gray = 1.0;

            // create runner player
            this.runner = new Objects.Runner(this.game, 50, 50, 150);
            this.game.add.existing(this.runner);
            this.game.physics.arcade.enable(this.runner);
            //this.player.filters = [this.gray_filter];

            // create gunner player
            this.gunner = new Objects.Gunner(this.game, this.world.centerX, this.world.centerY);
            this.game.add.existing(this.gunner);
            this.game.physics.arcade.enable(this.gunner);

            //Setup groups
            this.pandas = this.game.add.group();
            
            //spawn some pandas
            obj = new Objects.Panda(this.game, 100, 100, "hostile");
            obj.name = "Aik"
            obj.target = this.gunner.position;
	        this.pandas.add(obj);
	        this.game.physics.enable(obj, Phaser.Physics.ARCADE);

            obj = new Objects.Panda(this.game, 150, 100, "hostile");
            obj.name = "Gavin"
            obj.target = this.gunner.position;
	        this.pandas.add(obj);
	        this.game.physics.enable(obj, Phaser.Physics.ARCADE);

            //Setup Controls
            this.cursors = this.input.keyboard.createCursorKeys();

    type pandaStates = "hostile" | "stunned" | "attached" | "rescued" | "sleepy";
            //dev controls
            ///num keys to change all the pandas states?
            this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onUp.add(this.changeAllPandasState, this, null, "hostile");
            this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onUp.add(this.changeAllPandasState, this, null, "stunned");
            this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onUp.add(this.changeAllPandasState, this, null, "rescued");
            this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onUp.add(this.changeAllPandasState, this, null, "attached");
            this.game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onUp.add(this.changeAllPandasState, this, null, "sleepy");
        }

        changeAllPandasState(args, state: string){
            console.log("Make all the pandas " + state, state);
            this.pandas.setAll('state', state);  
        }

        update(){
            //collisions
            this.game.physics.arcade.overlap(this.runner, this.pandas, this.runner.collidePanda, null, this);         
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.pandas, this.onPandaHit, null, this);

/*
            {
                this.weapon.fire();
                if(this.player.filters == null) this.player.filters = [this.gray_filter];
            }
*/

            var runnerSpeed = this.runner.speed;

            this.runner.body.velocity.setTo(0, 0) //reset runner movement (if no keys pressed will stop moving)

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

        onPandaHit(bullet, panda)
        {
            bullet.kill();            
            panda.changeState("stunned");
                    }
                    }
}