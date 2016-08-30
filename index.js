#!/usr/bin/env node
/* eslint no-console: ["warn", { allow: ["info", "error"] }] */

'use strict';

var program = require('commander');

var pathogenjs = require('./libs/pathogenjs');

var packageJSON = require('./package.json');

program
  .version(packageJSON.version)
  .usage('[options] [command]\n\n  ' + packageJSON.description);

program
  .command('install [repo]')
  .alias('i')
  .description('creates default `.pathogenjs.json` file if it doesn\'t ' +
               'exist and adds [repo] dependency to it. If [repo] is not ' +
               'specified it traverses `.pathogenjs.json` and installs ' +
               'all dependencies into the bundle path.')
  .option('--to [pathToDeps]', 'sets the path of `.pathogenjs.json`. ' +
          'If not specified, it defaults to the users home directory.')
  .option('-S, --save', 'if set, save dependency to `.pathogenjs.json`.')
  .action(function(repo, options) { // eslint-disable-line func-names
    pathogenjs.install(repo, options);
  });

program
  .command('update [dep]')
  .alias('u')
  .description('updates [dep] by doing a `git-pull` from within the plugin.' +
               'If [dep] is not specified it traverses the `pathogenjs.json` ' +
               'file and updates each of the dependencies being tracked ' +
               'in the bundle path by doing a `git-pull` from within ' +
               'each plugin.\nIf [dep] is set, --all flag is ignored.')
  .option('-a, --all', 'if set, save dependency to `.pathogenjs.json`.')
  .action(function(dep, options) { // eslint-disable-line func-names
    pathogenjs.update(dep, options);
  });

program
  .command('remove [dep]')
  .alias('rm')
  .description('removes the dependency [dep] from the bundle path ' +
               'and from `.pathogenjs.json`.')
  .action(function(dep) { // eslint-disable-line func-names
    pathogenjs.remove(dep);
  });

program
  .command('build')
  .description('traverses the bundle path searching for git ' +
               'repositories and populates `pathogenjs.json` ' +
               'with the missing pathogen dependencies.')
  .action(function() { // eslint-disable-line func-names
    pathogenjs.build();
  });

program.on('--help', function() { // eslint-disable-line func-names
  console.info('  Examples:');
  console.info('');
  console.info('    $ pathogenjs install');
  console.info('    $ pathogenjs install tpope/vim-fugitive');
  console.info('    $ pathogenjs update --all');
  console.info('    $ pathogenjs update tpope/vim-fugitive');
  console.info('    $ pathogenjs remove vim-fugitive');
  console.info('    $ pathogenjs build');
  console.info('');
});

program.parse(process.argv);
