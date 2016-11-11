module Objects{

    export class Gunner extends Phaser.Sprite{

        weapon : Phaser.Weapon;

        fire_button : Phaser.Key;
        left_button : Phaser.Key;
        right_button : Phaser.Key;

        constructor(game : Phaser.Game, x: number, y: number){
            super(game, x, y, 'ship');

            this.anchor.set(0.5);

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

        update(){
            if (this.left_button.isDown)
            {
                this.body.angularVelocity = -300;
            }
            else if (this.right_button.isDown)
            {
                this.body.angularVelocity = 300;
            }
            else
            {
                this.body.angularVelocity = 0;
            }

            if (this.fire_button.isDown)
            {
                this.weapon.fire();
            }
        }
    }
}