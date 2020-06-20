import React from 'react'

export default (props) => {
  return (
    <table>
      <tbody>
        {props.rows.map(row => {
          const [id, text, complete] = row
          return (
            <tr key={id}>
              <td>
                {text}
              </td>
              <td>
                {complete
                  ? '✔️'
                  : (<button onClick={() => props.completeTask(id)}>
                    Finish
                  </button>)
                }
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
