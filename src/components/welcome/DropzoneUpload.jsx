import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet } from 'lucide-react'

export default function DropzoneUpload({ onFile, disabled }) {
  const onDrop = useCallback(
    (accepted) => {
      if (accepted?.[0]) onFile(accepted[0])
    },
    [onFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] },
    multiple: false,
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
        isDragActive
          ? 'border-tessolve-orange bg-orange-50'
          : 'border-slate-300 bg-white/80 hover:border-tessolve-blue hover:bg-sky-50/50'
      } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-tessolve-orange to-tessolve-blue text-white shadow-lg">
        {isDragActive ? <FileSpreadsheet size={28} /> : <Upload size={28} />}
      </div>
      <p className="font-display text-lg font-semibold text-slate-800">
        {isDragActive ? 'Drop your CSV here' : 'Drag & drop team CSV'}
      </p>
      <p className="mt-2 text-sm text-slate-500">
        or click to browse — processed 100% in your browser
      </p>
    </div>
  )
}
