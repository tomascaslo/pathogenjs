# Pathogenjs
A CLI tool for installing, updating, and removing Vim plugins easily by augmenting [Pathogen](https://github.com/tpope/vim-pathogen).


## Motivation
[Pathogen](https://github.com/tpope/vim-pathogen) is already a great tool for installing Vim plugins super easily. In a way, it allows to manage your plugins by just installing or removing a directory in a given path, by default `~/.vim/bundle/`, and that is fine most of the time; however, Pathogen does not keep track of the plugins installed or removed, and that makes it difficult to migrate your list of plugins into another machine. Moreover, updating them can also be a nightmare as you would have to go by hand or use some weird script that iterates over the files in the bundle directory. Pathogenjs aims to solve those issues.

## Installation
```bash
$ npm install -g pathogenjs
```
## Dependencies
Pathogenjs works by augmenting [Pathogen's](https://github.com/tpope/vim-pathogen) out of the box functionality, so assuming you have [nodejs](https://nodejs.org) and [npm](https://www.npmjs.com/) already installed, along with Pathogen installed and configured, you're set.

## Installing plugins
Pathogenjs works by git-cloning a Github repository that holds a Vim plugin and installing it under the Pathogen's bundle directory (it currently supports the default `~/.vim/bundle/` directory, only). To install a plugin you need to specify the repository's user along with the name of the repository.

```bash
$ pathogenjs install [repo-user]/[repo-name]
```

**Example:**

```bash
$ pathogenjs install tpope/vim-fugitive
```
Add the `--save` flag to save the installed plugin into your `.pathogenjs.json` file.


If you already have a `.pathogenjs.json` file set with a list of plugins you can use:

```bash
$ pathogenjs install
```

This will iterate over the list of plugins and install them in the Pathogen's bundle directory.

## Removing plugins
Pathogenjs removes a plugin by removing the plugin's directory from the Pathogen's bundle directory. In contrast with the installing command, you remove a plugin by specifying only its name (the name of the repository or the name of the directory where it was cloned).

```bash
$ pathogenjs remove [repo-name]
```

**Example:**

```bash
$ pathogenjs remove vim-fugitive
```

## Updating plugins
In order to update a plugin Pathogenjs git-pulls from the master branch within a plugin's directory. 

```bash
$ pathogenjs update [repo-name]
``` 

**Example:**

```bash
$ pathogenjs update vim-fugitive
``` 

If no plugin is specified **and** the `--all` flag is set, Pathogenjs will iterate over the plugins at `.pathogenjs.json` updating each of them if any updates are available.

```bash
$ pathogenjs update --all
```

## Building
If you already have Pathogen, you probably have the Pathogen's bundle directory with a bunch of plugins installed. Building allows to update the `.pathogenjs.json` with the plugins you have currently installed.

```bash
$ pathogenjs build
```

## Help
For more information read:

```bash
$ pathogenjs --help
```

## License
MIT