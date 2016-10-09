/* eslint-disable func-names */
'use strict';

var fs = require('fs');
var path = require('path');

var mock = require('mock-fs');
var chai = require('chai');
var should = chai.should(); // eslint-disable-line no-unused-vars
var expect = chai.expect;
var assert = chai.assert;

var utils = require('../../libs/utils');
var getUserHome = utils.getUserHome;
var getPathToDepsFile = utils.getPathToDepsFile;
var getPathToBundleDir = utils.getPathToBundleDir;
var isAccessable = utils.isAccessable;
var isDirectory = utils.isDirectory;
var find = utils.find;
var saveJSON = utils.saveJSON;
var getRepoNameFromURL = utils.getRepoNameFromURL;
var bufferToString = utils.bufferToString;

describe('utils', function() {
  var envs = {};

  before('set envs for this test', function() {
    envs.HOME = process.env.HOME;
    envs.USERPROFILE = process.env.USERPROFILE;
    process.env.HOME = '/home/user';
    process.env.USERPROFILE = 'C:\\Users\\user\\';
  });

  describe('getUserHome()', function() {
    it('should return `myhomedirpath`', function() {
      getUserHome('linux').should.equal('/home/user');
    });

    it('should return `myhomedirpathWin`', function() {
      getUserHome('win32').should.equal('C:\\Users\\user\\');
    });
  });

  describe('getPathToDepsFile()', function() {
    before('init mock fs', function() {
      mock({
        '/home/user': {
          'custom': {
            '.pathogenjs.json': '{}'
          },
          'customFromEnv': {
            '.pathogenjs.json': '{}'
          },
          '.pathogenjs.json': '{}'
        }
      });
    });

    it('should return path `/home/user/custom/.pathogenjs.json`', function() {
      var pathToTest = path.join('/home', 'user', 'custom', '.pathogenjs.json');
      getPathToDepsFile(pathToTest).should.equal('/home/user/custom/.pathogenjs.json');
    });

    it('should return path `/home/user/customFromEnv/.pathogenjs.json`', function() {
      process.env.PATHOGENJS = path.join('/home', 'user', 'customFromEnv', '.pathogenjs.json');
      getPathToDepsFile().should.equal('/home/user/customFromEnv/.pathogenjs.json');
      process.env.PATHOGENJS = null;
    });

    it('should return path `/home/user/.pathogenjs.json`', function() {
      getPathToDepsFile().should.equal('/home/user/.pathogenjs.json');
    });

    after('restore fs', function() {
      mock.restore();
    });
  });

  describe('getPathToBundleDir()', function() {
    it('should return path `/home/user/.vim/bundle`', function() {
      getPathToBundleDir().should.equal('/home/user/.vim/bundle');
    });

    it('should return path `C:\\Users\\user\\vimfiles\\bundle`', function() {
      getPathToBundleDir('win32').should.equal('C:\\Users\\user\\vimfiles\\bundle');
    });
  });

  describe('isAccessable()', function() {
    before('init mock fs', function() {
      mock({
        '/home/user/.pathogenjs.json': '{}'
      });
    });

    it('should return `true` if file is accessable', function() {
      isAccessable('/home/user/.pathogenjs.json').should.be.true;
    });

    it('should return `false` if file is not accessable', function() {
      isAccessable('/home/user/other/.pathogenjs.json').should.be.false;
    });

    after('restore fs', function() {
      mock.restore();
    });
  });

  describe('isDirectory()', function() {
    before('init mock fs', function() {
      mock({
        '/home/user/.vim/bundle/.disabled': {}
      });
    });

    it('should return `true` if path is directory', function() {
      isDirectory('/home/user/.vim/bundle/.disabled').should.be.true;
    });

    it('should return `false` if path is not directory', function() {
      isDirectory('/home/user/.vim/bundle/.other').should.be.false;
    });

    after('restore fs', function() {
      mock.restore();
    });
  });

  describe('find()', function() {
    it('should throw an error when first parameter is not an array', function() {
      assert.throws(find, Error);
    });

    it('should throw an error when second parameter is not an function', function() {
      assert.throws(find.bind(null, []), Error);
    });

    it('should return `3` for array `[1, 2, 3, 4]`', function() {
      find([1, 2, 3, 4], function(n) {
        if (n === 3) { return true; }
        return false;
      }).should.equal(3);
    });

    it('should return `null` for array `[1, 2, 4, 5]`', function() {
      expect(find([1, 2, 4, 5], function(n) {
        if (n === 3) { return true; }
        return false;
      })).to.be.null;
    });
  });

  describe('saveJSON()', function() {
    before('init mock fs', function() {
      mock({
        '/home/user/.pathogenjs.json': '{}'
      });
    });

    it('should save obj to file', function() {
      var pathToFile = '/home/user/.pathogenjs.json';
      var obj = { hello: 'world' };
      var fileContents;
      saveJSON(pathToFile, obj);
      fileContents = fs.readFileSync('/home/user/.pathogenjs.json');
      JSON.parse(fileContents).should.deep.equal(obj);
    });

    after('restore fs', function() {
      mock.restore();
    });
  });

  describe('getRepoNameFromURL()', function() {
    var urls;
    var result;

    it('should return an obj with properties repo === \'user\' and name === \'repo\' for valid url', function() {
      urls = {
        url1: 'https://github.com/user/repo.git',
        url2: 'git://github.com/user/repo.git',
        url3: 'http://github.com/user/repo'
      };
      result = { repo: 'user/repo', name: 'repo' };
      getRepoNameFromURL(urls.url1).should.deep.equal(result);
      getRepoNameFromURL(urls.url2).should.deep.equal(result);
      getRepoNameFromURL(urls.url3).should.deep.equal(result);
    });

    it('should return an `null` for invalid urls', function() {
      urls = {
        url1: 'https://githubfake.com/user/repo.git',
        url2: '://github.com/user/repo.git',
        url3: 'anything but right'
      };
      result = { repo: 'user/repo', name: 'repo' };
      expect(getRepoNameFromURL(urls.url1)).to.be.null;
      expect(getRepoNameFromURL(urls.url2)).to.be.null;
      expect(getRepoNameFromURL(urls.url3)).to.be.null;
    });
  });

  describe('bufferToString()', function() {
    it('should return a string', function() {
      var buffer = new Buffer('hello world!', 'utf-8');
      bufferToString(buffer).should.equal('hello world!');
    });

    it('should throw an error when `buffer` is not specified', function() {
      assert.throws(bufferToString, Error);
    });
  });

  after('reset envs to their real values', function() {
    process.env.HOME = envs.HOME;
    process.env.USERPROFILE = envs.USERPROFILE;
  });
});
