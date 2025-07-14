#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando configuración para deploy en Vercel...\n')

// Verificar archivos de configuración
const configChecks = [
  {
    file: 'vercel.json',
    check: (content) => {
      const config = JSON.parse(content)
      return config.functions && config.functions['app/api/upload/route.ts'] && !config.api
    },
    message: 'Configuración de Vercel (sin api.bodyParser para App Router)'
  },
  {
    file: 'next.config.mjs',
    check: (content) => {
      return content.includes('nextConfig') && !content.includes('api:') && !content.includes('bodyParser')
    },
    message: 'Configuración de Next.js (sin api.bodyParser para App Router)'
  },
  {
    file: 'app/api/upload/route.ts',
    check: (content) => {
      return content.includes('base64') && !content.includes('writeFile') && !content.includes('fs/promises') && content.includes('console.log')
    },
    message: 'API de upload compatible con Vercel (con logging detallado)'
  },
  {
    file: 'app/api/upload-debug/route.ts',
    check: (content) => {
      return content.includes('NextResponse') && content.includes('debug') && content.includes('Test 1')
    },
    message: 'API de upload-debug para troubleshooting'
  },
  {
    file: 'app/api/test/route.ts',
    check: (content) => {
      return content.includes('NextResponse') && content.includes('environment')
    },
    message: 'API de test para debugging'
  }
]

let allChecksPass = true

for (const { file, check, message } of configChecks) {
  try {
    const filePath = path.join(process.cwd(), file)
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${message}: Archivo ${file} no encontrado`)
      allChecksPass = false
      continue
    }

    const content = fs.readFileSync(filePath, 'utf8')
    
    if (check(content)) {
      console.log(`✅ ${message}: OK`)
    } else {
      console.log(`❌ ${message}: Configuración incorrecta en ${file}`)
      allChecksPass = false
    }
  } catch (error) {
    console.log(`❌ ${message}: Error verificando ${file} - ${error.message}`)
    allChecksPass = false
  }
}

// Verificar estructura de directorios
const dirChecks = [
  'app/api/upload',
  'app/api/upload-debug',
  'app/api/test',
  'components',
  'hooks',
  'lib'
]

console.log('\n🗂️ Verificando estructura de directorios...')

for (const dir of dirChecks) {
  const dirPath = path.join(process.cwd(), dir)
  if (fs.existsSync(dirPath)) {
    console.log(`✅ Directorio ${dir}: OK`)
  } else {
    console.log(`❌ Directorio ${dir}: No encontrado`)
    allChecksPass = false
  }
}

// Verificar package.json
console.log('\n📦 Verificando package.json...')
try {
  const packagePath = path.join(process.cwd(), 'package.json')
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  
  const requiredDeps = [
    'next',
    'react',
    'viem',
    'wagmi',
    '@rainbow-me/rainbowkit'
  ]
  
  for (const dep of requiredDeps) {
    if (packageContent.dependencies && packageContent.dependencies[dep]) {
      console.log(`✅ Dependencia ${dep}: OK`)
    } else {
      console.log(`❌ Dependencia ${dep}: No encontrada`)
      allChecksPass = false
    }
  }
} catch (error) {
  console.log(`❌ Error verificando package.json: ${error.message}`)
  allChecksPass = false
}

// Resultado final
console.log('\n' + '='.repeat(50))
if (allChecksPass) {
  console.log('✅ Todas las verificaciones pasaron!')
  console.log('🚀 Listo para deploy en Vercel')
  console.log('\nComandos para deploy:')
  console.log('  git add .')
  console.log('  git commit -m "fix: Agregar debug detallado para upload de imágenes"')
  console.log('  git push origin main')
  console.log('\nPara verificar después del deploy:')
  console.log('  - Visita: https://tu-app.vercel.app/api/test')
  console.log('  - Prueba la creación de markets con imágenes')
  console.log('  - Usa los botones de debug para identificar problemas')
  console.log('  - Revisa los logs con: vercel logs --follow')
} else {
  console.log('❌ Algunas verificaciones fallaron')
  console.log('🔧 Corrige los errores antes del deploy')
  console.log('\nConsulta VERCEL_DEPLOY_GUIDE.md para más detalles')
}
console.log('='.repeat(50))

process.exit(allChecksPass ? 0 : 1) 