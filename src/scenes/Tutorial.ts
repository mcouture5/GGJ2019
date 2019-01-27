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

let thermometerHeight = 370;

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
    private powerText: Phaser.GameObjects.Text;
    private thermometerBar: Phaser.GameObjects.Shape;

    // TUT state
    private state: TutorialState;
    private tutorialData: IAction[];
    private actionIndex: number;
    private modal: Phaser.GameObjects.Shape;

    private tutorialStartSound: Phaser.Sound.BaseSound;

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

        this.actionIndex = 0;
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

        this.recipeThingy = new RecipeThingy({scene: this, tutorial: true});
        // Listen for recipe events
        this.events.addListener(RecipeThingy.GETTING_RECIPE, () => {
        });
        this.events.addListener(RecipeThingy.READY, () => {
        });
        this.events.addListener(RecipeThingy.COMPLETE, () => {
            this.completeRecipe();
        });
        this.events.addListener(RecipeThingy.ANIMATE, () => {
        });
        this.events.addListener(RecipeThingy.ADDED, () => {
            this.ingredientAdded();
        });
        this.events.addListener(RecipeThingy.GOT_INGREDIENT, (ingredient) => {
            this.currentIngredient = ingredient;
            // Show speech bubble
            this.tweens.add({
                targets: [this.speechBubble],
                duration: 250,
                alpha: 1
            });
            this.nextTbotAction();
        });
        this.events.addListener(RecipeThingy.GOT_RECIPE, (recipe) => {
        });
        this.events.addListener('TUT:advance', () => {
            this.nextTbotAction();
        });

        // Create the input box and listen to it
        this.binaryInput = new BinaryInputThingy({
            scene: this,
            x: 175,
            y: 655,
            numBoxes: 5
        });
        this.events.addListener('onChange', (binary: number) => {
            this.checkInput(binary)
        });

        // Power text
        this.powerText = this.add.text(115, 450, '0', {
            fontFamily: 'Digital',
            fontSize: 72,
            color: '#efaad1'
        });

        // Temperature
        this.add.sprite(960, 525, 'thermometer').setDepth(2);
        this.add.rectangle(958, 498, 30, thermometerHeight, 0x000000);
        this.thermometerBar = this.add.rectangle(958, 498, 30, thermometerHeight, 0xFF0000).setDepth(1).setAngle(180);

        // MiniTb
        this.minitb = this.add.sprite(-200, -200, 'minitb', 0).setDepth(90);
        this.speechBox = new TutorialBox({scene: this, minitb: this.minitb});
        this.events.addListener('advance', () => {
            this.nextTbotAction();
        });

        // Mask
        this.modal = this.add.rectangle(0, 0, 1024, 768, 0x000000, 0.75).setOrigin(0,0).setAlpha(0).setDepth(50);

        // Comic
        this.comic = this.add.sprite(0, 0, 'teaplease').setOrigin(0, 0).setDepth(100);
        this.cameras.main.setBackgroundColor(0xffffff);
        
        // Listen for when the camera is done fading
        this.cameras.main.once('camerafadeincomplete', (camera) => {
            this.time.addEvent({
                callback: this.beginTutorial,
                callbackScope: this,
                delay: 3000, // 3000
                repeat: 0
            });
        });

        this.tutorialStartSound = this.sound.add("tutorial-start", {volume: 0.25});
    }

    private checkInput(value: number) {
        this.powerText.setText(''+value);
        if (value == this.currentIngredient.value) {
            this.state = TutorialState.ANIMATING;
            this.recipeThingy.addToTea();
        }
    }

    update() {
        if (this.fading) {
            // 2000
            this.tutorialStartSound.play();
            let fadeOutDuration: number = 2000;
            this.cameras.main.fadeIn(fadeOutDuration, 255, 255, 255);
            this.fading = false;
        }
        switch (this.state) {
            case TutorialState.ANIMATING:
                break;
            case TutorialState.SPEAKING:
                this.speechBox.update();
                break;
            case TutorialState.WAITING:
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
        this.tweens.add({
            targets: [this.modal],
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                this.nextTbotAction();
            }
        });
    }

    private completeRecipe() {
        this.nextTbotAction();
    }

    private ingredientAdded() {
        
    }

    private nextTbotAction() {
        // If no steps left, done!
        if (this.actionIndex == this.tutorialData.length) {
            this.cameras.main.fadeOut(1000, 255, 255, 255);
            this.cameras.main.once('camerafadeoutcomplete', (camera) => {
                this.scene.start('GameScene');
            });
        } else {
            let action = this.tutorialData[this.actionIndex];
            // Prepare for next sequence
            this.actionIndex++;
            // Perform
            this.performAction(action);
        }
    }

    private performAction(action: IAction) {
        switch(action.type) {
            case "speak":
                this.state = TutorialState.SPEAKING;
                this.speakTbot(action);
                break;
            case "transition":
                this.state = TutorialState.ANIMATING;
                this.transitionTbot(action);
                break;
            case "highlight":
                this.state = TutorialState.ANIMATING;
                this.highlight(action);
                break;
            case "recipe":
                this.recipeThingy.nextRecipe();
                break;
            case "dropmask":
                this.tweens.add({
                    targets: [this.modal],
                    duration: 350,
                    alpha: 0,
                    onComplete: () => {
                        this.nextTbotAction();
                    }
                })
                break;
            case "enablerecipe":
                this.recipeThingy.getNextIngredient();
                break;
            case "input":
                this.state = TutorialState.WAITING;
                this.binaryInput.clearInputs();
                this.powerText.setText('0');
                break;
        }
    }

    private speakTbot(action: IAction) {
        let waitMaybe = action.data.waitforspace;
        if (typeof waitMaybe == 'undefined') {
            waitMaybe = true;
        }
        this.speechBox.setWaitForSpace(waitMaybe);
        this.speechBox.move(action.data.position.x, action.data.position.y);
        this.speechBox.speak(action.data.text);
    }

    private transitionTbot(action: IAction) {
        this.speechBox.shutup();
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
    }

    private highlight(action: IAction) {
        if(action.data.behavoir == 'show') {
            this[action.data.target].setDepth(200);
        } else {
            this[action.data.target].setDepth(0);
        }
        this.nextTbotAction();
    }
}
