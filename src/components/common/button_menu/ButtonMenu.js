import React, { Component } from 'react';
import { FontIcon } from 'react-toolbox/lib/font_icon';
import { Menu } from 'react-toolbox/lib/menu';
import { Button } from 'react-toolbox/lib/button';

class ButtonMenu extends Component {
    state = { active: false };
    handleButtonClick = () => this.setState({ active: !this.state.active });
    handleMenuHide = () => this.setState({ active: false });

    CustomButton(){

        return (
            this.props.iconRight ?
                <Button  label="" icon="" onClick={this.handleButtonClick} >
                    {this.props.label}
                    <FontIcon style={this.props.iconStyle} value={this.props.icon} />  
                </Button>
                :
                <Button onClick={this.handleButtonClick} />
        )
    }

    render () {
      return (
        <div style={{ display: 'inline-block', position: 'relative' }}>
          {this.CustomButton()}
          <Menu  {...this.props}  active={this.state.active} onHide={this.handleMenuHide}>
            {this.props.children}
          </Menu>
        </div>
      );
    }
  }

export default ButtonMenu;
