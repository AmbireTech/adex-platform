import React from 'react'
import { Layout, Panel, NavDrawer } from 'react-toolbox/lib/layout'
import SideNav from './side_nav/SideNav'
import TopBar from './top_bar/TopBarMui' //'./top_bar/TopBar'
import theme from './theme.css'
import { Route, Switch, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Campaign from 'components/dashboard/containers/Campaign'
import Channel from 'components/dashboard/containers/Channel'
import DashboardStats from 'components/dashboard/containers/DashboardStats'
import Unit from 'components/dashboard/containers/Unit'
import Slot from 'components/dashboard/containers/Slot'
import Items from 'components/dashboard/containers/Items'
import Transactions from 'components/dashboard/containers/Transactions'
import UnitBids from 'components/dashboard/containers/UnitBids'
import SlotBids from 'components/dashboard/containers/SlotBids'
import {
    AdUnit as AdUnitModel,
    AdSlot as AdSlotModel,
    Campaign as CampaignModel,
    Channel as ChannelModel
} from 'adex-models'
import Account from './account/Account'
import Translate from 'components/translate/Translate'
import { NewUnitDialog, NewCampaignDialog, NewSlotDialog, NewChannelDialog } from './forms/NewItems'
import { items as ItemsConstants } from 'adex-constants'
import checkTransactions from 'services/store-data/transactions'
import { getUserItems } from 'services/store-data/items'
import { getAddrBids } from 'services/store-data/bids'
import checkGasData from 'services/store-data/gas'
import { SORT_PROPERTIES_ITEMS, SORT_PROPERTIES_COLLECTION, FILTER_PROPERTIES_ITEMS } from 'constants/misc'
import Helper from 'helpers/miscHelpers'
import scActions from 'services/smart-contracts/actions'


import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import classnames from 'classnames'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'

const { getAccountStats } = scActions
const { ItemsTypes } = ItemsConstants

const drawerWidth = 280

const styles = theme => ({
    layout: {
        flexGrow: 1,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        // width: '100%',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing.unit * 7,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing.unit * 9,
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
        // position: 
    }
})

const PrivateRoute = ({ component: Component, auth, ...other }) => {
    return (
        <Route
            {...other}
            render={(props) => auth === true //|| true
                ? <Component {...props} />
                : <Redirect to={{ pathname: '/', state: { from: props.location } }} />}
        />
    )
}

class Dashboard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            drawerActive: false,
            drawerPinned: false,
            sidebarPinned: false
        }
    }

    componentWillUnmount() {
        checkTransactions.stop()
        checkGasData.stop()
    }

    componentWillMount(nextProps) {
        this.props.actions.updateNav('side', this.props.match.params.side)
        checkTransactions.start()
        checkGasData.start()
        getUserItems({ authSig: this.props.account._authSig })
            .catch((err) => {
                this.props.actions.addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_AUTH_METAMASK', { args: [Helper.getErrMsg(err)] }), timeout: 5000 })
            })

        getAddrBids({ authSig: this.props.account._authSig })

        getAccountStats({ _addr: this.props.account._addr, authType: this.props.account._authMode.authType })
            .then((stats) => {
                this.props.actions.updateAccount({ ownProps: { stats: stats } })
            })
    }

    componentWillUpdate(nextProps) {
        if (nextProps.match.params.side !== this.props.match.params.side) {
            this.props.actions.updateNav('side', nextProps.match.params.side)
        }
    }

    toggleDrawerActive = () => {
        this.setState({ drawerActive: !this.state.drawerActive })
    }

    toggleDrawerPinned = () => {
        this.setState({ drawerPinned: !this.state.drawerPinned })
    }

    toggleSidebar = () => {
        this.setState({ sidebarPinned: !this.state.sidebarPinned })
    }

    renderAdUnits = () => {
        return (
            <Items
                header={this.props.t('ALL_UNITS')}
                viewModeId='rowsViewUnits'
                itemsType={ItemsTypes.AdUnit.id}
                newItemBtn={() => <NewUnitDialog floating accent />}
                objModel={AdUnitModel}
                sortProperties={SORT_PROPERTIES_ITEMS}
                filterProperties={FILTER_PROPERTIES_ITEMS}
            />
        )
    }

    renderCampaigns = () => {
        return (
            <Items
                header={this.props.t('ALL_CAMPAIGNS')}
                viewModeId='rowsViewCampaigns'
                itemsType={ItemsTypes.Campaign.id}
                newItemBtn={() => <NewCampaignDialog floating accent />}
                objModel={CampaignModel}
                sortProperties={SORT_PROPERTIES_COLLECTION}
            // filterProperties={FILTER_PROPERTIES_ITEMS}
            />
        )
    }

    renderAdSlots = () => {
        return (
            <Items
                header={this.props.t('ALL_SLOTS')}
                viewModeId='rowsViewSlots'
                itemsType={ItemsTypes.AdSlot.id}
                newItemBtn={() => <NewSlotDialog floating accent />}
                objModel={AdSlotModel}
                sortProperties={SORT_PROPERTIES_ITEMS}
                filterProperties={FILTER_PROPERTIES_ITEMS}
            />
        )
    }

    renderChannels = () => {
        return (
            <Items
                header={this.props.t('ALL_CHANNELS')}
                viewModeId='rowsViewChannels'
                itemsType={ItemsTypes.Channel.id}
                newItemBtn={() => <NewChannelDialog floating accent />}
                objModel={ChannelModel}
                sortProperties={SORT_PROPERTIES_COLLECTION}
            // filterProperties={FILTER_PROPERTIES_ITEMS}
            />
        )
    }

    handleDrawerOpen = () => {
        this.setState({ open: true });
    }

    handleDrawerClose = () => {
        this.setState({ open: false });
    }

    render() {
        const side = this.props.side || this.props.match.params.side
        const classes = this.props.classes

        return (
            <div className={classes.layout} >
                <TopBar side={side} open={this.state.open} handleDrawerOpen={this.handleDrawerOpen} />
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: classnames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
                    }}
                    open={this.state.open}
                >
                    <div className={classes.toolbar}>
                        <IconButton onClick={this.handleDrawerClose}>
                            {theme.direction === 'rtl' ? <Icon>chevron_right</Icon> : <Icon>chevron_left</Icon>}
                        </IconButton>
                    </div>
                </Drawer>
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <Panel theme={theme} >
                        <Switch locatiom={this.props.location}>
                            TODO: Make things dynamic if easier
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/advertiser/campaigns' component={this.renderCampaigns} />
                            <PrivateRoute auth={this.props.auth} exact path='/dashboard/advertiser/units' component={this.renderAdUnits} />
                            <PrivateRoute auth={this.props.auth} exact path='/dashboard/advertiser/Campaign/:itemId' component={Campaign} />
                            <PrivateRoute auth={this.props.auth} exact path='/dashboard/advertiser/AdUnit/:itemId' component={Unit} />
                            <PrivateRoute auth={this.props.auth} exact path='/dashboard/advertiser/bids/:tab?' component={UnitBids} />

                            <PrivateRoute auth={this.props.auth} exact path='/dashboard/publisher/channels' component={this.renderChannels} />
                            <PrivateRoute auth={this.props.auth} exact path='/dashboard/publisher/slots' component={this.renderAdSlots} />
                            <PrivateRoute auth={this.props.auth} exact path='/dashboard/publisher/Channel/:itemId' component={Channel} />
                            <PrivateRoute auth={this.props.auth} exact path='/dashboard/publisher/AdSlot/:itemId' component={Slot} />
                            <PrivateRoute auth={this.props.auth} exact path='/dashboard/publisher/bids/:tab?' component={SlotBids} />

                            <PrivateRoute auth={this.props.auth} exact path={'/dashboard/:side/account'} component={Account} />
                            <PrivateRoute auth={this.props.auth} exact path={'/dashboard/:side/transactions'} component={Transactions} />

                            <PrivateRoute auth={this.props.auth} exact path='/dashboard/:side' component={DashboardStats} />
                            <PrivateRoute auth={this.props.auth} component={() => <h1>404 at {side} side</h1>} />
                        </Switch>
                    </Panel>
                </main>

            </div>
        );
    }
}

Dashboard.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    auth: PropTypes.bool.isRequired
}

function mapStateToProps(state, props) {
    let persist = state.persist
    // let memory = state.memory
    let account = persist.account
    return {
        account: account,
        // TODO: temp until we decide how to handle the logged in state
        // TODO: We do not need aut here anymore, the auth is on the root
        auth: !!account._addr
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
)(Translate(withStyles(styles)(Dashboard)))
