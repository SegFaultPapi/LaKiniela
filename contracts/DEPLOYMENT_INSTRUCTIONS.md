# 🚀 Instrucciones para Deployment del Contrato Corregido

## 🐛 Problema Identificado

El contrato actual `PredictionMarketSimple.sol` tiene un error en la línea 97:

```solidity
if (_amount < 1e18) revert MinimumBetRequired(); // ❌ INCORRECTO
```

**Problema:** El contrato requiere `1e18` wei (1,000,000,000,000 MXNB) como mínimo para apostar, pero MXNB tiene 6 decimales, no 18.

## ✅ Solución Implementada

El contrato ha sido corregido a `PredictionMarketFixed.sol` con el cambio:

```solidity
if (_amount < 1e6) revert MinimumBetRequired(); // ✅ CORRECTO para tokens de 6 decimales
```

## 📋 Pasos para Deployment

### 1. Compilar y Deployar el Nuevo Contrato

En Remix o tu herramienta preferida:

1. **Usar el archivo:** `contracts/PredictionMarketSimple.sol` (ya actualizado)
2. **Nombre del contrato:** `PredictionMarketFixed`
3. **Parámetros de constructor:**
   - `_bettingToken`: `0x82B9e52b26A2954E113F94Ff26647754d5a4247D` (MXNB Token)
   - `_feeCollector`: Tu dirección de owner
   - `_initialFee`: `0` o el fee que prefieras (en basis points, ej: 250 = 2.5%)

### 2. Actualizar la Dirección en el Frontend

Una vez desplegado, actualizar en `lib/contracts-config.ts`:

```typescript
export const CONTRACTS = {
  PREDICTION_MARKET: "NUEVA_DIRECCION_AQUI" as `0x${string}`,
  MXNB_TOKEN: "0x82B9e52b26A2954E113F94Ff26647754d5a4247D" as `0x${string}`,
}
```

### 3. Verificar Funcionalidad

Después del deployment:

1. ✅ Minimum bet amount será **1 MXNB** (no 1 trillón)
2. ✅ Los usuarios podrán apostar cantidades normales (100 MXNB, 500 MXNB, etc.)
3. ✅ Todas las validaciones funcionarán correctamente

## 🔍 Verificaciones Post-Deployment

Confirmar que estos valores funcionan:

- **Apuesta mínima:** 1 MXNB ✅
- **Apuesta típica:** 100 MXNB ✅
- **Balance usuario:** 10,000 MXNB ✅
- **Allowance:** Infinito ✅

## 📝 Notas Importantes

- El contrato anterior (`0x9Dc4ef29d511A2C37E6F001af9c9868DbCA923F7`) quedará obsoleto
- Los markets existentes en el contrato anterior no serán accesibles desde el frontend
- El nuevo contrato empezará con `marketCount = 0`
- El frontend ya está preparado para trabajar con el contrato corregido

## 🚨 Cambios Realizados en el Código

1. **Contrato:** `1e18` → `1e6` en función `buyShares()`
2. **Frontend:** `MIN_BET_AMOUNT` revertido a `"1000000"` (1 MXNB)
3. **Validaciones:** Actualizadas para el nuevo contrato
4. **Diagnósticos:** Listos para debug si surgen problemas

Una vez deployado el nuevo contrato, ¡todo debería funcionar perfectamente! 🎉 