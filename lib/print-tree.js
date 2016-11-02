const ramda = require('ramda');
const log = require('./logger');

const map = ramda.map;
const compose = ramda.compose;
const reverse = ramda.reverse;
const defaultTo = ramda.defaultTo;
const tail = ramda.tail;
const sort = ramda.sort;

function sortByChar(a, b) {
  if (a[0] === b[0]) {
    return sortByChar(tail(a), tail(b));
  }
  return a[0] > b[0];
}

const alphabetize = sort(sortByChar);

const indent = (level) => `${new Array(level).join('|  ')}`;

function printFiles(level, files) {
  const fileNames = alphabetize(Object.keys(files));
  const fileReqs = (fileName) => compose(
    reverse,
    alphabetize,
    defaultTo([])
  )(files[fileName]);

  const logFile = (fileName) => {
    if (fileReqs(fileName).length) {
      log(`${indent(level)}├─ ${fileName} (${fileReqs(fileName).length}): [`);
      map(
        (req) => log(`${indent(level + 1)}  ${req}`),
        fileReqs(fileName)
      );
      log(`${indent(level + 1)}]`);
    } else {
      log(`${indent(level)}├─ ${fileName} (${fileReqs(fileName).length})`);
    }
  };

  map(
    (fileName) => logFile(fileName),
    fileNames
  );
}

function printTree(level, reqTree) {
  if (reqTree.files) {
    printFiles(level + 1, reqTree.files);
  }
  if (reqTree.dirs) {
    const dirs = Object.keys(reqTree.dirs);
    map(
      (dirName) => {
        const len = Object.keys(reqTree.dirs[dirName].files).length;
        if (!len) {
          return;
        }
        log(`${new Array(level + 1).join('|  ')}├─ ${dirName} (${len})`);
        if (reqTree.dirs[dirName]) {
          printTree(level + 1, reqTree.dirs[dirName]);
        }
      },
      dirs
    );
  }
}

module.exports = printTree;
