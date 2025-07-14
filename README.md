# 🎯 LaKiniela - Mercados de Predicción

Una aplicación descentralizada de mercados de predicción construida en **Arbitrum Sepolia** con Next.js, TypeScript, y Solidity.

## 📋 Características Principales

### 🎲 **Para Usuarios:**
- **Conectar Wallet** - Soporte para MetaMask, WalletConnect, etc.
- **Detección de Red** - Automática verificación de Arbitrum Sepolia
- **Allowance Infinito** - Aprueba una vez, usa infinitas veces
- **Apostar en Mercados** - Compra shares en Opción A o B
- **Reclamar Ganancias** - Automático cuando el mercado se resuelve
- **Explorer Links** - Seguimiento de transacciones en Arbiscan

### 🛠️ **Para Administradores:**
- **Crear Mercados** - Nuevos mercados con preguntas personalizadas
- **Resolver Mercados** - Determinar ganadores o cancelar
- **Gestión de Comisiones** - Configurar y retirar fees
- **Panel de Admin** - Interfaz dedicada para propietarios

### 🔧 **Características Técnicas:**
- **Smart Contract Optimizado** - Custom errors, storage packing
- **Gas Eficiente** - Hasta 90% menos gas en errores
- **TypeScript** - Tipado fuerte para mejor desarrollo
- **Manejo de Errores** - Mensajes user-friendly en español
- **Estados de Carga** - Feedback en tiempo real

## 🚀 Instalación y Configuración

### 📋 **Prerrequisitos:**
```bash
# Node.js v18 o superior
node --version

# npm o yarn
npm --version
```

### 🔧 **Instalación:**
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/LaKiniela.git
cd LaKiniela

# Instalar dependencias
npm install
```

### ⚙️ **Configuración de Entorno:**
```bash
# Crear archivo .env.local
cp .env.example .env.local

# Editar con tus valores
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=tu_project_id_aqui
```

### 🌐 **Configuración de Red:**
La aplicación está configurada para **Arbitrum Sepolia**:
- **Chain ID:** 421614
- **RPC URL:** https://sepolia-rollup.arbitrum.io/rpc
- **Explorer:** https://sepolia.arbiscan.io

## 💰 Obtener Tokens de Testnet

### 🔥 **ETH para Gas:**
1. Ve a [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
2. Introduce tu dirección de wallet
3. Recibe ETH gratis

### 🪙 **MXNB para Apuestas:**
- **Dirección:** `0x82B9e52b26A2954E113F94Ff26647754d5a4247D`
- Contacta al equipo para obtener tokens MXNB de prueba

## 🏗️ Deploy del Smart Contract

### 📝 **En Remix IDE:**
1. Abre [Remix IDE](https://remix.ethereum.org/)
2. Crea nuevo archivo: `PredictionMarketSimple.sol`
3. Copia el código desde `/contracts/PredictionMarketSimple.sol`
4. Compila con Solidity 0.8.19
5. Deploy en Arbitrum Sepolia con parámetros:
   ```
   _bettingToken: 0x82B9e52b26A2954E113F94Ff26647754d5a4247D
   _feeCollector: TU_WALLET_ADDRESS
   _initialFee: 100
   ```

### 🔄 **Actualizar Frontend:**
```typescript
// En lib/web3-config.ts
export const CONTRACTS = {
  PREDICTION_MARKET: "0xTU_DIRECCION_DEPLOYADA" as `0x${string}`,
  MXNB_TOKEN: "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" as `0x${string}`,
}
```

## 🎬 Ejecutar la Aplicación

### 🔥 **Desarrollo:**
```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
# http://localhost:3000
```

### 🚀 **Producción:**
```bash
# Build para producción
npm run build

# Iniciar servidor de producción
npm start
```

## 🎯 Uso de la Aplicación

### 👤 **Para Usuarios:**
1. **Conectar Wallet** - Usa el botón "Connect Wallet"
2. **Verificar Red** - Cambia a Arbitrum Sepolia si es necesario
3. **Aprobar Allowance** - Una sola vez para usar la aplicación
4. **Seleccionar Mercado** - Ingresa el ID del mercado
5. **Apostar** - Elige Opción A o B y la cantidad
6. **Reclamar** - Cuando el mercado se resuelva

### 🔧 **Para Administradores:**
1. **Crear Mercados** - Tab "Admin" > "Crear Mercado"
2. **Resolver Mercados** - Tab "Admin" > "Resolver Mercado"
3. **Verificar Transacciones** - Enlaces automáticos a Arbiscan

## 📚 Estructura del Proyecto

```
LaKiniela/
├── contracts/                 # Smart contracts
│   └── PredictionMarketSimple.sol
├── components/               # Componentes React
│   ├── ui/                  # Componentes UI base
│   └── prediction-market-example.tsx
├── hooks/                   # Custom hooks
│   └── use-prediction-market-v2.ts
├── lib/                     # Librerías y configuración
│   ├── web3-config.ts      # Configuración Web3
│   └── prediction-market-abi.ts
├── app/                     # App Router de Next.js
│   └── api/contract/       # API routes
└── SMART_CONTRACT_INTEGRATION.md
```

## 🔧 Funciones Principales

### 📖 **Funciones de Lectura:**
- `getMarketInfo(marketId)` - Información del mercado
- `getUserShares(marketId, user)` - Shares del usuario
- `getUserInfoAdvanced(user, amount)` - Info completa del usuario
- `hasInfiniteAllowance(user)` - Estado del allowance

### ✍️ **Funciones de Escritura:**
- `buyShares(marketId, isOptionA, amount)` - Comprar shares
- `claimWinnings(marketId)` - Reclamar ganancias
- `approveInfiniteMXNB()` - Aprobar allowance infinito

### 🛠️ **Funciones de Admin:**
- `createMarket(question, optionA, optionB, duration)` - Crear mercado
- `resolveMarket(marketId, outcome)` - Resolver mercado

## 🐛 Solución de Problemas

### 🔧 **Herramientas de Diagnóstico:**

#### 1. **Diagnóstico desde la App:**
```bash
# Ir a la aplicación y usar la pestaña "Diagnóstico"
http://localhost:3000

