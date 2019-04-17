import React, { Component } from 'react';
import Home from './Home.js';

class App extends Component {
    render() {
        console.log("This is the process.env: ", process.env.PUBLIC_URL);
        return (
            <div className="App">
                <Home />
            </div>
        );
    }
}

export default App;