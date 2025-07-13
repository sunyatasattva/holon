import { vi } from 'vitest';

// Shared Fabric.js mock for all tests
export const fabricMock = {
  fabric: {
    util: {
      createClass: (baseClass, ...mixins) => {
        // Generic constructor factory that works with any base class
        function MockClass(options = {}) {
          // Mock the callSuper method
          this.callSuper = vi.fn();
          
          // Apply base class methods based on the base class type
          if (baseClass === fabricMock.fabric.Canvas) {
            // Canvas-specific methods for World
            this.setHeight = vi.fn();
            this.setWidth = vi.fn();
            this.add = vi.fn();
            this.renderAll = vi.fn();
            this.getObjects = vi.fn(() => []);
            this.remove = vi.fn();
            this.fire = vi.fn();
          } else if (baseClass === fabricMock.fabric.Object) {
            // Object-specific methods for Entity and derivatives
            this.getWidth = vi.fn(() => 50);
            this.getHeight = vi.fn(() => 50);
            this.animate = vi.fn();
            this.set = vi.fn();
            this.on = vi.fn();
            this.fire = vi.fn();
          } else if (baseClass === fabricMock.fabric.Group) {
            // Group-specific methods for Label
            this.moveTo = vi.fn();
          } else if (baseClass === fabricMock.fabric.Line) {
            // Line-specific methods
          }
          
          // Apply all mixins (like fabric.Rect.prototype, fabric.Circle.prototype)
          mixins.forEach(mixin => {
            if (mixin && typeof mixin === 'object') {
              Object.assign(this, mixin);
            }
          });
          
          // Apply the main methods object (last argument is always the methods)
          const methods = mixins[mixins.length - 1];
          if (methods && typeof methods === 'object') {
            Object.assign(this, methods);
          }
          
          // Call initialize if it exists
          if (this.initialize) {
            this.initialize(options);
          }
        }
        
        // Add static methods if they exist on the methods object
        const methods = mixins[mixins.length - 1];
        if (methods && typeof methods === 'object') {
          Object.keys(methods).forEach(key => {
            if (typeof methods[key] === 'function') {
              MockClass[key] = methods[key];
            }
          });
        }
        
        return MockClass;
      }
    },
    Canvas: class MockCanvas {
      constructor() {
        this.width = 1000;
        this.height = 1000;
      }
      add() {}
      renderAll() {}
      setHeight() {}
      setWidth() {}
      getObjects() { return []; }
      remove() {}
      fire() {}
    },
    Object: class MockObject {
      constructor() {}
      getWidth() { return 50; }
      getHeight() { return 50; }
      animate() {}
      set() {}
      on() {}
      fire() {}
    },
    Group: class MockGroup {
      constructor() {
        this.moveTo = vi.fn();
      }
    },
    Rect: class MockRect {
      constructor() {}
    },
    Circle: class MockCircle {
      constructor() {}
    },
    Line: class MockLine {
      constructor() {}
    }
  }
};