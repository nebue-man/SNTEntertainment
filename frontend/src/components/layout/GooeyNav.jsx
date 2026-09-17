'use client'
import './GooeyNav.css'

export default function GooeyNav({ items, activeIndex = 0 }) {
  const handleClick = (e, index) => {
    if (items[index]?.onClick) e.preventDefault()
    items[index]?.onClick?.()
  }

  return (
    <nav className="gooey-nav-container">
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            className={`cursor-target${activeIndex === index ? ' active' : ''}`}
          >
            <a
              href={item.href}
              onClick={(e) => handleClick(e, index)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
