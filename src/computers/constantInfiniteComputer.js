var InfiniteComputer = require('./infiniteComputer.js')

class ConstantInfiniteComputer extends InfiniteComputer {
  constructor (rowCount, rowHeight) {
    super()
    this.rowCount = rowCount
    this.rowHeight = rowHeight
  }

  getTotalScrollableHeight () {
    return this.rowHeight * this.rowCount
  }

  getDisplayIndexStart (windowTop) {
    return Math.floor(windowTop / this.rowHeight)
  }

  getDisplayIndexEnd (windowBottom) {
    var nonZeroIndex = Math.ceil(windowBottom / this.rowHeight)
    if (nonZeroIndex > 0) {
      return nonZeroIndex - 1
    }
    return nonZeroIndex
  }

  getTopSpacerHeight (displayIndexStart) {
    return displayIndexStart * this.rowHeight
  }

  getBottomSpacerHeight (displayIndexEnd) {
    var nonZeroIndex = displayIndexEnd + 1
    return Math.max(
      0,
      (this.rowCount - nonZeroIndex) * this.rowHeight
    )
  }
}

module.exports = ConstantInfiniteComputer
