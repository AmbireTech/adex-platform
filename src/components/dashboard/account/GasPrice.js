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
import { web3 } from 'services/smart-contracts/ADX'
import { getCurrentGasPrice } from 'services/smart-contracts/actions/eth'

const DEFAULT_GAS_PRICE = 20000000000 // 20GWei

// TODO: translations
const pricesMap = [
    { ratio: 0.75, label: 'Very slow (Maybe not)' },
    { ratio: 0.85, label: 'Slow' },
    { ratio: 1, label: 'Normal' },
    { ratio: 1.2, label: 'Fast' },
    { ratio: 1.5, label: 'Very fast' }
]

class GasPrice extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            gasPrices: this.mapGasPrices(DEFAULT_GAS_PRICE)
        }
    }

    mapGasPrices = (price) => {
        let prices = pricesMap.map((pr) => {
            let val = pr.ratio * price
            let inGwei = web3.utils.fromWei(val.toString(), 'Gwei')

            return { value: val, label: inGwei + ' Gwei - ' + pr.label }
        })

        return prices
    }

    getGasPrices = () => {
        getCurrentGasPrice()
            .then((price) => {
                let prices = this.mapGasPrices(price)
                this.setState({ gasPrices: prices })
            })
    }

    componentWillMount() {
        this.getGasPrices()
    }

    changeGasPrice = (val) => {
        let settings = { ...this.props.account._settings }
        settings.gasPrice = val
        this.props.actions.updateAccount({ ownProps: { settings: settings } })
    }

    render() {
        let account = this.props.account
        let settings = account._settings
        let gasPrice

        if (settings && settings.gasPrice) {
            gasPrice = settings.gasPrice
        } else {
            gasPrice = this.state.gasPrices[3].value
        }

        return (
            <Dropdown
                theme={theme}
                auto={false}
                label='GAS_PRICE_LABEL'
                onChange={this.changeGasPrice}
                source={this.state.gasPrices}
                value={gasPrice}
            />
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
