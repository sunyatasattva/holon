import { fabric } from "fabric";
import Tile from "./tile";
import Walker from "./walker";
import World from "./world";

interface AoEPropSchema {
  color: string;
  lifeTime?: number;
  parentId?: string;
  world: typeof World;
}

export default class AreaOfEffect {
  private area: Tile[];
  private color: string;
  private lifeTime: number;
  private group: typeof fabric.Group;
  private parent: typeof Walker;
  private world: typeof World;

  constructor(
    { 
      color,
      lifeTime,
      parentId,
      world 
    }: AoEPropSchema
  ) {
    this.color = color;
    this.lifeTime = lifeTime;
    this.world = world;

    if(parentId) {
      const parent = world.activeObjects.find(o => o.id === parentId);

      this.parent = parent;
      parent.addChild(this);

      console.log("This AoE belongs to ", parent);
    }
  }

  destroy() {
    this.world.remove(this.group);

    this.world.renderAll();

    if(this.parent)
      this.parent.children = this.parent.children.filter(child => child !== this);
  }

  set({ area, group }: { area: Tile[], group: typeof fabric.Group }) {
    this.area = area;
    this.group = group;

    group.lockMovementX = true;
    group.lockMovementY = true;
    group.selectable = true;
    group.type = "aoe";

    group.setColor(this.color);
  }

  tick() {
    console.warn("Ticking", this.parent.attributes.name, this.lifeTime);

    if(--this.lifeTime === 0)
      this.destroy();
  }
}