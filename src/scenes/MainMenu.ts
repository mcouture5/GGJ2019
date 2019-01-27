/**
 * Main menu.
 */
export class MainMenu extends Phaser.Scene {
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
        this.cameras.main.setBackgroundColor(0xfff);

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

        // Listen for then the camera is done fading
        this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            this.scene.start('GameScene');
        });
    }

    update() {
        if (!this.fading && Phaser.Input.Keyboard.JustDown(this.startKey)) {
            // 2000
            this.cameras.main.fadeOut(1, 255, 255, 255);
            this.fading = true;
        }
    }
}
