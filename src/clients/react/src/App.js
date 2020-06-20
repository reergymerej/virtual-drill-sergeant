import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import Log from './Log'
import NewCommand from './NewCommand'
import UserCommands from './UserCommands'

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

const App = () => {
  const [enabled, setEnabled] = useState(false)
  const [messageValue, setMessage] = useState('')
  const [logValues, setLog] = useState([])
  const [commandValues, setCommandValues] = useState([])
  const query = getQuery()
  const logId = query['log-id']
  const [autoCompleteTask, setAutoCompleteTask] = useState(!!logId)
  const [loadLog, setLoadLog] = useState(!autoCompleteTask)

  const phone = query.id || '1'
  const userId = phone
  const apiUrl = 'https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant'

  const message = (message) => {
    console.log(message)
    setMessage(message)
    return message
  }

  const ajax = useCallback((url, method = 'GET') => fetch(url, { method })
    .then(x => x.json())
    .catch((e) => {
      console.error(e)
      message('It did not work.')
    }), [])

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

  const getCompleteUrl = useCallback((logId) => `${apiUrl}/${userId}/logs/${logId}`, [userId])

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
  }, [ajax, getCompleteUrl, logValues, setLog])

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
  }, [ajax, phone, apiUrl])

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

  const updateButtonByStatus = useCallback((status) => {
    setEnabled(status !== 'DISABLED')
  }, [setEnabled])

  const checkStatus = useCallback(() => {
    message('Checking status...')
    return ajax(`${apiUrl}/${phone}`)
      .then(resp => updateButtonByStatus(resp.status))
      .then(() => message(''))
  }, [ajax, phone, updateButtonByStatus])


  useEffect(() => {
    const x = async () => {
      setAutoCompleteTask(false)
      await completeTask(logId)
      setLoadLog(true)
    }
    if (autoCompleteTask) {
      x()
    }
  }, [completeTask, logId, autoCompleteTask])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

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
  }, [loadLog, setLog, ajax, phone])

  useEffect(() => {
    loadUserCommands()
  }, [loadUserCommands])


  const onUserCommandChange = async (id, enabled, commandId) => {
    // TODO: update state quickly so checkbox is checked while we save
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
      <h1>Virtual Drill Sergeant</h1>
      <div className="center">
        {enabled
          ? <button onClick={disableClickHandler}>Disable</button>
          : <button onClick={enableClickHandler}>Enable</button>
        }
        <div id="output" className="mono center padding fontColor">{messageValue}</div>
      </div>
      <h2>Commands</h2>
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
      <h2>Log</h2>
      <Log
        completeTask={completeTask}
        rows={logValues}
      />
    </div>
  )
}

export default App
