import React, { useCallback, useEffect, useState } from 'react'
import './App.css';
import Log from './Log'
import Tabs, { getTabFromUrl } from './Tabs'
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
const userId = query.id || '1'
const logId = query['log-id']
const tab = getTabFromUrl()

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

  const setEnabledByStatus = useCallback((active) => {
    setEnabled(active)
  }, [setEnabled])

  const checkStatus = useCallback(() => {
    message('Checking status...')
    setFetchingStatus(true)
    return api.status(userId)
      .then(resp => setEnabledByStatus(resp))
      .then(() => message(''))
      .catch(error => {
        console.error(error)
      })
      .finally(x => {
        setFetchingStatus(false)
        return x
      })
  }, [message, setEnabledByStatus])

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
    await api.taskComplete(userId, logId)
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
  }, [logValues, message])

  const changeCommand = async (userCommandId, enabled, commandId) => {
    const result = await api.commandChange(userId, userCommandId, enabled, commandId)
    setCommandValues(
      commandValues.map(x => {
        if (x.commandId === commandId) {
          return {
            ...x,
            enabled: result.enabled,
          }
        }
        return x
      })
    )
  }

  const loadUserCommands = useCallback(async () => {
    message('Loading commands')
    const commands = await api.commandsLoad(userId)
    setCommandValues(commands)
  }, [message])

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
      const x = async () => {
        const logData = await api.logLoad(userId)
        setLog(logData)
      }
      x()
    }
  }, [loadLog, setLog])

  useEffect(() => {
    loadUserCommands()
  }, [loadUserCommands])

  const onUserCommandChange = async (userCommandId, enabled, commandId) => {
    console.log({userId, enabled, commandId})
    message('saving')
    await changeCommand(userCommandId, enabled, commandId)
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
        initialTab={tab}
      >
        <div>
          <Log
            completeTask={completeTask}
            rows={logValues}
          />
        </div>
        <div>
          <Commands
            onMessage={message}
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
          userId={userId}
        />
      </Tabs>
    </div>
  )
}

export default App
