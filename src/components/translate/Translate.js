import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { translate } from 'services/translations/translations'

export default function Translate(Decorated) {
	class Translated extends Component {

		t(val, { isProp = false, args = [''] } = {}) {

			const translation = translate(val, { isProp, args }, this.props.language)

			return translation
		}

		render() {
			return (
				<span>
					<Decorated {...this.props} t={this.t.bind(this)} />
				</span>
			)
		}
	}

	Translated.propTypes = {
		language: PropTypes.string.isRequired
	}

	function mapStateToProps(state) {
		const { persist } = state
		return {
			language: persist.language
		}
	}

	return connect(
		mapStateToProps,
		null
	)(Translated)
}
