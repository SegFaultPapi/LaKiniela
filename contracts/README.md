# Smart Contracts - La Kiniela

Esta carpeta contiene los contratos inteligentes de **La Kiniela** para consulta y referencia.

## ⚠️ Importante

Estos contratos son **solo para consulta** y no están integrados con el proyecto Next.js. No requieren compilación ni instalación de dependencias.

## Contratos Incluidos

### 1. PredictionMarket.sol
- **Propósito**: Contrato principal para mercados de predicción descentralizados
- **Funcionalidades**:
  - Crear mercados binarios (Opción A / Opción B)
  - Comprar shares en mercados activos
  - Resolver mercados con outcomes específicos
  - Reclamar ganancias de mercados ganadores
  - Batch claim para múltiples usuarios

### 2. MXNB.sol (Próximamente)
- **Propósito**: Token ERC20 para las apuestas
- **Funcionalidades**: Token estándar con funciones de mint/burn

## Dependencias Requeridas (para compilación)

Si quisieras compilar estos contratos, necesitarías:

```solidity
@openzeppelin/contracts ^4.9.0
```

### Imports utilizados:
- `@openzeppelin/contracts/token/ERC20/IERC20.sol`
- `@openzeppelin/contracts/access/Ownable.sol`
- `@openzeppelin/contracts/security/ReentrancyGuard.sol`

## Redes de Despliegue

Los contratos están diseñados para desplegarse en:
- **Arbitrum Mainnet**
- **Arbitrum Sepolia** (testnet)

## Uso en la DApp

La integración con la DApp se realiza a través de:
- **Hook personalizado**: `usePredictionMarket` en `/hooks/use-prediction-market.ts`
- **Configuración Web3**: `/lib/web3-config.ts`
- **Tipos TypeScript**: `/lib/types.ts` 