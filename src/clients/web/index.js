(() => {
  const apiUrl = 'https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant'
  const el = (id) => document.getElementById(id)
  const buttonDisable = el('disable')
  const buttonEnable = el('enable')
  const buttonLog = el('log')
  const output = el('output')

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

  const logRowToText = x => {
    return x[1]
  }

  buttonLog.addEventListener('click', async () => {
    const log = await getLog()
    const text = log.map(logRowToText).join('\n')
    output.innerText = text
  })
})()
