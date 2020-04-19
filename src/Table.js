import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { DraggableCore } from 'react-draggable'

import * as infiniteHelpers from './utils/infiniteHelpers'
import checkProps from './utils/checkProps'

let _nextId = 1

// Cell wrapper that render only if some props has changed
/* eslint-disable react/prop-types */
class Cell extends React.PureComponent {
  render () {
    const {
      renderer,
      columnIndex,
      column,
      rowIndex,
      rowData,
      className
    } = this.props
    return renderer({
      columnIndex,
      column,
      rowIndex,
      rowData,
      className
    })
  }
}
/* eslint-enable react/prop-types */

export class Table extends React.Component {
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

    onColumnWidthChange: PropTypes.func,
    onColumnOrderChange: PropTypes.func
  };

  static defaultProps = {
    overscanSize: 500,

    headerCount: 1,
    footerCount: 0,
    fixedColumnsCount: 0,

    canSelectMultipleRows: false,

    infiniteLoadBeginEdgeOffset: undefined,
    onInfiniteLoad: () => {},
    getLoadingSpinner: () => <div />,

    displayBottomUpwards: false
  };

  constructor (props) {
    super(props)

    this._id = 'react-infinite-table-' + _nextId++

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

    var newState = {}

    newState.infiniteComputer = infiniteHelpers.createInfiniteComputer(
      props.rows.length,
      props.rowHeight
    )

    newState = {
      ...newState,
      ...infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
        props.overscanSize,
        newState.infiniteComputer,
        this.getScrollTop(),
        props.height
      )
    }

    return newState
  };

  componentWillReceiveProps (nextProps) {
    var newState = this.recomputeInternalStateFromProps(nextProps)

    if (this.props.displayBottomUpwards !== nextProps.displayBottomUpwards) {
      this.shouldAttachToBottom = nextProps.displayBottomUpwards
    }

    this.setState(newState)
  }

  componentWillUpdate () {
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

    if (rowsChanged) {
      var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
        this.props.overscanSize,
        this.state.infiniteComputer,
        this.getScrollTop(),
        this.props.height
      )
      this.setState(newApertureState)
    }

    const isMissingVisibleRows =
      rowsChanged &&
      !this.hasAllVisibleItems() &&
      !this.props.isInfiniteLoading
    if (isMissingVisibleRows) {
      this.onInfiniteLoad()
    }

    if (
      this.props.columns !== prevProps.columns ||
      this.props.fixedColumnsCount !== prevProps.fixedColumnsCount
    ) {
      this._style.innerHTML = this.getStyles()
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

    if (
      this.passedEdgeForInfiniteScroll(scrollTop) &&
      !this.props.isInfiniteLoading
    ) {
      this.updateNewApertureStateIfNeeded(newApertureState)
      this.onInfiniteLoad()
    } else {
      this.updateNewApertureStateIfNeeded(newApertureState)
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

    this._columnOrdering.toIndex = this._columnOrdering.fromIndex// this.props.columns.length - 1
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
      } else if (this.props.fixedColumnsCount && columnIndex < this.props.fixedColumnsCount) {
        others += `left: ${left}px`
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

  _onStartDragging = (columnIndex, event, data, canResizeColumns, canChangeColumnsOrder) => {
    const target = event.target
    const cellEl = target.closest('th, td')
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

  _onDragging = (columnIndex, event, data) => {
    const cellEl = this._draggingCell

    if (this._isDraggingResizer) {
      event.stopPropagation()
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
      target.removeEventListener('mouseup', _onRowMouseUp)
      target.removeEventListener('mousemove', _onRowMouseMove)
    }

    target.addEventListener('mouseup', _onRowMouseUp)
    target.addEventListener('mousemove', _onRowMouseMove)
  }

  renderRows (displayIndexStart, displayIndexEnd) {
    const rows = []
    const rowsData = this.props.rows
    const selectedRows = this.props.selectedRows || {}
    const rowIdKey = this.props.rowIdKey

    for (let rowIndex = displayIndexStart; rowIndex <= displayIndexEnd; rowIndex++) {
      const rowHeight = typeof this.props.rowHeight === 'number' ? this.props.rowHeight : this.props.rowHeight(rowIndex)

      const rowData = rowsData[rowIndex]

      const rowId = rowIdKey && rowData[rowIdKey]
      const isSelected = typeof rowId !== 'undefined' && selectedRows[rowId]

      const row = (
        <tr
          key={rowIndex}
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

            let cell = (
              <Cell
                renderer={column.headerRenderer}
                key={columnIndex}
                columnIndex={columnIndex}
                column={column}
                rowIndex={rowIndex}
                className={classNames(classes)}
              />
            )

            if (canChangeColumnsOrder || canResizeColumns) {
              cell = (
                <DraggableCore
                  key={columnIndex}
                  offsetParent={this.scrollable}
                  onStart={(event, data) => this._onStartDragging(columnIndex, event, data, canResizeColumns, canChangeColumnsOrder)}
                  onDrag={(event, data) => this._onDragging(columnIndex, event, data)}
                  onStop={(event, data) => this._onStopDragging(columnIndex, event, data)}
                >
                  {cell}
                </DraggableCore>
              )
            }

            return cell
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
    var displayables
    if (this.props.rows.length > 1) {
      displayables = this.renderRows(
        this.state.displayIndexStart,
        this.state.displayIndexEnd
      )
    } else {
      displayables = this.props.noRowsRenderer ? (
        <tr className='react-infinite-table-loading-no-rows'>
          <td colSpan={this.props.columns.length}>
            <div>
              {this.props.noRowsRenderer()}
            </div>
          </td>
        </tr>
      ) : []
    }

    var infiniteScrollStyles = {}

    var topSpacerHeight = this.state.infiniteComputer.getTopSpacerHeight(
      this.state.displayIndexStart
    )
    var bottomSpacerHeight = this.state.infiniteComputer.getBottomSpacerHeight(
      this.state.displayIndexEnd
    )

    // This asymmetry is due to a reluctance to use CSS to control
    // the bottom alignment
    if (this.props.displayBottomUpwards) {
      var heightDifference = this.props.height - this.state.infiniteComputer.getTotalScrollableHeight()
      if (heightDifference > 0) {
        topSpacerHeight = heightDifference - this.loadingSpinnerHeight
      }
    }

    var loadingSpinner =
      this.props.infiniteLoadBeginEdgeOffset !== undefined && this.props.isInfiniteLoading
        ? (
          <tr ref={c => { this.loadingSpinner = c }} className='react-infinite-table-loading-row'>
            <td colSpan={this.props.columns.length}>
              {this.props.getLoadingSpinner()}
            </td>
          </tr>
        )
        : null

    return (
      <div
        id={this._id}
        className={classNames(
          'react-infinite-table',
          this.props.className
        )}
        style={this.props.style}
      >
        <style ref={el => { this._style = el }} dangerouslySetInnerHTML={{ __html: this.getStyles() }} />
        <div
          className='react-infinite-table-wrapper'
          ref={c => { this.scrollable = c }}
          style={this.buildScrollableStyle()}
          onScroll={this.handleScroll}
        >
          <div className='react-infinite-table-scroll-smoother' />
          <table className={this.props.tableClassName}>
            {this.props.headerCount > 0 && (
              <thead>
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
              {this.props.displayBottomUpwards && loadingSpinner}
              {displayables}
              {!this.props.displayBottomUpwards && loadingSpinner}
              <tr className='react-infinite-table-spacer' ref={c => { this.bottomSpacer = c }}>
                <td>
                  <div style={{
                    minHeight: Math.ceil(bottomSpacerHeight)
                  }}
                  />
                </td>
              </tr>
            </tbody>
            {this.props.footerCount > 0 && (
              <tfoot>
                {this.renderFooterRows()}
              </tfoot>
            )}
          </table>
        </div>
      </div>
    )
  }
}
