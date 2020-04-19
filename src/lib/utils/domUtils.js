// from https://github.com/STRML/react-draggable/blob/f1012831898bdcacbf3494b1e98bf0eea97c7dbc/lib/utils/domFns.js

export function offsetXYFromParent (event, offsetParent, scale = 1) {
  const isBody = offsetParent === offsetParent.ownerDocument.body
  const offsetParentRect = isBody ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect()

  const x = (event.clientX + offsetParent.scrollLeft - offsetParentRect.left) / scale
  const y = (event.clientY + offsetParent.scrollTop - offsetParentRect.top) / scale

  return { x, y }
}

export function addEvent (el, event, handler, inputOptions) {
  if (!el) return
  const options = { capture: true, ...inputOptions }
  if (el.addEventListener) {
    el.addEventListener(event, handler, options)
  } else if (el.attachEvent) {
    el.attachEvent('on' + event, handler)
  } else {
    // $FlowIgnore: Doesn't think elements are indexable
    el['on' + event] = handler
  }
}

export function removeEvent (el, event, handler, inputOptions) {
  if (!el) return
  const options = { capture: true, ...inputOptions }
  if (el.removeEventListener) {
    el.removeEventListener(event, handler, options)
  } else if (el.detachEvent) {
    el.detachEvent('on' + event, handler)
  } else {
    // $FlowIgnore: Doesn't think elements are indexable
    el['on' + event] = null
  }
}
