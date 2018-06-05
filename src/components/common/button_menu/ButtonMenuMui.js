import React, { Component } from 'react'
import { FontIcon } from 'react-toolbox/lib/font_icon'
// import { Menu } from 'react-toolbox/lib/menu'
// import { Button } from 'react-toolbox/lib/button'
import CampaignIcon from 'components/common/icons/CampaignIcon'
import theme from './theme.css'
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'

const ImgIcon = ({ src }) => {
  return (
    <img src={src} className={theme.imgIcon} height='100%' width='auto' alt='logo' />
  )
}

class ButtonMenu extends Component {
  state = {
    active: false,
    anchorEl: null,
  };
  handleButtonClick = () => this.setState({ active: !this.state.active, anchorEl: null })
  handleMenuHide = () => this.setState({ active: false })

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  CustomButton() {
    let btnProps = {
      accent: this.props.accent,
      primary: this.props.primary,
      className: this.props.className,
    }

    const { classes } = this.props
    const { anchorEl } = this.state
    const open = Boolean(anchorEl)

    let leftIcon = this.props.leftIconSrc ? <ImgIcon src={this.props.leftIconSrc} /> : null
    return (
      <Button
        //  {...btnProps}
        onClick={this.handleMenu}
        aria-owns='menu-appbar'// {open ? 'menu-appbar' : null}
        aria-haspopup="true"
      >
        {leftIcon}
        <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}> {this.props.label} </span>
        <FontIcon style={this.props.iconStyle} value={this.props.icon} />
      </Button>
    )
  }

  render() {
    const { classes } = this.props
    const { anchorEl } = this.state
    const open = Boolean(anchorEl)
    let leftIcon = this.props.leftIconSrc ? <ImgIcon src={this.props.leftIconSrc} /> : null

    return (
      <div style={{ display: 'inline-block' }}>
        <Button
          //  {...btnProps}
          onClick={this.handleMenu}
          aria-owns='menu-appbar'// {open ? 'menu-appbar' : null}
          aria-haspopup="true"
        >
          {leftIcon}
          <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}> {this.props.label} </span>
          <FontIcon style={this.props.iconStyle} value={this.props.icon} />
        </Button>
        <Menu
          id="menu-appbar"
          open={open}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          onClose={this.handleClose}
        >
          {this.props.children}
        </Menu>
      </div>
    )
  }
}

export default withStyles()(ButtonMenu)
