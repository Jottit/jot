# jot

A headless ProseMirror editor that stores markdown. Built for [Jottit](https://jottit.pub) but designed to be reusable by any project.

## Project structure

```
jot/
  src/
    index.js    # Jot class — public API
    schema.js   # ProseMirror schema
  test/
    index.js    # node --test
  package.json
  README.md
```

## Commands

```bash
npm test        # run tests with node --test
```
Commits: one-line messages only, no co-authored-by trailers

## Architecture

The editor is three layers:

1. **Schema** (`src/schema.js`) — A ProseMirror schema constrained to only what markdown can represent. No colors, no arbitrary spans. Invalid state is impossible by construction.

2. **Serialization** — Uses `prosemirror-markdown` (`defaultMarkdownParser` and `defaultMarkdownSerializer`) to convert between markdown strings and ProseMirror documents.

3. **Jot class** (`src/index.js`) — Wraps ProseMirror's `EditorState` and `EditorView`. Exposes a simple API: constructor, `getValue()`, `setValue()`, `destroy()`, and an `onChange` callback.

## Key decisions

- **Headless** — no UI, no toolbar, no styles. The consuming project owns all visual design.
- **Markdown as source of truth** — not HTML, not JSON. What goes in comes out as clean markdown.
- **ESM only** — `type: module` in package.json.
- **No bundler** — keep it simple for now.
- **MIT license** — permissive so anyone can use it, including AGPL projects like Jottit.

## Dependencies

All ProseMirror packages are MIT licensed by Marijn Haverbeke:

- `prosemirror-state`
- `prosemirror-view`
- `prosemirror-model`
- `prosemirror-markdown`
- `prosemirror-keymap`
- `prosemirror-history`
- `prosemirror-commands`

## Supported markdown elements

Nodes: paragraphs, headings (h1–h6), blockquotes, code blocks, bullet lists, ordered lists, list items, images, hard breaks, text.

Marks: strong, em, code, links.

## API

```js
import { Jot } from 'jot'

const editor = new Jot(element, {
  initialValue: '# Hello\n\nStart writing...',
  onChange: (markdown) => console.log(markdown)
})

editor.getValue()         // returns current content as markdown string
editor.setValue('# Hi')  // sets content from markdown string
editor.destroy()          // removes editor and cleans up
```

## Relationship to Jottit

Jottit (`github.com/Jottit/jottit`) is the reference implementation and primary consumer. Jottit's UI needs drive jot's roadmap. jot is published independently so other projects can use it.
