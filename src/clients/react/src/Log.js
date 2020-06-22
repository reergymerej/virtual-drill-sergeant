import React from 'react'
import './Log.css'

export default (props) => {
  return (
    <div className="Log">
      {props.rows.map(row => {
      const [id, text, complete] = row
        return (
          <div
            key={id}
            className="row"
          >
            <div>
              {text}
            </div>
            <div>
              {complete
              ? '✔️'
              : (
              <button onClick={() => props.completeTask(id)}>
                Finish
              </button>
              )
                }
            </div>
          </div>
        )
      })}
    </div>
  )
}
