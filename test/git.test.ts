import assert from "assert";
import { NeovimClient, delay, setBuffer, vimRunner } from "nvim-test-js";
import * as path from "path";
import buildHelpers from "./helpers"

const withVim = vimRunner({
  vimrc: path.resolve(__dirname, "vimrc.vim"),
});

const getFilteredMatches = async (nvim: NeovimClient, group: string) => {
  const { getMinimapMatches } = buildHelpers(nvim)
  const minimapMatches = await getMinimapMatches()
  return minimapMatches.filter(match => match.group == group)
}

const gitDiffDelay = 10

describe("git diffs", () => {
  it("shows line changes", () =>
    withVim(async nvim => {
      const { getMinimapText } = buildHelpers(nvim)

      await nvim.command('edit fixtures/buffer.txt');
      assert.equal(await getMinimapText(), '⠿⠿⠿⠛⠛⠛⠋⠉⠉⠉')

      await setBuffer(nvim, ['', 'bbb', 'ccc'])
      await delay(gitDiffDelay)
      assert.equal(await getMinimapText(), '⠶⠶⠶⠶⠶⠶⠶⠶⠶⠶')

      const matches = await getFilteredMatches(nvim, "minimapCursorDiffLine")
      assert.equal(matches[0].pos1.toString(), "1")
    }));

  it("shows additions", () =>
    withVim(async nvim => {
      const { getMinimapText } = buildHelpers(nvim)

      await nvim.command('edit fixtures/buffer.txt');
      assert.equal(await getMinimapText(), '⠿⠿⠿⠛⠛⠛⠋⠉⠉⠉')

      await setBuffer(nvim, ['aaa', 'bb', 'c', 'dddd'])
      await delay(gitDiffDelay)
      assert.equal(await getMinimapText(), '⣿⣿⣟⣛⣛⣉⣉⣁⣀⣀')

      const matches = await getFilteredMatches(nvim, "minimapCursorDiffAdded")
      assert.equal(matches[0].pos1.toString(), "1")
    }));

  it("shows removals", () =>
    withVim(async nvim => {
      const { getMinimapText } = buildHelpers(nvim)

      await nvim.command('edit fixtures/buffer.txt');
      assert.equal(await getMinimapText(), '⠿⠿⠿⠛⠛⠛⠋⠉⠉⠉')

      await setBuffer(nvim, ['bb', 'c'])
      await delay(gitDiffDelay)
      assert.equal(await getMinimapText(), '⠛⠛⠛⠛⠛⠉⠉⠉⠉⠉')

      const matches = await getFilteredMatches(nvim, "minimapCursorDiffRemoved")
      assert.equal(matches[0].pos1.toString(), "1")
    }));
})
