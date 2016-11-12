module Objects{

    export class Gunner extends Phaser.Sprite{

        weapon : Phaser.Weapon;
        powerLevel: number; //based on number of recruits (i.e. the rescued pandas)
        rotateSpeed: number = settings.gameplay.gunner.baseTurnSpeed;

        //bulletSpeed: number = ;

        fire_angle_offset : number = -90;

        recruits : Phaser.Group;
        anchors : Phaser.Group;

        ring_radius : number;

        fire_button : Phaser.Key;
        left_button : Phaser.Key;
        right_button : Phaser.Key;

        force_target : Phaser.Point;
        force_not_firing : boolean;

        constructor(game : Phaser.Game, x: number, y: number){
            //super(game, x, y, 'ship');
            super(game, x, y, 'gunner_turret');
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

            this.weapon.onFire.add(function(){
                // play sound
                this.game.add.audio('Turret_Fire').play(null,null,global_sfx_volume);
            }, this);
        }

        update(){
            if (this.force_target == null)
            {
                if (this.left_button.isDown)
                {
                    this.body.angularVelocity = -this.rotateSpeed;
                }
                else if (this.right_button.isDown)
                {
                    this.body.angularVelocity = this.rotateSpeed;
                }
                else
                {
                    this.body.angularVelocity = 0;
                }
            }
            else
            {
                var diff_x = this.force_target.x - this.x;
                var diff_y = this.force_target.y - this.y;

                var target_angle = -Math.atan2(-diff_y, diff_x) * 180.0 / Math.PI;
                var diff_angle = target_angle - (this.angle +  this.fire_angle_offset);

                if (diff_angle > 180) diff_angle -= 360;
                else if (diff_angle < -180) diff_angle += 360;

                if (diff_angle > 5)
                {
                    this.body.angularVelocity = this.rotateSpeed;
                }
                else if (diff_angle < -5)
                {
                    this.body.angularVelocity = -this.rotateSpeed;
                }
                else
                {
                    this.body.angularVelocity = 0;
                }
            }

            if (!this.force_not_firing && this.fire_button.isDown)
            {
                this.fire();
            }

            // rotate the ring
            var index = 0;
            this.anchors.forEach(anchor => {
                anchor.angle += 1;

                var panda = this.recruits.getAt(index++) as Panda;
                panda.target.x = (anchor.worldPosition.x - this.worldPosition.x) / global_game_scale + anchor.position.x;
                panda.target.y = (anchor.worldPosition.y - this.worldPosition.y) / global_game_scale + anchor.position.y;
            }, null, true);
        }

        fire()
        {
            var fire_angle = this.body.rotation + this.fire_angle_offset;

            this.weapon.x = this.position.x;
            this.weapon.y = this.position.y;
            this.weapon.fireAtXY(
                this.weapon.x + Math.cos(fire_angle * Math.PI / 180.0), 
                this.weapon.y + Math.sin(fire_angle * Math.PI / 180.0));
        }

        collidePanda(gunner, panda){
            switch (panda.state){
                case "hostile":
                    //release 1 recruit or gameover
                    if (gunner.recruits.total > 0)
                    {
                        gunner.kidnapPandaWith(panda);
                    }
                    break;
                case "attached":
                    gunner.rescuePanda(panda);
                    break;
                default:
                    //nothing?
            }
        }

        die(){
            console.log("gunner is dying (lose 1 life)")
            //
            //this.kill()
        }

        rescuePanda(panda : Panda)
        {
            panda.rescue();
            this.recruits.add(panda);

            var anchor = this.game.add.sprite(0, 0);
            this.anchors.add(anchor)

            anchor.x = this.x;// - this.width / 2;
            anchor.y = this.y;// - this.height / 2;

            panda.target = new Phaser.Point();

            this.refreshRing();
        }

        kidnapPandaWith(kidnapper : Panda)
        {
            var panda = this.getClosestRecruit(kidnapper.position);
            this.removePanda(panda);

            // pick offscreen direction
            var offscreen_dir_x = panda.x - kidnapper.x;
            var offscreen_dir_y = panda.y - kidnapper.y;
            var magnitude = Math.sqrt(offscreen_dir_x*offscreen_dir_x + offscreen_dir_y*offscreen_dir_y);
            if (magnitude > 0.0)
            {
                offscreen_dir_x /= magnitude;
                offscreen_dir_y /= magnitude;
            }
            else
            {
                var random_angle = this.game.rnd.angle();
                offscreen_dir_x = Math.cos(random_angle * Math.PI / 180.0);
                offscreen_dir_y = Math.sin(random_angle * Math.PI / 180.0);
            }
            
            // kidnapper go away
            kidnapper.changeState("released");
            kidnapper.target = new Phaser.Point(
                this.game.world.width * offscreen_dir_x,
                this.game.world.height * offscreen_dir_y);
            
            // lost panda go away together
            panda.changeState("released");
            panda.target = kidnapper.position;

            AddToWorldObjects(panda);
            AddToWorldObjects(kidnapper);
        }
        
        removePanda(panda : Panda)
        {
            var anchor = this.anchors.getAt(0) as Phaser.Sprite;
            this.anchors.remove(anchor);

            this.recruits.remove(panda);
            this.refreshRing();
        }

        getClosestRecruit(target : Phaser.Point)
        {
            var closest_panda : Panda;
            var closest_distance;

            this.recruits.forEach(panda => {

                var diff_x = target.x - panda.x; 
                var diff_y = target.y - panda.y; 
                var distance = diff_x*diff_x + diff_y*diff_y;

                if (closest_panda == null || distance < closest_distance)
                {
                    closest_panda = panda;
                }
            }, null, true);

            return closest_panda;
        }

        refreshRing()
        {
            if (this.recruits.total <= 4)
            {
                this.ring_radius = 20;
            }
            else
            {
                var ring_space : number = 30;
                this.ring_radius = this.recruits.total * ring_space / (2 * Math.PI);
            }

            var rotation_unit = 360.0 / this.recruits.total;
            var current_rotation = 0;

            this.anchors.forEach(anchor => {
                anchor.pivot.x = this.ring_radius;
                anchor.angle = current_rotation;
                current_rotation += rotation_unit;
            }, null, true);

        }
    }
}