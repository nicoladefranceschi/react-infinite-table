import React from 'react'
import PropTypes from 'prop-types'

export default class Cell extends React.Component {
  static propTypes = {
    renderer: PropTypes.func.isRequired,
    columnIndex: PropTypes.number,
    column: PropTypes.object,
    rowIndex: PropTypes.number,
    rowData: PropTypes.object,
    className: PropTypes.string
  }

  render () {
    const {
      renderer,
      columnIndex,
      column,
      rowIndex,
      rowData,
      className
    } = this.props
    return renderer({
      columnIndex,
      column,
      rowIndex,
      rowData,
      className
    })
  }
}
