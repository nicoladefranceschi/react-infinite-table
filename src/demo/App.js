import React from 'react';

import './App.scss';

import { Table } from '../index.js'


const ROW_HEIGHT = 30;

const N_ROWS = 10**3

const _rows = []
for (let index = 0; index < N_ROWS; index++) {
  _rows.push(index)  
}

function App() {

  const rows = _rows.map(index => {
    const s = {
      height: ROW_HEIGHT
    }
    return <tr key={index} style={s}>
      <td className="is-fixed-left">Index: {index}</td>
      <td className="is-fixed-left is-fixed-left--2">Col1: {index}</td>
      <td>Col2: {index}</td>
      <td>Col3: {index}</td>
      <td>Col4: {index}</td>
      <td>Col5: {index}</td>
      <td>Col6: {index}</td>
      <td>Col7: {index}</td>
      <td>Col8: {index}</td>
      <td>Col9: {index}</td>
    </tr>
  })

  return (
    <div className="App">
      <Table containerHeight={200} elementHeight={ROW_HEIGHT} className="example-table">
        {rows}
      </Table>
    </div>
  );
}

export default App;
