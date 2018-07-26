import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import { dataToCSV } from 'services/csv/csv'
import Translate from 'components/translate/Translate'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'
import DownloadIcon from '@material-ui/icons/SaveAlt'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class CsvDownloadBtn extends Component {

    constructor(props) {
        super(props);
        this.state = {
            generatingCSV: false
        }
    }

    dlCSV = () => {
        this.setState({ generatingCSV: true }, () => {
            const data = this.props.getData()
            const csvStr = dataToCSV(data)
            this.dlAnchor.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvStr));
            this.dlAnchor.click()

            this.setState({ generatingCSV: false })
        })
    }

    render() {
        const csvFileName = (this.props.fileName || 'adex-export') + '.csv'
        const { classes } = this.props
        return (
            <span>
                <a
                    ref={(i) => this.dlAnchor = i}
                    download={csvFileName}
                    style={{ visibility: 'hidden', width: 0, height: 0, display: 'inline-block' }}
                >
                    {csvFileName}
                </a>
                <Button
                    {...this.props}
                    // icon={this.state.generatingCSV ? 'hourglass_empty' : (this.props.icon || 'save_alt')}
                    onClick={this.dlCSV}
                    // label={this.props.t(this.props.label || 'DOWNLOAD_CSV_BTN')}
                    disabled={this.state.generatingCSV}
                >
                    {this.state.generatingCSV ?
                        <HourglassEmptyIcon className={classes.leftIcon} />
                        : (this.props.icon || <DownloadIcon className={classes.leftIcon} />)
                    }
                    {this.props.t(this.props.label || 'DOWNLOAD_CSV_BTN')}
                </Button >
            </span>
        )
    }
}

CsvDownloadBtn.propTypes = {
    getData: PropTypes.func.isRequired,
    fileName: PropTypes.string
}

export default withStyles(styles)(Translate(CsvDownloadBtn))
