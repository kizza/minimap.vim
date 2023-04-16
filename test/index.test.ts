import assert from "assert";
import { delay, vimRunner } from "nvim-test-js";
import * as path from "path";
import buildHelpers from "./helpers"

const withVim = vimRunner({
  vimrc: path.resolve(__dirname, "vimrc.vim"),
});

describe("sanity check", () => {
  it("gives me the vim", () =>
    withVim(async nvim => {
      const result = await nvim.commandOutput('echo "It works!"');
      assert.equal(result, "It works!");
    }));

  it("loads minimap plugin", () =>
    withVim(async nvim => {
      const loaded = (await nvim.getVar("loaded_minimap")) as boolean;
      assert.equal(loaded, true);
    }));

  it("opens reads the buffer fixture", () =>
    withVim(async nvim => {
      await nvim.command('edit fixtures/buffer.txt')
      const currentBufferPath = await nvim.commandOutput(`echo expand("%")`)
      assert.equal(currentBufferPath, "fixtures/buffer.txt")
      const lines = await nvim.buffer.getLines()
      assert.equal(lines.toString(), ['aaa', 'bb', 'c'].toString())
    }));
})

describe("buffer management", () => {
  describe("single buffer", () => {
    it("opens the minimap when opening a buffer", () =>
      withVim(async nvim => {
        const { get, getMinimapText } = buildHelpers(nvim)

        // Minimap window opens when buffer does
        assert.equal(await get('winnr("$")'), "1")
        await nvim.command('edit fixtures/buffer.txt');
        assert.equal(await get('winnr("$")'), "2")

        // Current window is still the first
        assert.equal(await get('winnr()'), "1")

        // Minimap text is set
        const lines = await getMinimapText()
        assert.equal(lines, '⠿⠿⠿⠛⠛⠛⠋⠉⠉⠉')
      }));

    it("closes the minimap when closing the buffer", () =>
      withVim(async nvim => {
        const { get } = buildHelpers(nvim)

        await nvim.command('edit fixtures/buffer.txt');
        assert.equal(await get('winnr("$")'), "2")

        await nvim.command('bdelete')
        assert.equal(await get('winnr("$")'), "1")
      }));
  });
});
