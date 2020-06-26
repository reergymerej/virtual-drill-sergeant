import React, { useState } from 'react'
import './Tabs.css';

export const getTabFromUrl = () => {
  return parseInt((/^#(\d+)$/).exec(window.location.hash || '#0')[1])
}

export default (props) => {
  const [tab, setTab] = useState(props.initialTab)
  return (
    <div className="Tabs">
      <div className="TabBar">
        {props.names.map((name, index) => {
          return (
            <button
              key={name}
              onClick={() => {
                window.location.hash = `#${index}`
                setTab(index)
              }}
              className={index === tab ? 'active' : ''}
            >
              {name}
            </button>
          )
        })}
      </div>
      <div>
        {props.children[tab]}
      </div>
    </div>
  )
}
