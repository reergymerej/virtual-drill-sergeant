import React  from 'react'
import NewCommand from './NewCommand'
import UserCommands from './UserCommands'

const Commands = (props) => {
  return (
    <div>
      <p>
        Select the commands you want to receive.
      </p>
      {props.commands && (
        <UserCommands
          rows={props.commands}
          onChange={props.onUserCommandChange}
        />
      )}
      <NewCommand
        onSave={props.createNewCommand}
        value={props.newCommandText}
        onChange={props.setNewCommandText}
      />
    </div>
  )
}

export default Commands
