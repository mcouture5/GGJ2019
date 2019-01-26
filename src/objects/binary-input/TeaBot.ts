/**
 * Teabot which is under the active input box.
 */
export class TeaBot extends Phaser.GameObjects.Sprite {

    private static readonly TEXTURE: string = 'foo';

    constructor(params: {scene: Phaser.Scene, x: number, y: number, }) {
        super(params.scene, params.x, params.y, TeaBot.TEXTURE);
    }
}
