import { BinaryInputThingy } from '../objects/binary-input/BinaryInputThingy';
import { RecipeThingy, IRecipe, IIngredient } from '../objects/recipe/RecipeThingy';
import { Scene } from 'phaser';

enum GameState {
    STARTING_LEVEL,
    GETTING_RECIPE,
    AWAITING_INPUT,
    ANIMATING
}

export let TEACUP_POS = {
    active: {
        x: 600,
        y: 500
    },
    inactive: {
        x: 2000,
        y: 500
    }
}

export class GameScene extends Phaser.Scene {
    private static readonly TBOT_OK: number = 0;
    private static readonly TBOT_HAPPY: number = 1;
    private static readonly TBOT_SAD: number = 2;

    // music and SFX
    private music: Phaser.Sound.BaseSound;
    private correctSound: Phaser.Sound.BaseSound;
    private tooColdSound: Phaser.Sound.BaseSound;

    // objects
    private binaryInput: BinaryInputThingy;
    private recipeThingy: RecipeThingy;
    private currentRecipe: IRecipe;
    private currentIngredient: IIngredient;
    private tbot: Phaser.GameObjects.Sprite;
    private teacups: Phaser.GameObjects.Sprite[];
    private activeTeacupIndex: number;

    // variables
    private waterTimer: Phaser.Time.TimerEvent;
    private score: number;
    private powerText: Phaser.GameObjects.Text;
    private timeToCoolOff: number;
    private waterTime: number;
    private temperature: Phaser.GameObjects.Text;
    private fading: boolean;
    private allowedToRun: boolean;

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
        // Iterations in half seconds
        this.timeToCoolOff = 20;
        this.waterTime = 0;
        this.teacups = [];

        // First time around always has a tutorial
        this.inTutorial = false;
        this.hasTakenTutorial = false;
        this.tutorialStep = 0;
        this.tbotCommand = 0;

