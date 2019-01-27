/**
 * Main menu.
 */
export class MainMenu extends Phaser.Scene {
    // music
    private music: Phaser.Sound.BaseSound;

    private startKey: Phaser.Input.Keyboard.Key;
    private bitmapTexts: Phaser.GameObjects.BitmapText[] = [];
    private texts: Phaser.GameObjects.Text[] = [];
    private bg: Phaser.GameObjects.Sprite;
    private fade = Phaser.Cameras.Scene2D.Effects.Fade;
    private fading: boolean;

    constructor() {
        super({
            key: 'MainMenu'
        });
    }

    init() {
        this.startKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.startKey.isDown = false;
        this.bg = null;
        this.fading = false;
    }

    create() {
        this.bg = this.add.sprite(400, 300, 'mainmenu-bg');
        this.cameras.main.setBackgroundColor(0xffffff);

        this.texts.push(
            this.add.text(290,180,
                'Tea Bot',
                {
                    'fontFamily': 'Bough',
                    fontSize: 60,
                    color: '#000'
                }
            ),
            this.add.text(260,280,
                'Press space to play',
                {
                    fontFamily: 'Bough',
                    fontSize: 30,
                    color: '#000'
                }
            )
        );

        // start playing music
        this.music = this.sound.add('beep-boop-loop', {loop: true, volume: 1});
        this.music.play();

        // Listen for when the camera is done fading
        this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            this.music.stop();
            this.scene.start('Tutorial');
        });
    }

    update() {
        if (!this.fading && Phaser.Input.Keyboard.JustDown(this.startKey)) {
            // 2000
            let fadeOutDuration: number = 2000;
            this.cameras.main.fadeOut(fadeOutDuration, 255, 255, 255);
            this.scene.scene.tweens.add({
                targets: [this.music],
                volume: {
                    getStart: () => 1,
                    getEnd: () => 0
                },
                duration: fadeOutDuration,
                ease: 'Linear'
            });
            this.fading = true;
        }
    }
}
