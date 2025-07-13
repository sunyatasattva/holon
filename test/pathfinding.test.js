import { describe, test, expect, beforeEach, vi } from 'vitest';
import { fabricMock } from './mocks/fabric.js';

// Mock Fabric.js
vi.mock('fabric', () => fabricMock);

import World from '../src/assets/script/entities/world.js';
import { restoreConsole } from "./setup.js";

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
      const startTile = world.matrix[5][5];
      
      world.getEdgeBetween(startTile, world.matrix[4][5]).pathable = false;
      
      const generator = world.searchAroundTile(startTile, 'pathableOnly');
      
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
      const generator = world.searchAroundTile(startTile, 'pathableOnly');
      
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
      
      const [ area ] = world.calculateRange(startTile, 3, 0, 'pathableOnly');
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
      
      const areas = world.calculateRange(startTile, 10, 0, 'pathableOnly');
  
      expect(areas[0].length).toBe(0);
    });
  });

  describe('Diagonal Movement Validation', () => {
    describe('_validateDiagonalMovement', () => {
      test('allows diagonal movement when all edges are pathable', () => {
        const fromTile = { x: 5, y: 5 };
        const toTile = { x: 4, y: 4 };
        
        const result = world._validateDiagonalMovement(fromTile, toTile, -1, -1);
        
        expect(result).toBe(toTile);
      });
  
      test('blocks diagonal movement when forward path is blocked', () => {
        const fromTile = { x: 5, y: 5 };
        const toTile = { x: 4, y: 4 };
        
        world.getEdgeBetween(fromTile, { x: 4, y: 5 }).pathable = false;
        
        const result = world._validateDiagonalMovement(fromTile, toTile, -1, -1);
        
        expect(result).toBe(null);
      });
  
      test('blocks diagonal movement when reverse path is blocked', () => {
        const fromTile = { x: 5, y: 5 };
        const toTile = { x: 4, y: 4 };
        
        world.getEdgeBetween(toTile, { x: 5, y: 4 }).pathable = false;
        
        const result = world._validateDiagonalMovement(fromTile, toTile, -1, -1);
        
        expect(result).toBe(null);
      });
  
      test('ensures movement symmetry - if A→B blocked, then B→A also blocked', () => {
        const tileA = { x: 3, y: 3 };
        const tileB = { x: 2, y: 2 };
        
        world.getEdgeBetween(tileA, { x: 2, y: 3 }).pathable = false;
        
        // Test movement A→B
        const resultAtoB = world._validateDiagonalMovement(tileA, tileB, -1, -1);
        
        // Test movement B→A (should also be blocked due to bi-directional checking)
        const resultBtoA = world._validateDiagonalMovement(tileB, tileA, 1, 1);
        
        expect(resultAtoB).toBe(null);
        expect(resultBtoA).toBe(null);
      });
  
      test('handles all diagonal directions correctly', () => {
        const centerTile = { x: 5, y: 5 };
        
        const directions = [
          { target: { x: 4, y: 4 }, delta: [-1, -1], name: 'NW' },
          { target: { x: 6, y: 4 }, delta: [1, -1], name: 'NE' },
          { target: { x: 4, y: 6 }, delta: [-1, 1], name: 'SW' },
          { target: { x: 6, y: 6 }, delta: [1, 1], name: 'SE' }
        ];
        
        directions.forEach(({ target, delta, name }) => {
          const result = world._validateDiagonalMovement(centerTile, target, delta[0], delta[1]);
          expect(result, `${name} movement should be allowed`).toBe(target);
        });
      });
  
      test('returns null when intermediate positions are out of bounds', () => {
        const fromTile = { x: 0, y: 0 };
        const toTile = { x: -1, y: -1 };
        
        const result = world._validateDiagonalMovement(fromTile, toTile, -1, -1);
        
        expect(result).toBe(null);
      });
    });
  
    describe('diagonal movement through getTilesAdjacentTo', () => {
      test('returns diagonal neighbors when all paths are clear', () => {
        const tile = { x: 5, y: 5 };
        const diagonal = world.getTilesAdjacentTo(tile, { diagonal: true, type: 'pathableOnly' });
        
        expect(diagonal).toHaveLength(4);
        
        const positions = diagonal.map(({ x, y }) => ({ x, y }));
        expect(positions).toContainEqual({ x: 4, y: 4 });
        expect(positions).toContainEqual({ x: 6, y: 4 });
        expect(positions).toContainEqual({ x: 4, y: 6 });
        expect(positions).toContainEqual({ x: 6, y: 6 });
      });
  
      test('filters out blocked diagonal movements', () => {
        const tile = { x: 5, y: 5 };
        
        // Block northwest diagonal by blocking the west edge
        const westEdge = world.getEdgeBetween(tile, { x: 4, y: 5 });
        westEdge.pathable = false;
        
        const diagonal = world.getTilesAdjacentTo(tile, { diagonal: true, type: 'pathableOnly' });
        const positions = diagonal.map(t => ({ x: t.x, y: t.y }));
        
        // Northwest should be filtered out (blocked by west edge)
        expect(positions).not.toContainEqual({ x: 4, y: 4 });
        
        // Southwest should also be filtered out due to bi-directional validation
        // (the reverse path from SW to center would be blocked by the same west edge)
        expect(positions).not.toContainEqual({ x: 4, y: 6 });
        
        // Northeast and Southeast should still be present
        expect(positions).toContainEqual({ x: 6, y: 4 }); // Northeast
        expect(positions).toContainEqual({ x: 6, y: 6 }); // Southeast
      });
    });
  
    describe('edge blocking scenarios', () => {
      test('prevents corner-cutting through blocked edges', () => {
        const tile = { x: 3, y: 3 };
        
        // Create an L-shaped barrier
        world.getEdgeBetween(tile, { x: 2, y: 3 }).pathable = false; // West edge
        world.getEdgeBetween(tile, { x: 3, y: 2 }).pathable = false; // North edge
        
        const diagonal = world.getTilesAdjacentTo(tile, { diagonal: true, type: 'pathableOnly' });
        const positions = diagonal.map(({ x, y }) => ({ x, y }));
        
        // Northwest diagonal should be blocked (corner-cutting prevention)
        expect(positions).not.toContainEqual({ x: 2, y: 2 });
      });
  
      test('handles partial edge blocking correctly', () => {
        const tile = { x: 4, y: 4 };
        
        // Block only the north edge
        world.getEdgeBetween(tile, { x: 4, y: 3 }).pathable = false;
        
        const diagonal = world.getTilesAdjacentTo(tile, { diagonal: true, type: 'pathableOnly' });
        const positions = diagonal.map(({ x, y }) => ({ x, y }));
        
        // Northeast and northwest should be blocked
        expect(positions).not.toContainEqual({ x: 3, y: 3 });
        expect(positions).not.toContainEqual({ x: 5, y: 3 });
        
        // Southeast and southwest should still be available
        expect(positions).toContainEqual({ x: 3, y: 5 });
        expect(positions).toContainEqual({ x: 5, y: 5 });
      });
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
  });
});