import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { DraggableCore } from 'react-draggable';

var infiniteHelpers = require('./utils/infiniteHelpers');

var checkProps = require('./utils/checkProps');

let _nextId = 1

export class Table extends React.Component {

  static propTypes = {
    height: PropTypes.number.isRequired,
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired,
    overscanSize: PropTypes.number,
    rows: PropTypes.array.isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape({
      cellRenderer: PropTypes.func,
      headerRenderer: PropTypes.func,
      footerRenderer: PropTypes.func,
      width: PropTypes.number.isRequired
    })).isRequired,
    headerCount: PropTypes.number,
    footerCount: PropTypes.number,    
    fixedColumnsLeftCount: PropTypes.number,

    infiniteLoadBeginEdgeOffset: PropTypes.number,
    isInfiniteLoading: PropTypes.bool,
    onInfiniteLoad: PropTypes.func,
    getLoadingSpinner: PropTypes.func,

    displayBottomUpwards: PropTypes.bool.isRequired,

    className: PropTypes.string,

    onColumnWidthChange: PropTypes.func,
  };

  static defaultProps = {
    overscanSize: 500,

    infiniteLoadBeginEdgeOffset: undefined,
    onInfiniteLoad: () => {},
    getLoadingSpinner: () => <div />,

    displayBottomUpwards: false,
  };

  constructor(props) {
    super(props);

    this._id = 'react-infinite-table-' + _nextId++

    this.shouldAttachToBottom = props.displayBottomUpwards;

    this.state = this.recomputeInternalStateFromProps(props);
  }

  shouldAttachToBottom = false;
  preservedScrollState = 0;
  loadingSpinnerHeight = 0;

  // Refs
  scrollable = null;
  topSpacer = null;
  bottomSpacer = null;
  smoothScrollingWrapper = null;
  loadingSpinner = null;

  getLoadingSpinnerHeight = () => {
    var loadingSpinnerHeight = 0;
    if (this.loadingSpinner) {
      loadingSpinnerHeight = this.loadingSpinner.offsetHeight || 0;
    }
    return loadingSpinnerHeight;
  }

  getScrollTop = () => {
    return this.scrollable ? this.scrollable.scrollTop : 0;
  }

  setScrollTop = top => {
    if (this.scrollable) {
      this.scrollable.scrollTop = top;
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
    checkProps(props);

    var newState = {};

    newState.infiniteComputer = infiniteHelpers.createInfiniteComputer(
      props.rows.length,
      props.rowHeight
    );

    newState = {
      ...newState,
      ...infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
        props.overscanSize,
        newState.infiniteComputer,
        this.getScrollTop()
      )
    };

    return newState
  };

  componentWillReceiveProps(nextProps) {
    var newState = this.recomputeInternalStateFromProps(nextProps);

    if(this.props.displayBottomUpwards !== nextProps.displayBottomUpwards) {
      this.shouldAttachToBottom = nextProps.displayBottomUpwards;
    }

    this.setState(newState);
  }

  componentWillUpdate() {
    if (this.props.displayBottomUpwards) {
      this.preservedScrollState = this.getScrollTop() - this.loadingSpinnerHeight;
    }
  }

  componentDidUpdate(
    prevProps,
    prevState
  ) {
    this.loadingSpinnerHeight = this.getLoadingSpinnerHeight();

    if (this.props.displayBottomUpwards) {
      var lowestScrollTop = this.getLowestPossibleScrollTop();
      if (
        this.shouldAttachToBottom &&
        this.getScrollTop() < lowestScrollTop
      ) {
        this.setScrollTop(lowestScrollTop);
      } else if (prevProps.isInfiniteLoading && !this.props.isInfiniteLoading) {
        this.setScrollTop(
          this.state.infiniteComputer.getTotalScrollableHeight() -
            prevState.infiniteComputer.getTotalScrollableHeight() +
            this.preservedScrollState
        );
      }
    }

    const hasLoadedMoreChildren = this.props.rows !== prevProps.rows;
    if (hasLoadedMoreChildren) {
      var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
        this.props.overscanSize,
        this.state.infiniteComputer,
        this.getScrollTop()
      );
      this.setState(newApertureState);
    }

    const isMissingVisibleRows =
      hasLoadedMoreChildren &&
      !this.hasAllVisibleItems() &&
      !this.props.isInfiniteLoading;
    if (isMissingVisibleRows) {
      this.onInfiniteLoad();
    }

    if(
      this.props.columns !== prevProps.columns ||
      this.props.fixedColumnsLeftCount !== prevProps.fixedColumnsLeftCount
    ){
      this._style.innerHTML = this.getStyles()
    }
  }

  componentDidMount() {
    if (!this.hasAllVisibleItems()) {
      this.onInfiniteLoad();
    }

    if (this.props.displayBottomUpwards) {
      var lowestScrollTop = this.getLowestPossibleScrollTop();
      if (
        this.shouldAttachToBottom &&
        this.getScrollTop() < lowestScrollTop
      ) {
        this.setScrollTop(lowestScrollTop);
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
    );
  }

  passedEdgeForInfiniteScroll = (scrollTop) => {
    const edgeOffset = this.props.infiniteLoadBeginEdgeOffset;
    if (typeof edgeOffset !== 'number') {
      return false;
    }

    if (this.props.displayBottomUpwards) {
      return !this.shouldAttachToBottom && scrollTop < edgeOffset;
    } else {
      return (
        scrollTop > this.state.infiniteComputer.getTotalScrollableHeight() - this.props.height - edgeOffset
      );
    }
  }

  onInfiniteLoad = () => {
    this.props.onInfiniteLoad();
  }

  handleScroll = (e) => {
    if (this.scrollShouldBeIgnored(e)) {
      return;
    }

    const scrollTop = this.getScrollTop()

    this.shouldAttachToBottom =
      this.props.displayBottomUpwards &&
      scrollTop >= this.getLowestPossibleScrollTop();

    var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
      this.props.overscanSize,
      this.state.infiniteComputer,
      scrollTop
    );

    if (
      this.passedEdgeForInfiniteScroll(scrollTop) &&
      !this.props.isInfiniteLoading
    ) {
      this.setState(newApertureState);
      this.onInfiniteLoad();
    } else {
      this.setState(newApertureState);
    }
  }

  resizeColumn(columnIndex, width, isDragging) {
    if(isDragging){
      this._columnDrag = {
        columnIndex,
        width
      }
      this._style.innerHTML = this.getStyles()
    }else{
      this.props.onColumnWidthChange(columnIndex, width)
      this._style.innerHTML = this.getStyles()
    }
  }


  getColumnWidth(columnIndex) {
    const column = this.props.columns[columnIndex]
    return this._columnDrag && this._columnDrag.columnIndex === columnIndex 
      ? this._columnDrag.width 
      : column.width
  }


  getStyles() {
    let columnOffset = 0
    return this.props.columns.map((column, columnIndex) => {
      const columnWidth = this.getColumnWidth(columnIndex)

      const shouldBeFixed = this.props.fixedColumnsLeftCount && columnIndex < this.props.fixedColumnsLeftCount
      let left;
      if(shouldBeFixed) {
        left = columnOffset + 'px'
      }else{
        left = 'unset'
      }

      columnOffset += columnWidth

      return `
        #${this._id} .react-infinite-table-col-${columnIndex} {
          width: ${columnWidth}px;
          min-width: ${columnWidth}px;
          max-width: ${columnWidth}px;
          left: ${left};
        }
      `
    }).join('\n')
  }


  renderRows(displayIndexStart, displayIndexEnd) {
    const rows = []
    const rowsData = this.props.rows

    for(let rowIndex = displayIndexStart; rowIndex <= displayIndexEnd; rowIndex++) {
      const rowHeight = typeof this.props.rowHeight === 'number' ? this.props.rowHeight : this.props.rowHeight(rowIndex)

      let columnOffset = 0

      const rowData = rowsData[rowIndex]

      const row = (
        <tr 
          key={rowIndex} 
          className={classNames(
            (rowIndex % 2 === 0) ? 'tr-odd' : 'tr-even'
          )}
          style={infiniteHelpers.buildHeightStyle(rowHeight)}
        >
          {this.props.columns.map((column, columnIndex) => {
            const columnWidth = this.getColumnWidth(columnIndex)

            let classes = [
              'react-infinite-table-col-' + columnIndex
            ]
            let style = {}            

            if(this.props.fixedColumnsLeftCount && columnIndex < this.props.fixedColumnsLeftCount) {
              classes.push('is-fixed-left')
            }

            columnOffset += columnWidth

            return column.cellRenderer({
              key: columnIndex,
              columnIndex,
              column,
              rowData,
              rowIndex,
              className: classNames(classes),
              style
            })
          })}
        </tr>
      )

      rows.push(row)
    }
    return rows
  }

  renderHeaderRows() {
    const rows = []
    let rowOffset = 0

    for(let rowIndex = 0; rowIndex < this.props.headerCount; rowIndex++) {
      let columnOffset = 0

      const row = (
        <tr key={rowIndex} 
          style={{width: '100%', top: rowOffset}}
        >
          {this.props.columns.map((column, columnIndex) => {            
            const columnWidth = this.getColumnWidth(columnIndex)
            
            let classes = [
              'react-infinite-table-col-' + columnIndex
            ]
            let style = {}

            if(this.props.fixedColumnsLeftCount && columnIndex < this.props.fixedColumnsLeftCount) {
              classes.push('is-fixed-left')
            }

            // TODO: props
            const canChangeColumnsOrder = true
            const canResizeColumns = typeof this.props.onColumnWidthChange === 'function'

            classes.push(
              canChangeColumnsOrder && 'react-infinite-column-reorder',
              canResizeColumns && 'react-infinite-column-resize',
            )            

            columnOffset += columnWidth

            let cell = column.headerRenderer({
              key: columnIndex,
              columnIndex,
              column,
              rowIndex,
              className: classNames(classes),
              style
            })

            if(canChangeColumnsOrder || canResizeColumns) {
              cell = <DraggableCore
                key={columnIndex}
                offsetParent={this.scrollable}
                onStart={(event, data) => {
                  const target = event.target
                  const cellEl = target.closest('th, td')
                  this._draggingCell = cellEl
                  this._initialDataX = data.x

                  cellEl.classList.add('react-infinite-column-dragging')

                  const isResizing = canResizeColumns && (event.nativeEvent.offsetX >= cellEl.offsetWidth - 4)

                  if(isResizing) {
                    cellEl.classList.add('react-infinite-column-resizing')
                    this._isDraggingResizer = true

                    event.stopPropagation()

                    this._initialColumnWidth = columnWidth
  
                  }else{
                    this._oldStyleData = {
                      marginLeft: cellEl.style.marginLeft,
                      borderLeft: cellEl.style.borderLeft,
                      width: cellEl.style.width,
                      maxWidth: cellEl.style.maxWidth,
                      minWidth: cellEl.style.minWidth
                    }
  
                    cellEl.classList.add('react-infinite-column-reordering')
                    this._isDraggingReorder = true
  
                    const addedBorderWidth = 1
                    const width = cellEl.getBoundingClientRect().width + addedBorderWidth
                    cellEl.style.marginLeft = `${-addedBorderWidth}px`
                    cellEl.style.borderLeft = `${addedBorderWidth}px solid red`
                    cellEl.style.width = `${width}px`
                    cellEl.style.maxWidth = `${width}px`
                    cellEl.style.minWidth = `${width}px`
                  } 
                }}
                onStop={(event, data) => {
                  const cellEl = this._draggingCell
                  cellEl.classList.remove('react-infinite-column-dragging')
                  cellEl.classList.remove('react-infinite-column-resizing')
                  cellEl.classList.remove('react-infinite-column-reordering')

                  if(this._isDraggingResizer) {
                    event.stopPropagation()
                    const width = this._initialColumnWidth
                    const minColumnWidth = 40
                    this.resizeColumn(columnIndex, Math.max(width + data.x - this._initialDataX, minColumnWidth), false)
                  }
                  if(this._isDraggingReorder) {
                    const oldStyleData = this._oldStyleData
                    for (const key in oldStyleData) {
                      if (oldStyleData.hasOwnProperty(key)) {
                        const value = oldStyleData[key];
                        cellEl.style[key] = value
                      }
                    }
                    
                    
                  }

                  delete this._draggingCell
                  delete this._initialDataX
                  delete this._isDraggingResizer
                  delete this._isDraggingReorder
                  delete this._oldStyleData  
                  delete this._columnDrag
                }}
                onDrag={(event, data) => {
                  if(this._isDraggingResizer) {
                    event.stopPropagation()
                    const width = this._initialColumnWidth
                    const minColumnWidth = 40
                    this.resizeColumn(columnIndex, Math.max(width + data.x - this._initialDataX, minColumnWidth), true)
                  }
                  if(this._isDraggingReorder) {

                  }
                }}
                position={{
                  x: 0,
                  y: 0
                }}
              >
                {cell}
              </DraggableCore>
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
    for(let rowIndex = 0; rowIndex < this.props.footerCount; rowIndex++) {
      let columnOffset = 0

      const row = (
        <tr key={rowIndex} 
          style={{width: '100%'}}
        >
          {this.props.columns.map((column, columnIndex) => {
            const columnWidth = this.getColumnWidth(columnIndex)
            
            let classes = [
              'react-infinite-table-col-' + columnIndex
            ]
            let style = {}

            if(this.props.fixedColumnsLeftCount && columnIndex < this.props.fixedColumnsLeftCount) {
              classes.push('is-fixed-left')
            }

            columnOffset += columnWidth

            return column.footerRenderer({
              key: columnIndex,
              columnIndex,
              column,
              rowIndex,
              className: classNames(classes),
              style
            })
          })}
        </tr>
      )

      rows.push(row)
    }
    return rows
  }

  render() {
    var displayables;
    if (this.props.rows.length > 1) {
      displayables = this.renderRows(
        this.state.displayIndexStart,
        this.state.displayIndexEnd
      );
    } else {
      //TODO: noRowsRenderer 
      displayables = this.props.children;
    }

    var infiniteScrollStyles = {};

    var topSpacerHeight = this.state.infiniteComputer.getTopSpacerHeight(
        this.state.displayIndexStart
      )
    var bottomSpacerHeight = this.state.infiniteComputer.getBottomSpacerHeight(
        this.state.displayIndexEnd
      )

    // This asymmetry is due to a reluctance to use CSS to control
    // the bottom alignment
    if (this.props.displayBottomUpwards) {
      var heightDifference = this.props.height - this.state.infiniteComputer.getTotalScrollableHeight();
      if (heightDifference > 0) {
        topSpacerHeight = heightDifference - this.loadingSpinnerHeight;
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
          "react-infinite-table",
          this.props.className
        )}
      >
        <style ref={el => this._style = el} dangerouslySetInnerHTML={{__html: this.getStyles()}}/>
        <div
          className="react-infinite-table-wrapper"
          ref={c => { this.scrollable = c }}
          style={this.buildScrollableStyle()}
          onScroll={this.handleScroll}
        >
          <div className="react-infinite-table-scroll-smoother" />
          <table>            
            {this.props.headerCount > 0 && <thead>
              {this.renderHeaderRows()}
            </thead>}
            <tbody
              ref={c => { this.smoothScrollingWrapper = c }}
              style={infiniteScrollStyles}
            >
              <tr
                ref={c => { this.topSpacer = c }}
                style={infiniteHelpers.buildHeightStyle(topSpacerHeight)}
              />
              {this.props.displayBottomUpwards && loadingSpinner}
              {displayables}
              {!this.props.displayBottomUpwards && loadingSpinner}
              <tr
                ref={c => { this.bottomSpacer = c }}
                style={infiniteHelpers.buildHeightStyle(bottomSpacerHeight)}
              />
            </tbody>
            {this.props.footerCount > 0 && <tfoot>
              {this.renderFooterRows()}
            </tfoot>}
          </table>
        </div>
      </div>
    );
  }
}
