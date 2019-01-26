import {TeaBot} from "./TeaBot";
import {OneZeroInputBox} from "./OneZeroInputBox";

/**
 * Complex class group thingy which holds and manages all the binary input thingies.
 */
export class BinaryInputThingy extends Phaser.GameObjects.Zone {

    // the number of boxes
    private static readonly NUM_BOXES = 4;

    // the one/zero input boxes (from right to left)
    private boxes: OneZeroInputBox[];
    // the teabot under the active input box
    private teabot: TeaBot;

    // The active input box number (from right to left). 0-indexed. If equal to box length, we're done.
    private boxNum: number;
    // the one/zero input values so far (null means empty)
    private oneZeroInput: number[];

    // the one key and zero key
    private oneKey: Phaser.Input.Keyboard.Key;
    private zeroKey: Phaser.Input.Keyboard.Key;

    constructor(params: {scene: Phaser.Scene, x: number, y: number}) {
        super(params.scene, params.x, params.y);

        // create 4 boxes (from right to left)
        this.boxes = [];
        let boxWidthOffset: number = -1.5; // goes -1.5, -0.5, 0.5, 1.5
        for (let i = BinaryInputThingy.NUM_BOXES - 1; i >= 0; i--) {
            let box = new OneZeroInputBox({scene: params.scene, x: 0, y: 0});
            let boxWidth: number = box.width;
            let boxHeight: number = box.height;
            let x: number = this.x + (boxWidth * boxWidthOffset); // across center line using offset
            let y: number = this.y - (boxHeight / 2); // above center line
            box.setX(x);
            box.setY(y);
            this.boxes.push(box);
            boxWidthOffset += 1;
        }

        // create teabot
        this.teabot = new TeaBot({scene: params.scene, x: 0, y: 0});
        let teabotHeight: number = this.teabot.height;
        let x: number = this.boxes[0].x; // under box #0
        let y: number = this.y + (teabotHeight / 2); // under center line
        this.teabot.setX(x);
        this.teabot.setY(y);

        // init state variables
        this.boxNum = 0;
        this.oneZeroInput = [];
        for (let i = 0; i < BinaryInputThingy.NUM_BOXES; i++) {
            this.oneZeroInput.push(null);
        }

        // set up keys
        this.oneKey = params.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ONE
        );
        this.zeroKey = params.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ZERO
        );
    }

    public update() {
        // if we're done, return early
        if (this.boxNum >= this.boxes.length) {
            return;
        }

        // handle one or zero key
        if (Phaser.Input.Keyboard.JustUp(this.oneKey)) {
            this.handleOneOrZero(1);
        }
        else if (Phaser.Input.Keyboard.JustUp(this.zeroKey)) {
            this.handleOneOrZero(0);
        }

        // if we're done, emit "onInput" event
        if (this.boxNum >= this.boxes.length) {
            this.emit('onInput', this.oneZeroInput);
        }
    }

    /**
     * Clears everything out and asks for a new input. Once the input is ready, emits "onInput" event with array of
     * ones and zeroes.
     */
    public clearAndAskForInput() {
        // clear boxes
        for (let box of this.boxes) {
            box.setOneOrZero(null);
        }

        // move teabot to box #0
        this.moveTeabotToBox(0);

        // clear state variables
        this.boxNum = 0;
        this.oneZeroInput = [];
        for (let i = 0; i < BinaryInputThingy.NUM_BOXES; i++) {
            this.oneZeroInput.push(null);
        }
    }

    /**
     * Handles an incoming one or zero.
     */
    private handleOneOrZero(oneZero: number) {
        // update box
        this.boxes[this.boxNum].setOneOrZero(oneZero);

        // update one/zero input
        this.oneZeroInput[this.boxNum] = oneZero;

        // move to next box
        this.boxNum++;

        // if we haven't run out of boxes, move teabot to next box
        if (this.boxNum < this.boxes.length) {
            this.moveTeabotToBox(this.boxNum);
        }
    }

    /**
     * Moves the teabot under a certain box number. If
     */
    private moveTeabotToBox(boxNum: number) {
        let x: number = this.boxes[boxNum].x;
        this.teabot.setX(x);
    }
}