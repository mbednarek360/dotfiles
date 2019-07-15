" plugins
call plug#begin('~/.cache/nvim/plugged')
    Plug 'scrooloose/nerdtree'
    Plug 'majutsushi/tagbar'
    Plug 'vim-syntastic/syntastic' 
    Plug 'jiangmiao/auto-pairs'

    Plug 'roxma/nvim-yarp'
    Plug 'ncm2/ncm2'
    Plug 'ncm2/ncm2-path'
    Plug 'ncm2/ncm2-racer' 
    
    Plug 'SirVer/ultisnips'
    Plug 'ncm2/ncm2-ultisnips'
    Plug 'honza/vim-snippets'                         

    Plug 'junegunn/fzf', { 'dir': '~/.fzf', 'do': './install --bin' }
    Plug 'junegunn/fzf.vim'
    Plug 'airblade/vim-gitgutter'
    Plug 'rust-lang/rust.vim'

    Plug 'bling/vim-airline'
    Plug 'arcticicestudio/nord-vim'
call plug#end()

" key bindings
map <A-left> <C-w>h
map <A-down> <C-w>j
map <A-up> <C-w>k
map <A-right> <C-w>l
map <A-f> :NERDTreeToggle<CR>
map <A-d> :TagbarToggle<CR>
map <A-r> :NERDTreeRefreshRoot<CR>
map <A-b> :!firefox % >/dev/null &<CR>
map <A-e> :call ToggleErrors()<CR>
map <A-g> :!xdot % >/dev/null &<CR>
map <A-c> :so ~/.config/nvim/init.vim<CR>                               
map ; :ProjectFiles<CR>
map <C-down> 5j
map <C-up> 5k

" Syntastic config
function! ToggleErrors()
    if empty(filter(tabpagebuflist(), 'getbufvar(v:val, "&buftype") is# "quickfix"'))
        w
        Errors
    else
        lclose
    endif
endfunction
autocmd BufWritePost * Errors
let g:syntastic_loc_list_height = 7
let g:syntastic_check_on_open = 1
let g:syntastic_check_on_wq = 0

" fzf
let g:fzf_layout = { 'down': '3' }
command! ProjectFiles execute 'Files' g:NERDTree.ForCurrentTab().getRoot().path.str()
 
" ncm2 / ultisnip
autocmd BufEnter * call ncm2#enable_for_buffer()
set completeopt=noinsert,menuone,noselect
let g:UltiSnipsExpandTrigger="<tab>"
let g:UltiSnipsJumpForwardTrigger="<c-b>"
let g:UltiSnipsJumpBackwardTrigger="<c-z>"

" NERDTree config
autocmd BufEnter * lcd %:p:h
let g:NERDTreeWinSize = 32
let g:NERDTreeShowBookmarks = 1
let g:NERDTreeHijackNetrw = 0
augroup NERDTreeHijackNetrw
    autocmd VimEnter * silent! autocmd! FileExplorer
augroup END
autocmd VimEnter * NERDTree

" tagbar config
let g:tagbar_width = 32
let g:tagbar_autoshowtag = 1
let g:tagbar_autoclose = 1

" editor config
autocmd FileType * setlocal formatoptions-=c formatoptions-=r formatoptions-=o
set backspace=indent,eol,start
set clipboard=unnamedplus
set tabstop=4
set shiftwidth=4
set expandtab

" misc
let g:mkdp_browser = 'firefox-developer-edition'
set number
syntax on
set nofoldenable
set linebreak
set showmatch
set smartindent
set smarttab
set smartcase
set hlsearch
set spell
set virtualedit=all 

" style config
colorscheme nord
let g:airline_powerline_fonts= 1
hi! Normal ctermbg=NONE guibg=NONE
autocmd VimEnter * silent! autocmd! verbose highlight GitGutterAdd
autocmd VimEnter * silent! autocmd! verbose highlight DiffAdd
let g:fzf_colors =
\ { 'fg':      ['fg', 'Normal'],
  \ 'bg':      ['bg', 'Normal'],
  \ 'hl':      ['fg', 'Comment'],
  \ 'fg+':     ['fg', 'CursorLine', 'CursorColumn', 'Normal'],
  \ 'bg+':     ['bg', 'CursorLine', 'CursorColumn'],
  \ 'hl+':     ['fg', 'Statement'],
  \ 'info':    ['fg', 'PreProc'],
  \ 'border':  ['fg', 'Ignore'],
  \ 'prompt':  ['fg', 'Conditional'],
  \ 'pointer': ['fg', 'Exception'],
  \ 'marker':  ['fg', 'Keyword'],
  \ 'spinner': ['fg', 'Label'],
  \ 'header':  ['fg', 'Comment'] } 
