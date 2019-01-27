/**
 * Pointer which is under the active one/zero input box.
 */
export class Pointer extends Phaser.GameObjects.Sprite {

    private static readonly TEXTURE: string = 'arrow';

    constructor(params: {scene: Phaser.Scene, x: number, y: number, }) {
        super(params.scene, params.x, params.y, Pointer.TEXTURE);
    }
}
