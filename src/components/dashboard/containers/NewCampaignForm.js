import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './../../../actions/campaignActions';
import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';
import { Button } from 'react-toolbox/lib/button';
import Dialog from 'react-toolbox/lib/dialog'

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
        this.props.actions.updateNewCampaign({ [name]: value })
    };

    save() {
        this.props.actions.addCampaign(Object.assign({}, this.props.newCampaign));
        this.props.actions.resetNewCampaign()
        this.handleToggle()
    }


    render() {

        let campaign = this.props.newCampaign;

        return (
            <div>
                <Button icon='add' label='Add new Campaign' onClick={this.handleToggle} primary raised />
                <Dialog
                    active={this.state.active}
                    onEscKeyDown={this.handleToggle}
                    onOverlayClick={this.handleToggle}
                    title='Add new Campaign'
                >
                    <section>
                        <Input type='text' label='Name' name='name' value={campaign._name} onChange={this.handleChange.bind(this, 'name')} maxLength={128} />
                        <Input type='text' label='Inage url' name='img' value={campaign._meta.img} onChange={this.handleChange.bind(this, 'img')} maxLength={1024} />
                        <Input type='text' multiline rows={5} label='Description' name='desctiption' value={campaign._meta.description} onChange={this.handleChange.bind(this, 'description')} maxLength={1024} />
                        <DatePicker label='Start date' minDate={new Date()} onChange={this.handleChange.bind(this, 'from')} value={campaign._meta.from} />
                        <DatePicker label='End date' minDate={new Date()} onChange={this.handleChange.bind(this, 'to')} value={campaign._meta.to} />
                        <br />
                        <Button icon='save' label='Save' raised primary onMouseUp={this.save} />
                    </section>
                </Dialog>
            </div>

        )
    }
}

NewCampaignForm.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account,
        newCampaign: state.newItem.campaign
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
