export const styles = theme => {
    return {
        legendList: {
            listStyle: 'none',
            paddingLeft: 0
        },
        legendSpan: {
            width: '40px',
            minHeight: '13px',
            float: 'left',
            margin: '0px 8px'
        },
        legendListItem: {
            height: '20px',
            fontSize: '12px',
            marginLeft: '8px',
            color: '#666',
            fontFamily: "'Roboto', 'Arial', sans-serif",
            cursor: 'pointer'
        },
        chartParent: {
            height: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap'
        },
        chartLabel: {
            margin: '0 auto',
            '@media(min-width:650px) and (max-width:1279px)': {
                margin: 'auto'
            }
        },
        chartContainer: {
            margin: '0 auto',
            '@media(min-width:650px) and (max-width:1279px)': {
                margin: 'auto'
            }
        },
        chartTitle: {
            textAlign: 'center',
            color: '#666',
            fontFamily: "'Roboto', 'Arial', sans-serif",
            flexBasis: '100%'
        }
    }
}