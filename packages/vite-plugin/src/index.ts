import type { Plugin, TransformResult } from 'vite';
import { transformJsxToJson } from './transform';

export interface ReactJsonrPluginOptions {
  /** Include patterns for files to transform */
  include?: string | string[];
  
  /** Exclude patterns for files to skip */
  exclude?: string | string[];
}

export default function reactJsonrPlugin(options: ReactJsonrPluginOptions = {}): Plugin {
  const {
    include = ['**/*.{jsx,tsx}'],
    exclude = ['node_modules/**', 'dist/**'],
  } = options;

  return {
    name: 'vite-plugin-react-jsonr',
    enforce: 'pre',
    transform(code, id): TransformResult | null {
      // Skip if file doesn't match include patterns or matches exclude patterns
      const shouldTransform = (fileId: string, includePatterns: string | string[], excludePatterns: string | string[]) => {
        const includeArray = Array.isArray(includePatterns) ? includePatterns : [includePatterns];
        const excludeArray = Array.isArray(excludePatterns) ? excludePatterns : [excludePatterns];
        
        const matchesInclude = includeArray.some(pattern => {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(fileId);
        });
        const matchesExclude = excludeArray.some(pattern => {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(fileId);
        });
        return matchesInclude && !matchesExclude;
      };

      if (!shouldTransform(id, include, exclude)) {
        return null;
      }

      try {
        const result = transformJsxToJson(code, id);
        
        return {
          code: result.code,
          map: null,
        };
      } catch (error: any) {
        this.error(`Failed to transform ${id}: ${error.message || error}`);
        return null;
      }
    },
  };
} 