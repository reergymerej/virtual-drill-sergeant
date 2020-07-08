import React from 'react'
import './Execute.css'

const Execute = (props) => {
  console.log(props)
  return (
    <div className="Execute">
      {props.audio &&
      <audio autoPlay>
        <source src={props.audio} type="audio/mpeg" />
      </audio>
      }
      <p>
        {props.text}
      </p>
      {!props.completed &&
      <button onClick={() => props.onComplete(props.id)}>complete</button>
      }
    </div>
  )
}

export default Execute
