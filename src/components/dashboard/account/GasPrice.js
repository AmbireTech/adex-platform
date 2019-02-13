import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Dropdown from 'components/common/dropdown'
import Translate from 'components/translate/Translate'
import { web3Utils } from 'services/smart-contracts/ADX'
import { getGasData, DEFAULT_DATA } from 'services/eth/gas'
import { styles } from './styles'

import { withStyles } from '@material-ui/core/styles'

// TODO: Make common component
class GasPrice extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            gasPrices: null
        }
    }

    mapGasPrices = (gasData, t) => {
        let prices = Object.keys(gasData).map((key) => {
            let pr = gasData[key]
            let inGwei = pr.price
            let inWei = web3Utils.toWei(inGwei.toString(), 'Gwei')

            // TODO: Translations
            return { value: inWei, label: t('GAS_PRICE_OPTION_LABEL', { args: [inGwei, 'Gwei', pr.wait] }) }
        })

        return prices
    }

    getGasPrices = () => {
        getGasData()
            .then((gasData) => {
                let prices = this.mapGasPrices(gasData, this.props.t)
                this.setState({ gasPrices: prices })
            })
    }

    componentWillMount() {
        this.setState({ gasPrices: this.mapGasPrices(this.props.account._settings.gasData || DEFAULT_DATA, this.props.t) })
        // this.getGasPrices()
        // Use interval check for that - services/store-data/gas
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
            gasPrice = this.state.gasPrices[1].value
        }

        console.log(gasPrice)
        return (
            <span>
                <Dropdown
                    auto={false}
                    label={this.props.t('GAS_PRICE_LABEL')}
                    onChange={this.changeGasPrice}
                    source={this.state.gasPrices}
                    value={gasPrice}
                    disabled={this.props.disabled}
                    htmlId='get-gas-price-dd'
                    name='gasPrice'
                />
            </span>
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
)(Translate(withStyles(styles)(GasPrice)))
