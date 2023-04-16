import { NeovimClient, getBuffer } from "nvim-test-js";

interface Match {
  group: string
  id: number
  priority: number
  pos1: number[]
}

export default (nvim: NeovimClient) => {

  const get = (execute: string) => nvim.commandOutput(`echo ${execute}`)

  const call = (fun: string) => nvim.command(`call ${fun}`)

  const bufferCount = () => get('len(getbufinfo({"buflisted":1}))')

  const gotoWindow = (windowNumber: string) => call(`win_gotoid(win_getid(${windowNumber}))`)

  const getMinimapWindow = () => get('bufwinnr("-MINIMAP-")')

  const withWindow = async <T>(windowNumber: string, fun: () => T) => {
    const currentWindow = await get('winnr()')
    await gotoWindow(windowNumber)
    const result = await fun()
    await gotoWindow(currentWindow)
    return result
  }

  const withinMinimap = async <T>(fun: () => T) =>
    withWindow(await getMinimapWindow(), fun)

  const getMinimapText = () => withinMinimap(() => getBuffer(nvim))

  const getMinimapMatches = () => withinMinimap(
    () => nvim.call('getmatches') as Promise<Match[]>
  )

  return {
    call,
    bufferCount,
    get,
    getMinimapMatches,
    getMinimapText,
    gotoWindow,
  }
}
