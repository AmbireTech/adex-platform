import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';
import {Button} from 'react-toolbox/lib/button';

class NewCampaignForm extends Component {
    constructor(props, context) {
        super(props, context);

        this.save = this.save.bind(this);
        // this.handleChange = this.handleChange.bind(this);

        this.state = {
            name: '',
            img: '',
            description: '',
            from: null,
            to: null,
        }
    }

    handleChange = (name, value) => {
        console.log('handleChange', name, value)
        this.setState({ ...this.state, [name]: value });
    };

    save() {
        this.props.addCampaign(Object.assign({}, this.state));
    }


    render() {

        return (

            <section>
                <Input type='text' label='Name' name='name' value={this.state.name} onChange={this.handleChange.bind(this, 'name')} maxLength={128} />
                <Input type='text' label='Inage url' name='img' value={this.state.img} onChange={this.handleChange.bind(this, 'img')} maxLength={1024} />
                <Input type='text' multiline rows={5} label='Description' name='desctiption' value={this.state.description} onChange={this.handleChange.bind(this,'description')} maxLength={1024} />
                <DatePicker label='Start date' minDate={new Date()} onChange={this.handleChange.bind(this, 'from')} value={this.state.from} />
                <DatePicker label='End date' minDate={new Date()} onChange={this.handleChange.bind(this, 'to')} value={this.state.to} />
                <br />
                <Button icon='save' label='Save' raised primary onMouseUp={this.save} />
            </section>

        )
    }
}

NewCampaignForm.propTypes = {
    addCampaign: PropTypes.func.isRequired,
    campaigns: PropTypes.object.isRequired
};

export default NewCampaignForm
