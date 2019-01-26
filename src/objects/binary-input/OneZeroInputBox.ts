/**
 * Dumb input box which just displays empty, one, or zero.
 */
export class OneZeroInputBox extends Phaser.GameObjects.Sprite {

    // the textures for one/zero
    private static readonly TEXTURE_ONE: string = 'up';
    private static readonly TEXTURE_ZERO: string = 'down';

    // the one/zero value
    private oneOrZero: number;

    constructor(params: {scene: Phaser.Scene, x: number, y: number}) {
        // start zero
        super(params.scene, params.x, params.y, OneZeroInputBox.TEXTURE_ZERO);
        this.oneOrZero = 0;
    }

    /**
     * Sets the one/zero value. Null means empty.
     */
    public setOneOrZero(oneOrZero: number) {
        this.oneOrZero = oneOrZero;

        // set appropriate texture based on one/zero value
        if (this.oneOrZero === 1) {
            this.setTexture(OneZeroInputBox.TEXTURE_ONE);
        }
        else if (this.oneOrZero === 0) {
            this.setTexture(OneZeroInputBox.TEXTURE_ZERO);
        }
    }
}
