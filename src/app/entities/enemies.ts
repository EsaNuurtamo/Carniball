import { generateUUID } from 'three/src/math/MathUtils'
import { EntityData } from './../types'
import { GameState } from "./../index";
import { Entity } from "../types";
import { Mesh, Vector3 } from "three";
import { MeshBasicMaterial, SphereGeometry } from "three";

export const enemies: Record<string, Entity> = {}

const updatePosition = (enemy: Entity, data: EntityData) => {
  enemy.mesh.position.set(data.position.x, data.position.y, data.position.z)
}

export const createEnemy = (state: GameState, data: EntityData): Entity => {
  const geometry = new SphereGeometry(1, 32, 16); // (radius, widthSegments, heightSegments)
  const material = new MeshBasicMaterial({ color: 0xffff00 });  
  const mesh = new Mesh(geometry, material);
  state.scene.add(mesh)
  return {
    id: generateUUID(),
    mesh,
    remove: mesh.removeFromParent
  };
};

export const updateEnemies = (state: GameState, entities: EntityData[]): Entity[] => {
  entities.forEach(data => {
    if(data.id === state.player?.id) return 
    if(!enemies[data.id]){
      const newEnemy = createEnemy(state, data) 
      enemies[data.id] = newEnemy 
      state.objects.push(newEnemy)
    }
    updatePosition(enemies[data.id], data)
  })
  console.log(enemies)
  return Object.values(enemies);
};
