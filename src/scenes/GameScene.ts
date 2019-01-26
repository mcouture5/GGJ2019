import { BinaryInputThingy } from '../objects/binary-input/BinaryInputThingy';
import { RecipeThingy, IRecipe, IIngredient } from '../objects/recipe/RecipeThingy';
import { Scene } from 'phaser';

enum GameState {
    STARTING_LEVEL,
    GETTING_RECIPE,
    AWAITING_INPUT,
    ANIMATING
}

export class GameScene extends Phaser.Scene {
    // objects
    private binaryInput: BinaryInputThingy;
    private recipeThingy: RecipeThingy;
    private currentRecipe: IRecipe;
    private currentIngredient: IIngredient;

    // variables
    private waterTimer: Phaser.Time.TimerEvent;
    private score: number;
    private powerText: Phaser.GameObjects.Text;
    private timeToCoolOff: number;
    private waterTime: number;

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
        this.binaryInput = null;
        this.recipeThingy = null;
        this.currentRecipe = null;
        this.currentIngredient = null;

        // variables
        this.score = -1;
        this.timeToCoolOff = 10;
        this.waterTime = 0;

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

        // Create the background and main scene
        this.add.sprite(0, 0, 'table').setOrigin(0, 0);
        this.add.sprite(-1, 170, 'teabot').setOrigin(0, 0);
        this.add.sprite(600, 500, 'teacup-1').setOrigin(0, 0);

        // Create the input box and listen to it
        this.binaryInput = new BinaryInputThingy({
            scene: this,
            x: 175,
            y: 655
        });
        this.events.addListener('onChange', (binary: number) => {
            this.checkInput(binary)
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
            this.handleCompleteRecipe();
        });
        this.events.addListener(RecipeThingy.ANIMATE, () => {
            this.state = GameState.ANIMATING;
        });
        this.events.addListener(RecipeThingy.ADDED, () => {
            this.handleItemAdded();
        });
        this.events.addListener(RecipeThingy.GOT_INGREDIENT, (ingredient) => {
            this.currentIngredient = ingredient;
        });
        this.events.addListener(RecipeThingy.GOT_RECIPE, (recipe) => {
            this.currentRecipe = recipe;
        });

        // Power text
        this.powerText = this.add.text(150, 450, '0', {
            fontFamily: 'Digital',
            fontSize: 72,
            color: '#000'
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
        this.state = GameState.GETTING_RECIPE;
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

    /**
     * Checks input for the correct value.
     */
    private checkInput(value: number) {
        if (value == this.currentIngredient.value) {
            this.recipeThingy.addToTea();
        }
    }

    /**
     * Handles when an item is successfully added.
     */
    private handleItemAdded() {
        // If the item added was the water, start the timer!
        if (this.currentIngredient.key == 'water') {
            this.waterTimer = this.time.addEvent({
                callback: this.coolOff,
                callbackScope: this,
                delay: 1000,
                repeat: this.timeToCoolOff
            });
        }
        this.currentIngredient = null;
        this.binaryInput.clearInputs();
    }

    /**
     * Countdown for the water cooling off. Updates the text.
     */
    private coolOff() {
        this.waterTime++;
        console.log(this.waterTime);
        if (this.waterTime >= this.timeToCoolOff) {
            // Fail conditon
        }
    }

    /**
     * Handle when the recipe is complete
     */
    private handleCompleteRecipe() {
        this.state = GameState.GETTING_RECIPE;
        this.recipeThingy.nextRecipe();
        this.waterTime = 0;
        this.waterTimer.destroy();
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
