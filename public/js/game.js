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
            // level progression
            this.current_scale = 1.0;
            this.game = game;
        }
        Level.prototype.create_game_state_object = function (object, game_state) {
            var x = object.x + this.map.tileWidth / 2;
            var y = object.y - this.map.tileHeight / 2;
            switch (object.type) {
                case 'gunner':
                    // create gunner player
                    game_state.gunner = new Objects.Gunner(this.game, x, y);
                    game_state.world_objects.add(game_state.gunner);
                    this.game.physics.arcade.enable(game_state.gunner);
                    //this.gunner.filters = [this.gray_filter];
                    break;
                case 'runner':
                    // create runner player
                    game_state.runner = new Objects.Runner(this.game, x, y, 150);
                    game_state.world_objects.add(game_state.runner);
                    this.game.physics.arcade.enable(game_state.runner);
                    break;
                case 'spawn_panda':
                    game_state.pandas.add(game_state.spawnPanda(x, y));
                    break;
            }
        };
        Level.prototype.update_game_state = function (game_state) {
            // collision with world
            this.game.physics.arcade.collide(game_state.colliders, this.collision_layer);
            this.game.camera.follow(game_state.gunner);
        };
        Level.prototype.changeWorldScale = function (scale, game_state) {
            var tween = this.game.add.tween(this).to({ current_scale: scale }, 2000, Phaser.Easing.Exponential.InOut, true, 0, 0, false);
            tween.onUpdateCallback(function () {
                //console.log(this);
                this.collision_layer.setScale(this.current_scale);
                game_state.world_objects.scale.setTo(this.current_scale);
                game_state.world_objects.forEach(function (sprite) {
                    if (sprite.body != null) {
                        sprite.body.setSize(sprite.width * game_state.world_objects.scale.x, sprite.height * game_state.world_objects.scale.y);
                    }
                }, this);
            }, this);
        };
        Level.prototype.load = function (game_state) {
            this.game.world.setBounds(-4500, -4500, 9000, 9000);
            // create tile map
            this.map = this.game.add.tilemap('world');
            this.map.addTilesetImage('tiny32', 'world_tileset');
            // create layers
            this.collision_layer = this.map.createLayer('collision');
            this.collision_layer.resize(2048, 2048);
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
            this.collision_layer.debug = true;
            //this.game.world.scale.setTo(1.5);
            //this.collision_layer.setScale(1.5);
            //game_state.world_objects.scale.setTo(1.5);
            //game_state.world_objects.forEach(function(sprite : Phaser.Sprite){
            //    sprite.body.setSize(sprite.width * game_state.world_objects.scale.x,  sprite.height * game_state.world_objects.scale.y);
            //});
            ///game_state.gunner.scale.setTo(1.5);
            //game_state.runner.scale.setTo(1.5);
            //this.changeWorldScale(0.5, game_state);
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
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            this.body.immovable = true; //stop shoving the gunner!
            this.recruits = this.game.add.group();
            this.anchors = this.game.add.group();
            this.anchor.setTo(0.5, 0.5);
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
            // rotate the ring
            this.anchors.forEach(function (anchor) {
                anchor.angle += 1;
            }, null, true);
        };
        Gunner.prototype.collidePanda = function (gunner, panda) {
            switch (panda.state) {
                case "hostile":
                    gunner.die(); //lose 1 life
                    break;
                case "attached":
                    gunner.rescuePanda(panda);
                    break;
                default:
            }
        };
        Gunner.prototype.die = function () {
            console.log("gunner is dying (lose 1 life)");
            this.kill();
        };
        Gunner.prototype.rescuePanda = function (panda) {
            panda.rescue();
            this.recruits.add(panda);
            var anchor = this.game.add.sprite(0, 0);
            this.anchors.add(anchor);
            anchor.x = this.x - this.width / 2;
            anchor.y = this.y - this.height / 2;
            anchor.anchor.setTo(0.5);
            panda.target = anchor.worldPosition;
            this.refreshRing();
        };
        Gunner.prototype.removePanda = function (panda) {
            this.recruits.remove(panda);
            this.anchors.removeChildAt(0);
            panda.kill();
            this.refreshRing();
        };
        Gunner.prototype.refreshRing = function () {
            var _this = this;
            var count = this.recruits.countLiving();
            if (count <= 4) {
                this.ring_radius = 20;
            }
            else {
                var ring_space = 30;
                this.ring_radius = count * ring_space / (2 * Math.PI);
            }
            console.log(this.ring_radius);
            var rotation_unit = 360.0 / count;
            var current_rotation = 0;
            this.anchors.forEach(function (anchor) {
                anchor.pivot.x = _this.ring_radius;
                anchor.angle = current_rotation;
                current_rotation += rotation_unit;
            }, null, true);
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
            this.animations.add('stunned', [1, 2]);
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
            this.animations.play('stunned', 10, true);
            this.alpha = 0.8;
        };
        Panda.prototype.update_attached = function () {
            //follow the leader! 
            moveToTarget(this, this.attachedTo.position, 20, null);
        };
        Panda.prototype.update_rescued = function () {
            //follow the gunner's anchor position
            moveToTarget(this, this.target, 0, 100);
        };
        Panda.prototype.update_sleepy = function () {
            //stay perfectly still (might also be hidden)
            this.attachedTo = null; //break attachment
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
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            //this.myGunner = myGunner;
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
                case "shot":
                    this.changeState("warping");
                    break;
                case "scared":
                    this.changeState("warping");
                    break;
                case "alive":
                    this.movement();
                    break;
                case "warping":
                    //blue and fly to turret home.
                    moveToTarget(this, this.myGunner.position, 0, 300);
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
                case "shot":
                    //play sound "ARRRRGH"
                    this.tint = Phaser.Color.getColor(255, 10, 0); //dirty red)
                    break;
                case "scared":
                    //play sound "EEEEEEEK"
                    this.tint = Phaser.Color.getColor(0, 30, 200); //light blue-green (pale with fright?)
                    this.alpha = 0.6;
                    break;
                case "alive":
                    this.tint = Phaser.Color.getColor(100, 50, 0); //brown??
                    setCollisionWithWalls(this, true);
                    this.alpha = 1.0;
                    break;
                case "warping":
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
            if (runner.state == "warping") {
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
            //create pandas group
            this.pandas = this.game.add.group();
            this.colliders = this.game.add.group();
            global_colliders = this.colliders;
            // world scaling helper
            this.world_objects = this.game.add.group();
            this.world_objects.add(this.pandas);
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
            this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onUp.add(this.changeAllPandasState, this, null, "rescued");
            this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onUp.add(this.changeAllPandasState, this, null, "attached");
            this.game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onUp.add(this.changeAllPandasState, this, null, "sleepy");
        };
        Game_state.prototype.changeWorldScale = function (args, scale) {
            this.level.changeWorldScale(scale, this);
        };
        Game_state.prototype.update = function () {
            this.level.update_game_state(this);
            ///Collisions
            //N.b. the player when "warping" is not checked for collision;
            //character collisions
            this.game.physics.arcade.overlap(this.runner, this.pandas, this.runner.collidePanda, function () { return this.runner.state != 'warping'; }, this);
            this.game.physics.arcade.overlap(this.gunner, this.pandas, this.gunner.collidePanda, null, this);
            this.game.physics.arcade.collide(this.runner, this.gunner, this.runner.collideGunner, null, this); //don't walk through the gunner
            //level collisions
            this.game.physics.arcade.collide(this.runner, this.level.collision_layer, null, function () { return this.runner.state != 'warping'; }, this);
            this.game.physics.arcade.collide(this.pandas, this.level.collision_layer);
            //bullet collisions
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.pandas, this.shotPanda, null, this);
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.runner, this.shotRunner, function () { return this.runner.state != 'warping'; }, this);
        };
        Game_state.prototype.render = function () {
            var _this = this;
            var debugBoundingBoxes = false;
            if (this.devMode)
                if (debugBoundingBoxes) {
                    //bounding boxes
                    this.game.debug.body(this.gunner);
                    this.game.debug.body(this.runner);
                    this.pandas.forEach(function (panda) {
                        _this.game.debug.body(panda);
                    }, null, true);
                }
            this.game.debug.text("Runner: " + this.runner.state, 10, 300);
        };
        Game_state.prototype.shotPanda = function (bullet, panda) {
            if (panda.state != "rescued") {
                bullet.kill();
                panda.stun();
            }
        };
        Game_state.prototype.shotRunner = function (runner, bullet) {
            //this is bizarre but documented - group vs sprite passes the callback parameters in the sprite first order.
            //The two objects will be passed to this function in the same order in which you specified them, unless you are checking Group vs. Sprite, in which case Sprite will always be the first parameter." 
            console.log(bullet, runner);
            bullet.kill();
            runner.changeState("shot");
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
        Game_state.prototype.createRescuedPanda = function () {
            var panda = this.spawnPanda(this.gunner.x - 40, this.gunner.y);
            this.gunner.rescuePanda(panda);
            //this.pandas.add(panda);
        };
        Game_state.prototype.removeOnPandaFromGunner = function () {
            var panda = this.gunner.recruits.getAt(0);
            this.gunner.removePanda(panda);
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
    if (distance == 0) {
        var magnitude_sqr = source.body.velocity.x * source.body.velocity.x + source.body.velocity.y * source.body.velocity.y;
        if (magnitude_sqr > 0) {
            var magnitude = Math.sqrt(magnitude_sqr);
            source.body.velocity.x *= gospeed / magnitude;
            source.body.velocity.y *= gospeed / magnitude;
        }
    }
    else if (source.body.velocity.x > distance || source.body.velocity.x < -distance ||
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