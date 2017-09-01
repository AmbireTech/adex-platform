import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

export const withReactRouterLink = Component => {

  class Decorated extends React.Component {
    constructor(props,context) {
      super(props,context)
      this.state = {active: false}
    }
    static propTypes = {
      activeClassName: PropTypes.string,
      className: PropTypes.string,
      target: PropTypes.string,
      to: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
      ]).isRequired,
    };

    resolveToLocation = to => {
      return typeof to === 'object' ? to['pathname'] : to
    }

    isActive = (toLocation, nextProps) => {
      const currProps = nextProps || this.props
      const { location } = currProps
      return toLocation === location.pathname
    }
    handleClick = event => {
      event.preventDefault();
      const { to } = this.props;
      this.props.history.push(to)
      this.setState({active: this.isActive(to)})
    }

    componentWillMount() {
      const { to } = this.props;
      this.setState({active: this.isActive(to)})
    }
    componentWillReceiveProps(nextProps) {
      const { to } = this.props;
      if (this.state.active !== this.isActive(to,nextProps)) {
        this.setState({active: this.isActive(to,nextProps)})
      }
    }
    shouldComponentUpdate(nextProps, nextState) {
      // const { to } = this.props;
      return this.state.active !== nextState.active
    }
    render () {
      const { activeClassName, className, to,  ...rest } = this.props;
      const toLocation = this.resolveToLocation(to);
      const _className = this.state.active ? `${className} ${activeClassName}` : className;
      return (
        <Component
          {...rest}
          className={_className}
          href={toLocation}
          onClick={this.handleClick}
        />
      );
    }
  };
  return withRouter(Decorated)
}
