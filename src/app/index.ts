import { enemies, updateEnemies } from './entities/enemies'
import { generateUUID } from 'three/src/math/MathUtils'
import { createStars } from "./entities/stars";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { createPlayer } from "./entities/player";
import { Scene, PerspectiveCamera, WebGLRenderer, Clock } from "three";
import { ClientToServerEvents, Entity, EntityData } from "./types";
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
  //controls.enableKeys = true; //older versions
  
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
let updateData: EntityData[]

const start = () => {
  const state = createGameState();
  state.controls.listenToKeyEvents(document.body);
  const player = createPlayer(state)
  socket.emit("playerJoined", generateUUID(), {id: player.id, position: player.mesh.position})
  socket.on('update', (data) => updateData = data);
  state.player = player;
  state.objects.push(...createStars(state));
  state.objects.push(...Object.values(enemies))

  const update = () => {
    window.requestAnimationFrame(update);
    state.controls.target.set(player.mesh.position.x, player.mesh.position.y, player.mesh.position.z)
    state.controls.update();
    updateEnemies(state, updateData)
    state.objects.forEach((obj) => {
      if(obj.update)obj.update(state)
    });     
    if(state.player?.update)state.player.update(state) 
    console.log(state.objects)
    render()
  };
  const render = () => {
    state.renderer.render(state.scene, state.camera);
    
  }
  update();
};

start();
