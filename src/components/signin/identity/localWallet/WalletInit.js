import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import WalletHoc from './WalletHoc'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { getRandomMnemonic } from 'services/wallet/wallet'

class WalletInit extends Component {

    constructor(props, context) {
        super(props, context)
        this.state = {
            mnemonic = props.wallet.mnemonic
        }
    }

    render() {
        return (
            <div>
                <Button
                    onClick={() => this.setState({mnemonic: getRandomMnemonic()})}
                    variant='raised'
                    color='primary'
                    disabled={this.state.waitingAddrsData}
                >
                    {t('WALLET_GET_RANDOM_MNEMONIC')}
                </Button>
                <Typography paragraph variant='subheading'>
                    {t('METAMASK_INFO')}
                </Typography>
            </div>
        )
    }
}

WalletInit.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    let persist = state.persist
    let memory = state.memory
    return {
        account: persist.account,
        wallet: memory.wallet
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const WalletInitStep = WalletHoc(WalletInit)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(withStyles(styles)(WalletInitStep)))