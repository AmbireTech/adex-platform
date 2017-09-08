import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/unitActions'
import Input from 'react-toolbox/lib/input'
// import DatePicker from 'react-toolbox/lib/date_picker'
import { Button } from 'react-toolbox/lib/button'
import Dialog from 'react-toolbox/lib/dialog'

class NewUnitForm extends Component {
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
        this.props.actions.updateNewUnit({ [name]: value })
    };

    save() {
        this.props.actions.addUnit(Object.assign({}, this.props.newUnit));
        this.props.actions.resetNewUnit()
        this.handleToggle()
    }


    render() {

        let unit = this.props.newUnit;

        // console.log('NewUnitForm unit', unit)

        return (
            <div>
                <Button icon='add' label='Add new Unit' onClick={this.handleToggle} primary={this.props.primary} raised={this.props.raised} accent={this.props.accent} flat={this.props.flat} />
                <Dialog
                    active={this.state.active}
                    onEscKeyDown={this.handleToggle}
                    onOverlayClick={this.handleToggle}
                    title='Add new Unit'
                >
                    <section>
                        <Input type='text' label='Name' name='name' value={unit._name} onChange={this.handleChange.bind(this, 'name')} maxLength={128} />
                        <Input type='text' label='Image url' name='img' value={unit._meta.img} onChange={this.handleChange.bind(this, 'img')} maxLength={1024} />
                        <Input type='text' multiline rows={5} label='Description' name='desctiption' value={unit._meta.description} onChange={this.handleChange.bind(this, 'description')} maxLength={1024} />
                        {/* <DatePicker label='Start date' minDate={new Date()} onChange={this.handleChange.bind(this, 'from')} value={campaign._meta.from} />
                        <DatePicker label='End date' minDate={new Date()} onChange={this.handleChange.bind(this, 'to')} value={campaign._meta.to} /> */}
                        <br />
                        <Button icon='save' label='Save' raised primary onClick={this.save} />
                    </section>
                </Dialog>
            </div>

        )
    }
}

NewUnitForm.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account,
        newUnit: state.newItem.unit
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
)(NewUnitForm);
