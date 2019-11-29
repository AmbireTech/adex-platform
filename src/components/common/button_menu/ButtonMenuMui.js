import React, { useState } from 'react'
import Menu from '@material-ui/core/Menu'
import Button from '@material-ui/core/Button'

const ImgIcon = ({ src }) => {
	return (
		<img
			src={src}
			height={36}
			width='auto'
			alt='logo'
			style={{ marginRight: 5 }}
		/>
	)
}

function ButtonMenu({ children, btnStyle, label, rightIcon, leftIconSrc, id }) {
	const [active, setActive] = useState(false)
	const [anchorEl, setAnchorEl] = useState(null)
	const open = Boolean(anchorEl)

	const handleButtonClick = () => {
		setActive(!active)
		setAnchorEl(null)
	}

	const handleMenu = event => {
		setAnchorEl(event.currentTarget)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	const leftIcon = leftIconSrc ? <ImgIcon src={leftIconSrc} /> : null

	return (
		<>
			<Button
				style={btnStyle}
				onClick={handleMenu}
				aria-owns={id}
				aria-haspopup='true'
			>
				{leftIcon}
				<span
					style={{
						maxWidth: 150,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					}}
				>
					{label}
				</span>
				{rightIcon}
			</Button>
			<Menu
				id={id}
				open={open}
				anchorEl={anchorEl}
				// anchorOrigin={{
				// 	vertical: 'top',
				// 	horizontal: 'right',
				// }}
				// transformOrigin={{
				// 	vertical: 'top',
				// 	horizontal: 'right',
				// }}
				onClick={handleButtonClick}
				onClose={handleClose}
			>
				{children}
			</Menu>
		</>
	)
}

export default ButtonMenu
