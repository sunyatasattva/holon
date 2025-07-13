import { describe, test, expect, beforeEach, vi } from 'vitest';
import { fabricMock } from './mocks/fabric.js';

// Mock Fabric.js
vi.mock('fabric', () => fabricMock);

import Tile from '../src/assets/script/entities/tile.js';
import World from '../src/assets/script/entities/world.js';

describe('World', () => {
  let world;

  beforeEach(() => {
    world = new World({ size: { x: 10, y: 10 } });
    world.size = { x: 10, y: 10 };
    world.tileSize = 50;
    
    world._createMatrix();
  });

  describe('grid coordinate calculations', () => {
    test('getTileFromCoordinates converts pixel coordinates to grid coordinates', () => {
      expect(world.getTileFromCoordinates(0, 0)).toEqual(new Tile(0, 0));
      expect(world.getTileFromCoordinates(50, 50)).toEqual(new Tile(1, 1));
      expect(world.getTileFromCoordinates(125, 75)).toEqual(new Tile(2, 1));
      expect(world.getTileFromCoordinates(49, 49)).toEqual(new Tile(0, 0));
    });

    test('getCoordinatesOfTile converts grid coordinates to pixel boundaries', () => {
      const coords = world.getCoordinatesOfTile({ x: 1, y: 1 });
      
      expect(coords.topLeft).toEqual([50, 50]);
      expect(coords.topRight).toEqual([100, 50]);
      expect(coords.bottomRight).toEqual([100, 100]);
      expect(coords.bottomLeft).toEqual([50, 100]);
    });

    test('handles array-style tile coordinates', () => {
      const coords = world.getCoordinatesOfTile([2, 3]);
      
      expect(coords.topLeft).toEqual([100, 150]);
      expect(coords.bottomRight).toEqual([150, 200]);
    });
  });

  describe('distance calculations', () => {
    test('calculateManhattanDistance returns correct manhattan distance', () => {
      expect(world.calculateManhattanDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7);
      expect(world.calculateManhattanDistance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
      expect(world.calculateManhattanDistance({ x: 1, y: 1 }, { x: 4, y: 5 })).toBe(7);
    });

    test('calculateOctileDistance returns correct octile distance', () => {
      expect(world.calculateOctileDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5.5);
      expect(world.calculateOctileDistance({ x: 0, y: 0 }, { x: 2, y: 2 })).toBe(3);
      expect(world.calculateOctileDistance({ x: 0, y: 0 }, { x: 4, y: 0 })).toBe(4);
    });

    test('calculateOctileDistance with rounding', () => {
      expect(world.calculateOctileDistance({ x: 0, y: 0 }, { x: 3, y: 4 }, 'round')).toBe(6);
      expect(world.calculateOctileDistance({ x: 0, y: 0 }, { x: 3, y: 4 }, 'floor')).toBe(5);
      expect(world.calculateOctileDistance({ x: 0, y: 0 }, { x: 3, y: 4 }, 'ceil')).toBe(6);
    });
  });

  describe('edge system', () => {
    test('getEdgeBetween returns edge for adjacent horizontal tiles', () => {
      const tile1 = { x: 3, y: 2 };
      const tile2 = { x: 4, y: 2 };
      
      const edge = world.getEdgeBetween(tile1, tile2);
      
      expect(edge).toBeTruthy();
      expect(edge.orientation).toBe('vertical');
      expect(edge.x).toBe(4);
      expect(edge.y).toBe(2);
    });

    test('getEdgeBetween returns edge for adjacent vertical tiles', () => {
      const tile1 = { x: 2, y: 3 };
      const tile2 = { x: 2, y: 4 };
      
      const edge = world.getEdgeBetween(tile1, tile2);
      
      expect(edge).toBeTruthy();
      expect(edge.orientation).toBe('horizontal');
      expect(edge.x).toBe(2);
      expect(edge.y).toBe(4);
    });

    test('getEdgeBetween is direction-independent', () => {
      const tile1 = { x: 1, y: 1 };
      const tile2 = { x: 2, y: 1 };
      
      const edge1 = world.getEdgeBetween(tile1, tile2);
      const edge2 = world.getEdgeBetween(tile2, tile1);
      
      expect(edge1).toBe(edge2);
    });

    test('getEdgeBetween returns null for non-adjacent tiles', () => {
      const tile1 = { x: 0, y: 0 };
      const tile2 = { x: 2, y: 2 }; // Diagonal, they don't share an edge
      
      expect(world.getEdgeBetween(tile1, tile2)).toBe(null);
    });

    test('getEdgeBetween returns null for out-of-bounds tiles', () => {
      const tile1 = { x: 0, y: 0 };
      const tile2 = { x: -1, y: 0 }; // Out of bounds
      
      expect(world.getEdgeBetween(tile1, tile2)).toBe(null);
    });
  });

  describe('adjacent tile calculations', () => {
    test('getTilesAdjacentTo returns orthogonal neighbors', () => {
      const tile = { x: 5, y: 5 };
      const adjacent = world.getTilesAdjacentTo(tile, false);
      
      expect(adjacent).toHaveLength(4);
      
      const positions = adjacent.map(({ x, y }) => ({ x, y }));
      expect(positions).toContainEqual({ x: 5, y: 6 });
      expect(positions).toContainEqual({ x: 5, y: 4 });
      expect(positions).toContainEqual({ x: 6, y: 5 });
      expect(positions).toContainEqual({ x: 4, y: 5 });
    });

    test('getTilesAdjacentTo handles edge of grid', () => {
      const tile = { x: 0, y: 0 };
      const adjacent = world.getTilesAdjacentTo(tile, false);
      
      expect(adjacent).toHaveLength(2);
      
      const positions = adjacent.map(({ x, y }) => ({ x, y }));
      expect(positions).toContainEqual({ x: 0, y: 1 });
      expect(positions).toContainEqual({ x: 1, y: 0 });
    });
  });
});