# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

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
