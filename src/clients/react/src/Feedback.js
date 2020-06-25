import React, { useEffect, useState } from 'react'
import './Feedback.css'
import * as api from './api'

const FeedbackItem = (props) => {
  const [voting, setVoting] = useState(false)
  const [updatedVote, setUpdatedVote] = useState(null)
  const [hide, setHide] = useState(false)

  const handleVote = () => {
    props.onMessage('submitting vote')
    setVoting(true)
    const id = props.item.id
    api.feedbackVote(id)
      .then(x => {
        setUpdatedVote(x)
        props.onMessage('vote saved, thanks')
      })
      .catch(e => {
        console.error(e)
        props.onMessage('unable to rock the vote')
      })
  }

  const addLabel = (labelId) => () => {
    props.onMessage('adding label')
    const id = props.item.id
    api.feedbackLabel(id, labelId)
      .then(() => {
        props.onMessage('label saved')
        setHide(true)
      })
      .catch(e => {
        console.error(e)
        props.onMessage('unable to save label')
      })
  }

  const junk = addLabel(1)
  const implemented = addLabel(2)

  return (
    <div className="FeedbackItem">
      <p>
        {props.item.text}
      </p>
      <div className="tools">
        <div>
          <button
            onClick={handleVote}
            disabled={hide || voting}
          >
            <span role="img" aria-label="your mom">
              👍
            </span>
          </button>
          <span>
            {updatedVote === null
              ? props.item.votes
              : updatedVote
            }
          </span>
        </div>

        <div className="labels">
          <button
            disabled={hide}
            onClick={junk}
          >
            Junk
          </button>
          <button
            disabled={hide}
            onClick={implemented}
          >
            Implemented
          </button>
        </div>
      </div>
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
      <div>
        <h3>
          What problem is being solved now?
        </h3>
        <p>
          <strong>Problem:</strong>&nbsp;
          Users want to know that the program is improving and feedback is
          worthwhile.
        </p>
        <p>
          <strong>Solution:</strong>&nbsp;
          Show what is being developed next.
        </p>
      </div>

      <h3>
        What should come next?
      </h3>
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


      { feedback.map((item) => {
          return (
            <FeedbackItem
              key={item.id}
              item={item}
              onMessage={props.onMessage}
            />
          )
      }) }
    </div>
  )
}

export default Feedback
