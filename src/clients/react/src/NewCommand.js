import React from 'react'
import './NewCommand.css'

const NewCommand = (props) => {
  return (
    <form
      className="NewCommand"
      onSubmit={e => {
        e.preventDefault()
        e.stopPropagation()
        if (props.value) {
          props.onSave(props.value)
        }
    }}>
      <input
        type="text"
        placeholder="new command"
        value={props.value}
        onChange={event => props.onChange(event.target.value)}
      />
      <button>Create</button>
    </form>
  )
}

export default NewCommand
