import React from 'react'

function Card(props){
    const classes = "px-2 py-3 rounded shadow-lg" + props.classname
    return <div className={classes}>{props.children}</div>
}
export default Card
