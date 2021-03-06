vim.api.nvim_set_keymap('', '\\', ':vsp<CR>', {})
vim.api.nvim_set_keymap('', '<A-esc>', ':Dashboard<CR>', {})
vim.api.nvim_set_keymap('', '<A-f>', ':set foldmethod=expr | hi! Folded guifg=#80a0bf guibg=#3b4252<CR>za', {})
vim.api.nvim_set_keymap('', '<A-S-a>', '<C-w>H', {})
vim.api.nvim_set_keymap('', '<A-S-d>', '<C-w>L', {})
vim.api.nvim_set_keymap('', '<A-a>', '<C-w>h', {})
vim.api.nvim_set_keymap('', '<A-d>', '<C-w>l', {})
vim.api.nvim_set_keymap('', '<A-q>', ':bp<CR>', {})
vim.api.nvim_set_keymap('', '<A-e>', ':bn<CR>', {})
vim.api.nvim_set_keymap('', '<A-n>', ':doautocmd bufRead | enew<CR>', {})
vim.api.nvim_set_keymap('', '<A-w>', 'zb', {})
vim.api.nvim_set_keymap('', '<A-s>', 'zt', {})
vim.api.nvim_set_keymap('', '<A-x>', ':bd<CR>', {})
vim.api.nvim_set_keymap('', '<A-g>', ':Goyo<CR>', {})
vim.api.nvim_set_keymap('', '<A-c>', ':CommentToggle<CR>', {})
vim.api.nvim_set_keymap('', '<A-r>', ':Telescope oldfiles<CR>', {})

vim.api.nvim_set_keymap('n', '/', ':Telescope fd<CR>', { noremap = true })
vim.api.nvim_set_keymap('n', '<Space>', ':Telescope live_grep<CR>', { noremap = true })
vim.api.nvim_set_keymap('n', '<Tab>', ':Telescope lsp_code_actions<CR>', { noremap = true })
vim.api.nvim_set_keymap('n', '<A-`>', ':Telescope lsp_workspace_diagnostics<CR>', { noremap = true })
vim.api.nvim_set_keymap('n', '`', ':lua vim.lsp.diagnostic.show_line_diagnostics()<CR>', {})
vim.g.floaterm_keymap_toggle = '<A-t>'
vim.g.floaterm_keymap_kill = '<A-S-t>'

vim.g.dashboard_custom_section = {
    a = {description = {' All Files                 /'}, command = 'Telescope fd'},
    b = {description = {' Recent Files        Alt + R'}, command = 'Telescope oldfiles'},
    c = {description = {' New File            Alt + N'}, command = 'doautocmd BufRead | enew'},
    d = {description = {' Open Terminal       Alt + T'}, command = 'FloatermToggle'},
    e = {description = {' Search Text           Space'}, command = 'Telescope live_grep'},
}
