import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewItemHoc from './NewItemHocStep'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Autocomplete from 'components/common/autocomplete'
import { getTags } from 'services/adex-node/actions'

const noTagsErrMsg = 'ERR_REQUIRED_FIELD'
const allowNewTags = process.env.ALLOW_NEW_TAGS === 'true'

function doesInputMatch(input, regex) {
    if (input.length < 2) {
        return true;
    }
    return input.match(regex)
}

class NewItemFormTags extends Component {
    componentWillMount() {
        this.props.validate('tags', {isValid: this.props.item.meta.tags && this.props.item.meta.tags.length > 0, err: {msg: noTagsErrMsg}})                             
            getTags()
                .then((res) => {
                    const tags = res.reduce((o, key) => ({ ...o, [key._id]: key._id}), {})
                    this.props.actions.updateTags({tags: tags})
                })
    }



    render() {
        if (!this.props.tags) {
            return null
        } else {
            return (
                <Grid item lg={12}>
                    <Autocomplete
                        id='tags-select'
                        direction='auto'
                        multiple
                        openOnClick
                        required
                        onChange={(value) => {
                            this.props.handleChange('tags', [...value])
                            this.props.validate('tags', {isValid: this.props.item.meta.tags && !!value.length, err: { msg: noTagsErrMsg}})
                            if (allowNewTags) {
                                this.props.actions.addNewTag({tag: value[value.length - 1]})
                            }
                        }}
                        doesInputMatch={allowNewTags ? doesInputMatch : null}
                        value={[...(this.props.item.meta.tags || [])]}
                        label={this.props.t('TAGS_LABEL')}
                        placeholder={this.props.t('TAGS_PLACEHOLDER')}
                        source={{...this.props.tags}}
                        showSuggestionsWhenValueIsSet={true}
                        allowCreate={allowNewTags}
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

function mapStateToProps(state) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
        tags: persist.tags
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const ItemNewItemFormTags = NewItemHoc(NewItemFormTags)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(ItemNewItemFormTags))
