import { GameState } from "./../index";
import { Entity } from "./../types";
import { Mesh, Vector3 } from "three";
import { MeshBasicMaterial, SphereGeometry } from "three";
import { socket } from "../socket";

export const eatEntity = (player: Entity, victim: Entity) => {
  const victimVolume = (4 / 3) * Math.PI * Math.pow(victim.radius, 3);
  const playerVolume = (4 / 3) * Math.PI * Math.pow(player.radius, 3);
  const combinedVolume = victimVolume + playerVolume;
  const resultingRadius = Math.pow(3 * (combinedVolume / (4 * Math.PI)), 1 / 3);
  const scalingFactor = resultingRadius / player.radius;
  player.radius = resultingRadius
  player.mesh.geometry.scale(scalingFactor, scalingFactor, scalingFactor)
  victim.remove()
};

export const checkPlayerCollisions = (player: Entity, objects: Entity[]) => {
  objects.forEach(obj => {
    const distanceBetween = player.mesh.position.distanceTo(obj.mesh.position)
    const isOverlapping = distanceBetween < player.radius + obj.radius
    if(isOverlapping ){
      console.log(obj.id)
      player.radius > obj.radius ? eatEntity(player, obj) : eatEntity(obj, player)
    }
  })
}

export const createPlayer = (
  { scene, clock, camera }: GameState,
  radius: number
): Entity => {

  const geometry = new SphereGeometry(radius, 32, 16); // (radius, widthSegments, heightSegments)
  const material = new MeshBasicMaterial({ color: 0xffff00 });
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);
  const id = mesh.uuid

  socket.emit("playerJoined", { id, position: mesh.position });
  const update = () => {
    const delta = clock.getDelta(); // seconds
    //move object
    const moveDistance = 5 * delta; // n pixels per second
    const dir = new Vector3(mesh.position.x, mesh.position.y, mesh.position.z);
    dir.sub(camera.position).normalize(); // direction vector between the camera and the ball
    mesh.translateX(moveDistance * dir.x);
    mesh.translateY(moveDistance * dir.y);
    mesh.translateZ(moveDistance * dir.z); 
    socket.emit("playerMoved", { id, position: mesh.position });
    
  };

  const remove = () => {
    mesh.removeFromParent();
    socket.emit("playerDied", { id, position: mesh.position })
  };

  return {
    id,
    mesh,
    update,
    remove,
    radius
  };
};
