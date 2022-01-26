return require('packer').startup(function()
    use 'wbthomason/packer.nvim'
    use 'shaunsingh/nord.nvim'
    use 'kyazdani42/nvim-web-devicons'
    use 'voldikss/vim-floaterm'
    use { 'akinsho/nvim-bufferline.lua', event = 'BufRead', 
    config = function() require('bufferline').setup{
        options = vim.g.bl_opts,
        highlights = vim.g.bl_colors
    } end}
    use { 'nvim-treesitter/nvim-treesitter', config = function()
        require'nvim-treesitter.configs'.setup { highlight = { enable = true }}
    end}
    use { 'hoob3rt/lualine.nvim', event = 'BufRead', config = function() require('lualine').setup{
        options = vim.g.ll_opts, sections = {
        lualine_x = {'filetype'}
        }
    } end}
    use { 'lukas-reineke/indent-blankline.nvim', event = 'BufRead' }
    use { 'neovim/nvim-lspconfig', config = function()
        require'lspconfig'.rust_analyzer.setup { capabilities = vim.g.capabilities }
        require'lspconfig'.jedi_language_server.setup { capabilities = vim.g.capabilities }
        require'lspconfig'.zls.setup { capabilities = vim.g.capabilities }
        require'lspconfig'.julials.setup { capabilities = vim.g.capabilities }
    end}
    use { 'beauwilliams/focus.nvim', event = 'BufRead' }
    use 'glepnir/dashboard-nvim'
    use { 'andweeb/presence.nvim', event = 'BufRead' }
    use { 'karb94/neoscroll.nvim', event = 'BufRead', config = function() require('neoscroll').setup{} end}



    use {'nvim-neorg/neorg', config = function() require('neorg').setup{
        load = {
            ["core.defaults"] = {}, 
            ["core.norg.concealer"] = {},
            ["core.norg.completion"] = { config = { engine = 'nvim-compe'}} 
        }} end}



    use { 'romgrk/nvim-treesitter-context', config = function()
        vim.cmd('hi TreesitterContext guibg=#3b4252') end}
    use { 'hrsh7th/nvim-compe', event = 'BufRead', 
    config = function() require('compe').setup{
    enabled = true, autocomplete = true,
    documentation = true, source = {
      path = true, buffer = true, neorg = true, nvim_lsp = true, nvim_lua = true}} end}
    use { 'windwp/nvim-autopairs', event = 'BufRead', config = function() require('nvim-autopairs').setup{} end}
    use { 'onsails/lspkind-nvim', config = function() require('lspkind').init() end}
    use { 'terrortylor/nvim-comment', cmd = 'CommentToggle',
        config = function() require('nvim_comment').setup{} end}
    use { 'junegunn/goyo.vim', cmd = 'Goyo' } 
    use { 'junegunn/limelight.vim', cmd = 'Limelight' }
    use { 'ahmedkhalf/lsp-rooter.nvim', event = 'BufRead', config = function()
        require("lsp-rooter").setup{} end}
    use { "folke/todo-comments.nvim", requires = "nvim-lua/plenary.nvim", event = 'BufRead', 
    config = function() require('todo-comments').setup{
        colors = vim.g.td_colors,
        keywords = vim.g.td_keywords
    } end}
    use { 'nvim-telescope/telescope.nvim', cmd = 'Telescope',
        requires = {{'nvim-lua/popup.nvim'}, {'nvim-lua/plenary.nvim'}},
        config = function() require('telescope').setup{
		defaults = require('telescope.themes').get_dropdown {
            mappings={i={['<Esc>'] = 'close'}},
            vimgrep_arguments = {
                'rg',
                '--color=never',
                '--no-heading',
                '--with-filename',
                '--line-number',
                '--column',
                '--smart-case'
        }}}
     end}
end)
