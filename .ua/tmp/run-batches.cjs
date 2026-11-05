const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = 'e:/Springboot/SBA301_PC_ABMS/SBA301_PC_ABMS';
const uaDir = path.join(projectRoot, '.ua');
const intermediateDir = path.join(uaDir, 'intermediate');
const tmpDir = path.join(uaDir, 'tmp');
const skillDir = 'C:/Users/Admin/.understand-anything-plugin/skills/understand';

const batchesData = JSON.parse(fs.readFileSync(path.join(intermediateDir, 'batches.json'), 'utf8'));

for (const batch of batchesData.batches) {
  const i = batch.batchIndex;
  const inputFile = path.join(tmpDir, `ua-file-analyzer-input-${i}.json`);
  const extractFile = path.join(tmpDir, `ua-file-extract-results-${i}.json`);
  const batchOutputFile = path.join(intermediateDir, `batch-${i}.json`);

  const input = {
    projectRoot,
    batchFiles: batch.files,
    batchImportData: batch.batchImportData || {}
  };
  fs.writeFileSync(inputFile, JSON.stringify(input, null, 2));

  // Run extract-structure.mjs
  try {
    execSync(`node "${skillDir}/extract-structure.mjs" "${inputFile}" "${extractFile}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Error extracting batch ${i}:`, err);
    continue;
  }

  const extractData = JSON.parse(fs.readFileSync(extractFile, 'utf8'));
  const nodes = [];
  const edges = [];

  for (const res of extractData.results) {
    const fPath = res.path;
    let nodeType = 'file';
    let prefix = 'file:';
    if (res.fileCategory === 'docs') { nodeType = 'document'; prefix = 'document:'; }
    else if (res.fileCategory === 'config') { nodeType = 'config'; prefix = 'config:'; }
    else if (res.fileCategory === 'script') { nodeType = 'script'; prefix = 'script:'; }

    const fileNodeId = `${prefix}${fPath}`;
    nodes.push({
      id: fileNodeId,
      type: nodeType,
      name: path.basename(fPath),
      filePath: fPath,
      summary: `${res.fileCategory} file in ${res.language || 'unknown'} with ${res.totalLines || 0} lines`,
      tags: [res.fileCategory, res.language || 'code'].filter(Boolean),
      complexity: (res.totalLines > 300 ? 'moderate' : 'simple')
    });

    // Classes
    if (Array.isArray(res.classes)) {
      for (const cls of res.classes) {
        const clsId = `class:${fPath}:${cls.name}`;
        nodes.push({
          id: clsId,
          type: 'class',
          name: cls.name,
          filePath: fPath,
          lineRange: [cls.startLine, cls.endLine],
          summary: `Class ${cls.name}`,
          tags: ['class', res.language],
          complexity: 'simple'
        });
        edges.push({
          source: fileNodeId,
          target: clsId,
          type: 'contains'
        });

        if (Array.isArray(cls.methods)) {
          for (const m of cls.methods) {
            const mId = `function:${fPath}:${m.name}`;
            nodes.push({
              id: mId,
              type: 'function',
              name: m.name,
              filePath: fPath,
              lineRange: [m.startLine, m.endLine],
              summary: `Method ${m.name} of ${cls.name}`,
              tags: ['method', res.language],
              complexity: 'simple'
            });
            edges.push({
              source: clsId,
              target: mId,
              type: 'contains'
            });
          }
        }
      }
    }

    // Top-level functions
    if (Array.isArray(res.functions)) {
      for (const fn of res.functions) {
        const fnId = `function:${fPath}:${fn.name}`;
        nodes.push({
          id: fnId,
          type: 'function',
          name: fn.name,
          filePath: fPath,
          lineRange: [fn.startLine, fn.endLine],
          summary: `Function ${fn.name}`,
          tags: ['function', res.language],
          complexity: 'simple'
        });
        edges.push({
          source: fileNodeId,
          target: fnId,
          type: 'contains'
        });
      }
    }

    // Imports
    const imports = (batch.batchImportData && batch.batchImportData[fPath]) || [];
    for (const imp of imports) {
      edges.push({
        source: fileNodeId,
        target: `file:${imp}`,
        type: 'imports'
      });
    }
  }

  fs.writeFileSync(batchOutputFile, JSON.stringify({ nodes, edges }, null, 2));
  console.log(`Wrote batch-${i}.json with ${nodes.length} nodes, ${edges.length} edges`);
}
console.log('All batches generated successfully!');
