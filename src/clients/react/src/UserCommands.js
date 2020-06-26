import React from 'react'
import './UserCommands.css'


const UserCommands = (props) => {
  return (
    <div className="UserCommands">
      {props.rows.map(userCommand => {
        const { userCommandId, text, enabled, commandId } = userCommand
        return (
          <div
            key={commandId}
            className="row"
          >
            <label>
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => {
                  props.onChange(userCommandId, !enabled, commandId)
                }}
              />
              <p>
              {text}
              </p>
            </label>
          </div>
        )
      })}
    </div>
  )
}

export default UserCommands
