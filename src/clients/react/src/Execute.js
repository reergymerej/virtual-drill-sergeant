import React from 'react'
import './Execute.css'

const Execute = (props) => (
  <div className="Execute">
    <p>
      {props.text}
    </p>
    <button onClick={() => props.onComplete(props.id)}>complete</button>
  </div>
)

export default Execute
