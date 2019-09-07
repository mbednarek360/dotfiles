<p align="center"><a href="https://www.nordtheme.com/ports/visual-studio-code" target="_blank"><img src="https://raw.githubusercontent.com/arcticicestudio/nord-docs/develop/assets/images/ports/visual-studio-code/repository-hero.png" srcset="https://raw.githubusercontent.com/arcticicestudio/nord-docs/develop/assets/images/ports/visual-studio-code/repository-hero-2x.png 2x"/></a></p>

<p align="center"><a href="https://www.nordtheme.com/docs/ports/visual-studio-code" target="_blank"><img src="https://img.shields.io/github/release/arcticicestudio/nord-visual-studio-code.svg?style=flat-square&label=Docs&colorA=4c566a&colorB=88c0d0&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI%2BCiAgICA8cGF0aCBmaWxsPSIjZDhkZWU5IiBkPSJNMTMuNzQ2IDIuODEzYS42Ny42NyAwIDAgMC0uNTU5LS4xMzNMOCAzLjg0OGwtNS4xODgtMS4xOGEuNjY5LjY2OSAwIDAgMC0uNTcuMTMzLjY3Ny42NzcgMCAwIDAtLjI0Mi41MzF2OC4xMzNjLS4wMDguMzIuMjEuNTk4LjUyLjY2OGw1LjMzMiAxLjE5OWguMjk2bDUuMzMyLTEuMmEuNjY4LjY2OCAwIDAgMCAuNTItLjY2N1YzLjMzMmEuNjU5LjY1OSAwIDAgMC0uMjU0LS41MnpNMy4zMzIgNC4xNjhsNCAuODk4djYuNzY2bC00LS44OTh6bTkuMzM2IDYuNzY2bC00IC44OThWNS4wNjZsNC0uODk4em0wIDAiLz4KPC9zdmc%2BCg%3D%3D"/></a></p>

<p align="center"><a href="https://code.visualstudio.com/updates/v1_12" target="_blank"><img src="https://img.shields.io/static/v1.svg?style=flat-square&label=Compatibility&message=%3E%3D1.12.0&logo=visual-studio-code&logoColor=eceff4&colorA=4c566a&colorB=88c0d0"/></a></p>

<p align="center">Changelog for <a href="https://www.nordtheme.com/ports/visual-studio-code">Nord Visual Studio Code</a> — An arctic, north-bluish clean and elegant <a href="https://code.visualstudio.com" target="_blank">Visual Studio Code</a> theme.</p>

![Release Date: 2019-08-10](https://img.shields.io/static/v1.svg?style=flat-square&label=Release%20Date&message=2019-08-10&colorA=4c566a&colorB=88c0d0) [![Project Board](https://img.shields.io/static/v1.svg?style=flat-square&label=Project%20Board&message=0.12.0&colorA=4c566a&colorB=88c0d0)](https://github.com/arcticicestudio/nord-visual-studio-code/projects/21) [![Milestone](https://img.shields.io/static/v1.svg?style=flat-square&label=Milestone&message=0.12.0&colorA=4c566a&colorB=88c0d0)](https://github.com/arcticicestudio/nord-visual-studio-code/milestone/17)

## Features

**Minimap search results visibility** — #150 ⇄ #152 (⊶ 6b6655fc)
↠ In [VS Code 1.37][vsc-rln-1.37#minimap_search_marker] (July 2019) the search decorations in the minimap (code outline) have been improved so the entire line will now be highlighted with low opacity, and the actual match shown with high opacity.
To customize the color, the new `minimap.findMatchHighlight` UI/workbench theme key has been added to Nord.

<p align="center"><strong>Before</strong></p>
<p align="center"><img src="https://user-images.githubusercontent.com/7836623/62819896-1548f900-bb5c-11e9-8590-47b65c68466b.png" /></p>

<p align="center"><strong>After</strong></p>
<p align="center"><img src="https://user-images.githubusercontent.com/7836623/62819895-1548f900-bb5c-11e9-819e-fe9e84ef21be.png" /></p>

**Filled background color for „Find“ widget's button toggle active state** — #151 ⇄ #153 (⊶ f5c767fd)
↠ In [VS Code 1.37][vsc-rln-1.37#find_button_bg] (July 2019) the Find widget's button toggle active state now has a filled background so that it is easier to tell when the focus is on an active toggle.
To customize the background color of the toggle active state, the new `inputOption.activeBackground` UI/workbench theme key has been added to Nord.

<p align="center"><strong>Before</strong></p>
<p align="center"><img src="https://user-images.githubusercontent.com/7836623/62819937-ba63d180-bb5c-11e9-88cf-2d9c9c699693.png" /></p>

<p align="center"><strong>After</strong></p>
<p align="center"><img src="https://user-images.githubusercontent.com/7836623/62819936-ba63d180-bb5c-11e9-9dd0-47544a046ac9.png" /></p>
<p align="center"><img src="https://user-images.githubusercontent.com/7836623/62819940-c94a8400-bb5c-11e9-8189-6bd29132560b.gif" /></p>

Unfortunately there is no UI theme key (yet) to also change the foreground color of active state toggles. It is "hard-coded" using a relatively bright color so it is not possible to also use a bright background color. It would be great to apply a "reverse" effect to e.g. use `nord0` as foreground to increase the contrast when using `nord8` as background color.

## Improvements

**Renamed theme file to enable „hidden“ theme development features** — #143/#148 (⊶ 4f808c88) co-authored by [@svipas][gh-user-svipas]
↠ An undocumented feature for theme extension developers is to ensure the name of the JSON file is suffixed with `-color-theme.json`. This enables the JSON scheme validation for the theme API allowing developers to validate the implemented theme keys, showing warnings about deprecated keys and providing full auto completion, field documentations and color previews (color picker) for the HEX format.
By renaming the theme file, Nord aligns to the [official bundled and default themes][microsoft/vscode-tree-ext-theme-abyss] by adapting to the naming scheme without introducing a breaking change since the theme is identified by it's extension ID as well as the `_metadata` field in the `package.json` and not by the name of the theme file (which would be odd since a theme can provide multiple theme files).

[gh-user-svipas]: https://github.com/svipas
[microsoft/vscode-tree-ext-theme-abyss]: https://github.com/microsoft/vscode/tree/master/extensions/theme-abyss/themes
[vsc-rln-1.37#find_button_bg]: https://code.visualstudio.com/updates/v1_37#_button-toggle-active-state-in-find-widget
[vsc-rln-1.37#minimap_search_marker]: https://code.visualstudio.com/updates/v1_37#_improved-minimap-search-results-visibility
