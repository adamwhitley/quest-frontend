import React, { Component } from 'react';

class Callback extends Component {

    componentWillMount() {
        this.props.history.replace('/setup')
    }

    render() {
        return (
            <div className="Callback">
                Loading Application...
            </div>
        );
    }
}

export default Callback;