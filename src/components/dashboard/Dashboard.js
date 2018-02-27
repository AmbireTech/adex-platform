import React from 'react'
import { Layout, Panel, NavDrawer } from 'react-toolbox/lib/layout'
import SideNav from './side_nav/SideNav'
import TopBar from './top_bar/TopBar'
import theme from './theme.css'
import { Route, Switch, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Campaign from './containers/Campaign'
import Channel from './containers/Channel'
import DashboardStats from './containers/DashboardStats'
import Unit from './containers/Unit'
import Slot from './containers/Slot'
import Items from './containers/Items'
import Transactions from './containers/Transactions'
import {
    AdUnit as AdUnitModel,
    AdSlot as AdSlotModel,
    Campaign as CampaignModel,
    Channel as ChannelModel
} from 'adex-models'
import Account from './account/Account'
import Translate from 'components/translate/Translate'
import { NewUnit, NewCampaign, NewSlot, NewChannel } from './forms/NewItems'
import { items as ItemsConstants } from 'adex-constants'
import checkTransactions from 'services/store-data/transactions'

const { ItemsTypes } = ItemsConstants

function PrivateRoute({ component: Component, auth, ...other }) {
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

    componentWillUnmount(){
        checkTransactions.stop()
    }

    componentWillMount(nextProps) {
        this.props.actions.updateNav('side', this.props.match.params.side)
        checkTransactions.start()
    }

    componentWillUpdate(nextProps) {
        if(nextProps.match.params.side !== this.props.match.params.side){
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
                newItemBtn={() => <NewUnit floating accent />}
                objModel={AdUnitModel}
            />
        )
    }

    renderCampaigns = () => {
        return (
            <Items
                header={this.props.t('ALL_CAMPAIGNS')}
                viewModeId='rowsViewCampaigns'
                itemsType={ItemsTypes.Campaign.id}
                newItemBtn={() => <NewCampaign floating accent />}
                objModel={CampaignModel}
            />
        )
    }

    renderAdSlots = () => {
        return (
            <Items
                header={this.props.t('ALL_SLOTS')}
                viewModeId='rowsViewSlots'
                itemsType={ItemsTypes.AdSlot.id}
                newItemBtn={() => <NewSlot floating accent />}
                objModel={AdSlotModel}
            />
        )
    }

    renderChannels = () => {
        return (
            <Items
                header={this.props.t('ALL_CHANNELS')}
                viewModeId='rowsViewChannels'
                itemsType={ItemsTypes.Channel.id}
                newItemBtn={() => <NewChannel floating accent />}
                objModel={ChannelModel}
            />
        )
    }

    Dash = () => {

        return (
            <div>
                {this.props.t('DASHBOARD')}
            </div>
        )
    }

    render() {
        let side = this.props.side || this.props.match.params.side
        return (
            <Layout theme={theme} >
                <NavDrawer pinned={true} theme={theme}>
                    <SideNav location={this.props.location} side={side} data={this.props.account} />
                </NavDrawer >

                <Panel theme={theme} >
                    <TopBar side={side} />
                    <Switch locatiom={this.props.location}>
                        {/* TODO: Make things dynamic if easier */}
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/advertiser/campaigns' component={this.renderCampaigns} />
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/advertiser/units' component={this.renderAdUnits} />
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/advertiser/Campaign/:itemId' component={Campaign} />
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/advertiser/AdUnit/:itemId' component={Unit} />

                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/publisher/channels' component={this.renderChannels} />
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/publisher/slots' component={this.renderAdSlots} />
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/publisher/Channel/:itemId' component={Channel} />
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/publisher/AdSlot/:itemId' component={Slot} />

                        <PrivateRoute auth={this.props.auth} exact path={'/dashboard/:side/account'} component={Account} />
                        <PrivateRoute auth={this.props.auth} exact path={'/dashboard/:side/transactions'} component={Transactions} />

                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/:side' component={DashboardStats} />
                        <PrivateRoute auth={this.props.auth} component={() => <h1>404 at {side} side</h1>} />
                    </Switch>
                </Panel>
            </Layout>
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
        auth: !!account._addr,
        // transactions: persist.web3Transactions[persist.account._addr] || {}
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
)(Translate(Dashboard))
