import React, { useState, useEffect} from 'react'
import * as api from './api'

const NextSolution = () => {
  const [data, setData] = useState({})

  useEffect(() => {
    api.getNextSolution()
      .then(({problem, solution}) => {
        setData({
          problem,
          solution,
        })
      })
  }, [setData])

  return (
    <div>
      <h3>
        What problem is being solved now?
      </h3>
      <p>
        <strong>Problem:</strong>&nbsp;
        {data.problem}
      </p>
      <p>
        <strong>Solution:</strong>&nbsp;
        {data.solution}
      </p>
    </div>
  )
}

export default NextSolution
