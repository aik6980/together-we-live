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
var Objects;
(function (Objects) {
    var Coin = (function (_super) {
        __extends(Coin, _super);
        function Coin(game, x, y) {
            _super.call(this, game, x, y, game.cache.getBitmapData('unit_white'));
            this.tint = Phaser.Color.getColor(215, 215, 0);
        }
        Coin.prototype.update = function () {
        };
        return Coin;
    }(Phaser.Sprite));
    Objects.Coin = Coin;
})(Objects || (Objects = {}));
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
            _super.call(this, game, x, y, game.cache.getBitmapData('unit_white'));
            this.state = "hostile";
            this.state = startState;
            //game.physics.enable(this, Phaser.Physics.ARCADE); //does this work here?
        }
        Panda.prototype.attachTo = function (attachee) {
            console.log("Panda should get attachd to the attache", attachee);
            this.kill();
        };
        Panda.prototype.changeState = function (targetState) {
            this.state = targetState;
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        };
        Panda.prototype.update = function () {
            //state based colour changes
            switch (this.state) {
                case "hostile":
                    this.tint = Phaser.Color.getColor(255, 0, 0); //red
                    this.update_hostile();
                    break;
                case "stunned":
                    this.tint = Phaser.Color.getColor(0, 255, 255); //yellow
                    break;
                case "rescued":
                    this.tint = Phaser.Color.getColor(0, 255, 0); //green
                    break;
                default:
                    this.tint = Phaser.Color.getColor(255, 255, 255); //white
                    break;
            }
        };
        Panda.prototype.update_hostile = function () {
            if (this.target != null) {
                this.body.velocity.x = this.target.x - this.body.position.x;
                this.body.velocity.y = this.target.y - this.body.position.y;
                var magnitude = this.body.velocity.getMagnitude();
                this.body.velocity.x *= 50 / magnitude;
                this.body.velocity.y *= 50 / magnitude;
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
            //super(game, x, y, 'ship');
            this.tint = Phaser.Color.getColor(100, 50, 0);
            //this.anchor.set(0.5);
        }
        Runner.prototype.collidePanda = function (runner, panda) {
            console.log("I collided with a " + panda.state + " PANDA called " + panda.name);
            switch (panda.state) {
                case "hostile":
                    runner.die();
                    break;
                case "stunned":
                    panda.attachTo(runner);
                    break;
                default:
            }
        };
        Runner.prototype.die = function () {
            console.log("runner is dying");
            this.kill();
        };
        Runner.prototype.update = function () {
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
        };
        Game_state.prototype.create = function () {
            var obj = null; //reused lots.
            this.gray_filter = this.game.add.filter('Gray');
            //gray.gray = 1.0;
            // create tile map
            this.map = this.game.add.tilemap('world');
            this.map.addTilesetImage('tiny32', 'world_tileset');
            this.collision_layer = this.map.createLayer('collision');
            var layer2 = this.map.createLayer('trigger');
            // setup collision tiles
            var collision_tiles = [];
            this.map.layers[0].data.forEach(function (data_row) {
                data_row.forEach(function (tile) {
                    if (tile.index > 0 && collision_tiles.indexOf(tile.index) === -1) {
                        collision_tiles.push(tile.index);
                    }
                });
            });
            this.map.setCollision(collision_tiles, true, this.map.layers[0].name);
            // create runner player
            this.runner = new Objects.Runner(this.game, 35, 50, 150);
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
            obj.name = "Aik";
            obj.target = this.gunner.position;
            this.pandas.add(obj);
            this.game.physics.enable(obj, Phaser.Physics.ARCADE);
            obj = new Objects.Panda(this.game, 150, 100, "hostile");
            obj.name = "Gavin";
            obj.target = this.gunner.position;
            this.pandas.add(obj);
            this.game.physics.enable(obj, Phaser.Physics.ARCADE);
            //Setup Controls
            this.cursors = this.input.keyboard.createCursorKeys();
            //dev controls
            ///num keys to change all the pandas states?
            //  Here we create 3 hotkeys, keys 1-3 and bind them all to their own functions
            //listeners not working
            /*var key1, key2, key3;
            key1 = this.game.input.keyboard.addKey(Phaser.Keyboard.ONE);
            key1.onDown.*/
            //key1.onDown.add(changePandasState("hostile"), this);
            /*key2 = this.game.input.keyboard.addKey(Phaser.Keyboard.TWO);
            key2.onDown.add(changePandasState("stunned"), this);

            key3 = this.game.input.keyboard.addKey(Phaser.Keyboard.THREE);
            key3.onDown.add(changePandasState("rescued"), this);*/
            function changePandasState(state) {
                console.log("changing all the pandas to " + state);
                //this.pandas.callAllExists(changeState(state), true)
            }
        };
        Game_state.prototype.update = function () {
            //collisions
            this.game.physics.arcade.collide(this.runner, this.collision_layer);
            this.game.physics.arcade.overlap(this.runner, this.pandas, this.runner.collidePanda, null, this);
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.pandas, this.onPandaHit, null, this);
            /*
                        {
                            this.weapon.fire();
                            if(this.player.filters == null) this.player.filters = [this.gray_filter];
                        }
            */
            var runnerSpeed = this.runner.speed;
            this.runner.body.velocity.setTo(0, 0); //reset runner movement (if no keys pressed will stop moving)
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
        };
        Game_state.prototype.onPandaHit = function (bullet, panda) {
            bullet.kill();
            panda.changeState("stunned");
        };
        return Game_state;
    }(Phaser.State));
    State.Game_state = Game_state;
})(State || (State = {}));
var State;
(function (State) {
    var Menu_state = (function (_super) {
        __extends(Menu_state, _super);
        function Menu_state() {
            _super.apply(this, arguments);
        }
        return Menu_state;
    }(Phaser.State));
    State.Menu_state = Menu_state;
})(State || (State = {}));
//# sourceMappingURL=game.js.map