import React, { Component } from 'react';
import { Button } from 'react-toolbox/lib/button';
import progressBarTheme from 'react-toolbox/lib/progress_bar/theme.css';
import theme from './theme.css'
import classnames from 'classnames'

class FloatingProgressButton extends Component {

  renderCircular() {
    return (
      <svg className={theme.circle} viewBox="0 0 64 64">
        <circle className={theme.path} style={undefined} cx="32" cy="32" r="29" fill='none' />
      </svg>
    );
  }

  render() {
    var { inProgress, ...other } = this.props
    return (
      <div>
        <Button {...other} className={theme.Button}>
          {inProgress ?
            <div className={classnames(theme.circular, theme.indeterminate, theme.multicolor)}>
              {this.renderCircular()}
            </div>
            : null}
        </Button>
      </div>
    );
  }
}

export default FloatingProgressButton;
