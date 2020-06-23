import React from 'react'
import './Feedback.css'

const Feedback = (props) => {
  return (
    <div className="Feedback">
      <form
        onSubmit={e => {
          e.preventDefault()
          e.stopPropagation()
          if (props.value) {
            props.onSubmit(props.value)
          }
      }}>
        <textarea
          placeholder="Tell me what sucks, what's broken, problems you have, ideas, anything!"
          value={props.value}
          onChange={event => props.onChange(event.target.value)}
        />
        <button disabled={props.disable}>Submit</button>
      </form>
    </div>
  )
}

export default Feedback
