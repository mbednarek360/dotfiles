# directory
ZDOTDIR=$ZHOME/.cache/zsh

# history
HISTFILE=.zsh_history
SAVEHIST=50
HISTSIZE=50
bindkey '^[[A' history-substring-search-up
bindkey '^[[B' history-substring-search-down
HISTORY_SUBSTRING_SEARCH_HIGHLIGHT_FOUND=false
HISTORY_SUBSTRING_SEARCH_HIGHLIGHT_NOT_FOUND=false
                                   
# powerlevel9k
ZLE_RPROMPT_INDENT=1
POWERLEVEL9K_STATUS_CROSS=true
POWERLEVEL9K_VCS_HIDE_TAGS=true
POWERLEVEL9K_HIDE_BRANCH_ICON=true
POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(host dir)
POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(status vcs time)

# selection
shift-arrow() {
  ((REGION_ACTIVE)) || zle set-mark-command
  zle $1
}
shift-left() shift-arrow backward-char
shift-right() shift-arrow forward-char
shift-up() shift-arrow up-line-or-history
shift-down() shift-arrow down-line-or-history
zle -N shift-left
zle -N shift-right
zle -N shift-up
zle -N shift-down
bindkey $terminfo[kLFT] shift-left
bindkey $terminfo[kRIT] shift-right
bindkey $terminfo[kri] shift-up
bindkey $terminfo[kind] shift-down

# navigation
bindkey "^[[1;5C" forward-word
bindkey "^[[1;5D" backward-word

# menu
autoload -Uz compinit 
if [[ -n ${ZDOTDIR}/.zcompdump(#qN.mh+24) ]]; then
	compinit;
else
	compinit -C;
fi
zstyle ':completion:*' menu select
