"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onImageChange: (file: File | null) => void
  currentImage?: string
  className?: string
}

export function ImageUpload({ onImageChange, currentImage, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError("Por favor selecciona un archivo de imagen válido")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe ser menor a 5MB")
      return
    }

    setError("")

    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      onImageChange(file)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      const input = fileInputRef.current
      if (input) {
        input.files = event.dataTransfer.files
        handleFileSelect({ target: { files: event.dataTransfer.files } } as any)
      }
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  return (
    <div className={className}>
      <Label className="text-sm font-medium text-foreground">
        Imagen del Market (Opcional)
      </Label>
      
      <div
        className={`mt-2 border-2 border-dashed border-input rounded-lg p-4 text-center transition-colors ${
          preview ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/50 hover:bg-primary/5'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {preview ? (
          <div className="space-y-3">
            <div className="relative mx-auto w-24 h-24 rounded-lg overflow-hidden border border-input">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 w-5 h-5 p-0"
                onClick={handleRemoveImage}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Imagen seleccionada
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF hasta 5MB
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Seleccionar Imagen
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        Añade una imagen representativa para tu market (máximo 5MB)
      </p>
    </div>
  )
} 