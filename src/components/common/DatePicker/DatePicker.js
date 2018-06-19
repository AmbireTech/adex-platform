import React, { Component } from 'react'
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils'
import MuiDatePicker from 'material-ui-pickers/DatePicker'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

export class DatePicker extends Component {

    render() {
        const props = this.props
        return (
            <MuiDatePicker {...props} />
        )
    }
}

export default DatePicker

const datePickerStyled = ({ classes, ...rest }) => {
    return (
        <DatePicker
            InputLabelProps={{
                classes: {
                    root: classes.datepickerContrastLabel,
                },
                FormLabelClasses: {
                    root: classes.datepickerContrastLabel,
                    focused: classes.datepickerContrastLabelFocused,
                }
            }}
            InputProps={{
                classes: {
                    root: classes.datepickerContrastInput,
                    underline: classes.datepickerContrastUnderline
                }
            }}
            {...rest}
        />
    )
}

export const DatePickerContrast = withStyles(styles)(datePickerStyled)