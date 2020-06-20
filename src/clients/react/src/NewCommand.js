import React from 'react'

export default (props) => {
  return (
    <form onSubmit={e => {
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
