import { Component } from 'react'
import * as React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import FlagIconFactory from 'react-flag-icon-css'
import adexTranslations from 'adex-translations'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

const allLangs = adexTranslations.onlyTranslated

// const FlagIcon = FlagIconFactory(React)
const FlagIcon = FlagIconFactory(React, { useCssModules: false })
const ITEM_HEIGHT = 48

class ChangeLang extends Component {
	state = {
		anchorEl: null,
	}

	handleClick = event => {
		this.setState({ anchorEl: event.currentTarget })
	}

	handleClose = () => {
		this.setState({ anchorEl: null })
	}

	changeLanguage(newLng) {
		if (this.props.language !== newLng) {
			this.props.actions.changeLanguage(newLng)
		}
	}

	render() {
		const { anchorEl } = this.state
		return (
			<span>
				<IconButton
					aria-label='More'
					aria-owns={anchorEl ? 'long-menu' : null}
					aria-haspopup='true'
					onClick={this.handleClick}
				>
					<FlagIcon code={this.props.language.split('-')[1].toLowerCase()} />
				</IconButton>
				<Menu
					id='long-menu'
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={this.handleClose}
					PaperProps={{
						style: {
							maxHeight: ITEM_HEIGHT * 4.5,
							width: 200,
						},
					}}
				>
					{allLangs
						.sort((a, b) => a.split('-')[1].localeCompare(b.split('-')[1]))
						.map(lng => (
							<MenuItem
								key={lng}
								value={lng}
								onClick={() => this.changeLanguage(lng)}
							>
								<ListItemIcon>
									<FlagIcon code={lng.split('-')[1].toLowerCase()} />
								</ListItemIcon>
								<ListItemText primary={lng} />
							</MenuItem>
						))}
				</Menu>
			</span>
		)
	}
}

ChangeLang.propTypes = {
	actions: PropTypes.object.isRequired,
	language: PropTypes.string.isRequired,
}

function mapStateToProps(state, props) {
	let persist = state.persist
	// let memory = state.memory
	return {
		language: persist.language,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ChangeLang)
