'use strict';

var fs = require('fs');
var path = require('path');

var jsonfile = require('jsonfile');

function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

function getPathToDepsFile(pathToDeps) {
  if (pathToDeps && isAccessable(pathToDeps)) {
    return pathToDeps;
  } else { // eslint-disable-line no-else-return
    pathToDeps = process.env.PATHOGENJS; // eslint-disable-line no-param-reassign
    if (pathToDeps && isAccessable(pathToDeps)) {
      return pathToDeps;
    } else { // eslint-disable-line no-else-return
      // eslint-disable-next-line no-param-reassign
      pathToDeps = path.join(getUserHome(), '.pathogenjs.json');
      if (!isAccessable(pathToDeps)) {
        jsonfile.writeFileSync(pathToDeps, {});
      }
      return pathToDeps;
    }
  }
}

function getPathToBundleDir() {
  return path.join(getUserHome(), '.vim/bundle');
}

function isAccessable(pathToFile) {
  try {
    fs.accessSync(pathToFile, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

function find(arr, fn) {
  if (!(arr instanceof Array)) {
    throw Error('`arr` must be an Array');
  }

  if (typeof fn !== 'function') {
    throw Error('`fn` must be a function');
  }

  var index = 0;
  while (!fn(arr[index])) index++;

  return arr[index];
}

function saveJSON(pathToFile, obj) {
  jsonfile.writeFileSync(pathToFile, obj, { spaces: 2 });
}

function getRepoNameFromURL(url) {
  var result = /^(?:git|https?):\/\/(?:www\.)?github\.com\/([\w-]+\/([\w\.-]+?))(?:\.git)?$/.exec(url);
  if (result && result.length > 0) {
    return {
      repo: result[1],
      name: result[2]
    };
  }
  return null;
}

function bufferToString(buffer) {
  var str = '';
  if (buffer instanceof Array) {
    buffer.forEach(function(b) { // eslint-disable-line func-names
      str += b.toString();
    });
  } else {
    str = buffer.toString();
  }
  return str;
}

exports.getUserHome = getUserHome;

exports.getPathToDepsFile = getPathToDepsFile;

exports.getPathToBundleDir = getPathToBundleDir;

exports.find = find;

exports.saveJSON = saveJSON;

exports.getRepoNameFromURL = getRepoNameFromURL;

exports.bufferToString = bufferToString;
