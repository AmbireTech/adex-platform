import React, { Component } from 'react'
import PropTypes from 'prop-types'
import theme from './itemDialogTheme.css'
import { Tab, Tabs } from 'react-toolbox'
import ItemsList from './ItemsList'
// import classnames from 'classnames'
import Translate from 'components/translate/Translate'
import { ContentBox, ContentBody } from 'components/common/dialog/content'

export class AddItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            active: false,
            tabIndex: 0
        }
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }


    render() {
        return (
            <Tabs theme={theme} className={''} index={this.state.tabIndex} onChange={this.handleTabChange.bind(this)}>
                <Tab label={this.props.tabNewLabel}>
                    <ContentBox>
                        <ContentBody>
                                {this.props.newForm({...this.props})}
                        </ContentBody>
                    </ContentBox>
                </Tab>
                <Tab theme={theme} label={this.props.tabExsLabel}>
                    <ContentBox>
                        <ContentBody>
                            <ItemsList {...this.props} objModel={this.props.objModel} parentItem={this.props.addTo} addToItem items={this.props.items} viewModeId={this.props.viewMode} listMode={this.props.listMode} />
                        </ContentBody>
                    </ContentBox>
                </Tab>
            </Tabs>
        )
    }
}

AddItem.propTypes = {
    btnLabel: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    floating: PropTypes.bool,
    listMode: PropTypes.string,
    tabNewLabel: PropTypes.string.isRequired,
    tabExsLabel: PropTypes.string.isRequired,
    objModel: PropTypes.func.isRequired
}

export default Translate(AddItem)
