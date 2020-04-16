import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

var infiniteHelpers = require('./utils/infiniteHelpers');

var checkProps = require('./utils/checkProps');

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
            const columnWidth = column.width
            
            let classes = []
            let style = {
              width: columnWidth,
              minWidth: columnWidth,
              maxWidth: columnWidth,
            }            

            if(this.props.fixedColumnsLeftCount && columnIndex < this.props.fixedColumnsLeftCount) {
              classes.push('is-fixed-left')
              style.left = columnOffset
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
            const columnWidth = column.width
            
            let className = ''
            let style = {
              width: columnWidth,
              minWidth: columnWidth,
              maxWidth: columnWidth,
            }

            if(this.props.fixedColumnsLeftCount && columnIndex < this.props.fixedColumnsLeftCount) {
              className += ' is-fixed-left'
              style.left = columnOffset
            }

            columnOffset += columnWidth

            return column.headerRenderer({
              key: columnIndex,
              columnIndex,
              column,
              rowIndex,
              className,
              style
            })
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
            const columnWidth = column.width
            
            let className = ''
            let style = {
              width: columnWidth,
              minWidth: columnWidth,
              maxWidth: columnWidth,
            }

            if(this.props.fixedColumnsLeftCount && columnIndex < this.props.fixedColumnsLeftCount) {
              className += ' is-fixed-left'
              style.left = columnOffset
            }

            columnOffset += columnWidth

            return column.footerRenderer({
              key: columnIndex,
              columnIndex,
              column,
              rowIndex,
              className,
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

    // topSpacer and bottomSpacer take up the amount of space that the
    // rendered elements would have taken up otherwise
    return (
      <div
        className={classNames(
          "react-infinite-table",
          this.props.className
        )}
      >      
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
