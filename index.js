const start = require('./lib/valid-startup');
const scan = require('./lib/req-scan');
const log = require('./lib/logger');
// const printTree = require('./lib/print-tree');

const project = start();

log(`/${project.name}`);

// const jsFiles = getJsFiles(project.root);
// printTree(0, jsFiles);

const fileList = scan.getGraph([], project.root);
const graph = scan.graphReqs(fileList);

log(graph);
