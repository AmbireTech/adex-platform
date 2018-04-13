import React, { Component } from 'react'
import { FontIcon } from 'react-toolbox/lib/font_icon'
import { Menu } from 'react-toolbox/lib/menu'
import { Button } from 'react-toolbox/lib/button'
import CampaignIcon from 'components/common/icons/CampaignIcon'
import theme from './theme.css'

const ImgIcon = ({src}) => {
  return (
    <img src={src} className={theme.imgIcon} height='100%' width='auto' alt='logo'/>
  )
}

class ButtonMenu extends Component {
  state = { active: false };
  handleButtonClick = () => this.setState({ active: !this.state.active })
  handleMenuHide = () => this.setState({ active: false })

  CustomButton() {
    let btnProps = {
      accent: this.props.accent,
      primary: this.props.primary,
      className: this.props.className,
    }

    let leftIcon = this.props.leftIconSrc ? <ImgIcon src={this.props.leftIconSrc} /> : null
    return (
      this.props.iconRight ?
        <Button {...btnProps} theme={theme} label="" icon={leftIcon} onClick={this.handleButtonClick} >
          <span style={{maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}> {this.props.label} </span>
          <FontIcon style={this.props.iconStyle} value={this.props.icon} />
        </Button>
        :
        <Button {...btnProps} label={this.props.label} theme={theme} icon={leftIcon} onClick={this.handleButtonClick} />
    )
  }

  render() {
    return (
      <div style={{ display: 'inline-block', position: 'relative' }}>
        {this.CustomButton()}
        <Menu  {...this.props} active={this.state.active} onHide={this.handleMenuHide}>
          {this.props.children}
        </Menu>
      </div>
    )
  }
}

export default ButtonMenu
