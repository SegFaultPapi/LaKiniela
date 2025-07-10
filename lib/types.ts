export interface EventoApuesta {
  id: string
  nombre: string
  descripcion: string
  pregunta: string // Nueva propiedad para la pregunta específica
  fechaFin: string
  categoria: string
  estado: "activo" | "finalizado" | "cancelado"
  opciones: [OpcionApuesta, OpcionApuesta] // Siempre exactamente 2 opciones: Sí y No
}

export interface OpcionApuesta {
  id: "si" | "no" // Solo puede ser "si" o "no"
  nombre: "Sí" | "No"
  cuota: number
  probabilidad: number
}

export interface ApuestaUsuario {
  id: string
  eventoId: string
  eventoNombre: string
  opcionId: string
  opcionNombre: string
  cantidad: number
  cuota: number
  estado: "pendiente" | "ganada" | "perdida"
  fechaApuesta: string
  gananciasPotenciales: number
}

export interface UsuarioWallet {
  direccion: string
  balanceMXNB: number
  conectado: boolean
}
