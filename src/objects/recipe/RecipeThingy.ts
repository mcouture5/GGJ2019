import { Ingredient } from "./Ingredient";
import { TEACUP_POS } from "../../scenes/GameScene";

export interface IIngredient {
    name: string;
    key: string;
    value: number;
}

export interface IRecipe {
    name: string;
    ingredients: number[];
    total?: number;
}

export interface IRecipeData {
    ingredients: IIngredient[];
    recipes: Array<IRecipe>;
}

let CARD_POSITION = {
    active: {
        x: 240,
        y: 80
    },
    inactive: {
        x: 240,
        y: -121
    }
}

let ING_POSITION = {
    x: 240,
    y: 13
}
export class RecipeThingy extends Phaser.GameObjects.Group {
    public static readonly GETTING_RECIPE: string = 'Recipe:gettingRecipe';
    public static readonly READY: string = 'Recipe:ready';
    public static readonly ADDED: string = 'Recipe:added';
    public static readonly COMPLETE: string = 'Recipe:complete';
    public static readonly ANIMATE: string = 'Recipe:animate';
    
    public static readonly GOT_RECIPE: string = 'Recipe:gotRecipe';
    public static readonly GOT_INGREDIENT: string = 'Recipe:gotIngredient';

    private recipes: Array<IRecipe>;
    private ingredients: {[key: string]: IIngredient};
    private currentRecipe: IRecipe;
    private ingredientIndex: number;
    private currentIngredientObject: Ingredient;
    private currentIngredientMeta: IIngredient;
    private card: Phaser.GameObjects.Sprite;

    // Dont trust phaser, keep array order
    private ingredientsInOrder: Ingredient[];

    // SFX
    private plopSound: Phaser.Sound.BaseSound;
    private hissSound: Phaser.Sound.BaseSound;

    constructor(params: {scene: Phaser.Scene}) {
        super(params.scene);

        // Get the recipies from the cache
        let recipeData = this.scene.cache.json.get('recipes');
        this.recipes = recipeData.recipes;
        this.ingredients = recipeData.ingredients;

        // Start at frist ingredient
        this.ingredientsInOrder = [];
        this.ingredientIndex = 0;
        this.currentIngredientObject = null;

        // Create and add the card
        this.card = this.scene.add.sprite(CARD_POSITION.inactive.x, CARD_POSITION.inactive.y, 'recipecard');

        // set up SFX
        this.plopSound = this.scene.sound.add('plop', {volume: 0.75});
        this.hissSound = this.scene.sound.add('hiss', {volume: 0.25});
    }

    public nextRecipe() {
        // Change game state
        this.scene.events.emit(RecipeThingy.GETTING_RECIPE);
        // Reset ingredients
        this.ingredientIndex = 0;
        this.ingredientsInOrder = [];
        this.currentIngredientObject = null;
        // Pull the next recipe from the data
        this.currentRecipe = this.recipes.shift();
        // Every recipe will have water as the first item
        this.currentRecipe.ingredients.unshift(0);
        // Calculate the total needed
        // Not needed, but i wrote this correctly on the first shot so im keepin it.
        this.currentRecipe.total = this.currentRecipe.ingredients.map((ingredient) => this.ingredients[ingredient].value)
            .reduce((prev, curr) => prev + curr);
        // Show the recipe
        this.showRecipe();
        // Give the recipe to the scene
        this.scene.events.emit(RecipeThingy.GOT_RECIPE);
    }

    /**
     * Add the active ingredient to the tea
     */
    public addToTea() {
        // Stop the scene from listening
        this.scene.events.emit(RecipeThingy.ANIMATE);

        // Add dropping anim
        this.scene.tweens.add({
            targets: [this.currentIngredientObject],
            x: TEACUP_POS.active.x + 100,
            y: TEACUP_POS.active.y + 100,
            duration: 1000,
            onComplete: () => {
                // play hiss for water, plop for everything else
                if (this.currentIngredientMeta.name === 'Water') {
                    this.hissSound.play()
                }
                else {
                    this.plopSound.play();
                }

                // Handle added
                this.scene.events.emit(RecipeThingy.ADDED);

                // Kill the sprite
                this.currentIngredientObject.destroy();

                // If no more ingredients, the recipe is complete
                if (this.ingredientIndex == this.currentRecipe.ingredients.length) {
                    this.recipeComplete();
                } else {
                    this.getNextIngredient();
                }
            }
        });
    }

