import React, { Component } from 'react'
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils'
import MuiDatePicker from 'material-ui-pickers/DatePicker'

export class DatePicker extends Component {

    render() {
        const props = this.props
        return (
            <MuiDatePicker {...props} />
        )
    }
}

export default DatePicker