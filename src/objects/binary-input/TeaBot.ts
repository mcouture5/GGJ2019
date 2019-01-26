export class TeaBot extends Phaser.GameObjects.Sprite {

    private static readonly SPRITE_KEY: string = 'foo';

    constructor(params: {scene: Phaser.Scene, x: number, y: number, }) {
        super(params.scene, params.x, params.y, TeaBot.SPRITE_KEY);
    }

    update(): void {
    }
}
