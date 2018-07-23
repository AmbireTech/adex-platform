import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Grid from '@material-ui/core/Grid'
import Autocomplete from 'components/common/autocomplete'
import { getTags } from 'services/adex-node/actions'

class NewItemFormTags extends Component {
    componentWillMount() {
        getTags({authSig: this.props.account._authSig})
            .then((res) => {
                const tags = {}
                res.map((tag) => {
                    tags[tag._id] = tag._id
                })

                this.props.actions.updateTags({tags: tags})
            })
    }

    render() {
        console.log(this.props)
        if (!this.props.tags) {
            return null
        } else {
            return (
                <Grid item lg={12}>
                    <Autocomplete
                        ref='tags-select'
                        id='tags-select'
                        direction="auto"
                        multiple
                        openOnClick
                        onChange={(value) => {
                            this.props.handleChange('tags', value)
                        }}
                        value={this.props.meta.tags || []}
                        label={this.props.t('TAGS_LABEL')}
                        placeholder={this.props.t('TAGS_PLACEHOLDER')}
                        source={this.props.tags}
                        suggestionMatch='anywhere'
                        showSuggestionsWhenValueIsSet={true}
                        allowCreate={true}
                    />
                </Grid>
            )
        }
    }
}

NewItemFormTags.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    title: PropTypes.string,
    tags: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    const persist = state.persist
    const memory = state.memory
    return {
        account: persist.account,
        newItem: memory.newItem[props.itemType],
        tags: persist.tags
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewItemFormTags)
