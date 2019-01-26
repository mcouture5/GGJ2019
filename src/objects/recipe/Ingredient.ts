/**
 * Ingredient sprite. Shows the ingredient icon with the value.
 */
export class Ingredient extends Phaser.GameObjects.Sprite {

    constructor(params: {scene: Phaser.Scene, x: number, y: number, key: string}) {
        super(params.scene, params.x, params.y, params.key, 0);
        this.setScale(0.5);
    }
}
