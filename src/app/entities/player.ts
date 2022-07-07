import { GameState } from "./../index";
import { Entity, Player } from "./../types";
import { Mesh, TextureLoader, Vector3 } from "three";
import { MeshBasicMaterial, SphereGeometry } from "three";
import { socket } from "../socket";

export const eatEntity = (player: Player, victim: Entity) => {
  const victimVolume = (4 / 3) * Math.PI * Math.pow(victim.radius, 3);
  const playerVolume = (4 / 3) * Math.PI * Math.pow(player.radius, 3);
  const combinedVolume = victimVolume + playerVolume;
  const resultingRadius = Math.pow(3 * (combinedVolume / (4 * Math.PI)), 1 / 3);

  const scalingFactor = resultingRadius / player.radius;
  player.radius = resultingRadius;
  player.mesh.geometry.scale(scalingFactor, scalingFactor, scalingFactor);
  victim.remove();
};

export const checkPlayerCollisions = ({ player, objects }: GameState) => {
  objects.forEach((obj) => {
    const distanceBetween = player.mesh.position.distanceTo(obj.mesh.position);
    const isOverlapping = distanceBetween < player.radius + obj.radius;
    if (isOverlapping) {
      player.radius > obj.radius ? eatEntity(player, obj) : player.remove();
    }
  });
};

const material = new MeshBasicMaterial({
  map: new TextureLoader().load("Black_Stone_Texture.jpeg"),
});

export const createPlayer = (
  { scene, clock, camera }: GameState,
  radius: number
): Player => {
  const geometry = new SphereGeometry(radius, 32, 16); // (radius, widthSegments, heightSegments)
  
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);
  const id = mesh.uuid;

  socket.emit("playerJoined", { id, position: mesh.position, radius });
  const update = () => {
    const delta = clock.getDelta(); // seconds
    console.log('delta: ', delta)
    //move object
    const moveDistance = 10 * delta; // n pixels per second
    const dir = new Vector3(mesh.position.x, mesh.position.y, mesh.position.z);
    dir.sub(camera.position).normalize();
    player.direction = dir; // direction vector between the camera and the ball
    mesh.translateOnAxis(dir, moveDistance);
    socket.emit("playerMoved", {
      id,
      position: mesh.position,
      radius: player.radius,
    });
  };

  const remove = () => {
    mesh.removeFromParent();
    socket.emit("playerDied", {
      id,
      position: mesh.position,
      radius: player.radius,
    });
  };

  const player = {
    id,
    mesh,
    update,
    remove,
    radius,
    direction: new Vector3(),
  };
  return player;
};
