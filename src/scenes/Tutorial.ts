import { BinaryInputThingy } from '../objects/binary-input/BinaryInputThingy';
import { RecipeThingy, IRecipe, IIngredient } from '../objects/recipe/RecipeThingy';
import { TEACUP_POS } from "./GameScene";
import { TutorialBox } from '../objects/TutorialBox';

enum TutorialState {
    SPEAKING,
    ANIMATING,
    WAITING
}

interface IAction {
    type: string;
    data: any;
}

interface IStepData {
    sequence: IAction[];
}

/**
 * Tutorial.
 */
export class Tutorial extends Phaser.Scene {
    private static readonly TBOT_OK: number = 0;
    private static readonly TBOT_HAPPY: number = 1;
    private static readonly TBOT_SAD: number = 2;

    private comic: Phaser.GameObjects.Sprite;
    private fading: boolean;

    // objects
    private binaryInput: BinaryInputThingy;
    private recipeThingy: RecipeThingy;
    private currentRecipe: IRecipe;
    private currentIngredient: IIngredient;
    private tbot: Phaser.GameObjects.Sprite;
    private teacups: Phaser.GameObjects.Sprite[];
    private steam: Phaser.GameObjects.Sprite;
    private activeTeacupIndex: number;
    private speechBubble: Phaser.GameObjects.Sprite;
    private minitb: Phaser.GameObjects.Sprite;
    private speechBox: TutorialBox;

    // TUT state
    private state: TutorialState;
    private tutorialData: IStepData[];
    private tutorialStep: number;
    private tbotCommand: number;
    private speech: string;
    private sequenceIndex: number;

    constructor() {
        super({
            key: 'Tutorial'
        });
    }

    init() {
        // objects
        this.binaryInput = null;
        this.recipeThingy = null;
        this.currentRecipe = null;
        this.currentIngredient = null;

        // Iterations in half seconds
        this.teacups = [];

        // starts fading
        this.fading = true;

        this.tutorialStep = 0;
        this.tbotCommand = 0;
        this.speech = '';
        this.sequenceIndex = 0;
    }

    create() {
        // Start with animating
        this.state = TutorialState.ANIMATING;

        // Get the tutorial info
        this.tutorialData = this.cache.json.get('tutorial').tutorial;

        // Create the background and main scene
        this.add.sprite(0, 0, 'background').setOrigin(0, 0);
        this.add.sprite(0, 0, 'table').setOrigin(0, 0);
        this.tbot = this.add.sprite(-1, 170, 'teabot', Tutorial.TBOT_OK).setOrigin(0, 0);
        this.teacups.push(
            this.add.sprite(TEACUP_POS.active.x, TEACUP_POS.active.y, 'teacup-1').setOrigin(0, 0).setDepth(10),
            this.add.sprite(TEACUP_POS.inactive.x, TEACUP_POS.inactive.y, 'teacup-2').setOrigin(0, 0).setDepth(10) // off screen
        );
        this.activeTeacupIndex = 0;
        this.steam = this.add.sprite(TEACUP_POS.active.x, 0, 'steam').setOrigin(0, 0).setAlpha(0);
        this.speechBubble = this.add.sprite(350, 150, 'speechbubble').setOrigin(0, 0).setAlpha(0);

        // Create the input box and listen to it
        this.binaryInput = new BinaryInputThingy({
            scene: this,
            x: 175,
            y: 655,
            numBoxes: 4
        });
        this.events.addListener('onChange', (binary: number) => {
            this.checkInput(binary)
        });

        // MiniTb
        this.minitb = this.add.sprite(-200, -200, 'minitb', 0).setDepth(90);
        this.speechBox = new TutorialBox({scene: this});
        this.events.addListener('advance', () => {
            this.nextTbotAction();
        });

        // Comic
        this.comic = this.add.sprite(0, 0, 'teaplease').setOrigin(0, 0).setDepth(100);
        this.cameras.main.setBackgroundColor(0xffffff);
        
        // Listen for when the camera is done fading
        this.cameras.main.once('camerafadeincomplete', (camera) => {
            this.time.addEvent({
                callback: this.beginTutorial,
                callbackScope: this,
                delay: 30, // 3000
                repeat: 0
            });
        });
    }

    private checkInput(value: number) {
    }

    update() {
        if (this.fading) {
            // 2000
            let fadeOutDuration: number = 200;
            this.cameras.main.fadeIn(fadeOutDuration, 255, 255, 255);
            this.fading = false;
        }
        switch (this.state) {
            case TutorialState.ANIMATING:
                console.log('ANIMATING...');
                break;
            case TutorialState.SPEAKING:
                console.log('SPEAKING...');
                this.speechBox.update();
                break;
            case TutorialState.WAITING:
                console.log('WAITING...');
                this.binaryInput.update();
                break;
        }
    }

    private beginTutorial() {
        this.cameras.main.fadeOut(500, 255, 255, 255);
        this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            this.comic.setAlpha(0);
            this.cameras.main.fadeIn(500, 255, 255, 255);
            this.cameras.main.once('camerafadeincomplete', (camera) => {
                this.showMask();
            });
        });
    }

    showMask() {
        let mask = this.add.rectangle(0, 0, 1024, 768, 0x000000, 0.75).setOrigin(0,0).setAlpha(0).setDepth(50);
        this.tweens.add({
            targets: [mask],
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                this.nextTbotAction();
            }
        });
    }

    private nextTbotAction() {
        // If no steps left, done!
        if (this.tutorialStep == this.tutorialData.length) {
            console.log('done');
        } else {
            let stepData = this.tutorialData[this.tutorialStep];

            // If nothing left, transition to next step
            if (this.sequenceIndex == stepData.sequence.length) {
                // Next step...
                this.sequenceIndex = 0;
                this.tutorialStep++;
                if (this.state == TutorialState.SPEAKING) {
                    this.speechBox.shutup();
                    this.state = TutorialState.ANIMATING;
                }
                this.nextTbotAction();
            } else {
                let action = stepData.sequence[this.sequenceIndex]
                // Prepare for next sequence
                this.sequenceIndex++;
                // Perform
                this.performAction(stepData, action);
            }
        }
    }

    private performAction(stepData: IStepData, action: IAction) {
        switch(action.type) {
            case "speak":
                this.state = TutorialState.SPEAKING;
                this.speakTbot(stepData, action);
                break;
            case "transition":
                let data = action.data;
                this.minitb.setX(data.position.x).setY(data.position.y);
                this.minitb.setAngle(data.angle || 0);
                this.tweens.add({
                    targets: [this.minitb],
                    duration: 500,
                    x: data.xTo,
                    y: data.yTo,
                    onComplete: () => {
                        this.nextTbotAction();
                    }
                })
                break;
        }
    }

    private speakTbot(stepData: IStepData, action: IAction) {
        this.speechBox.move(action.data.position.x, action.data.position.y);
        this.speechBox.speak(action.data.text);
    }
}
