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

vim.g.indent_blankline_show_trailing_blankline_indent = false
vim.g.indent_blankline_show_current_context = true
vim.g.indent_blankline_use_treesitter = true
vim.g.indent_blankline_context_patterns = {'class', 'function', 'method', '^if', '^while', '^for', '^object', '^table', 'block', 'arguments'}

vim.o.completeopt = 'menuone,noselect'
vim.o.clipboard = 'unnamedplus'
vim.o.signcolumn = 'yes'
vim.o.foldmethod = 'expr'
vim.o.foldexpr = 'nvim_treesitter#foldexpr()'
vim.o.virtualedit = 'all'
vim.o.foldlevel = 1000
vim.o.mouse = 'a'

vim.cmd('au GuiEnter * EnableFocus')
vim.cmd('au FileType * setlocal fo-=c fo-=r fo-=o')    
local capabilities = vim.lsp.protocol.make_client_capabilities()
capabilities.textDocument.completion.completionItem.snippetSupport = true
capabilities.textDocument.completion.completionItem.resolveSupport = {
  properties = {
    'documentation',
    'detail',
    'additionalTextEdits',
  }
}

require'lspconfig'.rust_analyzer.setup { capabilities = capabilities }
require'lspconfig'.pyright.setup { capabilities = capabilities }
