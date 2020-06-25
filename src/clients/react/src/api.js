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

export const feedbackRead = () => {
  const url = `${apiUrl}/${phone}/feedback`
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

export const feedbackLabel = (id, labelId) => {
  const url = `${apiUrl}/${phone}/feedback/${id}/label`
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
