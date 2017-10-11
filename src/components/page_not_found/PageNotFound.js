import React from 'react';
import { Link } from 'react-router-dom';
import AdexIcon from 'components/common/icons/AdexIcon';

class PageNotFound extends React.Component {

    render() {
        return (
            <div>
                <h1>4YMIYW4</h1>
                <Link to="/">Go home..</Link>
                <AdexIcon />
            </div>
        );
    }
}

export default PageNotFound;
