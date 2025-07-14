"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Camera, 
  Check, 
  AlertCircle, 
  ArrowLeft,
  Upload,
  X
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"

export default function EditarPerfilPage() {
  const router = useRouter()
  const { 
    user, 
    isConnected, 
    isUserSetup, 
    setUsername: updateUsername,
    isUsernameAvailable,
    walletAddress,
    connectionType 
  } = useUser()

  const [newUsername, setNewUsername] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [imagePreview, setImagePreview] = useState("")

  // Redirigir si no está conectado
  useEffect(() => {
    if (!isConnected || !isUserSetup()) {
      router.push("/")
    }
  }, [isConnected, isUserSetup, router])

  // Cargar datos iniciales del usuario
  useEffect(() => {
    if (user) {
      setNewUsername(user.username)
      // Cargar imagen de perfil desde localStorage si existe
      const savedImage = localStorage.getItem(`la-kiniela-profile-image-${user.walletAddress}`)
      if (savedImage) {
        setProfileImage(savedImage)
        setImagePreview(savedImage)
      }
    }
  }, [user])

  const validateUsername = (value: string) => {
    if (!value) {
      return "El nombre de usuario es requerido"
    }
    
    if (value.length < 3) {
      return "El nombre de usuario debe tener al menos 3 caracteres"
    }
    
    if (value.length > 20) {
      return "El nombre de usuario no puede exceder 20 caracteres"
    }
    
    const regex = /^[a-zA-Z0-9_]+$/
    if (!regex.test(value)) {
      return "Solo se permiten letras, números y guiones bajos"
    }
    
    return null
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace('@', '')
    setNewUsername(value)
    setError("")
    setSuccess("")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError("Por favor selecciona un archivo de imagen válido")
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede ser mayor a 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImagePreview(result)
      setProfileImage(result)
      setError("")
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setProfileImage("")
    setImagePreview("")
    if (user) {
      localStorage.removeItem(`la-kiniela-profile-image-${user.walletAddress}`)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validar username
      const usernameError = validateUsername(newUsername)
      if (usernameError) {
        setError(usernameError)
        setIsLoading(false)
        return
      }

      // Verificar si el username cambió y si está disponible
      if (user && newUsername.toLowerCase() !== user.username.toLowerCase()) {
        if (!isUsernameAvailable(newUsername)) {
          setError("Este nombre de usuario ya está en uso")
          setIsLoading(false)
          return
        }
      }

      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Actualizar username si cambió
      if (user && newUsername.toLowerCase() !== user.username.toLowerCase()) {
        await updateUsername(newUsername)
      }

      // Guardar imagen de perfil
      if (user && profileImage) {
        localStorage.setItem(`la-kiniela-profile-image-${user.walletAddress}`, profileImage)
      } else if (user && !profileImage) {
        localStorage.removeItem(`la-kiniela-profile-image-${user.walletAddress}`)
      }

      setSuccess("Perfil actualizado exitosamente")
      
      // Redirigir después de un momento
      setTimeout(() => {
        router.push("/perfil")
      }, 2000)

    } catch (error) {
      setError("Error al actualizar el perfil. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const getUserInitials = () => {
    if (!user) return "U"
    const display = user.username
    if (display.includes('@')) {
      return display.substring(0, 2).toUpperCase()
    }
    return display.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2)
  }

  if (!isConnected || !isUserSetup() || !user) {
    return null // El useEffect redirigirá
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/perfil">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Perfil
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Editar Perfil</h1>
          <p className="text-muted-foreground">Personaliza tu información de usuario</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Información de la cuenta */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Cuenta</CardTitle>
              <CardDescription>
                Datos de tu wallet conectada (no editables)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Tipo de Conexión</Label>
                <div className="text-sm text-muted-foreground">{connectionType}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Dirección de Wallet</Label>
                <div className="text-sm text-muted-foreground font-mono">
                  {walletAddress}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Fecha de Registro</Label>
                <div className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editar perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Personalizar Perfil</CardTitle>
              <CardDescription>
                Cambia tu nombre de usuario y foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                {/* Foto de perfil */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Foto de Perfil</Label>
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={imagePreview} alt="Foto de perfil" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <label htmlFor="profile-image">
                          <Button type="button" variant="outline" className="cursor-pointer" asChild>
                            <span>
                              <Camera className="w-4 h-4 mr-2" />
                              {imagePreview ? "Cambiar Foto" : "Subir Foto"}
                            </span>
                          </Button>
                        </label>
                        {imagePreview && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={removeImage}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Quitar
                          </Button>
                        )}
                      </div>
                      <Input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="text-xs text-muted-foreground">
                        JPG, PNG o GIF. Máximo 5MB.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nombre de usuario */}
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary font-medium">
                      @
                    </div>
                    <Input
                      id="username"
                      type="text"
                      placeholder="tu_nombre_unico"
                      value={newUsername}
                      onChange={handleUsernameChange}
                      className="pl-8 text-base"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Tu perfil será: @{newUsername || "tu_nombre_unico"}
                  </div>
                </div>

                {/* Mensajes */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Botones */}
                <div className="flex justify-end space-x-4">
                  <Link href="/perfil">
                    <Button type="button" variant="outline" disabled={isLoading}>
                      Cancelar
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-sm space-y-2">
                <div className="font-medium">📝 Notas importantes:</div>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>• Tu nombre de usuario debe ser único en la plataforma</li>
                  <li>• La foto de perfil se almacena localmente en tu dispositivo</li>
                  <li>• Los cambios se guardan automáticamente al confirmar</li>
                  <li>• Tu dirección de wallet no puede ser modificada</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 