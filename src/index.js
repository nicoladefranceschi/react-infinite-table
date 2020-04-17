
export { Table } from './Table'

export function reorderColumns (columns, fromIndex, toIndex) {
  const newColumns = [...columns]
  const column = newColumns[fromIndex]
  newColumns.splice(fromIndex, 1)
  newColumns.splice(toIndex, 0, column)
  return newColumns
}
