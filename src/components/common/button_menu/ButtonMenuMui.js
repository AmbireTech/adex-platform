import React, { useState, Children, cloneElement } from 'react'
import { Menu, Button } from '@material-ui/core'

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

function ButtonMenu({
	children,
	btnStyle,
	label,
	rightIcon,
	leftIconSrc,
	id,
	variant,
}) {
	const [anchorEl, setAnchorEl] = useState(null)

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
				variant={variant}
				style={btnStyle}
				onClick={handleMenu}
				aria-haspopup='true'
				aria-controls={id}
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
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				getContentAnchorEl={null}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				onClick={handleClose}
				onClose={handleClose}
			>
				{Children.map(children, child =>
					cloneElement(child, {
						onClick: () => {
							typeof child.props.onClick === 'function' && child.props.onClick()
							handleClose()
						},
					})
				)}
			</Menu>
		</>
	)
}

export default ButtonMenu
