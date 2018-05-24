import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-toolbox/lib/button'
import { dataToCSV } from 'services/csv/csv'
import Translate from 'components/translate/Translate'

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
                    icon={this.state.generatingCSV ? 'hourglass_empty' : (this.props.icon || 'save_alt')}
                    onClick={this.dlCSV}
                    label={this.props.t(this.props.label || 'DOWNLOAD_CSV_BTN')}
                    disabled={this.state.generatingCSV}
                />
            </span>
        )
    }
}

CsvDownloadBtn.propTypes = {
    getData: PropTypes.func.isRequired,
    fileName: PropTypes.string
}

export default Translate(CsvDownloadBtn)
