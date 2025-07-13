import { describe, test, expect } from 'vitest';
import Tile from '../src/assets/script/entities/tile.js';

describe('Tile', () => {
  describe('child management', () => {
    test('addChild adds child to children', () => {
      const tile = new Tile(0, 0);
      const child = { id: 'test-child' };
      
      tile.addChild(child);
      
      expect(tile.getChildren()).toContain(child);
      expect(tile.getChildren()).toHaveLength(1);
    });

    test('addChild prevents duplicate children', () => {
      const tile = new Tile(0, 0);
      const child = { id: 'test-child' };
      
      tile.addChild(child);
      tile.addChild(child);
      
      expect(tile.getChildren()).toHaveLength(1);
    });

    test('removeChild removes child from children', () => {
      const tile = new Tile(0, 0);
      const child1 = { id: 'child1' };
      const child2 = { id: 'child2' };
      
      tile.addChild(child1);
      tile.addChild(child2);
      
      tile.removeChild(child1);
      
      expect(tile.getChildren()).not.toContain(child1);
      expect(tile.getChildren()).toContain(child2);
      expect(tile.getChildren()).toHaveLength(1);
    });

    test('removeChild handles non-existent child gracefully', () => {
      const tile = new Tile(0, 0);
      const child = { id: 'child' };
      const nonExistentChild = { id: 'non-existent' };
      
      tile.addChild(child);
      
      expect(() => {
        tile.removeChild(nonExistentChild);
      }).not.toThrow();
      
      expect(tile.getChildren()).toContain(child);
      expect(tile.getChildren()).toHaveLength(1);
    });
  });
});