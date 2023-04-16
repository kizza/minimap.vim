import assert from "assert";
import { delay, setBuffer, vimRunner } from "nvim-test-js";
import * as path from "path";
import buildHelpers from "./helpers"

const withVim = vimRunner({
  vimrc: path.resolve(__dirname, "vimrc.vim"),
});

describe("live updates", () => {
  it("updates the minimap when changed", () =>
    withVim(async nvim => {
      const { getMinimapText } = buildHelpers(nvim)

      await nvim.command('edit fixtures/buffer.txt');
      assert.equal(await getMinimapText(), '⠿⠿⠿⠛⠛⠛⠋⠉⠉⠉')

      await setBuffer(nvim, ['aaa', 'bbb', 'ccc'])
      await delay(10)
      assert.equal(await getMinimapText(), '⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿')
    }));
})
