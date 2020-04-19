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
    fixedColumnsCount: 2,
    fillTableWidth: false,
    displayBottomUpwards: false,
    infiniteScrolling: false,
    rows: createAllRows(),
    isInfiniteLoading: false,
    selectedRows: {},
    canSelectMultipleRows: true
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

  onFillTableWidth = fillTableWidth => {
    this.setState({
      fillTableWidth: fillTableWidth
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

  onFixedColumnsCountChange = fixedColumnsCount => {
    this.setState({
      fixedColumnsCount: fixedColumnsCount
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

  onSelectionChange = selectedRows => {
    this.setState({
      selectedRows: selectedRows
    })
  }

  setCanSelectMultipleRows = canSelectMultipleRows => {
    this.setState({
      canSelectMultipleRows: canSelectMultipleRows
    })
  }

  render () {
    const {
      numberOfColumns,
      noRows,
      fixedColumnsCount,
      fillTableWidth,
      infiniteScrolling,
      displayBottomUpwards,
      rows,
      columns,
      selectedRows,
      canSelectMultipleRows
    } = this.state

    return (
      <div className='container'>
        <a href='https://github.com/nicoladefranceschi/react-infinite-table' className='float-right mt-3 mr-2'>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' width='24' height='24'><title>GitHub</title><path d='M10 0a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69a3.6 3.6 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.4.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .26.18.58.69.48A10 10 0 0 0 10 0' /></svg>
        </a>
        <h2>
          react-infinite-table
        </h2>
        <div className='App'>
          <div className='settings'>
            <div className='form-check'>
              <input
                className='form-check-input' type='checkbox'
                id='noRows'
                checked={noRows}
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
              <label className='mr-2' htmlFor='fixedColumnsCount'>Fixed columns: </label>
              <input
                className='form-control'
                type='number'
                id='fixedColumnsCount'
                value={fixedColumnsCount}
                min={0}
                max={columns.length}
                step={1}
                onChange={e => this.onFixedColumnsCountChange(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className='form-check'>
              <input
                className='form-check-input' type='checkbox'
                id='fillTableWidth'
                checked={fillTableWidth}
                onChange={e => this.onFillTableWidth(e.target.checked)}
              />
              <label htmlFor='fillTableWidth'> Fill table width</label>
            </div>
            <div className='form-check'>
              <input
                className='form-check-input' type='checkbox'
                id='infiniteScrolling'
                checked={infiniteScrolling}
                onChange={e => this.onInfiniteScrolling(e.target.checked)}
              />
              <label htmlFor='infiniteScrolling'> Infinite scrolling</label>
            </div>
            <div className='form-check'>
              <input
                className='form-check-input' type='checkbox'
                id='displayBottomUpwards'
                checked={displayBottomUpwards}
                onChange={e => this.setDisplayBottomUpwards(e.target.checked)}
              />
              <label htmlFor='displayBottomUpwards'> Display Bottom Upwards</label>
            </div>
            <div className='form-check'>
              <input
                className='form-check-input' type='checkbox'
                id='canSelectMultipleRows'
                checked={canSelectMultipleRows}
                onChange={e => this.setCanSelectMultipleRows(e.target.checked)}
              />
              <label htmlFor='canSelectMultipleRows'> Can select multiple rows</label>
            </div>
          </div>
          <Table
            className='example-table'
            tableClassName='table table-bordered table-striped'
            height={600}
            rowHeight={50}
            rows={rows}
            columns={columns}
            fixedColumnsCount={fixedColumnsCount}
            headerCount={1}
            footerCount={1}
            fillTableWidth={fillTableWidth}
            noRowsRenderer={() => 'No rows'}
            rowIdKey='i'
            selectedRows={selectedRows}
            canSelectMultipleRows={canSelectMultipleRows}
            onSelectionChange={this.onSelectionChange}
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
