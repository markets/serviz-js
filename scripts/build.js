#!/usr/bin/env node

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);

async function buildCommonJS() {
  console.log('Building CommonJS version...');

  // Read source files
  const baseContent = await readFile(join(projectRoot, 'src/base.js'), 'utf-8');
  const workflowContent = await readFile(join(projectRoot, 'src/workflow.js'), 'utf-8');
  const indexContent = await readFile(join(projectRoot, 'src/index.js'), 'utf-8');

  // Convert ES modules to CommonJS
  const convertBaseToCommonJS = (content) => {
    let result = content;
    
    // Remove the export class declaration and add module.exports at the end
    result = result.replace(/export class Base/g, 'class Base');
    result += '\n\nmodule.exports = { Base };';
    
    return result;
  };

  const convertWorkflowToCommonJS = (content) => {
    let result = content;
    
    // Replace import with require
    result = result.replace(/import\s+{\s*Base\s*}\s+from\s+['"](.*?)['"];?/g, "const { Base } = require('./base.cjs');");
    
    // Remove the export class declaration and add module.exports at the end
    result = result.replace(/export class Workflow/g, 'class Workflow');
    result += '\n\nmodule.exports = { Workflow };';
    
    return result;
  };

  const convertIndexToCommonJS = (content) => {
    let result = content;
    
    // Replace imports with requires
    result = result.replace(/import\s+{\s*Base\s*}\s+from\s+['"](.*?)['"];?/g, "const { Base } = require('./base.cjs');");
    result = result.replace(/import\s+{\s*Workflow\s*}\s+from\s+['"](.*?)['"];?/g, "const { Workflow } = require('./workflow.cjs');");
    
    // Replace exports
    result = result.replace(/export\s+{\s*Base,\s*Workflow\s*};?/g, '');
    result = result.replace(/export\s+default\s+([^;]+);?/g, '');
    
    // Add module.exports
    result += '\n\nmodule.exports = { Base, Workflow };\nmodule.exports.default = { Base, Workflow };';
    
    return result;
  };

  // Convert files
  const baseCJS = convertBaseToCommonJS(baseContent);
  const workflowCJS = convertWorkflowToCommonJS(workflowContent);
  const indexCJS = convertIndexToCommonJS(indexContent);

  // Ensure dist directory exists
  await mkdir(join(projectRoot, 'dist'), { recursive: true });

  // Write CommonJS files
  await writeFile(join(projectRoot, 'dist/base.cjs'), baseCJS);
  await writeFile(join(projectRoot, 'dist/workflow.cjs'), workflowCJS);
  await writeFile(join(projectRoot, 'dist/index.cjs'), indexCJS);

  console.log('CommonJS build completed!');
}

buildCommonJS().catch(console.error);