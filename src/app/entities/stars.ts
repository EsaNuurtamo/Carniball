import { GameState } from "../index";
import { Entity } from "../types";
import { Material, Mesh } from "three";
import { MeshBasicMaterial, SphereGeometry } from "three";

export const createBallMesh = (radius: number): Mesh => {
  const geometry = new SphereGeometry(radius, 10, 8); // (radius, widthSegments, heightSegments)
  const material: Material = new MeshBasicMaterial({ color: 0xfffff0 });
  const mesh = new Mesh(geometry, material);
  return mesh;
};

//TODO: generate more of these and add logic for draw distance
export const createStars = ({ scene, objects }: GameState): Entity[] => {
  const balls: Entity[] = [];

  //create start to random locations
  for (let i = 0; i < 100; i++) {
    const radius = Math.random() * 2;
    const mesh = createBallMesh(radius);
    const [x, y, z] = [0, 0, 0];
    const drawDistance = 100;
    mesh.translateX(x + (Math.random() * drawDistance - drawDistance / 2));
    mesh.translateY(y + (Math.random() * drawDistance - drawDistance / 2));
    mesh.translateZ(z + (Math.random() * drawDistance - drawDistance / 2));
    const id = mesh.uuid;
    balls.push({
      id,
      mesh,
      remove: () => {
        objects.splice(objects.findIndex(el => el.id === id), 1)
        mesh.removeFromParent()
      },
      update: () => null,
      radius,
    });
  }
  scene.add(...balls.map((el) => el.mesh));
  return balls;
};
