'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, MessageCircle } from 'lucide-react'

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
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isWidgetVisible, setIsWidgetVisible] = useState(true)

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
      
      // Observar cambios en el DOM para detectar cuando se abre/cierra el chat
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const chatWindow = document.querySelector('[data-testid="chat-window"]') || 
                              document.querySelector('.chatbase-chat-window') ||
                              document.querySelector('[class*="chat-window"]')
            
            if (chatWindow) {
              const element = chatWindow as HTMLElement
              const isVisible = element.style.display !== 'none' && 
                               element.style.visibility !== 'hidden' &&
                               !chatWindow.classList.contains('hidden')
              setIsChatOpen(isVisible)
            }
          }
        })
      })

      // Observar cambios en el body para detectar el widget de Chatbase
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      })
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

  const toggleChat = () => {
    // Buscar el botón del widget de Chatbase y hacer clic en él
    const chatbaseButton = document.querySelector('[data-testid="chat-button"]') ||
                          document.querySelector('.chatbase-button') ||
                          document.querySelector('[class*="chat-button"]') ||
                          document.querySelector('button[aria-label*="chat"]') ||
                          document.querySelector('button[aria-label*="Chat"]')
    
    if (chatbaseButton) {
      (chatbaseButton as HTMLElement).click()
    }
  }

  const closeChat = () => {
    // Buscar el botón de cerrar del widget de Chatbase
    const closeButton = document.querySelector('[data-testid="close-button"]') ||
                       document.querySelector('.chatbase-close-button') ||
                       document.querySelector('[class*="close-button"]') ||
                       document.querySelector('button[aria-label*="close"]') ||
                       document.querySelector('button[aria-label*="Close"]') ||
                       document.querySelector('button[aria-label*="cerrar"]')
    
    if (closeButton) {
      (closeButton as HTMLElement).click()
    } else {
      // Si no encontramos el botón de cerrar, intentamos cerrar haciendo clic en el botón principal
      toggleChat()
    }
  }

  const hideWidget = () => {
    setIsWidgetVisible(false)
    // Ocultar el widget de Chatbase con CSS
    const chatbaseWidget = document.querySelector('[data-testid="chat-widget"]') ||
                          document.querySelector('.chatbase-widget') ||
                          document.querySelector('[class*="chat-widget"]') ||
                          document.querySelector('#chatbase-widget')
    
    if (chatbaseWidget) {
      (chatbaseWidget as HTMLElement).style.display = 'none'
    }
  }

  const showWidget = () => {
    setIsWidgetVisible(true)
    // Mostrar el widget de Chatbase
    const chatbaseWidget = document.querySelector('[data-testid="chat-widget"]') ||
                          document.querySelector('.chatbase-widget') ||
                          document.querySelector('[class*="chat-widget"]') ||
                          document.querySelector('#chatbase-widget')
    
    if (chatbaseWidget) {
      (chatbaseWidget as HTMLElement).style.display = 'block'
    }
  }

  if (!isWidgetVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50 chatbase-controls">
        <Button
          onClick={showWidget}
          size="sm"
          className="chatbase-show-button chatbase-control-button rounded-full w-12 h-12 p-0"
          title="Mostrar chatbot"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 chatbase-controls">
      {/* Botón para cerrar el chat cuando está abierto */}
      {isChatOpen && (
        <Button
          onClick={closeChat}
          size="sm"
          className="chatbase-close-button chatbase-control-button rounded-full w-10 h-10 p-0 ml-auto"
          title="Cerrar chat"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      
      {/* Botón para ocultar completamente el widget */}
      <Button
        onClick={hideWidget}
        size="sm"
        className="chatbase-hide-button chatbase-control-button rounded-full w-10 h-10 p-0 ml-auto"
        title="Ocultar chatbot"
      >
        <X className="w-4 h-4 text-gray-600" />
      </Button>
    </div>
  )
} 