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
  const userId = phone
  const apiUrl = 'https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant'
  const getEl = (id) => document.getElementById(id)
  const buttonDisable = getEl('disable')
  const buttonEnable = getEl('enable')
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
    element.style.display = 'none'
  }

  const enableElement = (element) => {
    element.style.display = 'initial'
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

  const getCompleteUrl = (logId) => `${apiUrl}/${userId}/logs/${logId}`

  const completeTask = async (logId) => {
    message('Completing task...')
    const url = getCompleteUrl(logId)
    await ajax(url, 'PATCH')
    message('Task completed')
  }

  // Returns a button that will perform an action on click and change text
  // after.
  const getAsyncActionButton = (id, buttonText, buttonTextAfter, handlerFunction) => {
    const button = el('button')
    button.innerText = buttonText
    const afterHandler = () => {
      button.removeEventListener('click', clickHandler)
      button.parentNode.innerText = buttonTextAfter
    }
    const clickHandler = async () => {
      await handlerFunction(id)
      afterHandler()
    }
    button.addEventListener('click', clickHandler)
    return button
  }

  const logRowToCells = ([id, text, complete]) => {
    const done = '✔️'
    return [
      text,
      complete
        ? done
        : getAsyncActionButton(id, 'Finish', done, completeTask)
    ]
  }

  const addRowToTable = table => cells => {
    const row = createRow(cells)
    table.appendChild(row)
  }

  const createLog = (log) => {
    const table = el('table')
    log
      .map(logRowToCells)
      .forEach(addRowToTable(table))
    return table
  }

  const loadLog = async () => {
    const logData = await getLog()
    log.appendChild(createLog(logData))
  }

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

  const commandRowToCells = (userCommand) => {
    let [id, text, enabled, commandId] = userCommand
    const checkbox = el('input')
    checkbox.setAttribute('type', 'checkbox')
    checkbox.checked = enabled === true

    checkbox.addEventListener('change', async () => {
      message('saving')
      const result = await changeCommand(userId, id, checkbox.checked, commandId)
      ;[id, enabled] = result
      message('saved')
    })
    return [
      checkbox,
      text,
    ]
  }

  const loadCommands = async () => {
    message('Loading commands')
    const commands = await ajax(`${apiUrl}/${phone}/commands`)
    const table = el('table')
    commands
      .map(commandRowToCells)
      .forEach(addRowToTable(table))
    commandsEl.innerHTML = ''
    commandsEl.appendChild(table)
  }

  const createNewCommand = async (text) => {
    message('Saving new command')
    const url = `${apiUrl}/commands`
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
      }),
    })
      .then(x => x.json())
    console.log(result)
  }

  const logId = query['log-id']
  if (logId) {
    await completeTask(logId)
  }
  checkStatus()
  loadLog()
  loadCommands()

  buttonEnable.addEventListener('click', enableClickHandler)
  buttonDisable.addEventListener('click', disableClickHandler)

  getEl('newCommand').addEventListener('submit', async (event) => {
    event.preventDefault()
    event.stopPropagation()
    const input = getEl('newCommandText')
    const text = input.value
    await createNewCommand(text)
    input.value = ''
    loadCommands()
  })
})()
