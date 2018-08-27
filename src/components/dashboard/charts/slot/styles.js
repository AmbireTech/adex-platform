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
            maxHeight: '600px',
        },
        chartLabel: {
            '@media(min-width:769px) and (max-width:1279px)': {
                float: 'left'
            }
        },
        chartContainer: {
            '@media(min-width:769px) and (max-width:1279px)': {
                float: 'right'
            }
        },
        chartTitle: {
            textAlign: 'center',
            color: '#666',
            fontFamily: "'Roboto', 'Arial', sans-serif"
        }
    }
}