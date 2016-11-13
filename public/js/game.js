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
            _super.call(this, 512, 512, Phaser.AUTO, 'content', null);
            // add states
            this.state.add('menu', new State.Menu_state);
            this.state.add('game', new State.Game_state);
            this.state.start('menu');
        }
        return Game;
    }(Phaser.Game));
    SimpleGame.Game = Game;
})(SimpleGame || (SimpleGame = {}));
// the game
var google_font_active = false;
var global_music_volume = 0.3;
var global_sfx_volume = 0.5;
var game;
// The Google WebFont Loader will look for this object, so create it before loading the script.
var WebFontConfig = {
    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    active: function () {
        //console.log(game); 
        game.time.events.add(Phaser.Timer.SECOND, function () { google_font_active = true; }, this);
    },
    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
        families: ['Press Start 2P']
    }
};
window.onload = function () {
    game = new SimpleGame.Game();
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
                    //game_state.world_objects.add(game_state.gunner.weapon);
                    game_state.world_objects.add(game_state.gunner.weapon.bullets);
                    //this.gunner.filters = [this.gray_filter];
                    break;
                case 'runner':
                    // create runner player
                    game_state.runner = new Objects.Runner(this.game, x, y);
                    game_state.runner.myGunner = game_state.gunner;
                    game_state.world_objects.add(game_state.runner);
                    this.game.physics.arcade.enable(game_state.runner);
                    break;
                case 'spawn':
                    //game_state.pandas.add(game_state.spawnPanda(x, y));
                    game_state.spawner.add(new Objects.Spawner(this.game, x, y));
                    break;
            }
        };
        Level.prototype.update_game_state = function (game_state) {
            // collision with world
            this.game.physics.arcade.collide(game_state.colliders, this.collision_layer);
            this.game.camera.follow(game_state.gunner);
        };
        Level.prototype.changeWorldScale = function (scale, game_state) {
            var tween = this.game.add.tween(this).to({ current_scale: scale }, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
            tween.onComplete.add(function () {
                //console.log(game_state.gunner);
            }, this);
            tween.onUpdateCallback(function () {
                //console.log(this);
                global_game_scale = this.current_scale;
                this.collision_layer.setScale(this.current_scale);
                this.art_layer.setScale(this.current_scale);
                this.art_layer2.setScale(this.current_scale);
                game_state.world_objects.scale.setTo(this.current_scale);
                var tracker = game_state.gunner;
                //console.log(tracker.x, tracker.y);
                //we dont offset the weapon from gunner
                game_state.gunner.weapon.x = tracker.x;
                game_state.gunner.weapon.y = tracker.y;
                game_state.world_objects.forEach(function (sprite) {
                    if (sprite.body != null) {
                        // anchoring issue
                        // http://www.html5gamedevs.com/topic/22695-247-248-body-anchoring-any-migration-tips/
                        var a = sprite.width * game_state.world_objects.scale.x;
                        var b = sprite.height * game_state.world_objects.scale.y;
                        sprite.body.setSize(a, b, 0.5 * (sprite.width - a), 0.5 * (sprite.height - b));
                    }
                }, this);
                game_state.world_objects.forEach(function (group) {
                    //console.log(group);
                    if (group.type == Phaser.GROUP) {
                        group.forEach(function (sprite) {
                            if (sprite.body != null) {
                                var a = sprite.width * game_state.world_objects.scale.x;
                                var b = sprite.height * game_state.world_objects.scale.y;
                                sprite.body.setSize(a, b, 0.5 * (sprite.width - a), 0.5 * (sprite.height - b));
                            }
                        }, this);
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
            this.art_layer = this.map.createLayer('art-ground');
            this.art_layer.resize(2048, 2048);
            this.art_layer2 = this.map.createLayer('art-deco');
            this.art_layer2.resize(2048, 2048);
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
            //this.collision_layer.debug = true;
        };
        Level.prototype.add_gameobjects = function (game_state) {
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
            //super(game, x, y, 'ship');
            _super.call(this, game, x, y, 'gunner_turret');
            this.rotateSpeed = settings.gameplay.gunner.baseTurnSpeed;
            //bulletSpeed: number = ;
            this.fire_angle_offset = -90;
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            this.body.immovable = true; //stop shoving the gunner!
            this.recruits = this.game.add.group();
            this.anchors = this.game.add.group();
            AddToWorldObjects(this.recruits);
            AddToWorldObjects(this.anchors);
            this.anchor.setTo(0.5, 0.5);
            // init inputs
            this.fire_button = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
            this.left_button = this.game.input.keyboard.addKey(Phaser.KeyCode.A);
            this.right_button = this.game.input.keyboard.addKey(Phaser.KeyCode.D);
            // init physics            
            this.game.physics.arcade.enable(this);
            // init weapon based on powerLevel
            this.weapon = this.game.add.weapon(30, 'bullet');
            this.weapon.bulletLifespan = 2000; //2 seconds
            this.weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
            this.weapon.bulletSpeed = 200;
            this.weapon.fireRate = 400;
            this.weapon.onFire.add(function () {
                // play sound
                this.game.add.audio('Turret_Fire').play(null, null, global_sfx_volume);
            }, this);
        }
        Gunner.prototype.update = function () {
            var _this = this;
            if (this.force_target == null) {
                if (this.left_button.isDown) {
                    this.body.angularVelocity = -this.rotateSpeed;
                }
                else if (this.right_button.isDown) {
                    this.body.angularVelocity = this.rotateSpeed;
                }
                else {
                    this.body.angularVelocity = 0;
                }
            }
            else {
                var diff_x = this.force_target.x - this.x;
                var diff_y = this.force_target.y - this.y;
                var target_angle = -Math.atan2(-diff_y, diff_x) * 180.0 / Math.PI;
                var diff_angle = target_angle - (this.angle + this.fire_angle_offset);
                if (diff_angle > 180)
                    diff_angle -= 360;
                else if (diff_angle < -180)
                    diff_angle += 360;
                if (diff_angle > 5) {
                    this.body.angularVelocity = this.rotateSpeed;
                }
                else if (diff_angle < -5) {
                    this.body.angularVelocity = -this.rotateSpeed;
                }
                else {
                    this.body.angularVelocity = 0;
                }
            }
            if (!this.force_not_firing && this.fire_button.isDown) {
                this.fire();
            }
            // rotate the ring
            var index = 0;
            this.anchors.forEach(function (anchor) {
                anchor.angle += 1;
                var panda = _this.recruits.getAt(index++);
                panda.target.x = (anchor.worldPosition.x - _this.worldPosition.x) / global_game_scale + anchor.position.x;
                panda.target.y = (anchor.worldPosition.y - _this.worldPosition.y) / global_game_scale + anchor.position.y;
            }, null, true);
        };
        Gunner.prototype.fire = function () {
            var fire_angle = this.body.rotation + this.fire_angle_offset;
            this.weapon.x = this.position.x;
            this.weapon.y = this.position.y;
            this.weapon.fireAtXY(this.weapon.x + Math.cos(fire_angle * Math.PI / 180.0), this.weapon.y + Math.sin(fire_angle * Math.PI / 180.0));
        };
        Gunner.prototype.collidePanda = function (gunner, panda) {
            switch (panda.state) {
                case "hostile":
                    //release 1 recruit or gameover
                    if (gunner.recruits.total > 0) {
                        gunner.kidnapPandaWith(panda);
                    }
                    break;
                case "attached":
                    gunner.rescuePanda(panda);
                    break;
                default:
            }
        };
        Gunner.prototype.die = function () {
            console.log("gunner is dying (lose 1 life)");
            //
            //this.kill()
        };
        Gunner.prototype.rescuePanda = function (panda) {
            panda.rescue();
            this.recruits.add(panda);
            var anchor = this.game.add.sprite(0, 0);
            this.anchors.add(anchor);
            anchor.x = this.x; // - this.width / 2;
            anchor.y = this.y; // - this.height / 2;
            panda.target = new Phaser.Point();
            this.refreshRing();
            //when Panda rescued recall the setPowerLevel
        };
        Gunner.prototype.kidnapPandaWith = function (kidnapper) {
            var panda = this.getClosestRecruit(kidnapper.position);
            this.removePanda(panda);
            // pick offscreen direction
            var offscreen_dir_x = panda.x - kidnapper.x;
            var offscreen_dir_y = panda.y - kidnapper.y;
            var magnitude = Math.sqrt(offscreen_dir_x * offscreen_dir_x + offscreen_dir_y * offscreen_dir_y);
            if (magnitude > 0.0) {
                offscreen_dir_x /= magnitude;
                offscreen_dir_y /= magnitude;
            }
            else {
                var random_angle = this.game.rnd.angle();
                offscreen_dir_x = Math.cos(random_angle * Math.PI / 180.0);
                offscreen_dir_y = Math.sin(random_angle * Math.PI / 180.0);
            }
            // kidnapper go away
            kidnapper.changeState("released");
            kidnapper.target = new Phaser.Point(this.game.world.width * offscreen_dir_x, this.game.world.height * offscreen_dir_y);
            // lost panda go away together
            panda.changeState("released");
            panda.target = kidnapper.position;
            AddToWorldObjects(panda);
            AddToWorldObjects(kidnapper);
        };
        Gunner.prototype.removePanda = function (panda) {
            var anchor = this.anchors.getAt(0);
            this.anchors.remove(anchor);
            this.recruits.remove(panda);
            this.refreshRing();
        };
        Gunner.prototype.getClosestRecruit = function (target) {
            var closest_panda;
            var closest_distance;
            this.recruits.forEach(function (panda) {
                var diff_x = target.x - panda.x;
                var diff_y = target.y - panda.y;
                var distance = diff_x * diff_x + diff_y * diff_y;
                if (closest_panda == null || distance < closest_distance) {
                    closest_panda = panda;
                }
            }, null, true);
            return closest_panda;
        };
        Gunner.prototype.refreshRing = function () {
            var _this = this;
            if (this.recruits.total <= 4) {
                this.ring_radius = 20;
            }
            else {
                var ring_space = 30;
                this.ring_radius = this.recruits.total * ring_space / (2 * Math.PI);
            }
            var rotation_unit = 360.0 / this.recruits.total;
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
            _super.call(this, game, x, y, 'panda_happy');
            this.stuntime = 0; //stun time remaining
            this.stunlockcount = 0; //count of sequential stuns without being unstunned. Resets to 0 when unstunned.
            this.idle_time = 0;
            this.anchor.set(0.5, 0.5);
            this.game.physics.enable(this, Phaser.Physics.ARCADE); //enable physics on the newly created Panda
            setCollisionWithWalls(this, false); //panda ghosts can float through walls.
            /*
            //Animations
            this.animations.add('idle', [0]);
            this.animations.add('stunned', [1,2]);
            this.animations.add('down', [0,1,2]);
            this.animations.add('left', [3,4,5]);
            this.animations.add('right', [6,7,8]);
            this.animations.add('up', [9,10,11]);
            */
            this.animations.add('idle', [0]);
            this.animations.add('stunned', [0, 1]);
            this.animations.add('down', [2, 3, 4]);
            this.animations.add('left', [5, 6, 7]);
            this.animations.add('right', [8, 9, 10]);
            this.animations.add('up', [0, 1]);
            //offset bounding box to be a little larger than the 30x32 sprite (also make it square)
            //this.body.setSize(24, 24, 3, 4);
            this.changeState(startState);
        }
        Panda.prototype.update = function () {
            this.body.velocity = [0, 0]; //stop moving (there is no momentum)
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
                case "released":
                    this.update_released();
                    break;
                case "sleepy":
                    this.update_sleepy();
                    break;
                default:
                    break;
            }
            if (this.state == "rescued" || this.state == "released"
                || (this.body.velocity.x == 0 && this.body.velocity.y == 0)) {
                if (this.animations.currentAnim.name != 'idle') {
                    if (this.idle_time <= 0) {
                        this.play('idle', 20, true);
                    }
                    else {
                        this.idle_time -= this.game.time.elapsedMS;
                    }
                }
            }
            else if (this.state == "stunned") {
                if (this.animations.currentAnim.name != 'stun') {
                    this.play('stun', 20, true);
                }
            }
            else {
                this.idle_time = 500;
                var direction = Math.atan2(this.body.velocity.x, this.body.velocity.y);
                if (direction > 3 * Math.PI / 4 || direction < -3 * Math.PI / 4) {
                    if (this.animations.currentAnim.name != 'up') {
                        if (this.body.velocity.x == 0 ||
                            direction > 9 * Math.PI / 10 || direction < -9 * Math.PI / 10) {
                            this.play('up', 20, true);
                        }
                        else if (this.body.velocity.x < 0) {
                            if (this.animations.currentAnim.name != 'left') {
                                this.play('up', 20, true);
                            }
                        }
                        else {
                            if (this.animations.currentAnim.name != 'right') {
                                this.play('up', 20, true);
                            }
                        }
                    }
                }
                else if (direction > Math.PI / 4) {
                    if (this.animations.currentAnim.name != 'right') {
                        if (this.body.velocity.y == 0 ||
                            (direction > 4 * Math.PI / 10 && direction < 6 * Math.PI / 10)) {
                            this.play('right', 20, true);
                        }
                        else if (this.body.velocity.y < 0) {
                            if (this.animations.currentAnim.name != 'up') {
                                this.play('right', 20, true);
                            }
                        }
                        else {
                            if (this.animations.currentAnim.name != 'down') {
                                this.play('right', 20, true);
                            }
                        }
                    }
                }
                else if (direction < -Math.PI / 4) {
                    if (this.animations.currentAnim.name != 'left') {
                        if (this.body.velocity.y == 0 ||
                            (direction < -4 * Math.PI / 10 && direction > -6 * Math.PI / 10)) {
                            this.play('left', 20, true);
                        }
                        else if (this.body.velocity.y < 0) {
                            if (this.animations.currentAnim.name != 'up') {
                                this.play('left', 20, true);
                            }
                        }
                        else {
                            if (this.animations.currentAnim.name != 'down') {
                                this.play('left', 20, true);
                            }
                        }
                    }
                }
                else {
                    if (this.animations.currentAnim.name != 'down') {
                        if (this.body.velocity.x == 0 ||
                            (direction > Math.PI / -10 && direction < Math.PI / 10)) {
                            this.play('down', 20, true);
                        }
                        else if (this.body.velocity.x < 0) {
                            if (this.animations.currentAnim.name != 'left') {
                                this.play('down', 20, true);
                            }
                        }
                        else {
                            if (this.animations.currentAnim.name != 'right') {
                                this.play('down', 20, true);
                            }
                        }
                    }
                }
            }
        };
        Panda.prototype.attachTo = function (attachee) {
            this.changeState("attached");
            this.attachedTo = attachee;
        };
        Panda.prototype.stun = function () {
            this.detachPanda(this);
            switch (this.state) {
                case "hostile":
                    this.stuntime = settings.gameplay.panda.stunTime;
                    this.stunlockcount = 1;
                    //this.game.time.events.add(this.stuntime, WRITEAfunc(), this)
                    //game
                    break;
                case "stunned":
                    this.stuntime += settings.gameplay.panda.stunTime; //increase stun time and lockout
                    if (this.stunlockcount > settings.gameplay.panda.stunLockCount) {
                        console.log("why would you stun lock a panda??");
                        console.log("DESPAWN THE PANDA and maybe respawn one?");
                    }
                    else {
                        this.stunlockcount += 1;
                    }
                    break;
                default:
                    break;
            }
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
                    this.idle_time = 0.0;
                    this.colorNum = Phaser.Color.getColor(0, 255, 255); //yellow                   
                    break;
                case "attached":
                    this.colorNum = Phaser.Color.getColor(30, 10, 250); //blue
                    break;
                case "rescued":
                    this.idle_time = 0.0;
                    this.colorNum = Phaser.Color.getColor(0, 255, 0); //green
                    break;
                case "released":
                    this.idle_time = 0.0;
                    // keep color from previous state
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
        Panda.prototype.update_released = function () {
            //follow the target far away
            moveToTarget(this, this.target, 10, 100);
            // TODO
            // check offscreen for killing
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
        function Runner(game, x, y) {
            _super.call(this, game, x, y, 'runner');
            this.speed = settings.gameplay.runner.baseSpeed;
            this.state = "alive";
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            this.changeState(this.state);
            this.cursors = this.game.input.keyboard.createCursorKeys();
            this.linked_pandas = new Phaser.LinkedList();
            this.linked_pandas.add(this); //add self at top of list
            this.anchor.setTo(0.5);
            //Animations
            this.animations.add('idle', [0]);
            this.animations.add('left', [1]);
            this.animations.add('right', [2]);
            this.animations.add('down', [3]);
            this.animations.add('up', [0]);
            this.animations.add('idle', [0]);
        }
        Runner.prototype.update = function () {
            //this.game.debug.cameraInfo(this.game.camera, 32, 32);
            //this.game.debug.spriteInfo(this, 20, 200);
            this.body.velocity.setTo(0, 0); //reset runner movement (if no keys pressed will stop moving)
            if (!this.inCamera) {
                this.changeState('warping');
            }
            switch (this.state) {
                case "dead":
                    //console.log("the runner is dead?");
                    //this.die(); //die already!
                    break;
                case "alive":
                    this.movement();
                    break;
                case "warping":
                    moveToTarget(this, this.myGunner.position, 0, 300);
                    break;
                default:
                    break;
            }
        };
        Runner.prototype.movement = function () {
            var chainSlowDown = (1 - (this.linked_pandas.total - 1) / settings.gameplay.runner.chainLengthSlowDown);
            if (chainSlowDown > settings.gameplay.runner.chainMaxSlowDown)
                chainSlowDown = settings.gameplay.runner.chainMaxSlowDown;
            chainSlowDown = 1; //overwrite for now
            var gospeed = this.speed * chainSlowDown;
            var leftOrRight = 0; //-1 = left, 0 =none, +1 = right
            var upOrDown = 0; //-1 = Up, 0= none, +1 = down
            if (this.force_target == null) {
                //Runner movement
                if (this.cursors.left.isDown) {
                    leftOrRight = -1;
                }
                else if (this.cursors.right.isDown) {
                    leftOrRight = +1;
                }
                if (this.cursors.up.isDown) {
                    upOrDown = -1;
                }
                else if (this.cursors.down.isDown) {
                    upOrDown = +1;
                }
            }
            else {
                var diff_x = this.force_target.x - this.x;
                var diff_y = this.force_target.y - this.y;
                if (diff_x > 10)
                    leftOrRight = 1;
                else if (diff_x < -10)
                    leftOrRight = -1;
                if (diff_y > 10)
                    upOrDown = 1;
                else if (diff_y < -10)
                    upOrDown = -1;
            }
            this.body.velocity.x = gospeed * leftOrRight;
            this.body.velocity.y = gospeed * upOrDown;
            if (upOrDown == +1) {
                this.animations.play("up");
            }
            else if (upOrDown == -1 && leftOrRight == 0) {
                this.animations.play("down");
            }
            else if (leftOrRight == -1) {
                this.animations.play("left");
            }
            else if (leftOrRight == 1) {
                this.animations.play("right");
            }
            else {
                this.animations.play("idle");
            }
        };
        Runner.prototype.changeState = function (targetState) {
            var prevState = this.state;
            this.state = targetState;
            switch (targetState) {
                case "dead":
                    this.die();
                    break;
                case "shot":
                    //play sound "ARRRRGH"
                    this.game.add.audio('Turret_HitsHatter1').play(null, null, global_sfx_volume);
                    this.tint = Phaser.Color.getColor(255, 10, 0); //dirty red)
                    break;
                case "scared":
                    //play sound "EEEEEEEK"
                    this.tint = Phaser.Color.getColor(0, 30, 200); //light blue-green (pale with fright?)
                    this.alpha = 0.6;
                    break;
                case "alive":
                    this.tint = 0xFFFFFF; //removes tint
                    //setCollisionWithWalls(this, true); //see note below toggling this on runner had bizarre consequences!
                    this.speed = settings.gameplay.runner.baseSpeed;
                    this.alpha = 1;
                    break;
                case "warping":
                    //blue and fly to turret home (in update)
                    this.tint = Phaser.Color.getColor(0, 0, 200); //blueish
                    //////setCollisionWithWalls(this, false); //This broke it so bad! only the first warping would work! Now there is just a clause on the levelCollission to let warping pass. Error is something to do with it being or not being in a group and somehow no longer existing?? 
                    this.alpha = 0.3;
                    break;
                default:
                    break;
            }
            if (targetState == "shot" || targetState == "scared") {
                //console.log("prepare to warp!!!");
                this.game.time.events.add(settings.gameplay.runner.prewarpTime, this.changeState, this, "warping"); //timer works but 2nd time runner dies stays dead
            }
        };
        Runner.prototype.collideGunner = function (runner, gunner) {
            if (runner.state == "warping") {
                runner.changeState("alive");
            }
        };
        Runner.prototype.collidePanda = function (runner, panda) {
            switch (panda.state) {
                case "hostile":
                    if (runner.linked_pandas.total - 1 == 0) {
                        runner.changeState("scared");
                    }
                    else {
                        console.log(runner.linked_pandas.last);
                        runner.detachPanda(runner.linked_pandas.last);
                    }
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
    var Spawner = (function (_super) {
        __extends(Spawner, _super);
        function Spawner(game, x, y) {
            _super.call(this, game, x, y, game.cache.getBitmapData('unit_white'));
            this.tint = Phaser.Color.getColor(0, 0, 64);
            //this.alpha = 0;
            this.visible = false;
        }
        Spawner.prototype.update = function () {
        };
        return Spawner;
    }(Phaser.Sprite));
    Objects.Spawner = Spawner;
    var Spawn_System = (function () {
        function Spawn_System(game_state) {
            this.spawnRateMin = settings.gameplay.spawnsystem.spawnRateMin;
            this.spawnRateMax = settings.gameplay.spawnsystem.spawnRateMax;
            this.spawnLimit = settings.gameplay.spawnsystem.spawnLimit;
            this.spawnQuantity = settings.gameplay.spawnsystem.spawnQuantity; //how many to spawn at once (e.g. rush waves)
            this.autoSpawn = false; //true;
            this.game_state = game_state;
        }
        Spawn_System.prototype.spawnCountdownStart = function () {
            var howlong = randomIntFromInterval(this.spawnRateMin, this.spawnRateMax);
            //console.log("spawnCountdown will start for " + howlong + " which is from the range " + this.spawnRateMin + "-" + this.spawnRateMax);
            this.game_state.time.events.add(howlong, this.spawnCountdownComplete, this);
        };
        Spawn_System.prototype.spawnCountdownComplete = function () {
            if (this.autoSpawn) {
                this.spawnMany(this.spawnQuantity);
            }
            this.spawnCountdownStart();
        };
        Spawn_System.prototype.spawnMany = function (n) {
            var i = 1;
            while (i <= n) {
                this.spawn();
                i++;
            }
        };
        Spawn_System.prototype.spawnInState = function (state) {
            if (this.game_state.pandas.total < settings.gameplay.spawnsystem.spawnLimit) {
                var spawn_point = this.game_state.spawner.getRandom(); //pick a random spawnpoint
                this.game_state.pandas.add(this.game_state.spawnPandaInState(spawn_point.x, spawn_point.y, state));
            }
        };
        Spawn_System.prototype.spawn = function () {
            this.spawnInState("hostile");
        };
        return Spawn_System;
    }());
    Objects.Spawn_System = Spawn_System;
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
            //winState
            this.playState = "load";
            this.progressPercent = 0;
            this.peakProgressPercent = 0;
        }
        Game_state.prototype.preload = function () {
            //settings data file
            this.game.load.json('settings', 'assets/data/settings.json');
            // create a bitmap data
            // http://phaser.io/examples/v2/bitmapdata/cached-bitmapdata
            this.bmd_unit_white = this.game.add.bitmapData(this.unit, this.unit);
            this.bmd_unit_white.context.fillStyle = 'rgb(255,255,255)';
            this.bmd_unit_white.context.fillRect(0, 0, 24, 24);
            this.game.cache.addBitmapData('unit_white', this.bmd_unit_white);
            this.game.load.image('bullet', 'assets/img/shmup-bullet.png');
            this.game.load.image('ship', 'assets/img/thrust_ship.png');
            this.game.load.image('gunner_turret', 'assets/img/gunner_turret_40.png');
            // grayscale shader
            this.game.load.script('gray', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/Gray.js');
            this.game.load.tilemap('world', 'assets/data/world.json', null, Phaser.Tilemap.TILED_JSON);
            //this.game.load.image('world_tileset', 'assets/img/tiny32.png');
            this.game.load.image('world_tileset', 'assets/img/tiny32_coloured.png');
            //spritesheet
            //this.game.load.spritesheet('ghosts', 'assets/img/tiny32_ghost.png', 30, 32)
            this.game.load.spritesheet('panda_happy', 'assets/img/panda_happy32.png', 32, 32);
            this.game.load.spritesheet('runner', 'assets/img/runner_spritesheet.png', 22, 30);
            //this.game.load.spritesheet('ghosts', 'assets/img/runner_spritesheet.png', 22, 30);
            //Sounds
            //Videos
        };
        Game_state.prototype.create = function () {
            // play background music
            this.music = game.add.audio('Music_Together');
            this.music.loop = true;
            this.music.volume = global_music_volume;
            this.music.play();
            //load the settingsJSON and which is now referenced throughout instead of using global_variables.
            settings = this.game.cache.getJSON('settings');
            this.playState = "play";
            var obj = null; //reused lots.
            this.gray_filter = this.game.add.filter('Gray');
            //create level
            this.level = new Level.Level(this.game);
            this.level.load(this);
            //gray.gray = 1.0;
            //create pandas group
            this.pandas = this.game.add.group();
            this.colliders = this.game.add.group();
            global_colliders = this.colliders;
            this.spawner = this.game.add.group();
            this.spawn_system = new Objects.Spawn_System(this);
            console.log("this.spawn_system created ", this.spawn_system);
            /*//make 3 lives
            this.spawn_system.spawnInState("rescued");
            this.spawn_system.spawnInState("rescued");
            this.spawn_system.spawnInState("rescued");
            console.log("spawned 3 lives");*/
            this.spawn_system.spawnCountdownStart();
            // world scaling helper
            this.world_objects = this.game.add.group();
            global_world_objects = this.world_objects;
            this.world_objects.add(this.pandas);
            this.world_objects.add(this.spawner);
            this.level.add_gameobjects(this);
            this.start_demo();
            //dev controls
            if (settings.devMode) {
                ///num keys to change all the pandas states?
                //this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onUp.add(this.changeAllPandasState, this, null, "hostile");
                //this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onUp.add(this.changeAllPandasState, this, null, "stunned");
                this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onUp.add(this.changeWorldScale, this, null, 2.0);
                this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onUp.add(this.changeWorldScale, this, null, 1.0);
                this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onUp.add(this.changeWorldScale, this, null, 0.66);
                this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR).onUp.add(this.changeWorldScale, this, null, 0.5);
                this.game.input.keyboard.addKey(Phaser.Keyboard.SIX).onUp.add(this.spawn_trigger, this, null);
                this.game.input.keyboard.addKey(Phaser.Keyboard.SEVEN).onUp.add(this.rescueAllPandas, this, null);
                this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onUp.add(this.changeAllPandasState, this, null, "attached");
                this.game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onUp.add(this.changeAllPandasState, this, null, "sleepy");
                this.game.input.keyboard.addKey(Phaser.Keyboard.EIGHT).onUp.add(this.removeOnePandaFromGunner, this);
                this.game.input.keyboard.addKey(Phaser.Keyboard.PAGE_UP).onUp.add(this.winTheGame, this);
                this.game.input.keyboard.addKey(Phaser.Keyboard.PAGE_DOWN).onUp.add(this.loseTheGame, this);
                this.game.input.keyboard.addKey(Phaser.Keyboard.HOME).onUp.add(function () { this.spawn_system.autoSpawn = true; }, this);
                this.game.input.keyboard.addKey(Phaser.Keyboard.END).onUp.add(function () { this.spawn_system.autoSpawn = false; }, this);
            }
        };
        Game_state.prototype.start_demo = function () {
            var skip_demo = settings.skipDemo;
            if (skip_demo) {
                this.spawnPandaInState(0, 0, "rescued");
                this.spawnPandaInState(200, 50, "rescued");
                this.spawnPandaInState(50, 200, "rescued");
                return;
            }
            this.playState = "demo";
            //init
            this.gunner.force_not_firing = true;
            this.gunner.force_target = new Phaser.Point(this.gunner.position.x, this.gunner.position.y - 100);
            this.runner.force_target = new Phaser.Point(this.runner.position.x, this.runner.position.y);
            //spawn the lives for the gunner
            var panda1 = this.spawnPandaInState(this.gunner.x - 260, this.gunner.y, "hostile");
            this.pandas.add(panda1);
            var panda2 = this.spawnPandaInState(this.gunner.x - 50, this.gunner.y - 400, "hostile");
            this.pandas.add(panda2);
            var panda3 = this.spawnPandaInState(this.gunner.x + 100, this.gunner.y - 400, "hostile");
            this.pandas.add(panda3);
            // shot them            
            this.game.time.events.repeat(Phaser.Timer.SECOND * 2, 1, function () {
                // aim panda1
                this.gunner.force_target = panda1.position;
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 3, 1, function () {
                // stun it!
                this.gunner.fire();
                this.gunner.force_target = new Phaser.Point(this.gunner.force_target);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 3.6, 1, function () {
                // the runner try to catch it
                this.runner.force_target = new Phaser.Point(panda1.x, this.runner.y);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 4, 1, function () {
                // runner keep going and catch it
                this.runner.force_target = panda1.position;
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 4.2, 1, function () {
                // the runner starts to  bring it back
                this.runner.force_target = new Phaser.Point(this.gunner.x, this.gunner.y + 50);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 5, 1, function () {
                // bring it back safe
                this.runner.force_target = new Phaser.Point(this.gunner.x + 80, this.gunner.y);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 5.8, 1, function () {
                // panda2 is coming, aim it!
                this.gunner.force_target = panda2.position;
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 6.2, 1, function () {
                // stun it!
                this.gunner.fire();
                this.gunner.force_target = new Phaser.Point(this.gunner.force_target);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 6.8, 1, function () {
                // runner try to catch it
                this.runner.force_target = panda2.position;
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 7.2, 1, function () {
                // but wait.. panda3 is coming
                this.runner.force_target = new Phaser.Point(this.gunner.x + 80, this.gunner.y);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 7.5, 1, function () {
                // gunner aim panda3                
                this.gunner.force_target = panda3.position;
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 8, 1, function () {
                // stun it!
                this.gunner.fire();
                this.gunner.force_target = new Phaser.Point(this.gunner.force_target);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 9, 1, function () {
                // then runner can safely catch both of them
                this.runner.force_target = panda2.position;
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 10, 1, function () {
                // bring them back home
                this.runner.force_target = new Phaser.Point(this.gunner.position.x + 50, this.gunner.position.y + 10);
            }, this);
            this.game.time.events.repeat(Phaser.Timer.SECOND * 11, 1, function () {
                this.stop_demo();
            }, this);
            //ended
        };
        Game_state.prototype.stop_demo = function () {
            //this.game.time.events.removeAll();
            this.gunner.force_not_firing = false;
            this.gunner.force_target = null;
            this.runner.force_target = null;
            this.playState = "play";
        };
        Game_state.prototype.spawn_trigger = function (args) {
            this.spawn_system.spawn();
        };
        Game_state.prototype.changeWorldScale = function (args, scale) {
            this.level.changeWorldScale(scale, this);
        };
        Game_state.prototype.update = function () {
            this.level.update_game_state(this);
            ///Collisions
            //N.b. the player when "warping" is not checked for collision;        
            if (this.playState == "won" || this.playState == "lost") {
                this.spawn_system.autoSpawn = false; //disable spawns
            }
            if (this.playState == "tutorial") {
            }
            if (this.playState == "play") {
                this.updateProgress();
                ///DID YOU LOSE YET?
                if (this.progressPercent == 0) {
                }
                ////DID YOU WIN YET??
                if (this.progressPercent == 100) {
                    this.winTheGame();
                }
            }
            ;
            if (this.playState == "won") {
                this.rescueAllPandas();
            }
            //character collisions
            this.game.physics.arcade.overlap(this.runner, this.pandas, this.runner.collidePanda, function () { return this.runner.state != 'warping'; }, this);
            this.game.physics.arcade.overlap(this.gunner, this.pandas, this.gunner.collidePanda, null, this);
            this.game.physics.arcade.overlap(this.runner, this.gunner, this.runner.collideGunner, null, this); //don't walk through the gunner
            //level collisions
            this.game.physics.arcade.collide(this.runner, this.level.collision_layer, null, function () { return this.runner.state != 'warping'; }, this);
            //this.game.physics.arcade.collide(this.pandas, this.level.collision_layer); 
            this.game.physics.arcade.collide(this.pandas, this.level.collision_layer, null, function (panda, layer) {
                if (panda.state == 'rescued') {
                    return false; //don't colide
                }
                else {
                    return true;
                }
            }, this);
            //bullet collisions
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.pandas, this.shotPanda, null, this);
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.runner, this.shotRunner, function () { return this.runner.state != 'warping'; }, this);
        };
        Game_state.prototype.render = function () {
            var _this = this;
            //Progress
            var progressText = "Love: " + this.progressPercent + "%";
            this.game.debug.text(progressText, 20, 0 + 20); //progress Text in top left
            var debugBoundingBoxes = false;
            if (settings.devMode) {
                if (settings.debugBoundingBoxes) {
                    //bounding boxes
                    this.game.debug.body(this.gunner);
                    this.game.debug.body(this.runner);
                    this.pandas.forEach(function (panda) {
                        _this.game.debug.body(panda);
                    }, null, true);
                    this.gunner.anchor;
                }
                this.game.debug.text(this.playState, this.game.width - 40, 10); //top right playstate;
                //this.game.debug.text("object in world_objects: " + this.world_objects.total, 10, this.game.height - 60);
                this.game.debug.text("Spawner enabled: " + this.spawn_system.autoSpawn, 10, this.game.height - 60);
                //this.game.debug.text("Gunner position" + this.gunner.x + ", "+ this.gunner.y, 10, this.game.height - 40);
                this.game.debug.text("Pandas in play: " + this.pandas.total, 10, this.game.height - 40);
                this.game.debug.text("Runner: " + this.runner.alive + " " + this.runner.state + " with " + (this.runner.linked_pandas.total - 1) + " pandas in tow.", 10, this.game.height - 20);
            }
            //this.game.debug.text("gunner: " + this.gunner.x + " " + this.gunner.y, 10, 280);
        };
        Game_state.prototype.winTheGame = function () {
            this.playState = "won";
            var str = "YOU\nBOTH\nWON!!!!";
            var style = { font: "65px Arial", fill: "#ff0044", align: "center" };
            var text = this.add.text(this.gunner.position.x, this.gunner.position.y, str, style);
            text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
            text.anchor.set(0.5);
            AddToWorldObjects(text);
        };
        Game_state.prototype.loseTheGame = function () {
            this.playState = "lost";
            var str = "YOU\nBOTH\nLOST";
            var style = { font: "65px Arial", fill: "#ff0044", align: "center" };
            var text = this.add.text(this.gunner.position.x, this.gunner.position.y, str, style);
            text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
            text.anchor.set(0.5);
            AddToWorldObjects(text);
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
            bullet.kill();
            runner.changeState("shot");
        };
        Game_state.prototype.spawnPanda = function (x, y) {
            //spawn panda in default Hostile stance
            return this.spawnPandaInState(x, y, "hostile");
        };
        Game_state.prototype.spawnPandaInState = function (x, y, state) {
            var pobj;
            if (state == "rescued") {
                pobj = new Objects.Panda(this.game, x, y, "sleepy");
                this.gunner.rescuePanda(pobj);
            }
            else {
                pobj = new Objects.Panda(this.game, x, y, state);
                pobj.target = this.gunner.position; //pandas target the Gunner by default
            }
            // recalculate bounding box
            var a = pobj.width * this.world_objects.scale.x;
            var b = pobj.height * this.world_objects.scale.y;
            pobj.body.setSize(a, b, 0.5 * (pobj.width - a), 0.5 * (pobj.height - b));
            return pobj;
        };
        Game_state.prototype.changeAllPandasState = function (args, state) {
            this.pandas.forEachExists(function (panda) { panda.changeState(state); }, null);
            //this.pandas.setAll('state', state);
            console.log("Made all the pandas " + state);
        };
        Game_state.prototype.createRescuedPanda = function () {
            var panda = this.spawnPanda(this.gunner.x - 40, this.gunner.y);
            this.gunner.rescuePanda(panda);
        };
        Game_state.prototype.createHostilePanda = function () {
            var panda = this.spawnPanda(this.gunner.position.x + 300, this.gunner.position.y + 300);
            this.pandas.add(panda);
            panda.changeState("hostile");
        };
        Game_state.prototype.createFollowingPanda = function () {
            var panda = this.spawnPanda(this.runner.position.x, this.runner.position.y);
            this.pandas.add(panda);
            this.runner.attachPanda(panda);
        };
        Game_state.prototype.removeOnePandaFromGunner = function () {
            var panda = this.gunner.recruits.getAt(0);
            this.gunner.removePanda(panda);
            panda.kill();
        };
        Game_state.prototype.rescueAllPandas = function () {
            //rescue all remaining pandas
            if (this.pandas.length > 0) {
                this.pandas.forEach(function (panda) {
                    console.log("rescuing panda " + panda);
                    this.gunner.rescuePanda(panda);
                }, this);
            }
        };
        Game_state.prototype.startPlay = function () {
            //start playing the game after tutorial
            this.playState = "play";
            this.spawn_system.autoSpawn = true;
        };
        Game_state.prototype.updateProgress = function () {
            ///Update progress
            var prevProgressPercent = this.progressPercent;
            var newProgressPercent = Math.floor(this.gunner.recruits.length / settings.gameplay.gunner.winRecruits * 100);
            newProgressPercent = clamp(newProgressPercent, 0, 100); //clamp it 0-100
            this.progressPercent = newProgressPercent;
            this.peakProgressPercent = clamp(newProgressPercent, this.peakProgressPercent, 100); //increase (never decrease the peakProgressPercent);
            if (newProgressPercent > prevProgressPercent) {
                //console.log("you progressed from " + prevProgressPercent + " to " + newProgressPercent + " AND YOUR PEAK is " + this.peakProgressPercent);
                if (this.peakProgressPercent >= 70) {
                    this.changeWorldScale(this, 0.5);
                }
                else if (this.peakProgressPercent >= 50) {
                    this.changeWorldScale(this, 0.66);
                }
                else if (this.peakProgressPercent >= 40) {
                    this.changeWorldScale(this, 1.0);
                }
            }
        };
        return Game_state;
    }(Phaser.State));
    State.Game_state = Game_state;
})(State || (State = {}));
//Global Functions
function moveToTarget(source, target, distance, speed) {
    var gospeed = speed || 50;
    source.body.velocity.x = target.x - source.position.x;
    source.body.velocity.y = target.y - source.position.y;
    if (distance == 0) {
        var magnitude_sqr = source.body.velocity.x * source.body.velocity.x + source.body.velocity.y * source.body.velocity.y;
        if (magnitude_sqr > 0) {
            var magnitude = Math.sqrt(magnitude_sqr);
            source.body.velocity.x *= gospeed / magnitude;
            source.body.velocity.y *= gospeed / magnitude;
        }
        else {
            source.body.velocity.x = 0;
            source.body.velocity.y = 0;
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
function setCollisionWithWalls(object, value) {
    if (value)
        global_colliders.add(object);
    else
        global_colliders.remove(object);
}
var global_world_objects;
function AddToWorldObjects(object) {
    global_world_objects.add(object);
}
function RemoveFromWorldObjects(object) {
    global_world_objects.remove(object);
}
var global_game_scale = 1.0;
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
////Global Gameplay variables (Time units should be ms as the functions will divide by 1000)
var settings; //object loaded via json
function clamp(num, min, max) {
    return Math.min(Math.max(num, 0), 100);
}
var State;
(function (State) {
    var Menu_state = (function (_super) {
        __extends(Menu_state, _super);
        function Menu_state() {
            _super.apply(this, arguments);
            this.timer = 0;
            this.title_init = false;
        }
        Menu_state.prototype.preload = function () {
            //  Load the Google WebFont Loader script
            this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
            // load all character pictures
            for (var i = 0; i < 6; ++i) {
                this.game.load.image('logo' + i, 'assets/img/logo' + i + '.png');
            }
            this.title_init = false;
            // preload all sfx and music
            //  Firefox doesn't support mp3 files, so use ogg
            this.game.load.audio('Generic_ShortSpit_SFX', ['assets/snd/Generic_ShortSpit_SFX.ogg']);
            this.game.load.audio('Ghost_Merges_To_Turret', ['assets/snd/Ghost_Merges_To_Turret.ogg']);
            this.game.load.audio('Music_LayerBuildUp', ['assets/snd/Music_LayerBuildUp.ogg']);
            this.game.load.audio('Music_PrimaryLayerLoop', ['assets/snd/Music_PrimaryLayerLoop.ogg']);
            this.game.load.audio('Music_Together', ['assets/snd/Music_Together.ogg']);
            this.game.load.audio('Turret_Fire', ['assets/snd/Turret_Fire.ogg']);
            this.game.load.audio('Turret_HitsGhost2', ['assets/snd/Turret_HitsGhost2.ogg']);
            this.game.load.audio('Turret_HitsHatter1', ['assets/snd/Turret_HitsHatter1.ogg']);
            this.game.load.audio('Turret_HitsHatter2', ['assets/snd/Turret_HitsHatter2.ogg']);
            this.game.load.audio('Turret_HitsNothing', ['assets/snd/Turret_HitsNothing.ogg']);
        };
        Menu_state.prototype.create = function () {
            this.game.stage.backgroundColor = "#4488AA";
            // play background music
            this.music = game.add.audio('Music_LayerBuildUp');
            this.music.loop = true;
            this.music.volume = global_music_volume;
            this.music.play();
            // add character image
            for (var i = 0; i < 12; i++) {
                var logo = this.game.add.sprite(this.game.world.randomX, -150 + this.game.world.randomY, 'logo' + this.game.rnd.between(0, 5));
                logo.anchor.set(0.5);
                logo.scale.set(this.game.rnd.realInRange(0.8, 1.2));
                this.game.add.tween(logo).to({ y: "+300" }, 1000 + this.game.rnd.between(1000, 2000), "Bounce.easeOut", true, 0, -1, true);
            }
            // add text
            var bar = this.game.add.graphics(0, 0);
            bar.beginFill(0x000000, 0.2);
            bar.drawRect(0, this.game.height * 0.6, this.game.width, 50);
            var style = { font: "bold 18px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
            //  The Text is positioned at 0, 100
            this.text = this.game.add.text(0, 0, "press SPACE to start game", style);
            this.text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
            //  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
            this.text.setTextBounds(0, this.game.height * 0.6, this.game.width, 50);
            // press space bar to start the game
            this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onUp.add(this.changeState, this, null);
        };
        Menu_state.prototype.shutdown = function () {
            this.music.stop();
        };
        Menu_state.prototype.update = function () {
            // text blink
            this.timer += this.game.time.elapsed;
            if (this.timer > 400) {
                this.timer = 0;
                this.text.visible = !this.text.visible;
            }
            // add title
            if (google_font_active && !this.title_init) {
                this.title_init = true;
                //  You can either set the tab size in the style object:
                var style = { font: "42px Press Start 2P", fill: "#ddd" };
                var text = game.add.text(game.world.centerX, game.world.centerY * 0.2, "Love Gunner\n &\n Hat Runner", style);
                text.anchor.setTo(0.5);
                text.setShadow(-3, 3, 'rgba(0,0,0,0.5)', 0);
                text.align = 'center';
                //  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
                text.setTextBounds(0, this.game.height * 0.2, this.game.width, 200);
            }
        };
        Menu_state.prototype.render = function () {
        };
        Menu_state.prototype.changeState = function () {
            this.game.state.start('game');
        };
        return Menu_state;
    }(Phaser.State));
    State.Menu_state = Menu_state;
})(State || (State = {}));
//# sourceMappingURL=game.js.map