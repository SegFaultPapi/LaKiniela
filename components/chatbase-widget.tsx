'use client'

import { useEffect } from 'react'

interface ChatbaseWidgetProps {
  chatbotId: string
}

// Extender la interfaz Window para incluir ChatbaseWidget
declare global {
  interface Window {
    chatbaseConfig?: {
      chatbotId: string
    }
  }
}

export function ChatbaseWidget({ chatbotId }: ChatbaseWidgetProps) {
  useEffect(() => {
    // Verificar si ya existe el script
    const existingScript = document.querySelector('script[src*="chatbase.co/embed.min.js"]')
    if (existingScript) {
      return
    }

    // Configurar chatbaseConfig según la documentación oficial
    window.chatbaseConfig = {
      chatbotId: chatbotId,
    }

    // Cargar el script de Chatbase según la documentación oficial
    const script = document.createElement('script')
    script.src = 'https://www.chatbase.co/embed.min.js'
    script.setAttribute('chatbotId', chatbotId)
    script.setAttribute('defer', 'true')
    
    // Agregar evento para verificar cuando se carga
    script.onload = () => {
      console.log('Chatbase script loaded successfully with chatbotId:', chatbotId)
    }
    
    script.onerror = () => {
      console.error('Failed to load Chatbase script')
    }
    
    document.head.appendChild(script)

    return () => {
      // Limpiar el script al desmontar
      const scriptToRemove = document.querySelector('script[src*="chatbase.co/embed.min.js"]')
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove)
      }
      // Limpiar la configuración global
      delete window.chatbaseConfig
    }
  }, [chatbotId])

  return null
} 