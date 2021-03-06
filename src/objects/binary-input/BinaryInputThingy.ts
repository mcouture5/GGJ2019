import {Pointer} from "./Pointer";
import {OneZeroInputBox} from "./OneZeroInputBox";
import {OneZeroPlaceholder} from "./OneZeroPlaceholder";

/**
 * Complex class group thingy which holds and manages all the binary input thingies.
 *
 * Fires "onChange" event whenever any of the one/zero input values changes. Does not fire on clear. The event passes
 * over the total value of all the one/zero input boxes.
 */
export class BinaryInputThingy extends Phaser.GameObjects.Group {

    // the placeholder numbers
    private static readonly PLACEHOLDERS: number[] = [1, 2, 4, 8, 16];

    // the X/Y center of this thingy
    private x: number;
    private y: number;

    // the one/zero input boxes (from right to left)
    private boxes: OneZeroInputBox[];
    // the placeholder number textbox above each input box
    private placeholders: OneZeroPlaceholder[];
    // the pointer under the active input box
    private pointer: Pointer;

    // the active input box number (from right to left)
    private boxNum: number;
    // the one/zero input values for all the input boxes
    private oneZeroInputs: number[];

    // the keys
    private leftKey: Phaser.Input.Keyboard.Key;
    private rightKey: Phaser.Input.Keyboard.Key;
    private upKey: Phaser.Input.Keyboard.Key;
    private downKey: Phaser.Input.Keyboard.Key;

    // click SFX
    private click: Phaser.Sound.BaseSound;

    constructor(params: {scene: Phaser.Scene, x: number, y: number, numBoxes: number}) {
        super(params.scene);

        // set X/Y center
        this.x = params.x;
        this.y = params.y;

        // create and add placeholders and boxes (from right to left)
        this.boxes = [];
        this.placeholders = [];
        let boxWidthOffset: number = -1;
        if (params.numBoxes === 5) {
            boxWidthOffset = -1.4;
        }
        let botWidthSpacing = 12;
        for (let i = params.numBoxes - 1; i >= 0; i--) {
            let box = new OneZeroInputBox({scene: params.scene, x: 0, y: 0});
            let text: string = BinaryInputThingy.PLACEHOLDERS[i] + '';
            let placeholder = new OneZeroPlaceholder({scene: params.scene, x: 0, y: 0, text: text});
            let boxWidth: number = box.width;
            let boxHeight: number = box.height;
            let boxX: number = this.x + (boxWidth * boxWidthOffset) - (i * botWidthSpacing); // across center line using offset
            let boxY: number = this.y; // rest at bottom of panel
            let placeholderWidth: number = placeholder.width;
            let placeholderX: number = boxX - (placeholderWidth / 2);
            let placeholderY: number = boxY - (boxHeight) - 18;
            box.setX(boxX);
            box.setY(boxY);
            placeholder.setX(placeholderX);
            placeholder.setY(placeholderY);
            this.boxes.unshift(box);
            this.placeholders.unshift(placeholder);
            this.add(box, true);
            this.add(placeholder, true);
            boxWidthOffset += 1;
        }

        // create and add pointer
        this.pointer = new Pointer({scene: params.scene, x: 0, y: 0});
        let pointerHeight: number = this.pointer.height;
        let x: number = this.boxes[0].x; // under box #0
        let y: number = this.y + 55; // under panel box line
        this.pointer.setX(x);
        this.pointer.setY(y);
        this.add(this.pointer, true);

        // set up state variables
        this.boxNum = 0;
        this.oneZeroInputs = [];
        for (let i = 0; i < this.boxes.length; i++) {
            this.oneZeroInputs.push(0);
        }

        // set up keys
        this.leftKey = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.LEFT
        );
        this.rightKey = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.RIGHT
        );
        this.downKey = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.DOWN
        );
        this.upKey = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.UP
        );

        // set up click SFX
        this.click = this.scene.sound.add('click');
    }

    /**
     * Destructor. Removes all the child objects from the scene.
     */
    public destroy() {
        for (let i = 0; i < this.boxes.length; i++) {
            this.remove(this.boxes[i], true);
        }
        this.remove(this.pointer, true);
    }

    public update() {
        if (Phaser.Input.Keyboard.JustDown(this.leftKey)) {
            this.movePointerLeft();
        }
        else if (Phaser.Input.Keyboard.JustDown(this.rightKey)) {
            this.movePointerRight();
        }
        else if (Phaser.Input.Keyboard.JustDown(this.upKey)) {
            this.updatePointedToBox(1);
        }
        else if (Phaser.Input.Keyboard.JustDown(this.downKey)) {
            this.updatePointedToBox(0);
        }
    }

    /**
     * Gets the total value of all the one/zero input boxes.
     */
    public getTotalValue(): number {
        return this.calcTotalValue(this.oneZeroInputs);
    }

    /**
     * Clears all the input boxes out.
     */
    public clearInputs() {
        // clear boxes back to zero
        for (let i = 0; i < this.boxes.length; i++) {
            this.oneZeroInputs[i] = 0;
            this.boxes[i].setOneZero(0);
            this.placeholders[i].setOneZero(0);
        }

        // reset pointer
        this.boxNum = 0;
        this.movePointerToBox(this.boxNum);
    }

    /**
     * Sets the number of boxes. Always clears all the existing boxes.
     * @param numBoxes
     */
    public setNumBoxes(numBoxes) {

    }

    private movePointerLeft() {
        this.boxNum++;
        this.boxNum = Math.min(this.boxNum, this.boxes.length - 1);
        this.movePointerToBox(this.boxNum);
    }

    private movePointerRight() {
        this.boxNum--;
        this.boxNum = Math.max(this.boxNum, 0);
        this.movePointerToBox(this.boxNum);
    }

    private movePointerToBox(boxNum: number) {
        let x: number = this.boxes[boxNum].x;
        this.pointer.setX(x);
    }

    private updatePointedToBox(oneZero: number) {
        let originalOneZero: number = this.oneZeroInputs[this.boxNum];
        let changed: boolean = oneZero !== originalOneZero;
        if (changed) {
            this.click.play();
        }

        this.oneZeroInputs[this.boxNum] = oneZero;
        this.boxes[this.boxNum].setOneZero(oneZero);
        this.placeholders[this.boxNum].setOneZero(oneZero);
        this.scene.events.emit('onChange', this.calcTotalValue(this.oneZeroInputs));
    }

    private calcTotalValue(oneZeroInputs: number[]): number {
        let totalValue: number = 0;
        for (let i = 0; i < this.boxes.length; i++) {
            totalValue += (oneZeroInputs[i] * BinaryInputThingy.PLACEHOLDERS[i]);
        }
        return totalValue;
    }
}
