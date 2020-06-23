import React, { useEffect, useState } from 'react'
import './Feedback.css'
import * as api from './api'

const FeedbackItem = (props) => {
  return (
    <div className="FeedbackItem">
      <p>
        {props.text}
      </p>
    </div>
  )
}

const Feedback = (props) => {
  const [feedback, setFeedback] = useState([])
  const {onMessage} = props

  useEffect(() => {
    onMessage('loading feedback')
    api.feedbackRead()
      .then(setFeedback)
      .catch(e => {
        console.error(e)
        onMessage('unable to load feedback')
      })
  }, [onMessage])

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
          placeholder="Tell me what sucks, what's broken, problems you have, ideas, anything!  Feedback is anonymous, so go nuts."
          value={props.value}
          onChange={event => props.onChange(event.target.value)}
        />
        <button disabled={props.disable}>Submit</button>
      </form>

      <h3>
        Here is the feedback we're already tracking.
      </h3>

      { feedback.map((item) => {
          return <FeedbackItem key={item.id} text={item.text} />
      }) }
    </div>
  )
}

export default Feedback
