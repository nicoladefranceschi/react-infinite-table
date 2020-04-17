import React from 'react';

import './App.scss';

import { Table, reorderColumns } from '../index.js'


const ROW_HEIGHT = 30;

const N_ROWS = 10**3
const INFINITE_SCROLLING_N_ROWS = 30
const N_COLS = 10


function cellRenderer({
  key,
  columnIndex,
  column,
  rowData,
  rowIndex,
  className
}) {
  return <td key={key} className={className}>
    R:{rowData.i} C:{column.i}
  </td>
}

function headerRenderer({
  key,
  columnIndex,
  column,
  className
}) {
  return <th key={key} className={className}>
    C:{column.i}
  </th>
}


function footerRenderer({
  key,
  columnIndex,
  column,
  className
}) {
  return <td key={key} className={className}>
    C:{column.i}
  </td>
}


const _columns = []

for (let index = 0; index < N_COLS; index++) {
  _columns.push({
    i: index,
    cellRenderer: cellRenderer,
    headerRenderer: headerRenderer,
    footerRenderer: footerRenderer,
    width: 90,
  })
}
  

function createAllRows() {
  const rows = []
  for (let index = 0; index < N_ROWS; index++) {
    rows.push({i: rows.length})
  }
  return rows
}

function recreateRows (infiniteScrolling, displayBottomUpwards) {
  let rows
  if(infiniteScrolling) {
    rows = []
    for (let index = 0; index < INFINITE_SCROLLING_N_ROWS; index++) {
      rows.push({i: rows.length})  
    }
  }else{
    rows = createAllRows()
  }
  if(displayBottomUpwards) {
    rows.reverse()
  }
  return rows;
}


class App extends React.Component {
  state = {
    fixedColumnsLeftCount: 2,
    displayBottomUpwards: false,
    infiniteScrolling: false,
    rows: createAllRows(),
    isInfiniteLoading: false,
    columns: _columns
  }

  componentWillUnmount(){
    clearTimeout(this._loadRowsTimeout)
  }

  

  setDisplayBottomUpwards = displayBottomUpwards => {
    clearTimeout(this._loadRowsTimeout)
    const rows = recreateRows(this.state.infiniteScrolling, displayBottomUpwards)
    this.setState({
      displayBottomUpwards,
      rows: rows,
      isInfiniteLoading: false
    })
  }

  onInfiniteScrolling = infiniteScrolling => {
    clearTimeout(this._loadRowsTimeout)
    const rows = recreateRows(infiniteScrolling, this.state.displayBottomUpwards)
    this.setState({
      infiniteScrolling,
      rows: rows,
      isInfiniteLoading: false
    })
  }

  onInfiniteLoad = () => {
    console.log('Loading new rows!')
    this.setState({
      isInfiniteLoading: true
    })
    this._loadRowsTimeout = setTimeout(() => {
      const displayBottomUpwards = this.state.displayBottomUpwards
      let rows = [...this.state.rows]
      if(displayBottomUpwards){
        rows.reverse()
      }

      for (let index = 0; index < INFINITE_SCROLLING_N_ROWS; index++) {
        rows.push({i: rows.length})  
      }

      if(displayBottomUpwards){
        rows.reverse()
      }

      this.setState({
        rows: rows,
        isInfiniteLoading: false
      })
    }, 2000);
  }

  onFixedColumnsLeftCountChange = (e) => {
    this.setState({
      fixedColumnsLeftCount: parseInt(e.target.value) || 0
    })
  }

  onColumnWidthChange = (columnIndex, width) => {
    const newColumns = [...this.state.columns]
    newColumns[columnIndex] = {
      ...newColumns[columnIndex],
      width: width
    }
    this.setState({
      columns: newColumns
    })
  }

  onColumnOrderChange = (fromIndex, toIndex) => {
    this.setState({
      columns: reorderColumns(this.state.columns, fromIndex, toIndex)
    })
  }

  render() {
    const {
      fixedColumnsLeftCount, 
      infiniteScrolling, 
      displayBottomUpwards, 
      rows, 
      columns
    } = this.state

    return (
      <div className="App">
        <div className="settings">
          <div>
            <label htmlFor="fixedColumnsLeftCount">Fixed columns: </label>
            <input 
              type="number" 
              id="fixedColumnsLeftCount" 
              value={fixedColumnsLeftCount} 
              min={0}
              max={columns.length}
              step={1}
              onChange={this.onFixedColumnsLeftCountChange}
            />
          </div>
          <div>
            <input 
              type="checkbox" 
              id="infiniteScrolling" 
              value={infiniteScrolling} 
              onChange={e => this.onInfiniteScrolling(e.target.checked)}
            />
            <label htmlFor="infiniteScrolling"> Infinite scrolling</label>
          </div>
          <div>
            <input 
              type="checkbox" 
              id="displayBottomUpwards" 
              value={displayBottomUpwards} 
              onChange={e => this.setDisplayBottomUpwards(e.target.checked)}
            />
            <label htmlFor="displayBottomUpwards"> Display Bottom Upwards</label>
          </div>
        </div>
        <Table 
          className="example-table"
          height={200} 
          rowHeight={ROW_HEIGHT} 
          rows={rows}
          columns={columns}
          fixedColumnsLeftCount={fixedColumnsLeftCount}
          headerCount={1}
          footerCount={1}
          infiniteLoadBeginEdgeOffset={infiniteScrolling ? 150 : undefined}
          isInfiniteLoading={infiniteScrolling ? this.state.isInfiniteLoading : undefined}
          onInfiniteLoad={infiniteScrolling ? this.onInfiniteLoad : undefined}
          getLoadingSpinner={() => <div>Loading...</div>}
          displayBottomUpwards={displayBottomUpwards}
          onColumnWidthChange={this.onColumnWidthChange}
          onColumnOrderChange={this.onColumnOrderChange}
        >
        </Table>
      </div>
    );
  }
}

export default App;
