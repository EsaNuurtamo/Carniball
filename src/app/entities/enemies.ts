import { EntityData } from "./../types";
import { GameState } from "./../index";
import { Entity } from "../types";
import { Mesh, TextureLoader } from "three";
import { MeshBasicMaterial, SphereGeometry } from "three";
import { socket } from "../socket";

export const enemies: Record<string, Entity> = {};

const updatePosition = (enemy: Entity, data: EntityData) => {
  enemy.mesh.position.set(data.position.x, data.position.y, data.position.z);
};

const material = new MeshBasicMaterial({
  map: new TextureLoader().load("Black_Stone_Texture.jpeg"),
});

export const createEnemy = (
  { scene, objects }: GameState,
  radius: number
): Entity => {
  const geometry = new SphereGeometry(radius, 32, 16); // (radius, widthSegments, heightSegments)
  
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);
  const id = mesh.uuid;
  return {
    id,
    mesh,
    remove: () => {
      objects.slice(
        objects.findIndex((el) => el.id === id),
        1
      );
      mesh.removeFromParent();
    },
    radius,
  };
};
socket.on("playerQuit", (player) => {
  enemies[player.id].remove();
  delete enemies[player.id];
});
export const updateEnemies = (
  state: GameState,
  entities: EntityData[]
): Entity[] => {
  entities.forEach((data) => {
    if (data.id === state.player?.id) return;
    if (!enemies[data.id]) {
      const newEnemy = createEnemy(state, data.radius);
      enemies[data.id] = newEnemy;
      state.objects.push(newEnemy);
    }
    updatePosition(enemies[data.id], data);
  });
  return Object.values(enemies);
};
