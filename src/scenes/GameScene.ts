import { BinaryInputThingy } from '../objects/binary-input/BinaryInputThingy';

export class GameScene extends Phaser.Scene {
    // objects
    private bg: Phaser.GameObjects.Sprite;
    private binaryInput: BinaryInputThingy;
    private indgredients: Phaser.GameObjects.Sprite[];

    // variables
    private timer: Phaser.Time.TimerEvent;
    private score: number;
    private scoreText: Phaser.GameObjects.Text;

    // Cache
    private recipies: any;

    constructor() {
        super({
            key: 'GameScene'
        });
    }

    init(): void {
        // objects
        this.bg = null;
        this.binaryInput = null;

        // variables
        this.timer = undefined;
        this.score = -1;
    }

    create(): void {
        // Get the recipies from the cache
        this.recipies = this.cache.json.get('recipies');
        console.log(this.recipies);

        this.bg = this.add.sprite(400, 300, 'teacup');

        // Create the input box
        this.binaryInput = new BinaryInputThingy({
            scene: this,
            x: 400,
            y: 300
        });
        setInterval(() => {
            console.log(this.binaryInput.getOneZeroInputs());
            this.binaryInput.clearOneZeroInputs();
        }, 5000);

/*
        this.scoreText = this.add.text(this.sys.canvas.width / 2 - 14, 30, '0', {
            fontFamily: 'Cavalcade-Shadow',
            fontSize: 40
        });

        this.scoreText.setDepth(2);

        this.timer = this.time.addEvent({
            delay: 1500,
            callback: this.addRowOfPipes,
            callbackScope: this,
            loop: true
        });
        */
    }

    update(): void {
        // Update the input thingy every frame
        this.binaryInput.update();
    }

    private requestTea() {
let data = this.cache.json.get('levelData');
    }

    private createIngredient() {
        this.indgredients.push(
            this.add.sprite(0, 0, 'tealeaf')
        );
    }

    private restartGame(): void {
        this.scene.start('MainMenu');
    }
}
