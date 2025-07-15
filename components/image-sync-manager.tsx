"use client"

import { useEffect, useState } from 'react'
import { MarketImageStorage } from '@/lib/market-images'
import { CONTRACTS } from '@/lib/contracts-config'
import { useToast } from '@/hooks/use-toast'

export function ImageSyncManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const { toast } = useToast()

  // Función para sincronizar imágenes con el servidor
  const syncImages = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      await MarketImageStorage.syncWithServer()
      setLastSync(new Date())
      console.log("🔄 Imágenes sincronizadas con el servidor")
    } catch (error) {
      console.error("❌ Error sincronizando imágenes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Función para cargar imágenes desde el servidor al localStorage
  const loadImagesFromServer = async () => {
    try {
      // Obtener todas las imágenes del servidor
      const response = await fetch('/api/images/store')
      if (!response.ok) return

      const data = await response.json()
      if (data.images && Array.isArray(data.images)) {
        // Aquí podrías cargar las imágenes del servidor al localStorage
        // Por ahora, esto está simplificado
        console.log("📥 Imágenes del servidor:", data.images.length)
      }
    } catch (error) {
      console.error("❌ Error cargando imágenes del servidor:", error)
    }
  }

  // Sincronizar automáticamente cuando se monta el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Sincronizar imágenes locales con el servidor
      syncImages()
      
      // Cargar imágenes del servidor que no estén en localStorage
      loadImagesFromServer()
    }
  }, [])

  // Sincronizar periódicamente (cada 5 minutos)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const interval = setInterval(() => {
        syncImages()
      }, 5 * 60 * 1000) // 5 minutos

      return () => clearInterval(interval)
    }
  }, [])

  // Función para forzar sincronización (útil para testing)
  const forceSyncImages = async () => {
    if (isLoading) {
      toast({
        title: "⏳ Sincronización en progreso",
        description: "Ya hay una sincronización en curso, por favor espera.",
        duration: 3000,
      })
      return
    }

    try {
      await syncImages()
      toast({
        title: "🔄 Sincronización completada",
        description: "Las imágenes han sido sincronizadas con el servidor.",
        duration: 4000,
      })
    } catch (error) {
      toast({
        title: "❌ Error de sincronización",
        description: "Error sincronizando imágenes. Ver consola para detalles.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // Exponer la función de sincronización forzada globalmente para debug
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).forceSyncImages = forceSyncImages
    }
  }, [forceSyncImages])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isLoading && (
        <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
          🔄 Sincronizando imágenes...
        </div>
      )}
      
      {lastSync && !isLoading && (
        <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm opacity-75">
          ✅ Sincronizado: {lastSync.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
} 