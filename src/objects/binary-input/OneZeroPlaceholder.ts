/**
 * Placeholder number textbox above each one/zero input box.
 */
export class OneZeroPlaceholder extends Phaser.GameObjects.Text {

    // the styles for one/zero
    private static readonly STYLE_ZERO: object = {
        fontFamily: 'Digital',
        fontSize: 32,
        color: 'black'
    };
    private static readonly STYLE_ONE: object = {
        fontFamily: 'Digital',
        fontSize: 32,
        color: 'white'
    };

    constructor(params: {scene: Phaser.Scene, x: number, y: number, text: string}) {
        // start at zero
        super(params.scene, params.x, params.y, params.text, OneZeroPlaceholder.STYLE_ZERO);
    }

    public setOneZero(oneZero: number) {
        // set appropriate style
        if (oneZero === 0) {
            this.setStyle(OneZeroPlaceholder.STYLE_ZERO);
        }
        else if (oneZero === 1) {
            this.setStyle(OneZeroPlaceholder.STYLE_ONE);
        }
        else {
            throw new Error('WHAT?!?!');
        }
    }
}
