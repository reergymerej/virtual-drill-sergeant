(async () => {
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
  const phone = query.id || '1'
  const apiUrl = 'https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant'
  const getEl = (id) => document.getElementById(id)
  const buttonDisable = getEl('disable')
  const buttonEnable = getEl('enable')
  const buttonLog = getEl('log')
  const output = getEl('output')
  const log = getEl('logTable')
  const commandsEl = getEl('commandsEl')

  const message = (message) => {
    output.innerText = message
    return message
  }

  const ajax = (url, method = 'GET') => fetch(url, { method })
    .then(x => x.json())
    .catch((e) => {
      console.error(e)
      message('It did not work.')
    })

  const updateButtonByStatus = (status) => {
    enableElement(status === 'DISABLED'
      ? buttonEnable
      : buttonDisable
    )
  }

  const checkStatus = () => {
    message('Checking status...')
    return ajax(`${apiUrl}/${phone}`)
      .then(resp => updateButtonByStatus(resp.status))
      .then(() => message(''))
  }

  const update = (url) => ajax(url, 'PUT')
    .then(x => message(x.message))
    .then(checkStatus)

  const disableElement = (element) => {
    element.disabled = true
  }

  const enableElement = (element) => {
    element.disabled = false
  }

  const getActionClickHandler = ({
    action,
    button,
    messageText,
    url,
  }) => () => {
    disableElement(button)
    message(messageText)
    return action(url)
  }

  const enableClickHandler = getActionClickHandler({
    action: update,
    button: buttonEnable,
    messageText: 'enabling...',
    url: `${apiUrl}/enable/${phone}`,
  })

  const disableClickHandler = getActionClickHandler({
    action: update,
    button: buttonDisable,
    messageText: 'disabling...',
    url: `${apiUrl}/disable/${phone}`,
  })

  const getLog = () => {
    const url = `${apiUrl}/${phone}/logs`
    return ajax(url)
  }

  const el = (tag) => document.createElement(tag)

  const createRow = (cells) => {
    const row = el('tr')
    cells.forEach(value => {
      const cell = el('td')
      if (typeof value !== 'object') {
        cell.innerText = value
      } else {
        cell.appendChild(value)
      }
      row.appendChild(cell)
    })
    return row
  }

  const getCompleteUrl = (logId) => `${apiUrl}/logs/${logId}/update`

  const completeTask = async (logId) => {
    message('Completing task...')
    const url = getCompleteUrl(logId)
    await ajax(url, 'PUT')
    message('Task completed')
  }

  // Returns a button that will perform an action on click and change text
  // after.
  const getAsyncActionButton = (id, buttonText, buttonTextAfter, handlerFunction) => {
    const button = el('button')
    button.innerText = buttonText
    const afterHandler = () => {
      button.removeEventListener('click', clickHandler)
      button.innerText = buttonTextAfter
    }
    const clickHandler = async () => {
      await handlerFunction(id)
      afterHandler()
    }
    button.addEventListener('click', clickHandler)
    return button
  }

  const dataRowToCells = ([id, text, complete]) => {
    return [
      getAsyncActionButton(id, 'Enable', 'enabled', enableCommand),
      getAsyncActionButton(id, 'Disable', 'disabled', disableCommand),
      text,
      complete
        ? '+'
        : getAsyncActionButton(id, 'Finish', '+', completeTask)
    ]
  }

  const addRowToTable = table => cells => {
    const row = createRow(cells)
    table.appendChild(row)
  }

  const createLog = (log) => {
    const table = el('table')
    log
      .map(dataRowToCells)
      .forEach(addRowToTable(table))
    return table
  }

  const loadLog = async () => {
    disableElement(buttonLog)
    log.innerHTML = ''
    const logData = await getLog()
    log.appendChild(createLog(logData))
    enableElement(buttonLog)
  }

  const enableCommand = async (commandLogId) => {
    message('Enabling command')
    const url = `${apiUrl}/commands/enable/${commandLogId}`
    try {
      await fetch(url, {
        method: 'PUT',
      })
      message('Command enabled')
    } catch (error) {
      message('Unable to enabled command')
    }
  }

  const disableCommand = async (commandLogId) => {
    message('Disabling command')
    const url = `${apiUrl}/commands/disable/${commandLogId}`
    try {
      await fetch(url, {
        method: 'PUT',
      })
      message('Command disabled')
    } catch (error) {
      message('Unable to disable command')
    }
  }

  const logId = query['log-id']
  if (logId) {
    await completeTask(logId)
  }
  await checkStatus()
  await loadLog()

  buttonLog.addEventListener('click', loadLog)
  buttonEnable.addEventListener('click', enableClickHandler)
  buttonDisable.addEventListener('click', disableClickHandler)


  const loadCommands = async () => ajax(`${apiUrl}/commands`)

  const buttonListCommands = getAsyncActionButton(null, 'list commands', 'list commands again', async () => {
    message('Loading commands')
    const commands = await loadCommands()
    const table = el('table')
    commands
      .map(x => [x[1], x[2] ? 'disabled' : ''])
      .forEach(addRowToTable(table))
    commandsEl.innerHTML = ''
    commandsEl.appendChild(table)
  })

  document.body.appendChild(buttonListCommands)
})()
