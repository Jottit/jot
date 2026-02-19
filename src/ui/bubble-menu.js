import { toggleMark, setBlockType, wrapIn, lift } from 'prosemirror-commands'

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
      { label: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>', action: 'link', className: 'jot-bubble-btn-link' },
      'divider',
      { label: 'H1', node: 'heading', attrs: { level: 1 }, className: 'jot-bubble-btn-h1' },
      { label: 'H2', node: 'heading', attrs: { level: 2 }, className: 'jot-bubble-btn-h2' },
      { label: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21 8 2"/><path d="M21 6H10"/><path d="M21 12H10"/><path d="M21 18H10"/></svg>', node: 'blockquote', className: 'jot-bubble-btn-blockquote' },
    ]

    for (const btn of this._buttons) {
      if (btn === 'divider') {
        const divider = document.createElement('span')
        divider.className = 'jot-bubble-divider'
        this._el.appendChild(divider)
        continue
      }

      const button = document.createElement('button')
      button.type = 'button'
      button.className = `jot-bubble-btn ${btn.className}`
      button.innerHTML = btn.label
      if (btn.mark) {
        button.addEventListener('click', () => this._toggleMark(btn.mark))
      } else if (btn.action === 'link') {
        button.addEventListener('click', () => this._addLink())
      } else if (btn.node) {
        button.addEventListener('click', () => this._toggleBlock(btn.node, btn.attrs))
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

  _hasBlock(state, nodeName, attrs) {
    const { from, to } = state.selection
    let found = false
    state.doc.nodesBetween(from, to, (node) => {
      if (node.type.name === nodeName) {
        if (!attrs || Object.keys(attrs).every((k) => node.attrs[k] === attrs[k])) {
          found = true
        }
      }
    })
    return found
  }

  _updateActiveStates(state) {
    for (const btn of this._buttons) {
      if (btn === 'divider') continue
      let active
      if (btn.mark) {
        active = this._hasMark(state, btn.mark)
      } else if (btn.action === 'link') {
        active = this._hasMark(state, 'link')
      } else if (btn.node) {
        active = this._hasBlock(state, btn.node, btn.attrs)
      }
      btn.el.classList.toggle('jot-bubble-btn-active', active)
    }
  }

  _toggleMark(markName) {
    const markType = this._view.state.schema.marks[markName]
    toggleMark(markType)(this._view.state, this._view.dispatch)
    this._view.focus()
  }

  _toggleBlock(nodeName, attrs) {
    const { state, dispatch } = this._view
    const nodeType = state.schema.nodes[nodeName]

    if (nodeName === 'blockquote') {
      if (this._hasBlock(state, 'blockquote')) {
        lift(state, dispatch)
      } else {
        wrapIn(nodeType)(state, dispatch)
      }
      this._view.focus()
      return
    }

    // For headings: toggle back to paragraph if already active
    if (this._hasBlock(state, nodeName, attrs)) {
      setBlockType(state.schema.nodes.paragraph)(state, dispatch)
    } else {
      setBlockType(nodeType, attrs)(state, dispatch)
    }
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
