var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SimpleGame;
(function (SimpleGame) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 500, 500, Phaser.AUTO, 'content', null);
            // add states
            this.state.add('game', new State.Game_state);
            this.state.start('game');
        }
        return Game;
    }(Phaser.Game));
    SimpleGame.Game = Game;
})(SimpleGame || (SimpleGame = {}));
window.onload = function () {
    var game = new SimpleGame.Game();
};
var Level;
(function (Level_1) {
    var Level = (function () {
        function Level(game) {
            this.game = game;
        }
        Level.prototype.create_game_state_object = function (object, game_state) {
            var x = object.x + this.map.tileWidth / 2;
            var y = object.y - this.map.tileHeight / 2;
            switch (object.type) {
                case 'spawn_panda':
                    console.log('panda');
                    game_state.pandas.add(game_state.spawnPanda(x, y));
                    break;
            }
        };
        Level.prototype.update_game_state = function (game_state) {
            // collision with world
            this.game.physics.arcade.collide(game_state.colliders, this.collision_layer);
        };
        Level.prototype.load = function (game_state) {
            // create tile map
            this.map = this.game.add.tilemap('world');
            this.map.addTilesetImage('tiny32', 'world_tileset');
            // create layers
            this.collision_layer = this.map.createLayer('collision');
            //var layer2 = this.map.createLayer('trigger');
            // setup collision tiles
            var collision_tiles = [];
            this.map.layers[0].data.forEach(function (data_row) {
                data_row.forEach(function (tile) {
                    if (tile.index > 0 && collision_tiles.indexOf(tile.index) === -1) {
                        collision_tiles.push(tile.index);
                    }
                });
            });
            // collision layer is at level 0 for now
            this.map.setCollision(collision_tiles, true, this.map.layers[0].name);
            // Setup groups
            for (var object_layer in this.map.objects) {
                if (this.map.objects.hasOwnProperty(object_layer)) {
                    // create layer objects
                    for (var i in this.map.objects[object_layer]) {
                        var object = this.map.objects[object_layer][i];
                        this.create_game_state_object(object, game_state);
                    }
                }
            }
        };
        return Level;
    }());
    Level_1.Level = Level;
})(Level || (Level = {}));
var Objects;
(function (Objects) {
    var Gunner = (function (_super) {
        __extends(Gunner, _super);
        function Gunner(game, x, y) {
            _super.call(this, game, x, y, 'ship');
            this.anchor.set(0.5);
            // init inputs
            this.fire_button = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
            this.left_button = this.game.input.keyboard.addKey(Phaser.KeyCode.A);
            this.right_button = this.game.input.keyboard.addKey(Phaser.KeyCode.D);
            // init physics            
            this.game.physics.arcade.enable(this);
            // init weapon            
            this.weapon = this.game.add.weapon(30, 'bullet');
            this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
            this.weapon.bulletSpeed = 200;
            this.weapon.fireRate = 200;
            this.weapon.trackSprite(this, 0, 0, true);
        }
        Gunner.prototype.update = function () {
            if (this.left_button.isDown) {
                this.body.angularVelocity = -300;
            }
            else if (this.right_button.isDown) {
                this.body.angularVelocity = 300;
            }
            else {
                this.body.angularVelocity = 0;
            }
            if (this.fire_button.isDown) {
                this.weapon.fire();
            }
        };
        Gunner.prototype.collidePanda = function (gunner, panda) {
            switch (panda.state) {
                case "hostile":
                    gunner.die(); //lose 1 life
                    break;
                case "attached":
                    panda.attachTo(gunner);
                    panda.rescue();
                    break;
                default:
            }
        };
        Gunner.prototype.die = function () {
            console.log("gunner is dying (lose 1 life)");
            this.kill();
        };
        Gunner.prototype.rescuePanda = function (panda) {
            this.recruits.add(panda);
            panda.rescue();
            this.refreshRing();
        };
        Gunner.prototype.refreshRing = function () {
            var ring_space = 50;
            this.ring_radius = ring_space / 2.0 / Math.PI;
        };
        return Gunner;
    }(Phaser.Sprite));
    Objects.Gunner = Gunner;
})(Objects || (Objects = {}));
//pandas are wondering the map, they can be friends, enemies, collectibles and lives
var Objects;
(function (Objects) {
    var Panda = (function (_super) {
        __extends(Panda, _super);
        function Panda(game, x, y, startState) {
            _super.call(this, game, x, y, 'ghosts' /*game.cache.getBitmapData('unit_white')*/);
            this.game.physics.enable(this, Phaser.Physics.ARCADE); //enable physics on the newly created Panda
            //animations
            //this.key = 'ghosts';
            this.animations.add('idle', [0, 1]);
            this.animations.add('down', [0, 1, 2]);
            this.animations.add('left', [3, 4, 5]);
            this.animations.add('right', [6, 7, 8]);
            this.animations.add('up', [9, 10, 11]);
            this.animations.play('idle', 20, true);
            //offset bounding box to be a little larger than the 30x32 sprite (also make it square)
            this.body.setSize(24, 24, 3, 4);
            this.changeState(startState);
            //this.state = startState;
            //game.physics.enable(this, Phaser.Physics.ARCADE); //does this work here?
            this.anchor.set(0.5, 0.5);
        }
        Panda.prototype.update = function () {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            switch (this.state) {
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
        };
        Panda.prototype.attachTo = function (attachee) {
            console.log("Panda get attached to the attachee: ", attachee);
            this.changeState("attached");
            this.attachedTo = attachee;
        };
        Panda.prototype.stun = function () {
            this.detachPanda(this);
            this.changeState("stunned");
        };
        Panda.prototype.rescue = function () {
            this.detachPanda(this);
            this.changeState("rescued");
        };
        Panda.prototype.changeState = function (targetState) {
            var prevState = this.state;
            this.state = targetState;
            switch (targetState) {
                case "hostile":
                    this.colorNum = Phaser.Color.getColor(255, 0, 0); //red
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
        };
        Panda.prototype.update_hostile = function () {
            if (this.target != null) {
                moveToTarget(this, this.target, 0, null);
            }
        };
        Panda.prototype.update_stunned = function () {
            //remain stunned for X seconds
            //wobble (tween)
        };
        Panda.prototype.update_attached = function () {
            //follow the leader! 
            moveToTarget(this, this.attachedTo.position, 20, null);
        };
        Panda.prototype.update_rescued = function () {
            //Party at the base
            this.body.velocity = [0, 0];
            this.kill(); //and for now die but actually circle the base in a group of RescuedPandas (remember these our the lives!)
        };
        Panda.prototype.update_sleepy = function () {
            //stay perfectly still
            this.body.velocity = [0, 0];
        };
        Panda.prototype.detachPanda = function (panda) {
            if (this.attachedTo != null) {
                (Object)(this.attachedTo).detachPanda(panda);
            }
        };
        return Panda;
    }(Phaser.Sprite));
    Objects.Panda = Panda;
})(Objects || (Objects = {}));
//The runner is the player that goes and collect
var Objects;
(function (Objects) {
    var Runner = (function (_super) {
        __extends(Runner, _super);
        function Runner(game, x, y, speed) {
            _super.call(this, game, x, y, game.cache.getBitmapData('unit_white'));
            this.speed = 100;
            this.state = "alive";
            //super(game.add.sprite(x, y, "ghosts"));
            this.changeState(this.state);
            this.cursors = this.game.input.keyboard.createCursorKeys();
            this.linked_pandas = new Phaser.LinkedList();
            this.linked_pandas.add(this);
            setCollisionWithWalls(this, true);
        }
        Runner.prototype.update = function () {
            this.body.velocity.setTo(0, 0); //reset runner movement (if no keys pressed will stop moving)
            //TODO Runner collission with walls?
            switch (this.state) {
                case "dead":
                    this.kill(); //die already!
                    break;
                case "shot": //shot or scared
                case "scared":
                    console.log("runner was " + this.state + " so will be warpingHome");
                    this.changeState("warpingHome");
                    break;
                case "alive":
                    this.movement();
                    break;
                case "warpingHome":
                    //blue and fly to turret home.
                    moveToTarget(this, new Phaser.Point(this.game.world.centerX, this.game.world.centerY), 0, 100);
                    break;
                default:
                    break;
            }
        };
        Runner.prototype.movement = function () {
            //Runner Movement
            //horizontal movement
            if (this.cursors.left.isDown)
                this.body.velocity.x = -this.speed;
            else if (this.cursors.right.isDown)
                this.body.velocity.x = this.speed;
            //vertical movement
            if (this.cursors.up.isDown)
                this.body.velocity.y = -this.speed;
            else if (this.cursors.down.isDown)
                this.body.velocity.y = this.speed;
        };
        Runner.prototype.changeState = function (targetState) {
            ///MORE work needed here
            var prevState = this.state;
            this.state = targetState;
            switch (targetState) {
                case "dead":
                    this.kill();
                    break;
                case "shot": //shot or scared
                case "scared":
                    console.log("I'm shot or scared and I'm actually " + targetState);
                    this.tint = Phaser.Color.getColor(240, 0, 30); //dirty red
                    break;
                case "alive":
                    this.tint = Phaser.Color.getColor(100, 50, 0); //brown??
                    setCollisionWithWalls(this, true);
                    break;
                case "warpingHome":
                    //blue and fly to turret home.
                    this.tint = Phaser.Color.getColor(0, 0, 200); //blueish
                    setCollisionWithWalls(this, false);
                    break;
                default:
                    break;
            }
        };
        Runner.prototype.collideGunner = function (runner, gunner) {
            console.log("runner collided with gunner while in state " + runner.state);
            if (runner.state == "warpingHome") {
                console.log("runner revived by warping home to gunner");
                runner.changeState("alive");
            }
        };
        Runner.prototype.collidePanda = function (runner, panda) {
            console.log("I collided with a " + panda.state + " PANDA called " + panda.name);
            switch (panda.state) {
                case "hostile":
                    runner.changeState("scared");
                    break;
                case "stunned":
                    runner.attachPanda(panda);
                    break;
                default:
            }
        };
        Runner.prototype.attachPanda = function (panda) {
            panda.attachTo(this.linked_pandas.last);
            this.linked_pandas.add(panda);
        };
        Runner.prototype.detachPanda = function (panda) {
            if (panda.next != null) {
                panda.next.attachTo(panda.prev);
            }
            this.linked_pandas.remove(panda);
        };
        Runner.prototype.die = function () {
            console.log("runner is dying");
            this.kill();
        };
        return Runner;
    }(Phaser.Sprite));
    Objects.Runner = Runner;
})(Objects || (Objects = {}));
var Objects;
(function (Objects) {
    var Wall = (function (_super) {
        __extends(Wall, _super);
        function Wall(game, x, y) {
            _super.call(this, game, x, y, game.cache.getBitmapData('unit_white'));
            this.tint = Phaser.Color.getColor(0, 0, 64);
        }
        Wall.prototype.update = function () {
        };
        return Wall;
    }(Phaser.Sprite));
    Objects.Wall = Wall;
})(Objects || (Objects = {}));
var State;
(function (State) {
    var Game_state = (function (_super) {
        __extends(Game_state, _super);
        function Game_state() {
            _super.apply(this, arguments);
            this.unit = 16;
            this.starty = 50;
            this.devMode = true;
        }
        Game_state.prototype.preload = function () {
            // create a bitmap data
            // http://phaser.io/examples/v2/bitmapdata/cached-bitmapdata
            this.bmd_unit_white = this.game.add.bitmapData(this.unit, this.unit);
            this.bmd_unit_white.context.fillStyle = 'rgb(255,255,255)';
            this.bmd_unit_white.context.fillRect(0, 0, 24, 24);
            this.game.cache.addBitmapData('unit_white', this.bmd_unit_white);
            this.game.load.image('bullet', 'assets/img/shmup-bullet.png');
            this.game.load.image('ship', 'assets/img/thrust_ship.png');
            // grayscale shader
            this.game.load.script('gray', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/Gray.js');
            this.game.load.tilemap('world', 'assets/data/world.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.image('world_tileset', 'assets/img/tiny32.png');
            //spritesheet
            this.game.load.spritesheet('ghosts', 'assets/img/tiny32_ghost.png', 30, 32);
        };
        Game_state.prototype.create = function () {
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
        };
        Game_state.prototype.update = function () {
            this.level.update_game_state(this);
            //collisions
            this.game.physics.arcade.overlap(this.runner, this.pandas, this.runner.collidePanda, null, this);
            this.game.physics.arcade.overlap(this.gunner, this.pandas, this.gunner.collidePanda, null, this);
            this.game.physics.arcade.collide(this.runner, this.gunner, this.runner.collideGunner, null, this);
            //bullet collissions
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.pandas, this.shotPanda, null, this);
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.runner, this.shotRunner, null, this);
        };
        Game_state.prototype.render = function () {
            var _this = this;
            if (this.devMode)
                //this.game.debug.bodyInfo(this.runner, 32, 32);
                this.game.debug.body(this.gunner);
            this.game.debug.body(this.runner);
            this.pandas.forEach(function (panda) {
                _this.game.debug.body(panda);
            }, null, true);
            /*this.pandas.forEach()
            this.pandas.forEachAlive(renderGroup, this);{
                function renderGroup(member){
                    this.game.debug.body(member);
                }
            }*/
        };
        Game_state.prototype.shotPanda = function (bullet, panda) {
            bullet.kill();
            panda.stun();
        };
        Game_state.prototype.shotRunner = function (bullet, arunner) {
            bullet.kill();
            this.runner.changeState("shot");
        };
        Game_state.prototype.spawnPanda = function (x, y) {
            var obj = new Objects.Panda(this.game, x, y, "sleepy");
            //obj.name = random name
            obj.target = this.gunner.position;
            //this.game.physics.enable(obj, Phaser.Physics.ARCADE);
            return obj;
        };
        Game_state.prototype.changeAllPandasState = function (args, state) {
            this.pandas.forEachExists(function (panda) { panda.changeState(state); }, null);
            //this.pandas.setAll('state', state);
            console.log("Made all the pandas " + state);
        };
        return Game_state;
    }(Phaser.State));
    State.Game_state = Game_state;
})(State || (State = {}));
//Global Functions
function moveToTarget(source, target, distance, speed) {
    var gospeed = speed || 50;
    source.body.velocity.x = target.x - source.body.position.x;
    source.body.velocity.y = target.y - source.body.position.y;
    if (source.body.velocity.x > distance || source.body.velocity.x < -distance ||
        source.body.velocity.y > distance || source.body.velocity.y < -distance) {
        //the GetMagnitude() velocity function was "not found" despite existing... so Hubert just rewrote it inline :)
        var magnitude = Math.sqrt(source.body.velocity.x * source.body.velocity.x + source.body.velocity.y * source.body.velocity.y);
        source.body.velocity.x *= gospeed / magnitude;
        source.body.velocity.y *= gospeed / magnitude;
    }
    else {
        source.body.velocity.x = 0;
        source.body.velocity.y = 0;
    }
}
var global_colliders;
function setCollisionWithWalls(entity, value) {
    if (value)
        global_colliders.add(entity);
    else
        global_colliders.remove(entity);
}
//# sourceMappingURL=game.js.map