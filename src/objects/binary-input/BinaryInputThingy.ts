import {TeaBot} from "./TeaBot";
import {OneZeroInputBox} from "./OneZeroInputBox";

/**
 * Complex class group thingy which holds and manages all the binary input thingies.
 */
export class BinaryInputThingy extends Phaser.GameObjects.Zone {

    private boxes: OneZeroInputBox[]; // the one/zero input boxes (from right to left)
    private teabot: TeaBot; // the teabot under the active input box
    private box: number; // the active input box number (from right to left)
    private oneZeroInput: number[]; // the one/zero input values so far (null means empty)

    constructor(params: {scene: Phaser.Scene, x: number, y: number}) {
        super(params.scene, params.x, params.y);

        // create 4 boxes (from right to left)
        this.boxes = [];
        let boxWidthOffset: number = -1.5; // goes -1.5, -0.5, 0.5, 1.5
        for (let i = 3; i >= 0; i--) {
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

        // Create teabot. Move to box #0.
        this.teabot = new TeaBot({scene: params.scene, x: 0, y: 0});
        let teabotHeight: number = this.teabot.height;
        let x: number = this.boxes[0].x;
        let y: number = this.y + (teabotHeight / 2);
        this.teabot.setX(x);
        this.teabot.setY(y);
    }

    public update() {
        this.emit('onInput', 1);
    }

    public askForInput() {

    }
}