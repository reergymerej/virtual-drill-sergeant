import React, { useCallback, useEffect, useState } from 'react'
import './App.css';
import Log from './Log'
import NewCommand from './NewCommand'
import UserCommands from './UserCommands'
import Tabs from './Tabs'

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

  const setEnabledByStatus = useCallback((status) => {
    setEnabled(status !== 'DISABLED')
  }, [setEnabled])

  const checkStatus = useCallback(() => {
    message('Checking status...')
    return ajax(`${apiUrl}/${phone}`)
      .then(resp => setEnabledByStatus(resp.status))
      .then(() => message(''))
  }, [ajax, message, setEnabledByStatus])

  const update = (url) => ajax(url, 'PUT')
    .then(x => message(x.message))
    .then(checkStatus)

  const getActionClickHandler = ({
    action,
    messageText,
    url,
  }) => () => {
    message(messageText)
    return action(url)
  }

  const enableClickHandler = getActionClickHandler({
    action: update,
    messageText: 'enabling...',
    url: `${apiUrl}/enable/${phone}`,
  })

  const disableClickHandler = getActionClickHandler({
    action: update,
    messageText: 'disabling...',
    url: `${apiUrl}/disable/${phone}`,
  })

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
    const isUpdate = !!userCommandId
    const method = isUpdate ? 'PATCH' : 'POST'
    const url = isUpdate
      ? `${apiUrl}/${userId}/commands/${userCommandId}`
      : `${apiUrl}/${userId}/commands`
    return fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enabled,
        commandId,
      }),
    })
      .then(x => x.json())
  }

  const loadUserCommands = useCallback(async () => {
    message('Loading commands')
    const commands = await ajax(`${apiUrl}/${phone}/commands`)
    setCommandValues(commands)
  }, [ajax, message])

  const [newCommandText, setNewCommandText] = useState('')

  const createNewCommand = async (text) => {
    message('Saving new command')
    const url = `${apiUrl}/commands`
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
      }),
    })
      .then(x => x.json())
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

  return (
    <div className="App">
      <h1 className="center">Virtual Drill Sergeant</h1>
      <div className="center">
        {enabled
          ? <button onClick={disableClickHandler}>Disable</button>
          : <button onClick={enableClickHandler}>Enable</button>
        }
        <div id="output" className="mono center padding fontColor">{messageValue}</div>
      </div>
      <Tabs
        names={[
        'log',
        'commands',
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
          {commandValues && (
            <UserCommands
              rows={commandValues}
              onChange={onUserCommandChange}
            />
            )}
          <NewCommand
            onSave={createNewCommand}
            value={newCommandText}
            onChange={setNewCommandText}
          />
        </div>
      </Tabs>
    </div>
  )
}

export default App
