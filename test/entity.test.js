import { describe, test, expect, beforeEach, vi } from 'vitest';
import { fabricMock } from './mocks/fabric.js';
import World from '../src/assets/script/entities/world.js';

// Mock Fabric.js
vi.mock('fabric', () => fabricMock);

import Entity from '../src/assets/script/entities/entity.js';
import { restoreConsole } from "./setup.js";
restoreConsole();

describe('Entity', () => {
  let entity;
  let world;

  beforeEach(() => {
    world = new World({ size: { x: 10, y: 10 } });
    world.size = { x: 10, y: 10 };
    world.tileSize = 50;
    
    world._createMatrix();

    // Create an actual Entity instance to get the correct methods
    entity = new Entity();
    entity.canvas = world;
    entity.left = 0;
    entity.top = 0;
    entity.getWidth = vi.fn();
    entity.getHeight = vi.fn();
  });

  describe('_getEdgeKeysSpanned', () => {
    const edgeThickness = 12;

    test('returns empty array when canvas or edges are not available', () => {
      entity.canvas.edges = null;
      let result = entity._getEdgeKeysSpanned();

      expect(result).toEqual([]);
      
      entity.canvas = null;
  
      result = entity._getEdgeKeysSpanned();
      
      expect(result).toEqual([]);
    });

    describe('horizontal covers', () => {
      beforeEach(() => {
        // Set up a N edge at `1,1->2,1`.
        entity.getWidth.mockReturnValue(world.tileSize * 2);
        entity.getHeight.mockReturnValue(edgeThickness);
        entity.left = world.tileSize;
        entity.top = world.tileSize - edgeThickness / 2;
      });

      test('spans horizontal edges for horizontal covers', () => {
        const result = entity._getEdgeKeysSpanned();
        
        expect(result).toEqual(['1,1_N', '2,1_N']);
      });

      test('calculates correct edge Y coordinate', () => {
        entity.top += world.tileSize;
        
        const result = entity._getEdgeKeysSpanned();
        
        expect(result).toEqual(['1,2_N', '2,2_N']);
      });
    });

    describe('vertical covers', () => {
      beforeEach(() => {
        // Set up a W edge at `1,1->1,2`.
        entity.getWidth.mockReturnValue(edgeThickness);
        entity.getHeight.mockReturnValue(world.tileSize * 2);
        entity.left = world.tileSize - edgeThickness / 2;
        entity.top = world.tileSize;
      });

      test('spans vertical edges for vertical covers', () => {
        const result = entity._getEdgeKeysSpanned();
        
        expect(result).toEqual(['1,1_W', '1,2_W']);
      });

      test('calculates correct edge X coordinate', () => {
        entity.left += world.tileSize;
        
        const result = entity._getEdgeKeysSpanned();
        
        expect(result).toEqual(['2,1_W', '2,2_W']);
      });
    });

    describe('edge cases', () => {
      test.todo('square entities', () => {
        // TODO: Which edge should be spanned?
      });
    });
  });
});