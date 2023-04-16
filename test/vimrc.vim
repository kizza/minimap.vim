" Sensible defaults for tests
set nocompatible
set nobackup
set nowb
set noswapfile

" Include out plugin (ie. this project)
let s:plugin = expand('<sfile>:h:h')
let g:minimap_vimrc_loaded = 1
let g:minimap_live_updates = 1
let g:minimap_live_update_debounce = 10
let g:minimap_auto_start = 1
let g:minimap_git_colors = 1
let g:minimap_git_strategy = "gitgutter"
execute 'set runtimepath+='.s:plugin

" CD to test directory
execute 'cd '.s:plugin.'/test'

" Include gitgutter plugin (and use realtime)
let g:gitgutter_realtime = 1
execute 'set runtimepath+='.s:plugin.'/node_modules/vim-gitgutter'
