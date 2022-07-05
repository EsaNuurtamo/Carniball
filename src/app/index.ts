import { enemies, updateEnemies } from './entities/enemies'
import { generateUUID } from 'three/src/math/MathUtils'
import { createStars } from "./entities/stars";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { createPlayer } from "./entities/player";
import { Scene, PerspectiveCamera, WebGLRenderer, Clock } from "three";
import { Entity, EntityData } from "./types";
import { socket } from "./socket";


export interface GameState {
  clock: Clock;
  scene: Scene;
  controls: OrbitControls;
  objects: Entity[];
  player: Entity | undefined;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
}

const createGameState = (): GameState => {
  const clock = new Clock();
  const scene = new Scene();
  const camera = new PerspectiveCamera(
    -75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = 10000
  controls.maxAzimuthAngle = 10000
  controls.keys = {
    LEFT: "KeyA", //left arrow
    UP: "KeyW", // up arrow
    RIGHT: "KeyD", // right arrow
    BOTTOM: "KeyS", // down arrow
  };
  controls.maxDistance = 20
  controls.keyPanSpeed = 50
  camera.position.set(0, 0, -10);
  return {
    clock,
    scene,
    camera,
    controls,
    renderer,
    player: undefined,
    objects: [],
  };
};
let serverState: EntityData[]

const start = () => {

  //get updates from other player from server and store them and handle in next render cycle
  socket.on('update', (data) => serverState = data);

  const state = createGameState();
  state.controls.listenToKeyEvents(document.body);
  const player = createPlayer(state)
  state.player = player
  
  state.objects.push(...createStars(state));
  state.objects.push(...Object.values(enemies))

  const update = () => {
    window.requestAnimationFrame(update);
    state.controls.target.set(player.mesh.position.x, player.mesh.position.y, player.mesh.position.z)
    state.controls.update();

    //update enemies based on server data
    updateEnemies(state, serverState)

    //update the game objects: position ect.
    state.objects.forEach((obj) => {
      if(obj.update)obj.update(state)
    });  
    if(state.player?.update)state.player.update(state) 
    render()
  };
  const render = () => {
    state.renderer.render(state.scene, state.camera);
  }
  update();
};

start();
