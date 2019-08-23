import React from 'react'
// import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

export const withReactRouterLink = Component => {
	class Decorated extends React.Component {
		resolveToLocation = to => {
			return typeof to === 'object' ? to['pathname'] : to
		}

		handleClick = event => {
			event.preventDefault()
			const { to, onClick } = this.props

			if (typeof onClick === 'function') {
				onClick()
			}

			this.props.history.push(to)
		}

		// TODO: check if it works without infinite loops
		// shouldComponentUpdate(nextProps, nextState) {
		//   // const { to } = this.props;
		//   return this.resolveToLocation(this.props.to) !== this.resolveToLocation(nextProps.to)
		// }

		render() {
			const {
				to,
				match,
				location,
				history,
				staticContext,
				...rest
			} = this.props
			const toLocation = this.resolveToLocation(to)
			return (
				<Component {...rest} href={toLocation} onClick={this.handleClick} />
			)
		}
	}

	return withRouter(Decorated)
}
