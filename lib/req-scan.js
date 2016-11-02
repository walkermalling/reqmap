const fs = require('fs');
const ramda = require('ramda');

const log = require('./logger');

const compose = ramda.compose;
const map = ramda.map;
const head = ramda.head;
const filter = ramda.filter;
const slice = ramda.slice;
const defaultTo = ramda.defaultTo;
const curry = ramda.curry;
const flatten = ramda.flatten;
const tail = ramda.tail;
const sort = ramda.sort;

/* eslint-disable no-unused-vars */
const inspect = (thing) => {
  console.log(thing);
  return thing;
};
/* eslint-enable no-unused-vars */

function getExtensionFilter(target) {
  return filter(
    compose(
      (ext) => ext === target,
      head,
      defaultTo([null]),
      (str) => str.match(/\.[0-9a-z~#-]+$/i)
    )
  );
}

function isDirException(name) {
  const exceptions = [
    'node_modules',
    'Vagrantfile',
  ];
  return exceptions.some((ex) => name === ex);
}

function sortByChar(a, b) {
  if (a[0] === b[0]) {
    return sortByChar(tail(a), tail(b));
  }
  return a[0] > b[0];
}

const alphabetize = sort(sortByChar);

function getJsFiles(root) {
  const result = {
    files: {},
    dirs: {},
  };
  const files = fs.readdirSync(root);
  const jsFiles = getExtensionFilter('.js')(files);
  const dirs = compose(
    filter((fileName) => fileName !== 'node_modules'),
    getExtensionFilter(null)
  )(files);

  jsFiles.forEach((fileName) => {
    var fileContents = fs.readFileSync(`${root}/${fileName}`, { encoding: 'utf-8' });
    var requires = fileContents.match(/require\(['"]([^'"]+)['"]\);/ig);
    if (requires) {
      result.files[fileName] = map(
        (match) => slice(match.indexOf('(') + 2, match.lastIndexOf(')') - 1, match)
      )(requires);
    } else {
      result.files[fileName] = null;
    }
  });

  dirs.forEach((dirName) => {
    if (fs.lstatSync(`${root}/${dirName}`).isDirectory()) {
      result.dirs[dirName] = getJsFiles(`${root}/${dirName}`);
    }
  });

  return result;
}

const getGraph = curry((startData, root) => {
  const dirContents = fs.readdirSync(root);

  const files = compose(
    map((name) => `${root}/${name}`),
    getExtensionFilter('.js')
  );

  const followDir = compose(
    flatten,
    map(getGraph([])),
    map((name) => `${root}/${name}`),
    filter((fileName) => !isDirException(fileName)),
    getExtensionFilter(null)
  );

  return flatten([
    startData,
    files(dirContents),
    followDir(dirContents),
  ]);
});

const getReqs = (filePath) => compose(
  alphabetize,
  map(
    (match) => slice(
      match.indexOf('(') + 2,
      match.lastIndexOf(')') - 1,
      match
    )
  ),
  defaultTo([]),
  (fileContents) => fileContents.match(/require\(['"]([^'"]+)['"]\);/ig),
  (file) => fs.readFileSync(file, { encoding: 'utf-8' })
)(filePath);

const graphReqs = (graph) => map((filePath) => [filePath, getReqs(filePath)])(graph);


module.exports = {
  getExtensionFilter,
  getJsFiles,
  getGraph,
  graphReqs,
};
