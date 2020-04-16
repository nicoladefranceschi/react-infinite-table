import React from 'react';

import './App.scss';

import { Table } from '../index.js'


const ROW_HEIGHT = 30;

const N_ROWS = 10**5

const _rows = []
for (let index = 0; index < N_ROWS; index++) {
  _rows.push({})  
}

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

function App() {
  return (
    <div className="App">
      <Table 
        className="example-table"
        height={200} 
        rowHeight={ROW_HEIGHT} 
        rows={_rows}
        columns={_columns}
        fixedColumnsLeftCount={2}
        headerCount={1}
        footerCount={1}
      >
      </Table>
    </div>
  );
}

export default App;
