A Visual Studio Code extension which adds an ability to preview SVG images.

[![](https://vsmarketplacebadge.apphb.com/version/vitaliymaz.vscode-svg-previewer.svg)](https://marketplace.visualstudio.com/items?itemName=vitaliymaz.vscode-svg-previewer)
[![](https://vsmarketplacebadge.apphb.com/downloads/vitaliymaz.vscode-svg-previewer.svg)](https://marketplace.visualstudio.com/items?itemName=vitaliymaz.vscode-svg-previewer)
[![](https://vsmarketplacebadge.apphb.com/rating/vitaliymaz.vscode-svg-previewer.svg)](https://marketplace.visualstudio.com/items?itemName=vitaliymaz.vscode-svg-previewer)

## Features:
- Preview SVG images
- Change transparency grid color
- Zooming
- Automatic open preview option
- Live preview refresh on source editing


## Usage: 

#### To Open Preview:
- use editor title menu item
- use an appropriate command
- use a context menu item

![Workflow](https://github.com/vitaliymaz/vscode-svg-previewer/raw/master/media/open-preview.gif)

#### To Zoom In / Zoom Out
- use toolbar buttons
- use Ctrl / Cmd + mouse wheel
- use a touchpad

![Workflow](https://github.com/vitaliymaz/vscode-svg-previewer/raw/master/media/zoom.gif)

#### To Change background:
- use toolbar buttons

![Workflow](https://github.com/vitaliymaz/vscode-svg-previewer/raw/master/media/change-background.gif)


## Commands:

| Command                        | Description                          |
|--------------------------------|--------------------------------------|
| Svg: Open Preview              | Open preview to the active view coulmn |
| Svg: Open Preview to the Side  | Open preview to the side view column |
| Svg: Show Source               | Open source file of the active preview |


## Settings:

| Property             | Description                              | Default |
|----------------------|------------------------------------------|---------|
| svg.preview.autoOpen | Open a preview to the side automatically | false   |


## Keyboard Shortcuts:

| Command                        | Keybinding                          |
|--------------------------------|--------------------------------------|
| Svg: Open Preview              | ctrl+shift+v |
| Svg: Open Preview to the Side  | ctrl+k v |
