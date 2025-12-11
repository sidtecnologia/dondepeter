import React, { useEffect } from 'react'

export default function CategoryCarousel({ products, onSelectCategory }) {
  const categories = Array.from(new Set((products || []).map(p => p.category))).map(c => ({ label: c }))
  useEffect(() => {
    const el = document.getElementById('category-carousel')
    let isDown = false
    let startX, scrollLeft
    function onMouseDown(e) {
      isDown = true
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
    }
    function onMouseUp() { isDown = false }
    function onMouseMove(e) {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - el.offsetLeft
      const walk = (x - startX) * 1.5
      el.scrollLeft = scrollLeft - walk
    }
    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mousemove', onMouseMove)
    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('mousemove', onMouseMove)
    }
  }, [products])
  return (
    <div className="category-carousel-container">
      <div id="category-carousel" className="category-carousel">
        <div className="category-item" onClick={() => onSelectCategory('__all')}>
          <img className="category-image" src="/img/icons/all.webp" alt="Todo" data-category="__all" />
          <span className="category-name">Todo</span>
        </div>
        {categories.map(c => {
          const fileName = `/img/icons/${c.label.toLowerCase().replace(/\s+/g, '_')}.webp`
          return (
            <div className="category-item" key={c.label} onClick={() => onSelectCategory(c.label)}>
              <img className="category-image" src={fileName} alt={c.label} data-category={c.label} />
              <span className="category-name">{c.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}