        // Starting level
        this.state = GameState.STARTING_LEVEL;
        // starts fading
        this.fading = true;
        this.allowedToRun = false;
    }

    create(): void {
        // Get the tutorial form the cache
        this.tutorial = this.cache.json.get('tutorial');

        // Create the background and main scene
        this.add.sprite(0, 0, 'background').setOrigin(0, 0);
        this.add.sprite(0, 0, 'table').setOrigin(0, 0);
        this.tbot = this.add.sprite(-1, 170, 'teabot', GameScene.TBOT_OK).setOrigin(0, 0);
        this.teacups.push(
            this.add.sprite(TEACUP_POS.active.x, TEACUP_POS.active.y, 'teacup-1').setOrigin(0, 0).setDepth(10),
            this.add.sprite(TEACUP_POS.inactive.x, TEACUP_POS.inactive.y, 'teacup-2').setOrigin(0, 0).setDepth(10) // off screen
        );
        this.activeTeacupIndex = 0;

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
            this.tbot.setFrame(GameScene.TBOT_OK);
            this.state = GameState.GETTING_RECIPE;
        });
        this.events.addListener(RecipeThingy.READY, () => {
            this.state = GameState.AWAITING_INPUT;
        });
        this.events.addListener(RecipeThingy.COMPLETE, () => {
            this.completeRecipe();
        });
        this.events.addListener(RecipeThingy.ANIMATE, () => {
            this.state = GameState.ANIMATING;
        });
        this.events.addListener(RecipeThingy.ADDED, () => {
            this.ingredientAdded();
        });
        this.events.addListener(RecipeThingy.GOT_INGREDIENT, (ingredient) => {
            this.currentIngredient = ingredient;
        });
        this.events.addListener(RecipeThingy.GOT_RECIPE, (recipe) => {
            this.recipeAdded(recipe);
        });

        // Power text
        this.powerText = this.add.text(115, 450, '0', {
            fontFamily: 'Digital',
            fontSize: 72,
            color: '#000'
        });

        // Temperature
        this.temperature = this.add.text(500, 450, '0', {
            fontFamily: 'Digital',
            fontSize: 72,
            color: '#000'
        });

        // Get the first recipe

        // set up music and SFX
        this.music = this.sound.add('pentatonic-jam-loop', {loop: true, volume: 0});
        this.music.play();
        this.correctSound = this.sound.add('correct');
        this.tooColdSound = this.sound.add('too-cold');
    }

    update(): void {
        // Very first update, begin a fade in (camera & music)
        if (this.fading) {
            // 1300
            let fadeInDuration: number = 100;
            this.cameras.main.fadeIn(fadeInDuration, 255, 255, 255, (cam, progress) => {
                if (progress == 1) {
                    this.state = GameState.GETTING_RECIPE;
                    this.recipeThingy.nextRecipe();
                }
            });
            this.scene.scene.tweens.add({
                targets: [this.music],
                volume: {
                    getStart: () => 0,
                    getEnd: () => 0.2
                },
                duration: fadeInDuration,
                ease: 'Linear'
            });
            this.fading = false;
        }
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
        this.powerText.setText(''+value);
        if (value == this.currentIngredient.value) {
            this.correctSound.play();

            // Pause the timer, shouldnt be penalized for something you cant do...
            if (this.waterTimer) {
                this.waterTimer.paused = true;
            }
            this.recipeThingy.addToTea();
        }
    }

    private recipeAdded(recipe) {
        this.currentRecipe = recipe;
        this.temperature.setText('');
    }

    /**
     * Handles when an item is successfully added.
     * This is called after the drop animation finishes.
     */
    private ingredientAdded() {
        // If the item added was the water, start the timer!
        if (this.currentIngredient.name == 'Water') {
            this.temperature.setText('102');
            this.waterTimer = this.time.addEvent({
                callback: this.coolOff,
                callbackScope: this,
                delay: 500,
                repeat: this.timeToCoolOff
            });
        }
        if (this.waterTimer) {
            this.waterTimer.paused = false;
        }
        this.currentIngredient = null;
        this.binaryInput.clearInputs();
        this.powerText.setText('0');
    }

    /**
     * Countdown for the water cooling off. Updates the text.
     */
    private coolOff() {
        this.waterTime++;
        let temp = parseInt(this.temperature.text);
        temp -= 1;
        this.temperature.setText(''+temp);
        if (this.waterTime >= this.timeToCoolOff) {
            this.failRecipe();
        }
    }

    /**
     * Fail to complete the recipe in time.
     */
    private failRecipe() {
        this.tooColdSound.play();

        this.state = GameState.STARTING_LEVEL;
        // Immediately stop the timer
        this.waterTime = 0;
        this.waterTimer.destroy();

        // TBOT IS SAD
        this.tbot.setFrame(GameScene.TBOT_SAD);

        // Begin resetting tcups
        this.resetTeacups(true);
    }

    /**
     * Handle when the recipe is complete
     */
    private completeRecipe() {
        this.state = GameState.GETTING_RECIPE;
        this.waterTime = 0;
        this.waterTimer.destroy();
        
        // TBOT IS HAPPY
        this.tbot.setFrame(GameScene.TBOT_HAPPY);

        this.resetTeacups(false);
    }

    /**
     * Resets the teacups by swapping who is visible
     */
    private resetTeacups(fail: boolean) {
        let activeteacup = this.teacups[this.activeTeacupIndex];
        this.tweens.add({
            targets: [activeteacup],
            x: TEACUP_POS.inactive.x,
            duration: 1500
        });
        if (this.activeTeacupIndex == 0) {
            this.activeTeacupIndex = 1;
        } else {
            this.activeTeacupIndex = 0;
        }
        activeteacup = this.teacups[this.activeTeacupIndex];
        this.tweens.add({
            targets: [activeteacup],
            x: TEACUP_POS.active.x,
            duration: 1500,
            onComplete: () => {
                if (fail) {
                    this.restartLevel();
                } else {
                    this.nextLevel();
                }
            }
        });
    }

    /**
     * Restarts the level by clearing text and variables andreseeting the recipe thingy.
     */
    private restartLevel() {
        this.binaryInput.clearInputs();
        this.powerText.setText('0');
        this.recipeThingy.restartRecipe();
    }

    private nextLevel() {
        this.recipeThingy.nextRecipe();
    }

    private runGame() {
        switch (this.state) {
            case GameState.STARTING_LEVEL:
                console.log('STARTING_LEVEL...');
                break;
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
