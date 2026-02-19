import { toggleMark } from 'prosemirror-commands'

export class BubbleMenu {
  constructor(view) {
    this._view = view

    this._el = document.createElement('div')
    this._el.className = 'jot-bubble-menu'
    this._el.style.display = 'none'
    this._el.addEventListener('mousedown', (e) => e.preventDefault())

    this._buttons = [
      { label: 'B', mark: 'strong', className: 'jot-bubble-btn-bold' },
      { label: 'I', mark: 'em', className: 'jot-bubble-btn-italic' },
      { label: '<>', mark: 'code', className: 'jot-bubble-btn-code' },
      { label: '\u{1F517}', action: 'link', className: 'jot-bubble-btn-link' },
    ]

    for (const btn of this._buttons) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = `jot-bubble-btn ${btn.className}`
      button.textContent = btn.label
      if (btn.mark) {
        button.addEventListener('click', () => this._toggleMark(btn.mark))
      } else {
        button.addEventListener('click', () => this._addLink())
      }
      btn.el = button
      this._el.appendChild(button)
    }

    document.body.appendChild(this._el)

    this._onBlur = () => this._hide()
    this._view.dom.addEventListener('blur', this._onBlur)
  }

  update(view) {
    this._view = view
    const { selection } = view.state

    if (selection.empty) {
      this._hide()
      return
    }

    this._updateActiveStates(view.state)
    this._show()
    this._position()
  }

  _hasMark(state, markName) {
    const markType = state.schema.marks[markName]
    const { from, to } = state.selection
    let found = false
    state.doc.nodesBetween(from, to, (node) => {
      if (markType.isInSet(node.marks)) found = true
    })
    return found
  }

  _updateActiveStates(state) {
    for (const btn of this._buttons) {
      const markName = btn.mark || 'link'
      const active = this._hasMark(state, markName)
      btn.el.classList.toggle('jot-bubble-btn-active', active)
    }
  }

  _toggleMark(markName) {
    const markType = this._view.state.schema.marks[markName]
    toggleMark(markType)(this._view.state, this._view.dispatch)
    this._view.focus()
  }

  _addLink() {
    const { state, dispatch } = this._view
    const markType = state.schema.marks.link

    if (this._hasMark(state, 'link')) {
      toggleMark(markType)(state, dispatch)
      this._view.focus()
      return
    }

    const href = prompt('Enter URL:')
    if (!href) {
      this._view.focus()
      return
    }

    toggleMark(markType, { href })(state, dispatch)
    this._view.focus()
  }

  _show() {
    this._el.style.display = ''
  }

  _hide() {
    this._el.style.display = 'none'
  }

  _position() {
    const { state } = this._view
    const { from, to } = state.selection
    const start = this._view.coordsAtPos(from)
    const end = this._view.coordsAtPos(to)

    const menuRect = this._el.getBoundingClientRect()
    const left = (start.left + end.right) / 2 - menuRect.width / 2
    const top = start.top - menuRect.height - 8

    this._el.style.left = `${Math.max(0, left + window.scrollX)}px`
    this._el.style.top = `${Math.max(0, top + window.scrollY)}px`
  }

  destroy() {
    this._view.dom.removeEventListener('blur', this._onBlur)
    this._el.remove()
  }
}
