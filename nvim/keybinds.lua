vim.api.nvim_set_keymap('', '\\', ':vsp<CR>', {})
vim.api.nvim_set_keymap('', '<A-t>', ':silent !kitty &<CR>', {})
vim.api.nvim_set_keymap('', '<A-f>', ':hi! Folded guifg=#80a0bf<CR>za', {})
vim.api.nvim_set_keymap('', '<A-a>', '<C-w>h', {})
vim.api.nvim_set_keymap('', '<A-d>', '<C-w>l', {})
vim.api.nvim_set_keymap('', '<A-q>', ':bp<CR>', {})
vim.api.nvim_set_keymap('', '<A-e>', ':bn<CR>', {})
vim.api.nvim_set_keymap('', '<A-w>', 'zb', {})
vim.api.nvim_set_keymap('', '<A-s>', 'zt', {})
vim.api.nvim_set_keymap('', '<A-g>', ':Goyo<CR>', {})
vim.api.nvim_set_keymap('', '<A-c>', ':CommentToggle<CR>', {})
vim.api.nvim_set_keymap('', '<A-r>', ':Telescope oldfiles<CR>', {})

vim.api.nvim_set_keymap('n', '/', ':Telescope fd<CR>', { noremap = true })
vim.api.nvim_set_keymap('n', '<Space>', ':Telescope live_grep<CR>', { noremap = true })
vim.api.nvim_set_keymap('n', '<Tab>', ':Telescope lsp_code_actions<CR>', { noremap = true })
vim.api.nvim_set_keymap('n', '`', ':Telescope lsp_workspace_diagnostics<CR>', { noremap = true })

 vim.g.dashboard_custom_section = {
    a = {description = {' All Files                 /'}, command = 'Telescope fd'},
    b = {description = {' Recent Files        Alt + R'}, command = 'Telescope oldfiles'},
    c = {description = {' Open Terminal       Alt + T'}, command = 'silent !kitty &'},
    d = {description = {' Search Text           Space'}, command = 'Telescope live_grep'},
}
