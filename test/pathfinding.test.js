import { describe, test, expect, beforeEach, vi } from 'vitest';
import { fabricMock } from './mocks/fabric.js';

// Mock Fabric.js
vi.mock('fabric', () => fabricMock);

import World from '../src/assets/script/entities/world.js';

describe('Pathfinding', () => {
  let world;

  beforeEach(() => {
    world = new World({ size: { x: 10, y: 10 } });
    world.tileSize = 50;
    world._createMatrix();
  });

  describe('searchAroundTile generator', () => {
    test('yields starting tile for enclosed walker', () => {
      const startTile = { x: 5, y: 5 };

      world.getEdgeBetween(startTile, { x: 4, y: 5 }).pathable = false;
      world.getEdgeBetween(startTile, { x: 6, y: 5 }).pathable = false;
      world.getEdgeBetween(startTile, { x: 5, y: 4 }).pathable = false;
      world.getEdgeBetween(startTile, { x: 5, y: 6 }).pathable = false;
      
      const generator = world.searchAroundTile(startTile);
      const firstResult = generator.next();
      
      expect(firstResult.done).toBe(false);
      expect(firstResult.value.visitedTiles).toContain(startTile);
      expect(firstResult.value.visitedTiles).toHaveLength(1);
    });

    test('explores adjacent tiles in open field', () => {
      const startTile = { x: 5, y: 5 };
      const generator = world.searchAroundTile(startTile);
      
      const firstResult = generator.next();
      expect(firstResult.value.visitedTiles).toContain(startTile);
      
      const secondResult = generator.next();
      expect(secondResult.value.visitedTiles.length).toBeGreaterThan(1);
      
      const positions = secondResult.value.visitedTiles.map(({ x, y }) => ({ x, y }));
      expect(positions).toContainEqual({ x: 4, y: 5 });
      expect(positions).toContainEqual({ x: 6, y: 5 });
      expect(positions).toContainEqual({ x: 5, y: 4 });
      expect(positions).toContainEqual({ x: 5, y: 6 });
    });

    test('respects edge blocking in exploration', () => {
      const startTile = { x: 5, y: 5 };
      
      world.getEdgeBetween(startTile, { x: 4, y: 5 }).pathable = false;
      
      const generator = world.searchAroundTile(startTile);
      
      generator.next();
      const result = generator.next();
      
      const positions = result.value.visitedTiles.map(({ x, y }) => ({ x, y }));
      
      expect(positions).not.toContainEqual({ x: 4, y: 5 });
      
      // Should include other directions
      expect(positions).toContainEqual({ x: 6, y: 5 }); // East
      expect(positions).toContainEqual({ x: 5, y: 4 }); // North
      expect(positions).toContainEqual({ x: 5, y: 6 }); // South
    });

    test('calculates correct movement costs', () => {
      const startTile = { x: 5, y: 5, costMultiplier: 1 };
      const generator = world.searchAroundTile(startTile);
      
      generator.next();
      const result = generator.next();
      
      expect(result.value.tilesCosts.get(startTile)).toBe(0);
      
      const adjacentTile = result.value.visitedTiles.find(({ x, y }) => x === 4 && y === 5);
      if (adjacentTile) {
        expect(result.value.tilesCosts.get(adjacentTile)).toBe(1);
      }
    });

    test('matrix tiles with unpathable children are not visited', () => {
      const startTile = { x: 5, y: 5 };

      world.matrix[4][5].addChild({ pathable: false });
      
      const generator = world.searchAroundTile(startTile, 'pathableOnly');
      generator.next();
      const result = generator.next();
      
      const positions = result.value.visitedTiles.map(({ x, y }) => ({ x, y }));
      
      expect(positions.length).toBeGreaterThan(0);
      expect(positions).not.toContainEqual({ x: 4, y: 5 });
    });
  });

  describe('calculateRange', () => {
    test('calculates correct range in open field', () => {
      const startTile = { x: 5, y: 5 };
      const range = 2;
      
      const areas = world.calculateRange(startTile, range);
      
      expect(areas).toHaveLength(1);
      expect(areas[0].length).toBe(13);
      
      const positions = areas[0].map(({ x, y }) => ({ x, y }));
      expect(positions).toContainEqual({ x: 3, y: 5 }); // 2 W
      expect(positions).toContainEqual({ x: 7, y: 5 }); // 2 E
      expect(positions).toContainEqual({ x: 5, y: 3 }); // 2 N
      expect(positions).toContainEqual({ x: 5, y: 7 }); // 2 S
      expect(positions).toContainEqual({ x: 4, y: 4 }); // 1 NW
      expect(positions).toContainEqual({ x: 6, y: 4 }); // 1 NE
      expect(positions).toContainEqual({ x: 4, y: 6 }); // 1 SW
      expect(positions).toContainEqual({ x: 6, y: 6 }); // 1 SE
    });

    test('respects minimum range parameter', () => {
      const startTile = { x: 5, y: 5 };
      const range = 4;
      const minRange = 3;
      
      const [ area ] = world.calculateRange(startTile, range, minRange);

      expect(area.length).toBe(28);
      
      const allPositions = area.map(({ x, y }) => ({ x, y }));

      expect(allPositions).not.toContainEqual({ x: 4, y: 5 });
      expect(allPositions).not.toContainEqual({ x: 3, y: 5 });
      expect(allPositions).not.toContainEqual({ x: 5, y: 4 });
      expect(allPositions).not.toContainEqual({ x: 5, y: 3 });
      expect(allPositions).toContainEqual({ x: 2, y: 5 }); // 3 W
      expect(allPositions).toContainEqual({ x: 5, y: 8 }); // 3 N
      expect(allPositions).toContainEqual({ x: 3, y: 7 }); // 2 SW
    });

    test('handles edge blocking in range calculation', () => {
      const startTile = { x: 5, y: 5 };
      
      // Create a wall to the west
      world.getEdgeBetween({ x: 5, y: 5 }, { x: 4, y: 5 }).pathable = false;
      world.getEdgeBetween({ x: 5, y: 4 }, { x: 4, y: 4 }).pathable = false;
      world.getEdgeBetween({ x: 5, y: 6 }, { x: 4, y: 6 }).pathable = false;
      
      const [ area ] = world.calculateRange(startTile, 3);
      const positions = area.map(({ x, y }) => ({ x, y }));
      
      expect(positions).not.toContainEqual({ x: 4, y: 5 });
      expect(positions).not.toContainEqual({ x: 3, y: 5 });
      expect(positions).not.toContainEqual({ x: 2, y: 5 });
      
      // Should include tiles in other directions
      expect(positions).toContainEqual({ x: 6, y: 5 });
      expect(positions).toContainEqual({ x: 7, y: 5 });
    });

    test('handles multiple range areas (repeat parameter)', () => {
      const startTile = { x: 5, y: 5 };
      const range = 2;
      const repeat = 2;
      
      const areas = world.calculateRange(startTile, range, 0, 'all', repeat);
      
      expect(areas).toHaveLength(2);
      
      // First area should be range 1-2
      // Second area should be range 3-4
      expect(areas[0].length).toBe(13);
      expect(areas[1].length).toBe(36);
    });

    test('returns empty area when completely enclosed', () => {
      const startTile = { x: 5, y: 5 };
      
      world.getEdgeBetween(startTile, { x: 4, y: 5 }).pathable = false;
      world.getEdgeBetween(startTile, { x: 6, y: 5 }).pathable = false;
      world.getEdgeBetween(startTile, { x: 5, y: 4 }).pathable = false;
      world.getEdgeBetween(startTile, { x: 5, y: 6 }).pathable = false;
      
      const areas = world.calculateRange(startTile, 10);
  
      expect(areas[0].length).toBe(0);
    });
  });

  describe('edge case scenarios', () => {
    test('handles grid boundaries correctly', () => {
      const cornerTile = { x: 0, y: 0 };
      const [ area ] = world.calculateRange(cornerTile, 2);

      expect(area.length).toBe(6);
      
      const positions = area.map(({ x, y }) => ({ x, y }));
      
      expect(positions).toContainEqual({ x: 1, y: 0 });
      expect(positions).toContainEqual({ x: 0, y: 1 });
      expect(positions).toContainEqual({ x: 2, y: 0 });
      expect(positions).toContainEqual({ x: 0, y: 2 });
      
      // Should not include out-of-bounds positions
      expect(positions).not.toContainEqual({ x: -1, y: 0 });
      expect(positions).not.toContainEqual({ x: 0, y: -1 });
    });

    test('enclosed tiles are not accessible', () => {
      const startTile = { x: 1, y: 1 };
      const enclosedTile = { x: 3, y: 1 };
      
      // Block all edges around tile (3,1)
      world.getEdgeBetween({ x: 3, y: 1 }, { x: 2, y: 1 }).pathable = false;
      world.getEdgeBetween({ x: 3, y: 1 }, { x: 4, y: 1 }).pathable = false;
      world.getEdgeBetween({ x: 3, y: 1 }, { x: 3, y: 0 }).pathable = false;
      world.getEdgeBetween({ x: 3, y: 1 }, { x: 3, y: 2 }).pathable = false;
      
      const [area] = world.calculateRange(startTile, 6, 0, 'pathableOnly');
      const positions = area.map(({ x, y }) => ({ x, y }));

      expect(positions).not.toContainEqual(enclosedTile);
    });
  });
});