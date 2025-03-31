import type { Plugin, TransformResult } from 'vite';
import { transformJsxToJson } from './transform';
import path from 'path';

const logger = {
  log: (...args: any[]) => {
    console.log('[plugin:react-jsonr]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[plugin:react-jsonr]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[plugin:react-jsonr]', ...args);
  },
  info: (...args: any[]) => {
    console.info('[plugin:react-jsonr]', ...args);
  },
  debug: (...args: any[]) => {
    console.debug('[plugin:react-jsonr]', ...args);
  },
};

export interface ReactJsonrPluginOptions {
  /** Include patterns for files to transform */
  include?: string | string[];
  
  /** Exclude patterns for files to skip */
  exclude?: string | string[];
  
  /** Output directory for JSON files (relative to build output) */
  outputDir?: string;
}

export default function reactJsonrPlugin(options: ReactJsonrPluginOptions = {}): Plugin {
  const {
    include = ['**/*.{jsx,tsx}'],
    exclude = ['node_modules/**', 'dist/**'],
    outputDir = 'jsonr',
  } = options;

  // Store transformations to be emitted during bundle generation
  const transformations: Record<string, { id: string, json: string }> = {};

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

  return {
    name: 'vite-plugin-react-jsonr',
    enforce: 'pre',
    
    transform(code, id): TransformResult | null {
      if (!shouldTransform(id, include, exclude)) {
        return null;
      }

      try {
        logger.log('collecting transform for', id);
        const result = transformJsxToJson(code, id);
        
        // Store the transformation for later use but don't replace original code
        transformations[id] = {
          id,
          json: result.json || JSON.stringify({})
        };

        // Return null to keep original behavior
        return null;
      } catch (error: any) {
        logger.error(`Failed to transform ${id}: ${error.message || error}`);
        // Still return null to preserve original behavior
        return null;
      }
    },

    generateBundle(outputOptions, bundle) {
      // Create JSON files for each transformed component
      for (const [id, { json }] of Object.entries(transformations)) {
        // Generate filename based on original file path
        const relativePath = path.relative(process.cwd(), id);
        // Remove 'src/' from the path
        const pathWithoutSrc = relativePath.replace(/^src\//, '');
        const dirName = path.dirname(pathWithoutSrc);
        const baseName = path.basename(pathWithoutSrc, path.extname(pathWithoutSrc));
        
        // Create path for JSON file (preserving directory structure without src)
        const jsonFileName = path.join(outputDir, dirName, `${baseName}.json`);
        
        // Add to bundle
        this.emitFile({
          type: 'asset',
          fileName: jsonFileName,
          source: json
        });
        
        logger.log(`Emitted JSON file: ${jsonFileName}`);
      }
    }
  };
} 