#!/usr/bin/env node

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
	.action(function(repo, options) {
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
	.action(function(dep, options) {
		pathogenjs.update(dep, options);
	});

program
	.command('remove [dep]')
	.alias('rm')
	.description('removes the dependency [dep] from the bundle path ' +
							 'and from `.pathogenjs.json`.')
	.action(function(dep) {
		pathogenjs.remove(dep);
	});

program
	.command('purge')
	.alias('pr')
	.description('traverses the bundle path searching for git ' +
							 'repositories and populates `pathogenjs.json` ' +
							 'with the missing pathogen dependencies.')
	.action(function() {
		pathogenjs.purge();
	});

program.on('--help', function(){
	console.log('  Examples:');
	console.log('');
	console.log('    $ pathogenjs install');
	console.log('    $ pathogenjs install tpope/vim-fugitive');
	console.log('    $ pathogenjs update --all');
	console.log('    $ pathogenjs update tpope/vim-fugitive');
	console.log('    $ pathogenjs remove vim-fugitive');
	console.log('    $ pathogenjs purge');
	console.log('');
});

program.parse(process.argv);
