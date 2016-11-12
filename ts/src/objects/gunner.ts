module Objects{

    export class Gunner extends Phaser.Sprite{

        weapon : Phaser.Weapon;
        powerLevel: number; //based on number of recruits (i.e. the rescued pandas)
        rotateSpeed: number = gameplay_gunner_baseTurnSpeed;

        recruits : Phaser.Group;
        anchors : Phaser.Group;

        ring_radius : number;

        fire_button : Phaser.Key;
        left_button : Phaser.Key;
        right_button : Phaser.Key;

        constructor(game : Phaser.Game, x: number, y: number){
            super(game, x, y, 'ship');
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
            this.weapon = this.game.add.weapon(60, 'bullet');
            this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
            this.weapon.bulletSpeed = 200;
            this.weapon.fireRate = 200;
            this.weapon.trackSprite(this, 0, 0, true);
        }

        update(){
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

            if (this.fire_button.isDown)
            {
                this.weapon.fire();
            }

            // rotate the ring
            this.anchors.forEach(anchor => {
                anchor.angle += 1;
            }, null, true);
        }

        collidePanda(gunner, panda){
            switch (panda.state){
                case "hostile":
                    gunner.die(); //lose 1 life
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
            //this.recruits.remove()
            //this.kill()
        }

        rescuePanda(panda : Panda)
        {
            panda.rescue();
            this.recruits.add(panda);

            var anchor = this.game.add.sprite(0, 0);
            this.anchors.add(anchor)

            anchor.x = this.x - this.width / 2;
            anchor.y = this.y - this.height / 2;
            anchor.anchor.setTo(0.5);

            panda.target = anchor;

            this.refreshRing();
        }
        
        removePanda(panda : Panda)
        {
            this.recruits.remove(panda);
            this.anchors.removeChildAt(0);
            panda.kill();

            this.refreshRing();
        }

        refreshRing()
        {
            var count = this.recruits.countLiving();

            if (count <= 4)
            {
                this.ring_radius = 20;
            }
            else
            {
                var ring_space : number = 30;
                this.ring_radius = count * ring_space / (2 * Math.PI);
            }

            console.log(this.ring_radius);

            var rotation_unit = 360.0 / count;
            var current_rotation = 0;

            this.anchors.forEach(anchor => {
                anchor.pivot.x = this.ring_radius;
                anchor.angle = current_rotation;
                current_rotation += rotation_unit;
            }, null, true);

        }
    }
}