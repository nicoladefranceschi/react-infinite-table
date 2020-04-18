/* eslint-disable react/jsx-handler-names */
/* eslint-disable react/prop-types */

import React from 'react'

// Import library
import { Table, reorderColumns } from '../index.js'
import '../style.scss'

import './App.scss'

const N_ROWS = 10 ** 3
const INFINITE_SCROLLING_N_ROWS = 30
const N_COLS = 20

function cellRenderer ({
  key,
  columnIndex,
  column,
  rowData,
  rowIndex,
  className
}) {
  return (
    <td key={key} className={className}>
      R:{rowData.i} C:{column.i}
    </td>
  )
}

function headerRenderer ({
  key,
  columnIndex,
  column,
  className
}) {
  return (
    <th key={key} className={className}>
      C:{column.i}
    </th>
  )
}

function footerRenderer ({
  key,
  columnIndex,
  column,
  className
}) {
  return (
    <td key={key} className={className}>
      C:{column.i}
    </td>
  )
}

function createColumns (numberOfColumns) {
  const _columns = []

  for (let index = 0; index < numberOfColumns; index++) {
    _columns.push({
      i: index,
      cellRenderer: cellRenderer,
      headerRenderer: headerRenderer,
      footerRenderer: footerRenderer,
      width: 100
    })
  }
  return _columns
}

function createAllRows () {
  const rows = []
  for (let index = 0; index < N_ROWS; index++) {
    rows.push({ i: rows.length })
  }
  return rows
}

function recreateRows (infiniteScrolling, displayBottomUpwards) {
  let rows
  if (infiniteScrolling) {
    rows = []
    for (let index = 0; index < INFINITE_SCROLLING_N_ROWS; index++) {
      rows.push({ i: rows.length })
    }
  } else {
    rows = createAllRows()
  }
  if (displayBottomUpwards) {
    rows.reverse()
  }
  return rows
}

class App extends React.Component {
  state = {
    noRows: false,
    numberOfColumns: N_COLS,
    columns: createColumns(N_COLS),
    fixedColumnsLeftCount: 2,
    displayBottomUpwards: false,
    infiniteScrolling: false,
    rows: createAllRows(),
    isInfiniteLoading: false
  }

  componentWillUnmount () {
    clearTimeout(this._loadRowsTimeout)
  }

  onNoRowsChanged = noRows => {
    const rows = noRows ? [] : recreateRows(this.state.infiniteScrolling, this.state.displayBottomUpwards)
    this.setState({
      noRows: noRows,
      rows: rows
    })
  }

  onNumberOfColumnsChange = numberOfColumns => {
    this.setState({
      numberOfColumns: numberOfColumns,
      columns: createColumns(numberOfColumns)
    })
  }

  setDisplayBottomUpwards = displayBottomUpwards => {
    clearTimeout(this._loadRowsTimeout)
    const rows = recreateRows(this.state.infiniteScrolling, displayBottomUpwards)
    this.setState({
      noRows: false,
      displayBottomUpwards,
      rows: rows,
      isInfiniteLoading: false
    })
  }

  onInfiniteScrolling = infiniteScrolling => {
    clearTimeout(this._loadRowsTimeout)
    const rows = recreateRows(infiniteScrolling, this.state.displayBottomUpwards)
    this.setState({
      noRows: false,
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
      const rows = [...this.state.rows]
      if (displayBottomUpwards) {
        rows.reverse()
      }

      for (let index = 0; index < INFINITE_SCROLLING_N_ROWS; index++) {
        rows.push({ i: rows.length })
      }

      if (displayBottomUpwards) {
        rows.reverse()
      }

      this.setState({
        rows: rows,
        isInfiniteLoading: false
      })
    }, 2000)
  }

  onFixedColumnsLeftCountChange = fixedColumnsLeftCount => {
    this.setState({
      fixedColumnsLeftCount: fixedColumnsLeftCount
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

  render () {
    const {
      numberOfColumns,
      noRows,
      fixedColumnsLeftCount,
      infiniteScrolling,
      displayBottomUpwards,
      rows,
      columns
    } = this.state

    return (
      <div className='container'>
        <div className='App'>
          <div className='settings'>
            <div className='form-check'>
              <input
                className='form-check-input' type='checkbox'
                id='noRows'
                value={noRows}
                onChange={e => this.onNoRowsChanged(e.target.checked)}
              />
              <label className='form-check-label' htmlFor='noRows'>
                No rows
              </label>
            </div>
            <div className='form-inline'>
              <label className='mr-2' htmlFor='numberOfColumns'>Number of columns: </label>
              <input
                className='form-control'
                type='number'
                id='numberOfColumns'
                value={numberOfColumns}
                min={1}
                step={1}
                onChange={e => this.onNumberOfColumnsChange(parseInt(e.target.value) || N_COLS)}
              />
            </div>
            <div className='form-inline'>
              <label className='mr-2' htmlFor='fixedColumnsLeftCount'>Fixed columns: </label>
              <input
                className='form-control'
                type='number'
                id='fixedColumnsLeftCount'
                value={fixedColumnsLeftCount}
                min={0}
                max={columns.length}
                step={1}
                onChange={e => this.onFixedColumnsLeftCountChange(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className='form-check'>
              <input
                className='form-check-input' type='checkbox'
                id='infiniteScrolling'
                value={infiniteScrolling}
                onChange={e => this.onInfiniteScrolling(e.target.checked)}
              />
              <label htmlFor='infiniteScrolling'> Infinite scrolling</label>
            </div>
            <div className='form-check'>
              <input
                className='form-check-input' type='checkbox'
                id='displayBottomUpwards'
                value={displayBottomUpwards}
                onChange={e => this.setDisplayBottomUpwards(e.target.checked)}
              />
              <label htmlFor='displayBottomUpwards'> Display Bottom Upwards</label>
            </div>
          </div>
          <Table
            className='example-table'
            tableClassName='table table-bordered table-striped'
            height={600}
            rowHeight={50}
            rows={rows}
            columns={columns}
            fixedColumnsLeftCount={fixedColumnsLeftCount}
            headerCount={1}
            footerCount={1}
            noRowsRenderer={() => 'No rows'}
            infiniteLoadBeginEdgeOffset={infiniteScrolling ? 150 : undefined}
            isInfiniteLoading={infiniteScrolling ? this.state.isInfiniteLoading : undefined}
            onInfiniteLoad={infiniteScrolling ? this.onInfiniteLoad : undefined}
            getLoadingSpinner={() => <div>Loading...</div>}
            displayBottomUpwards={displayBottomUpwards}
            onColumnWidthChange={this.onColumnWidthChange}
            onColumnOrderChange={this.onColumnOrderChange}
          />
        </div>
      </div>
    )
  }
}

export default App
