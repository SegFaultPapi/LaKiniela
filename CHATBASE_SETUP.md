# Configuración de Chatbase.co Widget Oficial

## Pasos para integrar tu chatbot de Chatbase.co como widget flotante:

### 1. Obtener tu Chatbot ID

1. Ve a tu proyecto en [Chatbase.co](https://www.chatbase.co)
2. En la configuración del chatbot, busca el **Chatbot ID**
3. Copia el ID (ejemplo: `abc123def456`)

### 2. Configurar el Chatbot ID

Reemplaza `"TU_CHATBOT_ID_AQUI"` en el archivo `app/layout.tsx`:

```tsx
<ChatbaseWidget chatbotId="TU_CHATBOT_ID_REAL_AQUI" />
```

### 3. Estructura implementada

#### ✅ **Archivos creados:**

- `components/chatbase-widget.tsx` - Componente que carga el widget oficial de Chatbase
- Integrado en `app/layout.tsx` - Widget disponible en toda la aplicación

#### ✅ **Características:**

- Widget flotante oficial de Chatbase
- Aparece en la esquina inferior derecha
- Funciona en todas las páginas de la aplicación
- Diseño y funcionalidad nativa de Chatbase
- No requiere configuración adicional de API
- Limpieza automática de scripts

### 4. Ventajas del widget oficial

- **Sin configuración de API**: No necesitas Secret Keys
- **Diseño nativo**: Usa el diseño oficial de Chatbase
- **Funcionalidad completa**: Todas las características de Chatbase incluidas
- **Mantenimiento automático**: Se actualiza automáticamente
- **Compatibilidad garantizada**: Funciona con todas las versiones

### 5. Uso

El widget aparece automáticamente en la esquina inferior derecha de todas las páginas. Los usuarios pueden:

- Hacer clic para abrir/cerrar el chat
- Usar todas las funcionalidades nativas de Chatbase
- El widget se integra perfectamente con el diseño

### 6. Configuración en Chatbase.co

Asegúrate de que en tu proyecto de Chatbase.co:

- El chatbot esté **publicado**
- El **widget** esté habilitado
- El **dominio** esté autorizado (si aplica)

### 7. Pruebas

1. Reemplaza el Chatbot ID en `app/layout.tsx`
2. Recarga la página
3. El widget debería aparecer en la esquina inferior derecha
4. Haz clic para probar la funcionalidad

### 8. Personalización

#### **Desde el panel de Chatbase.co:**

- **Colores del tema**: Cambiar colores principales
- **Logo y branding**: Subir logo personalizado
- **Mensaje de bienvenida**: Personalizar mensaje inicial
- **Configuración del chatbot**: Ajustar comportamiento
- **Tema claro/oscuro**: Elegir entre temas

#### **Desde el código (CSS personalizado):**

Se han agregado estilos en `app/globals.css` para personalizar con la temática de La Kiniela:

- **🎨 Colores**: Gradientes naranja-rojo (#df3925, #ff6b35) y verde (#177847)
- **🎭 Animaciones**: Efectos de escritura y transiciones suaves
- **✨ Efectos visuales**: Sombras, bordes y gradientes
- **📱 Responsive**: Adaptación optimizada para móviles
- **🚫 Eliminación**: "Powered by Chatbase" completamente removido
- **🎯 Scrollbar personalizada**: Con colores de La Kiniela

#### **Características implementadas:**

- **Botón flotante**: Gradiente naranja-rojo con efectos hover
- **Ventana del chat**: Fondo crema (#fff6e4) con bordes redondeados
- **Header**: Gradiente naranja-rojo con texto blanco
- **Mensajes del usuario**: Gradiente naranja-rojo
- **Mensajes del bot**: Fondo blanco con texto verde
- **Input**: Bordes naranjas con focus mejorado
- **Efecto de escritura**: Animación en mensajes del bot
- **Scrollbar personalizada**: Con gradiente de La Kiniela

#### **Clases CSS disponibles para personalizar:**

```css
#chatbase-widget .chatbase-button          /* Botón flotante */
#chatbase-widget .chatbase-chat-window     /* Ventana del chat */
#chatbase-widget .chatbase-header          /* Header del chat */
#chatbase-widget .chatbase-user-message    /* Mensajes del usuario */
#chatbase-widget .chatbase-bot-message     /* Mensajes del bot */
#chatbase-widget .chatbase-input           /* Campo de texto */
#chatbase-widget .chatbase-send-button     /* Botón de envío */
#chatbase-widget .chatbase-messages        /* Área de mensajes */
#chatbase-widget .chatbase-input-area; /* Área de input */
```

¡Listo! Tu chatbot de Chatbase.co estará completamente integrado como widget oficial con personalización.
