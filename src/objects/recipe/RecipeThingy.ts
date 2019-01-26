import { Ingredient } from "./Ingredient";

export interface IIngredient {
    name: string;
    key: string;
    value: number;
}

export interface IRecipe {
    name: string;
    ingredients: string[];
    total?: number;
}

export interface IRecipeData {
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
        this.currentIngredientObject = null;
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
        this.currentRecipe.ingredients.unshift('water');
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
            x: 400,
            y: 400,
            duration: 1000,
            onComplete: () => {
                // Handle added
                this.scene.events.emit(RecipeThingy.ADDED);

                // Kill the sprite
                this.currentIngredientObject.destroy();

                // If no more ingredients, the recipe is complete
                if (this.ingredientIndex >= this.currentRecipe.ingredients.length) {
                    this.recipeComplete();
                } else {
                    this.getNextIngredient();
                }
            }
        });
    }

    private recipeComplete() {
        this.scene.events.emit(RecipeThingy.COMPLETE);
    }

    private showRecipe() {
        // Get the ingredients from the current recipe
        let currentIngs = this.currentRecipe.ingredients;
        let count = 0;
        for (let ingredient of currentIngs) {
            // Lookup the ingredient from the metadata
            let ingMeta = this.getIngredientMeta(ingredient);
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
        // Stop the scene from listening
        this.scene.events.emit(RecipeThingy.ANIMATE);

        // Pull the active ingredient sprite and meta
        this.currentIngredientObject = this.ingredientsInOrder.shift();
        this.currentIngredientMeta = this.getCurrentIngredientMeta();

        // Tell the scene about the new ingredient
        this.scene.events.emit(RecipeThingy.GOT_INGREDIENT, this.currentIngredientMeta);

        // Tween to move from the current ingredients
        this.scene.tweens.add({
            targets: [this.currentIngredientObject],
            x: 20,
            y: 20,
            duration: 500,
            onComplete: () => {
                // Ready for input now
                this.scene.events.emit(RecipeThingy.READY);
            }
        });
        // Also shift the remaining ingredients
        this.scene.tweens.add({
            targets: this.ingredientsInOrder,
            x: '-=50',
            duration: 250
        });

        // Increment
        this.ingredientIndex++;
    }

    getCurrentIngredientMeta() {
        return this.getIngredientMeta(this.currentRecipe.ingredients[this.ingredientIndex]);
    }
    getIngredientMeta(key: string) {
        return this.ingredients[key];
    }
}
