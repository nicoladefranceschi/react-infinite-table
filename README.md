React Infinite Table
===

[![NPM version](https://img.shields.io/npm/v/react-infinite-table.svg?style=flat)](https://www.npmjs.com/package/react-infinite-table)
![NPM license](https://img.shields.io/npm/l/react-infinite-table.svg?style=flat)
[![npm bundle size](https://img.shields.io/bundlephobia/min/react-infinite-table)](https://bundlephobia.com/result?p=react-infinite-table@latest)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-infinite-table)](https://bundlephobia.com/result?p=react-infinite-table@latest)
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
- ✅ Multiple rows selection
  * ⌘/Ctrl + Click: toggle selection
  * ⇧ + Click: select all the rows between the previously clicked row and the currently clicked row.
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
  fixedColumnsCount={1}
  // row selection
  rowIdKey='id'
  selectedRows={this.state.selectedRows}
  onSelectionChange={selectedRows => { this.setState({selectedRows}) }}
  canSelectMultipleRows={true|false}
  // infinite load:
  infiniteLoadBeginEdgeOffset={150}
  isInfiniteLoading={true|false}
  onInfiniteLoad={() => { /* fetch your data ... */ }}
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
| Row selection  | ✅ | ❌ | ✅ |
| No use of `javascript` to sync scroll between fixed columns/rows | ✅ | ❌ | ❌ |
| Size | ![npm bundle size](https://img.shields.io/bundlephobia/min/react-infinite-table) <br/> ![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-infinite-table) | ![npm bundle size](https://img.shields.io/bundlephobia/min/react-virtualized) <br/>  ![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-virtualized) | ![npm bundle size](https://img.shields.io/bundlephobia/min/react-base-table) <br/> ![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-base-table) |



## Dependencies

_react-infinite-table_ has very few dependencies that are managed by `npm`.

The following peer dependencies must be specified by your project in order to avoid version conflicts:
[`react`](https://www.npmjs.com/package/react),
[`react-dom`](https://www.npmjs.com/package/react-dom).
NPM will not automatically install these for you but it will show you a warning message with instructions on how to install them.


## Documentation

### Table Prop Types

`Table` is the main component and it's responsible of rendering your table.

| Property          | Type      | Required? | Description       |
| :---------------- | :-------- | :-------: | :---------------- |
| height            | Number    |     ✓     | The height of the table. If you want the table to take the height of the container, you should have a look at the [`AutoSizer` component](https://github.com/bvaughn/react-virtualized-auto-sizer) |
| overscanSize      | Number    |           | How much you want to render above/below the visible bounds of the table (in pixels). Default: `overscanSize: 500` |
| rowHeight         | Number    |     ✓     | A fixed row height _(TODO: planning to allow undefined, and each row will auto size to fit content!)_ |
| rows              | Array     |     ✓     | An array of data, one object for each row. There are no required keys, but if you want to use the "row selection" feature, an unique "row id" will be needed. |
| columns           | [Column](#column-prop-types) |     ✓     | One or more columns describing the data displayed in this table |
| headerCount       | Number    |           | Number of header rows in the `<thead>` section of the table. Default: `headerCount: 1` |
| footerCount       | Number    |           | Number of footer rows in the `<tfoot>` section of the table. Default: `footerCount: 0` |
| fixedColumnsCount | Number    |           | Number of columns to keep fixed on the left of the table while scrolling horizontally. Default: `fixedColumnsCount: 0` |
| noRowsRenderer    | Function  |           | Callback used to render placeholder content when the number of rows is 0. Default: `noRowsRenderer: undefined` - the table will be empty. |
| rowIdKey          | String    |           | The key used to extract the id of a row from the row's data object. Needed if row selection is enabled. |
| selectedRows      | Object    |           | An object with the selected rows' ids as key, and `true` as value. Example: `{ 1: true, 2: true, 5: true }` - the rows with ids 1, 2 and 5 will be selected. Default: `selectedRows: undefined` - no selected rows. |
| canSelectMultipleRows | Boolean |         | Whether or not multiple rows can be selected. If true, using _⌘/Ctrl + Click_ on a row, the row will be selected/deselected, and using _⇧ + Click_ will select all the rows between the previously selected row and the clicked row. Default: `canSelectMultipleRows: false` |
| onSelectionChange | Function  |           | The callback to call when the selection changes. For example, use `(selectionRows) => { this.setState({ selectionRows }) }` to update your state to reflect the new selection. Default: `onSelectionChange: undefined` - Row selection is not allowed. |
| infiniteLoadBeginEdgeOffset | Number |    | How far from the bottom of the table we call the `onInfiniteLoad` function to fetch the new data. Default: `infiniteLoadBeginEdgeOffset: undefined` - Infinite load is not enabled. |
| onInfiniteLoad    | Function  |           | The callback used to start a fetch operation to get new rows. You should use this callback to start the async loading of new data and then update the `rows` props with the new rows. Default: `() => {}` |
| getLoadingSpinner | Function  |           | Callback used to render a loading message/spinner during data loading. Default: ` () => <div />` |
| isInfiniteLoading | Boolean   |           | Set to true if you want the show the loading spinner. Default: `isInfiniteLoading: undefined`  |
| displayBottomUpwards | Boolean |          | Whether or not to show the rows starting at the bottom, like in a chat/messaging application. Default: `displayBottomUpwards: false` |
| className         | String    |           | A class to add to the table container `<div>`. Default: `className: undefined` |
| tableClassName    | String    |           | A class to add to the `<table>` node. Default: `tableClassName: undefined` |
| style             | Object    |           | Passthrough prop to the table container `<div>`. Default: `style: undefined` |
| onColumnWidthChange | Function |          | Callback called when a column's width has changed. You should update the Column definition accordingly. `(columnIndex, width) => { /* update columns... */ }`. Default: `onColumnWidthChange: undefined` - Column's can't be resized. |
| onColumnOrderChange | Function |          | Callback called when a column order position is changed from `fromIndex` to `toIndex`. You should update the Columns array accordingly. `(fromIndex, toIndex) => { /* update columns... */ }`. Default: `onColumnOrderChange: undefined` - Column's can't be reordered. <br/> You can use the helper function `reorderColumns`. [Learn more](#reordercolumns) |


### Column Prop Types

| Property          | Type      | Required? | Description       |
| :---------------- | :-------- | :-------: | :---------------- |
| width             | Number    |     ✓     | The width of the column in pixels. |
| cellRenderer      | Function  |     ✓     | Callback responsible for rendering a cell's contents. [Learn more](#cellrenderer) |
| headerRenderer    | Function  |           | Optional callback responsible for rendering a column's header column. [Learn more](#headerrenderer) |
| footerRenderer    | Function  |           | Optional callback responsible for rendering a column's footer column. [Learn more](#footerrenderer) |


#### cellRenderer

Callback responsible for rendering a cell's contents.
It should implement the following signature:

```jsx
({
  key: string,
  className: string,
  columnIndex: number,
  column: object,
  rowIndex: number,
  rowData: object
}) => {
  return <td key={key} className={className}>{/*...*/}</td>
}
```

You should return a `<td>` node (or a `Component` that renders a `td`) since this node will be rendered in the `tbody > tr` section of the table.
Always pass the `key` and `className` props.


#### headerRenderer

Callback responsible for rendering a cell's header column.
It should implement the following signature:

```jsx
({
  key: string,
  className: string,
  columnIndex: number,
  column: object
}) => {
  return <th key={key} className={className}>{/*...*/}</th>
}
```

You should return a `<th>` node (or a `Component` that renders a `th`) since this node will be rendered in the `thead > tr` section of the table.
Always pass the `key` and `className` props.


#### footerRenderer

Callback responsible for rendering a cell's footer column.
It should implement the following signature:

```jsx
({
  key: string,
  className: string,
  columnIndex: number,
  column: object
}) => {
  return <td key={key} className={className}>{/*...*/}</td>
}
```

You should return a `<td>` node (or a `Component` that renders a `td`) since this node will be rendered in the `tfoot > tr` section of the table.
Always pass the `key` and `className` props.


### Utils

#### reorderColumns

This function is provided as an helper to update the `columns` array after the columns have been reorderer.

```jsx
import { reorderColumns } from 'react-infinite-table'

// ...

const newColumns = reorderColumns(oldColumns, fromIndex, toIndex)
```


### Style

You should import the `react-infinite-table/dist/style.css` file, or if you use `scss`, you can import the styles as follows:

```scss
@import "~react-infinite-table/dist/style.scss";
```

If you want to use the "row selection" feature, you should apply a style on the `tr.tr-selected` rows as follows:

```css
.react-infinite-table tbody tr.tr-selected td {
  background-color: #007bff;
  border-color: #007bff;
  color: #ffffff;
}
```

If you use `bootstrap`, you need to apply the following fixes: 

```scss
@import "~bootstrap/scss/bootstrap.scss";

// For "Striped" Tables
// by default, bootstrap apply the background color to the <tr>
// and it's a semi-transparent color.

// we need an opaque color
$table-accent-bg: #F2F2F2;

// and we need to apply the backgrounds on td, not on tr!
.table-striped {
  tbody tr:nth-of-type(#{$table-striped-order}) {
    background-color: unset;
  }
  tbody tr:nth-of-type(#{$table-striped-order}) td {
    background-color: $table-accent-bg;
  }
}

// For "Bordered" Tables
// we need to apply the table border on the "wrapper" and not on 
// the <table> so that it is not hidden when scrolling.
.react-infinite-table {
  .table-bordered {
    border: none;
  }
  .react-infinite-table-wrapper {
    border: $table-border-width solid $table-border-color;
  }
}
```


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
