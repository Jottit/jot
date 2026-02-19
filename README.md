# jot

A headless ProseMirror editor that stores markdown. Built for [Jottit](https://jottit.pub) but designed to be reusable by any project.

## Install

```bash
npm install @jottit/jot
```

## Usage

```js
import { Jot } from '@jottit/jot'

const editor = new Jot(document.getElementById('editor'), {
  initialValue: '# Hello\n\nStart writing...',
  onChange: (markdown) => console.log(markdown)
})

editor.getValue()        // returns current content as markdown string
editor.setValue('# Hi')  // sets content from markdown string
editor.destroy()         // removes editor and cleans up
```

### Bubble menu (opt-in)

An optional floating toolbar that appears when the user selects text. Supports bold, italic, links, headings, and blockquotes.

```js
import '@jottit/jot/dist/jot.css'

const editor = new Jot(document.getElementById('editor'), {
  initialValue: '# Hello',
  onChange: (markdown) => console.log(markdown),
  ui: {
    bubbleMenu: true
  }
})
```

## Supported markdown

**Nodes:** paragraphs, headings (h1--h6), blockquotes, code blocks, bullet lists, ordered lists, list items, images, hard breaks

**Marks:** bold, italic, inline code, links

## API

| Method | Description |
|---|---|
| `new Jot(element, options)` | Create an editor instance |
| `editor.getValue()` | Get content as a markdown string |
| `editor.setValue(markdown)` | Set content from a markdown string |
| `editor.destroy()` | Remove the editor and clean up |

### Options

| Option | Type | Description |
|---|---|---|
| `initialValue` | `string` | Initial markdown content (default: `''`) |
| `onChange` | `(markdown: string) => void` | Called whenever the document changes |
| `ui.bubbleMenu` | `boolean` | Show a floating toolbar on text selection |

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Mod-z` | Undo |
| `Mod-y` / `Mod-Shift-z` | Redo |
| `Mod-b` | Toggle bold |
| `Mod-i` | Toggle italic |

## License

MIT
