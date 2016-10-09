/* eslint no-console: ["warn", { allow: ["log", "info", "error"] }] */
'use strict';

var fs   = require('fs');
var path = require('path');

var jsonfile = require('jsonfile');

var TARGET = process.env.npm_lifecycle_event;

function getUserHome(platform) {
  // eslint-disable-next-line no-param-reassign
  platform = platform ? platform : process.platform;
  return process.env[(platform === 'win32') ? 'USERPROFILE' : 'HOME'];
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

function getPathToBundleDir(platform, customPath) {
  if (customPath && isAccessable(customPath)) {
    return customPath;
  } else { // eslint-disable-line no-else-return
    // eslint-disable-next-line no-param-reassign
    platform = platform ? platform : process.platform;
    if (platform === 'win32') {
      return path.win32.join(getUserHome(platform), 'vimfiles', 'bundle');
    } else { // eslint-disable-line no-else-return
      return path.join(getUserHome(platform), '.vim', 'bundle');
    }
  }
}

function isAccessable(pathToFile) {
  try {
    fs.accessSync(pathToFile, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

function isDirectory(pathToDir) {
  try {
    var stats = fs.statSync(pathToDir);
    return stats.isDirectory();
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
  while (!fn(arr[index]) && index < arr.length) index++;

  return arr[index] || null;
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
  if (!(buffer instanceof Buffer)) {
    throw Error('`buffer` is not an instance of `Buffer`');
  }
  return buffer.toString();
}

function printOutput(output, type) {
  type = type || 'normal'; // eslint-disable-line no-param-reassign
  if (!(/^test.*/.test(TARGET))) {
    switch (type) {
    case 'normal':
      console.info(output);
      break;
    case 'error':
      console.error(output);
      break;
    default:
      console.log(output);
    }
  }
}

exports.getUserHome = getUserHome;

exports.getPathToDepsFile = getPathToDepsFile;

exports.getPathToBundleDir = getPathToBundleDir;

exports.isAccessable = isAccessable;

exports.isDirectory = isDirectory;

exports.find = find;

exports.saveJSON = saveJSON;

exports.getRepoNameFromURL = getRepoNameFromURL;

exports.bufferToString = bufferToString;

exports.printOutput = printOutput;
