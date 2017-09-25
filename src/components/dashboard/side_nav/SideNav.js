import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'

import { List, ListItem } from 'react-toolbox/lib/list'
// import {Navigation} from 'react-toolbox/lib/navigation'
import theme from './theme.css'
import { withReactRouterLink } from './../../common/rr_hoc/RRHoc.js'
import NewCampaignForm from './../forms/NewCampaignForm'
import NewUnitForm from './../forms/NewUnitForm'
import NewItemWithDialog from './../forms/NewItemWithDialog'

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
                    />
                    <RRListItem
                        to={{ pathname: '/dashboard/' + this.props.side + "/campaigns" }}
                        selectable={true}
                        value="2"
                        caption='Campaigns'
                        theme={theme}
                        className="side-nav-link"
                    />
                    <RRListItem
                        to={{ pathname: '/dashboard/' + this.props.side + "/campaigns" }}
                        selectable={false}
                        ripple={false}
                    >
                        <NewItemWithDialog
                            btnLabel="Add new campaign"
                            title="Add new campaign"
                            flat
                            raised
                            newForm={(props) =>
                                <NewCampaignForm
                                    {...props}
                                />
                            }
                        />
                    </RRListItem>
                    <RRListItem
                        to={{ pathname: '/dashboard/' + this.props.side + "/units" }}
                        selectable={true}
                        value="3"
                        caption='Units'
                        theme={theme}
                        className="side-nav-link"
                    />
                    <RRListItem
                        to={'/dashboard/' + this.props.side + "/units"}
                        selectable={false}
                        ripple={false}
                    >
                        <NewItemWithDialog
                            btnLabel="Add new Unit"
                            title="Add new unit"
                            accent={true}
                            flat={true}
                            raised
                            newForm={(props) =>
                                <NewUnitForm
                                    {...props}
                                />
                            }
                        />
                    </RRListItem>
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

