# La Kiniela - Plataforma de Mercados de Predicción con Portal SDK

La primera plataforma de mercados de predicción descentralizada para Latinoamérica, ahora potenciada con el Portal SDK para wallets descentralizadas seguras. Apuesta con MXNB y gana con la sabiduría de la multitud.

## 🚀 Características Principales

### ✨ Portal SDK Integrado

- **Wallets MPC**: Utiliza tecnología Multi-Party Computation para mayor seguridad
- **Configuración API Key**: Gestión sencilla de credenciales Portal
- **Transacciones Rápidas**: Envío de ETH en Arbitrum Sepolia optimizado
- **Firma de Mensajes**: Capacidad de firmar mensajes de forma segura
- **Balance en Tiempo Real**: Monitoreo automático del balance del wallet

### 🔐 Seguridad y Descentralización

- **Contratos Inteligentes**: Lógica de negocio inmutable en Arbitrum
- **Portal MPC**: Wallets sin custodia con tecnología de vanguardia
- **Arbitrum Sepolia**: Red de pruebas con costos bajos
- **Transparencia**: Todas las transacciones verificables en blockchain

### 🌎 Diseñado para Latinoamérica

- **Token MXNB**: Moneda estable para la región
- **Interfaz en Español**: Experiencia nativa en español
- **Mercados Relevantes**: Predicciones sobre eventos latinoamericanos

### 📸 Funcionalidades Adicionales

- **Upload de Imágenes**: Los creadores pueden subir imágenes representativas para sus markets
- **Interfaz Intuitiva**: Diseño moderno y responsive
- **Blockchain Arbitrum**: Construido sobre Arbitrum para transacciones rápidas y económicas

## 🛠️ Tecnologías Utilizadas

### Frontend

- **Next.js 15**: Framework React con App Router
- **TypeScript**: Tipado estático para mayor robustez
- **Tailwind CSS**: Estilos utilitarios y responsivos
- **shadcn/ui**: Componentes UI modernos y accesibles

### Blockchain

- **Portal SDK**: Wallet-as-a-Service con MPC
- **Arbitrum Sepolia**: Red de pruebas L2
- **Viem**: Biblioteca TypeScript para Ethereum
- **Wagmi**: Hooks React para Web3 (como respaldo)

### UI/UX

- **Lucide React**: Iconos modernos y consistentes
- **Radix UI**: Componentes primitivos accesibles
- **Framer Motion**: Animaciones suaves (planificado)

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/LaKiniela.git

# Instalar dependencias
cd LaKiniela
npm install
# o
pnpm install

# Ejecutar en desarrollo
npm run dev
# o
pnpm dev
```

## 🔧 Configuración

### 1. Portal SDK API Key

1. Visita [Portal Dashboard](https://docs.portalhq.io/)
2. Crea una cuenta y obtén tu API Key
3. En la aplicación, navega a `/portal`
4. Ingresa tu API Key para inicializar el SDK

### 2. Variables de Entorno (Opcional)

```bash
# .env.local
NEXT_PUBLIC_PORTAL_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

## 🎯 Uso

### Crear un Market

1. Conecta tu wallet compatible con Arbitrum o usa Portal Wallet
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

## 🌟 Funcionalidades Portal SDK

### Gestión de Wallets

- **Crear Wallet**: Generar nuevas wallets MPC
- **Conexión Segura**: Autenticación sin exponer claves privadas
- **Balance Automático**: Actualización en tiempo real
- **Desconexión Segura**: Limpieza completa de sesión

### Transacciones

- **Envío de ETH**: Transferencias nativas en Arbitrum Sepolia
- **Estimación de Gas**: Cálculo automático de costos
- **Confirmación**: Seguimiento del estado de transacciones
- **Explorador**: Enlaces directos a Arbiscan

### Seguridad

- **Firma de Mensajes**: Validación criptográfica
- **MPC Technology**: Claves distribuidas para mayor seguridad
- **Sin Custodia**: El usuario mantiene control total
- **Recuperación**: Métodos seguros de recuperación de wallet

## 🎯 Uso del Portal Wallet

### 1. Inicialización

```typescript
// Usando el hook usePortalWallet
const {
  initializePortal,
  createWallet,
  sendTransaction,
  signMessage,
  isConnected,
  walletAddress,
  balance,
} = usePortalWallet();

// Inicializar con API Key
await initializePortal("tu_api_key");
```

### 2. Crear Wallet

