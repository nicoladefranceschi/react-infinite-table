var ConstantInfiniteComputer = require('../computers/constantInfiniteComputer.js');
var ArrayInfiniteComputer = require('../computers/arrayInfiniteComputer.js');

function createInfiniteComputer(rowCount, rowHeight) {
  var computer;
  if (typeof rowHeight === 'function') {
    throw new Error('not implemented yet')
    computer = new ArrayInfiniteComputer(rowCount, rowHeight);
  } else {
    computer = new ConstantInfiniteComputer(rowCount, rowHeight);
  }
  return computer;
}

// Given the scrollTop of the container, computes the state the
// component should be in. The goal is to abstract all of this
// from any actual representation in the DOM.
// The window is the block with any overscanSize
// added to it.
function recomputeApertureStateFromOptionsAndScrollTop(
  overscanSize,
  infiniteComputer,
  scrollTop
) {
  var blockNumber = overscanSize === 0 ? 0 : Math.floor(scrollTop / overscanSize),
    blockStart = overscanSize * blockNumber,
    blockEnd = blockStart + overscanSize,
    apertureTop = Math.max(0, blockStart - overscanSize),
    apertureBottom = Math.min(
      infiniteComputer.getTotalScrollableHeight(),
      blockEnd + overscanSize
    );

  return {
    displayIndexStart: infiniteComputer.getDisplayIndexStart(apertureTop),
    displayIndexEnd: infiniteComputer.getDisplayIndexEnd(apertureBottom)
  };
}

function buildHeightStyle(height) {
  return {
    width: '100%',
    height: Math.ceil(height)
  };
}

module.exports = {
  createInfiniteComputer,
  recomputeApertureStateFromOptionsAndScrollTop,
  buildHeightStyle
};
