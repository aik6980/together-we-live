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
            _super.call(this, 256, 256, Phaser.AUTO, 'content', null);
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
    var Enemy = (function (_super) {
        __extends(Enemy, _super);
        function Enemy(game, x, y) {
            _super.call(this, game, x, y, game.cache.getBitmapData('unit_white'));
            this.tint = Phaser.Color.getColor(215, 0, 0);
        }
        Enemy.prototype.update = function () {
        };
        return Enemy;
    }(Phaser.Sprite));
    Objects.Enemy = Enemy;
})(Objects || (Objects = {}));
//pandas are wondering the map, they can be friends, enemies, collectibles and lives
var Objects;
(function (Objects) {
    var Panda = (function (_super) {
        __extends(Panda, _super);
        function Panda(game, x, y, startState) {
            _super.call(this, game, x, y, game.cache.getBitmapData('unit_white'));
            this.state = startState;
            //game.physics.enable(this, Phaser.Physics.ARCADE); //does this work here?
        }
        Panda.prototype.attachTo = function (attachee) {
            console.log("Panda should get attachd to the attachee", attachee);
            this.changeState("attached");
        };
        Panda.prototype.changeState = function (targetState) {
            this.state = targetState;
        };
        Panda.prototype.update = function () {
            //state based colour changes
            switch (this.state) {
                case "hostile":
                    this.tint = Phaser.Color.getColor(255, 0, 0); //red
                    break;
                case "stunned":
                    this.tint = Phaser.Color.getColor(0, 255, 255); //yellow
                    break;
                case "attached":
                    this.tint = Phaser.Color.getColor(30, 10, 250); //blue
                    break;
                case "rescued":
                    this.tint = Phaser.Color.getColor(0, 255, 0); //green
                    break;
                case "sleepy":
                    this.tint = Phaser.Color.getColor(255, 255, 255); //white
                    break;
                default:
                    this.tint = Phaser.Color.getColor(50, 50, 50); //gray
            }
        };
        return Panda;
    }(Phaser.Sprite));
    Objects.Panda = Panda;
})(Objects || (Objects = {}));
var Objects;
(function (Objects) {
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(game, x, y) {
            //super(game, x, y, game.cache.getBitmapData('unit_white'));
            _super.call(this, game, x, y, 'ship');
            this.anchor.set(0.5);
        }
        Player.prototype.update = function () {
        };
        return Player;
    }(Phaser.Sprite));
    Objects.Player = Player;
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
            this.unit = 12;
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
            this.game.load.script('gray', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/Gray.js');
        };
        Game_state.prototype.create = function () {
            var obj = null; //reused lots.
            this.gray_filter = this.game.add.filter('Gray');
            //gray.gray = 1.0;
            this.weapon = this.game.add.weapon(30, 'bullet');
            this.weapon.bullets.filters = [this.gray_filter];
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
            //this.player.filters = [this.gray_filter];
            //Setup groups
            this.pandas = this.game.add.group();
            //spawn some pandas
            obj = new Objects.Panda(this.game, 100, 100, "stunned");
            obj.name = "Aik";
            this.pandas.add(obj);
            this.game.physics.enable(obj, Phaser.Physics.ARCADE);
            obj = new Objects.Panda(this.game, 150, 100, "hostile");
            obj.name = "Gavin";
            this.pandas.add(obj);
            this.game.physics.enable(obj, Phaser.Physics.ARCADE);
            //Setup Controls
            this.cursors = this.input.keyboard.createCursorKeys();
            //dev controls
            ///num keys to change all the pandas states?
            this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onUp.add(this.changeAllPandasState, this, null, "hostile");
            this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onUp.add(this.changeAllPandasState, this, null, "stunned");
            this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onUp.add(this.changeAllPandasState, this, null, "rescued");
            this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onUp.add(this.changeAllPandasState, this, null, "attached");
            this.game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onUp.add(this.changeAllPandasState, this, null, "sleepy");
        };
        Game_state.prototype.changeAllPandasState = function (args, state) {
            console.log("Make all the pandas " + state, state);
            this.pandas.setAll('state', state);
        };
        Game_state.prototype.update = function () {
            //collisions
            this.game.physics.arcade.overlap(this.runner, this.pandas, this.runner.collidePanda, null, this);
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
        return Game_state;
    }(Phaser.State));
    State.Game_state = Game_state;
})(State || (State = {}));
//# sourceMappingURL=game.js.map