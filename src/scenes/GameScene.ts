import { BinaryInputThingy } from '../objects/binary-input/BinaryInputThingy';
import { RecipeThingy } from '../objects/recipe/RecipeThingy';
import { Scene } from 'phaser';

enum GameState {
    STARTING_LEVEL,
    GETTING_RECIPE,
    AWAITING_INPUT,
    ANIMATING
}

export class GameScene extends Phaser.Scene {
    // objects
    private bg: Phaser.GameObjects.Sprite;
    private binaryInput: BinaryInputThingy;
    private recipeThingy: RecipeThingy;

    // variables
    private timer: Phaser.Time.TimerEvent;
    private score: number;
    private scoreText: Phaser.GameObjects.Text;

    // Tutorial stuff
    private tutorial: {[key: string]: {[key: string]: {[key: string]: string}}}; // hooooly shit
    private inTutorial: boolean;
    private hasTakenTutorial: boolean;
    private tutorialStep: number;
    private tbotCommand: number;
    private speaking: boolean;

    // Game state
    private state: GameState;

    constructor() {
        super({
            key: 'GameScene'
        });
    }

    init(): void {
        // objects
        this.bg = null;
        this.binaryInput = null;
        this.recipeThingy = null;

        // variables
        this.timer = undefined;
        this.score = -1;

        // First time around always has a tutorial
        this.inTutorial = false;
        this.hasTakenTutorial = false;
        this.tutorialStep = 0;
        this.tbotCommand = 0;

        // Starting level
        this.state = GameState.STARTING_LEVEL;
    }

    create(): void {
        // Get the tutorial form the cache
        this.tutorial = this.cache.json.get('tutorial');

        this.bg = this.add.sprite(400, 300, 'teacup');

        // Create the input box and listen to it
        this.binaryInput = new BinaryInputThingy({
            scene: this,
            x: 400,
            y: 300
        });
        setInterval(() => {
            console.log(this.binaryInput.getTotalValue());
            this.binaryInput.clearInputs();
        }, 5000);
        this.events.addListener('onInput', (binary: number) => {
            console.log(binary);
        });

        // Create the recipe thingy
        this.recipeThingy = new RecipeThingy({scene: this});
        // Listen for recipe events
        this.events.addListener(RecipeThingy.GETTING_RECIPE, () => {
            this.state = GameState.GETTING_RECIPE;
        });
        this.events.addListener(RecipeThingy.READY, () => {
            this.state = GameState.AWAITING_INPUT;
        });
        this.events.addListener(RecipeThingy.COMPLETE, () => {
            this.state = GameState.GETTING_RECIPE;
        });
        this.events.addListener(RecipeThingy.ANIMATE, () => {
            this.state = GameState.ANIMATING;
        });

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

        // Get the first recipe
        this.recipeThingy.nextRecipe();
    }

    update(): void {
        // If we are in the tutorial, run the tutorial scripts
        if (this.inTutorial) {
            this.runTutorial();
        } else {
            this.runGame();
        }
    }

    /**
     * Checks the state of the tutorial every loop.
     * Responsible for showing the text, waiting for input, moving tbot, etc.
     */
    private runTutorial() {
    }

    private nextStep() {

    }

    /**
     * Prints the text charactaer by character then waits until space is pressed to continue.
     * If space is pressed halfway through, prints the whole string then waits.
     */
    private speak(text: string) {
        console.log(text);
    }

    private getNextStep() {

    }

    private runGame() {
        switch (this.state) {
            case GameState.GETTING_RECIPE:
                console.log('GETTING_RECIPE...');
                break;
            case GameState.AWAITING_INPUT:
                console.log('waiting...');
                this.binaryInput.update();
                break;
            case GameState.ANIMATING:
                console.log('ANIMATING...');
                break;
        }
    }

    private restartGame(): void {
        this.scene.start('MainMenu');
    }
}
