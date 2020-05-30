(() => {
  const message = (message) => {
    document.getElementById('output').innerText = message
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
    const url = 'https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/'
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
    document.getElementById(id).disabled = true
  }

  const enable = (id) => {
    document.getElementById(id).disabled = false
  }

  document.getElementById('disable').addEventListener('click', () => {
    disable('disable')
    message('disabling...')
    const url = 'https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/disable'
    update(url)
  })

  document.getElementById('enable').addEventListener('click', () => {
    disable('enable')
    message('enabling...')
    const url = 'https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/enable'
    update(url)
  })

  checkStatus()
})()
