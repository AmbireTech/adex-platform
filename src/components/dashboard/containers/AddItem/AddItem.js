import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ItemsList from 'components/dashboard/containers/ItemsList'
// import classnames from 'classnames'
import Translate from 'components/translate/Translate'
import { ContentBox, ContentBody } from 'components/common/dialog/content'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

export class AddItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            active: false,
            tabIndex: 0
        }
    }

    handleTabChange = (ev, index) => {
        this.setState({ tabIndex: index })
    }


    render() {
        const { classes } = this.props
        const { tabIndex } = this.state
        const NewForm = this.props.newForm
        return (
            <div>
                <ContentBox>
                    <AppBar
                        position='static'
                        className={classes.appBar}
                        color='primary'
                    >
                        <Tabs
                            className={''}
                            value={tabIndex}
                            onChange={this.handleTabChange}
                            scrollable
                            scrollButtons='off'
                        >
                            <Tab label={this.props.tabNewLabel} />
                            <Tab label={this.props.tabExsLabel} />
                        </Tabs>
                    </AppBar>
                    <div className={classes.tabsContainer}>

                        {tabIndex === 0 &&
                            <ContentBody>
                                <NewForm {...this.props} stepperProps={{ stepperClasses: classes.stepperBody }} />
                            </ContentBody>
                        }

                        {tabIndex === 1 &&

                            <ContentBody>
                                <ItemsList
                                    {...this.props}
                                    objModel={this.props.objModel}
                                    parentItem={this.props.addTo}
                                    addToItem
                                    items={this.props.items}
                                    viewModeId={this.props.viewMode}
                                    listMode={this.props.listMode}
                                />
                            </ContentBody>
                        }
                    </div>
                </ContentBox>
            </div>
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

export default Translate(withStyles(styles)(AddItem))