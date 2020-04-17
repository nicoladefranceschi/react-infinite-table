
React Infinite Table
===

[![NPM version](https://img.shields.io/npm/v/react-infinite-table.svg?style=flat)](https://www.npmjs.com/package/react-infinite-table)
![NPM license](https://img.shields.io/npm/l/react-infinite-table.svg?style=flat)
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
- 🔜 Row selection
- 🔜 Rows with different heights / free height
- 🎉 Use the HTML `<table>` tags!


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
  height={200}
  rowHeight={30}
  rows={rows}
  columns={columns}
  headerCount={1}
  footerCount={1}
  noRowsRenderer={() => 'No rows'}
  // keep the first column fixed:
  fixedColumnsLeftCount={1}
  // infinite load:
  infiniteLoadBeginEdgeOffset={150}
  isInfiniteLoading={true/false}
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

This packages has been inspired by some existing library dealing with tables in `react`.

Comparison of the packages

| Feature        | **`react-infinite-table`** | `react-virtualized` |
| -------------- |:---:|:---:|
| Use HTML table tags: `<table>`, `<tr>`, `<td>`, ... | ✅ | ❌ |
| Fixed columns  | ✅ | ❌ |
| Fixed header   | ✅ | ✅ |
| Fixed footer   | ✅ | ❌ |
| Column resize (by dragging)  | ✅ | ❌ |
| Column reorder (by dragging) | ✅ | ❌ |
| No use of `javascript` to sync scroll between fixed columns/rows | ✅ | ❌ |


## Dependencies

_react-infinite-table_ has very few dependencies that are managed by `npm`.

The following peer dependencies must be specified by your project in order to avoid version conflicts:
[`react`](https://www.npmjs.com/package/react),
[`react-dom`](https://www.npmjs.com/package/react-dom).
NPM will not automatically install these for you but it will show you a warning message with instructions on how to install them.


## Documentation

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
