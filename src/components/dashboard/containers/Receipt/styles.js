export const styles = theme => {
	return {
		icon: {
			height: '3rem',
			width: 'auto',
		},
		dottedDivider: {
			borderBottom: `0.5px dotted ${theme.palette.grey.main}`,
		},
		solidDevider: {
			borderBottom: `0.5px solid ${theme.palette.grey.main}`,
		},
		breakdownTable: {
			width: '100%',
			textAlign: 'left',
		},
		breakAll: {
			whiteSpace: 'normal',
			wordBreak: 'break-all',
		},
		pageBreak: {
			pageBreakAfter: 'always',
		},
		a4: {
			width: '210mm',
			minHeight: '297mm',
			padding: '8mm',
		},
		hideOnMobile: {
			[theme.breakpoints.down('sm')]: {
				display: 'none',
			},
		},
		hideOnDesktop: {
			[theme.breakpoints.up('md')]: {
				display: 'none',
			},
		},
		progress: {
			width: '100%',
		},
	}
}
