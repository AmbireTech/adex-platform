import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
import Input from 'react-toolbox/lib/input'
import DatePicker from 'react-toolbox/lib/date_picker'
import { Button } from 'react-toolbox/lib/button'
import Dialog from 'react-toolbox/lib/dialog'
import { ItemsTypes } from './../../../constants/itemsTypes'

class NewCampaignForm extends Component {
    constructor(props, context) {
        super(props, context);
        this.save = this.save.bind(this);

        this.state = {
            active: false
        };
    }

    handleToggle = () => {
        this.setState({ active: !this.state.active });
    }

    handleChange = (name, value) => {
        this.props.actions.updateNewItem(this.props.newCampaign, { [name]: value })
    };

    save() {
        this.props.actions.addItem(Object.assign({}, this.props.newCampaign));
        this.props.actions.resetNewItem(this.props.newCampaign)
        this.handleToggle()
    }

    render() {

        let campaign = this.props.newCampaign;

        return (
            <div>
                <Button icon='add' label='Add new Campaign' onClick={this.handleToggle}  primary={this.props.primary} raised={this.props.raised} ripple={this.props.ripple} accent={this.props.accent} flat={this.props.flat} />
                <Dialog
                    active={this.state.active}
                    onEscKeyDown={this.handleToggle}
                    onOverlayClick={this.handleToggle}
                    title='Add new Campaign'
                >
                    <section>
                        <Input type='text' label='Name' name='name' value={campaign._meta.fullName} onChange={this.handleChange.bind(this, 'fullName')} maxLength={128} />
                        <Input type='text' label='Image url' name='img' value={campaign._meta.img} onChange={this.handleChange.bind(this, 'img')} maxLength={1024} />
                        <Input type='text' multiline rows={5} label='Description' name='desctiption' value={campaign._meta.description} onChange={this.handleChange.bind(this, 'description')} maxLength={1024} />
                        <DatePicker label='Start date' minDate={new Date()} onChange={this.handleChange.bind(this, 'from')} value={campaign._meta.from} />
                        <DatePicker label='End date' minDate={new Date()} onChange={this.handleChange.bind(this, 'to')} value={campaign._meta.to} />
                        <br />
                        <Button icon='save' label='Save' raised primary onClick={this.save} />
                    </section>
                </Dialog>
            </div>

        )
    }
}

NewCampaignForm.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account,
        newCampaign: state.newItem[ItemsTypes.Campaign.id]
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
)(NewCampaignForm);
