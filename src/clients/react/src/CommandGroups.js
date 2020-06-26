import React, {useEffect, useState} from 'react'
import * as api from './api'

const CommandGroups = (props) => {
  const [groups, setGroups] = useState([])
  const [isWaiting, setIsWaiting] = useState(true)

  useEffect(() => {
    api.groupsRead(1)
      .then(setGroups)
      .then(() => setIsWaiting(false))
  }, [setGroups])

  const selectGroup = (id) => {
    setIsWaiting(true)
    props.onMessage('selecting group')
    api.groupActivate(props.userId, id)
      .then(commands => {
        console.log({commands})
        props.onCommandsUpdated(commands)
      })
      .catch(() =>
        props.onMessage('There was a problem selecting the group.')
      )
      .finally(() =>{
        props.onMessage('group selected')
        setIsWaiting(false)
      })
  }

  return (
    <div>
      <h3>
        Presets
      </h3>
      {groups.map(group => {
        const {id, name} = group
        return (
          <button
            key={id}
            onClick={() => selectGroup(id)}
            disabled={isWaiting}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}

export default CommandGroups
