'use strict';

var fs        = require('fs');
var path      = require('path');
var spawnSync = require('child_process').spawnSync;

var ini    = require('ini');
var rimraf = require('rimraf');
var colors = require('colors'); // eslint-disable-line no-unused-vars

var utils              = require('./utils');
var bufferToString     = utils.bufferToString;
var isAccessable       = utils.isAccessable;
var isDirectory        = utils.isDirectory;
var find               = utils.find;
var getPathToDepsFile  = utils.getPathToDepsFile;
var getPathToBundleDir = utils.getPathToBundleDir;
var getRepoNameFromURL = utils.getRepoNameFromURL;
var saveJSON           = utils.saveJSON;
var printOutput        = utils.printOutput;

var constants = {
  githubUrl: 'https://www.github.com/',
  gitCmd: 'git'
};

function list(options) {
  options = options || {}; // eslint-disable-line no-param-reassign
  var pathToDeps = getPathToDepsFile(options.to);
  var deps = require(pathToDeps);
  var disabled = {};
  var dep;

  if (options.enabled) {
    printDeps(deps, 'Enabled', 'green');
  } else if (options.disabled) {
    deps = deps.disabled || disabled;
    printDeps(deps, 'Disabled', 'yellow');
  } else {
    printDeps(deps, 'Enabled', 'green');
    deps = deps.disabled || disabled;
    printDeps(deps, 'Disabled', 'yellow');
  }

  // eslint-disable-next-line no-shadow
  function printDeps(deps, title, color) {
    printOutput((title + ':')[color]);
    for (dep in deps) { // eslint-disable-line guard-for-in
      printOutput(('\t' + dep)[color]);
    }
  }
}

function install(repo, options) {
  options = options || {}; // eslint-disable-line no-param-reassign
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
    args = ( 'clone ' + gitUrl ).split(' ');
    results = spawnSync(constants.gitCmd, args, { cwd: pathToBundle });
    printOutput(bufferToString(results.stdout).green);
    printOutput(bufferToString(results.stderr).red);
    if (save) {
      // eslint-disable-next-line func-names
      var depName = find(from.split('/').reverse(), function(e) {
        if (e === '') { return false; }
        return true;
      });
      if (isAccessable(path.join(pathToBundle, depName))) {
        deps[depName] = from;
        saveJSON(pathToDeps, deps);
      }
    }
  } else {
    // eslint-disable-next-line func-names
    Object.keys(deps).forEach(function(name) {
      if (name !== 'disabled') {
        printOutput(( 'Installing ' + name + '...' ).green);
        gitUrl = constants.githubUrl + deps[name];
        args = ( 'clone ' + gitUrl ).split(' ');
        results = spawnSync(constants.gitCmd, args, { cwd: pathToBundle });
        printOutput(bufferToString(results.stdout).green);
        printOutput(bufferToString(results.stderr).red);
      }
    });
  }
}

function update(dep, options) {
  options = options || {}; // eslint-disable-line no-param-reassign
  var pathToBundle = getPathToBundleDir(null, options.customPathBundle);
  var all = options.all;
  var args = 'pull origin master'.split(' ');
  var results;
  var tmpPath;
  var stats;

  if (dep) {
    tmpPath = path.join(pathToBundle, dep);
    // eslint-disable-next-line func-names
    stats = fs.statSync(tmpPath);
    if (stats.isDirectory()) {
      printOutput(( 'Updating ' + dep + '...' ).green);
      results = spawnSync(constants.gitCmd, args, { cwd: tmpPath });
      printOutput(bufferToString(results.stdout).green);
      printOutput(bufferToString(results.stderr).red);
    }
  } else if (all) {
    var pathToDeps = getPathToDepsFile(options.to);
    var deps = require(pathToDeps);

    // eslint-disable-next-line func-names
    Object.keys(deps).forEach(function(name) {
      if (name !== 'disabled') {
        tmpPath = path.join(pathToBundle, name);
        stats = fs.statSync(tmpPath);
        if (stats.isDirectory()) {
          printOutput(( 'Updating ' + name + '...' ).green);
          results = spawnSync(constants.gitCmd, args, { cwd: tmpPath });
          printOutput(bufferToString(results.stdout).green);
          printOutput(bufferToString(results.stderr).red);
        }
      }
    });
  }
}

