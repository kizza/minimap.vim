import assert from "assert";
import { NeovimClient, delay, setBuffer, vimRunner } from "nvim-test-js";
import * as path from "path";
import buildHelpers from "./helpers"

const withVim = vimRunner({
  vimrc: path.resolve(__dirname, "vimrc.vim"),
});

describe("git parsing", () => {
  const parseDiff = (line: string) => {
    return JSON.parse(line.replace(/'/g, '"'))
  }

  it("works with multiline diffs", () =>
    withVim(async nvim => {
      const { get } = buildHelpers(nvim)
      // Multiline Changes
      let gitLine = '@@ -97,97 +97,97 @@'
      let expectedDictionary = { 'start': 33, 'end': 65, 'color': await nvim.getVar("minimap_diff_color") }
      let result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 201, 67)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)

      // " Multiline Deletions
      gitLine = '@@ -97,97 +97,0 @@'
      expectedDictionary = { 'start': 33, 'end': 33, 'color': await nvim.getVar("minimap_diffremove_color") }
      result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 201, 67)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)

      // " Multiline Additions
      gitLine = '@@ -97,0 +97,97 @@'
      expectedDictionary = { 'start': 33, 'end': 65, 'color': await nvim.getVar("minimap_diffadd_color") }
      result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 201, 67)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)
    }));

  it("works with short files", () =>
    withVim(async nvim => {
      const { get } = buildHelpers(nvim)
      // Multiline Changes
      let gitLine = '@@ -0 +0 @@'
      let expectedDictionary = { 'start': 0, 'end': 1, 'color': await nvim.getVar("minimap_diff_color") }
      let result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 1, 1)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)

      // Multiline Deletions
      gitLine = '@@ -1 +0,0 @@'
      expectedDictionary = { 'start': 0, 'end': 0, 'color': await nvim.getVar("minimap_diffremove_color") }
      result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 1, 1)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)

      // Multiline Additions
      gitLine = '@@ -0,0 +0 @@'
      expectedDictionary = { 'start': 0, 'end': 1, 'color': await nvim.getVar("minimap_diffadd_color") }
      result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 1, 1)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)
    }));

  it("works with long files", () =>
    withVim(async nvim => {
      const { get } = buildHelpers(nvim)

      // Very long file, change at beginning
      let gitLine = '@@ -0 +0 @@'
      let expectedDictionary = { 'start': 1, 'end': 1, 'color': await nvim.getVar("minimap_diff_color") }
      let result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 10000, 97)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)

      // Very long file, delete at beginning
      gitLine = '@@ -0 +0,0 @@'
      expectedDictionary = { 'start': 1, 'end': 1, 'color': await nvim.getVar("minimap_diffremove_color") }
      result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 10000, 97)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)

      // Very long file, add at beginning
      gitLine = '@@ -0,0 +0 @@'
      expectedDictionary = { 'start': 1, 'end': 1, 'color': await nvim.getVar("minimap_diffadd_color") }
      result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 10000, 97)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)

      // Very long file, change at middle
      gitLine = '@@ -5000 +5000 @@'
      expectedDictionary = { 'start': 49, 'end': 49, 'color': await nvim.getVar("minimap_diff_color") }
      result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 10000, 97)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)

      // Very long file, delete at middle
      gitLine = '@@ -5000 +5000,0 @@'
      expectedDictionary = { 'start': 49, 'end': 49, 'color': await nvim.getVar("minimap_diffremove_color") }
      result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 10000, 97)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)

      // Very long file, add at middle
      gitLine = '@@ -5000,0 +5000 @@'
      expectedDictionary = { 'start': 49, 'end': 49, 'color': await nvim.getVar("minimap_diffadd_color") }
      result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 10000, 97)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)

      // Very long file, change at end
      gitLine = '@@ -10000 +10000 @@'
      expectedDictionary = { 'start': 97, 'end': 98, 'color': await nvim.getVar("minimap_diff_color") }
      result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 10000, 97)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)

      // Very long file, remove at end
      gitLine = '@@ -10000 +10000,0 @@'
      expectedDictionary = { 'start': 97, 'end': 97, 'color': await nvim.getVar("minimap_diffremove_color") }
      result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 10000, 97)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)

      // Very long file, add at end
      gitLine = '@@ -10000,0 +10000 @@'
      expectedDictionary = { 'start': 97, 'end': 98, 'color': await nvim.getVar("minimap_diffadd_color") }
      result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 10000, 97)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)
    }));

  it("spans mm lines", () =>
    withVim(async nvim => {
      const { get } = buildHelpers(nvim)

      // Do two lines, one line apart, but spanning a minimap line increment. We
      // should get 2 minimap lines in this case.
      let gitLine = '@@ -51,2 51,2 @@'
      let expectedDictionary = { 'start': 5, 'end': 6, 'color': await nvim.getVar("minimap_diff_color") }
      let result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 1000, 97)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)

      gitLine = '@@ -51,0 +51,2 @@'
      expectedDictionary = { 'start': 5, 'end': 6, 'color': await nvim.getVar("minimap_diffadd_color") }
      result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 1000, 97)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)

      // Removals are always one line, since the content of the file is altered.
      gitLine = '@@ -51,2 +51,0 @@'
      expectedDictionary = { 'start': 5, 'end': 5, 'color': await nvim.getVar("minimap_diffremove_color") }
      result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 1000, 97)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)
    }))

  it("ignores extras in string", () =>
    withVim(async nvim => {
      const { get } = buildHelpers(nvim)

      // Test that what goes after the @@ does not need to be formattted
      let gitLine = '@@ -533,74 +533,6 @@ It should not matter, @@ what goes after the @@'
      let expectedDictionary = { 'start': 52, 'end': 53, 'color': await nvim.getVar("minimap_diff_color") }
      let result = await get(`minimap#vim#MinimapParseGitDiffLine("${gitLine}", 1000, 97)`)
      assert.deepEqual(parseDiff(result), expectedDictionary)
    }))
})
