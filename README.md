React Infinite Table
===

[![NPM version](https://img.shields.io/npm/v/react-infinite-table.svg?style=flat)](https://www.npmjs.com/package/react-infinite-table)
![NPM license](https://img.shields.io/npm/l/react-infinite-table.svg?style=flat)
![npm bundle size](https://img.shields.io/bundlephobia/min/react-infinite-table)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-infinite-table)
[![NPM total downloads](https://img.shields.io/npm/dt/react-infinite-table.svg?style=flat)](https://npmcharts.com/compare/react-infinite-table?minimal=true)
[![NPM monthly downloads](https://img.shields.io/npm/dm/react-infinite-table.svg?style=flat)](https://npmcharts.com/compare/react-infinite-table?minimal=true)

**A browser-ready efficient scrolling table with fixed header and footer, and much more!** 

### Check out [the demo](http://nicoladefranceschi.github.io/react-infinite-table/)

## Features

- ✅ Render only the visibile rows  
- ✅ Fixed header
- ✅ Fixed footer
- ✅ Fixed left column(s)
- ✅ Column resize
- ✅ Column order changes (by dragging)
- ✅ Row selection (handling shift/modifier during click)
- 🔜 Rows with different heights / free height
- 🎉 Uses the HTML `<table>` standard tags!
- 🎉 No use of `javascript` to sync scroll between fixed columns/rows!


## Getting started

Install `react-infinite-table` using npm.

```shell
npm install react-infinite-table --save
```

Import and use as follows:

```jsx
import {Table} from 'react-infinite-table';

const rows = [
  { /* the row's data */ }, 
  //...
]

const columns = [
  { 
    cellRenderer: ({ key, columnIndex, column, rowData, rowIndex, className }) => {
      return (
        <td key={key} className={className}>
          {rowData.xxx}
        </td>
      )
    },
    headerRenderer: ({ key, columnIndex, column, className }) => {
      return (
        <th key={key} className={className}>
          {column.name}
        </th>
      )
    },
    footerRenderer: ({ key, columnIndex, column, className }) => {
      return (
        <td key={key} className={className}>
          {column.xxx}
        </td>
      )
    },
    width: 90,
    name: '...'
  },
  //...
]

<Table
  className='example-table'
  tableClassName='table table-bordered table-striped' // example using bootstrap
  height={200}
  rowHeight={30}
  rows={rows}
  columns={columns}
  headerCount={1}
  footerCount={1}
  noRowsRenderer={() => 'No rows'}
  // keep the first column fixed:
  fixedColumnsLeftCount={1}
  // row selection
  rowIdKey='id'
  selectedRows={this.state.selectedRows}
  onSelectionChange={selectedRows => { this.setState({selectedRows}) }}
  canSelectMultipleRows={true|false}
  // infinite load:
  infiniteLoadBeginEdgeOffset={150}
  isInfiniteLoading={true|false}
  onInfiniteLoad={() => { /* fetch your data ... */ })}
  getLoadingSpinner={() => <div>Loading...</div>}
  // display from bottom upwards, like a Chat or Message Box 
  displayBottomUpwards={displayBottomUpwards}
  // allows column resize
  onColumnWidthChange={(columnIndex, width) => { /* update columns... */ }}
  // allows column reorder (by dragging)
  onColumnOrderChange={(fromIndex, toIndex) => { /* update columns... */ }}
/>
```


## Similar packages 

This package has been inspired by some existing library dealing with tables in `react`.

The initial code started from a "fork" of the [`react-infinite`](https://github.com/seatgeek/react-infinite) package, that implements a scrollable container with a lot of items by rendering only DOM nodes that the user is able to see (or might soon see).

The definition of the columns and the rendering of the cells is inspired by [`react-virtualized`](https://github.com/bvaughn/react-virtualized).

CSS is used to fix header, footer and some columns, using `position: sticky`. This has been inspired by [`ember-table`](https://github.com/Addepar/ember-table).

Comparison of similar packages:

| Feature        | **`react-infinite-table`** | [`react-virtualized`](https://github.com/bvaughn/react-virtualized) | [`react-base-table`](https://github.com/Autodesk/react-base-table) | 
| -------------- |:---:|:---:|:---:|
| HTML `<table>` standard tags | ✅ | ❌ | ❌ |
| Fixed columns  | ✅ | ❌ | ✅ |
| Fixed header   | ✅ | ✅ | ✅ |
| Fixed footer   | ✅ | ❌ | ❌ |
| Column resize (by dragging)  | ✅ | ❌ | ✅ |
| Column reorder (by dragging) | ✅ | ❌ | ❌ |
| No use of `javascript` to sync scroll between fixed columns/rows | ✅ | ❌ | ❌ |
| Size | ![npm bundle size](https://img.shields.io/bundlephobia/min/react-infinite-table) <br/> ![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-infinite-table) | ![npm bundle size](https://img.shields.io/bundlephobia/min/react-virtualized) <br/>  ![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-virtualized) | ![npm bundle size](https://img.shields.io/bundlephobia/min/react-base-table) <br/> ![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-base-table) |



## Dependencies

_react-infinite-table_ has very few dependencies that are managed by `npm`.

The following peer dependencies must be specified by your project in order to avoid version conflicts:
[`react`](https://www.npmjs.com/package/react),
[`react-dom`](https://www.npmjs.com/package/react-dom).
NPM will not automatically install these for you but it will show you a warning message with instructions on how to install them.


## Documentation

TODO: 


### Style

TODO: 


## Development

You can run the demo: 

```shell
npm start
```

and make changes to the code. The browser will automatically load the changes.

## Contributions

Use [GitHub issues](https://github.com/nicoladefranceschi/react-infinite-table/issues) for requests.

I welcome pull requests. **Please ask first** before embarking on any significant pull request, otherwise you risk spending a lot of time working on something that the project's developers might not want to merge into the project.


## Changelog

Changes are tracked in the [changelog](https://github.com/nicoladefranceschi/react-infinite-table/blob/master/CHANGELOG.md).


## License

_react-infinite-table_ is available under the MIT License.
