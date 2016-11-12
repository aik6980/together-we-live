module Objects{

    export class Spawner extends Phaser.Sprite{

        constructor(game : Phaser.Game, x: number, y: number){
            super(game, x, y, game.cache.getBitmapData('unit_white'));

            this.tint = Phaser.Color.getColor(0,0,64);
        }

        update(){
            
        }
    }

    export class Spawn_System
    {
        game_state : State.Game_state;

        constructor(game_state: State.Game_state){
            this.game_state = game_state;
        }

        public spawn(){
            var spawn_point : Objects.Spawner = this.game_state.spawner.getRandom();
            //console.log(spawn_point);
            this.game_state.pandas.add(this.game_state.spawnPanda(spawn_point.x, spawn_point.y));
        }
    }
}