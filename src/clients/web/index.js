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
  const phone = query.phone || '1'
  const apiUrl = 'https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant'
  const getEl = (id) => document.getElementById(id)
  const buttonDisable = getEl('disable')
  const buttonEnable = getEl('enable')
  const buttonLog = getEl('log')
  const output = getEl('output')
  const log = getEl('logTable')

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

  const getCompleteButton = (id) => {
    const button = el('button')
    button.innerText = 'Finish'
    const afterHandler = () => {
      button.removeEventListener('click', clickHandler)
      button.parentNode.innerText = '+'

    }
    const clickHandler = async () => {
      await completeTask(id)
      afterHandler()
    }
    button.addEventListener('click', clickHandler)
    return button
  }

  const dataRowToCells = ([id, text, complete]) => {
    return [
      text,
      complete
        ? '+'
        : getCompleteButton(id)
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

  const logId = query['log-id']
  if (logId) {
    await completeTask(logId)
  }
  await checkStatus()
  await loadLog()
  buttonLog.addEventListener('click', loadLog)
  buttonEnable.addEventListener('click', enableClickHandler)
  buttonDisable.addEventListener('click', disableClickHandler)
})()
