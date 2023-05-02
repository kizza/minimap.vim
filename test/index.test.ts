import assert from "assert";
import { NeovimClient, delay, vimRunner } from "nvim-test-js";
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

    // it("quites when the last buffer is quit", () =>
    //   withVim(async nvim => {
    //     const { get } = buildHelpers(nvim)

    //     await nvim.command('edit fixtures/buffer.txt');
    //     assert.equal(await get('winnr("$")'), "2")

    //     await nvim.command('q')
    //     // assert.equal(await get('winnr("$")'), "0")
    //   }));
  });


  xdescribe("amongst other floating windows", () => {
    const openFloat = (nvim: NeovimClient) =>
      nvim.commandOutput(
        "call nvim_open_win(nvim_create_buf(v:false, v:true), 1, {'relative':'editor','row':10,'col':10,'width':80,'height':10})",
      )

    it("returns to the previous buffer", () =>
      withVim(async nvim => {
        const { get, getMinimapText } = buildHelpers(nvim)
        assert.equal(await get('winnr("$")'), "1")
        const foo = await openFloat(nvim)
        console.log(foo)
        assert.equal(await get('winnr("$")'), "2")

        await nvim.command('edit fixtures/buffer.txt');
        assert.equal(await get('expand("%")'), 'fixtures/buffer.txt')
        assert.equal(await getMinimapText(), '⠿⠿⠿⠛⠛⠛⠋⠉⠉⠉')


        const test = await get("tabpagewinnr(tabpagenr(), '$')")
        console.log(test)
      }))
  })

  describe("multiple buffers", () => {
    it("returns to the previous buffer", () =>
      withVim(async nvim => {
        const { bufferCount, getMinimapText } = buildHelpers(nvim)

        await nvim.command('edit fixtures/buffer.txt');
        assert.equal(await getMinimapText(), '⠿⠿⠿⠛⠛⠛⠋⠉⠉⠉')
        assert.equal(await bufferCount(), 1)

        await nvim.command('edit fixtures/buffer_two.txt');
        assert.equal(await getMinimapText(), '⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿')
        assert.equal(await bufferCount(), 2)

        await nvim.command('bdelete')
        assert.equal(await getMinimapText(), '⠿⠿⠿⠛⠛⠛⠋⠉⠉⠉')
        assert.equal(await bufferCount(), 1)
      }));
  });
});
