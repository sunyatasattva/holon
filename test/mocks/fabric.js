import { vi } from 'vitest';

// Shared Fabric.js mock for all tests
export const fabricMock = {
  fabric: {
    util: {
      createClass: (baseClass, methods) => {
        function MockWorld(options = {}) {
          // Mock the callSuper method
          this.callSuper = vi.fn();
          
          // Mock Canvas methods that World inherits
          this.setHeight = vi.fn();
          this.setWidth = vi.fn();
          this.add = vi.fn();
          this.renderAll = vi.fn();
          
          // Apply all methods from the World class
          Object.assign(this, methods);
          
          if (this.initialize) {
            this.initialize(options);
          }
        }
        return MockWorld;
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
    },
    Group: class MockGroup {
      constructor() {
        this.moveTo = vi.fn();
      }
    },
    Rect: class MockRect {
      constructor() {}
    },
    Line: class MockLine {
      constructor() {}
    }
  }
};