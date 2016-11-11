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
var Objects;
(function (Objects) {
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(game, x, y) {
            //super(game, x, y, game.cache.getBitmapData('unit_white'));
            _super.call(this, game, x, y, 'ship');
            //this.anchor.set(0.5);
        }
        Player.prototype.update = function () {
        };
        return Player;
    }(Phaser.Sprite));
    Objects.Player = Player;
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
            this.bmd_unit_black = this.game.add.bitmapData(this.unit, this.unit);
            this.bmd_unit_black.context.fillStyle = 'rgba(128,128,128,128)';
            this.bmd_unit_black.context.fillRect(0, 0, 24, 24);
            this.game.cache.addBitmapData('unit_black', this.bmd_unit_black);
            this.game.load.image('bullet', 'assets/img/shmup-bullet.png');
            this.game.load.image('ship', 'assets/img/thrust_ship.png');
            this.game.load.image('grayscale', 'assets/img/gray.png');
            this.game.load.script('gray', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/Gray.js');
        };
        Game_state.prototype.create = function () {
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
            this.player = new Objects.Player(this.game, 50, 50); //this.add.sprite(400, 300, 'ship');
            this.game.add.existing(this.player);
            //this.player.blendMode = PIXI.blendModes.NORMAL;
            this.player.filters = [this.gray_filter];
            //var saturation = this.game.add.image(50,50,this.game.cache.getBitmapData('unit_black'));
            //saturation.blendMode = PIXI.blendModes.LIGHTEN;
            this.game.physics.arcade.enable(this.player);
            this.player.body.drag.set(70);
            this.player.body.maxVelocity.set(200);
            //  Tell the Weapon to track the 'player' Sprite
            //  With no offsets from the position
            //  But the 'true' argument tells the weapon to track sprite rotation
            this.weapon.trackSprite(this.player, 0, 0, true);
            this.cursors = this.input.keyboard.createCursorKeys();
            this.fire_button = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        };
        Game_state.prototype.update = function () {
            if (this.cursors.up.isDown) {
                this.game.physics.arcade.accelerationFromRotation(this.player.rotation, 300, this.player.body.acceleration);
            }
            else {
                this.player.body.acceleration.set(0);
            }
            if (this.cursors.left.isDown) {
                this.player.body.angularVelocity = -300;
            }
            else if (this.cursors.right.isDown) {
                this.player.body.angularVelocity = 300;
            }
            else {
                this.player.body.angularVelocity = 0;
            }
            if (this.fire_button.justDown) {
                this.weapon.fire();
                if (this.player.filters == null)
                    this.player.filters = [this.gray_filter];
                else
                    this.player.filters = null;
            }
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