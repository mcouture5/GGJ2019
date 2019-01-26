export class AnimationManager {
    private static tweens: Phaser.Tweens.Tween[] = [];

    public static add(scene, config) {
        scene.events.emit('animating');
        let onComplete = config.onComplete;
        config.onComplete = () => {
            AnimationManager.onComplete(scene, onComplete)
        };
        this.tweens.push(scene.tweens.add(config));
    }

    private static onComplete(scene, callback) {
        callback && callback();
        // Are all tweens added complete?
        let stillPlaying = this.tweens.some((tween) => tween.isPlaying());
        console.log(stillPlaying);
        if (!stillPlaying) {
            scene.events.emit('doneAnimating');
        }
    }
}
