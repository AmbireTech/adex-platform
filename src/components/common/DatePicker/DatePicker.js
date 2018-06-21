import React, { Component } from 'react'
// import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils'
import MuiDatePicker from 'material-ui-pickers/DatePicker'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import IconButton from '@material-ui/core/IconButton'
import CalendarIcon from '@material-ui/icons/DateRange'
import InputAdornment from '@material-ui/core/InputAdornment'

const CalendarIconAdor = () =>
    <InputAdornment position="end">
        <IconButton>
            <CalendarIcon />
        </IconButton>
    </InputAdornment>


export class DatePicker extends Component {

    render() {
        const props = this.props
        return (
            <MuiDatePicker
                InputProps={{
                    endAdornment: props.calendarIcon ? <CalendarIconAdor /> : null
                }}
                {...props}

            />
        )
    }
}

export default DatePicker

const datePickerStyled = ({ classes, calendarIcon, ...rest }) => {
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
                },
                endAdornment: calendarIcon ? <CalendarIconAdor /> : null
            }}
            {...rest}
        />
    )
}

export const DatePickerContrast = withStyles(styles)(datePickerStyled)