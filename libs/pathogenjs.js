'use strict';

var fs = require('fs');
var path = require('path');
var spawnSync = require('child_process').spawnSync;

var colors = require('colors');
var ini = require('ini');
var rimraf = require('rimraf');

var utils = require('./utils');
var bufferToString = utils.bufferToString;
var find = utils.find;
var getPathToDepsFile = utils.getPathToDepsFile;
var getPathToBundleDir = utils.getPathToBundleDir;
var getRepoNameFromURL = utils.getRepoNameFromURL;
var saveJSON = utils.saveJSON;

var constants = {
  githubUrl: 'https://www.github.com/',
  gitCmd: 'git'
};

exports.install = function(repo, options) {
  var pathToDeps = getPathToDepsFile(options.to);
  var pathToBundle = getPathToBundleDir();
  var deps = require(pathToDeps);
  var from = repo;
  var save = options.save;
  var args = [];
  var gitUrl, results;

  if (from) {
    console.log(( 'Installing ' + from + '...' ).green);
    gitUrl = constants.githubUrl + from;
    args = ['clone', gitUrl];
    results = spawnSync(constants.gitCmd, args, { cwd: pathToBundle });
    console.log(bufferToString(results.stdout).green);
    console.error(bufferToString(results.stderr).red);
    if (save) {
      var depName = find(from.split(path.sep).reverse(), function(e) {
        if (e === '') { return false; }
        return true;
      });
      deps[depName] = from;
      saveJSON(pathToDeps, deps);
    }
  } else {
    for (var dep in deps) {
      console.log(( 'Installing ' + dep + '...' ).green);
      gitUrl = constants.githubUrl + deps[dep];
      args = ['clone', gitUrl];
      results = spawnSync(constants.gitCmd, args, { cwd: pathToBundle });
      console.log(bufferToString(results.stdout).green);
      console.error(bufferToString(results.stderr).red);
    }
  }
};

exports.update = function(dep, options) {
  var pathToBundle = getPathToBundleDir();
  var all = options.all;
  var args = ['pull', 'origin', 'master'];
  var results, tmpPath;

  if (dep) {
    tmpPath = path.join(pathToBundle, dep);
    fs.stat(tmpPath, function(err, stats) {
      if (err) { throw err; }
      if (stats.isDirectory()) {
        console.log(( 'Updating ' + dep + '...' ).green);
        results = spawnSync(constants.gitCmd, args, { cwd: tmpPath });
        console.log(bufferToString(results.stdout).green);
        console.error(bufferToString(results.stderr).red);
      }
    });
  } else if (all) {
    var pathToDeps = getPathToDepsFile(options.to);
    var deps = require(pathToDeps);
    Object.keys(deps).forEach(function(name) {
      tmpPath = path.join(pathToBundle, name);

      (function(tmpPath) {
        fs.stat(tmpPath, function(err, stats) {
          if (err) { throw err; }
          if (stats.isDirectory()) {
            console.log(('Updating ' + name + '...').green);
            results = spawnSync(constants.gitCmd, args, { cwd: tmpPath });
            console.log(bufferToString(results.stdout).green);
            console.error(bufferToString(results.stderr).red);
          }
        });
      })(tmpPath);
    });
  }
};

exports.remove = function(dep) {
  var pathToDeps = getPathToDepsFile(pathToDeps);
  var pathToBundle = getPathToBundleDir();
  var deps = require(pathToDeps);
  var depToDelete = path.join(pathToBundle, dep);

  rimraf(depToDelete, function() {
    delete deps[dep];
    saveJSON(pathToDeps, deps);
  });
};

exports.build = function() {
  var pathToDeps = getPathToDepsFile(pathToDeps);
  var pathToBundle = getPathToBundleDir();
  var deps = require(pathToDeps);
  var tmpPath, gitConfig, repoUrl, depData;

  fs.readdir(pathToBundle, function(err, files) {
    if (err) { throw err; }
    files.forEach(function(file, index) {
      tmpPath = path.join(pathToBundle, file);

      (function(tmpPath) {
        fs.stat(tmpPath, function(err, stats) {
          if (err) { throw err; }
          if (stats.isDirectory()) {
            tmpPath = path.join(tmpPath, '.git', 'config');
            gitConfig = ini.parse(fs.readFileSync(tmpPath, 'utf-8'));
            repoUrl = gitConfig['remote "origin"'].url;
            depData = getRepoNameFromURL(repoUrl);
            if (depData && typeof depData !== 'undefined') {
              deps[depData.name] = depData.repo;
            }
            if (index === (files.length - 1)) {
              saveJSON(pathToDeps, deps);
              console.log('Successfully updated `.pathogenjs.json`.'.green);
            }
          }
        });
      })(tmpPath);
    });
  });
};
