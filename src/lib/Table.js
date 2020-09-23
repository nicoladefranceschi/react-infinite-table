import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import * as infiniteHelpers from './utils/infiniteHelpers'
import checkProps from './utils/checkProps'
import Cell from './Cell'
import { offsetXYFromParent, addEvent, removeEvent } from './utils/domUtils'

let _nextTableId = 1
let _nextTableRowKey = 1

function generateRowKey () {
  return _nextTableRowKey++
}

export default class Table extends React.Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired,
    overscanSize: PropTypes.number,
    rows: PropTypes.array.isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape({
      width: PropTypes.number.isRequired,
      cellRenderer: PropTypes.func.isRequired,
      headerRenderer: PropTypes.func,
      footerRenderer: PropTypes.func
    })).isRequired,
    headerCount: PropTypes.number,
    footerCount: PropTypes.number,
    fixedColumnsCount: PropTypes.number,
    fillTableWidth: PropTypes.bool.isRequired,

    noRowsRenderer: PropTypes.func,

    rowIdKey: PropTypes.string,
    selectedRows: PropTypes.object,
    canSelectMultipleRows: PropTypes.bool,
    onSelectionChange: PropTypes.func,

    infiniteLoadBeginEdgeOffset: PropTypes.number,
    isInfiniteLoading: PropTypes.bool,
    onInfiniteLoad: PropTypes.func,
    getLoadingSpinner: PropTypes.func,

    displayBottomUpwards: PropTypes.bool.isRequired,

    className: PropTypes.string,
    tableClassName: PropTypes.string,
    style: PropTypes.object,
    fixBorders: PropTypes.bool,

    onColumnWidthChange: PropTypes.func,
    onColumnOrderChange: PropTypes.func
  };

  static defaultProps = {
    overscanSize: 500,

    headerCount: 1,
    footerCount: 0,
    fixedColumnsCount: 0,
    fillTableWidth: false,

    canSelectMultipleRows: false,

    infiniteLoadBeginEdgeOffset: undefined,
    onInfiniteLoad: () => {},
    getLoadingSpinner: () => <div />,

    displayBottomUpwards: false
  };

  constructor (props) {
    super(props)

    this._id = 'react-infinite-table-' + _nextTableId++

    this.shouldAttachToBottom = props.displayBottomUpwards

    this.state = this.recomputeInternalStateFromProps(props)
  }

  shouldAttachToBottom = false;
  preservedScrollState = 0;
  loadingSpinnerHeight = 0;
  lastSelectedRowIndex = -1

  // Refs
  scrollable = null;
  topSpacer = null;
  bottomSpacer = null;
  smoothScrollingWrapper = null;
  loadingSpinner = null;

  getLoadingSpinnerHeight = () => {
    var loadingSpinnerHeight = 0
    if (this.loadingSpinner) {
      loadingSpinnerHeight = this.loadingSpinner.offsetHeight || 0
    }
    return loadingSpinnerHeight
  }

  getScrollTop = () => {
    return this.scrollable ? this.scrollable.scrollTop : 0
  }

  setScrollTop = top => {
    if (this.scrollable) {
      this.scrollable.scrollTop = top
    }
  }

  scrollShouldBeIgnored = event => event.target !== this.scrollable;

  buildScrollableStyle = () => {
    return {
      height: this.props.height
    }
  };

  recomputeInternalStateFromProps = (
    props
  ) => {
    checkProps(props)

    // TODO: don't recreate if not needed!
    const infiniteComputer = infiniteHelpers.createInfiniteComputer(
      props.rows.length,
      props.rowHeight
    )

    var newState = {
      infiniteComputer,
      ...infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
        props.overscanSize,
        infiniteComputer,
        this.getScrollTop(),
        props.height
      )
    }

    return newState
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps (nextProps) {
    var newState = this.recomputeInternalStateFromProps(nextProps)

    if (this.props.displayBottomUpwards !== nextProps.displayBottomUpwards) {
      this.shouldAttachToBottom = nextProps.displayBottomUpwards
    }

    this.setState(newState)
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillUpdate () {
    if (this.props.displayBottomUpwards) {
      this.preservedScrollState = this.getScrollTop() - this.loadingSpinnerHeight
    }
  }

  componentDidUpdate (
    prevProps,
    prevState
  ) {
    this.loadingSpinnerHeight = this.getLoadingSpinnerHeight()

    if (this.props.displayBottomUpwards) {
      var lowestScrollTop = this.getLowestPossibleScrollTop()
      if (
        this.shouldAttachToBottom &&
        this.getScrollTop() < lowestScrollTop
      ) {
        this.setScrollTop(lowestScrollTop)
      } else if (prevProps.isInfiniteLoading && !this.props.isInfiniteLoading) {
        this.setScrollTop(
          this.state.infiniteComputer.getTotalScrollableHeight() -
            prevState.infiniteComputer.getTotalScrollableHeight() +
            this.preservedScrollState
        )
      }
    }

    const rowsChanged = this.props.rows !== prevProps.rows

    if (rowsChanged) {
      this.lastSelectedRowIndex = -1
    }

    const isMissingVisibleRows =
      rowsChanged &&
      !this.hasAllVisibleItems() &&
      !this.props.isInfiniteLoading
    if (isMissingVisibleRows) {
      this.onInfiniteLoad()
    }
  }

  componentDidMount () {
    if (!this.hasAllVisibleItems()) {
      this.onInfiniteLoad()
    }

    if (this.props.displayBottomUpwards) {
      var lowestScrollTop = this.getLowestPossibleScrollTop()
      if (
        this.shouldAttachToBottom &&
        this.getScrollTop() < lowestScrollTop
      ) {
        this.setScrollTop(lowestScrollTop)
      }
    }
  }

  componentWillUnmount () {
    removeEvent(document, 'mousemove', this._onHeaderMouseMove)
    removeEvent(document, 'mouseup', this._onHeaderMouseUp)
  }

  getLowestPossibleScrollTop = () => {
    return this.state.infiniteComputer.getTotalScrollableHeight() - this.props.height
  }

  hasAllVisibleItems = () => {
    return !(
      this.props.infiniteLoadBeginEdgeOffset === 'number' &&
      this.state.infiniteComputer.getTotalScrollableHeight() < this.props.height
    )
  }

  passedEdgeForInfiniteScroll = (scrollTop) => {
    const edgeOffset = this.props.infiniteLoadBeginEdgeOffset
    if (typeof edgeOffset !== 'number') {
      return false
    }

    if (this.props.displayBottomUpwards) {
      return !this.shouldAttachToBottom && scrollTop < edgeOffset
    } else {
      return (
        scrollTop > this.state.infiniteComputer.getTotalScrollableHeight() - this.props.height - edgeOffset
      )
    }
  }

  onInfiniteLoad = () => {
    this.props.onInfiniteLoad()
  }

  handleScroll = (e) => {
    if (this.scrollShouldBeIgnored(e)) {
      return
    }

    const scrollTop = this.getScrollTop()

    this.shouldAttachToBottom =
      this.props.displayBottomUpwards &&
      scrollTop >= this.getLowestPossibleScrollTop()

    var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
      this.props.overscanSize,
      this.state.infiniteComputer,
      scrollTop,
      this.props.height
    )

    this.updateNewApertureStateIfNeeded(newApertureState)

    if (
      this.passedEdgeForInfiniteScroll(scrollTop) &&
      !this.props.isInfiniteLoading
    ) {
      this.onInfiniteLoad()
    }
  }

  updateNewApertureStateIfNeeded (newApertureState) {
    if (
      newApertureState.displayIndexStart !== this.state.displayIndexStart ||
      newApertureState.displayIndexEnd !== this.state.displayIndexEnd
    ) {
      this.setState(newApertureState)
    }
  }

  resizeColumn (columnIndex, width, isDragging) {
    if (isDragging) {
      this._columnDrag = {
        columnIndex,
        width
      }
      this._style.innerHTML = this.getStyles()
    } else {
      delete this._columnDrag
      this.props.onColumnWidthChange(columnIndex, width)
      this._style.innerHTML = this.getStyles()
    }
  }

  reorderColumn (x, isDragging) {
    let columnOffset = 0

    const positions = this.props.columns.map((column, columnIndex) => {
      const columnWidth = this.getColumnWidth(columnIndex)
      const left = columnOffset
      columnOffset += columnWidth
      return {
        left: left,
        center: left + columnWidth / 2,
        right: left + columnWidth
      }
    })

    const fromLeft = positions[this._columnOrdering.fromIndex].left + x
    const fromRight = positions[this._columnOrdering.fromIndex].right + x

    this._columnOrdering.toIndex = this._columnOrdering.fromIndex
    for (let columnIndex = 0; columnIndex < this.props.columns.length; columnIndex++) {
      const pos = positions[columnIndex]
      if (columnIndex < this._columnOrdering.fromIndex) {
        if (pos.center > fromLeft) {
          this._columnOrdering.toIndex = columnIndex
          break
        }
      } else if (columnIndex > this._columnOrdering.fromIndex) {
        if (pos.center < fromRight) {
          this._columnOrdering.toIndex = columnIndex
        }
      }
    }

    const lastRight = positions[positions.length - 1].right
    if (fromLeft < 0) {
      x -= fromLeft
    } else if (fromRight > lastRight) {
      x -= fromRight - lastRight
    }

    this._columnOrdering.deltaX = x

    if (isDragging) {
      this._style.innerHTML = this.getStyles()
    } else {
      const { fromIndex, toIndex } = this._columnOrdering
      delete this._columnOrdering
      this.props.onColumnOrderChange(fromIndex, toIndex)
      this._style.innerHTML = this.getStyles()
    }
  }

  setSelection (rowIndex, modifier, shift) {
    if (!this.props.onSelectionChange) {
      return
    }
    const row = this.props.rows[rowIndex]
    const rowId = row[this.props.rowIdKey]
    if (typeof rowId !== 'undefined') {
      const selectedRows = this._getNewSelectedRows(rowIndex, rowId, modifier, shift)
      this.lastSelectedRowIndex = rowIndex
      this.props.onSelectionChange(selectedRows)
    } else {
      this.lastSelectedRowIndex = -1
    }
  }

  resetSelection () {
    if (!this.props.onSelectionChange) {
      return
    }
    this.lastSelectedRowIndex = -1
    this.props.onSelectionChange({})
  }

  _getNewSelectedRows (index, key, toggle, shift) {
    const currentSelected = this.props.selectedRows || {}
    const single = !this.props.canSelectMultipleRows
    const lastSelectedIndex = this.lastSelectedRowIndex
    if (lastSelectedIndex === -1) {
      shift = false
    }
    if (single) {
      if (currentSelected[key]) {
        return {}
      } else {
        return {
          [key]: true
        }
      }
    } else if (toggle) {
      const newSelected = { ...currentSelected }
      if (newSelected[key]) {
        delete newSelected[key]
      } else {
        newSelected[key] = true
      }
      return newSelected
    } else if (shift) {
      let from, to
      if (index < lastSelectedIndex) {
        from = index
        to = lastSelectedIndex
      } else {
        from = lastSelectedIndex
        to = index
      }
      const newSelected = { ...currentSelected }
      for (let i = from; i <= to; i++) {
        const row = this.props.rows[i]
        const rowId = row[this.props.rowIdKey]
        if (typeof rowId === 'undefined') {
          continue
        }
        const key = rowId
        newSelected[key] = true
      }
      return newSelected
    } else {
      return {
        [key]: true
      }
    }
  }

  getColumnWidth (columnIndex) {
    const column = this.props.columns[columnIndex]
    return this._columnDrag && this._columnDrag.columnIndex === columnIndex
      ? this._columnDrag.width
      : column.width
  }

  getStyles () {
    let columnOffset = 0

    const lefts = this.props.columns.map((column, columnIndex) => {
      const columnWidth = this.getColumnWidth(columnIndex)
      const left = columnOffset
      columnOffset += columnWidth
      return left
    })

    if (this._columnOrdering) {
      lefts[this._columnOrdering.fromIndex] = lefts[this._columnOrdering.fromIndex] + this._columnOrdering.deltaX
    }

    const styles = this.props.columns.map((column, columnIndex) => {
      const columnWidth = this.getColumnWidth(columnIndex)
      const left = lefts[columnIndex]
      let others = ''
      let otherStyle = ''

      if (this._columnOrdering) {
        if (columnIndex === this._columnOrdering.fromIndex) {
          others += 'z-index: 6;'
          others += `transform: translateX(${this._columnOrdering.deltaX}px);`

          otherStyle = `
            #${this._id} tbody .react-infinite-table-col-${columnIndex} {
              position: sticky;
              z-index: 5;
            }
          `
        } else if (columnIndex >= this._columnOrdering.toIndex && columnIndex < this._columnOrdering.fromIndex) {
          others += `transform: translateX(${this._columnOrdering.width}px);`
        } else if (columnIndex <= this._columnOrdering.toIndex && columnIndex > this._columnOrdering.fromIndex) {
          others += `transform: translateX(${-this._columnOrdering.width}px);`
        }
      }

      if (this.props.fixedColumnsCount && columnIndex < this.props.fixedColumnsCount) {
        others += `left: ${left}px;`
      }

      return `
        #${this._id} .react-infinite-table-col-${columnIndex} {
          width: ${columnWidth}px;
          min-width: ${columnWidth}px;
          max-width: ${columnWidth}px;
          ${others}
        }
        ${otherStyle}
      `
    })

    return styles.join('\n')
  }

  _onHeaderMouseDown = event => {
    if (typeof event.button === 'number' && event.button !== 0) {
      return
    }
    console.log(event.target)
    const { th, columnIndex, data, canResizeColumns, canChangeColumnsOrder } = this._findHeaderTh(event)
    console.log({ th, columnIndex, x: data && data.x, y: data && data.y, canResizeColumns, canChangeColumnsOrder })

    if (!th) {
      return
    }

    this._headerDraggingColumnIndex = columnIndex
    this._headerDraggingLastMouseEvent = { clientX: event.clientX, clientY: event.clientY }

    this._onStartDragging(columnIndex, event, data, th, canResizeColumns, canChangeColumnsOrder)

    addEvent(document, 'mousemove', this._onHeaderMouseMove)
    addEvent(document, 'mouseup', this._onHeaderMouseUp)
    addEvent(this.scrollable, 'scroll', this._onHeaderMouseScroll)
  }

  _onHeaderMouseMove = event => {
    const columnIndex = this._headerDraggingColumnIndex
    const data = offsetXYFromParent(event, this.scrollable)
    this._headerDraggingLastMouseEvent = { clientX: event.clientX, clientY: event.clientY }
    this._onDragging(columnIndex, event, data)
  }

  _onHeaderMouseScroll = event => {
    const columnIndex = this._headerDraggingColumnIndex
    const data = offsetXYFromParent(this._headerDraggingLastMouseEvent, this.scrollable)
    this._onDragging(columnIndex, null, data)
  }

  _onHeaderMouseUp = event => {
    const columnIndex = this._headerDraggingColumnIndex
    const data = offsetXYFromParent(event, this.scrollable)
    delete this._headerDraggingColumnIndex
    delete this._headerDraggingLastMouseEvent
    removeEvent(document, 'mousemove', this._onHeaderMouseMove)
    removeEvent(document, 'mouseup', this._onHeaderMouseUp)
    removeEvent(this.scrollable, 'scroll', this._onHeaderMouseScroll)
    this._onStopDragging(columnIndex, event, data)
  }

  _findHeaderTh (event) {
    let th = event.target
    if (!th || th === this._thead) {
      return {}
    }
    // find th as thead > tr > *
    while (th && th.parentElement && th.parentElement.parentElement !== this._thead) {
      th = th.parentElement
    }
    if (!th) {
      return {}
    }
    const columnIndex = Array.prototype.indexOf.call(th.parentElement.children, th)

    const data = offsetXYFromParent(event, this.scrollable)

    const canChangeColumnsOrder = typeof this.props.onColumnOrderChange === 'function'
    const canResizeColumns = typeof this.props.onColumnWidthChange === 'function'

    return { th, columnIndex, data, canChangeColumnsOrder, canResizeColumns }
  }

  _onStartDragging = (columnIndex, event, data, cellEl, canResizeColumns, canChangeColumnsOrder) => {
    this._draggingCell = cellEl
    this._initialDataX = data.x

    cellEl.classList.add('react-infinite-column-dragging')

    const isResizing = canResizeColumns && (event.nativeEvent.offsetX >= cellEl.offsetWidth - 4)
    const isOrdering = !isResizing && canChangeColumnsOrder

    const columnWidth = this.getColumnWidth(columnIndex)

    if (isResizing) {
      cellEl.classList.add('react-infinite-column-resizing')
      this._isDraggingResizer = true

      event.stopPropagation()

      this._initialColumnWidth = columnWidth
    } else if (isOrdering) {
      cellEl.classList.add('react-infinite-column-reordering')
      this._isDraggingReorder = true

      this._columnOrdering = {
        fromIndex: columnIndex,
        toIndex: columnIndex,
        width: columnWidth,
        deltaX: 0
      }
    }
  }

  _onDragging = (columnIndex, eventOrNull, data) => {
    const cellEl = this._draggingCell

    if (this._isDraggingResizer) {
      eventOrNull && eventOrNull.stopPropagation()
      const width = this._initialColumnWidth
      const minColumnWidth = 40
      this.resizeColumn(columnIndex, Math.max(width + data.x - this._initialDataX, minColumnWidth), true)
    }

    if (this._isDraggingReorder) {
      const x = data.x - this._initialDataX

      if (!this._isDraggingReorderStarted) {
        if (x < 3 && x > -3) {
          // ignoring dragging
          return
        }
        this._isDraggingReorderStarted = true
        cellEl.classList.add('react-infinite-column-reordering-started')
      }

      this.reorderColumn(x, true)
    }
  }

  _onStopDragging = (columnIndex, event, data) => {
    const cellEl = this._draggingCell
    cellEl.classList.remove('react-infinite-column-dragging')
    cellEl.classList.remove('react-infinite-column-resizing')
    cellEl.classList.remove('react-infinite-column-reordering')
    cellEl.classList.remove('react-infinite-column-reordering-started')

    if (this._isDraggingResizer) {
      event.stopPropagation()
      const width = this._initialColumnWidth
      const minColumnWidth = 40
      this.resizeColumn(columnIndex, Math.max(width + data.x - this._initialDataX, minColumnWidth), false)
    }
    if (this._isDraggingReorder) {
      if (this._isDraggingReorderStarted) {
        const x = data.x - this._initialDataX
        this.reorderColumn(x, false)
      }
    }

    delete this._draggingCell
    delete this._initialDataX
    delete this._isDraggingResizer
    delete this._isDraggingReorder
    delete this._columnDrag
    delete this._columnOrdering
    delete this._isDraggingReorderStarted
  }

  _onRowMouseDown (event, rowIndex) {
    const target = event.target
    const startX = event.clientX
    const startY = event.clientY

    const _onRowMouseUp = (e) => {
      _cleanup()

      // clear text selection
      if (window.getSelection) {
        if (window.getSelection().empty) { // Chrome
          window.getSelection().empty()
        } else if (window.getSelection().removeAllRanges) { // Firefox
          window.getSelection().removeAllRanges()
        }
      } else if (document.selection) { // IE?
        document.selection.empty()
      }

      const modifier = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      this.setSelection(rowIndex, modifier, shift)
    }

    const _onRowMouseMove = (e) => {
      const endX = e.clientX
      const endY = e.clientY
      if (Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2) < 4) {
        return
      }
      _cleanup()
    }

    function _cleanup () {
      removeEvent(target, 'mouseup', _onRowMouseUp)
      removeEvent(target, 'mousemove', _onRowMouseMove)
    }

    addEvent(target, 'mouseup', _onRowMouseUp)
    addEvent(target, 'mousemove', _onRowMouseMove)
  }

  renderRows (displayIndexStart, displayIndexEnd) {
    const rows = []
    const rowsData = this.props.rows
    const selectedRows = this.props.selectedRows || {}
    const rowIdKey = this.props.rowIdKey

    const oldRenderedRowKeys = this._renderedRowKeys || {}
    this._renderedRowKeys = {}

    // obtain the row's key:
    // - if the row was render before, use the same key
    // - otherwise, try to reuse an existing row that was removed from the visible window

    let availableKeys = {}
    const rowKeyByIndex = {}
    const exactRowKeyByIndex = {}

    for (const k in oldRenderedRowKeys) {
      const key = oldRenderedRowKeys[k]
      availableKeys[key] = true
    }

    for (let rowIndex = displayIndexStart; rowIndex <= displayIndexEnd; rowIndex++) {
      const rowData = rowsData[rowIndex]
      const rowId = rowIdKey && rowData[rowIdKey]
      const exactRowKey = '' + typeof rowId !== 'undefined' ? rowId : ('rowIndex-' + rowIndex)
      exactRowKeyByIndex[rowIndex] = exactRowKey

      const rowKey = oldRenderedRowKeys[exactRowKey]

      if (rowKey) {
        rowKeyByIndex[rowIndex] = rowKey
        delete availableKeys[rowKey]
        this._renderedRowKeys[exactRowKey] = rowKey
      }
    }

    availableKeys = Object.keys(availableKeys)
    let nextIndex = 0

    for (let rowIndex = displayIndexStart; rowIndex <= displayIndexEnd; rowIndex++) {
      if (!rowKeyByIndex[rowIndex]) {
        let rowKey
        if (nextIndex < availableKeys.length) {
          rowKey = availableKeys[nextIndex++]
        } else {
          rowKey = generateRowKey()
        }

        const exactRowKey = exactRowKeyByIndex[rowIndex]

        rowKeyByIndex[rowIndex] = rowKey
        this._renderedRowKeys[exactRowKey] = rowKey
      }
    }

    // render the rows
    for (let rowIndex = displayIndexStart; rowIndex <= displayIndexEnd; rowIndex++) {
      const rowHeight = this.props.rowHeight

      const rowData = rowsData[rowIndex]

      const rowId = rowIdKey && rowData[rowIdKey]
      const isSelected = typeof rowId !== 'undefined' && selectedRows[rowId]

      const rowKey = rowKeyByIndex[rowIndex]

      const row = (
        <tr
          key={rowKey}
          className={classNames(
            (rowIndex % 2 === 0) ? 'tr-odd' : 'tr-even',
            isSelected && 'tr-selected'
          )}
          style={{
            height: Math.ceil(rowHeight),
            minHeight: Math.ceil(rowHeight),
            maxHeight: Math.ceil(rowHeight)
          }}
          onMouseDown={e => this._onRowMouseDown(e, rowIndex)}
        >
          {this.props.columns.map((column, columnIndex) => {
            const classes = [
              'react-infinite-table-col-' + columnIndex
            ]

            if (this.props.fixedColumnsCount && columnIndex < this.props.fixedColumnsCount) {
              classes.push('is-fixed-left')
            }

            return (
              <Cell
                renderer={column.cellRenderer}
                key={columnIndex}
                columnIndex={columnIndex}
                column={column}
                rowData={rowData}
                rowIndex={rowIndex}
                className={classNames(classes)}
              />
            )
          })}
        </tr>
      )

      rows.push(row)
    }
    return rows
  }

  renderHeaderRows () {
    const rows = []
    const rowOffset = 0

    for (let rowIndex = 0; rowIndex < this.props.headerCount; rowIndex++) {
      const row = (
        <tr
          key={rowIndex}
          style={{ width: '100%', top: rowOffset }}
        >
          {this.props.columns.map((column, columnIndex) => {
            const classes = [
              'react-infinite-table-col-' + columnIndex
            ]

            if (this.props.fixedColumnsCount && columnIndex < this.props.fixedColumnsCount) {
              classes.push('is-fixed-left')
            }

            const canChangeColumnsOrder = typeof this.props.onColumnOrderChange === 'function'
            const canResizeColumns = typeof this.props.onColumnWidthChange === 'function'

            classes.push(
              canChangeColumnsOrder && 'react-infinite-column-reorder',
              canResizeColumns && 'react-infinite-column-resize'
            )

            return (
              <Cell
                renderer={column.headerRenderer}
                key={columnIndex}
                columnIndex={columnIndex}
                column={column}
                rowIndex={rowIndex}
                className={classNames(classes)}
              />
            )
          })}
        </tr>
      )

      rows.push(row)
    }
    return rows
  }

  renderFooterRows () {
    const rows = []
    for (let rowIndex = 0; rowIndex < this.props.footerCount; rowIndex++) {
      const row = (
        <tr
          key={rowIndex}
          style={{ width: '100%' }}
        >
          {this.props.columns.map((column, columnIndex) => {
            const classes = [
              'react-infinite-table-col-' + columnIndex
            ]

            if (this.props.fixedColumnsCount && columnIndex < this.props.fixedColumnsCount) {
              classes.push('is-fixed-left')
            }

            return (
              <Cell
                renderer={column.footerRenderer}
                key={columnIndex}
                columnIndex={columnIndex}
                column={column}
                rowIndex={rowIndex}
                className={classNames(classes)}
              />
            )
          })}
        </tr>
      )

      rows.push(row)
    }
    return rows
  }

  render () {
    const {
      rows,
      columns,
      height,
      noRowsRenderer,
      displayBottomUpwards,
      infiniteLoadBeginEdgeOffset,
      isInfiniteLoading,
      getLoadingSpinner,
      onColumnOrderChange,
      onColumnWidthChange,
      headerCount,
      footerCount,
      fillTableWidth,
      fixBorders,
      className,
      tableClassName,
      style
    } = this.props
    const {
      infiniteComputer,
      displayIndexStart,
      displayIndexEnd
    } = this.state

    var displayables
    if (rows.length > 0) {
      displayables = this.renderRows(
        displayIndexStart,
        displayIndexEnd
      )
    } else {
      displayables = noRowsRenderer ? (
        <tr className='react-infinite-table-loading-no-rows'>
          <td colSpan={columns.length}>
            <div>
              {noRowsRenderer()}
            </div>
          </td>
        </tr>
      ) : []
    }

    var infiniteScrollStyles = {}

    var topSpacerHeight = infiniteComputer.getTopSpacerHeight(
      displayIndexStart
    )
    var bottomSpacerHeight = infiniteComputer.getBottomSpacerHeight(
      displayIndexEnd
    )

    // This asymmetry is due to a reluctance to use CSS to control
    // the bottom alignment
    if (displayBottomUpwards) {
      var heightDifference = height - infiniteComputer.getTotalScrollableHeight()
      if (heightDifference > 0) {
        topSpacerHeight = heightDifference - this.loadingSpinnerHeight
      }
    }

    var loadingSpinner =
      infiniteLoadBeginEdgeOffset !== undefined && isInfiniteLoading
        ? (
          <tr ref={c => { this.loadingSpinner = c }} className='react-infinite-table-loading-row'>
            <td colSpan={columns.length}>
              {getLoadingSpinner()}
            </td>
          </tr>
        )
        : null

    const otherTHeadProps = {}

    const canChangeColumnsOrder = typeof onColumnOrderChange === 'function'
    const canResizeColumns = typeof onColumnWidthChange === 'function'

    if (headerCount > 0 && (canChangeColumnsOrder || canResizeColumns)) {
      otherTHeadProps.onMouseDown = this._onHeaderMouseDown
    }

    return (
      <div
        id={this._id}
        className={classNames(
          'react-infinite-table',
          fillTableWidth && 'react-infinite-table-fill',
          fixBorders && 'react-infinite-table-fix-borders',
          className
        )}
        style={style}
      >
        <style ref={el => { this._style = el }} dangerouslySetInnerHTML={{ __html: this.getStyles() }} />
        <div
          className='react-infinite-table-wrapper'
          ref={c => { this.scrollable = c }}
          style={this.buildScrollableStyle()}
          onScroll={this.handleScroll}
        >
          <div className='react-infinite-table-scroll-smoother' />
          <table className={tableClassName}>
            {headerCount > 0 && (
              <thead
                ref={el => { this._thead = el }}
                {...otherTHeadProps}
              >
                {this.renderHeaderRows()}
              </thead>
            )}
            <tbody
              ref={c => { this.smoothScrollingWrapper = c }}
              style={infiniteScrollStyles}
            >
              <tr
                className='react-infinite-table-spacer'
                ref={c => { this.topSpacer = c }} style={{
                  height: Math.ceil(topSpacerHeight)
                }}
              />
              <tr className='react-infinite-table-spacer' style={{ height: 0 }} /* to fix odd-even numbers */ />
              {displayBottomUpwards && loadingSpinner}
              {displayables}
              {!displayBottomUpwards && loadingSpinner}
              <tr className='react-infinite-table-spacer' ref={c => { this.bottomSpacer = c }}>
                <td>
                  <div style={{
                    minHeight: Math.ceil(bottomSpacerHeight)
                  }}
                  />
                </td>
              </tr>
            </tbody>
            {footerCount > 0 && (
              <tfoot>
                {this.renderFooterRows()}
              </tfoot>
            )}
          </table>
        </div>
        <div className='react-infinite-prevent-table-fill' />
      </div>
    )
  }
}
