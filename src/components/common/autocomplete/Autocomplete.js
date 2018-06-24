import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import DownshiftMultiple from './DownshiftMultiple'
import DownshiftSingle from './DownshiftSingle'

function Autocomplete(props) {
    const { classes, source, multiple, ...rest } = props

    return (
        <div >
            {multiple ?
                <DownshiftMultiple classes={classes} source={source} {...rest} />
                :
                <DownshiftSingle classes={classes} source={source} {...rest} />
            }
        </div>
    )
}

Autocomplete.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(Autocomplete)