import { Ingredient } from "./Ingredient";

interface IIngredient {
    name: string;
    key: string;
    value: number;
}

interface IRecipe {
    name: string;
    ingredients: string[];
}

interface IRecipeData {
    ingredients: {[key: string]: IIngredient};
    recipes: Array<IRecipe>;
}

let position = {
    x: 400,
    y: 100
}

export class RecipeThingy extends Phaser.GameObjects.Group {
    public static readonly GETTING_RECIPE: string = 'Recipe:gettingRecipe';
    public static readonly READY: string = 'Recipe:ready';
    public static readonly COMPLETE: string = 'Recipe:complete';
    public static readonly ANIMATE: string = 'Recipe:animate';

    private recipes: Array<IRecipe>;
    private ingredients: {[key: string]: IIngredient};
    private currentRecipe: IRecipe;
    private ingredientIndex: number;
    private activeIngredient: Ingredient;

    // Dont trust phaser, keep array order
    private ingredientsInOrder: Ingredient[];

    constructor(params: {scene: Phaser.Scene}) {
        super(params.scene);

        // Get the recipies from the cache
        let recipeData = this.scene.cache.json.get('recipes');
        this.recipes = recipeData.recipes;
        this.ingredients = recipeData.ingredients;

        // Start at frist ingredient
        this.ingredientsInOrder = [];
        this.ingredientIndex = 0;
        this.activeIngredient = null;
    }

    public nextRecipe() {
        // Change game state
        this.scene.events.emit(RecipeThingy.GETTING_RECIPE);
        // Pull the next recipe from the data
        this.currentRecipe = this.recipes.shift();
        // Show the recipe
        this.showRecipe();
    }

    /**
     * Add the active ingredient to the tea
     */
    public addToTea() {
        this.scene.events.emit(RecipeThingy.ANIMATE);
        this.scene.tweens.add({
            targets: [this.activeIngredient],
            x: 400,
            y: 400,
            duration: 1000,
            onComplete: () => {
                this.activeIngredient.destroy();
                this.ingredientIndex++;
                if (this.ingredientIndex >= this.currentRecipe.ingredients.length) {
                    this.scene.events.emit(RecipeThingy.COMPLETE);
                } else {
                    this.getNextIngredient();
                }
            }
        });
    }

    private showRecipe() {
        // Get the ingredients from the current recipe
        let currentIngs = this.currentRecipe.ingredients;
        let count = 0;
        for (let ingredient of currentIngs) {
            // Lookup the ingredient from the metadata
            let ingMeta = this.ingredients[ingredient];
            let ingSprite = new Ingredient({
                scene: this.scene,
                x: position.x + (count * 50),
                y: position.y,
                key: ingMeta.key
            });
            this.add(ingSprite, true);
            this.ingredientsInOrder.push(ingSprite);
            count++;
        }
        // Add a tween for each ingredient
        this.scene.tweens.add({
            targets: this.getChildren(),
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
            duration: 2000,
            ease: 'Elastic',
            onComplete: () => {
                this.getNextIngredient();
            }
        });
    }

    private getNextIngredient() {
        this.scene.events.emit(RecipeThingy.ANIMATE);
        this.activeIngredient = this.ingredientsInOrder.shift();
        // Tween to move from the current ingredients
        this.scene.tweens.add({
            targets: [this.activeIngredient],
            x: 20,
            y: 20,
            duration: 500,
            onComplete: () => {
                this.scene.events.emit(RecipeThingy.READY);
                // NOOOO
                this.scene.time.addEvent({
                    delay: 1500,
                    callback: this.addToTea,
                    callbackScope: this
                });
            }
        });
        // Also shift the remaining ingredients
        this.scene.tweens.add({
            targets: this.ingredientsInOrder,
            x: '-=50',
            duration: 250
        });
    }
}
