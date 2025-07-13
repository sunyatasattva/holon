import { describe, test, expect } from 'vitest';
import Edge from '../src/assets/script/entities/edge.js';

describe('Edge', () => {
  describe('getDirectionFrom', () => {
    describe('horizontal edges', () => {
      test('returns N for southward movement across edge', () => {
        const edge = new Edge(0, 5, 'horizontal');
        const fromTile = { x: 0, y: 5 };
        
        expect(edge.getDirectionFrom(fromTile)).toBe('N');
      });

      test('returns S for northward movement across edge', () => {
        const edge = new Edge(0, 5, 'horizontal');
        const fromTile = { x: 0, y: 4 };
        
        expect(edge.getDirectionFrom(fromTile)).toBe('S');
      });

      test('returns null for non-adjacent tiles', () => {
        const edge = new Edge(0, 5, 'horizontal');
        const fromTile = { x: 0, y: 10 };
        
        expect(edge.getDirectionFrom(fromTile)).toBe(null);
      });
    });

    describe('vertical edges', () => {
      test('returns W for eastward movement across edge', () => {
        const edge = new Edge(5, 0, 'vertical');
        const fromTile = { x: 5, y: 0 };
        
        expect(edge.getDirectionFrom(fromTile)).toBe('W');
      });

      test('returns E for westward movement across edge', () => {
        const edge = new Edge(5, 0, 'vertical');
        const fromTile = { x: 4, y: 0 };
        
        expect(edge.getDirectionFrom(fromTile)).toBe('E');
      });

      test('returns null for non-adjacent tiles', () => {
        const edge = new Edge(5, 0, 'vertical');
        const fromTile = { x: 10, y: 0 };
        
        expect(edge.getDirectionFrom(fromTile)).toBe(null);
      });
    });
  });
});