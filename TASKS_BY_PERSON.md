# Refactorización del Apartado de Tareas - Por Persona

## Cambio Implementado

El apartado de **Tareas** ahora está organizado **por persona del equipo**, no por eventos individuales.

## Nueva Estructura

### Vista Principal

- **Una tarjeta por cada miembro del equipo**
- Cada tarjeta muestra:
  - Avatar y nombre del miembro
  - Contador de tareas: "X de Y tareas completadas"
  - Lista de todas las tareas asignadas a esa persona
  - Barra de progreso al final

### Cada Tarea Muestra

- **Icono del tipo de evento** (Reuniones, Ensayos, etc.)
- **Título de la tarea**
- **Fecha y hora** con formato legible
- **Estado visual**:
  - Tarea vencida en rojo
  - Tarea completada tachada
- **Botón de acción**:
  - "Marcar Completa" (círculo vacío) - para tareas pendientes
  - "Completada" (check) - para tareas ya hechas

### Funcionalidad

✅ **Clic en el botón de cada tarea** → Cambia el estado entre completada/pendiente
✅ **Progreso en tiempo real** → Se actualiza automáticamente al completar tareas
✅ **Vista organizada** → Fácil ver la carga de trabajo de cada persona

## Ejemplo Visual

```
┌─────────────────────────────────────┐
│ 👤 Anna                             │
│ 2 de 5 tareas completadas           │
├─────────────────────────────────────┤
│ 📅 Reunión planificación Q4         │
│    15 Nov, 10:00h                   │
│    [○ Marcar Completa]              │
├─────────────────────────────────────┤
│ 🎭 Ensayo obra "Eco"      ✓         │
│    16 Nov, 16:00h                   │
│    [✓ Completada]                   │
├─────────────────────────────────────┤
│ Progreso                       40%  │
│ ████████░░░░░░░░░░░░               │
└─────────────────────────────────────┘
```

## Código Modificado

### `src/components/dashboard/tasks/tasks-client.tsx`

- ✅ Añadido `useMemo` para agrupar tareas por miembro
- ✅ Cambiado diseño de grid de eventos → grid de tarjetas por persona
- ✅ Cada tarjeta muestra lista de tareas con botón de completar
- ✅ Barra de progreso por persona al final de cada tarjeta
- ✅ Botón inline "Marcar Completa" en cada tarea

### Componentes Eliminados

- ❌ `task-card.tsx` ya no se usa (tarjetas individuales de tareas)

## Beneficios

1. **📊 Vista clara del progreso por persona**
2. **⚡ Acción rápida**: Clic directo para completar tareas
3. **👥 Gestión por equipo**: Fácil ver quién tiene más carga
4. **🎯 Enfoque en personas**: Prioriza la organización del equipo
5. **📈 Progreso visual**: Barra de progreso por miembro

## Uso

1. **Ver tareas de alguien** → Busca su tarjeta
2. **Marcar como completa** → Clic en "Marcar Completa"
3. **Ver progreso** → Mira la barra al final de cada tarjeta
4. **Añadir nueva tarea** → Botón "Añadir Tarea" arriba a la derecha
