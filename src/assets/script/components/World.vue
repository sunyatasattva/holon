<template>
  <canvas id='c' width='600' height='600'></canvas>
</template>

<script>
import World from '../entities/world';

const component = {
  name: 'game-world',
  props: ['activeObjects', 'options'],
  watch: {
    activeObjects(activeObjects) {
      this.canvas.activeObjects = activeObjects;
      this.canvas.updateActiveObjectsStatus();
      this.canvas.renderAll();
    }
  },
  mounted() {
    const world = new World('c', { activeObjects: this.activeObjects });
    
    this.canvas = world;
    
    world.wrapperEl.tabIndex = 1;
    
    world.wrapperEl.addEventListener('keydown', (e) => {
      let selectedObject;

      if(e.which === 8) {
        selectedObject = world.getActiveObject();
        this.$emit('remove', selectedObject);
      }
    });
    
    world.wrapperEl.addEventListener('keydown', (e) => {
      if(e.key === 'Alt') {
        world.getObjects('walker')
          .forEach( (o) => o.displayNameLabel() );
      }
    });
    
    world.wrapperEl.addEventListener('keyup', (e) => {
      if(e.key === 'Alt') {
        world.getObjects('walker')
          .forEach( (o) => o.removeCurrentLabel() );
      }
    });
    
    world.wrapperEl.addEventListener('keydown', (e) => {
      let selectedObject;

      if(e.key === 'Shift') {
        selectedObject = world.getActiveObject();
        if(selectedObject && selectedObject.showVisionRange) {
          selectedObject.highlightAllHitChances();
        }
      }
    });
    
    world.wrapperEl.addEventListener('keyup', (e) => {
      let selectedObject;
      
      if(e.key === 'Shift') {
        selectedObject = world.getActiveObject();
        if(selectedObject && selectedObject.highlightedTiles.length) {
          selectedObject.showMovementRange();
          
          world.getActiveObjects('walker')
            .forEach( (o) => o.resetVisualStatus() );
        }
      }
    });
    
    // @todo Really ugly touch support implementation
    let touchStart;
    
    world.wrapperEl.addEventListener('touchstart', (e) => {
      touchStart = {
        x: e.pageX,
        y: e.pageY
      }
      
      if(e.touches.length === 3)
        this.canvas.zoomToPoint(touchStart, 1);
    });
    
    world.wrapperEl.addEventListener('touchmove', (e) => {
      let newZoom = this.canvas.getZoom() * e.scale,
          delta = {
            x: (e.pageX - touchStart.x), 
            y: (e.pageY - touchStart.y)
          };

      if(e.touches.length === 2) {
        if(newZoom > 2 || newZoom < 0.5)
          return;

        this.canvas.zoomToPoint(
          { x: e.pageX, y: e.pageY }, 
          newZoom
        );
      }
      else if( !this.canvas.getActiveObject() ) {
        this.canvas.relativePan(delta);
        
        touchStart = {
          x: e.pageX,
          y: e.pageY
        };
      }
    });
    
    world.on('object:addedAsActive', (opts) => {
      this.$emit('add', opts.objects, opts.save);
    });
    
    world.on('object:modified', () => {
      // @todo add auto-save setting
      this.$parent.saveGame();
    });
    
    world.on('object:selected', (e) => {
      let newObject = e.target,
          oldObject = this.$parent.selectedObject;

      if(oldObject){
        oldObject.fire('deselected');
      }
      
      this.$emit('select', newObject);
    });
    
    world.on('selection:cleared', (e) => {
      this.$emit('select', false);
    });
    
    world.on('mouse:down', (opts) => {
      let addingObject = this.options.isAddingObject,
          e = opts.e,
          p = this.canvas.getPointer(e),
          coords;

      if(!addingObject)
        return;
      else {
        coords = this.canvas.getCoordinatesOfTile(
          this.canvas.getTileFromCoordinates(p.x, p.y)
        );
        
        addingObject.set({
          left: coords.topLeft[0],
          top: coords.topLeft[1]
        });
        
        this.canvas.addAsActiveObject(addingObject);
        
        this.$emit('toggle', 'isAddingObject');
      }
    });
    
    world.on('mouse:over', (e) => {
      let selectedObject = this.canvas.getActiveObject(),
          target = e.target;
      
      if(selectedObject
         && selectedObject.calculateChanceToHit
         && selectedObject.isValidTarget(target)) {
          target._highlightChanceToBeHitBy(selectedObject);
      }
      else if(target.displayNameLabel)
        target.displayNameLabel();
    });
    
    world.on('mouse:out', (e) => {
      if(e.target && e.target.currentLabel)
        e.target.resetVisualStatus();
    });
    
    world.on('mouse:wheel', (opts) => {
      let e = opts.e,
          newZoom = this.canvas.getZoom() + e.deltaY / 300;
      
      e.preventDefault();
      
      if(newZoom > 2 || newZoom < 0.5)
        return;
      
      this.canvas.zoomToPoint(
        { x: e.offsetX, y: e.offsetY }, 
        newZoom
      );

      return false;
    });
    
    world.on('mouse:move', (opts) => {
      let e = opts.e;
      
      if(e.button === 2) {
        this.canvas.relativePan(
          { x: e.movementX, y: e.movementY }
        );
      }
    });
  },
  methods: {
    toggleEditMode() {
      this.canvas.getObjects('cover').forEach((o) => {
        let currentSelectableState = o.get('selectable');

        o.set('selectable', !currentSelectableState);
      });
    }
  }
};

export default component
</script>

<style scoped>

</style>
