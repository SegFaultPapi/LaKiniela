"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { usePortalWallet } from '@/hooks/usePortalWallet'

export interface UserData {
  username: string
  walletAddress: string
  connectionType: 'Portal Wallet' | 'Wallet Tradicional' | 'Gmail'
  createdAt: string
}

export function useUser() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsUsernameSetup, setNeedsUsernameSetup] = useState(false)
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)
  const [userExistsForWallet, setUserExistsForWallet] = useState(false)
  
  const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount()
  const { isConnected: isPortalConnected, walletAddress: portalAddress } = usePortalWallet()

  // Estado de conexión consolidado
  const isConnected = isWagmiConnected || isPortalConnected
  const walletAddress = portalAddress || wagmiAddress || ''
  const connectionType = isPortalConnected ? 'Portal Wallet' : 
                        isWagmiConnected ? 'Wallet Tradicional' : 
                        'Gmail'

  // Función para verificar si existe un usuario para una wallet específica
  const checkUserExistsForWallet = useCallback((address: string): UserData | null => {
    try {
      const userData = localStorage.getItem('la-kiniela-user')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        if (parsedUser.walletAddress === address) {
          return parsedUser
        }
      }
      return null
    } catch (error) {
      console.error('Error checking user data:', error)
      return null
    }
  }, [])

  // Cargar datos del usuario desde localStorage
  const loadUserData = useCallback(() => {
    if (!walletAddress) {
      setUser(null)
      setNeedsUsernameSetup(false)
      setShowUsernameDialog(false)
      setUserExistsForWallet(false)
      setIsLoading(false)
      return
    }

    const existingUser = checkUserExistsForWallet(walletAddress)
    
    if (existingUser) {
      // Usuario existe para esta wallet
      setUser(existingUser)
      setNeedsUsernameSetup(false)
      setShowUsernameDialog(false)
      setUserExistsForWallet(true)
    } else {
      // No hay usuario para esta wallet
      setUser(null)
      setNeedsUsernameSetup(isConnected)
      setShowUsernameDialog(false) // No mostrar automáticamente
      setUserExistsForWallet(false)
    }
    
    setIsLoading(false)
  }, [walletAddress, isConnected, checkUserExistsForWallet])

  // Efecto para cargar datos cuando cambia la conexión
  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  // Función para configurar el nombre de usuario
  const setUsername = useCallback((username: string) => {
    const userData: UserData = {
      username: username.toLowerCase(),
      walletAddress,
      connectionType,
      createdAt: new Date().toISOString()
    }

    try {
      localStorage.setItem('la-kiniela-user', JSON.stringify(userData))
      
      // Agregar a lista de usernames existentes
      const existingUsernames = JSON.parse(localStorage.getItem('la-kiniela-usernames') || '[]')
      if (!existingUsernames.includes(username.toLowerCase())) {
        existingUsernames.push(username.toLowerCase())
        localStorage.setItem('la-kiniela-usernames', JSON.stringify(existingUsernames))
      }

      setUser(userData)
      setNeedsUsernameSetup(false)
      setShowUsernameDialog(false)
      setUserExistsForWallet(true)
    } catch (error) {
      console.error('Error setting username:', error)
      throw error
    }
  }, [walletAddress, connectionType])

  // Función para cerrar el diálogo de username
  const closeUsernameDialog = useCallback(() => {
    setShowUsernameDialog(false)
  }, [])

  // Función para forzar mostrar el diálogo de username (solo para registro)
  const showUsernameSetup = useCallback(() => {
    setShowUsernameDialog(true)
  }, [])

  // Función para iniciar sesión (usuario existente)
  const loginExistingUser = useCallback(() => {
    if (!walletAddress) return
    
    const existingUser = checkUserExistsForWallet(walletAddress)
    if (existingUser) {
      setUser(existingUser)
      setNeedsUsernameSetup(false)
      setShowUsernameDialog(false)
      setUserExistsForWallet(true)
    }
  }, [walletAddress, checkUserExistsForWallet])

  // Función para desconectar usuario
  const logout = useCallback(() => {
    try {
      setUser(null)
      setNeedsUsernameSetup(false)
      setShowUsernameDialog(false)
      setUserExistsForWallet(false)
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }, [])

  // Función para verificar si un username está disponible
  const isUsernameAvailable = useCallback((username: string): boolean => {
    try {
      const existingUsernames = JSON.parse(localStorage.getItem('la-kiniela-usernames') || '[]')
      return !existingUsernames.includes(username.toLowerCase())
    } catch (error) {
      console.error('Error checking username availability:', error)
      return false
    }
  }, [])

  return {
    // Estado del usuario
    user,
    isLoading,
    isConnected,
    needsUsernameSetup,
    showUsernameDialog,
    userExistsForWallet,
    
    // Información de conexión
    walletAddress,
    connectionType,
    
    // Funciones
    setUsername,
    closeUsernameDialog,
    showUsernameSetup,
    loginExistingUser,
    logout,
    isUsernameAvailable,
    
    // Helpers
    getUserDisplay: () => user ? `@${user.username}` : '',
    isUserSetup: () => user !== null && !needsUsernameSetup,
  }
} 