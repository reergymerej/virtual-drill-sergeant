const apiUrl = 'https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant'
const getCompleteUrl = (userId, logId) => `${apiUrl}/${userId}/logs/${logId}`

export const agentUpdate = (userId, active) => {
  const url = `${apiUrl}/${userId}/agent`
  return fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      active,
    }),
  }).then(x => x.json())
}

export const commandChange = (userId, userCommandId, enabled, commandId) => {
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
    .then(x => {
      const [userCommandId, enabled] = x
      return {
        userCommandId,
        enabled,
      }
    })
}

export const commandCreate = (text) => {
  const url = `${apiUrl}/commands`
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
    }),
  })
    .then(x => x.json())
}

export const commandsLoad = (userId) => {
  return fetch(`${apiUrl}/${userId}/commands`)
    .then(x => x.json())
    .then(x => {
      return x.map(y => {
        const [userCommandId, text, enabled, commandId] = y
        return {
          userCommandId,
          text,
          enabled,
          commandId,
        }
      })
    })
}

export const feedbackRead = (userId) => {
  const url = `${apiUrl}/${userId}/feedback`
  return fetch(url, {
    method: 'GET',
  })
    .then(x => x.json())
    .then(x => x.map(row => ({
      id: row[0],
      text: row[1],
      votes: row[2],
    })))
}

export const feedbackVote = (id) => {
  const url = `${apiUrl}/feedback/${id}/vote`
  return fetch(url, {
    method: 'POST',
  })
    .then(x => x.json())
}

export const feedbackLabel = (userId, id, labelId) => {
  const url = `${apiUrl}/${userId}/feedback/${id}/label`
  return fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      labelId,
    }),
  })
    .then(x => x.json())
    .then(x => x.length > 1)
}

export const feebackCreate = (value) => {
  const url = `${apiUrl}/feedback`
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: value,
    }),
  }).then(x => x.json())
}

export const getNextSolution = () => {
  const url = `${apiUrl}/solutions`
  return fetch(url, {
    method: 'GET',
  })
    .then(x => x.json())
    .then(x => ({
      problem: x[0],
      solution: x[1],
    }))
}

export const status = (userId) => {
    const url = `${apiUrl}/${userId}/agent`
    return fetch(url)
      .then(x => x.json())
      .then(x => {
        const active = x[0][0]
        return active
      })
}

export const taskComplete = (userId, logId) => {
  const url = getCompleteUrl(userId, logId)
  return fetch(url, {
    method: 'PATCH',
  })
    .then(x => x.json())
}

export const logLoad = (userId) => {
  const url = `${apiUrl}/${userId}/logs`
  return fetch(url)
    .then(x => x.json())
}

export const logLoadOne = (userId, logId) => {
  return logLoad(userId)
    .then(x => {
      return x.find(y => {
        return y[0] === logId
      })
    })
    .then(x => ({
      id: x[0],
      text: x[1],
    }))
}

export const groupsRead = (userId) => {
  const url = `${apiUrl}/${userId}/commands/group`
  return fetch(url)
    .then(x => x.json())
    .then(x => x.map(y => ({
      id: y[0],
      name: y[1],
    })))
}

export const groupActivate = (userId, id) => {
  const url = `${apiUrl}/${userId}/commands/group/${id}/activate`
  return fetch(url, {
    method: 'POST',
  })
    .then(x => x.json())
    .then(x => x.map(y => ({
      userCommandId: y[0],
      enabled: y[1],
    })))
}
