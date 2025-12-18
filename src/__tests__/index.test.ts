import { filterFiles, removeComments, analyzeFiles } from '../index.js';
import { Config } from '../types.js';
import { defaultConfig } from '../defaultConfig.js';

// Mock execSync to avoid actual git commands
jest.mock('child_process', () => ({
  execSync: jest.fn().mockImplementation((command: string) => {
    if (command.includes('git diff --name-only')) {
      return 'src/index.ts\nsrc/config.ts\nREADME.md';
    }
    if (command.includes('git diff')) {
      return '+import { execSync } from "child_process";\n+function newFunction() { console.log("test"); }';
    }
    return '';
  })
}));

describe('PR Checklist Generator', () => {
  describe('filterFiles', () => {
    it('should filter out files that match exclude patterns', () => {
      const files = [
        'src/index.ts',
        'node_modules/package/index.js',
        'dist/index.js',
        'README.md'
      ];
      
      const excludePatterns = [
        /^node_modules\//,
        /^dist\//
      ];
      
      const result = filterFiles(files, excludePatterns);
      
      expect(result).toEqual(['src/index.ts', 'README.md']);
    });
  });
  
  describe('removeComments', () => {
    it('should remove comments from code content', () => {
      const content = `
        // This is a comment
        function test() {
          /* This is a multi-line comment */
          return true;
          // Another comment
        }
        * Some JSDoc comment
      `;
      
      const result = removeComments(content);
      
      expect(result).not.toContain('// This is a comment');
      expect(result).not.toContain('/* This is a multi-line comment */');
      expect(result).not.toContain('// Another comment');
      expect(result).not.toContain('* Some JSDoc comment');
      expect(result).toContain('function test() {');
      expect(result).toContain('return true;');
    });
  });
  
  describe('analyzeFiles', () => {
    it('should analyze files and generate checklist items', () => {
      const files = ['src/index.ts', 'src/components/Button.tsx'];
      const config: Config = JSON.parse(JSON.stringify(defaultConfig));
      
      // Add some test patterns
      config.checklist.filePatterns = [
        { pattern: /\.tsx$/, item: '- [ ] React component updated' }
      ];
      
      config.checklist.contentPatterns = [
        { pattern: /console\.log/, item: '- [ ] Remove debug logs' }
      ];
      
      const result = analyzeFiles(files, config, 'HEAD~1', 'HEAD');
      
      expect(result).toContain('- [ ] React component updated');
      expect(result).toContain('- [ ] Remove debug logs');
    });
  });
}); 