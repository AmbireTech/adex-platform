import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'
// import classnames from 'classnames'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import CheckIcon from '@material-ui/icons/Check'
import SaveIcon from '@material-ui/icons/Save'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

// NOTE: Separate component to track the validations and spinner to avoid rerender of item top level components
class SaveBtn extends Component {

    render() {
        let { t, spinner, classes, success, dirtyProps, save, validations, validationId, className, spinnerId, ...other } = this.props
        return (

            <div className={classes.position}>
                <div className={classes.wrapper}>
                    <Button
                        variant="fab"
                        color="primary"
                        // className={buttonClassname}
                        onClick={() => save()}
                        disabled={spinner || !dirtyProps.length || !!Object.keys(validations[validationId] || {}).length}
                        {...other}
                    >
                        {/*TODO: Success */}
                        {success ? <CheckIcon /> : <SaveIcon />}
                    </Button>
                    {!!spinner && <CircularProgress size={68} className={classes.fabProgress} />}
                </div>
            </div>
        )
    }
}

SaveBtn.propTypes = {
    spinnerId: PropTypes.string,
    validationId: PropTypes.string,
    itemId: PropTypes.string,
    validations: PropTypes.object
}

function mapStateToProps(state, props) {
    // const persist = state.persist
    const memory = state.memory
    return {
        spinner: memory.spinners[props.spinnerId],
        validations: memory.validations
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(withStyles(styles)(SaveBtn)))
