import React from 'react'

import Navbar from './components/Navbar'
import Card from './components/Card'
import Tasklist from './components/tasklist/Tasklist'
class App extends React.Component {
    render(){
        return (
            <div>
                <Navbar/>
                <Card className="max-w-1/2">Test</Card>
                <p>Hello from App</p>
                <Tasklist/>
            </div>
        )
    }
}

export default App
