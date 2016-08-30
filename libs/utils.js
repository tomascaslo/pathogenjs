'use strict';

var fs = require('fs');
var path = require('path');

var jsonfile = require('jsonfile');

function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

function getPathToDepsFile(pathToDeps) {
  if (pathToDeps && isAccessable(pathToDeps)) { // Check for user cli specified path
    return pathToDeps;
  } else {
    pathToDeps = process.env.PATHOGENJS;	
    if (pathToDeps && isAccessable(pathToDeps)) { // Check for path specified in the PATHOGENJS env var
      return pathToDeps;
    } else {
      pathToDeps = path.join(getUserHome(), '.pathogenjs.json');
      if (!isAccessable(pathToDeps)) { // Use default file if exists
        jsonfile.writeFileSync(pathToDeps, {});
      } 
      return pathToDeps;
    }
  }
}

function getPathToBundleDir() { // Currently just support the default bundle dir path
  return path.join(getUserHome(), '.vim/bundle');
}

function isAccessable(path) {
  try {
    fs.accessSync(path, fs.F_OK);
    return true;
  } catch(e) {
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

function saveJSON(path, obj) {
  jsonfile.writeFileSync(path, obj, { spaces: 2 });
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
    buffer.forEach(function(b) {
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
