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
                    //game_state.world_objects.add(game_state.gunner.weapon);
                    game_state.world_objects.add(game_state.gunner.weapon.bullets);
                    //this.gunner.filters = [this.gray_filter];
                    //spawn the lives for the gunner
                    console.log("spawn lives *3 at set position");
                    game_state.spawnPandaInState(0, 0, "rescued");
                    game_state.spawnPandaInState(200, 50, "rescued");
                    game_state.spawnPandaInState(50, 200, "rescued");
                    console.log("lives Spawned *3 through game_state but not added to pandas group?");
                    game_state.spawn_system.spawnInState("rescued");
                    console.log("spawn one through system");
                    break;
                case 'runner':
                    // create runner player
                    game_state.runner = new Objects.Runner(this.game, x, y);
                    game_state.runner.myGunner = game_state.gunner;
                    game_state.world_objects.add(game_state.runner);
                    this.game.physics.arcade.enable(game_state.runner);
                    break;
                case 'spawn_panda':
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
            var tween = this.game.add.tween(this).to({ current_scale: scale }, 2000, Phaser.Easing.Linear.None, true, 0, 0, false);
            tween.onComplete.add(function () {
                //console.log(game_state.gunner);
            }, this);
            tween.onUpdateCallback(function () {
                //console.log(this);
                global_game_scale = this.current_scale;
                this.collision_layer.setScale(this.current_scale);
                this.art_layer.setScale(this.current_scale);
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
            this.art_layer = this.map.createLayer('art');
            this.art_layer.resize(2048, 2048);
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
            _super.call(this, game, x, y, 'ship');
            this.rotateSpeed = gameplay_gunner_baseTurnSpeed;
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
            this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
            this.weapon.bulletSpeed = 200;
            this.weapon.fireRate = 400;
        }
        Gunner.prototype.update = function () {
            var _this = this;
            if (this.left_button.isDown) {
                this.body.angularVelocity = -this.rotateSpeed;
            }
            else if (this.right_button.isDown) {
                this.body.angularVelocity = this.rotateSpeed;
            }
            else {
                this.body.angularVelocity = 0;
            }
            if (this.fire_button.isDown) {
                this.weapon.x = this.position.x;
                this.weapon.y = this.position.y;
                this.weapon.fireAtXY(this.weapon.x + Math.cos(this.body.rotation * Math.PI / 180.0), this.weapon.y + Math.sin(this.body.rotation * Math.PI / 180.0));
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
        Gunner.prototype.collidePanda = function (gunner, panda) {
            switch (panda.state) {
                case "hostile":
                    //release 1 recruit or gameover
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
            anchor.x = this.x - this.width / 4;
            anchor.y = this.y - this.height / 4;
            panda.target = new Phaser.Point();
            this.refreshRing();
        };
        Gunner.prototype.removePanda = function (panda) {
            var anchor = this.anchors.getAt(0);
            this.anchors.remove(anchor);
            console.log(panda);
            panda.kill();
            this.recruits.remove(panda);
            this.refreshRing();
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
            _super.call(this, game, x, y, 'ghosts');
            this.stuntime = 0; //stun time remaining
            this.stunlockcount = 0; //count of sequential stuns without being unstunned. Resets to 0 when unstunned.
            this.idle_time = 0;
            this.anchor.set(0.5, 0.5);
            this.game.physics.enable(this, Phaser.Physics.ARCADE); //enable physics on the newly created Panda
            setCollisionWithWalls(this, false); //panda ghosts can float through walls.
            //Animations
            this.animations.add('idle', [0]);
            this.animations.add('stunned', [1, 2]);
            this.animations.add('down', [0, 1, 2]);
            this.animations.add('left', [3, 4, 5]);
            this.animations.add('right', [6, 7, 8]);
            this.animations.add('up', [9, 10, 11]);
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
                case "sleepy":
                    this.update_sleepy();
                    break;
                default:
                    break;
            }
            if (this.state == "rescued" || (this.body.velocity.x == 0 && this.body.velocity.y == 0)) {
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
                    this.stuntime = gameplay_panda_stunTime;
                    this.stunlockcount = 1;
                    //this.game.time.events.add(this.stuntime, WRITEAfunc(), this)
                    //game
                    break;
                case "stunned":
                    this.stuntime += gameplay_panda_stunTime; //increase stun time and lockout
                    if (this.stunlockcount > gameplay_panda_stunLockCount) {
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
        function Runner(game, x, y) {
            _super.call(this, game, x, y, game.cache.getBitmapData('unit_white'));
            this.speed = gameplay_runner_baseSpeed;
            this.state = "alive";
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            this.changeState(this.state);
            this.cursors = this.game.input.keyboard.createCursorKeys();
            this.linked_pandas = new Phaser.LinkedList();
            this.linked_pandas.add(this); //add self at top of list
            this.anchor.setTo(0.5);
        }
        Runner.prototype.update = function () {
            this.body.velocity.setTo(0, 0); //reset runner movement (if no keys pressed will stop moving)
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
            var chainSlowDown = (1 - (this.linked_pandas.total - 1) / gameplay_runner_chainLengthSlowDown);
            if (chainSlowDown > gameplay_runner_chainMaxSlowDown)
                chainSlowDown = gameplay_runner_chainMaxSlowDown;
            chainSlowDown = 1; //overwrite for now
            var gospeed = this.speed * chainSlowDown;
            //Runner Movement
            //horizontal movement
            if (this.cursors.left.isDown)
                this.body.velocity.x = -gospeed;
            else if (this.cursors.right.isDown)
                this.body.velocity.x = gospeed;
            //vertical movement
            if (this.cursors.up.isDown)
                this.body.velocity.y = -gospeed;
            else if (this.cursors.down.isDown)
                this.body.velocity.y = gospeed;
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
                    this.tint = Phaser.Color.getColor(255, 10, 0); //dirty red)
                    break;
                case "scared":
                    //play sound "EEEEEEEK"
                    this.tint = Phaser.Color.getColor(0, 30, 200); //light blue-green (pale with fright?)
                    this.alpha = 0.6;
                    break;
                case "alive":
                    this.tint = Phaser.Color.getColor(100, 50, 0); //brown??
                    //setCollisionWithWalls(this, true); //see note below toggling this on runner had bizarre consequences!
                    this.speed = gameplay_runner_baseSpeed;
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
                this.game.time.events.add(gameplay_runner_prewarpTime, this.changeState, this, "warping"); //timer works but 2nd time runner dies stays dead
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
    var Spawner = (function (_super) {
        __extends(Spawner, _super);
        function Spawner(game, x, y) {
            _super.call(this, game, x, y, game.cache.getBitmapData('unit_white'));
            this.tint = Phaser.Color.getColor(0, 0, 64);
            //this.alpha = 0;
        }
        Spawner.prototype.update = function () {
        };
        return Spawner;
    }(Phaser.Sprite));
    Objects.Spawner = Spawner;
    var Spawn_System = (function () {
        function Spawn_System(game_state) {
            this.spawnRateMin = gameplay_pandas_spawnRateMin;
            this.spawnRateMax = gameplay_pandas_spawnRateMax;
            this.spawnLimit = gameplay_pandas_spawnLimit;
            this.spawnQuantity = gameplay_pandas_spawnQuantity; //how many to spawn at once (e.g. rush waves)
            this.spawnEnabled = false; //true;
            this.game_state = game_state;
        }
        Spawn_System.prototype.spawnCountdownStart = function () {
            var howlong = randomIntFromInterval(this.spawnRateMin, this.spawnRateMax);
            //console.log("spawnCountdown will start for " + howlong + " which is from the range " + this.spawnRateMin + "-" + this.spawnRateMax);
            this.game_state.time.events.add(howlong, this.spawnCountdownComplete, this);
        };
        Spawn_System.prototype.spawnCountdownComplete = function () {
            if (this.spawnEnabled) {
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
            if (this.game_state.pandas.total < gameplay_pandas_spawnLimit) {
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
            this.devMode = global_devMode;
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
            //Sounds
            //Videos
        };
        Game_state.prototype.create = function () {
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
            //dev controls
            if (this.devMode) {
                ///num keys to change all the pandas states?
                //this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onUp.add(this.changeAllPandasState, this, null, "hostile");
                //this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onUp.add(this.changeAllPandasState, this, null, "stunned");
                this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onUp.add(this.changeWorldScale, this, null, 2.0);
                this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onUp.add(this.changeWorldScale, this, null, 1.5);
                this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onUp.add(this.changeWorldScale, this, null, 1.0);
                this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR).onUp.add(this.changeWorldScale, this, null, 0.5);
                this.game.input.keyboard.addKey(Phaser.Keyboard.SIX).onUp.add(this.spawn_trigger, this, null);
                this.game.input.keyboard.addKey(Phaser.Keyboard.SEVEN).onUp.add(this.changeAllPandasState, this, null, "rescued");
                this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onUp.add(this.changeAllPandasState, this, null, "attached");
                this.game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onUp.add(this.changeAllPandasState, this, null, "sleepy");
                this.game.input.keyboard.addKey(Phaser.Keyboard.EIGHT).onUp.add(this.removeOnePandaFromGunner, this);
                this.game.input.keyboard.addKey(Phaser.Keyboard.PAGE_UP).onUp.add(this.winTheGame, this);
                this.game.input.keyboard.addKey(Phaser.Keyboard.PAGE_DOWN).onUp.add(this.loseTheGame, this);
                this.game.input.keyboard.addKey(Phaser.Keyboard.HOME).onUp.add(function () { this.spawn_system.spawnEnabled = true; }, this);
                this.game.input.keyboard.addKey(Phaser.Keyboard.END).onUp.add(function () { this.spawn_system.spawnEnabled = false; }, this);
            }
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
            ///DID YOU LOSE YET?
            if (this.gunner.recruits.length == 0) {
            }
            ////DID YOU WIN YET??
            if (this.gunner.recruits.length >= gameplay_gunner_winRecruits) {
                this.winTheGame();
                this.game.paused = true;
            }
            //character collisions
            this.game.physics.arcade.overlap(this.runner, this.pandas, this.runner.collidePanda, function () { return this.runner.state != 'warping'; }, this);
            this.game.physics.arcade.overlap(this.gunner, this.pandas, this.gunner.collidePanda, null, this);
            this.game.physics.arcade.collide(this.runner, this.gunner, this.runner.collideGunner, null, this); //don't walk through the gunner
            //level collisions
            this.game.physics.arcade.collide(this.runner, this.level.collision_layer, null, function () { return this.runner.state != 'warping'; }, this);
            //this.game.physics.arcade.collide(this.pandas, this.level.collision_layer); 
            if (this.pandas.length > 0) {
                this.game.physics.arcade.collide(this.pandas, this.level.collision_layer, null, function (panda, layer) {
                    if (panda.state == 'rescued') {
                        return false; //don't colide
                    }
                    else {
                        return true;
                    }
                }, this);
            }
            //bullet collisions
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.pandas, this.shotPanda, null, this);
            this.game.physics.arcade.overlap(this.gunner.weapon.bullets, this.runner, this.shotRunner, function () { return this.runner.state != 'warping'; }, this);
        };
        Game_state.prototype.render = function () {
            var _this = this;
            //Progress
            var progressText = "Rescued: " + this.gunner.recruits.length + " / " + gameplay_gunner_winRecruits;
            this.game.debug.text(progressText, 20, 0 + 20); //progress Text in top left
            var debugBoundingBoxes = false;
            if (this.devMode) {
                if (debugBoundingBoxes) {
                    //bounding boxes
                    this.game.debug.body(this.gunner);
                    this.game.debug.body(this.runner);
                    this.pandas.forEach(function (panda) {
                        _this.game.debug.body(panda);
                    }, null, true);
                    this.gunner.anchor;
                }
                //this.game.debug.text("object in world_objects: " + this.world_objects.total, 10, this.game.height - 60);
                this.game.debug.text("Spawner enabled: " + this.spawn_system.spawnEnabled, 10, this.game.height - 60);
                //this.game.debug.text("Gunner position" + this.gunner.x + ", "+ this.gunner.y, 10, this.game.height - 40);
                this.game.debug.text("Pandas in play: " + this.pandas.total, 10, this.game.height - 40);
                this.game.debug.text("Runner: " + this.runner.alive + " " + this.runner.state + " with " + (this.runner.linked_pandas.total - 1) + " pandas in tow.", 10, this.game.height - 20);
            }
            //this.game.debug.text("gunner: " + this.gunner.x + " " + this.gunner.y, 10, 280);
        };
        Game_state.prototype.winTheGame = function () {
            //(currently text not appearing for long though - need to change state, freeze the spawns etc)
            console.log("winTheGame()");
            var str = "YOU WON!!!!";
            this.game.debug.text(str, 250, 250);
            //this.game.add.text(this.game.width/2, this.game.height/2, winText);
            var style = { font: "65px Arial", fill: "#ff0044", align: "center" };
            var text = this.add.text(this.world.centerX, this.world.centerY, str, style);
            text.anchor.set(0.5);
        };
        Game_state.prototype.loseTheGame = function () {
            console.log("loseTheGame()");
            var str = "YOU\nBOTH\nLOST";
            this.game.debug.text(str, 250, 250);
            //this.game.add.text(this.game.width/2, this.game.height/2, winText);
            var style = { font: "65px Arial", fill: "#ff0044", align: "center" };
            var text = this.add.text(this.world.centerX, this.world.centerY, str, style);
            text.anchor.set(0.5);
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
            var pobj = new Objects.Panda(this.game, x, y, state);
            pobj.body.height = pobj.body.height * this.level.current_scale;
            pobj.body.width = pobj.body.width * this.level.current_scale;
            pobj.target = this.gunner.position; //pandas target the Gunner by default
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
var global_devMode = true;
//Gunner Gameplay
var gameplay_gunner_baseTurnSpeed = 300;
var gameplay_gunner_startingRecruits = 3;
var gameplay_gunner_winRecruits = 10; //number of pandas required to win
//Runner Gameplay
var gameplay_runner_baseSpeed = 150;
var gameplay_runner_chainLengthSlowDown = 5;
var gameplay_runner_chainMaxSlowDown = 0.7;
var gameplay_runner_prewarpTime = 1000; //how long to wait in shot/scared state before warping 
//Panda Gameplay
var gameplay_panda_baseSpeed = 100;
var gameplay_panda_stunTime = 5000;
var gameplay_panda_stunLockCount = 4; //if stunlocked x times without a break will be respawned elsewhere
var gameplay_pandas_spawnRateMin = 500;
var gameplay_pandas_spawnRateMax = 3000;
var gameplay_pandas_spawnLimit = 50; //max number of pandas spawned (should be >= the winRecruits)
var gameplay_pandas_hostileLimit = 20; //NOT IMPLEMENTED YET - would be a way to do pandas - recruits = hostiles and not too many spawned (though we don't despawn)
var gameplay_pandas_spawnQuantity = 1; //how many to spawn at once
//# sourceMappingURL=game.js.map