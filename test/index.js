import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

let Jot

before(async () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.MutationObserver = dom.window.MutationObserver
  globalThis.HTMLElement = dom.window.HTMLElement
  globalThis.Node = dom.window.Node
  globalThis.getComputedStyle = dom.window.getComputedStyle

  // navigator is a getter-only property on globalThis, so use defineProperty
  Object.defineProperty(globalThis, 'navigator', {
    value: dom.window.navigator,
    writable: true,
    configurable: true,
  })

  ;({ Jot } = await import('../src/index.js'))
})

describe('Jot', () => {
  it('can be created', () => {
    const el = document.createElement('div')
    const editor = new Jot(el)
    assert.ok(editor)
    editor.destroy()
  })

  it('getValue() returns a markdown string', () => {
    const el = document.createElement('div')
    const editor = new Jot(el, {
      initialValue: '# Hello\n\nA paragraph.',
    })
    const md = editor.getValue()
    assert.ok(md.includes('# Hello'))
    assert.ok(md.includes('A paragraph.'))
    editor.destroy()
  })

  it('setValue() updates the content', () => {
    const el = document.createElement('div')
    const editor = new Jot(el, { initialValue: '# Old' })
    editor.setValue('# New\n\nNew content.')
    const md = editor.getValue()
    assert.ok(md.includes('# New'))
    assert.ok(md.includes('New content.'))
    assert.ok(!md.includes('Old'))
    editor.destroy()
  })

  it('onChange is called when content changes', () => {
    const el = document.createElement('div')
    const changes = []
    const editor = new Jot(el, {
      initialValue: '# Hello',
      onChange: (md) => changes.push(md),
    })

    // Simulate a document change via a transaction
    const { state } = editor._view
    const tr = state.tr.insertText('world', 1)
    editor._view.dispatch(tr)

    assert.ok(changes.length > 0)
    assert.equal(typeof changes[0], 'string')
    editor.destroy()
  })
})
