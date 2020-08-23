" plugins
call plug#begin('~/.cache/nvim/plugged')
    Plug 'arcticicestudio/nord-vim'
    Plug 'itchyny/lightline.vim'   
    Plug 'junegunn/fzf.vim'
    Plug 'majutsushi/tagbar'
    Plug 'neoclide/coc.nvim', {'branch': 'release'}   
    Plug 'preservim/nerdcommenter'
    Plug 'junegunn/limelight.vim'
    Plug 'junegunn/goyo.vim'
    Plug 'Shougo/defx.nvim', { 'do': ':UpdateRemotePlugins' }
    Plug 'kristijanhusak/defx-icons'
    Plug 'kristijanhusak/defx-git'
    Plug 'mhinz/vim-startify'
call plug#end()

" key bindings
map <A-left> <C-w>h
map <A-down> <C-w>j
map <A-up> <C-w>k
map <A-right> <C-w>l
map <A-s> :vsp<CR>
map <A-t> :silent !kitty &<CR>
map <A-q> :call Killbuff()<CR>
map <A-k> :bd<CR>
map <A-c> <plug>NERDCommenterToggle
map <A-b> :silent !$BROWSE "%:p" &<CR>
map <A-f> za
map <A-Tab> :bprevious<CR>
map <F1> :Goyo!<CR>:Defx<CR>
map <F2> :Goyo!<CR>:TagbarToggle<CR>
map <F3> :Goyo<CR>
map <F4> :Startify<CR>
map <A-l> :Limelight!!<CR>
map <C-up> 5k
map <C-down> 5j
map <silent> <A-[> <Plug>(coc-diagnostic-prev)
map <silent> <A-]> <Plug>(coc-diagnostic-next)
nmap <A-n> <Plug>(coc-rename)
nmap <A-p> :PlugUpdate<CR><ESC>:q<CR>:Goyo<CR>:Goyo<CR>
nmap <Esc> :call coc#util#float_hide()<CR>
nmap / :Files<CR>
nmap <Space> :BLines<CR>

" quit current buffer
function Killbuff()
    let gopen = 0
    if exists('t:goyo_disabled_lightline') 
        let gopen = 1
        Goyo        
    endif    
    q
    if gopen == 1  
        Goyo        
    endif 
endfunction

" editor config
autocmd FileType * setlocal formatoptions-=c formatoptions-=r formatoptions-=o
autocmd InsertEnter * Limelight 
autocmd InsertLeave * Limelight!
set backspace=indent,eol,start
set clipboard=unnamedplus
set tabstop=4
set shiftwidth=4
set expandtab

" defx
let loaded_netrwPlugin = 1
autocmd BufWritePost * call defx#redraw()
autocmd FileType defx call <SID>defx_mappings()
let g:defx_icons_enable_syntax_highlight = 1
let g:defx_icons_column_length = 1
call defx#custom#column('git', {
  \   'indicators': {
  \     'Modified'  : '•',
  \     'Staged'    : '✚',
  \     'Untracked' : 'ᵁ',
  \     'Renamed'   : '≫',
  \     'Unmerged'  : '≠',
  \     'Ignored'   : 'ⁱ',
  \     'Deleted'   : '✖',
  \     'Unknown'   : '⁇'
  \   }
  \ })
autocmd WinEnter * if &filetype == 'defx' && winnr('$') == 1 | bdel | endif
call defx#custom#option('_', {
            \ 'columns': 'space:indent:git:icons:filename:type',
            \ 'winwidth': 30,
            \ 'split': 'vertical',
            \ 'direction': 'topleft',
            \ 'root_marker': '$PWD: ',
            \ 'ignored_files': '*.swp,.git,.svn,.DS_Store',
            \ 'show_ignored_files': 0,
            \ 'auto_cd': 1,
            \ 'toggle': 1,
            \ 'resume': 1
            \ })
function! s:defx_toggle_tree() abort
	if defx#is_directory()
		return defx#do_action('open_or_close_tree')
	endif
	return defx#do_action('multi', ['drop'])
endfunction

function! s:defx_mappings() abort
	setlocal signcolumn=no expandtab

    nnoremap <silent><buffer><expr> <CR>  defx#do_action('drop')
	nnoremap <silent><buffer><expr> <Space>     <sid>defx_toggle_tree()
    nnoremap <silent><buffer><expr> s     defx#do_action('open', 'botright vsplit')
	nnoremap <silent><buffer><expr> r     defx#do_action('rename')
	nnoremap <silent><buffer><expr> x     defx#do_action('execute_system')
	nnoremap <silent><buffer><expr> .     defx#do_action('toggle_ignored_files')
	nnoremap <silent><buffer><expr> yy    defx#do_action('yank_path')
    nnoremap <silent><buffer><expr> <Tab> winnr('$') != 1 ?
		\ ':<C-u>wincmd w<CR>' :
		\ ':<C-u>Defx -buffer-name=temp -split=vertical<CR>'
	nnoremap <silent><buffer><expr><nowait> c  defx#do_action('copy')
	nnoremap <silent><buffer><expr><nowait> m  defx#do_action('move')
	nnoremap <silent><buffer><expr><nowait> p  defx#do_action('paste')
	nnoremap <silent><buffer><expr><nowait> r  defx#do_action('rename')
	nnoremap <silent><buffer><expr> dd defx#do_action('remove_trash')
	nnoremap <silent><buffer><expr> K  defx#do_action('new_directory')
	nnoremap <silent><buffer><expr> N  defx#do_action('new_multiple_files')
	nnoremap <silent><buffer><expr> u  defx#do_action('cd', ['..'])
	nnoremap <silent><buffer> <Esc> :q<CR>
endfunction

" tagbar
let g:tagbar_compact = 1
let g:tagbar_width = 30

" startify
autocmd BufEnter * if isdirectory(expand('%')) | cd % | Startify | pwd
autocmd User GoyoLeave if @% == "" | silent! bprevious | set nornu | set nonu
let g:startify_custom_header = 'startify#pad(startify#fortune#boxed())'
let g:startify_bookmarks = [ '~/Code', '~/.config', '~/Documents']
let g:startify_commands = [
        \ {'F1': 'Defx'},
        \ {'/': 'Files'},
        \ {'A-p': 'PlugUpdate'},
        \ {'A-f': 'Goyo'}
        \ ]
let g:startify_lists = [
        \ { 'type': 'dir',       'header': ['   Files']      },
        \ { 'type': 'sessions',  'header': ['   Sessions']       },
        \ { 'type': 'bookmarks', 'header': ['   Bookmarks']      },
        \ { 'type': 'commands',  'header': ['   Commands']       },
        \ ]

" fzf
let g:fzf_layout = { 'window': { 'width': 0.7, 'height': 0.4 } }
let g:fzf_preview_window = ''

" misc
filetype plugin on
syntax on
set signcolumn=yes
set nofoldenable
set linebreak
set showmatch
set noshowmode
set smartindent
set smarttab
set foldmethod=syntax
set nofoldenable
set foldlevel=1000
set smartcase
set hidden
set hlsearch
set virtualedit=all 
set mouse=a

" theming
autocmd! BufReadPre * if exists('t:goyo_disabled_lightline') == 0 | call lightline#enable() | set rnu   
let g:lightline = { 'colorscheme': 'nord' }
autocmd! User GoyoEnter call feedkeys("\<C-U>\<C-U>") 
hi! Normal ctermbg=NONE guibg=NONE
let g:limelight_conceal_ctermfg = 0 
colorscheme nord
autocmd! VimEnter * call lightline#enable() | Goyo
