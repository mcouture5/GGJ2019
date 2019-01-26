import {TeaBot} from "./TeaBot";
import {OneZeroInputBox} from "./OneZeroInputBox";

/**
 * Complex class group thingy which holds and manages all the binary input thingies.
 */
export class BinaryInputThingy extends Phaser.GameObjects.Group {

    // the number of boxes
    private static readonly NUM_BOXES: number = 4;

    // the X/Y center of this thingy
    private x: number;
    private y: number;

    // the one/zero input boxes (from right to left)
    private boxes: OneZeroInputBox[];
    // the teabot under the active input box
    private teabot: TeaBot;

    // the active input box number (from right to left)
    private boxNum: number;
    // the one/zero input values for all the input boxes
    private oneZeroInputs: number[];

    // the keys
    private leftKey: Phaser.Input.Keyboard.Key;
    private rightKey: Phaser.Input.Keyboard.Key;
    private upKey: Phaser.Input.Keyboard.Key;
    private downKey: Phaser.Input.Keyboard.Key;

    constructor(params: {scene: Phaser.Scene, x: number, y: number}) {
        super(params.scene);

        // set X/Y center
        this.x = params.x;
        this.y = params.y;

        // create 4 boxes (from right to left)
        this.boxes = [];
        let boxWidthOffset: number = 1.5; // goes -1.5, -0.5, 0.5, 1.5
        for (let i = BinaryInputThingy.NUM_BOXES - 1; i >= 0; i--) {
            let box = new OneZeroInputBox({scene: params.scene, x: 0, y: 0});
            let boxWidth: number = box.width;
            let boxHeight: number = box.height;
            let x: number = this.x + (boxWidth * boxWidthOffset); // across center line using offset
            let y: number = this.y - (boxHeight / 2); // above center line
            box.setX(x);
            box.setY(y);
            this.boxes.push(box);
            this.add(box, true);
            boxWidthOffset -= 1;
        }

        // create teabot
        this.teabot = new TeaBot({scene: params.scene, x: 0, y: 0});
        let teabotHeight: number = this.teabot.height;
        let x: number = this.boxes[0].x; // under box #0
        let y: number = this.y + (teabotHeight / 2); // under center line
        this.teabot.setX(x);
        this.teabot.setY(y);
        this.add(this.teabot, true);

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
    }

    public update() {
        if (Phaser.Input.Keyboard.JustDown(this.leftKey)) {
            this.movePointerLeft();
        }
        else if (Phaser.Input.Keyboard.JustDown(this.rightKey)) {
            this.movePointerRight();
        }
        else if (Phaser.Input.Keyboard.JustDown(this.upKey)) {
            this.setPointedToBox(1);
        }
        else if (Phaser.Input.Keyboard.JustDown(this.downKey)) {
            this.setPointedToBox(0);
        }
    }

    /**
     * Gets the one/zero input values for all the input boxes.
     */
    public getOneZeroInputs(): number[] {
        return this.oneZeroInputs;
    }

    /**
     * Clears all the input boxes out.
     */
    public clearOneZeroInputs() {
        // clear boxes back to zero
        for (let i = 0; i < this.boxes.length; i++) {
            this.oneZeroInputs[i] = 0;
            this.boxes[i].setOneZero(0);
        }

        // reset pointer
        this.boxNum = 0;
        this.movePointerToBox(this.boxNum);
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
        this.teabot.setX(x);
    }

    private setPointedToBox(oneZero: number) {
        this.oneZeroInputs[this.boxNum] = oneZero;
        this.boxes[this.boxNum].setOneZero(oneZero);
    }
}