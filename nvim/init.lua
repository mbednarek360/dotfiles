package.path = '/home/mbednarek360/.config/nvim/' .. package.path
require('plugins')
require('style')
require('keybinds')

-- editor config

vim.o.nu = true
vim.o.rnu = true

vim.o.tabstop = 4
vim.o.shiftwidth = 4
vim.o.expandtab = true

vim.o.lazyredraw = true
vim.o.linebreak = true
vim.o.showmatch = true
vim.o.smartcase = true
vim.o.hidden = true
vim.o.hlsearch = true

vim.g.floaterm_autoclose = 2

vim.g.indent_blankline_show_trailing_blankline_indent = false
vim.g.indent_blankline_show_current_context = true
vim.g.indent_blankline_use_treesitter = true
vim.g.indent_blankline_context_patterns = {'class', 'function', 'method', '^if', '^while', '^for', '^object', '^table', 'block', 'arguments'}

vim.lsp.handlers["textDocument/publishDiagnostics"] = vim.lsp.with(
    vim.lsp.diagnostic.on_publish_diagnostics, {
virtual_text = false })

vim.o.completeopt = 'menuone,noselect'
vim.o.clipboard = 'unnamedplus'
vim.o.signcolumn = 'yes'
vim.o.foldmethod = 'expr'
vim.o.foldexpr = 'nvim_treesitter#foldexpr()'
vim.o.virtualedit = 'all'
vim.o.foldlevel = 1000
vim.o.mouse = 'a'

vim.cmd('au GuiEnter * EnableFocus')
vim.cmd('au FocusLost * silent! w')
vim.cmd('au FileType * setlocal fo-=c fo-=r fo-=o')
vim.cmd('au BufWritePre * lua vim.lsp.buf.formatting_sync()')
vim.cmd('au BufEnter *.zig lua vim.api.nvim_buf_set_option(0, "commentstring", "// %s")')
vim.cmd('au VimEnter * if @% != "" | doautocmd BufRead | else | Dashboard')
vim.g.capabilities = vim.lsp.protocol.make_client_capabilities()
vim.g.capabilities.textDocument.completion.completionItem.snippetSupport = true
vim.g.capabilities.textDocument.completion.completionItem.resolveSupport = {
    properties = {
        'documentation',
        'detail',
        'additionalTextEdits'
}}
