import { generateUUID } from 'three/src/math/MathUtils'
import { GameState } from "./../index";
import { Entity } from "./../types";
import { Mesh, MeshStandardMaterial, Spherical, Vector3 } from "three";
import { MeshBasicMaterial, SphereGeometry } from "three";
import { randomUUID } from "crypto";
import { socket } from '../socket';

export const createPlayer = ({ scene, clock, camera, controls, player }: GameState): Entity => {
  const id = generateUUID()
  const geometry = new SphereGeometry(1, 32, 16); // (radius, widthSegments, heightSegments)
  const material = new MeshBasicMaterial({ color: 0xffff00 });
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

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
