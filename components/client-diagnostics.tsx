"use client"

import { useEffect } from 'react'

export function ClientDiagnostics() {
  useEffect(() => {
    // Cargar las funciones de diagnóstico solo en el cliente
    const loadDiagnostics = async () => {
      try {
        const contractChecker: any = await import('@/lib/contract-checker')
        
        // Hacer las funciones disponibles globalmente
        if (typeof window !== 'undefined') {
          (window as any).checkContracts = contractChecker.checkContracts
          (window as any).quickCheck = contractChecker.quickCheck
          console.log('✅ Funciones de diagnóstico cargadas:')
          console.log('💡 Uso: checkContracts() o checkContracts("0xTU_DIRECCION")')
          console.log('⚡ Verificación rápida: quickCheck()')
        }
      } catch (error) {
        console.warn('No se pudieron cargar las funciones de diagnóstico:', error)
      }
    }
    
    loadDiagnostics()
  }, [])

  // Este componente no renderiza nada
  return null
} 