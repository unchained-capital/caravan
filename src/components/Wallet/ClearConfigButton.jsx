import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@material-ui/core';

import { CARAVAN_CONFIG } from './constants'

const ClearConfigButton = ({ onClearFn, ...otherProps }) => {
  const handleClick = e => {
    e.preventDefault()
    if (sessionStorage) sessionStorage.removeItem(CARAVAN_CONFIG)
    onClearFn(e)
  }

  return (
    <Button onClick={e => handleClick(e)} {...otherProps}>Clear Config</Button>
  );
}

ClearConfigButton.propTypes = {
  onClearFn: PropTypes.func.isRequired,
}

export default ClearConfigButton