function remove(dep, options) {
  options = options || {}; // eslint-disable-line no-param-reassign
  var pathToDeps = getPathToDepsFile(options.to);
  var pathToBundle = getPathToBundleDir(null, options.customPathBundle);
  var deps = require(pathToDeps);
  var depToDelete = path.join(pathToBundle, dep);

  // eslint-disable-next-line func-names
  rimraf(depToDelete, function() {
    delete deps[dep];
    saveJSON(pathToDeps, deps);
  });
}

function build(options) {
  options = options || {}; // eslint-disable-line no-param-reassign
  var pathToDeps = getPathToDepsFile(options.to);
  var pathToBundle = getPathToBundleDir(null, options.customPathBundle);
  var deps = require(pathToDeps);
  var tmpPath;
  var gitConfig;
  var repoUrl;
  var depData;
  var files;
  var stats;

  files = fs.readdirSync(pathToBundle);

  // eslint-disable-next-line func-names
  files.forEach(function(file, index) {
    tmpPath = path.join(pathToBundle, file);

    stats = fs.statSync(tmpPath);
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
}

function disable(depsToDisable, options) {
  options = options || {}; // eslint-disable-line no-param-reassign
  var pathToDeps = getPathToDepsFile(options.to);
  var pathToBundle = getPathToBundleDir(null, options.customPathBundle);
  var deps = require(pathToDeps);
  var disabledDir = path.join(pathToBundle, '.disabled');
  var newPath;
  var currentPath;
  var files;

  if (depsToDisable.length === 0) {
    printOutput('No dependencies to disable were specified.'.red);
    process.exit(); // eslint-disable-line no-process-exit
  }

  if (!isDirectory(disabledDir)) {
    fs.mkdirSync(disabledDir);
  }

  files = fs.readdirSync(pathToBundle);
  // eslint-disable-next-line func-names
  depsToDisable.forEach(function(dep) {
    if (files.indexOf(dep) > -1) {
      currentPath = path.join(pathToBundle, dep);
      newPath = path.join(disabledDir, dep);
      fs.renameSync(currentPath, newPath);
      if (dep in deps) {
        deps.disabled = deps.disabled || {};
        deps.disabled[dep] = deps[dep];
        delete deps[dep];
        saveJSON(pathToDeps, deps);
      }
      printOutput(('Successfully disabled `' + dep + '`.').green);
    } else {
      printOutput(('Dependency `' + dep + '` is not installed or it ' +
                   'is named differently. No action taken.').blue);
    }
  });
}

function enable(depsToEnable, options) {
  options = options || {}; // eslint-disable-line no-param-reassign
  var pathToDeps = getPathToDepsFile(options.to);
  var pathToBundle = getPathToBundleDir(null, options.customPathBundle);
  var deps = require(pathToDeps);
  var disabledDir = path.join(pathToBundle, '.disabled');
  var newPath;
  var currentPath;
  var files;

  if (depsToEnable.length === 0) {
    printOutput('No dependencies to enable were specified.'.red);
    process.exit(); // eslint-disable-line no-process-exit
  }

  if (!isDirectory(disabledDir)) {
    fs.mkdirSync(disabledDir);
  }

  // eslint-disable-next-line func-names
  files = fs.readdirSync(disabledDir);

  // eslint-disable-next-line func-names
  depsToEnable.forEach(function(dep) {
    if (files.indexOf(dep) > -1) {
      currentPath = path.join(disabledDir, dep);
      newPath = path.join(pathToBundle, dep);
      fs.renameSync(currentPath, newPath);
      if (deps.disabled && dep in deps.disabled) {
        deps[dep] = deps.disabled[dep];
        delete deps.disabled[dep];
        saveJSON(pathToDeps, deps);
      }
      printOutput(('Successfully enabled `' + dep + '`.').green);
    } else {
      printOutput(('Dependency `' + dep + '` is not disabled or it ' +
                   'is named differently. No action taken.').blue);
    }
  });
}

exports.list = list;

exports.install = install;

exports.update = update;

exports.remove = remove;

exports.build = build;

exports.disable = disable;

exports.enable = enable;
