import React from 'react'

import Navbar from './components/Navbar.jsx'

class App extends React.Component {
    render(){
        return (
            <div>
                <Navbar/>
                <p>Hello from App</p>
            </div>
        )
    }
}

export default App
