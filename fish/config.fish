# check if login
if status is-login
    if test -z "$DISPLAY" -a "$XDG_VTNR" = 1
        exec startx
    end
end

# colors
set -x theme_color_scheme nord

# greeting
function fish_greeting
    if test $TERM = "xterm-kitty"
        neofetch\
        --disable 'icons' --disable 'title'\
        --disable 'uptime' --disable 'theme'\
        --disable 'resolution' --disable 'memory'\
        --disable 'packages' --disable 'cols'\
        --disable 'term_font' --kitty --size '164'\
        --disable 'underline' --gap '2'\
        --source '/home/mbednarek360/.config/wallpaper.png'
    end
end

# silver prompt
set SILVER status:magenta:black cmdtime:black:yellow git:green:black dir:blue:black
set -x SILVER_DIR_ALIASES "$HOME: ~:$HOME/Code: ~/Code:$HOME/Documents: ~/Documents:$HOME/Pictures: ~/Pictures:$HOME/.config: ~/.config"
set -x SILVER_SEPARATOR ''
set -x SILVER_THIN_SEPARATOR '|'
set -x SILVER_SHELL fish
eval (silver init)

# fzf
set -x FZF_DEFAULT_OPTS "\
--color fg:#D8DEE9,bg:#2E3440,hl:#A3BE8C,fg+:#D8DEE9,bg+:#434C5E,hl+:#A3BE8C \
--color pointer:#BF616A,info:#4C566A,spinner:#4C566A,header:#4C566A,prompt:#81A1C1,marker:#EBCB8B\
"

# aliases
source ~/.config/fish/alias.fish

# nord colors
set nord0 2e3440
set nord1 3b4252
set nord2 434c5e
set nord3 4c566a
set nord4 d8dee9
set nord5 e5e9f0
set nord6 eceff4
set nord7 8fbcbb
set nord8 88c0d0
set nord9 81a1c1
set nord10 5e81ac
set nord11 bf616a
set nord12 d08770
set nord13 ebcb8b
set nord14 a3be8c
set nord15 b48ead
set fish_color_normal $nord4
set fish_color_command $nord14
set fish_color_quote $nord14
set fish_color_redirection $nord9
set fish_color_end $nord6
set fish_color_error $nord11
set fish_color_param $nord4
set fish_color_comment $nord3
set fish_color_match $nord8
set fish_color_search_match --background=$nord2
set fish_color_operator $nord9
set fish_color_escape $nord13
set fish_color_cwd $nord8
set fish_color_autosuggestion $nord3
set fish_color_user $nord4
set fish_color_host $nord9
set fish_color_cancel $nord15
set fish_pager_color_prefix $nord15
set fish_pager_color_completion $nord4
set fish_pager_color_description $nord9
set fish_pager_color_progress $nord3
set fish_pager_color_secondary $nord1
set -x LS_COLORS (dircolors --csh ~/.config/fish/dir_colors | cut -d'\'' -f2)
