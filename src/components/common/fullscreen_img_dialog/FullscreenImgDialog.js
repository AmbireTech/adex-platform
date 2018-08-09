
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import ValidImageHoc from 'components/dashboard/forms/ValidImageHoc'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

export class FullscreenImgDialog extends Component {
    render() {
        return (
            <span>
                <Dialog
                    open={this.props.active}
                    type={this.props.type || 'normal'}
                >
                    <DialogTitle>
                    </DialogTitle>
                    <DialogContent >
                        <img src={this.props.imgSrc} alt={'Fullscreen version'}/>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={this.props.handleToggle}
                            color="primary"
                        >
                            {'Close'}
                        </Button>
                        <Button>
                        </Button>
                    </DialogActions>
                </Dialog>
            </span>
        )
    }
}

function mapStateToProps(state) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account
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
)(ValidItemHoc(ValidImageHoc(withStyles(styles)(FullscreenImgDialog))))
