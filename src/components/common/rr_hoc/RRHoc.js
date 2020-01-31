import React, { forwardRef } from 'react'
// import PropTypes from 'prop-types'
import { withRouter } from 'react-router'

export const withReactRouterLink = Component => {
	class Decorated extends React.Component {
		resolveToLocation = to => {
			const path = typeof to === 'object' ? to : { pathname: to }
			const href = this.props.history.createHref(path)
			return href
		}

		handleClick = async event => {
			event.preventDefault()
			event.stopPropagation()
			const { to, onClick } = this.props

			if (onClick && typeof onClick === 'function') {
				await onClick()
				this.props.history.push(to)
			} else {
				this.props.history.push(to)
			}
		}

		// TODO: check if it works without infinite loops
		// shouldComponentUpdate(nextProps, nextState) {
		//   // const { to } = this.props;
		//   return this.resolveToLocation(this.props.to) !== this.resolveToLocation(nextProps.to)
		// }

		render() {
			const {
				forwardedRef,
				to,
				match,
				location,
				history,
				staticContext,
				onClick,
				...rest
			} = this.props
			const toLocation = this.resolveToLocation(to)

			return (
				<Component
					ref={forwardedRef}
					{...rest}
					href={toLocation}
					onClick={this.handleClick}
				/>
			)
		}
	}

	const WithRouter = withRouter(Decorated)

	return forwardRef((props, ref) => (
		<WithRouter {...props} forwardedRef={ref} />
	))
}
