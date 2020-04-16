/* @flow */

// This module provides a centralized place for
// runtime checking that the props passed to React Infinite
// make the minimum amount of sense.

var React = global.React || require('react');
var _isFinite = require('lodash.isfinite');

module.exports = function(props) {
  var rie = 'Invariant Violation: ';
  if (!props.height) {
    throw new Error(
      rie +
        'height must be provided.'
    );
  }

  if (!(_isFinite(props.rowHeight) || typeof props.rowHeight === 'function')) {
    throw new Error(
      rie +
        'You must provide either a number or a function as the rowHeight.'
    );
  }  
};
