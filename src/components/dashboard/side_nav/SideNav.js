import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from 'actions/itemActions'

import { List, ListItem } from 'react-toolbox/lib/list'
import theme from './theme.css'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import NewItemWithDialog from 'components/dashboard/forms/NewItemWithDialog'
import CampaignIcon from 'components/common/icons/CampaignIcon'
import { ItemsTypes } from 'constants/itemsTypes'

import NewItemSteps from 'components/dashboard/forms/NewItemSteps'
import NewUnitForm from 'components/dashboard/forms/NewUnitForm'
import NewCampaignForm from 'components/dashboard/forms/NewCampaignForm'

const NewItemStepsWithDialog = NewItemWithDialog(NewItemSteps)

const RRListItem = withReactRouterLink(ListItem)

class SideNav extends Component {

    render() {

        return (
            <div className="Navigation">
                <List selectable={true} selected="2" ripple >
                    <RRListItem
                        to={{ pathname: '/dashboard/' + this.props.side }}
                        selectable={true}
                        value="1"
                        caption='Dashboard'
                        theme={theme}
                        className="side-nav-link"
                        leftIcon='dashboard'
                    />
                    <RRListItem
                        to={{ pathname: '/dashboard/' + this.props.side + "/campaigns" }}
                        selectable={true}
                        value="2"
                        caption='Campaigns'
                        theme={theme}
                        className="side-nav-link"
                        leftIcon={<CampaignIcon color='rgb(117, 117, 117)' />}
                    />
                    <ListItem
                        selectable={false}
                        ripple={false}
                    >
                        <NewItemStepsWithDialog
                            btnLabel="New campaign"
                            title="Create new campaign"
                            flat
                            primary
                            itemType={ItemsTypes.Campaign.id}
                            pageTwo={NewCampaignForm}
                            from="sidenav"                            
                        />
                    </ListItem>
                    <RRListItem
                        to={{ pathname: '/dashboard/' + this.props.side + "/units" }}
                        selectable={true}
                        value="3"
                        caption='Units'
                        theme={theme}
                        className="side-nav-link"
                        leftIcon='format_list_bulleted'
                    />
                    <ListItem
                        selectable={false}
                        ripple={false}
                    >
                        <NewItemStepsWithDialog
                            btnLabel="New Unit"
                            title="Create new unit"
                            accent
                            flat
                            itemType={ItemsTypes.AdUnit.id}
                            pageTwo={NewUnitForm}    
                            from="sidenav"
                        
                        />
                    </ListItem>
                </List>
            </div >
        );
    }
}


SideNav.propTypes = {
    actions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account,
        campaigns: state.campaigns
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SideNav);

