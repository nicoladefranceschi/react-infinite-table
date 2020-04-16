import React from 'react';

import './App.scss';

import { Table } from '../index.js'


const ROW_HEIGHT = 30;

const N_ROWS = 10**3
const INFINITE_SCROLLING_N_ROWS = 30


function cellRenderer({
  key,
  columnIndex,
  column,
  rowData,
  rowIndex,
  className,
  style
}) {
  return <td key={key} className={className} style={style}>
    R:{rowIndex} C:{columnIndex}
  </td>
}

function headerRenderer({
  key,
  columnIndex,
  column,
  className,
  style
}) {
  return <th key={key} className={className} style={style}>
    C:{columnIndex}
  </th>
}


function footerRenderer({
  key,
  columnIndex,
  column,
  className,
  style
}) {
  return <td key={key} className={className} style={style}>
    C:{columnIndex}
  </td>
}


const _columns = [
  {
    cellRenderer: cellRenderer,
    headerRenderer: headerRenderer,
    footerRenderer: footerRenderer,
    width: 90,
  }, {
    cellRenderer: cellRenderer,
    headerRenderer: headerRenderer,
    footerRenderer: footerRenderer,
    width: 90,
  }, {
    cellRenderer: cellRenderer,
    headerRenderer: headerRenderer,
    footerRenderer: footerRenderer,
    width: 90,
  }, {
    cellRenderer: cellRenderer,
    headerRenderer: headerRenderer,
    footerRenderer: footerRenderer,
    width: 90,
  }, {
    cellRenderer: cellRenderer,
    headerRenderer: headerRenderer,
    footerRenderer: footerRenderer,
    width: 90,
  }, {
    cellRenderer: cellRenderer,
    headerRenderer: headerRenderer,
    footerRenderer: footerRenderer,
    width: 90,
  }, {
    cellRenderer: cellRenderer,
    headerRenderer: headerRenderer,
    footerRenderer: footerRenderer,
    width: 90,
  }, {
    cellRenderer: cellRenderer,
    headerRenderer: headerRenderer,
    footerRenderer: footerRenderer,
    width: 90,
  }, {
    cellRenderer: cellRenderer,
    headerRenderer: headerRenderer,
    footerRenderer: footerRenderer,
    width: 90,
  }, {
    cellRenderer: cellRenderer,
    headerRenderer: headerRenderer,
    footerRenderer: footerRenderer,
    width: 90,
  }
]

function createAllRows() {
  const rows = []
  for (let index = 0; index < N_ROWS; index++) {
    rows.push({})  
  }
  return rows
}


class App extends React.Component {
  state = {
    infiniteScrolling: false,
    rows: createAllRows(),
    isInfiniteLoading: false
  }

  componentWillUnmount(){
    clearTimeout(this._loadRowsTimeout)
  }

  onInfiniteScrolling = infiniteScrolling => {
    clearTimeout(this._loadRowsTimeout)
    let rows
    if(infiniteScrolling) {
      rows = []
      for (let index = 0; index < INFINITE_SCROLLING_N_ROWS; index++) {
        rows.push({})  
      }
    }else{
      rows = createAllRows()
    }
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
      const rows = [...this.state.rows]
      for (let index = 0; index < INFINITE_SCROLLING_N_ROWS; index++) {
        rows.push({})  
      }
      this.setState({
        rows: rows,
        isInfiniteLoading: false
      })
    }, 2000);
  }

  render() {
    const {infiniteScrolling, rows} = this.state

    return (
      <div className="App">
        <div className="settings">
          <div>
            <input 
              type="checkbox" 
              id="infiniteScrolling" 
              value={infiniteScrolling} 
              onChange={e => this.onInfiniteScrolling(e.target.checked)}
            />
            <label htmlFor="infiniteScrolling"> Infinite scrolling</label>
          </div>
        </div>
        <Table 
          className="example-table"
          height={200} 
          rowHeight={ROW_HEIGHT} 
          rows={rows}
          columns={_columns}
          fixedColumnsLeftCount={2}
          headerCount={1}
          footerCount={1}
          infiniteLoadBeginEdgeOffset={infiniteScrolling ? 150 : undefined}
          isInfiniteLoading={infiniteScrolling ? this.state.isInfiniteLoading : undefined}
          onInfiniteLoad={infiniteScrolling ? this.onInfiniteLoad : undefined}
          getLoadingSpinner={() => <div>Loading...</div>}
        >
        </Table>
      </div>
    );
  }
}

export default App;
