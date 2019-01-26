/// <reference path='./headers/phaser.d.ts'/>

import 'phaser';
import { Boot } from './scenes/Boot';
import { MainMenu } from './scenes/MainMenu';
import { GameScene } from './scenes/GameScene';

// main game configuration
const config: GameConfig = {
  title: 'Boilerplate',
  width: 800,
  height: 600,
  type: Phaser.AUTO,
  parent: 'game',
  scene: [Boot, MainMenu, GameScene],
  input: {
    keyboard: true,
    mouse: false,
    touch: false,
    gamepad: false
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  backgroundColor: '#98d687',
  render: { pixelArt: true, antialias: false, autoResize: false }
};

// game class
export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

// when the page is loaded, create our game instance
window.addEventListener('load', () => {
  var game = new Game(config);
});
