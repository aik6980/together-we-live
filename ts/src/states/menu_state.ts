module State{
    export class Menu_state extends Phaser.State{

        timer = 0;
        text : Phaser.Text;

        title_init = false;

        music : Phaser.Sound;

        preload(){
            //  Load the Google WebFont Loader script
            this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

            // load all character pictures
            for(var i=0; i<6; ++i){
                this.game.load.image('logo'+ i, 'assets/img/logo'+ i + '.png');
            }

            this.title_init = false;

            // preload all sfx and music
            //  Firefox doesn't support mp3 files, so use ogg
            //this.game.load.audio('Generic_ShortSpit_SFX', ['assets/snd/Generic_ShortSpit_SFX.ogg']);
            this.game.load.audio('Ghost_Merges_To_Turret', ['assets/snd/Ghost_Merges_To_Turret.ogg']);
            this.game.load.audio('Music_LayerBuildUp', ['assets/snd/Music_LayerBuildUp.ogg']);
            //this.game.load.audio('Music_PrimaryLayerLoop', ['assets/snd/Music_PrimaryLayerLoop.ogg']);
            this.game.load.audio('Music_Together', ['assets/snd/Music_Together.ogg']);
            this.game.load.audio('Turret_Fire', ['assets/snd/Turret_Fire.ogg']);
            this.game.load.audio('Turret_HitsGhost2', ['assets/snd/Turret_HitsGhost2.ogg']);
            this.game.load.audio('Turret_HitsHatter1', ['assets/snd/Turret_HitsHatter1.ogg']);
            this.game.load.audio('Turret_HitsHatter2', ['assets/snd/Turret_HitsHatter2.ogg']);
            //this.game.load.audio('Turret_HitsNothing', ['assets/snd/Turret_HitsNothing.ogg']);
        }

        create(){
            this.game.stage.backgroundColor = "#4488AA";

            // play background music
            this.music = game.add.audio('Music_LayerBuildUp');
            this.music.loop = true;
            this.music.volume = global_music_volume;
            this.music.play();

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

        shutdown(){
            this.music.stop();
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