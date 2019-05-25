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

    Plug 'airblade/vim-gitgutter'
    Plug 'rust-lang/rust.vim'
    Plug 'iamcco/markdown-preview.nvim', { 'do': { -> mkdp#util#install() } }

    Plug 'bling/vim-airline'
    Plug 'arcticicestudio/nord-vim'
call plug#end()
            
" key bindings
map <C-left> <C-w>h
map <C-down> <C-w>j
map <C-up> <C-w>k
map <C-right> <C-w>l
map <C-S-f> :NERDTreeToggle<CR>
map <C-S-d> :TagbarToggle<CR>
map <C-S-r> :NERDTreeRefreshRoot<CR>
map <C-S-p> :MarkdownPreview<CR>
map <C-S-e> :call ToggleErrors()<CR>

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
let g:tagbar_width= 32
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
set termguicolors
hi! Normal ctermbg=NONE guibg=NONE
autocmd VimEnter * silent! autocmd! verbose highlight GitGutterAdd
autocmd VimEnter * silent! autocmd! verbose highlight DiffAdd
 
