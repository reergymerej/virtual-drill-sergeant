import React, { useCallback, useEffect, useState } from 'react'
import './App.css';
import Log from './Log'
import Tabs from './Tabs'
import Commands from './Commands'
import Feedback from './Feedback'
import * as api from './api'

const getQuery = () => {
  if (window.location.search) {
    return window.location.search.substring(1).split('&').reduce((acc, pair) => {
      const [key, value] = pair.split('=')
      return {
        ...acc,
        [key]: value,
      }
    }, {})
  }
  return {}
}
const query = getQuery()
const logId = query['log-id']
const phone = query.id || '1'
const userId = phone
const apiUrl = 'https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant'
const getCompleteUrl = (logId) => `${apiUrl}/${userId}/logs/${logId}`

const App = () => {
  const [enabled, setEnabled] = useState(false)
  const [messageValue, setMessage] = useState('')
  const [logValues, setLog] = useState([])
  const [commandValues, setCommandValues] = useState([])
  const [autoCompleteTask, setAutoCompleteTask] = useState(!!logId)
  const [loadLog, setLoadLog] = useState(!autoCompleteTask)
  const [fetchingStatus, setFetchingStatus] = useState(false)

  const message = useCallback((message) => {
    console.log(message)
    setMessage(message)
    return message
  }, [setMessage])

  const ajax = useCallback((url, method = 'GET') => fetch(url, { method })
    .then(x => x.json())
    .catch((e) => {
      console.error(e)
      message('It did not work.')
    }), [message])

  const setEnabledByStatus = useCallback((active) => {
    setEnabled(active)
  }, [setEnabled])

  const checkStatus = useCallback(() => {
    message('Checking status...')
    setFetchingStatus(true)
    const url = `${apiUrl}/${userId}/agent`
    return ajax(url)
      .then(x => {
        const active = x[0][0]
        return active
      })
      .then(resp => setEnabledByStatus(resp))
      .then(() => message(''))
      .catch(error => {
        console.error(error)
      })
      .finally(x => {
        setFetchingStatus(false)
        return x
      })
  }, [ajax, message, setEnabledByStatus])

  const updateAgent = async (active) => {
    await api.agentUpdate(userId, active)
  }

  const enableClickHandler = async () => {
    try {
      await updateAgent(true)
      setEnabled(true)
      message('enabled')
    } catch (error) {
      message('enable failed')
    }
  }

  const disableClickHandler = async () => {
    try {
      await updateAgent(false)
      setEnabled(false)
      message('disabled')
    } catch (error) {
      message('disable failed')
    }
  }

  const completeTask = useCallback(async (logId) => {
    message('Completing task...')
    const url = getCompleteUrl(logId)
    await ajax(url, 'PATCH')
    message('Task completed')
    console.log({logValues})
    const updatedValues = logValues.map(x => {
      if (x[0] === logId) {
        const newX = [...x]
        newX[2] = true
        return newX
      }
      return x
    })
    setLog(updatedValues)
  }, [ajax, logValues, message])

  const changeCommand = (userId, userCommandId, enabled, commandId) => {
    return api.commandChange(userId, userCommandId, enabled, commandId)
  }

  const loadUserCommands = useCallback(async () => {
    message('Loading commands')
    const commands = await ajax(`${apiUrl}/${phone}/commands`)
    setCommandValues(commands)
  }, [ajax, message])

  const [newCommandText, setNewCommandText] = useState('')

  const createNewCommand = async (text) => {
    message('Saving new command')
    await api.commandCreate(text)
    setNewCommandText('')
    loadUserCommands()
  }

  // auto-complete task
  useEffect(() => {
    const x = async () => {
      setAutoCompleteTask(false)
      await completeTask(logId)
      setLoadLog(true)
    }
    if (autoCompleteTask) {
      x()
    }
  }, [completeTask, autoCompleteTask])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  // load log
  useEffect(() => {
    if (loadLog) {
      const getLog = async () => {
        const url = `${apiUrl}/${phone}/logs`
        return ajax(url)
      }

      const x = async () => {
        const logData = await getLog()
        setLog(logData)
      }

      x()
    }
  }, [loadLog, setLog, ajax])

  useEffect(() => {
    loadUserCommands()
  }, [loadUserCommands])

  const onUserCommandChange = async (id, enabled, commandId) => {
    message('saving')
    const result = await changeCommand(userId, id, enabled, commandId)
    const [updatedId, nextEnabledValue] = result
    const newValues = commandValues.map(x => {
      if (x[0] === updatedId) {
        const newValue = [...x]
        newValue[2] = nextEnabledValue
        return newValue
      }
      return x
    })
    setCommandValues(newValues)
    message('saved')
  }

  const [feedback, setFeedback] = useState('')
  const [feedbackSaving, setFeedbackSaving] = useState(false)

  const handleFeedbackChange = (value) => {
    setFeedback(value)
  }

  const handleFeedbackSubmit = async (value) => {
    setFeedbackSaving(true)
    message('saving feedback')
    try {
      const result = await api.feebackCreate(value)
      setFeedback('')
      message('feedback saved, thank you!')
      console.log({result})
    } catch (error) {
      console.error(error)
      message('problem saving feedback, ironic')
    }
    setFeedbackSaving(false)
  }

  return (
    <div className="App">
      <h1 className="center">Virtual Drill Sergeant</h1>
      <div className="center">
        {
          fetchingStatus
            ? ''
            : (enabled
              ? <button onClick={disableClickHandler}>Disable</button>
              : <button onClick={enableClickHandler}>Enable</button>
            )
        }
        <div id="output" className="mono center padding fontColor">{messageValue}</div>
      </div>
      <Tabs
        names={[
          'log',
          'commands',
          'feedback',
        ]}
        initialTab={0}
      >
        <div>
          <Log
            completeTask={completeTask}
            rows={logValues}
          />
        </div>
        <div>
          <Commands
            commands={commandValues}
            createNewCommand={createNewCommand}
            newCommandText={newCommandText}
            onUserCommandChange={onUserCommandChange}
            setNewCommandText={setNewCommandText}
          />
        </div>
        <Feedback
          disable={feedbackSaving}
          onChange={handleFeedbackChange}
          onMessage={message}
          onSubmit={handleFeedbackSubmit}
          value={feedback}
        />
      </Tabs>
    </div>
  )
}

export default App
