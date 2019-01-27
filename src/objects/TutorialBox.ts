
export class TutorialBox extends Phaser.GameObjects.Group {
    private bubble: Phaser.GameObjects.Shape;
    private text: Phaser.GameObjects.Text;
    private spaceText: Phaser.GameObjects.Text;
    private speech: string;
    private boxWidth: number;
    private boxHeight: number;
    private space: Phaser.Input.Keyboard.Key;
    private timer: Phaser.Time.TimerEvent;
    private spaceTween: Phaser.Tweens.Tween;
    private speaking: boolean;
    private waitForSpace: boolean;
    private murmurSoundCount: number;
    private murmurSound: Phaser.Sound.BaseSound;
    private minitb: Phaser.GameObjects.Sprite;

    constructor(params: {scene: Phaser.Scene, minitb: Phaser.GameObjects.Sprite}) {
        super(params.scene);
        this.minitb = params.minitb;
        this.boxWidth = 350;
        this.boxHeight = 200;
        this.bubble = this.scene.add.rectangle(0, 0, this.boxWidth, 0, 0xffffff)
            .setStrokeStyle(0x000000, 1)
            .setDepth(300)
            .setOrigin(0,0);
        this.text = this.scene.add.text(0, 0, '', {
            fontFamily: 'Digital',
            fontSize: 22,
            color: '#000000',
            wordWrap: { width: this.boxWidth - 10, useAdvancedWrap: true }
        }).setDepth(310).setAlpha(0);
        this.spaceText = this.scene.add.text(0, 0, '(PRESS SPACE)', {
            fontFamily: 'Digital',
            fontSize: 12,
            color: '#000000'
        }).setDepth(310).setAlpha(0);
        this.space = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.scene.anims.create({
            key: 'talk',
            frames: [ { key: 'minitb', frame: 0 }, { key: 'minitb', frame: 1 } ],
            frameRate: 7,
            repeat: -1
        });
        this.space.isDown = false;
        this.waitForSpace = true;

        this.murmurSoundCount = 0;
        this.murmurSound = this.scene.sound.add("murmur", {volume: 0.25});
    }

    update() {
        if (this.speaking && (Phaser.Input.Keyboard.JustUp(this.space) || !this.waitForSpace)) {
            // If still talking, just finish talking
            let currentlyPrinted = this.text.text;
            if (currentlyPrinted.length < this.speech.length) {
                this.timer && this.timer.destroy();
                this.text.setText(this.speech);
                this.minitb.anims.stop();
            } else {
                this.scene.events.emit('advance');
                this.speaking = false;
                this.minitb.anims.stop();
            }
        }
    }

    move(x: number, y: number) {
        this.bubble.setX(x).setY(y);
        this.text.setX(x + 10).setY(y + 10).setText('');
        this.spaceText.setX(x + this.boxWidth - 75).setY(y + this.boxHeight - 15);
    }

    speak(speech: string) {
        this.speech = speech;
        this.bubble.setAlpha(1);
        this.scene.tweens.add({
            targets: [this.bubble],
            height: this.boxHeight,
            duration: 550,
            onComplete: () => {
                this.text.setText('').setAlpha(1).setSize(200, 200);
                if (this.waitForSpace) {
                    this.animateSpace();
                }
                this.murmurSoundCount = 0;
                this.printText();
            }
        });
    }

    shutup() {
        this.spaceTween && this.spaceTween.stop();
        this.text.setAlpha(0);
        this.spaceText.setAlpha(0);
        this.scene.tweens.add({
            targets: [this.bubble],
            height: 0,
            duration: 200,
            onComplete: () => {
                this.bubble.setAlpha(0);
            }
        });
    }

    setWaitForSpace(value) {
        this.waitForSpace = value;
    }

    private animateSpace () {
        this.spaceText.setAlpha(1);
        /*
        this.spaceTween = this.scene.tweens.add({
            targets: [this.spaceText],
            alpha: 1,
            loop: -1,
            yoyo: true,
            duration: 1550
        });*/
    }

    
    private printText() {
        if (this.murmurSoundCount <= 0) {
            this.murmurSoundCount = 100;
            this.murmurSound.play();
        }
        this.murmurSoundCount--;

        this.speaking = true;
        this.minitb.anims.play('talk', true);
        let currentlyPrinted = this.text.text;
        if (currentlyPrinted.length < this.speech.length) {
            let portion = this.speech.substr(0, this.speech.length - (this.speech.length - currentlyPrinted.length) + 1);
            this.text.setText(portion);
            this.timer = this.scene.time.addEvent({
                callback: this.printText,
                callbackScope: this,
                delay: 15,
                repeat: 0
            });
        } else {
            this.minitb.anims.stop();
        }
    }

}