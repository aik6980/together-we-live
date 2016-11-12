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
        Gunner.prototype.collidePanda = function (gunner, panda) {
            switch (panda.state) {
                case "hostile":
                    gunner.die(); //lose 1 life
                    break;
                case "attached":
                    panda.attachTo(gunner);
                    panda.changeState("rescued");
                    break;
                default:
            }
        };
        Gunner.prototype.die = function () {
            console.log("gunner is dying (lose 1 life)");
            this.kill();
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
            this.changeState(startState);
            //this.state = startState;
            //game.physics.enable(this, Phaser.Physics.ARCADE); //does this work here?
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
            console.log("Panda should get attached to the attachee (which should be the runner)", attachee);
            this.changeState("attached");
            this.attachedTo = attachee;
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
                moveToTarget(this, this.target, null);
            }
        };
        Panda.prototype.update_stunned = function () {
            //remain stunned for X seconds
            //wobble (tween)
        };
        Panda.prototype.update_attached = function () {
            //follow the leader! 
            moveToTarget(this, this.attachedTo.position, null);
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
            this.changeState(this.state);
            this.cursors = this.game.input.keyboard.createCursorKeys();
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
                    this.changeState("warpingHome");
                    break;
                case "alive":
                    this.movement();
                    break;
                case "warpingHome":
                    //blue and fly to turret home.
                    moveToTarget(this, new Phaser.Point(200, 200), 100);
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
                case "warpingHome":
                    //blue and fly to turret home.
                    this.tint = Phaser.Color.getColor(0, 0, 200); //blueish
                    break;
                default:
                    break;
            }
        };
        Runner.prototype.collidePanda = function (runner, panda) {
            console.log("I collided with a " + panda.state + " PANDA called " + panda.name);
            switch (panda.state) {
                case "hostile":
                    runner.changeState("scared");
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
            this.unit = 12;
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
            this.game.load.script('gray', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/Gray.js');
        };
        Game_state.prototype.create = function () {
            var obj = null; //reused lots.
            this.gray_filter = this.game.add.filter('Gray');
            //gray.gray = 1.0;
            // create runner player
            this.runner = new Objects.Runner(this.game, 50, 50, 150);
            this.game.add.existing(this.runner);
            this.game.physics.arcade.enable(this.runner);
            // create gunner player
            this.gunner = new Objects.Gunner(this.game, this.world.centerX, this.world.centerY);
            this.game.add.existing(this.gunner);
            this.game.physics.arcade.enable(this.gunner);
            this.gunner.filters = [this.gray_filter];
            //Setup groups
            this.pandas = this.game.add.group();
            //spawn some pandas
            this.pandas.add(this.spawnPanda(100, 100));
            this.pandas.add(this.spawnPanda(150, 100));
            //this.pandas.add(this.spawnPanda(150, 150));
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
        Game_state.prototype.changeAllPandasState = function (args, state) {
            this.pandas.forEachExists(function (panda) { panda.changeState(state); }, null);
            //this.pandas.setAll('state', state);
            console.log("Made all the pandas " + state);
        };
        Game_state.prototype.update = function () {
            //collisions
            this.game.physics.arcade.overlap(this.runner, this.pandas, this.runner.collidePanda, null, this);
            this.game.physics.arcade.overlap(this.gunner, this.pandas, this.gunner.collidePanda, null, this);
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.pandas, this.onPandaHit, null, this);
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.runner, this.onRunnerHit, null, this);
        };
        Game_state.prototype.onPandaHit = function (bullet, panda) {
            bullet.kill();
            panda.changeState("stunned");
        };
        Game_state.prototype.onRunnerHit = function (bullet, runner) {
            bullet.kill();
            this.runner.changeState("shot");
        };
        Game_state.prototype.spawnPanda = function (x, y) {
            var obj = new Objects.Panda(this.game, x, y, "hostile");
            //obj.name = random name
            obj.target = this.gunner.position;
            this.game.physics.enable(obj, Phaser.Physics.ARCADE);
            return obj;
        };
        return Game_state;
    }(Phaser.State));
    State.Game_state = Game_state;
})(State || (State = {}));
//Global Functions
function moveToTarget(source, target, speed) {
    var gospeed = speed || 50;
    source.body.velocity.x = target.x - source.body.position.x;
    source.body.velocity.y = target.y - source.body.position.y;
    /*
    console.log(source.body.velcocity, gospeed);
    
    var magnitude = source.body.velocity.getMagnitude();
    source.body.velocity.x *= gospeed / magnitude;
    source.body.velocity.y *= gospeed / magnitude;
    */
}
//# sourceMappingURL=game.js.map