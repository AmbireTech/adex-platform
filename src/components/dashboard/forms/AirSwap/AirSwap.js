import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { cfg } from 'services/smart-contracts/ADX'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListDivider from '@material-ui/core/Divider'
import Translate from 'components/translate/Translate'
import WithDialog from 'components/common/dialog/WithDialog'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import AirSwapIcon from 'components/common/icons/AirSwap'
import AirSwapWithTxtIcon from 'components/common/icons/AirSwapWithTxt'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import { getAuthLogo } from 'helpers/logosHelpers'
const AirSwap = window.AirSwap

const AirSwapDialogBody = ({ t, onBuy, onSell, classes, account }) => {
    return (
        <div className={classes.paper}>
            <div>
                <List
                // dense={true}
                >
                    <ListDivider />
                    <ListItem  >
                        <ListItemText
                            primary={t('AIRSWAP_INFO_MSG')}
                            secondary={
                                <Anchor
                                    className={classes.iconLink}
                                    href='https://www.airswap.io/'
                                    target='_blank'
                                    style={{ color: 'inherit' }}
                                >
                                    <AirSwapWithTxtIcon className={classes.linkIcon} />
                                </Anchor>
                            }
                        />
                    </ListItem>
                    <ListDivider />
                    <ListItem  >
                        <ListItemText
                            primary={t('AIRSWAP_WARNING_MSG')}
                            secondary={t('AIRSWAP_WARNING')}
                            primaryTypographyProps={{ color: 'primary' }}
                            secondaryTypographyProps={{ color: 'primary' }}
                        />
                    </ListItem>
                    <ListDivider />
                    <ListItem  >
                        <ListItemText
                            primary={account._addr}
                            secondary={t('CURRENT_AUTH_ADDR')}
                        />
                    </ListItem>
                    <ListDivider />
                    <ListItem  >
                        <ListItemText
                            primary={<Img src={getAuthLogo(account._authMode.authType)} style={{ maxHeight: 32, width: 'auto' }} />}
                            secondary={t('CURRENT_AUTH_METOHD')}
                        />
                    </ListItem>
                </List>
            </div>
            <div
                className={classes.btns}
            >
                <Button
                    color='primary'
                    variant='contained'
                    size='large'
                    onClick={onBuy}
                >
                    <AirSwapIcon
                        className={classes.btnIconLeft}
                    />
                    {t('BUY_ADX_AIRSWAP')}
                </Button>
                <Button
                    color='primary'
                    variant='contained'
                    size='large'
                    onClick={onSell}
                >
                    <AirSwapIcon
                        className={classes.btnIconLeft}
                    />
                    {t('SELL_ADX_AIRSWAP')}
                </Button>
            </div>
        </div >
    )
}

const AirSwapDialog = WithDialog(AirSwapDialogBody)

class AirSwapWidget extends Component {
    componentWillMount() {
    }

    onSwap = ({ mode }) => {
        const { t, actions } = this.props
        AirSwap.Trader.render({
            env: 'production',
            mode: mode,
            token: cfg.addr.token,
            onCancel: () => {
                actions.addToast({ type: 'warning', action: 'X', label: t('TRANSACTION_CANCELED'), timeout: 5000 })
            },
            onComplete: (transactionId) => {

                const txData = {
                    trHash: transactionId,
                    trMethod: `TX_MTD_AIRSWAP_${mode.toUpperCase()}`
                }
                actions.addWeb3Transaction({ trans: txData, addr: 'GET_THE_ADDR' })
                actions.addToast({ type: 'accept', action: 'X', label: t('TRANSACTION_SENT_MSG', { args: [transactionId] }), timeout: 5000 })
            }
        }, 'body')
    }

    render() {
        return (
            <AirSwapDialog
                classes={this.props.classes}
                btnLabel='BUY_SELL_ADX_AIRSWAP_BTN'
                title='BUY_SELL_ADX_AIRSWAP_DIALOG_TITLE'
                variant='contained'
                size='small'
                color='default'
                icon={<AirSwapIcon />}
                onBuy={() => this.onSwap({ mode: 'buy' })}
                onSell={() => this.onSwap({ mode: 'sell' })}
                account={this.props.account}
            />
        )
    }
}

AirSwapWidget.propTypes = {
    actions: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    const { persist } = state

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
)(Translate(withStyles(styles)(AirSwapWidget)))
