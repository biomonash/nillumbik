import { useState, useRef } from 'react'
import { MANAGER_API_URL } from '../../../constants/api'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle')
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) setFile(selected)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setStatus('uploading')
    setMessage('')

    try {
      const res = await fetch(`${MANAGER_API_URL}/api/manager/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message)
      } else {
        setStatus('error')
        setMessage(data.detail || 'Upload failed')
      }
    } catch {
      setStatus('error')
      setMessage('Could not connect to manager server')
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-white mt-10">Upload CSV</h2>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-[var(--muted-foreground)] rounded-xl p-12 text-center cursor-pointer hover:border-[#216869] transition-colors mt-6"
      >
        <p className="text-[var(--muted-foreground)] text-sm">
          {file
            ? file.name
            : 'Drag and drop a CSV file here, or click to browse'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Upload button */}
      {file && (
        <button
          onClick={handleUpload}
          disabled={status === 'uploading'}
          className="mt-4 w-full bg-[#216869] text-white py-2 rounded-lg font-semibold hover:bg-[#1a5254] disabled:opacity-50 transition-colors"
        >
          {status === 'uploading' ? 'Uploading...' : 'Upload'}
        </button>
      )}

      {/* Status message */}
      {message && (
        <p
          className={`mt-3 text-sm text-center ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