```typescript
// Crear nuevo wallet MPC
await createWallet();
console.log("Wallet creado:", walletAddress);
```

### 3. Enviar Transacciones

```typescript
// Enviar ETH
const tx = await sendTransaction({
  to: "0xRecipientAddress",
  value: "1000000000000000000", // 1 ETH en wei
});
console.log("Transacción:", tx.hash);
```

### 4. Firmar Mensajes

```typescript
// Firmar mensaje
const signature = await signMessage("Mensaje a firmar");
console.log("Firma:", signature);
```

## 🔄 Migración desde RainbowKit

La aplicación mantiene compatibilidad con RainbowKit para usuarios que prefieren wallets tradicionales:

```typescript
// Componente híbrido
{
  !isConnected ? (
    <div className="flex gap-4">
      <ConnectButton /> {/* RainbowKit */}
      <Link href="/portal">
        <Button>Portal Wallet</Button>
      </Link>
    </div>
  ) : (
    <WalletInfo />
  );
}
```

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

## 🏗️ Arquitectura

```
LaKiniela/
├── app/
│   ├── portal/          # Página Portal Wallet
│   ├── perfil/          # Perfil de usuario
│   ├── apuestas/        # Página de apuestas
│   └── page.tsx         # Página principal
├── components/
│   ├── portal-wallet-setup.tsx  # Configuración Portal
│   ├── ui/                       # Componentes UI base
│   ├── image-upload.tsx         # Componente de upload
│   └── ...
├── hooks/
│   ├── usePortalWallet.ts       # Hook principal Portal
│   ├── use-prediction-market.ts # Hook mercados
│   └── useUser.ts              # Hook de usuario
├── lib/
│   ├── market-storage.ts       # Gestión de markets
│   ├── types.ts               # Tipos TypeScript
│   └── web3-config.ts         # Configuración Web3
└── public/
    └── uploads/               # Imágenes subidas
```

## 🎨 Componentes Principales

### PortalWalletSetup

Componente principal para configurar y usar Portal SDK:

- Configuración de API Key
- Creación de wallets
- Interfaz de transacciones
- Gestión de balance

### usePortalWallet Hook

Hook personalizado que encapsula toda la lógica del Portal SDK:

- Inicialización del SDK
- Gestión de estado del wallet
- Operaciones de transacciones
- Manejo de errores

## 🔒 Seguridad

### Mejores Prácticas Implementadas

- **API Key Storage**: Almacenamiento seguro en localStorage
- **Error Handling**: Manejo robusto de errores
- **Type Safety**: TypeScript para prevenir errores
- **Validation**: Validación de inputs del usuario

### Consideraciones de Seguridad

- Las API Keys se almacenan localmente (considera usar variables de entorno en producción)
- Las transacciones requieren confirmación del usuario
- Los mensajes firmados son únicos y no reutilizables

## 🚀 Desarrollo

### Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Linting
npm run lint

# Start (producción)
npm run start
```

### Estructura de Desarrollo

1. **Components**: Componentes React reutilizables
2. **Hooks**: Lógica de negocio encapsulada
3. **Types**: Definiciones TypeScript
4. **Utils**: Funciones utilitarias

## 📱 Responsive Design

La aplicación está optimizada para:

- **Desktop**: Experiencia completa con sidebar
- **Tablet**: Diseño adaptativo
- **Mobile**: Interfaz móvil optimizada

## 🌍 Roadmap

### Próximas Características

- [ ] Integración con mainnet Arbitrum
- [ ] Múltiples tokens de pago
- [ ] Notificaciones push
- [ ] Dashboard de analytics
- [ ] API pública

### Mejoras del Portal SDK

- [ ] Múltiples métodos de autenticación
- [ ] Backup y recuperación mejorada
- [ ] Soporte para múltiples redes
- [ ] Integración con DeFi protocols

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🔗 Enlaces Útiles

- [Portal SDK Documentation](https://docs.portalhq.io/)
- [Arbitrum Sepolia Explorer](https://sepolia.arbiscan.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [V0.dev Project](https://v0.dev/chat/projects/kSfEnmMjJ6C)
- [Vercel Deployment](https://vercel.com/clavelys-projects-2222f089/v0-la-kiniela-landing-page-wx)
- [Arbitrum Documentation](https://docs.arbitrum.io/)

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

- Abre un issue en GitHub
- Contacta al equipo en [email]
- Únete a nuestra comunidad en Discord

---

**La Kiniela** - Predicciones descentralizadas para Latinoamérica 🌎
