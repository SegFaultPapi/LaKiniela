export interface EventoApuesta {
  id: string
  nombre: string
  descripcion: string
  opciones: OpcionApuesta[]
  fechaFin: string
  categoria: string
  estado: "activo" | "finalizado" | "cancelado"
}

export interface OpcionApuesta {
  id: string
  nombre: string
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
