function! minimap#live#update() abort
    " Live updates only if minimap open and for valid buffers
    if bufwinnr('-MINIMAP-') == -1 || g:minimap_mapped_buffer != bufnr("%")
        return
    endif

    if exists('s:debounce_live_update_timer')
        call timer_stop(s:debounce_live_update_timer)
    endif

    let source_buffer = bufnr("%")
    let s:debounce_live_update_timer = timer_start(
        \ g:minimap_live_update_debounce,
        \ {-> s:debounced_callback(source_buffer)},
        \ {'repeat': 0}
        \ )
endfunction

function! s:debounced_callback(source_buffer) abort
    " Ensure the current buffer is still for this callback
    if bufnr("%") != a:source_buffer
        return
    endif

    " If a threshold is met we will rescan the buffer
    if s:rescan_required()
        execute("MinimapRescan")
    else
        execute("MinimapUpdateHighlight")
    endif
endfunction

function! s:rescan_required() abort
    if !exists('s:minimap_live_last_line_count')
      return s:rescan()
    endif

    let l:lines_changed = abs(s:minimap_live_last_line_count - line("$"))
    let l:percentage = abs(l:lines_changed * 1.0 / s:minimap_live_last_line_count) * 100
    if l:percentage > 10
      return s:rescan()
    endif

    return v:false
endfunction

function! s:rescan() abort
    let s:minimap_live_last_line_count = line("$")
    return v:true
endfunction
