# LaSala App

Aplicación de gestión integral para La Sala de Atresquarts. Sistema completo para administrar programación de espectáculos, gastos, tareas, responsabilidades, equipos y calendario.

## 📋 Historial de Versiones

### Versión 0.1.0 (Noviembre 2024)

**Versión inicial del proyecto**

#### Características principales:

- **Autenticación**: Sistema de login con Google Firebase Auth
- **Dashboard principal**: Vista general con acceso rápido a todas las secciones
- **Interfaz moderna**: Diseño limpio en blanco con tipografía Poppins
- **Responsive**: Adaptación completa para desktop y mobile
- **Idioma**: Toda la interfaz en español

#### Módulos implementados:

**1. Gestión de Programación**

- Vista general de espectáculos con estados (Propuesta Pendiente, En Progreso, Confirmado, Archivado)
- Sistema de interacciones personalizables para tracking de progreso
- Pasos fijos: "Descripción e imágenes"
- Editor de eventos con todos los detalles
- Filtros por estado y visualización de completados/archivados
- Barra de progreso visual para cada espectáculo
- Historial de interacciones con fechas editables
- Vista optimizada para mobile con menú inferior
- Programación de contenido para Instagram
- Integración con calendario de responsables

**2. Calendario**

- Vista mensual con eventos por categorías
- Sistema de colores para diferentes tipos de eventos
- Creación y edición de eventos con fecha y hora
- Vista de agenda con eventos del día
- Integración con responsabilidades y tareas
- Filtros por responsable
- Programador de Instagram integrado

**3. Gestión de Gastos** (v0.1.1)

- Lista completa de gastos con estados (Pendiente, Pagado, Rechazado)
- Visualización mejorada con badges de estado
- Descripción truncada para mejor legibilidad
- Filtros y búsqueda
- Detalles de cada gasto (cantidad, categoría, responsable, fecha)

**4. Tareas (antes Responsabilidades)**

- Gestión de tareas del equipo
- Asignación de responsables
- Fechas límite
- Estados de progreso
- Vista general y detallada

**5. Gestión de Equipo**

- Creación y edición de miembros del equipo
- Iconos personalizables (animales y emojis)
- Roles y permisos
- Vista de perfiles
- Persistencia en Firebase

**6. Portal Público**

- Formulario externo para propuestas de espectáculos
- Acceso sin autenticación
- Creación automática de espectáculos con estado "Propuesta Pendiente"
- Separación clara entre área pública y privada

**7. Compañías**

- Gestión de compañías y productoras
- Información de contacto
- Historial de colaboraciones

#### Tecnologías:

- **Frontend**: Next.js 14 con App Router, React 18, TypeScript
- **Backend**: Firebase (Firestore, Auth, Functions)
- **UI**: Shadcn/ui con Radix UI, Tailwind CSS
- **Despliegue**: Firebase Hosting
- **AI**: Genkit (Google) para funciones inteligentes

#### Integraciones:

- Firebase Authentication (Google OAuth)
- Firestore para base de datos en tiempo real
- Firebase Functions para backend serverless

### Versión 0.1.1 (Noviembre 2024)

**Mejoras en visualización y UX**

#### Actualizaciones:

- **Gastos**: Mejora en la visualización con badges de estado y descripción truncada
- **Dashboard**: Optimización de tipos TypeScript para gastos
- **UI/UX**: Refinamiento de componentes y mejor feedback visual
- **Performance**: Optimizaciones en carga de datos

### Versión 0.2.0 (En desarrollo)

**Integración Weeztix OAuth2**

#### Nuevas características:

- Integración OAuth2 con Weeztix para gestión de eventos
- Sistema de autorización y tokens seguros
- Vista de eventos próximos desde Weeztix
- Sincronización automática de eventos

---

## Integración de Weeztix (OAuth2) - PENDIENTE DE CONFIGURACIÓN EN PRODUCCIÓN

### Estado actual

La integración OAuth2 con Weeztix está implementada pero **requiere configuración en producción** antes de funcionar.

### Configuración pendiente para producción:

1. **En el Dashboard de Weeztix** (https://dashboard.weeztix.com):

   - Navegar a: Company settings → OAuth Clients
   - Configurar **Redirect URL**: `https://lasala.atresquarts.com/api/weeztix/callback`
   - Verificar credenciales OAuth2:
     - Client ID: `xs7nobJLz9rKv2tZ1u1dJ8fK8w4DqoYKmmSlHCVd`
     - Secret: `FQ1o5vT7L1Cg0JNO6allPsEXANjxgdU685U1Q9Es`

2. **Archivos de la integración**:

   - `/src/app/api/weeztix/authorize/route.ts` - Inicia el flujo OAuth2
   - `/src/app/api/weeztix/callback/route.ts` - Recibe el código de autorización y obtiene tokens
   - `/src/app/api/weeztix/events/route.ts` - Lista eventos con Bearer token
   - `/src/app/api/weeztix/events/[id]/route.ts` - Obtiene detalle de evento individual
   - `/src/app/dashboard/weeztix/page.tsx` - UI con botón de autorización

3. **Flujo de autenticación OAuth2**:

   - Usuario accede a `/dashboard/weeztix`
   - Si no está autenticado, aparece botón "Autorizar acceso a Weeztix"
   - Click en botón → redirige a `https://auth.openticket.tech/tokens/authorize`
   - Usuario aprueba acceso en Weeztix
   - Weeztix redirige a `/api/weeztix/callback` con código de autorización
   - Backend intercambia código por access_token y refresh_token
   - Tokens se guardan en cookies httpOnly seguras
   - Usuario es redirigido a `/dashboard/weeztix` y puede ver eventos

4. **Endpoints de Weeztix**:

   - Autorización: `https://auth.openticket.tech/tokens/authorize`
   - Token: `https://auth.openticket.tech/tokens`
   - API Eventos: `https://api.weeztix.com/event/upcoming`
   - Documentación: https://docs.weeztix.com

5. **Para desarrollo local** (opcional):
   - Crear variable de entorno: `WEEZTIX_REDIRECT_URI=http://localhost:9002/api/weeztix/callback`
   - Agregar esa URL también en el dashboard de Weeztix como redirect adicional
   - Esto permite probar el flujo OAuth2 en desarrollo

### Próximos pasos al desplegar en producción:

1. Configurar la Redirect URL en Weeztix dashboard
2. Verificar que `https://lasala.atresquarts.com` esté funcionando
3. Probar el flujo de autorización
4. Verificar que se muestren los eventos correctamente
