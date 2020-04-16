/* @flow */

var React = require('react');
var PropTypes = require('prop-types');

var window = require('./utils/window');

var infiniteHelpers = require('./utils/infiniteHelpers');
var _isFinite = require('lodash.isfinite');

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

    //headerRowRenderer

    //TODO: check??

    // handleScroll: PropTypes.func,

    // useWindowAsScrollContainer: PropTypes.bool,

    displayBottomUpwards: PropTypes.bool.isRequired,

    infiniteLoadBeginEdgeOffset: PropTypes.number,
    onInfiniteLoad: PropTypes.func,
    loadingSpinnerDelegate: PropTypes.node,

    isInfiniteLoading: PropTypes.bool,
    timeScrollStateLastsForAfterUserScrolls: PropTypes.number,

    className: PropTypes.string,
  };


  static defaultProps = {
    overscanSize: 300,

    handleScroll: () => {},

    useWindowAsScrollContainer: false,

    onInfiniteLoad: () => {},
    loadingSpinnerDelegate: <div />,

    displayBottomUpwards: false,

    isInfiniteLoading: false,
    timeScrollStateLastsForAfterUserScrolls: 150,
  };

  constructor(props) {
    super(props);
    const nextInternalState = this.recomputeInternalStateFromProps(props);

    // Properties currently used but which may be
    // refactored away in the future.
    this.utils = nextInternalState.utils;
    this.shouldAttachToBottom = props.displayBottomUpwards;

    const state = nextInternalState.newState;
    state.scrollTimeout = undefined;
    state.isScrolling = false;

    this.state = state;
  }

  utils = null;
  shouldAttachToBottom = false;
  preservedScrollState = 0;
  loadingSpinnerHeight = 0;

  // Refs
  scrollable = null;
  topSpacer = null;
  bottomSpacer = null;
  smoothScrollingWrapper = null;
  loadingSpinner = null;

  generateComputedUtilityFunctions = (
    props
  ) => {
    var utilities = {};
    utilities.getLoadingSpinnerHeight = () => {
      var loadingSpinnerHeight = 0;
      if (this.loadingSpinner) {
        loadingSpinnerHeight = this.loadingSpinner.offsetHeight || 0;
      }
      return loadingSpinnerHeight;
    };
    if (props.useWindowAsScrollContainer) {
      utilities.subscribeToScrollListener = () => {
        window.addEventListener('scroll', this.infiniteHandleScroll);
      };
      utilities.unsubscribeFromScrollListener = () => {
        window.removeEventListener('scroll', this.infiniteHandleScroll);
      };
      utilities.nodeScrollListener = () => {};
      utilities.getScrollTop = () => window.pageYOffset;
      utilities.setScrollTop = top => {
        window.scroll(window.pageXOffset, top);
      };
      utilities.scrollShouldBeIgnored = () => false;
      utilities.buildScrollableStyle = () => ({});
    } else {
      utilities.subscribeToScrollListener = () => {};
      utilities.unsubscribeFromScrollListener = () => {};
      utilities.nodeScrollListener = this.infiniteHandleScroll;
      utilities.getScrollTop = () => {
        return this.scrollable ? this.scrollable.scrollTop : 0;
      };

      utilities.setScrollTop = top => {
        if (this.scrollable) {
          this.scrollable.scrollTop = top;
        }
      };
      utilities.scrollShouldBeIgnored = event => event.target !== this.scrollable;

      utilities.buildScrollableStyle = () => {
        return {
          height: props.height,
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch'
        }
      };
    }
    return utilities;
  };

  recomputeInternalStateFromProps = (
    props
  ) => {
    checkProps(props);
    var utils = this.generateComputedUtilityFunctions(
      props
    );

    var newState = {};

    newState.infiniteComputer = infiniteHelpers.createInfiniteComputer(
      props.rows.length,
      props.rowHeight
    );

    if (props.isInfiniteLoading !== undefined) {
      newState.isInfiniteLoading = props.isInfiniteLoading;
    }

    newState = {
      ...newState,
      ...infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
        props.overscanSize,
        newState.infiniteComputer,
        utils.getScrollTop()
      )
    };

    return {
      utils,
      newState
    };
  };

  componentWillReceiveProps(nextProps) {
    var nextInternalState = this.recomputeInternalStateFromProps(nextProps);

    this.utils = nextInternalState.utils;

    this.setState(nextInternalState.newState);
  }

  componentWillUpdate() {
    if (this.props.displayBottomUpwards) {
      this.preservedScrollState =
        this.utils.getScrollTop() - this.loadingSpinnerHeight;
    }
  }

  componentDidUpdate(
    prevProps,
    prevState
  ) {
    this.loadingSpinnerHeight = this.utils.getLoadingSpinnerHeight();

    if (
      !prevProps.useWindowAsScrollContainer &&
      this.props.useWindowAsScrollContainer
    ) {
      this.utils.subscribeToScrollListener();
    }

    if (this.props.displayBottomUpwards) {
      var lowestScrollTop = this.getLowestPossibleScrollTop();
      if (
        this.shouldAttachToBottom &&
        this.utils.getScrollTop() < lowestScrollTop
      ) {
        this.utils.setScrollTop(lowestScrollTop);
      } else if (prevProps.isInfiniteLoading && !this.props.isInfiniteLoading) {
        this.utils.setScrollTop(
          this.state.infiniteComputer.getTotalScrollableHeight() -
            prevState.infiniteComputer.getTotalScrollableHeight() +
            this.preservedScrollState
        );
      }
    }

    const hasLoadedMoreChildren = this.props.rows.length !== prevProps.rows.length;
    if (hasLoadedMoreChildren) {
      var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
        this.props.overscanSize,
        this.state.infiniteComputer,
        this.utils.getScrollTop()
      );
      this.setState(newApertureState);
    }

    const isMissingVisibleRows =
      hasLoadedMoreChildren &&
      !this.hasAllVisibleItems() &&
      !this.state.isInfiniteLoading;
    if (isMissingVisibleRows) {
      this.onInfiniteLoad();
    }
  }

  componentDidMount() {
    this.utils.subscribeToScrollListener();

    if (!this.hasAllVisibleItems()) {
      this.onInfiniteLoad();
    }

    if (this.props.displayBottomUpwards) {
      var lowestScrollTop = this.getLowestPossibleScrollTop();
      if (
        this.shouldAttachToBottom &&
        this.utils.getScrollTop() < lowestScrollTop
      ) {
        this.utils.setScrollTop(lowestScrollTop);
      }
    }
  }

  componentWillUnmount() {
    this.utils.unsubscribeFromScrollListener();
  }

  infiniteHandleScroll = (e) => {
    if (this.utils.scrollShouldBeIgnored(e)) {
      return;
    }
    this.props.handleScroll(this.scrollable);
    this.handleScroll(this.utils.getScrollTop());
  };

  manageScrollTimeouts = () => {
    // Maintains a series of timeouts to set this.state.isScrolling
    // to be true when the element is scrolling.

    if (this.state.scrollTimeout) {
      clearTimeout(this.state.scrollTimeout);
    }

    var that = this,
      scrollTimeout = setTimeout(() => {
        that.setState({
          isScrolling: false,
          scrollTimeout: undefined
        });
      }, this.props.timeScrollStateLastsForAfterUserScrolls);

    this.setState({
      isScrolling: true,
      scrollTimeout: scrollTimeout
    });
  };

  getLowestPossibleScrollTop = () => {
    return (
      this.state.infiniteComputer.getTotalScrollableHeight() -
      this.props.height
    );
  };

  hasAllVisibleItems = () => {
    return !(
      _isFinite(this.props.infiniteLoadBeginEdgeOffset) &&
      this.state.infiniteComputer.getTotalScrollableHeight() <
        this.props.height
    );
  };

  passedEdgeForInfiniteScroll = (scrollTop) => {
    const edgeOffset = this.props.infiniteLoadBeginEdgeOffset;
    if (typeof edgeOffset !== 'number') {
      return false;
    }

    if (this.props.displayBottomUpwards) {
      return !this.shouldAttachToBottom && scrollTop < edgeOffset;
    } else {
      return (
        scrollTop >
        this.state.infiniteComputer.getTotalScrollableHeight() -
          this.props.height -
          edgeOffset
      );
    }
  };

  onInfiniteLoad = () => {
    this.setState({ isInfiniteLoading: true });
    this.props.onInfiniteLoad();
  };

  handleScroll = (scrollTop) => {
    this.shouldAttachToBottom =
      this.props.displayBottomUpwards &&
      scrollTop >= this.getLowestPossibleScrollTop();

    this.manageScrollTimeouts();

    var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
      this.props.overscanSize,
      this.state.infiniteComputer,
      scrollTop
    );

    if (
      this.passedEdgeForInfiniteScroll(scrollTop) &&
      !this.state.isInfiniteLoading
    ) {
      this.setState(newApertureState);
      this.onInfiniteLoad();
    } else {
      this.setState(newApertureState);
    }
  };


  renderRows(displayIndexStart, displayIndexEnd) {
    const rows = []
    for(let rowIndex = displayIndexStart; rowIndex <= displayIndexEnd; rowIndex++) {
      const rowHeight = typeof this.props.rowHeight === 'number' ? this.props.rowHeight : this.props.rowHeight(rowIndex)

      const rowData = this.props.rows
      let columnOffset = 0

      const row = (
        <tr key={rowIndex} 
          style={infiniteHelpers.buildHeightStyle(rowHeight)}
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

            return column.cellRenderer({
              key: columnIndex,
              columnIndex,
              column,
              rowData,
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
    if (this.state.isScrolling) {
      infiniteScrollStyles.pointerEvents = 'none';
    }

    var topSpacerHeight = this.state.infiniteComputer.getTopSpacerHeight(
        this.state.displayIndexStart
      ),
      bottomSpacerHeight = this.state.infiniteComputer.getBottomSpacerHeight(
        this.state.displayIndexEnd
      );

    // This asymmetry is due to a reluctance to use CSS to control
    // the bottom alignment
    if (this.props.displayBottomUpwards) {
      var heightDifference =
        this.props.height -
        this.state.infiniteComputer.getTotalScrollableHeight();
      if (heightDifference > 0) {
        topSpacerHeight = heightDifference - this.loadingSpinnerHeight;
      }
    }

    var loadingSpinner =
      this.props.infiniteLoadBeginEdgeOffset === undefined
        ? null
        : <div
            ref={c => {
              this.loadingSpinner = c;
            }}
          >
            {this.state.isInfiniteLoading
              ? this.props.loadingSpinnerDelegate
              : null}
          </div>;

    // topSpacer and bottomSpacer take up the amount of space that the
    // rendered elements would have taken up otherwise
    return (
      <div
        className={'react-infinite-table ' + (this.props.className || '')}
        ref={c => {
          this.scrollable = c;
        }}
        style={this.utils.buildScrollableStyle()}
        onScroll={this.utils.nodeScrollListener}
      >
        <table style={{width: 'unset'}}>
          {this.props.headerCount > 0 && <thead>
            {this.renderHeaderRows()}
          </thead>}
          <tbody
            ref={c => {
              this.smoothScrollingWrapper = c;
            }}
            style={infiniteScrollStyles}
          >
            <tr
              ref={c => {
                this.topSpacer = c;
              }}
              style={infiniteHelpers.buildHeightStyle(topSpacerHeight)}
            />
            {this.props.displayBottomUpwards && loadingSpinner}
            {displayables}
            {!this.props.displayBottomUpwards && loadingSpinner}
            <tr
              ref={c => {
                this.bottomSpacer = c;
              }}
              style={infiniteHelpers.buildHeightStyle(bottomSpacerHeight)}
            />
          </tbody>
          {this.props.footerCount > 0 && <tfoot>
            {this.renderFooterRows()}
          </tfoot>}
        </table>
      </div>
    );
  }
}
