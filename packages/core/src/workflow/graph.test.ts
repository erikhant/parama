import { beforeEach, describe, expect, it } from 'vitest';
import { DependencyGraph } from './graph';

describe('DependencyGraph', () => {
  let graph: DependencyGraph;

  beforeEach(() => {
    graph = new DependencyGraph();
  });

  describe('getDependents', () => {
    it('returns the direct dependants of a field', () => {
      graph.addDependency('country', 'city');

      expect(graph.getDependents('country')).toEqual(['city']);
    });

    it('follows the chain transitively', () => {
      graph.addDependency('country', 'province');
      graph.addDependency('province', 'city');

      expect(graph.getDependents('country').sort()).toEqual(['city', 'province']);
    });

    it('excludes the field itself', () => {
      graph.addDependency('a', 'b');
      graph.addDependency('b', 'a');

      expect(graph.getDependents('a')).toEqual(['b']);
    });

    it('terminates on a cycle instead of looping forever', () => {
      graph.addDependency('a', 'b');
      graph.addDependency('b', 'c');
      graph.addDependency('c', 'a');

      expect(graph.getDependents('a').sort()).toEqual(['b', 'c']);
    });

    it('returns an empty list for an unknown field', () => {
      expect(graph.getDependents('ghost')).toEqual([]);
    });
  });

  describe('getDependencies', () => {
    it('returns the fields a given field depends on', () => {
      graph.addDependency('country', 'city');
      graph.addDependency('language', 'city');

      expect(graph.getDependencies('city').sort()).toEqual(['country', 'language']);
    });
  });

  describe('removeField', () => {
    it('drops the field as a dependency source', () => {
      graph.addDependency('country', 'city');

      graph.removeField('country');

      expect(graph.getDependents('country')).toEqual([]);
    });

    it('drops the field from other fields dependency lists', () => {
      graph.addDependency('country', 'city');

      graph.removeField('city');

      expect(graph.getDependencies('city')).toEqual([]);
    });

    // `registerDependencies` calls `removeField` before re-adding edges, so a
    // field that stops depending on another must really lose that edge —
    // otherwise every edit in the editor grows the graph and fires stale
    // cascades.
    it('stops the removed field appearing as a dependent of others', () => {
      graph.addDependency('country', 'city');

      graph.removeField('city');

      expect(graph.getDependents('country')).toEqual([]);
    });

    it('lets a field re-register with a narrower dependency set', () => {
      graph.addDependency('country', 'city');
      graph.addDependency('language', 'city');

      graph.removeField('city');
      graph.addDependency('country', 'city');

      expect(graph.getDependents('language')).toEqual([]);
      expect(graph.getDependents('country')).toEqual(['city']);
    });
  });

  describe('hasCircularDependency', () => {
    it('is false for an acyclic graph', () => {
      graph.addDependency('a', 'b');
      graph.addDependency('b', 'c');

      expect(graph.hasCircularDependency()).toBe(false);
    });

    it('detects a direct cycle', () => {
      graph.addDependency('a', 'b');
      graph.addDependency('b', 'a');

      expect(graph.hasCircularDependency()).toBe(true);
    });

    it('detects an indirect cycle', () => {
      graph.addDependency('a', 'b');
      graph.addDependency('b', 'c');
      graph.addDependency('c', 'a');

      expect(graph.hasCircularDependency()).toBe(true);
    });
  });

  describe('addDependency', () => {
    it('is idempotent for a repeated edge', () => {
      graph.addDependency('a', 'b');
      graph.addDependency('a', 'b');

      expect(graph.getDependents('a')).toEqual(['b']);
    });
  });
});
