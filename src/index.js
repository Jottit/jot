import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown'
import { keymap } from 'prosemirror-keymap'
import { history, undo, redo } from 'prosemirror-history'
import { baseKeymap, toggleMark } from 'prosemirror-commands'
import { schema } from './schema.js'

export { schema } from './schema.js'

export class Jot {
  constructor(element, options = {}) {
    const { initialValue = '', onChange, ui } = options

    this._onChange = onChange
    this._bubbleMenu = null

    this._view = new EditorView(element, {
      state: EditorState.create({
        doc: defaultMarkdownParser.parse(initialValue),
        plugins: [
          history(),
          keymap({
            'Mod-z': undo,
            'Mod-y': redo,
            'Mod-Shift-z': redo,
            'Mod-b': toggleMark(schema.marks.strong),
            'Mod-i': toggleMark(schema.marks.em),
          }),
          keymap(baseKeymap),
        ],
      }),
      dispatchTransaction: (tr) => {
        const newState = this._view.state.apply(tr)
        this._view.updateState(newState)
        if (tr.docChanged && this._onChange) {
          this._onChange(this.getValue())
        }
        if (this._bubbleMenu) {
          this._bubbleMenu.update(this._view)
        }
      },
    })

    if (ui?.bubbleMenu) {
      import('./ui/bubble-menu.js').then(({ BubbleMenu }) => {
        this._bubbleMenu = new BubbleMenu(this._view)
      })
    }
  }

  getValue() {
    return defaultMarkdownSerializer.serialize(this._view.state.doc)
  }

  setValue(markdown) {
    const doc = defaultMarkdownParser.parse(markdown)
    const state = EditorState.create({
      doc,
      plugins: this._view.state.plugins,
    })
    this._view.updateState(state)
  }

  destroy() {
    if (this._bubbleMenu) {
      this._bubbleMenu.destroy()
    }
    this._view.destroy()
  }
}
