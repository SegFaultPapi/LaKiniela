# La Kiniela - Plataforma de Mercados de Predicción

La primera plataforma de mercados de predicción descentralizada para Latinoamérica. Apuesta con MXNB y gana con la sabiduría de la multitud.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/clavelys-projects-2222f089/v0-la-kiniela-landing-page-wx)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/kSfEnmMjJ6C)

## 🚀 Características

- **Mercados de Predicción Descentralizados**: Crea y participa en mercados de predicción binarios (Sí/No)
- **Token MXNB**: Utiliza el token nativo para las apuestas
- **Upload de Imágenes**: Los creadores pueden subir imágenes representativas para sus markets
- **Interfaz Intuitiva**: Diseño moderno y responsive
- **Blockchain Arbitrum**: Construido sobre Arbitrum para transacciones rápidas y económicas

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Blockchain**: Wagmi, RainbowKit, Arbitrum
- **Almacenamiento**: localStorage (para desarrollo), IPFS (para producción)

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/LaKiniela.git
cd LaKiniela

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

## 🎯 Uso

### Crear un Market

1. Conecta tu wallet compatible con Arbitrum
2. Haz clic en "Crear Market"
3. Completa el formulario:
   - Nombre del market
   - Descripción
   - Pregunta de predicción
   - Categoría
   - **Imagen** (opcional - arrastra o selecciona una imagen)
   - Fecha de finalización
   - Pool inicial (MXNB)
4. Haz clic en "Crear Market"

### Participar en un Market

1. Navega por los markets disponibles
2. Selecciona un market activo
3. Elige tu predicción (Sí/No)
4. Ingresa la cantidad de MXNB
5. Confirma tu participación

## 🗑️ Gestión de Markets

### Eliminar Todos los Markets

Para limpiar todos los markets existentes (útil durante desarrollo):

#### Opción 1: Consola del Navegador (Recomendado)

1. Abre las herramientas de desarrollador (`F12`)
2. Ve a la pestaña "Console"
3. Ejecuta:

```javascript
localStorage.removeItem("la-kiniela-markets");
localStorage.removeItem("la-kiniela-participations");
console.log("✅ Markets eliminados");
location.reload();
```

#### Opción 2: Usando la API

```javascript
// En la consola del navegador:
MarketStorage.clearAllMarkets();
location.reload();
```

#### Opción 3: Manual desde DevTools

1. Abre las herramientas de desarrollador (`F12`)
2. Ve a "Application" → "Local Storage"
3. Elimina las claves:
   - `la-kiniela-markets`
   - `la-kiniela-participations`

### Eliminar Markets Específicos

Para eliminar un market específico, puedes usar:

```javascript
// Obtener todos los markets
const markets = MarketStorage.getMarkets();

// Filtrar el market que quieres eliminar
const marketsFiltrados = markets.filter(
  (market) => market.id !== "ID_DEL_MARKET"
);

// Guardar la lista actualizada
localStorage.setItem("la-kiniela-markets", JSON.stringify(marketsFiltrados));
```

## 📁 Estructura del Proyecto

```
LaKiniela/
├── app/                    # Páginas de Next.js
│   ├── api/               # API routes
│   │   └── upload/        # Upload de imágenes
│   ├── apuestas/          # Página de apuestas
│   └── perfil/            # Página de perfil
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI
│   └── image-upload.tsx  # Componente de upload
├── lib/                  # Utilidades y configuración
│   ├── market-storage.ts # Gestión de markets
│   ├── types.ts          # Tipos TypeScript
│   └── web3-config.ts    # Configuración Web3
├── hooks/                # Custom hooks
└── public/               # Archivos estáticos
    └── uploads/          # Imágenes subidas
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### Contratos

Los contratos están en la carpeta `contracts/`:

- `PredictionMarket.sol`: Contrato principal de mercados de predicción
- `MXNB.sol`: Token ERC20 para las apuestas

## 🚀 Deployment

El proyecto está configurado para desplegarse en Vercel:

**[https://vercel.com/clavelys-projects-2222f089/v0-la-kiniela-landing-page-wx](https://vercel.com/clavelys-projects-2222f089/v0-la-kiniela-landing-page-wx)**

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🔗 Enlaces

- [V0.dev Project](https://v0.dev/chat/projects/kSfEnmMjJ6C)
- [Vercel Deployment](https://vercel.com/clavelys-projects-2222f089/v0-la-kiniela-landing-page-wx)
- [Arbitrum Documentation](https://docs.arbitrum.io/)
