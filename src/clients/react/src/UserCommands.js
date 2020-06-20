import React from 'react'

export default (props) => {
  return (
    <table>
      <tbody>
        {props.rows.map(userCommand => {
          const [id, text, enabled, commandId] = userCommand
          return (
            <tr key={commandId}>
              <td>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => {
                    props.onChange(id, !enabled, commandId)
                  }}
                />
              </td>
              <td>
                {text}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
