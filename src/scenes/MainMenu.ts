/**
 * Main menu.
 */
export class MainMenu extends Phaser.Scene {
    private startKey: Phaser.Input.Keyboard.Key;
    private bitmapTexts: Phaser.GameObjects.BitmapText[] = [];
    private texts: Phaser.GameObjects.Text[] = [];

    constructor() {
        super({
            key: 'MainMenu'
        });
    }

    init() {
        this.startKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.S
        );
        this.startKey.isDown = false;
    }

    create() {
        this.texts.push(
            this.add.text(
                this.sys.canvas.width / 2 - 135,
                this.sys.canvas.height / 2 - 80,
                'FLOPPY BIRD',
                {
                    'fontFamily': 'Cavalcade-Shadow',
                    fontSize: 40
                }
            ),
            this.add.text(
                this.sys.canvas.width / 2 - 50,
                this.sys.canvas.height / 2 - 10,
                'S: PLAY',
                {
                    fontFamily: 'Cavalcade-Shadow',
                    fontSize: 30
                }
            )
        );
    }

    update() {
        if (this.startKey.isDown) {
            this.scene.start('GameScene');
        }
    }
}
