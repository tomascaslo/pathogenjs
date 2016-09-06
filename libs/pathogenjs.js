'use strict';

var fs = require('fs');
var path = require('path');
var spawnSync = require('child_process').spawnSync;

var ini = require('ini');
var rimraf = require('rimraf');

var utils = require('./utils');
var bufferToString = utils.bufferToString;
var find = utils.find;
var getPathToDepsFile = utils.getPathToDepsFile;
var getPathToBundleDir = utils.getPathToBundleDir;
var getRepoNameFromURL = utils.getRepoNameFromURL;
var saveJSON = utils.saveJSON;
var printOutput = utils.printOutput;

var constants = {
  githubUrl: 'https://www.github.com/',
  gitCmd: 'git'
};

exports.install = function install(repo, options) {
  var pathToDeps = getPathToDepsFile(options.to);
  var pathToBundle = getPathToBundleDir(null, options.customPathBundle);
  var deps = require(pathToDeps);
  var from = repo;
  var save = options.save;
  var args = [];
  var gitUrl;
  var results;

  if (from) {
    printOutput(( 'Installing ' + from + '...' ).green);
    gitUrl = constants.githubUrl + from;
    args = ['clone', gitUrl];
    results = spawnSync(constants.gitCmd, args, { cwd: pathToBundle });
    printOutput(bufferToString(results.stdout).green);
    printOutput(bufferToString(results.stderr).red);
    if (save) {
      // eslint-disable-next-line func-names
      var depName = find(from.split(path.sep).reverse(), function(e) {
        if (e === '') { return false; }
        return true;
      });
      deps[depName] = from;
      saveJSON(pathToDeps, deps);
    }
  } else {
    for (var dep in deps) { // eslint-disable-line guard-for-in
      printOutput(( 'Installing ' + dep + '...' ).green);
      gitUrl = constants.githubUrl + deps[dep];
      args = ['clone', gitUrl];
      results = spawnSync(constants.gitCmd, args, { cwd: pathToBundle });
      printOutput(bufferToString(results.stdout).green);
      printOutput(bufferToString(results.stderr).red);
    }
  }
};

exports.update = function update(dep, options) {
  var pathToBundle = getPathToBundleDir();
  var all = options.all;
  var args = ['pull', 'origin', 'master'];
  var results;
  var tmpPath;

  if (dep) {
    tmpPath = path.join(pathToBundle, dep);
    // eslint-disable-next-line func-names
    fs.stat(tmpPath, function(err, stats) {
      if (err) { throw err; }
      if (stats.isDirectory()) {
        printOutput(( 'Updating ' + dep + '...' ).green);
        results = spawnSync(constants.gitCmd, args, { cwd: tmpPath });
        printOutput(bufferToString(results.stdout).green);
        printOutput(bufferToString(results.stderr).red);
      }
    });
  } else if (all) {
    var pathToDeps = getPathToDepsFile(options.to);
    var deps = require(pathToDeps);
    // eslint-disable-next-line func-names
    Object.keys(deps).forEach(function(name) {
      tmpPath = path.join(pathToBundle, name);

      // eslint-disable-next-line func-names, no-shadow
      (function(tmpPath) {
        // eslint-disable-next-line func-names
        fs.stat(tmpPath, function(err, stats) {
          if (err) { throw err; }
          if (stats.isDirectory()) {
            printOutput(('Updating ' + name + '...').green);
            results = spawnSync(constants.gitCmd, args, { cwd: tmpPath });
            printOutput(bufferToString(results.stdout).green);
            printOutput(bufferToString(results.stderr).red);
          }
        });
      })(tmpPath);
    });
  }
};

exports.remove = function remove(dep, options) {
  var pathToDeps = getPathToDepsFile(options.to);
  var pathToBundle = getPathToBundleDir(null, options.customPathBundle);
  var deps = require(pathToDeps);
  var depToDelete = path.join(pathToBundle, dep);

  // eslint-disable-next-line func-names
  rimraf(depToDelete, function() {
    delete deps[dep];
    saveJSON(pathToDeps, deps);
  });
};

exports.build = function build() {
  var pathToDeps = getPathToDepsFile(pathToDeps);
  var pathToBundle = getPathToBundleDir();
  var deps = require(pathToDeps);
  var tmpPath;
  var gitConfig;
  var repoUrl;
  var depData;

  // eslint-disable-next-line func-names
  fs.readdir(pathToBundle, function(err, files) {
    if (err) { throw err; }

    // eslint-disable-next-line func-names
    files.forEach(function(file, index) {
      tmpPath = path.join(pathToBundle, file);

      // eslint-disable-next-line func-names, no-shadow
      (function(tmpPath) {
        // eslint-disable-next-line func-names, no-shadow
        fs.stat(tmpPath, function(err, stats) {
          if (err) { throw err; }
          if (stats.isDirectory()) {
            // eslint-disable-next-line no-param-reassign
            tmpPath = path.join(tmpPath, '.git', 'config');
            gitConfig = ini.parse(fs.readFileSync(tmpPath, 'utf-8'));
            repoUrl = gitConfig['remote "origin"'].url;
            depData = getRepoNameFromURL(repoUrl);
            if (depData && typeof depData !== 'undefined') {
              deps[depData.name] = depData.repo;
            }
            if (index === (files.length - 1)) {
              saveJSON(pathToDeps, deps);
              printOutput('Successfully updated `.pathogenjs.json`.'.green);
            }
          }
        });
      })(tmpPath);
    });
  });
};
