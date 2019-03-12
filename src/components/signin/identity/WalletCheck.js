import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Translate from 'components/translate/Translate'
import Chip from '@material-ui/core/Chip'
import Helper from 'helpers/miscHelpers'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { getRandomMnemonic } from 'services/wallet/wallet'

class WalletCheck extends Component {

    constructor(props, context) {
        super(props, context)

        const words = props.identity.mnemonic.split(' ')
        this.state = {
            words: props.identity.mnemonic.split(' '),
            shuffledWords: Helper.shuffleArray(words)
                .map(word => { return { word: word, used: false } })
        }
    }

    componentDidMount() {
        this.props.validate('mnemonicChecked', {
            isValid: !!this.props.identity.mnemonicChecked,
            err: { msg: 'ERR_MNEMONIC_NOT_CHECKED' },
            dirty: false
        })
    }

    verifyMnemonic = () => {
        this.props.handleChange('mnemonicChecked', true)
        this.props.validate('mnemonicChecked', {
            isValid: true
        })
    }

    ShuffledWords = () => {
        return (
            <div>
                {this.state.shuffledWords.map((word, index) =>
                    <Chip
                        color='primary'
                        clickable
                        key={index}
                        label={word.word}
                        disabled={word.used}
                    />
                )}
            </div>
        )
    }

    render() {
        const { t, identity } = this.props
        return (
            <div>
                <this.ShuffledWords />
            </div>
        )
    }
}

WalletCheck.propTypes = {
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

const IdentityWalletCheckStep = IdentityHoc(WalletCheck)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(withStyles(styles)(IdentityWalletCheckStep)))