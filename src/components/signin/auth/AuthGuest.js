import React, { Component } from 'react'
import Translate from 'components/translate/Translate'
import AuthHoc from './AuthHoc'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { ContentBox, ContentBody } from 'components/common/dialog/content'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { AUTH_TYPES } from 'constants/misc'
import Helper from 'helpers/miscHelpers'



class AuthGuest extends Component {
    authOnServer = () => {
        let mode = AUTH_TYPES.GUEST.signType 
        let authType = AUTH_TYPES.GUEST.name
        // HARDCODED, TO REMOVE LATER
        let addr = '0x6775657374677565737467756573746775657374'
        this.props.authOnServer({ mode, addr, authType })
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.log(err)
                this.setState({ waitingLedgerAction: false, waitingAddrsData: false })
                this.props.actions.addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_AUTH_LEDGER', { args: [(err || {}).error || err] }), timeout: 5000 })
            })
    }

    render() {
        const { t, classes } = this.props
        console.log(this.props)
        return (
            <ContentBox className={classes.tabBox} >
                <ContentBody>
                    <Typography paragraph variant='subheading'>
                        {t('GUEST_INFO')}
                    </Typography>
                    <Button
                        onClick={this.authOnServer}
                        variant='raised'
                        color='primary'
                    >
                        {t('AUTH_CONNECT_AS_GUEST')}
                    </Button>
                </ContentBody>
            </ContentBox>
        )
    }
}

export default Translate(AuthHoc(withStyles(styles)(AuthGuest)))