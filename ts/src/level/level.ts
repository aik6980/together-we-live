module Level{
    export class Level{
        
        game : Phaser.Game;
        map : Phaser.Tilemap;

        // collision map
        collision_layer : Phaser.TilemapLayer;

        art_layer : Phaser.TilemapLayer;

        // level progression
        current_scale = 1.0;

        constructor(game : Phaser.Game){
            this.game = game;
        }

        public create_game_state_object(object, game_state : State.Game_state) {
            var x : number = object.x + this.map.tileWidth/2;
            var y : number = object.y - this.map.tileHeight/2;
            switch(object.type){
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
                case 'spawn_panda':
                    //game_state.pandas.add(game_state.spawnPanda(x, y));
                    game_state.spawner.add(new Objects.Spawner(this.game, x, y));
                break;
            }
        }

        public update_game_state(game_state : State.Game_state){
            // collision with world
            this.game.physics.arcade.collide(game_state.colliders, this.collision_layer);

            this.game.camera.follow(game_state.gunner);
        }

        changeWorldScale(scale: number, game_state: State.Game_state){
            var tween = this.game.add.tween(this).to( { current_scale: scale }, 2000, Phaser.Easing.Exponential.InOut, true, 0, 0, false);

            tween.onUpdateCallback(function(){
                //console.log(this);
                global_game_scale = this.current_scale;
                this.collision_layer.setScale(this.current_scale);
                this.art_layer.setScale(this.current_scale);
                game_state.world_objects.scale.setTo(this.current_scale);
                
                var tracker = game_state.gunner 
                console.log(tracker.x, tracker.y);
                //we dont offset the weapon from gunner
                game_state.gunner.weapon.x = tracker.x
                game_state.gunner.weapon.y = tracker.y


                game_state.world_objects.forEach(function(sprite : Phaser.Sprite){
                    if(sprite.body != null){
                        sprite.body.setSize(sprite.width * game_state.world_objects.scale.x,  sprite.height * game_state.world_objects.scale.y);
                    }
                }, this);
                
                game_state.world_objects.forEach(function(group : Phaser.Group){
                    //console.log(group);
                    if(group.type == Phaser.GROUP)
                    {
                        group.forEach(function(sprite: Phaser.Sprite){
                            if(sprite.body != null){
                                sprite.body.setSize(sprite.width * game_state.world_objects.scale.x,  sprite.height * game_state.world_objects.scale.y);
                            }
                        }, this);
                    }
                }, this);

            }, this);
        }

        public load(game_state : State.Game_state){
            this.game.world.setBounds(-4500,-4500,9000,9000);
             // create tile map
            this.map = this.game.add.tilemap('world');
            this.map.addTilesetImage('tiny32', 'world_tileset');

            // create layers
            this.collision_layer = this.map.createLayer('collision');
            this.collision_layer.resize(2048,2048);

            this.art_layer = this.map.createLayer('art');
            this.art_layer.resize(2048,2048);
            
            // setup collision tiles
            var collision_tiles = [];
            this.map.layers[0].data.forEach(function(data_row){
                data_row.forEach(function(tile){
                    if(tile.index > 0 && collision_tiles.indexOf(tile.index) === -1){
                        collision_tiles.push(tile.index);
                    }
                });
            });
            // collision layer is at level 0 for now
            this.map.setCollision(collision_tiles, true, this.map.layers[0].name);

            // Setup groups
            for (let object_layer in this.map.objects) {
                if (this.map.objects.hasOwnProperty(object_layer)) {
                    // create layer objects
                    for(var i in this.map.objects[object_layer]){
                        var object = this.map.objects[object_layer][i];
                        this.create_game_state_object(object, game_state);
                    }
                }
            }
            //this.collision_layer.debug = true;

            //this.game.world.scale.setTo(1.5);
            //this.collision_layer.setScale(1.5);
            //game_state.world_objects.scale.setTo(1.5);
            //game_state.world_objects.forEach(function(sprite : Phaser.Sprite){
            //    sprite.body.setSize(sprite.width * game_state.world_objects.scale.x,  sprite.height * game_state.world_objects.scale.y);
            //});
            ///game_state.gunner.scale.setTo(1.5);
            //game_state.runner.scale.setTo(1.5);

            //this.changeWorldScale(0.5, game_state);
        }
    }
}