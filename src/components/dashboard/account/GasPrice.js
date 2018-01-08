import React from 'react'
import theme from './theme.css'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import moment from 'moment'
// import { Button, IconButton } from 'react-toolbox/lib/button'
import Slider from 'react-toolbox/lib/slider'
import Dropdown from 'react-toolbox/lib/dropdown'
import Translate from 'components/translate/Translate'
// import Img from 'components/common/img/Img'
import { web3 } from 'services/smart-contracts/ADX'
import { MULT } from 'services/smart-contracts/constants'
// import NewItemWithDialog from 'components/dashboard/forms/NewItemWithDialog'
// import Input from 'react-toolbox/lib/input'

// console.log('actions', actions)
const G_MULT = 1000000000
const prices = [
    { value: 20 * G_MULT, label: '20 Gwei - Very slow' },
    { value: 25 * G_MULT, label: '25 Gwei - Very slow' },
    { value: 30 * G_MULT, label: '30 Gwei - Slow' },
    { value: 35 * G_MULT, label: '35 Gwei - Slow' },
    { value: 40 * G_MULT, label: '40 Gwei - Normal' },
    { value: 45 * G_MULT, label: '45 Gwei - Normal' },
    { value: 50 * G_MULT, label: '50 Gwei - Fast' },
    { value: 55 * G_MULT, label: '55 Gwei - Fast' },
    { value: 60 * G_MULT, label: '60 Gwei - Fast' },
]

class GasPrice extends React.Component {
    changeGasPrice = (val) => {
        this.props.actions.updateAccount({ ownProps: { gasPrice: val } })
    }

    render() {
        let account = this.props.account
        let stats = account._stats || {}

        if (!stats) {
            return null
        }

        return (
            <Dropdown
                theme={theme}
                auto={false}
                label='Operations GAS Price'
                onChange={this.changeGasPrice}
                source={prices}
                value={account.gasPrice}
            />
            // <Slider pinned snaps min={20} max={60} step={5} value={account.gasPrice} onChange={this.changeGasPrice} />
        )
    }
}

GasPrice.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    let persist = state.persist
    // let memory = state.memory
    let account = persist.account
    return {
        account: account
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
)(Translate(GasPrice))
