/**
 * Dumb input box which just displays empty, one, or zero.
 */
export class OneZeroInputBox extends Phaser.GameObjects.Sprite {

    // the spritemap (frame #0 = zero, frame #1 = one)
    private static readonly SPRITEMAP: string = 'switch';
    private static readonly FRAME_ZERO: number = 0;
    private static readonly FRAME_ONE: number = 1;

    constructor(params: {scene: Phaser.Scene, x: number, y: number}) {
        // start at zero
        super(params.scene, params.x, params.y, OneZeroInputBox.SPRITEMAP, OneZeroInputBox.FRAME_ZERO);
    }

    /**
     * Sets the one/zero value.
     */
    public setOneZero(oneZero: number) {
        // set appropriate frame
        if (oneZero === 0) {
            this.setFrame(OneZeroInputBox.FRAME_ZERO);
        }
        else if (oneZero === 1) {
            this.setFrame(OneZeroInputBox.FRAME_ONE);
        }
        else {
            throw new Error('WHAT?!?!');
        }
    }
}
