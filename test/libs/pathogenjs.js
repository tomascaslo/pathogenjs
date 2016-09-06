/* eslint-disable func-names */
'use strict';

var fs = require('fs');
var path = require('path');

var jsonfile = require('jsonfile');
var rimraf = require('rimraf');
var chai = require('chai');
var should = chai.should(); // eslint-disable-line no-unused-vars
var expect = chai.expect;
var assert = chai.assert;

var isAccessable = require('../../libs/utils').isAccessable;

var pathogenjs = require('../../libs/pathogenjs');
var install = pathogenjs.install;
var update = pathogenjs.update;
var remove = pathogenjs.remove;
var build = pathogenjs.build;

var moduleRootPath = path.resolve(__dirname, '../../');
var testDirPath = path.join(moduleRootPath, '.tmpTest/');
var pathogenjson = path.join(testDirPath, '.pathogenjs.json');
var bundleDirPath = path.join(testDirPath, 'bundle/');

describe('pathogenjs', function() {
  var options = {};
  var dependency = {
    name: 'vim-sensible',
    repo: 'tpope/vim-sensible'
  };
  var pathToNewDependency = path.join(bundleDirPath, dependency.name);

  before('initial setup', function() {
    fs.mkdirSync(testDirPath);
    fs.mkdirSync(bundleDirPath);
    jsonfile.writeFileSync(pathogenjson, { 'vim-sensible': dependency.repo });
    options.to = pathogenjson;
    options.customPathBundle = bundleDirPath;
  });

  describe('install()', function() {
    this.timeout(10000); // Set it to 10s it to be able to download repo
    beforeEach('clean the `.tmpTest` directory', function(done) {
      rimraf(pathToNewDependency, function() {
        jsonfile.writeFileSync(pathogenjson, {});
        done();
      });
    });
    
    it('should install all plugins in the bundle directory', function() {
      jsonfile.writeFileSync(pathogenjson, { 'vim-sensible': dependency.repo });
      install(null, options);
      isAccessable(pathToNewDependency).should.be.true;
    });

    it('should install the specified plugin in the bundle directory', function() {
      install(dependency.repo, options);
      isAccessable(pathToNewDependency).should.be.true;
    });

    it('should save the installed plugin in `.pathogenjs.json`', function() {
      options.save = true;
      install(dependency.repo, options);
      isAccessable(pathToNewDependency).should.be.true;
      JSON.parse(fs.readFileSync(pathogenjson)).should.deep.equal({ 'vim-sensible': dependency.repo });
      delete options.save;
    });
  });

  describe('update()', function() {
    it('should update all dependencies in the bundle directory', function() {
      	
    });

    it('should update the specified plugin', function() {
      	
    });
  });

  describe('remove()', function() {
    this.timeout(5000);
    it('should remove the specified plugin from the bundle directory and update `.pathogenjs.json`', function(done) {
      options.to = pathogenjson;
      remove(dependency.name, options);
      delete options.to;
      setTimeout(function() {
        isAccessable(pathToNewDependency).should.be.false;
        JSON.parse(fs.readFileSync(pathogenjson)).should.deep.equal({});
        done();
      }, 3000);
    });
  });

  describe('build()', function() {
    it('should update `.pathogenjs.json` with the plugins currently at the bundle directory', function() {
      	
    }); 
  });

  after('clean up', function(done) {
    rimraf(testDirPath, function() {
      done();
    });
  });
});
