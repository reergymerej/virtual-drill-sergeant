(() => {
  const apiUrl = 'https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant'
  const el = (id) => document.getElementById(id)

  const message = (message) => {
    el('output').innerText = message
    return message
  }

  const ajax = (url, method = 'GET') => fetch(url, { method })
    .then(x => x.json())
    .catch((e) => {
      console.error(e)
      message('It did not work.')
    })

  const checkStatus = () => {
    message('Checking status...')
    const url = apiUrl
    ajax(url)
      .then(x => message(x.status))
      .then((status) => {
        if (status === 'DISABLED') {
          enable('enable')
        } else {
          enable('disable')
        }
      })
  }

  const update = (url) => ajax(url, 'PUT')
    .then(x => message(x.message))
    .then(checkStatus)

  const disable = (id) => {
    el(id).disabled = true
  }

  const enable = (id) => {
    el(id).disabled = false
  }

  const getActionClickHandler = (action, messageText) => () => {
    disable(action)
    message(messageText)
    const url = `${apiUrl}/${action}`
    return update(url)
  }

  const enableClickHandler = getActionClickHandler('disable', 'disabling...')
  const disbleClickHandler = getActionClickHandler('enable', 'enabling...')

  enableClickHandler()
  el('disable').addEventListener('click', enableClickHandler)
  el('enable').addEventListener('click', disbleClickHandler)

  checkStatus()
})()
