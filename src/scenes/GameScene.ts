import { Bird } from '../objects/Bird';
import { Pipe } from '../objects/Pipe';

export class GameScene extends Phaser.Scene {
    // objects
    private bird: Bird;
    private pipes: Phaser.GameObjects.Group;
    private bg: Phaser.GameObjects.TileSprite;

    // variables
    private timer: Phaser.Time.TimerEvent;
    private score: number;
    private scoreText: Phaser.GameObjects.Text;

    constructor() {
        super({
            key: 'GameScene'
        });
    }

    init(): void {
        // objects
        this.bird = null;
        this.pipes = this.add.group({ classType: Pipe });
        this.bg = null;

        // variables
        this.timer = undefined;
        this.score = -1;
    }

    create(): void {
        this.bg = this.add.tileSprite(0, 0, 800, 600, 'background');
        this.bg.setScale(4);

        this.scoreText = this.add.text(this.sys.canvas.width / 2 - 14, 30, '0', {
            fontFamily: 'Cavalcade-Shadow',
            fontSize: 40
        });

        this.scoreText.setDepth(2);

        this.addRowOfPipes();

        this.bird = new Bird({
            scene: this,
            x: 50,
            y: 100,
            key: 'bird'
        });

        // Add bird
        this.add.existing(this.bird);

        this.timer = this.time.addEvent({
            delay: 1500,
            callback: this.addRowOfPipes,
            callbackScope: this,
            loop: true
        });
    }

    update(): void {
        if (!this.bird.getDead()) {
            this.bg.tilePositionX -= 1;
            this.bird.update();
            this.physics.overlap(this.bird, this.pipes, this.hitPipe, null, this);
        } else {
            Phaser.Actions.Call(
                this.pipes.getChildren(),
                function(pipe) {
                    pipe.body.setVelocityX(0);
                },
                this
            );

            if (this.bird.y > this.sys.canvas.height) {
                this.restartGame();
            }
        }
    }

    private addOnePipe(x, y, frame): void {
        // create a pipe at the position x and y
        let pipe = new Pipe({
            scene: this,
            x: x,
            y: y,
            frame: frame,
            key: 'pipe'
        });

        // add pipe to group
        this.pipes.add(pipe);

        // add pipe to scene
        this.add.existing(pipe);
    }

    private addRowOfPipes(): void {
        // update the score
        this.score += 1;
        this.scoreText.setText('' + this.score);

        // randomly pick a number between 1 and 5
        let hole = Math.floor(Math.random() * 5) + 1;

        // add 6 pipes with one big hole at position hole and hole + 1
        for (let i = 0; i < 10; i++) {
            if (i != hole && i != hole + 1 && i != hole + 2) {
                if (i == hole - 1) {
                    this.addOnePipe(800, i * 60, 0);
                } else if (i == hole + 3) {
                    this.addOnePipe(800, i * 60, 1);
                } else {
                    this.addOnePipe(800, i * 60, 2);
                }
            }
        }
    }

    private hitPipe() {
        this.bird.setDead(true);
    }

    private restartGame(): void {
        this.scene.start('MainMenu');
    }
}
