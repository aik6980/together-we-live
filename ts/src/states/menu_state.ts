module State{
    export class Menu_state extends Phaser.State{

        timer = 0;
        text : Phaser.Text;

        title_init = false;
        
        preload(){
            //  Load the Google WebFont Loader script
            this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

            // load all character pictures
            for(var i=0; i<6; ++i){
                this.game.load.image('logo'+ i, 'assets/img/logo'+ i + '.png');
            }

            this.title_init = false;
        }

        create(){
            this.game.stage.backgroundColor = "#4488AA";

            // add character image
            for (var i = 0; i < 12; i++)
            {
                var logo = this.game.add.sprite(this.game.world.randomX, -150 + this.game.world.randomY, 'logo' + this.game.rnd.between(0,5));
                logo.anchor.set(0.5);
                logo.scale.set(this.game.rnd.realInRange(0.8, 1.2));
                this.game.add.tween(logo).to({ y: "+300" }, 1000 + this.game.rnd.between(1000,2000), "Bounce.easeOut", true, 0, -1, true);
            }

            // add text
            var bar = this.game.add.graphics(0,0);
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
        }

        update(){
            // text blink
            this.timer += this.game.time.elapsed;
            if(this.timer > 400)
            {
                this.timer = 0;
                this.text.visible = !this.text.visible;
            }

            // add title
            if(google_font_active && !this.title_init){
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
        }

        render(){

        }

        changeState(){
            this.game.state.start('game');
        }
    }
}