import React, {useState, useRef, useEffect} from 'react'
const fetch = require('node-fetch')

function Tasklist() {
  // Declare a new state variable, which we'll call "count"

  const [tasks, setTasks] = useState([])
  const taskValue = useRef(null)
    const listOfTasks = tasks.map(task => {
        if( !task.done ){
            return React.createElement("li",{key: task.name + tasks.length},task.name);
        }
    })

    function addTask(){
        const task = taskValue.current.value
        setTasks([...tasks,task])
    }

    useEffect(() => {
        fetch('http://localhost:6060/')
            .then(res => res.json())
            .then(json => setTasks([...tasks, json]))
    },[])
  
  return (
    <div>
      <ul>
      {listOfTasks}
      </ul>
      <input type="text" ref={taskValue} placeholder="task name"></input>
      <button type="button" onClick={addTask}>
        Click me
      </button>
    </div>
  );
}

export default Tasklist
    
