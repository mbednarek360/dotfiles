" plugins
call plug#begin('~/.cache/nvim/plugged')
    Plug 'bling/vim-airline'
    Plug 'arcticicestudio/nord-vim'
call plug#end()

" key bindings
map <A-left> <C-w>h
map <A-down> <C-w>j
map <A-up> <C-w>k
map <A-right> <C-w>l
map <A-s> :vsp<CR>
map <A-t> :silent !kitty &<CR>
map <A-q> :q<CR>
map <A-k> :bd<CR>
map <A-c> \c 
map <A-l> :bprevious<CR>
map <A-b> :silent !$BROWSE "%:p" &<CR>
map <C-down> 5j
" editor config
autocmd FileType * setlocal formatoptions-=c formatoptions-=r formatoptions-=o
set backspace=indent,eol,start
set clipboard=unnamedplus
set tabstop=4
set shiftwidth=4
set expandtab

" misc
filetype plugin on
set number rnu
syntax on
set nofoldenable
set linebreak
set showmatch
set noshowmode
set smartindent
set smarttab
set smartcase
set hlsearch
set spell
set virtualedit=all 
set mouse=a

" airline
let g:airline#extensions#tabline#enabled = 1
let g:airline_powerline_fonts = 0

" style config
colorscheme nord
hi! Normal ctermbg=NONE guibg=NONE