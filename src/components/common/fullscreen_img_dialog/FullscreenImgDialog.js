import React, { Component } from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import Img from 'components/common/img/Img'

class FullscreenImgDialog extends Component {
    render() {
        const { classes } = this.props

        return (
            <span>
                <Dialog
                    open={this.props.active}
                    type={this.props.type || 'normal'}
                    maxWidth={false}
                    classes={{ paper: classes.dialog }}
                >
                    <DialogContent>
                        <Img src={this.props.imgSrc} alt={'Fullscreen version'} className={classes.dialogImage}/>
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

export default withStyles(styles)(FullscreenImgDialog)