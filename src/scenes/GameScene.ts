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
        x: 575,
        y: 475
    },
    inactive: {
        x: 2000,
        y: 475
    }
}

let thermometerHeight = 370;

export class GameScene extends Phaser.Scene {
    private static readonly TBOT_OK: number = 0;
    private static readonly TBOT_HAPPY: number = 1;
    private static readonly TBOT_SAD: number = 2;

    // music and SFX
    private music: Phaser.Sound.BaseSound;
    private matchSoundIndex: number;
    private correctSound: Phaser.Sound.BaseSound;
    private mostRefreshingSound: Phaser.Sound.BaseSound;
    private deliciousSound: Phaser.Sound.BaseSound;
    private delightfulSound: Phaser.Sound.BaseSound;
    private tooColdSound: Phaser.Sound.BaseSound;
    private endGameMusic: Phaser.Sound.BaseSound;

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
    private thermometerBar: Phaser.GameObjects.Shape;

    // variables
    private waterTimer: Phaser.Time.TimerEvent;
    private score: number;
    private powerText: Phaser.GameObjects.Text;
    private timeToCoolOff: number;
    private waterTime: number;
    private fading: boolean;

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

        // Starting level
        this.state = GameState.STARTING_LEVEL;
        // starts fading
        this.fading = true;
    }

    create(): void {
        // Create the background and main scene
        this.add.sprite(0, 0, 'background').setOrigin(0, 0);
        this.add.sprite(0, 0, 'table').setOrigin(0, 0);
        this.tbot = this.add.sprite(-1, 170, 'teabot', GameScene.TBOT_OK).setOrigin(0, 0);
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
            numBoxes: 5
        });
        this.events.addListener('onChange', (binary: number) => {
            this.checkInput(binary)
        });

        // Create the recipe thingy
        this.recipeThingy = new RecipeThingy({scene: this, tutorial: false});
        // Listen for recipe events
        this.events.addListener(RecipeThingy.GETTING_RECIPE, () => {
            this.tbot.setFrame(GameScene.TBOT_OK);
            this.state = GameState.GETTING_RECIPE;
        });
        this.events.addListener(RecipeThingy.OUT_OF_RECIPES, () => {
            // YOU WON!!!

            // happy tbot
            this.tbot.setFrame(GameScene.TBOT_HAPPY);

            // say "YOU WON"
            this.speechBubble.setAlpha(1).setDepth(1);
            let textX = 420;
            let textY = 210;
            let text = this.add.text(textX, textY, 'YOU WON', {
                fontFamily: 'Digital',
                fontSize: 45,
                color: '#000000'
            }).setDepth(95);

            // particle effect madness
            let teacupWidth: number = this.teacups[0].width;
            let teacupHeight: number = this.teacups[0].height;
            let starParticles: Phaser.GameObjects.Particles.ParticleEmitterManager = this.add.particles('star').setDepth(0);
            let starEmitter: Phaser.GameObjects.Particles.ParticleEmitter = starParticles.createEmitter({
                x: TEACUP_POS.active.x + (teacupWidth / 2),
                y: TEACUP_POS.active.y + (teacupHeight / 8),
                angle: {min: 200, max: 340},
                speed: 500,
                frequency: 1,
                lifespan: 2000
            });

            // fade out regular music
            this.scene.scene.tweens.add({
                targets: [this.music],
                volume: {
                    getStart: () => 0.2,
                    getEnd: () => 0
                },
                duration: 1000,
                ease: 'Linear',
                onComplete: () => {
                    this.music.stop();

                    // fade in end game music
                    this.endGameMusic.play();
                    this.scene.scene.tweens.add({
                        targets: [this.endGameMusic],
                        volume: {
                            getStart: () => 0,
                            getEnd: () => 1
                        },
                        duration: 1000,
                        ease: 'Linear'
                    });
                }
            });
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
            // Show speech bubble
            this.tweens.add({
                targets: [this.speechBubble],
                duration: 250,
                alpha: 1
            });
        });
        this.events.addListener(RecipeThingy.GOT_RECIPE, (recipe) => {
            this.recipeAdded(recipe);
        });

        // Power text
        this.powerText = this.add.text(90, 450, '0', {
            fontFamily: 'Digital',
            fontSize: 72,
            color: '#efaad1'
        });

        // Temperature
        this.add.sprite(960, 525, 'thermometer').setDepth(2);
        this.add.rectangle(958, 498, 30, thermometerHeight, 0x000000);
        this.thermometerBar = this.add.rectangle(958, 498, 30, thermometerHeight, 0xFF0000).setDepth(1).setAngle(180);

        // Listen for camera done fading
        this.cameras.main.once('camerafadeincomplete', (camera) => {
            this.state = GameState.GETTING_RECIPE;
            this.recipeThingy.nextRecipe();
        });

        // set up music and SFX
        this.music = this.sound.add('pentatonic-jam-loop', {loop: true, volume: 0});
        this.music.play();
        this.matchSoundIndex = Phaser.Math.Between(0, 3);
        this.correctSound = this.sound.add('correct', {volume: 0.6});
        this.mostRefreshingSound = this.sound.add('most-refreshing', {volume: 0.5});
        this.deliciousSound = this.sound.add('delicious', {volume: 0.5});
        this.delightfulSound = this.sound.add('delightful', {volume: 0.5});
        this.tooColdSound = this.sound.add('too-cold', {volume: 0.5});
        this.endGameMusic = this.sound.add('home-to-me-loop', {loop: true, volume: 0});
    }

    update(): void {
        // Very first update, begin a fade in (camera & music)
        if (this.fading) {
            let fadeInDuration: number = 1300;
            this.cameras.main.fadeIn(fadeInDuration, 255, 255, 255);
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
        this.runGame();
    }

    /**
     * Checks input for the correct value.
     */
    private checkInput(value: number) {
        this.powerText.setText(''+value);
        if (value == this.currentIngredient.value) {
            this.matchSoundIndex++;
            if (this.matchSoundIndex > 3) {
                this.matchSoundIndex = 0;
            }
            switch (this.matchSoundIndex) {
                case 0:
                    this.correctSound.play();
                    break;
                case 1:
                    this.mostRefreshingSound.play();
                    break;
                case 2:
                    this.deliciousSound.play();
                    break;
                case 3:
                    this.delightfulSound.play();
                    break;
            }

            // Pause the timer, shouldnt be penalized for something you cant do...
            if (this.waterTimer) {
                this.waterTimer.paused = true;
            }
            this.recipeThingy.addToTea();
        }
    }

    private recipeAdded(recipe) {
        this.currentRecipe = recipe;
        this.thermometerBar.height = thermometerHeight;
    }

    /**
     * Handles when an item is successfully added.
     * This is called after the drop animation finishes.
     */
    private ingredientAdded() {
        // If the item added was the water, start the timer!
        if (this.currentIngredient.name == 'Water') {
            this.thermometerBar.height = thermometerHeight;
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
        // hide speech bubble
        this.tweens.add({
            targets: [this.speechBubble],
            duration: 250,
            alpha: 0
        });
        this.currentIngredient = null;
        this.binaryInput.clearInputs();
        this.powerText.setText('0');
    }

    /**
     * Countdown for the water cooling off. Updates the text.
     */
    private coolOff() {
        this.waterTime++;
        this.thermometerBar.height = thermometerHeight - ((this.waterTime / this.timeToCoolOff) * thermometerHeight);
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

        // Steamy teacups
        this.tweens.add({
            targets: [this.steam],
            duration: 1250,
            alpha: 1,
            onComplete: () => {
                this.resetTeacups(false);
            }
        });

        // starry teacups
        let teacupWidth: number = this.teacups[0].width;
        let teacupHeight: number = this.teacups[0].height;
        let starParticles: Phaser.GameObjects.Particles.ParticleEmitterManager = this.add.particles('star');
        let starEmitter: Phaser.GameObjects.Particles.ParticleEmitter = starParticles.createEmitter({
            x: TEACUP_POS.active.x + (teacupWidth / 2),
            y: TEACUP_POS.active.y + (teacupHeight / 8),
            angle: {min: 225, max: 315},
            speed: 500,
            frequency: 100,
            lifespan: 500
        });
        setInterval(() => {
            starEmitter.stop();
            starParticles.destroy(true);
        }, 1250);
    }

    /**
     * Resets the teacups by swapping who is visible
     */
    private resetTeacups(fail: boolean) {
        let activeteacup = this.teacups[this.activeTeacupIndex];
        this.tweens.add({
            targets: [activeteacup, this.steam],
            x: TEACUP_POS.inactive.x,
            duration: 500,
            onComplete: () => {
                // Hide steam
                this.steam.setAlpha(0);

                // Swicth active teacup
                if (this.activeTeacupIndex == 0) {
                    this.activeTeacupIndex = 1;
                } else {
                    this.activeTeacupIndex = 0;
                }
                activeteacup = this.teacups[this.activeTeacupIndex];

                // Bring it in!
                this.tweens.add({
                    targets: [activeteacup, this.steam],
                    x: TEACUP_POS.active.x,
                    duration: 500,
                    onComplete: () => {
                        if (fail) {
                            this.restartLevel();
                        } else {
                            this.nextLevel();
                        }
                    }
                });
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
                break;
            case GameState.GETTING_RECIPE:
                break;
            case GameState.AWAITING_INPUT:
                this.binaryInput.update();
                break;
            case GameState.ANIMATING:
                break;
        }
    }

    private restartGame(): void {
        this.scene.start('MainMenu');
    }
}
