'use client'

import { useRef, useState } from 'react'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUpload({ images, onChange, maxImages = 6 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError('')
    setUploading(true)

    const newUrls: string[] = []
    for (const file of Array.from(files)) {
      if (images.length + newUrls.length >= maxImages) break
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Erreur upload'); break }
        newUrls.push(data.url)
      } catch {
        setError('Erreur réseau')
        break
      }
    }

    onChange([...images, ...newUrls])
    setUploading(false)
  }

  const remove = async (url: string) => {
    onChange(images.filter((u) => u !== url))
    fetch('/api/admin/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    }).catch(() => {})
  }

  const move = (from: number, to: number) => {
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div className="image-upload">
      {/* Zone de drop */}
      {images.length < maxImages && (
        <div
          className={`image-drop-zone${dragOver ? ' drag-over' : ''}${uploading ? ' uploading' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files) }}
        >
          {uploading ? (
            <span className="image-drop-label">Envoi en cours…</span>
          ) : (
            <>
              <span className="image-drop-icon">↑</span>
              <span className="image-drop-label">Glisse des photos ici ou clique pour choisir</span>
              <span className="image-drop-hint">JPG, PNG, WEBP — max 5 Mo — {images.length}/{maxImages} photo{images.length > 1 ? 's' : ''}</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => upload(e.target.files)}
          />
        </div>
      )}

      {error && <p className="admin-form-error" style={{ marginTop: '8px' }}>{error}</p>}

      {/* Grille de prévisualisation */}
      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((url, i) => (
            <div key={url} className={`image-preview-item${i === 0 ? ' primary' : ''}`}>
              <img src={url} alt={`Photo ${i + 1}`} className="image-preview-img" />
              {i === 0 && <span className="image-primary-badge">Principale</span>}
              <div className="image-preview-actions">
                {i > 0 && (
                  <button type="button" className="image-action-btn" onClick={() => move(i, i - 1)} title="Déplacer à gauche">←</button>
                )}
                {i < images.length - 1 && (
                  <button type="button" className="image-action-btn" onClick={() => move(i, i + 1)} title="Déplacer à droite">→</button>
                )}
                <button type="button" className="image-action-btn delete" onClick={() => remove(url)} title="Supprimer">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
