import './style.css';
import { Engine } from './core/Engine';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

if (canvas) {
  const engine = new Engine(canvas);
  engine.start();
  console.log('Game engine started!');
} else {
  console.error('Canvas not found!');
}