# O ir directamente a la página de diagnóstico
http://localhost:3000/diagnostics
```

#### 2. **Diagnóstico desde la Consola del Navegador:**
```javascript
// Abre la consola del navegador (F12) y ejecuta:

// Verificación rápida
quickCheck()

// Verificación completa
checkContracts()

// Verificación con tu dirección de wallet
checkContracts("0xTU_DIRECCION_DE_WALLET")
```

### ❌ **Errores Comunes:**

#### "Balance MXNB no se muestra"
```bash
# Problema: Token MXNB no responde
# Causa más común: Dirección del token incorrecta o red incorrecta

# Verificar en la consola:
checkContracts("0xTU_WALLET")

# Verificar en Arbiscan:
https://sepolia.arbiscan.io/address/0x82B9e52b26A2954E113F94Ff26647754d5a4247D
```

#### "No puedo interactuar con el smart contract"
```bash
# Problema: Contrato principal no responde
# Causa más común: Contrato no deployado o dirección incorrecta

# Verificar en Arbiscan:
https://sepolia.arbiscan.io/address/0x9Dc4ef29d511A2C37E6F001af9c9868DbCA923F7

# Verificar que el contrato tenga:
# - Código fuente verificado
# - Funciones marketCount, bettingToken, etc.
```

#### "Red Incorrecta"
```bash
# Solución: Cambiar a Arbitrum Sepolia
Chain ID: 421614
RPC: https://sepolia-rollup.arbitrum.io/rpc
```

#### "Insufficient allowance"
```bash
# Solución: Aprobar allowance infinito
await approveInfiniteMXNB()
```

#### "Contract not found"
```bash
# Solución: Verificar dirección en web3-config.ts
PREDICTION_MARKET: "0xDIRECCION_CORRECTA"
```

### 🔍 **Proceso de Diagnóstico Paso a Paso:**

#### **Paso 1: Verificar Red**
1. Conecta tu wallet
2. Verifica que estés en Arbitrum Sepolia (Chain ID: 421614)
3. Si no, cambia de red en tu wallet

#### **Paso 2: Verificar Contratos**
1. Ve a `/diagnostics` en la aplicación
2. Ejecuta el diagnóstico completo
3. Revisa los errores mostrados

#### **Paso 3: Verificar en Arbiscan**
1. **Token MXNB:** [Ver en Arbiscan](https://sepolia.arbiscan.io/address/0x82B9e52b26A2954E113F94Ff26647754d5a4247D)
2. **Tu Contrato:** `https://sepolia.arbiscan.io/address/0x9Dc4ef29d511A2C37E6F001af9c9868DbCA923F7`
3. Verifica que ambos contratos existan y tengan código

#### **Paso 4: Verificar Configuración**
```typescript
// En lib/web3-config.ts - deben coincidir con los contratos deployados
export const CONTRACTS = {
  PREDICTION_MARKET: "0x9Dc4ef29d511A2C37E6F001af9c9868DbCA923F7" as `0x${string}`,
  MXNB_TOKEN: "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" as `0x${string}`,
}
```

### 🔍 **Depuración:**
```bash
# Ver logs en consola del navegador
console.log('Error:', error)

# Verificar transacciones en Arbiscan
https://sepolia.arbiscan.io/tx/HASH

# Usar herramientas de diagnóstico
checkContracts("TU_WALLET_ADDRESS")
```

## 🧪 Testing

### 🔬 **Testear Funcionalidades:**
1. **Conectar Wallet** - Verificar conexión exitosa
2. **Cambiar Red** - Probar detección de red incorrecta
3. **Aprobar Allowance** - Verificar allowance infinito
4. **Crear Mercado** - Solo si eres owner
5. **Apostar** - Comprar shares en mercados
6. **Resolver** - Solo si eres owner
7. **Reclamar** - Obtener ganancias

### 📊 **Verificar en Arbiscan:**
- Transacciones exitosas
- Eventos del contrato
- Balances de tokens

## 🤝 Contribuir

### 🛠️ **Desarrollo:**
```bash
# Fork del repositorio
git fork https://github.com/tu-usuario/LaKiniela

# Crear rama para feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commit
git commit -m "Añadir nueva funcionalidad"

# Push y crear Pull Request
git push origin feature/nueva-funcionalidad
```

### 📝 **Reportar Bugs:**
1. Ir a [Issues](https://github.com/tu-usuario/LaKiniela/issues)
2. Crear nuevo issue
3. Incluir descripción detallada y pasos para reproducir

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🔗 Enlaces Útiles

- **Arbitrum Sepolia Explorer:** https://sepolia.arbiscan.io
- **Arbitrum Sepolia Faucet:** https://faucet.quicknode.com/arbitrum/sepolia
- **Remix IDE:** https://remix.ethereum.org/
- **Documentación Wagmi:** https://wagmi.sh/
- **Documentación Rainbow Kit:** https://www.rainbowkit.com/

## 📞 Soporte

Para soporte técnico:
- 📧 Email: soporte@lakiniela.com
- 💬 Discord: [LaKiniela Community](https://discord.gg/lakiniela)
- 🐦 Twitter: [@LaKiniela](https://twitter.com/lakiniela)

---

**🎯 ¡Disfruta apostando en los mercados de predicción más innovadores en Arbitrum Sepolia!** 🚀
