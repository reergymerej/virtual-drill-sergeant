(() => {
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
    return ajax(apiUrl)
      .then(x => message(x.status))
      .then(updateButtonByStatus)
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
    url: `${apiUrl}/enable`,
  })

  const disableClickHandler = getActionClickHandler({
    action: update,
    button: buttonDisable,
    messageText: 'disabling...',
    url: `${apiUrl}/disable`,
  })

  buttonEnable.addEventListener('click', enableClickHandler)
  buttonDisable.addEventListener('click', disableClickHandler)

  checkStatus()

  const getLog = () => {
    const url = `${apiUrl}/logs`
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

  const getCompleteButton = (id) => {
    const button = el('button')
    button.innerText = 'Finish'
    const afterHandler = () => {
      button.removeEventListener('click', clickHandler)
      button.parentNode.innerText = '+'

    }
    const clickHandler = async () => {
      message('updating...')
      const url = `${apiUrl}/logs/${id}/update`
      await ajax(url, 'PUT')
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

  buttonLog.addEventListener('click', async () => {
    const logData = await getLog()
    log.innerHtml = ''
    log.appendChild(createLog(logData))
  })
})()
