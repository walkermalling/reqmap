'use-strict';

const fs = require('fs');
const ramda = require('ramda');

const getDir = fs.readdir;

function generateCrawler(filter) {
  return function crawl(root, cb) {
    getDir((err, data) => {
      cb(err, filter(data));
    });
  };
}
