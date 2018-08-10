
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

export class FullscreenImgDialog extends Component {
    render() {
        return (
            <span>
                <Dialog
                    open={this.props.active}
                    type={this.props.type || 'normal'}
                    maxWidth={false}
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
                    </DialogActions>
                </Dialog>
            </span>
        )
    }
}

export default connect()(withStyles(styles)(FullscreenImgDialog))
