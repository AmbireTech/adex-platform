import React, { Component } from 'react'
import { DatePicker as MuiDatePicker } from 'material-ui-pickers'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import IconButton from '@material-ui/core/IconButton'
import CalendarIcon from '@material-ui/icons/DateRange'
import InputAdornment from '@material-ui/core/InputAdornment'

const CalendarIconAdor = ({ icon = <CalendarIcon />, iconColor, onIconClick }) =>
    <InputAdornment position="end">
        <IconButton
            color={iconColor}
            onClick={onIconClick}
        >
            {icon}
        </IconButton>
    </InputAdornment>

export class DatePicker extends Component {
    render() {
        const { calendarIcon, icon, iconColor, onIconClick, ...rest } = this.props
        return (
            <MuiDatePicker
                InputProps={{
                    disabled: rest.disabled,
                    endAdornment: calendarIcon ? <CalendarIconAdor icon={icon} iconColor={iconColor} onIconClick={onIconClick} /> : null
                }}
                {...rest}
            />
        )
    }
}

export default DatePicker

const datePickerStyled = ({ classes, calendarIcon, icon, ...rest }) => {
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
                disabled: rest.disabled,
                classes: {
                    root: classes.datepickerContrastInput,
                    underline: classes.datepickerContrastUnderline
                },
                endAdornment: calendarIcon ? <CalendarIconAdor icon={icon} /> : null
            }}
            {...rest}
        />
    )
}

export const DatePickerContrast = withStyles(styles)(datePickerStyled)