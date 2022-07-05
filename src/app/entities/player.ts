import { generateUUID } from 'three/src/math/MathUtils'
import { GameState } from "./../index";
import { Entity } from "./../types";
import { Mesh, Vector3 } from "three";
import { MeshBasicMaterial, SphereGeometry } from "three";
import { socket } from '../socket';

export const createPlayer = ({ scene, clock, camera }: GameState): Entity => {
  const id = generateUUID()
  const geometry = new SphereGeometry(1, 32, 16); // (radius, widthSegments, heightSegments)
  const material = new MeshBasicMaterial({ color: 0xffff00 });
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

  socket.emit('playerJoined', generateUUID(), {id, position: mesh.position})

  const update = () => {
    const delta = clock.getDelta(); // seconds
    const moveDistance = 5 * delta; // n pixels per second
    const dir = new Vector3(mesh.position.x, mesh.position.y, mesh.position.z);
    dir.sub(camera.position).normalize(); // direction vector between the camera and the ball
    mesh.translateX(moveDistance * dir.x);
    mesh.translateY(moveDistance * dir.y);
    mesh.translateZ(moveDistance * dir.z); 
    console.log(mesh.position)
    socket.emit('playerMoved', generateUUID(), {id, position: mesh.position})
  };

  const remove = () => {
    mesh.removeFromParent();
  };

  return {
    id,
    mesh,
    update,
    remove,
  };
};
