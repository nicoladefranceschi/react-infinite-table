export default function (props) {
  var rie = 'Invariant Violation: '
  if (!props.height) {
    throw new Error(
      rie +
        'height must be provided.'
    )
  }

  if (!(typeof props.rowHeight === 'number' || typeof props.rowHeight === 'function')) {
    throw new Error(
      rie +
        'You must provide either a number or a function as the rowHeight.'
    )
  }
}
