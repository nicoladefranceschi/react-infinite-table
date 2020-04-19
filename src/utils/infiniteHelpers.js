import ConstantInfiniteComputer from '../computers/constantInfiniteComputer.js'
import ArrayInfiniteComputer from '../computers/arrayInfiniteComputer.js'

export function createInfiniteComputer (rowCount, rowHeight) {
  var computer
  if (typeof rowHeight === 'function') {
    throw new Error('not implemented yet')
    computer = new ArrayInfiniteComputer(rowCount, rowHeight)
  } else {
    computer = new ConstantInfiniteComputer(rowCount, rowHeight)
  }
  return computer
}

// Given the scrollTop of the container, computes the state the
// component should be in. The goal is to abstract all of this
// from any actual representation in the DOM.
// The window is the block with any overscanSize
// added to it.
export function recomputeApertureStateFromOptionsAndScrollTop (
  overscanSize,
  infiniteComputer,
  scrollTop,
  height
) {
  var blockStartNumber = overscanSize === 0 ? 0 : Math.floor(scrollTop / overscanSize)
  var blockEndNumber = overscanSize === 0 ? 0 : Math.ceil((scrollTop + height) / overscanSize)
  var blockStart = overscanSize * blockStartNumber
  var blockEnd = overscanSize * blockEndNumber

  var totalHeight = infiniteComputer.getTotalScrollableHeight()
  var apertureTop = Math.max(0, blockStart - overscanSize)
  var apertureBottom = Math.min(totalHeight, blockEnd + overscanSize)

  return {
    displayIndexStart: infiniteComputer.getDisplayIndexStart(apertureTop),
    displayIndexEnd: infiniteComputer.getDisplayIndexEnd(apertureBottom)
  }
}
