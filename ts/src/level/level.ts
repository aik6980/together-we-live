module Level{
    export class Level{
        
        game : Phaser.Game;
        map : Phaser.Tilemap;

        // collision map
        collision_layer : Phaser.TilemapLayer;

        constructor(game : Phaser.Game){
            this.game = game;
        }

        public create_game_state_object(object, game_state : State.Game_state) {
            var x : number = object.x + this.map.tileWidth/2;
            var y : number = object.y - this.map.tileHeight/2;
            switch(object.type){
                case 'spawn_panda':
                console.log('panda');
                game_state.pandas.add(game_state.spawnPanda(x, y));
                break;
            }
        }

        public update_game_state(game_state : State.Game_state){
            // collision with world
            this.game.physics.arcade.collide(game_state.runner, this.collision_layer);
        }

        public load(game_state : State.Game_state){
             // create tile map
            this.map = this.game.add.tilemap('world');
            this.map.addTilesetImage('tiny32', 'world_tileset');

            // create layers
            this.collision_layer = this.map.createLayer('collision');
            //var layer2 = this.map.createLayer('trigger');
            
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
        }
    }
}