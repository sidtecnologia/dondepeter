import React from 'react'
export default function LogoModal({ open, onClose }) {
  return open ? (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-card" role="dialog" aria-modal="true">
        <button className="close" onClick={onClose} aria-label="Cerrar">&times;</button>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <img src="/img/favicon.png" alt="logo" style={{width:88,height:88,borderRadius:12}} />
          <div>
            <h2 style={{margin:0}}>Comida Rápida</h2>
            <p style={{color:'#9aa4b2',marginTop:6}}>Horario: 17:00 - 23:00</p>
            <p style={{color:'#9aa4b2',marginTop:6}}>Tel: <a href="tel:+573227671829">+57 322 767 1829</a></p>
            <p style={{color:'#9aa4b2',marginTop:6}}><a href="https://www.google.com/maps/search/?api=1&query=Carrera+27+10-50+Bucaramanga" target="_blank" rel="noreferrer">Carrera 27 # 10-50, Bucaramanga</a></p>
          </div>
        </div>
      </div>
    </div>
  ) : null
}