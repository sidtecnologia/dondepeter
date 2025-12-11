import React, { useEffect, useRef } from 'react'

export default function BannerCarousel() {
  const carouselRef = useRef(null)
  const dotsRef = useRef(null)
  useEffect(() => {
    const carousel = carouselRef.current
    const slides = carousel.querySelectorAll('.banner-slide')
    let currentBanner = 1
    const firstClone = slides[0].cloneNode(true)
    const lastClone = slides[slides.length - 1].cloneNode(true)
    carousel.appendChild(firstClone)
    carousel.insertBefore(lastClone, slides[0])
    carousel.style.transform = `translateX(-${currentBanner * 100}%)`
    const dots = dotsRef.current
    slides.forEach((_, idx) => {
      const dot = document.createElement('div')
      dot.className = 'banner-dot'
      if (idx === 0) dot.classList.add('active')
      dot.addEventListener('click', () => {
        currentBanner = idx + 1
        update()
        resetInterval()
      })
      dots.appendChild(dot)
    })
    function update() {
      carousel.style.transform = `translateX(-${currentBanner * 100}%)`
      const dotIndex = (currentBanner - 1 + slides.length) % slides.length
      dots.querySelectorAll('.banner-dot').forEach((d, i) => d.classList.toggle('active', i === dotIndex))
    }
    function nextBanner() {
      currentBanner++
      update()
      if (currentBanner >= slides.length + 1) {
        setTimeout(() => {
          carousel.style.transition = 'none'
          currentBanner = 1
          carousel.style.transform = `translateX(-${currentBanner * 100}%)`
          setTimeout(() => { carousel.style.transition = 'transform 0.5s ease' }, 50)
        }, 500)
      }
    }
    let interval = setInterval(nextBanner, 4000)
    function resetInterval() {
      clearInterval(interval)
      interval = setInterval(nextBanner, 4000)
    }
    return () => clearInterval(interval)
  }, [])
  return (
    <section className="banner-section">
      <div className="banner-carousel" id="banner-carousel" ref={carouselRef}>
        <div className="banner-slide"><img src="https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner1.webp" alt="Promoción 1" /></div>
        <div className="banner-slide"><img src="https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner2.webp" alt="Promoción 2" /></div>
        <div className="banner-slide"><img src="https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner3.webp" alt="Promoción 3" /></div>
        <div className="banner-slide"><img src="https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner4.webp" alt="Promoción 4" /></div>
        <div className="banner-slide"><img src="https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner5.webp" alt="Promoción 5" /></div>
        <div className="banner-slide"><img src="https://ndqzyplsiqigsynweihk.supabase.co/storage/v1/object/public/donde_peter/baner/baner6.webp" alt="Promoción 6" /></div>
      </div>
      <div className="banner-dots" id="banner-dots" ref={dotsRef}></div>
    </section>
  )
}