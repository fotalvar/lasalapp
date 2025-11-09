# Refactorización: Integración Calendario - Tareas

## Objetivo

Unificar el sistema de tareas con el calendario para que **una tarea sea cualquier evento del calendario que tenga responsables asignados** (`assigneeIds`).

## Cambios Realizados

### 1. Actualización del Modelo de Datos

#### `src/lib/types.ts`

- ✅ **Añadido campo `completed?: boolean`** al tipo `CalendarEvent`
- ✅ **Eliminado tipo `Task`** (obsoleto, ahora todo son `CalendarEvent`)
- **Los eventos del calendario con `assigneeIds` son considerados tareas**

```typescript
export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type:
    | "Publicaciones en redes"
    | "Venta de entradas"
    | "Espectáculos"
    | "Reuniones"
    | "Ensayos";
  assigneeIds?: string[];
  completed?: boolean; // ← NUEVO
};
```

### 2. Refactorización del Apartado de Tareas

#### `src/components/dashboard/tasks/tasks-client.tsx`

- ✅ **Cambiado de colección `tasks` a `events`**
- ✅ **Filtrado automático**: Solo muestra eventos con `assigneeIds` (eventos que son tareas)
- ✅ **Formulario actualizado**: Ahora permite elegir fecha, hora, tipo de evento y responsable
- ✅ **Sugerencia de IA**: Mantiene la funcionalidad de asignar responsables con IA

#### `src/components/dashboard/tasks/task-card.tsx`

- ✅ **Rediseñado completamente** para mostrar eventos del calendario
- ✅ **Muestra**:
  - Icono del tipo de evento (Reuniones, Ensayos, etc.)
  - Fecha y hora del evento
  - Responsables asignados con avatares
  - Estado: Completada, Pendiente o Vencida
- ✅ **Funcionalidad**: Marcar como completa/incompleta, eliminar

### 3. Actualización del Dashboard Principal

#### `src/app/dashboard/page.tsx`

- ✅ **Widget "Mis Próximos Eventos"** (`MyTasksWidget`):
  - Muestra los próximos 3 eventos asignados al usuario actual
  - Ya estaba usando `CalendarEvent`, sin cambios necesarios
- ✅ **Widget "Progreso del Equipo"** (`TeamProgressWidget`):
  - **Actualizado para calcular progreso basado en eventos/tareas**
  - Cuenta eventos con `assigneeIds` por miembro
  - Calcula % completadas vs totales

### 4. Integración con el Calendario

#### `src/app/dashboard/calendar/page.tsx`

- ✅ **Añadido checkbox "Marcar como tarea completada"** en el formulario de eventos
- ✅ **Solo aparece si el evento tiene responsables asignados** (`assigneeIds`)
- ✅ **Permite marcar/desmarcar eventos como completados** directamente desde el calendario

### 5. Limpieza de Código

#### `src/lib/data.ts`

- ✅ **Eliminada la constante `responsibilities`** (obsoleta)
- ✅ **Actualizado formato de `teamMembers`** para usar estructura de avatar correcta

## Cómo Funciona Ahora

### Crear una Tarea

1. Ve a **"Tareas"** o **"Calendario"**
2. Clic en **"Añadir Tarea"** o **"Añadir Evento"**
3. Rellena el formulario:
   - Título
   - Fecha y hora
   - Categoría (Reuniones, Ensayos, etc.)
   - **Responsables** (esto convierte el evento en tarea)
4. Opcional: Usar IA para sugerir el mejor responsable

### Ver Tareas

- **Apartado "Tareas"**: Muestra todos los eventos del calendario que tienen responsables asignados
- **Dashboard**: Widget "Mis Próximos Eventos" muestra tus próximas 3 tareas/eventos
- **Calendario**: Todos los eventos, filtrados opcionalmente por responsable

### Completar una Tarea

- **Desde Tareas**: Clic en el menú (⋮) → "Marcar como Completa"
- **Desde Calendario**: Editar evento → Checkbox "Marcar como tarea completada"

### Contabilización de Tareas

- Widget **"Progreso del Equipo"** muestra:
  - Número de tareas asignadas a cada miembro
  - Porcentaje de tareas completadas
  - Barra de progreso visual

## Base de Datos

### Colección: `events`

Ahora es la única fuente de verdad para eventos Y tareas:

```javascript
{
  id: "event123",
  title: "Reunión planificación Q4",
  date: Timestamp,
  type: "Reuniones",
  assigneeIds: ["user1", "user2"], // ← Eventos con esto son "tareas"
  completed: false // ← Permite marcar tareas como completadas
}
```

### Colección: `tasks` (OBSOLETA)

❌ Ya no se usa. Todas las operaciones ahora se hacen en `events`.

## Beneficios de este Enfoque

1. **✅ Unificación**: Un solo lugar para gestionar eventos y tareas
2. **✅ Coherencia**: Las tareas siempre están sincronizadas con el calendario
3. **✅ Simplicidad**: No hay que duplicar información entre `tasks` y `events`
4. **✅ Flexibilidad**: Cualquier evento puede convertirse en tarea añadiendo responsables
5. **✅ Trazabilidad**: Las tareas tienen fecha/hora específica (son eventos)

## Archivos Modificados

```
src/
├── lib/
│   ├── types.ts                                    [MODIFICADO]
│   └── data.ts                                     [MODIFICADO]
├── components/dashboard/
│   └── tasks/
│       ├── tasks-client.tsx                        [REFACTORIZADO]
│       └── task-card.tsx                           [REFACTORIZADO]
├── app/dashboard/
│   ├── page.tsx                                    [MODIFICADO]
│   ├── tasks/page.tsx                             [SIN CAMBIOS]
│   └── calendar/page.tsx                          [MODIFICADO]
```

## Próximos Pasos Opcionales

- [ ] Eliminar archivos de `responsibilities` si existen (no se usan)
- [ ] Actualizar flows de IA para que creen eventos en lugar de tareas
- [ ] Añadir índice compuesto en Firestore: `events` → `(assigneeIds array-contains, completed, date)`
- [ ] Migrar datos antiguos de `tasks` a `events` si hay datos en producción

## Notas Importantes

⚠️ **Si tienes datos en la colección `tasks` en Firestore**:

- Los datos NO se migran automáticamente
- Necesitarás crear un script de migración o recrear las tareas manualmente
- Las nuevas tareas se guardan en `events` automáticamente

✅ **Compatibilidad**: El código antiguo que consulte `tasks` simplemente no encontrará datos. No hay errores.
