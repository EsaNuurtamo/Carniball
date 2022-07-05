import { generateUUID } from 'three/src/math/MathUtils'
import { GameState } from "../index";
import { Entity } from "../types";
import { Mesh } from "three";
import { MeshBasicMaterial, SphereGeometry } from "three";

export const createBallMesh = (): Mesh => {
  const geometry = new SphereGeometry(0.1, 3, 2); // (radius, widthSegments, heightSegments)
  const material = new MeshBasicMaterial({ color: 0xfffff0 });
  const mesh = new Mesh(geometry, material);

  return mesh;
};

export const createStars = ({
  scene,
  objects,
  player
}: GameState): Entity[] => {
  const balls: Entity[] = [];

  //create random balls 
  for (let i = 0; i < 100; i++) {
    const mesh = createBallMesh();
    const [x, y, z] = [0,0,0];
    const drawDistance = 100
    mesh.translateX(x + (Math.random() * drawDistance - drawDistance/2));
    mesh.translateY(y + (Math.random() * drawDistance - drawDistance/2));
    mesh.translateZ(z + (Math.random() * drawDistance - drawDistance/2));
    balls.push({
      id: generateUUID(),
      mesh,
      remove: mesh.removeFromParent,
      update: () => null
    });
  }
  scene.add(...balls.map(el => el.mesh));
  return balls;
};
