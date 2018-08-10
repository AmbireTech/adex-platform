import React, { Component } from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'

export class FullscreenImgDialog extends Component {
    render() {
        return (
            <span>
                <Dialog
                    open={this.props.active}
                    type={this.props.type || 'normal'}
                    maxWidth={false}
                >
                    <DialogContent >
                        <img src={this.props.imgSrc} alt={'Fullscreen version'}/>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={this.props.handleToggle}
                            color="primary"
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </span>
        )
    }
}
