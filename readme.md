
Reads markdown files and spellchecks them, using OpenOffice hunspell files.

## CLI Usage

There are two modes, interactive fixing, which will allow you to fix mistakes and add exceptions to a custom dictionary and a report mode which will just you the list of errors.

```
# install
npm i markdown-spellcheck -g

# use
mdspell "**/*.md"

# see help & options
mdspell
```

### Interactive mode

The default interactive mode shows you the context of the spelling mistake and gives you options with what to do about it. E.g.

```
Spelling - readme.md
 shows you the context of the speling mistake and gives you options
?   (Use arrow keys)
  Ignore
  Add to file ignores
  Add to dictionary - case insensitive
> Enter correct spelling
  spelling
  spieling
  spewing
  selling
  peeling
```

Where `speling` will be highlighted in red.

 * "Ignore" will ignore that word and not ask about it again in the current run. If you re-run the command again though, it will appear.
 * "Add to file ignores" will ignore the word in this file only.
 * "Add to dictionary - case insensitive" will add to the dictionary for all files and match any case. E.g. with the word `Microsoft` both `Microsoft` and `microsoft` would match.
 * "Add to dictionary - case sensitive" will add to the dictionary for all files and match the case that has been used. E.g. with the word `Microsoft`, the word `microsoft` will not match.
 
All exclusions will be stored in a `.spelling` file in the directory from which you run the command.

### Report mode

Using the `--report` (`-r`) option will show you every mistake. You can get a summary with `--report --summary` or `-rs`.

## `.spelling` files

The `.spelling` file is self documenting as it includes...

```
# markdown-spellcheck spelling configuration file
# Format - lines begining # are comments
# global dictionary is at the start, file overrides afterwards
# one word per line, to define a file override use ' - filename'
# where filename is relative to this configuration file
```

## Usage in `grunt` or `gulp` to automatically check spellings


