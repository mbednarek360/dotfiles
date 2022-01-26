-- Automatically generated packer.nvim plugin loader code

if vim.api.nvim_call_function('has', {'nvim-0.5'}) ~= 1 then
  vim.api.nvim_command('echohl WarningMsg | echom "Invalid Neovim version for packer.nvim! | echohl None"')
  return
end

vim.api.nvim_command('packadd packer.nvim')

local no_errors, error_msg = pcall(function()

  local time
  local profile_info
  local should_profile = false
  if should_profile then
    local hrtime = vim.loop.hrtime
    profile_info = {}
    time = function(chunk, start)
      if start then
        profile_info[chunk] = hrtime()
      else
        profile_info[chunk] = (hrtime() - profile_info[chunk]) / 1e6
      end
    end
  else
    time = function(chunk, start) end
  end
  
local function save_profiles(threshold)
  local sorted_times = {}
  for chunk_name, time_taken in pairs(profile_info) do
    sorted_times[#sorted_times + 1] = {chunk_name, time_taken}
  end
  table.sort(sorted_times, function(a, b) return a[2] > b[2] end)
  local results = {}
  for i, elem in ipairs(sorted_times) do
    if not threshold or threshold and elem[2] > threshold then
      results[i] = elem[1] .. ' took ' .. elem[2] .. 'ms'
    end
  end

  _G._packer = _G._packer or {}
  _G._packer.profile_output = results
end

time([[Luarocks path setup]], true)
local package_path_str = "/home/mbednarek360/.cache/nvim/packer_hererocks/2.0.5/share/lua/5.1/?.lua;/home/mbednarek360/.cache/nvim/packer_hererocks/2.0.5/share/lua/5.1/?/init.lua;/home/mbednarek360/.cache/nvim/packer_hererocks/2.0.5/lib/luarocks/rocks-5.1/?.lua;/home/mbednarek360/.cache/nvim/packer_hererocks/2.0.5/lib/luarocks/rocks-5.1/?/init.lua"
local install_cpath_pattern = "/home/mbednarek360/.cache/nvim/packer_hererocks/2.0.5/lib/lua/5.1/?.so"
if not string.find(package.path, package_path_str, 1, true) then
  package.path = package.path .. ';' .. package_path_str
end

if not string.find(package.cpath, install_cpath_pattern, 1, true) then
  package.cpath = package.cpath .. ';' .. install_cpath_pattern
end

time([[Luarocks path setup]], false)
time([[try_loadstring definition]], true)
local function try_loadstring(s, component, name)
  local success, result = pcall(loadstring(s))
  if not success then
    vim.schedule(function()
      vim.api.nvim_notify('packer.nvim: Error running ' .. component .. ' for ' .. name .. ': ' .. result, vim.log.levels.ERROR, {})
    end)
  end
  return result
end

time([[try_loadstring definition]], false)
time([[Defining packer_plugins]], true)
_G.packer_plugins = {
  ["dashboard-nvim"] = {
    loaded = true,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/start/dashboard-nvim"
  },
  ["focus.nvim"] = {
    loaded = false,
    needs_bufread = false,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/focus.nvim"
  },
  ["goyo.vim"] = {
    commands = { "Goyo" },
    loaded = false,
    needs_bufread = false,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/goyo.vim"
  },
  ["indent-blankline.nvim"] = {
    loaded = false,
    needs_bufread = false,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/indent-blankline.nvim"
  },
  ["limelight.vim"] = {
    commands = { "Limelight" },
    loaded = false,
    needs_bufread = false,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/limelight.vim"
  },
  ["lsp-rooter.nvim"] = {
    config = { "\27LJ\1\2<\0\0\2\0\3\0\a4\0\0\0%\1\1\0>\0\2\0027\0\2\0002\1\0\0>\0\2\1G\0\1\0\nsetup\15lsp-rooter\frequire\0" },
    loaded = false,
    needs_bufread = false,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/lsp-rooter.nvim"
  },
  ["lspkind-nvim"] = {
    config = { "\27LJ\1\0024\0\0\2\0\3\0\0064\0\0\0%\1\1\0>\0\2\0027\0\2\0>\0\1\1G\0\1\0\tinit\flspkind\frequire\0" },
    loaded = true,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/start/lspkind-nvim"
  },
  ["lualine.nvim"] = {
    config = { "\27LJ\1\2•\1\0\0\4\0\f\0\0154\0\0\0%\1\1\0>\0\2\0027\0\2\0003\1\6\0004\2\3\0007\2\4\0027\2\5\2:\2\a\0013\2\t\0003\3\b\0:\3\n\2:\2\v\1>\0\2\1G\0\1\0\rsections\14lualine_x\1\0\0\1\2\0\0\rfiletype\foptions\1\0\0\fll_opts\6g\bvim\nsetup\flualine\frequire\0" },
    loaded = false,
    needs_bufread = false,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/lualine.nvim"
  },
  ["neoscroll.nvim"] = {
    config = { "\27LJ\1\2;\0\0\2\0\3\0\a4\0\0\0%\1\1\0>\0\2\0027\0\2\0002\1\0\0>\0\2\1G\0\1\0\nsetup\14neoscroll\frequire\0" },
    loaded = false,
    needs_bufread = false,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/neoscroll.nvim"
  },
  ["nord.nvim"] = {
    loaded = true,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/start/nord.nvim"
  },
  ["nvim-autopairs"] = {
    config = { "\27LJ\1\2@\0\0\2\0\3\0\a4\0\0\0%\1\1\0>\0\2\0027\0\2\0002\1\0\0>\0\2\1G\0\1\0\nsetup\19nvim-autopairs\frequire\0" },
    loaded = false,
    needs_bufread = false,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/nvim-autopairs"
  },
  ["nvim-bufferline.lua"] = {
    config = { "\27LJ\1\2Š\1\0\0\3\0\n\0\0154\0\0\0%\1\1\0>\0\2\0027\0\2\0003\1\6\0004\2\3\0007\2\4\0027\2\5\2:\2\a\0014\2\3\0007\2\4\0027\2\b\2:\2\t\1>\0\2\1G\0\1\0\15highlights\14bl_colors\foptions\1\0\0\fbl_opts\6g\bvim\nsetup\15bufferline\frequire\0" },
    loaded = false,
    needs_bufread = false,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/nvim-bufferline.lua"
  },
  ["nvim-comment"] = {
    commands = { "CommentToggle" },
    config = { "\27LJ\1\2>\0\0\2\0\3\0\a4\0\0\0%\1\1\0>\0\2\0027\0\2\0002\1\0\0>\0\2\1G\0\1\0\nsetup\17nvim_comment\frequire\0" },
    loaded = false,
    needs_bufread = false,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/nvim-comment"
  },
  ["nvim-compe"] = {
    after_files = { "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/nvim-compe/after/plugin/compe.vim" },
    config = { "\27LJ\1\2”\1\0\0\3\0\6\0\t4\0\0\0%\1\1\0>\0\2\0027\0\2\0003\1\3\0003\2\4\0:\2\5\1>\0\2\1G\0\1\0\vsource\1\0\4\vbuffer\2\rnvim_lua\2\rnvim_lsp\2\tpath\2\1\0\3\17autocomplete\2\fenabled\2\18documentation\2\nsetup\ncompe\frequire\0" },
    loaded = false,
    needs_bufread = false,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/nvim-compe"
  },
  ["nvim-lspconfig"] = {
    config = { '\27LJ\1\2ê\1\0\0\3\0\f\0"4\0\0\0%\1\1\0>\0\2\0027\0\2\0007\0\3\0003\1\a\0004\2\4\0007\2\5\0027\2\6\2:\2\6\1>\0\2\0014\0\0\0%\1\1\0>\0\2\0027\0\b\0007\0\3\0003\1\t\0004\2\4\0007\2\5\0027\2\6\2:\2\6\1>\0\2\0014\0\0\0%\1\1\0>\0\2\0027\0\n\0007\0\3\0003\1\v\0004\2\4\0007\2\5\0027\2\6\2:\2\6\1>\0\2\1G\0\1\0\1\0\0\bzls\1\0\0\25jedi_language_server\1\0\0\17capabilities\6g\bvim\nsetup\18rust_analyzer\14lspconfig\frequire\0' },
    loaded = true,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/start/nvim-lspconfig"
  },
  ["nvim-treesitter"] = {
    config = { "\27LJ\1\2i\0\0\3\0\6\0\t4\0\0\0%\1\1\0>\0\2\0027\0\2\0003\1\4\0003\2\3\0:\2\5\1>\0\2\1G\0\1\0\14highlight\1\0\0\1\0\1\venable\2\nsetup\28nvim-treesitter.configs\frequire\0" },
    loaded = true,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/start/nvim-treesitter"
  },
  ["nvim-treesitter-context"] = {
    config = { "\27LJ\1\2F\0\0\2\0\3\0\0054\0\0\0007\0\1\0%\1\2\0>\0\2\1G\0\1\0'hi TreesitterContext guibg=#3b4252\bcmd\bvim\0" },
    loaded = true,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/start/nvim-treesitter-context"
  },
  ["nvim-web-devicons"] = {
    loaded = true,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/start/nvim-web-devicons"
  },
  ["packer.nvim"] = {
    loaded = true,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/start/packer.nvim"
  },
  ["plenary.nvim"] = {
    loaded = true,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/start/plenary.nvim"
  },
  ["popup.nvim"] = {
    loaded = true,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/start/popup.nvim"
  },
  ["presence.nvim"] = {
    loaded = false,
    needs_bufread = false,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/presence.nvim"
  },
  ["telescope.nvim"] = {
    commands = { "Telescope" },
    config = { "\27LJ\1\2¡\2\0\0\6\0\14\0\0204\0\0\0%\1\1\0>\0\2\0027\0\2\0003\1\f\0004\2\0\0%\3\3\0>\2\2\0027\2\4\0023\3\b\0003\4\6\0003\5\5\0:\5\a\4:\4\t\0033\4\n\0:\4\v\3>\2\2\2:\2\r\1>\0\2\1G\0\1\0\rdefaults\1\0\0\22vimgrep_arguments\1\b\0\0\arg\18--color=never\17--no-heading\20--with-filename\18--line-number\r--column\17--smart-case\rmappings\1\0\0\6i\1\0\0\1\0\1\n<Esc>\nclose\17get_dropdown\21telescope.themes\nsetup\14telescope\frequire\0" },
    loaded = false,
    needs_bufread = false,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/telescope.nvim"
  },
  ["todo-comments.nvim"] = {
    config = { "\27LJ\1\2Ž\1\0\0\3\0\n\0\0154\0\0\0%\1\1\0>\0\2\0027\0\2\0003\1\6\0004\2\3\0007\2\4\0027\2\5\2:\2\a\0014\2\3\0007\2\4\0027\2\b\2:\2\t\1>\0\2\1G\0\1\0\rkeywords\16td_keywords\vcolors\1\0\0\14td_colors\6g\bvim\nsetup\18todo-comments\frequire\0" },
    loaded = false,
    needs_bufread = false,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/opt/todo-comments.nvim"
  },
  ["vim-floaterm"] = {
    loaded = true,
    path = "/home/mbednarek360/.local/share/nvim/site/pack/packer/start/vim-floaterm"
  }
}

time([[Defining packer_plugins]], false)
-- Config for: nvim-treesitter-context
time([[Config for nvim-treesitter-context]], true)
try_loadstring("\27LJ\1\2F\0\0\2\0\3\0\0054\0\0\0007\0\1\0%\1\2\0>\0\2\1G\0\1\0'hi TreesitterContext guibg=#3b4252\bcmd\bvim\0", "config", "nvim-treesitter-context")
time([[Config for nvim-treesitter-context]], false)
-- Config for: nvim-treesitter
time([[Config for nvim-treesitter]], true)
try_loadstring("\27LJ\1\2i\0\0\3\0\6\0\t4\0\0\0%\1\1\0>\0\2\0027\0\2\0003\1\4\0003\2\3\0:\2\5\1>\0\2\1G\0\1\0\14highlight\1\0\0\1\0\1\venable\2\nsetup\28nvim-treesitter.configs\frequire\0", "config", "nvim-treesitter")
time([[Config for nvim-treesitter]], false)
-- Config for: lspkind-nvim
time([[Config for lspkind-nvim]], true)
try_loadstring("\27LJ\1\0024\0\0\2\0\3\0\0064\0\0\0%\1\1\0>\0\2\0027\0\2\0>\0\1\1G\0\1\0\tinit\flspkind\frequire\0", "config", "lspkind-nvim")
time([[Config for lspkind-nvim]], false)
-- Config for: nvim-lspconfig
time([[Config for nvim-lspconfig]], true)
try_loadstring('\27LJ\1\2ê\1\0\0\3\0\f\0"4\0\0\0%\1\1\0>\0\2\0027\0\2\0007\0\3\0003\1\a\0004\2\4\0007\2\5\0027\2\6\2:\2\6\1>\0\2\0014\0\0\0%\1\1\0>\0\2\0027\0\b\0007\0\3\0003\1\t\0004\2\4\0007\2\5\0027\2\6\2:\2\6\1>\0\2\0014\0\0\0%\1\1\0>\0\2\0027\0\n\0007\0\3\0003\1\v\0004\2\4\0007\2\5\0027\2\6\2:\2\6\1>\0\2\1G\0\1\0\1\0\0\bzls\1\0\0\25jedi_language_server\1\0\0\17capabilities\6g\bvim\nsetup\18rust_analyzer\14lspconfig\frequire\0', "config", "nvim-lspconfig")
time([[Config for nvim-lspconfig]], false)

-- Command lazy-loads
time([[Defining lazy-load commands]], true)
pcall(vim.cmd, [[command -nargs=* -range -bang -complete=file Goyo lua require("packer.load")({'goyo.vim'}, { cmd = "Goyo", l1 = <line1>, l2 = <line2>, bang = <q-bang>, args = <q-args> }, _G.packer_plugins)]])
pcall(vim.cmd, [[command -nargs=* -range -bang -complete=file CommentToggle lua require("packer.load")({'nvim-comment'}, { cmd = "CommentToggle", l1 = <line1>, l2 = <line2>, bang = <q-bang>, args = <q-args> }, _G.packer_plugins)]])
pcall(vim.cmd, [[command -nargs=* -range -bang -complete=file Telescope lua require("packer.load")({'telescope.nvim'}, { cmd = "Telescope", l1 = <line1>, l2 = <line2>, bang = <q-bang>, args = <q-args> }, _G.packer_plugins)]])
pcall(vim.cmd, [[command -nargs=* -range -bang -complete=file Limelight lua require("packer.load")({'limelight.vim'}, { cmd = "Limelight", l1 = <line1>, l2 = <line2>, bang = <q-bang>, args = <q-args> }, _G.packer_plugins)]])
time([[Defining lazy-load commands]], false)

vim.cmd [[augroup packer_load_aucmds]]
vim.cmd [[au!]]
  -- Event lazy-loads
time([[Defining lazy-load event autocommands]], true)
vim.cmd [[au BufRead * ++once lua require("packer.load")({'indent-blankline.nvim', 'lualine.nvim', 'nvim-compe', 'nvim-autopairs', 'nvim-bufferline.lua', 'focus.nvim', 'lsp-rooter.nvim', 'todo-comments.nvim', 'neoscroll.nvim', 'presence.nvim'}, { event = "BufRead *" }, _G.packer_plugins)]]
time([[Defining lazy-load event autocommands]], false)
vim.cmd("augroup END")
if should_profile then save_profiles() end

end)

if not no_errors then
  vim.api.nvim_command('echohl ErrorMsg | echom "Error in packer_compiled: '..error_msg..'" | echom "Please check your config for correctness" | echohl None')
end
