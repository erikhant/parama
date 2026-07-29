import { describe, expect, it } from 'vitest';
import { buildEditorOptions } from './editorOptions';

describe('buildEditorOptions', () => {
  describe('compact mode', () => {
    it('hides line numbers to save horizontal space', () => {
      expect(buildEditorOptions({ compact: true, language: 'plaintext', readOnly: false }).lineNumbers).toBe('off');
    });

    it('uses a smaller font than the expanded editor', () => {
      const compact = buildEditorOptions({ compact: true, language: 'plaintext', readOnly: false });
      const expanded = buildEditorOptions({ compact: false, language: 'plaintext', readOnly: false });

      expect(compact.fontSize).toBeLessThan(expanded.fontSize);
    });
  });

  describe('expanded mode', () => {
    it('shows line numbers', () => {
      expect(buildEditorOptions({ compact: false, language: 'plaintext', readOnly: false }).lineNumbers).toBe('on');
    });
  });

  describe('suggestion categories', () => {
    it('offers no code constructs for plain text', () => {
      const { suggest } = buildEditorOptions({ compact: false, language: 'plaintext', readOnly: false });

      expect(suggest.showFunctions).toBe(false);
      expect(suggest.showClasses).toBe(false);
    });

    it('offers functions and classes for JavaScript', () => {
      const { suggest } = buildEditorOptions({ compact: false, language: 'javascript', readOnly: false });

      expect(suggest.showFunctions).toBe(true);
      expect(suggest.showClasses).toBe(true);
    });

    // Interfaces, enums and type parameters have no JavaScript equivalent.
    it('reserves type-only constructs for TypeScript', () => {
      const js = buildEditorOptions({ compact: false, language: 'javascript', readOnly: false }).suggest;
      const ts = buildEditorOptions({ compact: false, language: 'typescript', readOnly: false }).suggest;

      expect(js.showInterfaces).toBe(false);
      expect(js.showTypeParameters).toBe(false);
      expect(ts.showInterfaces).toBe(true);
      expect(ts.showTypeParameters).toBe(true);
    });

    it('always offers fields and variables', () => {
      const { suggest } = buildEditorOptions({ compact: true, language: 'json', readOnly: false });

      expect(suggest.showFields).toBe(true);
      expect(suggest.showVariables).toBe(true);
    });
  });

  it('passes read-only through', () => {
    expect(buildEditorOptions({ compact: false, language: 'html', readOnly: true }).readOnly).toBe(true);
  });

  it('wraps long lines and disables the minimap in every mode', () => {
    const options = buildEditorOptions({ compact: true, language: 'html', readOnly: false });

    expect(options.wordWrap).toBe('on');
    expect(options.minimap.enabled).toBe(false);
  });
});
