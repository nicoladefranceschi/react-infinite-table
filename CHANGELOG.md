## Changelog

##### 1.3.0

- Remove `key` from renderer callbacks, the `key` is handled internally
- Changed the way React `key` is computed for `<tr>`s:
  - if the row was render before, use the same key
  - otherwise, try to reuse an existing row that was removed from the visible window

##### 1.2.3

- Added prop: use `fillTableWidth = true` to grow columns to fill the width of the table

##### 1.2.2

- Fix: handle scroll during column dragging

##### 1.2.1

- .npmignore

##### 1.2.0

- Remove dependency on `react-draggable`
- Refactoring

##### 1.1.2

- Bug fixes

##### 1.1.1

- Passthrough style prop to the table container `<div>`

##### 1.1.0

- Rename `fixedColumnsLeftCount` prop to `fixedColumnsCount`
- Documentation

##### 1.0.5

- Row selection

##### 1.0.4

- Fixes

##### 1.0.0

- Initial release.