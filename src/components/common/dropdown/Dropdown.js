import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
});

class Dropdown extends React.Component {

    handleChange = event => {
        // this.setState({ [event.target.name]: event.target.value })

        this.props.onChange(event.target.value)
    }

    render() {
        const {
            classes,
            label = '',
            onChange,
            value,
            source,
            htmlId = 'some-id',
            name = '',
            disabled = false,
            error = false,
            helperText

        } = this.props

        return (
            <form className={classes.root} autoComplete="off">
                <FormControl
                    className={classes.formControl}
                    disabled={disabled}
                    error={error}
                >
                    {/* {label && */}
                        <InputLabel htmlFor={htmlId}>{label}</InputLabel>
                    {/* } */}
                    <Select
                        native
                        value={value}
                        onChange={this.handleChange}
                        input={<Input name={name} id={htmlId} />}
                    >

                        {source.map((src) => {
                            return (
                                <MenuItem value={src.value}>{src.label}</MenuItem>
                            )
                        })}
                    </Select>
                    {helperText &&
                        <FormHelperText>{helperText}</FormHelperText>
                    }
                </FormControl>
            </form>
        );
    }
}

Dropdown.propTypes = {
    classes: PropTypes.object.isRequired,
    label: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.bool]),
    source: PropTypes.array.isRequired, //([{label: 'some label', value: 'some value'}])
    disabled: PropTypes.bool,
    error: PropTypes.bool,
    htmlId: PropTypes.string.isRequired,
    name: PropTypes.string,
    displayEmpty: PropTypes.bool,
    helperText: PropTypes.string

};

export default withStyles(styles)(Dropdown)