    public restartRecipe() {
        // Change game state
        this.scene.events.emit(RecipeThingy.GETTING_RECIPE);
        // Reset ingredients
        this.ingredientIndex = 0;
        this.ingredientsInOrder = [];
        this.currentIngredientObject = null;
        // Kill previous ingredients
        this.clear(true, true);
        // Show the recipe
        this.showRecipe();
        // Give the recipe to the scene
        this.scene.events.emit(RecipeThingy.GOT_RECIPE);
    }

    private recipeComplete() {
        this.scene.events.emit(RecipeThingy.COMPLETE);
        // Hide the recipe card
        this.scene.tweens.add({
            targets: [this.card],
            y: CARD_POSITION.inactive.y,
            duration: 200
        });
    }

    private showRecipe() {
        // Get the ingredients from the current recipe
        let currentIngs = this.currentRecipe.ingredients;
        let count = 0;
        for (let ingredient of currentIngs) {
            // Lookup the ingredient from the metadata
            let ingMeta = this.getIngredientMeta(ingredient);
            // Draw in reverse order
            let ingSprite = new Ingredient({
                scene: this.scene,
                x: ING_POSITION.x,
                y: CARD_POSITION.inactive.y + ING_POSITION.y,
                key: ingMeta.key
            });
            ingSprite.setX(ingSprite.x + ((count*-1) * ingSprite.width) + ingSprite.width);
            this.add(ingSprite, true);
            this.ingredientsInOrder.push(ingSprite);
            count++;
        }
        // Add a tween for each ingredient
        this.scene.tweens.add({
            targets: [this.card],
            y: CARD_POSITION.active.y,
            duration: 1300,
            ease: 'Bounce',
            easeParams: [ 3.5 ]
        });
        this.scene.tweens.add({
            targets: this.getChildren(),
            y: CARD_POSITION.active.y + ING_POSITION.y,
            duration: 1300,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                this.getNextIngredient();
            }
        });
    }

    private getNextIngredient() {
        // Ready for input now
        this.scene.events.emit(RecipeThingy.READY);

        // Pull the active ingredient sprite and meta
        this.currentIngredientObject = this.ingredientsInOrder.shift();
        this.currentIngredientMeta = this.getCurrentIngredientMeta();

        // Tell the scene about the new ingredient
        this.scene.events.emit(RecipeThingy.GOT_INGREDIENT, this.currentIngredientMeta);

        // Tween to move from the current ingredients
        this.scene.tweens.add({
            targets: [this.currentIngredientObject],
            angle: {
                getEnd: function (target, key, value)
                {
                    return target.angle - 180;
                },
                getStart: function (target, key, value)
                {
                    return target.angle;
                }
            },
            scaleX: 0,
            scaleY: 0,
            duration: 500,
            onComplete: () => {
                this.currentIngredientObject.setX(500).setY(235);
                this.scene.tweens.add({
                    targets: [this.currentIngredientObject],
                    angle: {
                        getEnd: function (target, key, value)
                        {
                            return target.angle + 180;
                        },
                        getStart: function (target, key, value)
                        {
                            return target.angle;
                        }
                    },
                    scaleX: 1,
                    scaleY: 1,
                    duration: 500
                });
                // Also shift the remaining ingredients
                this.scene.tweens.add({
                    targets: this.ingredientsInOrder,
                    x: '+=140',
                    duration: 250
                });
            }
        });

        // Increment
        this.ingredientIndex++;
    }

    getCurrentIngredientMeta() {
        return this.getIngredientMeta(this.currentRecipe.ingredients[this.ingredientIndex]);
    }
    getIngredientMeta(index: number) {
        return this.ingredients[index];
    }
}
