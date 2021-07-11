vim.cmd('colorscheme nord')
vim.cmd('hi! Normal guibg=NONE')
vim.cmd('au FileType dashboard set laststatus=1 | set showtabline=0')
vim.cmd('au BufEnter * if &filetype != \'dashboard\' && len(&buftype) == 0 | set laststatus=2 | set showtabline=2')
vim.cmd('au User GoyoEnter | set laststatus=0 | set showtabline=0 | sleep 2m | IndentBlanklineDisable')
vim.cmd('au User GoyoLeave | set laststatus=2 | set showtabline=2 | set nu | set rnu | sleep 2m | IndentBlanklineEnable')
vim.cmd('set noshowmode noruler termguicolors')

vim.g.limelight_conceal_guifg = '#434c5e'
vim.g.indent_blankline_char = '│'
vim.g.indent_blankline_filetype_exclude = {'dashboard'}
vim.g.dashboard_disable_at_vimenter = false

vim.o.fillchars='fold: '
vim.o.foldtext = [[v:folddashes.substitute(getline(v:foldstart),'/\\*\\\|\\*/\\\|{{{\\d\\=','','g')]] 
vim.fn.sign_define("LspDiagnosticsSignError", {text = '▍', numhl = "LspDiagnosticsDefaultError"})
vim.fn.sign_define("LspDiagnosticsSignWarning", {text = '▍', numhl = "LspDiagnosticsDefaultWarning"})
vim.fn.sign_define("LspDiagnosticsSignInformation", {text = '▍', numhl = "LspDiagnosticsDefaultInformation"})
vim.fn.sign_define("LspDiagnosticsSignHint", {text = '▍', numhl = "LspDiagnosticsDefaultHint"})

vim.g.dashboard_custom_footer = {}
vim.g.dashboard_custom_header = {
    '','','','','',
    '   ⣴⣶⣤⡤⠦⣤⣀⣤⠆     ⣈⣭⣭⣿⣶⣿⣦⣼⣆         ',
    '    ⠉⠻⢿⣿⠿⣿⣿⣶⣦⠤⠄⡠⢾⣿⣿⡿⠋⠉⠉⠻⣿⣿⡛⣦       ',
    '          ⠈⢿⣿⣟⠦ ⣾⣿⣿⣷⠄⠄⠄⠄⠻⠿⢿⣿⣧⣄     ',
    '           ⣸⣿⣿⢧ ⢻⠻⣿⣿⣷⣄⣀⠄⠢⣀⡀⠈⠙⠿⠄    ',
    '          ⢠⣿⣿⣿⠈  ⠡⠌⣻⣿⣿⣿⣿⣿⣿⣿⣛⣳⣤⣀⣀   ',
    '   ⢠⣧⣶⣥⡤⢄ ⣸⣿⣿⠘⠄ ⢀⣴⣿⣿⡿⠛⣿⣿⣧⠈⢿⠿⠟⠛⠻⠿⠄  ',
    '  ⣰⣿⣿⠛⠻⣿⣿⡦⢹⣿⣷   ⢊⣿⣿⡏  ⢸⣿⣿⡇ ⢀⣠⣄⣾⠄   ',
    ' ⣠⣿⠿⠛⠄⢀⣿⣿⣷⠘⢿⣿⣦⡀ ⢸⢿⣿⣿⣄ ⣸⣿⣿⡇⣪⣿⡿⠿⣿⣷⡄  ',
    ' ⠙⠃   ⣼⣿⡟  ⠈⠻⣿⣿⣦⣌⡇⠻⣿⣿⣷⣿⣿⣿ ⣿⣿⡇⠄⠛⠻⢷⣄ ',
    '      ⢻⣿⣿⣄   ⠈⠻⣿⣿⣿⣷⣿⣿⣿⣿⣿⡟ ⠫⢿⣿⡆     ',
    '       ⠻⣿⣿⣿⣿⣶⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⡟⢀⣀⣤⣾⡿⠃     ',
    '','          [Neovim v'
   ..vim.version()['major']..'.'
   ..vim.version()['minor']..'.'
   ..vim.version()['patch']..']'
}

require('todo-comments').setup{
    colors = {
        error = { '#BF616A' },
        warning = { '#EBCB9B' },
        info = { '#81A1C1' },
        hint = { '#A3BE8C' },
        default = { '#B48EAD' }
    },
     keywords = {
        FIX =  { icon = '▍', color = 'error', },
        TODO = { icon = '▍', color = 'info' },
        HACK = { icon = '▍', color = 'warning' },
        WARN = { icon = '▍', color = 'warning' },
        PERF = { icon = '▍', alt = { 'OPT' } },
        NOTE = { icon = '▍', color = 'hint', alt = { 'INFO' } },
    }
}

local nord = require('lualine.themes.nord')
nord.normal.c.bg='#2e3440'
require('lualine').setup{
    options={
        theme=nord,
        section_separators = {'',''},
        component_separators = {'',''},
        disabled_filetypes = {'NvimTree', 'dashboard'}
    }
}

require('bufferline').setup{
    options={
        show_close_icon = false,
        show_buffer_close_icons = false,
        show_tab_indicators = false,
        seperator_style = 'thin',
        offsets = {{filetype = 'dashboard'}, {filetype = 'NvimTree', text = ''}},
    }
}

vim.cmd('autocmd InsertEnter * Limelight')
vim.cmd('autocmd InsertLeave * Limelight!')
-- vim.cmd('autocmd User GoyoEnter if @% == "" | silent! bprevious | set nornu | else | set rnu | endif')
