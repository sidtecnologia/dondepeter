import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
export default function useSupabaseConfig() {
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    let mounted = true
    fetch('/api/get-config').then(r => {
      if (!r.ok) throw new Error('No se pudo obtener la configuración')
      return r.json()
    }).then(cfg => {
      if (!mounted) return
      if (!cfg.url || !cfg.anonKey) {
        throw new Error('Faltan claves en get-config')
      }
      const sb = createClient(cfg.url, cfg.anonKey)
      setClient(sb)
    }).catch(err => {
      setError(err.message || String(err))
    }).finally(() => {
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])
  return { client, loading, error }
}