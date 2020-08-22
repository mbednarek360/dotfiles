" plugins
call plug#begin('~/.cache/nvim/plugged')
    Plug 'bling/vim-airline'
    Plug 'arcticicestudio/nord-vim'
    Plug 'junegunn/fzf.vim'
    Plug 'majutsushi/tagbar'
    Plug 'airblade/vim-gitgutter'
    Plug 'Shougo/defx.nvim', { 'do': ':UpdateRemotePlugins' }
    Plug 'kristijanhusak/defx-icons'
    Plug 'kristijanhusak/defx-git'
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
map <PageDown> :bprevious<CR>
map <PageUp> :bnext<CR>
map <A-b> :silent !$BROWSE "%:p" &<CR>
map <F1> :Defx<CR>
map <F2> :TagbarToggle<CR>

map <C-down> 5j
imap <C-l> <Plug>(coc-snippets-expand)
vmap <C-j> <Plug>(coc-snippets-select)
let g:coc_snippet_next = '<c-j>'
let g:coc_snippet_prev = '<c-k>'
imap <C-j> <Plug>(coc-snippets-expand-jump)

" editor config
autocmd FileType * setlocal formatoptions-=c formatoptions-=r formatoptions-=o
set backspace=indent,eol,start
set clipboard=unnamedplus
set tabstop=4
set shiftwidth=4
set expandtab

" defx
autocmd VimEnter * Defx
autocmd BufWritePost * call defx#redraw()
autocmd FileType defx call <SID>defx_mappings()
autocmd BufEnter * call defx#do_action('cd', getcwd())
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

    nnoremap <silent><buffer><expr> <CR>  defx#do_action('multi', ['drop', 'change_vim_cwd'])
	nnoremap <silent><buffer><expr> o     <sid>defx_toggle_tree()
    nnoremap <silent><buffer><expr> s     defx#do_action('open', 'botright vsplit')
	nnoremap <silent><buffer><expr> K     defx#do_action('new_directory')
	nnoremap <silent><buffer><expr> dd    defx#do_action('remove_trash')
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
	nnoremap <silent><buffer><expr> u  defx#do_action('multi', [['cd', '..'], 'change_vim_cwd'])
endfunction

" tagbar
let g:tagbar_compact = 1
let g:tagbar_width = 30

" fzf
let g:fzf_preview_window = ''

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
set hidden
set spell
set virtualedit=all 
set mouse=a

" airline
let g:airline#extensions#tabline#enabled = 1
let g:airline_powerline_fonts = 0

" style config
colorscheme nord
hi! Normal ctermbg=NONE guibg=NONE
