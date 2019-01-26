/**
 * Main menu.
 */
export class MainMenu extends Phaser.Scene {
    private startKey: Phaser.Input.Keyboard.Key;
    private bitmapTexts: Phaser.GameObjects.BitmapText[] = [];
    private texts: Phaser.GameObjects.Text[] = [];
    private bg: Phaser.GameObjects.Sprite;
    private fade = Phaser.Cameras.Scene2D.Effects.Fade;

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
    }

    create() {
        this.bg = this.add.sprite(400, 300, 'mainmenu-bg');
        this.cameras.main.setBackgroundColor(0xfff);

        this.texts.push(
            this.add.text(10,10,
                'Tea Bot',
                {
                    'fontFamily': 'Bough',
                    fontSize: 40,
                    color: '#000'
                }
            ),
            this.add.text(10,60,
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
        if (this.startKey.isDown) {
            this.cameras.main.fadeOut(2000, 255, 255, 255);
        }
    }
}
