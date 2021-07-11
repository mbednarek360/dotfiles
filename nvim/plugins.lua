return require('packer').startup(function()
    use 'wbthomason/packer.nvim'
    use 'shaunsingh/nord.nvim'
    use 'kyazdani42/nvim-web-devicons'
    use 'akinsho/nvim-bufferline.lua'
    use 'nvim-treesitter/nvim-treesitter'
    use 'hoob3rt/lualine.nvim' 
    use 'beauwilliams/focus.nvim'
    use 'lukas-reineke/indent-blankline.nvim'
    use 'neovim/nvim-lspconfig'
    use 'glepnir/dashboard-nvim'
    use { 'karb94/neoscroll.nvim', config = function() require('neoscroll').setup{} end} 
    use { 'romgrk/nvim-treesitter-context', config = function()
        vim.cmd('hi TreesitterContext guibg=#3b4252') end}
    use { 'hrsh7th/nvim-compe', 
    config = function() require('compe').setup{
    enabled = true, autocomplete = true,
    documentation = true, source = {
      path = true, buffer = true, nvim_lsp = true}} end}
    use { 'windwp/nvim-autopairs', config = function() require('nvim-autopairs').setup{} end}
    use { 'onsails/lspkind-nvim', config = function() require('lspkind').init() end}
    use { 'terrortylor/nvim-comment', cmd = 'CommentToggle',
        config = function() require('nvim_comment').setup{} end}
    use { 'junegunn/goyo.vim', cmd = 'Goyo' } 
    use { 'junegunn/limelight.vim', cmd = 'Limelight' }
    use { 'ahmedkhalf/lsp-rooter.nvim', config = function()
        require("lsp-rooter").setup{} end}
    use { "folke/todo-comments.nvim", requires = "nvim-lua/plenary.nvim" }
    use { 'nvim-telescope/telescope.nvim', cmd = 'Telescope',
        requires = {{'nvim-lua/popup.nvim'}, {'nvim-lua/plenary.nvim'}},
        config = function() require('telescope').setup{
		defaults = require('telescope.themes').get_dropdown {
            mappings={i={['<Esc>'] = 'close'}}}} end}
end)
