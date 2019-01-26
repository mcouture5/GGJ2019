/**
 * Dumb input box which just displays empty, one, or zero.
 */
export class OneZeroInputBox extends Phaser.GameObjects.Sprite {

    // the textures for empty, one, or two
    private static readonly TEXTURE_EMPTY: string = 'foo';
    private static readonly TEXTURE_ONE: string = 'one';
    private static readonly TEXTURE_ZERO: string = 'zero';

    // The one/zero value. Null means empty.
    private oneOrZero: number;

    constructor(params: {scene: Phaser.Scene, x: number, y: number}) {
        // start empty
        super(params.scene, params.x, params.y, OneZeroInputBox.TEXTURE_EMPTY);
        this.oneOrZero = null;
    }

    /**
     * Sets the one/zero value. Null means empty.
     */
    public setOneOrZero(oneOrZero: number) {
        this.oneOrZero = oneOrZero;

        // set appropriate texture based on one/zero value
        if (this.oneOrZero === null) {
            this.setTexture(OneZeroInputBox.TEXTURE_EMPTY);
        }
        else if (this.oneOrZero === 1) {
            this.setTexture(OneZeroInputBox.TEXTURE_ONE);
        }
        else if (this.oneOrZero === 1) {
            this.setTexture(OneZeroInputBox.TEXTURE_ZERO);
        }
    }
}
