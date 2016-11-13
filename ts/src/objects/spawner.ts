module Objects{

    export class Spawner extends Phaser.Sprite{

        constructor(game : Phaser.Game, x: number, y: number){
            super(game, x, y, game.cache.getBitmapData('unit_white'));

            this.tint = Phaser.Color.getColor(0,0,64);
            //this.alpha = 0;

            this.visible = false;
        }

        update(){
            
        }
    }

    export class Spawn_System
    {
        game_state : State.Game_state;
        spawnRateMin: number = settings.gameplay.spawnsystem.spawnRateMin;
        spawnRateMax: number = settings.gameplay.spawnsystem.spawnRateMax;
        spawnLimit: number = settings.gameplay.spawnsystem.spawnLimit;
        spawnQuantity: number = settings.gameplay.spawnsystem.spawnQuantity; //how many to spawn at once (e.g. rush waves)
        autoSpawn: boolean = false;//true;

       

        constructor(game_state: State.Game_state){
            this.game_state = game_state;
        }

        public spawnCountdownStart(){
            var howlong = randomIntFromInterval(this.spawnRateMin, this.spawnRateMax);
            //console.log("spawnCountdown will start for " + howlong + " which is from the range " + this.spawnRateMin + "-" + this.spawnRateMax);
            this.game_state.time.events.add(howlong, this.spawnCountdownComplete, this);
        }

        public spawnCountdownComplete(){
            if (this.autoSpawn){ this.spawnMany(this.spawnQuantity); }
            this.spawnCountdownStart();
        }

        public spawnMany(n: number){
            var i=1
            while (i <= n) {
                this.spawn();
                i++;
            }
        }

        public spawnInState(state){
            if (this.game_state.pandas.total < settings.gameplay.spawnsystem.spawnLimit){ //check got room to spawn 1 more
                var spawn_point : Objects.Spawner = this.game_state.spawner.getRandom(); //pick a random spawnpoint
                this.game_state.pandas.add(this.game_state.spawnPandaInState(spawn_point.x, spawn_point.y, state));
            }
        }

        public spawn(){
            this.spawnInState("hostile");
        }
    }
}