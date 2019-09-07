<h2 align="center"><img src="https://raw.githubusercontent.com/VSCodeVim/Vim/master/images/icon.png" height="128"><br>VSCodeVim</h2>
<p align="center"><strong>Vim emulation for Visual Studio Code</strong></p>

[![http://aka.ms/vscodevim](https://vsmarketplacebadge.apphb.com/version/vscodevim.vim.svg)](http://aka.ms/vscodevim)
[![](https://vsmarketplacebadge.apphb.com/installs-short/vscodevim.vim.svg)](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim)
[![https://travis-ci.org/VSCodeVim/Vim](https://travis-ci.org/VSCodeVim/Vim.svg?branch=master)](https://travis-ci.org/VSCodeVim/Vim)
[![https://vscodevim.herokuapp.com/](https://img.shields.io/badge/vscodevim-slack-blue.svg?logo=slack)](https://vscodevim.herokuapp.com/)

VSCodeVim is a Vim emulator for [Visual Studio Code](https://code.visualstudio.com/).

- 🚚 For a full list of supported Vim features, please refer to our [roadmap](https://github.com/VSCodeVim/Vim/blob/master/ROADMAP.md).
- 📃 Our [change log](https://github.com/VSCodeVim/Vim/blob/master/CHANGELOG.md) outlines the breaking/major/minor updates between releases.
- ❓ If you need to ask any questions, join us on [Slack](https://vscodevim.herokuapp.com/)
- Report missing features/bugs on [GitHub](https://github.com/VSCodeVim/Vim/issues).

<details>
 <summary><strong>Table of Contents</strong> (click to expand)</summary>

- [Installation](#-installation)
  - [Mac setup](#mac)
  - [Windows setup](#windows)
  - [Linux setup](#linux-setup)
- [Settings](#%EF%B8%8F-settings)
  - [VSCodeVim settings](#vscodevim-settings)
  - [Neovim Integration](#neovim-integration)
  - [Key remapping](#key-remapping)
  - [Vim settings](#vim-settings)
- [Multi-Cursor mode](#%EF%B8%8F-multi-cursor-mode)
- [Emulated plugins](#-emulated-plugins)
  - [vim-airline](#vim-airline)
  - [vim-easymotion](#vim-easymotion)
  - [vim-surround](#vim-surround)
  - [vim-commentary](#vim-commentary)
  - [vim-indent-object](#vim-indent-object)
  - [vim-sneak](#vim-sneak)
  - [CamelCaseMotion](#camelcasemotion)
  - [Input Method](#input-method)
  - [ReplaceWithRegister](#replacewithregister)
- [VSCodeVim tricks](#-vscodevim-tricks)
- [F.A.Q / Troubleshooting](#-faq)
- [Contributing](#️-contributing)

</details>

## 💾 Installation

VSCodeVim is automatically enabled following [installation](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim) and reloading of VS Code.

> :warning: Vimscript is _not_ supported; therefore, we are _not_ able to load your `.vimrc` or use `.vim` plugins. You have to replicate these using our [Settings](#settings) and [Emulated plugins](#-emulated-plugins).

### Mac

To enable key-repeating execute the following in your Terminal and restart VS Code:

```sh
$ defaults write com.microsoft.VSCode ApplePressAndHoldEnabled -bool false         # For VS Code
$ defaults write com.microsoft.VSCodeInsiders ApplePressAndHoldEnabled -bool false # For VS Code Insider
$ defaults delete -g ApplePressAndHoldEnabled                                      # If necessary, reset global default
```

We also recommend increasing Key Repeat and Delay Until Repeat settings in _System Preferences -> Keyboard_.

### Windows

Like real vim, VSCodeVim will take over your control keys. This behaviour can be adjusted with the [`useCtrlKeys`](#vscodevim-settings) and [`handleKeys`](#vscodevim-settings) settings.

## ⚙️ Settings

The settings documented here are a subset of the supported settings; the full list is described in the `Contributions` tab in the extensions menu of VS Code.

### Quick Example

Below is an example of a [settings.json](https://code.visualstudio.com/Docs/customization/userandworkspace) file with settings relevant to VSCodeVim:

```json
{
  "vim.easymotion": true,
  "vim.sneak": true,
  "vim.incsearch": true,
  "vim.useSystemClipboard": true,
  "vim.useCtrlKeys": true,
  "vim.hlsearch": true,
  "vim.insertModeKeyBindings": [
    {
      "before": ["j", "j"],
      "after": ["<Esc>"]
    }
  ],
  "vim.normalModeKeyBindingsNonRecursive": [
    {
      "before": ["<leader>", "d"],
      "after": ["d", "d"]
    },
    {
      "before": ["<C-n>"],
      "commands": [":nohl"]
    }
  ],
  "vim.leader": "<space>",
  "vim.handleKeys": {
    "<C-a>": false,
    "<C-f>": false
  }
}
```

### VSCodeVim settings

These settings are specific to VSCodeVim.

| Setting                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                      | Type    | Default Value                         |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------- |
| vim.changeWordIncludesWhitespace | Include trailing whitespace when changing word. This configures the <kbd>cw</kbd> action to act consistently as its siblings (<kbd>yw</kbd> and <kbd>dw</kbd>) instead of acting as <kbd>ce</kbd>.                                                                                                                                                                                                                               | Boolean | false                                 |
| vim.cursorStylePerMode._{Mode}_  | Configure a specific cursor style for _{Mode}_. Omitted modes will use [default cursor type](https://github.com/VSCodeVim/Vim/blob/4a6fde6dbd4d1fac1f204c0dc27c32883651ef1a/src/mode/mode.ts#L34) Supported cursors: line, block, underline, line-thin, block-outline, and underline-thin.                                                                                                                                       | String  | None                                  |
| vim.digraphs._{shorthand}_       | Set custom digraph shorthands that can override the default ones. Entries should map a two-character shorthand to a descriptive string and one or more UTF16 code points. Example: `"R!": ["🚀", [55357, 56960]]`                                                                                                                                                                                                                | object  | `{"R!": ["🚀", [0xD83D, 0xDE80]]`     |  |
| vim.debug.silent                 | Boolean indicating whether log messages will be suppressed.                                                                                                                                                                                                                                                                                                                                                                      | Boolean | false                                 |
| vim.debug.loggingLevelForConsole | Maximum level of messages to log to console. Logs are visible in the [developer tools](https://code.visualstudio.com/docs/extensions/developing-extensions#_developer-tools-console). Supported values: 'error', 'warn', 'info', 'verbose', 'debug').                                                                                                                                                                            | String  | error                                 |
| vim.debug.loggingLevelForAlert   | Maximum level of messages to present as VS Code information window. Supported values: 'error', 'warn', 'info', 'verbose', 'debug').                                                                                                                                                                                                                                                                                              | String  | error                                 |
| vim.disableExtension             | Disable VSCodeVim extension. This setting can also be toggled using `toggleVim` command in the Command Palette                                                                                                                                                                                                                                                                                                                   | Boolean | false                                 |
| vim.handleKeys                   | Delegate configured keys to be handled by VSCode instead of by the VSCodeVim extension. Any key in `keybindings` section of the [package.json](https://github.com/VSCodeVim/Vim/blob/master/package.json) that has a `vim.use<C-...>` in the when argument can be delegated back to VS Code by setting `"<C-...>": false`. Example: to use `ctrl+f` for find (native VS Code behaviour): `"vim.handleKeys": { "<C-f>": false }`. | String  | `"<C-d>": true`                       |
| vim.overrideCopy                 | Override VS Code's copy command with our own, which works correctly with VSCodeVim. If cmd-c/ctrl-c is giving you issues, set this to false and complain [here](https://github.com/Microsoft/vscode/issues/217).                                                                                                                                                                                                                 | Boolean | false                                 |
| vim.searchHighlightColor         | Set the color of search highlights                                                                                                                                                                                                                                                                                                                                                                                               | String  | `editor.findMatchHighlightBackground` |
| vim.startInInsertMode            | Start in Insert mode instead of Normal Mode                                                                                                                                                                                                                                                                                                                                                                                      | Boolean | false                                 |
| vim.substituteGlobalFlag         | Similar to Vim's `gdefault` setting. `/g` flag in a substitute command replaces all occurrences in the line. Without this flag, replacement occurs only for the first occurrence in each line. With this setting enabled, the `g` is on by default.                                                                                                                                                                              | Boolean | false                                 |
| vim.useCtrlKeys                  | Enable Vim ctrl keys overriding common VS Code operations such as copy, paste, find, etc.                                                                                                                                                                                                                                                                                                                                        | Boolean | true                                  |
| vim.visualstar                   | In visual mode, start a search with `*` or `#` using the current selection                                                                                                                                                                                                                                                                                                                                                       | Boolean | false                                 |
| vim.highlightedyank.enable       | Enable highlighting when yanking                                                                                                                                                                                                                                                                                                                                                                                                 | Boolean | false                                 |
| vim.highlightedyank.color        | Set the color of yank highlights                                                                                                                                                                                                                                                                                                                                                                                                 | String  | rgba(250, 240, 170, 0.5)              |
| vim.highlightedyank.duration     | Set the duration of yank highlights                                                                                                                                                                                                                                                                                                                                                                                              | Number  | 200                                   |

### Neovim Integration

> :warning: Experimental feature. Please leave feedback on neovim integration [here](https://github.com/VSCodeVim/Vim/issues/1735).

To leverage neovim for Ex-commands,

1.  Install [neovim](https://github.com/neovim/neovim/wiki/Installing-Neovim)
2.  Modify the following configurations:

| Setting          | Description                    | Type    | Default Value |
| ---------------- | ------------------------------ | ------- | ------------- |
| vim.enableNeovim | Enable Neovim                  | Boolean | false         |
| vim.neovimPath   | Full path to neovim executable | String  |               |

Here's some ideas on what you can do with neovim integration:

- [The power of g](http://vim.wikia.com/wiki/Power_of_g)
- [The :normal command](https://vi.stackexchange.com/questions/4418/execute-normal-command-over-range)
- Faster search and replace!

### Key Remapping

Custom remappings are defined on a per-mode basis.

#### `"vim.insertModeKeyBindings"`/`"vim.normalModeKeyBindings"`/`"vim.visualModeKeyBindings"`

- Keybinding overrides to use for insert, normal, and visual modes.
- Bind `jj` to `<Esc>` in insert mode:

```json
    "vim.insertModeKeyBindings": [
        {
            "before": ["j", "j"],
            "after": ["<Esc>"]
        }
    ]
```

- Bind `£` to goto previous whole word under cursor

```json
    "vim.normalModeKeyBindings": [
        {
            "before": ["£"],
            "after": ["#"]
        }
    ]
```

- Bind `:` to show the command palette:

```json
    "vim.normalModeKeyBindingsNonRecursive": [
        {
            "before": [":"],
            "commands": [
                "workbench.action.showCommands",
            ]
        }
    ]
```

- Bind `<leader>m` to add a bookmark and `<leader>b` to open the list of all bookmarks (using the [Bookmarks](https://marketplace.visualstudio.com/items?itemName=alefragnani.Bookmarks) extension):

```json
    "vim.normalModeKeyBindingsNonRecursive": [
        {
            "before": ["<leader>", "m"],
            "commands": [
                "bookmarks.toggle"
            ]
        },
        {
            "before": ["<leader>", "b"],
            "commands": [
                "bookmarks.list"
            ]
        }
    ]
```

- Bind `ZZ` to the vim command `:wq` (save and close the current file):

```json
    "vim.normalModeKeyBindingsNonRecursive": [
        {
            "before": ["Z", "Z"],
            "commands": [
                ":wq"
            ]
        }
    ]
```

- Bind `ctrl+n` to turn off search highlighting and `<leader>w` to save the current file:

```json
    "vim.normalModeKeyBindingsNonRecursive": [
        {
            "before":["<C-n>"],
            "commands": [
                ":nohl",
            ]
        },
        {
            "before": ["leader", "w"],
            "commands": [
                "workbench.action.files.save",
            ]
        }
    ]
```

- Bind `p` in visual mode to paste without overriding the current register

```json
    "vim.visualModeKeyBindingsNonRecursive": [
        {
            "before": [
                "p",
            ],
            "after": [
                "p",
                "g",
                "v",
                "y"
            ]
        }
    ],
```

- Bind `>` and `<` in visual mode to indent/outdent lines (repeatable)

```json
    "vim.visualModeKeyBindingsNonRecursive": [
        {
            "before": [
                ">"
            ],
            "commands": [
                "editor.action.indentLines"
            ]
        },
        {
            "before": [
                "<"
            ],
            "commands": [
                "editor.action.outdentLines"
            ]
        },
    ]
```

- Bind `<leader>vim` to clone this repository to the selected location.

```json
    "vim.visualModeKeyBindingsNonRecursive": [
        {
            "before": [
                "<leader>", "v", "i", "m"
            ],
            "commands": [
                {
                    "command": "git.clone",
                    "args": [ "https://github.com/VSCodeVim/Vim.git" ]
                }
            ]
        }
    ]
```

#### `"vim.insertModeKeyBindingsNonRecursive"`/`"normalModeKeyBindingsNonRecursive"`/`"visualModeKeyBindingsNonRecursive"`

- Non-recursive keybinding overrides to use for insert, normal, and visual modes
- _Example:_ Bind `j` to `gj`. Notice that if you attempted this binding normally, the j in gj would be expanded into gj, on and on forever. Stop this recursive expansion using insertModeKeyBindingsNonRecursive and/or normalModeKeyBindingNonRecursive.

```json
    "vim.normalModeKeyBindingsNonRecursive": [
        {
            "before": ["j"],
            "after": ["g", "j"]
        }
    ]
```

#### Debugging Remappings

1.  Are your configurations correct?

    Adjust the extension's [logging level](#vscodevim-settings) to 'debug', restart VS Code. As each remapped configuration is loaded, it is outputted to console. In the Developer Tools console, do you see any errors?

    ```console
    debug: Remapper: normalModeKeyBindingsNonRecursive. before=0. after=^.
    debug: Remapper: insertModeKeyBindings. before=j,j. after=<Esc>.
    error: Remapper: insertModeKeyBindings. Invalid configuration. Missing 'after' key or 'command'. before=j,k.
    ```

    Misconfigured configurations are ignored.

2.  Does the extension handle the keys you are trying to remap?

    VSCodeVim explicitly instructs VS Code which key events we care about through the [package.json](https://github.com/VSCodeVim/Vim/blob/1a5f358a1a57c62d5079093ad0dd12c2bf018bba/package.json#L53). If the key you are trying to remap is a key in which vim/vscodevim generally does not handle, then it's most likely that this extension does not receive those key events from VS Code. With [logging level](#vscodevim-settings) adjusted to 'debug', as you press keys, you should see output similar to:

    ```console
    debug: ModeHandler: handling key=A.
    debug: ModeHandler: handling key=l.
    debug: ModeHandler: handling key=<BS>.
    debug: ModeHandler: handling key=<C-a>.
    ```

    As you press the key that you are trying to remap, do you see it outputted here? If not, it means we don't subscribe to those key events.

### Vim settings

Configuration settings that have been copied from vim. Vim settings are loaded in the following sequence:

1.  `:set {setting}`
2.  `vim.{setting}` from user/workspace settings.
3.  VS Code settings
4.  VSCodeVim default values

| Setting          | Description                                                                                                                                                                                                                                                           | Type    | Default Value |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------- |
| vim.autoindent   | Copy indent from current line when starting a new line                                                                                                                                                                                                                | Boolean | true          |
| vim.hlsearch     | Highlights all text matching current search                                                                                                                                                                                                                           | Boolean | false         |
| vim.ignorecase   | Ignore case in search patterns                                                                                                                                                                                                                                        | Boolean | true          |
| vim.incsearch    | Show the next match while entering a search                                                                                                                                                                                                                           | Boolean | true          |
| vim.leader       | Defines key for `<leader>` to be used in key remappings                                                                                                                                                                                                               | String  | `\`           |
| vim.showcmd      | Show (partial) command in status bar                                                                                                                                                                                                                                  | Boolean | true          |
| vim.showmodename | Show name of current mode in status bar                                                                                                                                                                                                                               | Boolean | true          |
| vim.smartcase    | Override the 'ignorecase' setting if search pattern contains uppercase characters                                                                                                                                                                                     | Boolean | true          |
| vim.textwidth    | Width to word-wrap when using `gq`                                                                                                                                                                                                                                    | Number  | 80            |
| vim.timeout      | Timeout in milliseconds for remapped commands                                                                                                                                                                                                                         | Number  | 1000          |
| vim.whichwrap    | Controls wrapping at beginning and end of line. Comma-separated set of keys that should wrap to next/previous line. Arrow keys are represented by `[` and `]` in insert mode, `<` and `>` in normal and visual mode. To wrap "everything", set this to `h,l,<,>,[,]`. | String  | ``            |
| vim.report       | Threshold for reporting number of lines changed.                                                                                                                                                                                                                      | Number  | 2             |

## 🖱️ Multi-Cursor Mode

> :warning: Multi-Cursor mode is experimental. Please report issues in our [feedback thread.](https://github.com/VSCodeVim/Vim/issues/824)

Enter multi-cursor mode by:

- On OSX, `cmd-d`. On Windows, `ctrl-d`.
- `gb`, a new shortcut we added which is equivalent to `cmd-d` (OSX) or `ctrl-d` (Windows). It adds another cursor at the next word that matches the word the cursor is currently on.
- Running "Add Cursor Above/Below" or the shortcut on any platform.

Once you have multiple cursors, you should be able to use Vim commands as you see fit. Most should work; some are unsupported (ref [PR#587](https://github.com/VSCodeVim/Vim/pull/587)).

- Each cursor has its own clipboard.
- Pressing Escape in Multi-Cursor Visual Mode will bring you to Multi-Cursor Normal mode. Pressing it again will return you to Normal mode.

## 🔌 Emulated Plugins

### vim-airline

> :warning: There are performance implications to using this plugin. In order to change the status bar, we override the configurations in your workspace settings.json which results in increased latency and a constant changing diff in your working directory (see [issue#2124](https://github.com/VSCodeVim/Vim/issues/2124)).

Change the color of the status bar based on the current mode. Once enabled, configure `"vim.statusBarColors"`. Colors can be defined for each mode either as `string` (background only), or `string[]` (background, foreground).

```json
    "vim.statusBarColorControl": true,
    "vim.statusBarColors.normal": ["#8FBCBB", "#434C5E"],
    "vim.statusBarColors.insert": "#BF616A",
    "vim.statusBarColors.visual": "#B48EAD",
    "vim.statusBarColors.visualline": "#B48EAD",
    "vim.statusBarColors.visualblock": "#A3BE8C",
    "vim.statusBarColors.replace": "#D08770"
```

### vim-easymotion

Based on [vim-easymotion](https://github.com/easymotion/vim-easymotion) and configured through the following settings:

| Setting                                    | Description                                                                                                                                                                                                                                                       | Type           | Default Value  |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------------- |
| vim.easymotion                             | Enable/disable easymotion plugin                                                                                                                                                                                                                                  | Boolean        | false          |
| vim.easymotionMarkerBackgroundColor        | The background color of the marker box.                                                                                                                                                                                                                           |
| vim.easymotionMarkerForegroundColorOneChar | The font color for one-character markers.                                                                                                                                                                                                                         |
| vim.easymotionMarkerForegroundColorTwoChar | The font color for two-character markers, used to differentiate from one-character markers.                                                                                                                                                                       |
| vim.easymotionMarkerWidthPerChar           | The width in pixels allotted to each character.                                                                                                                                                                                                                   |
| vim.easymotionMarkerHeight                 | The height of the marker.                                                                                                                                                                                                                                         |
| vim.easymotionMarkerFontFamily             | The font family used for the marker text.                                                                                                                                                                                                                         |
| vim.easymotionMarkerFontSize               | The font size used for the marker text.                                                                                                                                                                                                                           |
| vim.easymotionMarkerFontWeight             | The font weight used for the marker text.                                                                                                                                                                                                                         |
| vim.easymotionMarkerYOffset                | The distance between the top of the marker and the text (will typically need some adjusting if height or font size have been changed).                                                                                                                            |
| vim.easymotionKeys                         | The characters used for jump marker name                                                                                                                                                                                                                          |
| vim.easymotionJumpToAnywhereRegex          | Custom regex to match for JumpToAnywhere motion (analogous to `Easymotion_re_anywhere`). Example setting (which also matches start & end of line, as well as Javascript comments in addition to the regular behavior (note the double escaping required): ^\\s\*. | \\b[A-Za-z0-9] | [A-Za-z0-9]\\b | \_. | \\#. | [a-z][a-z] | // | .\$" |

Once easymotion is active, initiate motions using the following commands. After you initiate the motion, text decorators/markers will be displayed and you can press the keys displayed to jump to that position. `leader` is configurable and is `\` by default.

| Motion Command                      | Description                                                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `<leader><leader> s <char>`         | Search character                                                                                            |
| `<leader><leader> f <char>`         | Find character forwards                                                                                     |
| `<leader><leader> F <char>`         | Find character backwards                                                                                    |
| `<leader><leader> t <char>`         | Til character forwards                                                                                      |
| `<leader><leader> T <char>`         | Til character backwards                                                                                     |
| `<leader><leader> w`                | Start of word forwards                                                                                      |
| `<leader><leader> b`                | Start of word backwards                                                                                     |
| `<leader><leader> l`                | matches beginning & ending of word, camelCase, after \_ and after # forwards                                |
| `<leader><leader> h`                | matches beginning & ending of word, camelCase, after \_ and after # backwards                               |
| `<leader><leader> e`                | End of word forwards                                                                                        |
| `<leader><leader> ge`               | End of word backwards                                                                                       |
| `<leader><leader> j`                | Start of line forwards                                                                                      |
| `<leader><leader> k`                | Start of line backwards                                                                                     |
| `<leader><leader> / <char>... <CR>` | Search n-character                                                                                          |
| `<leader><leader><leader> bdt`      | Til character                                                                                               |
| `<leader><leader><leader> bdw`      | Start of word                                                                                               |
| `<leader><leader><leader> bde`      | End of word                                                                                                 |
| `<leader><leader><leader> bdjk`     | Start of line                                                                                               |
| `<leader><leader><leader> j`        | JumpToAnywhere motion; default behavior matches beginning & ending of word, camelCase, after \_ and after # |

`<leader><leader> (2s|2f|2F|2t|2T) <char><char>` and `<leader><leader><leader> bd2t <char>char>` are also available.
The difference is character count required for search.
For example, `<leader><leader> 2s <char><char>` requires two characters, and search by two characters.
This mapping is not a standard mapping, so it is recommended to use your custom mapping.

### vim-surround

Based on [surround.vim](https://github.com/tpope/vim-surround), the plugin is used to work with surrounding characters like parenthesis, brackets, quotes, and XML tags.

| Setting      | Description                 | Type    | Default Value |
| ------------ | --------------------------- | ------- | ------------- |
| vim.surround | Enable/disable vim-surround | Boolean | true          |

`t` or `<` as `<desired char>` or `<existing char>` will do tags and enter tag entry mode. Using `<CR>` instead of `>` to finish changing a tag will preserve any existing attributes.

| Surround Command                     | Description                                                           |
| ------------------------------------ | --------------------------------------------------------------------- |
| `d s <existing char>`                | Delete existing surround                                              |
| `c s <existing char> <desired char>` | Change surround existing to desired                                   |
| `y s <motion> <desired char>`        | Surround something with something using motion (as in "you surround") |
| `S <desired char>`                   | Surround when in visual modes (surrounds full selection)              |

Some examples:

- `"test"` with cursor inside quotes type cs"' to end up with `'test'`
- `"test"` with cursor inside quotes type ds" to end up with `test`
- `"test"` with cursor inside quotes type cs"t and enter 123> to end up with `<123>test</123>`
- `test` with cursor on word test type ysaw) to end up with `(test)`

### vim-commentary

Similar to [vim-commentary](https://github.com/tpope/vim-commentary), but uses the VSCode native _Toggle Line Comment_ and _Toggle Block Comment_ features.

Usage examples:

- `gc` - toggles line comment. For example `gcc` to toggle line comment for current line and `gc2j` to toggle line comments for the current line and the next two lines.
- `gC` - toggles block comment. For example `gCi)` to comment out everything within parenthesis.

### vim-indent-object

Based on [vim-indent-object](https://github.com/michaeljsmith/vim-indent-object), it allows for treating blocks of code at the current indentation level as text objects. Useful in languages that don't use braces around statements (e.g. Python).

Provided there is a new line between the opening and closing braces / tag, it can be considered an agnostic `cib`/`ci{`/`ci[`/`cit`.

| Command        | Description                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| `<operator>ii` | This indentation level                                                                               |
| `<operator>ai` | This indentation level and the line above (think `if` statements in Python)                          |
| `<operator>aI` | This indentation level, the line above, and the line after (think `if` statements in C/C++/Java/etc) |

### vim-sneak

Based on [vim-sneak](https://github.com/justinmk/vim-sneak), it allows for jumping to any location specified by two characters.

| Setting                            | Description                                                 | Type    | Default Value |
| ---------------------------------- | ----------------------------------------------------------- | ------- | ------------- |
| vim.sneak                          | Enable/disable vim-sneak                                    | Boolean | false         |
| vim.sneakUseIgnorecaseAndSmartcase | Respect `vim.ignorecase` and `vim.smartcase` while sneaking | Boolean | false         |

Once sneak is active, initiate motions using the following commands. For operators sneak uses `z` instead of `s` because `s` is already taken by the surround plugin.

| Motion Command            | Description                                                            |
| ------------------------- | ---------------------------------------------------------------------- |
| `s<char><char>`           | Move forward to the first occurence of `<char><char>`                  |
| `S<char><char>`           | Move backward to the first occurence of `<char><char>`                 |
| `<operator>z<char><char>` | Perform `<operator>` forward to the first occurence of `<char><char>`  |
| `<operator>Z<char><char>` | Perform `<operator>` backward to the first occurence of `<char><char>` |

### CamelCaseMotion

Based on [CamelCaseMotion](https://github.com/bkad/CamelCaseMotion), though not an exact emulation. This plugin provides an easier way to move through camelCase and snake_case words.

| Setting                    | Description                    | Type    | Default Value |
| -------------------------- | ------------------------------ | ------- | ------------- |
| vim.camelCaseMotion.enable | Enable/disable CamelCaseMotion | Boolean | false         |

Once CamelCaseMotion is enabled, the following motions are available:

| Motion Command         | Description                                                                |
| ---------------------- | -------------------------------------------------------------------------- |
| `<leader>w`            | Move forward to the start of the next camelCase or snake_case word segment |
| `<leader>e`            | Move forward to the next end of a camelCase or snake_case word segment     |
| `<leader>b`            | Move back to the prior beginning of a camelCase or snake_case word segment |
| `<operator>i<leader>w` | Select/change/delete/etc. the current camelCase or snake_case word segment |

By default, `<leader>` is mapped to `\`, so for example, `d2i\w` would delete the current and next camelCase word segment.

### Input Method

Disable input method when exiting Insert Mode.

| Setting                                 | Description                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `vim.autoSwitchInputMethod.enable`      | Boolean denoting whether autoSwitchInputMethod is on/off.                                        |
| `vim.autoSwitchInputMethod.defaultIM`   | Default input method.                                                                            |
| `vim.autoSwitchInputMethod.obtainIMCmd` | The full path to command to retrieve the current input method key.                               |
| `vim.autoSwitchInputMethod.switchIMCmd` | The full path to command to switch input method, with `{im}` a placeholder for input method key. |

Any third-party program can be used to switch input methods. The following will walkthrough the configuration using [im-select](https://github.com/daipeihust/im-select).

1.  Install im-select (see [installation guide](https://github.com/daipeihust/im-select#installation))
1.  Find your default input method key

    - Mac:

      Switch your input method to English, and run the following in your terminal: `/<path-to-im-select-installation>/im-select` to output your default input method. The table below lists the common English key layouts for MacOS.

      | Key                            | Description |
      | ------------------------------ | ----------- |
      | com.apple.keylayout.US         | U.S.        |
      | com.apple.keylayout.ABC        | ABC         |
      | com.apple.keylayout.British    | British     |
      | com.apple.keylayout.Irish      | Irish       |
      | com.apple.keylayout.Australian | Australian  |
      | com.apple.keylayout.Dvorak     | Dvorak      |
      | com.apple.keylayout.Colemak    | Colemak     |

    - Windows:

      Refer to the [im-select guide](https://github.com/daipeihust/im-select#to-get-current-keyboard-locale) on how to discover your input method key. Generally, if your keyboard layout is en_US the input method key is 1033 (the locale ID of en_US). You can also find your locale ID from [this page](https://www.science.co.il/language/Locale-codes.php), where the `LCID Decimal` column is the locale ID.

1.  Configure `vim.autoSwitchInputMethod`.

    - MacOS:

      Given the input method key of `com.apple.keylayout.US` and `im-select` located at `/usr/local/bin`. The configuration is:

      ```json
      "vim.autoSwitchInputMethod.enable": true,
      "vim.autoSwitchInputMethod.defaultIM": "com.apple.keylayout.US",
      "vim.autoSwitchInputMethod.obtainIMCmd": "/usr/local/bin/im-select",
      "vim.autoSwitchInputMethod.switchIMCmd": "/usr/local/bin/im-select {im}"
      ```

    - Windows:

      Given the input method key of `1033` (en_US) and `im-select.exe` located at `D:/bin`. The configuration is:

      ```json
      "vim.autoSwitchInputMethod.enable": true,
      "vim.autoSwitchInputMethod.defaultIM": "1033",
      "vim.autoSwitchInputMethod.obtainIMCmd": "D:\\bin\\im-select.exe",
      "vim.autoSwitchInputMethod.switchIMCmd": "D:\\bin\\im-select.exe {im}"
      ```

The `{im}` argument above is a command-line option that will be passed to `im-select` denoting the input method to switch to. If using an alternative program to switch input methods, you should add a similar option to the configuration. For example, if the program's usage is `my-program -s imKey` to switch input method, the `vim.autoSwitchInputMethod.switchIMCmd` should be `/path/to/my-program -s {im}`.

### ReplaceWithRegister

Based on [ReplaceWithRegister](https://github.com/vim-scripts/ReplaceWithRegister), an easy way to replace existing text with the contents of a register.

| Setting                 | Description                        | Type    | Default Value |
| ----------------------- | ---------------------------------- | ------- | ------------- |
| vim.replaceWithRegister | Enable/disable ReplaceWithRegister | Boolean | false         |

Once active, type `gr` (say "go replace") followed by a motion to describe the text you want replaced by the contents of the register.

| Motion Command          | Description                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `[count]["a]gr<motion>` | Replace the text described by the motion with the contents of the specified register    |
| `[count]["a]grr`        | Replace the \[count\] lines or current line with the contents of the specified register |
| `{Visual}["a]gr`        | Replace the selection with the contents of the specified register                       |

## 🎩 VSCodeVim tricks!

VSCode has a lot of nifty tricks and we try to preserve some of them:

- `gd` - jump to definition.
- `gq` - on a visual selection reflow and wordwrap blocks of text, preserving commenting style. Great for formatting documentation comments.
- `gb` - adds another cursor on the next word it finds which is the same as the word under the cursor.
- `af` - visual mode command which selects increasingly large blocks of text. For example, if you had "blah (foo [bar 'ba|z'])" then it would select 'baz' first. If you pressed `af` again, it'd then select [bar 'baz'], and if you did it a third time it would select "(foo [bar 'baz'])".
- `gh` - equivalent to hovering your mouse over wherever the cursor is. Handy for seeing types and error messages without reaching for the mouse!

## 📚 F.A.Q.

- None of the native Visual Studio Code `ctrl` (e.g. `ctrl+f`, `ctrl+v`) commands work

  Set the [`useCtrlKeys` setting](#vscodevim-settings) to `false`.

- Moving `j`/`k` over folds opens up the folds

  Try setting `vim.foldfix` to `true`. This is a hack; it works fine, but there are side effects (see [issue#22276](https://github.com/Microsoft/vscode/issues/22276)).

- Key repeat doesn't work

  Are you on a Mac? Did you go through our [mac-setup](#mac) instructions?

- There are annoying intellisense/notifications/popups that I can't close with `<esc>`! Or I'm in a snippet and I want to close intellisense

  Press `shift+<esc>` to close all of those boxes.

- How can I use the commandline when in Zen mode or when the status bar is disabled?

  This extension exposes a remappable command to show a vscode style quick-pick, limited functionality, version of the commandline. This can be remapped as follows in VS Code's keybindings.json settings file.

  ```json
  {
    "key": "shift+;",
    "command": "vim.showQuickpickCmdLine",
    "when": "editorTextFocus && vim.mode != 'Insert'"
  }
  ```

  Or for Zen mode only:

  ```json
  {
    "key": "shift+;",
    "command": "vim.showQuickpickCmdLine",
    "when": "inZenMode && vim.mode != 'Insert'"
  }
  ```

- How can I move the cursor by each display line with word wrapping?

  If you have word wrap on and would like the cursor to enter each wrapped line when using <kbd>j</kbd>, <kbd>k</kbd>, <kbd>↓</kbd> or <kbd>↑</kbd>, set the following in VS Code's keybindings.json settings file.

  <!-- prettier-ignore -->
  ```json
  {
    "key": "up",
    "command": "cursorUp",
    "when": "editorTextFocus && vim.active && !inDebugRepl && !suggestWidgetMultipleSuggestions && !suggestWidgetVisible"
  },
  {
    "key": "down",
    "command": "cursorDown",
    "when": "editorTextFocus && vim.active && !inDebugRepl && !suggestWidgetMultipleSuggestions && !suggestWidgetVisible"
  },
  {
    "key": "k",
    "command": "cursorUp",
    "when": "editorTextFocus && vim.active && !inDebugRepl && vim.mode == 'Normal' && !suggestWidgetMultipleSuggestions && !suggestWidgetVisible"
  },
  {
    "key": "j",
    "command": "cursorDown",
    "when": "editorTextFocus && vim.active && !inDebugRepl && vim.mode == 'Normal' && !suggestWidgetMultipleSuggestions && !suggestWidgetVisible"
  }
  ```

  **Caveats:** This solution restores the default VS Code behavior for the <kbd>j</kbd> and <kbd>k</kbd> keys, so motions like `10j` [will not work](https://github.com/VSCodeVim/Vim/pull/3623#issuecomment-481473981). If you need these motions to work, [other, less performant options exist](https://github.com/VSCodeVim/Vim/issues/2924#issuecomment-476121848).

## ❤️ Contributing

This project is maintained by a group of awesome [people](https://github.com/VSCodeVim/Vim/graphs/contributors) and contributions are extremely welcome :heart:. For a quick tutorial on how you can help, see our [contributing guide](https://github.com/VSCodeVim/Vim/blob/master/.github/CONTRIBUTING.md).

<a href="https://www.buymeacoffee.com/jasonpoon" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Us A Coffee" style="height: auto !important;width: auto !important;" ></a>

### Special shoutouts to:

- Thanks to @xconverge for making over 100 commits to the repo. If you're wondering why your least favorite bug packed up and left, it was probably him.
- Thanks to @Metamist for implementing EasyMotion!
- Thanks to @sectioneight for implementing text objects!
- Special props to [Kevin Coleman](http://kevincoleman.io), who created our awesome logo!
- Shoutout to @chillee aka Horace He for his contributions and hard work.
