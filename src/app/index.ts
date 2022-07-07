import { enemies, updateEnemies } from "./entities/enemies";
import { createStars } from "./entities/stars";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { createPlayer, checkPlayerCollisions } from "./entities/player";
import { Scene, PerspectiveCamera, WebGLRenderer, Clock } from "three";
import { Entity, EntityData, Player } from "./types";
import { socket } from "./socket";
import { createGui, updateScore } from "./utils/gui";

export interface GameState {
  clock: Clock;
  scene: Scene;
  controls: OrbitControls;
  objects: Entity[];
  player: Player;
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
  controls.zoomO = 10
  controls.maxPolarAngle = 10000;
  controls.maxAzimuthAngle = 10000;
  controls.keys = {
    LEFT: "KeyA",
    UP: "KeyW",
    RIGHT: "KeyD",
    BOTTOM: "KeyS",
  };
  controls.maxDistance = 10;
  controls.keyPanSpeed = 50;
  camera.position.set(0, 0, 10);
  controls.update();

  return {
    clock,
    scene,
    camera,
    controls,
    renderer,
    player: {} as Player,
    objects: [],
  };
};
let serverState: EntityData[] = [];
socket.on("update", (data) => (serverState = data));
 
const start = () => {
  //get updates from other player from server and store them and handle in next render cycle
  const state = createGameState();
  //listen to key press events
  state.controls.listenToKeyEvents(document.body);
  const player = createPlayer(state, 2);
  state.player = player;
  state.objects.push(...createStars(state));
  state.objects.push(...Object.values(enemies));
  createGui()
  const update = () => {
    window.requestAnimationFrame(update);
    
    //target the player so that controlling is rotating camera around the player
    state.controls.target = player.mesh.position;

    //update the game objects: position ect.
    state.objects.forEach((obj) => {
      if (obj.update) obj.update(state);
    });

    if (state.player.update) state.player.update(state);
    
    //when player grows move camera back
    if(state.controls.maxDistance < 4 * state.player.radius){
      state.controls.maxDistance = 5 * player.radius 
    } 
    state.controls.update()

    //update enemies based on server data
    updateEnemies(state, serverState);
    checkPlayerCollisions(state);
    updateScore(state.player.radius)
    render();
  };
  const render = () => {
    state.renderer.render(state.scene, state.camera);
  };
  update();
};

start();
