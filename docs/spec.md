# Panel Operativo de Desarrollo (POD)

## Visión

El Panel Operativo de Desarrollo (POD) es una herramienta interna diseñada para centralizar la gestión operativa de un departamento de desarrollo de software.

Su objetivo principal es sustituir las pizarras físicas utilizadas para organizar proyectos, tareas y responsabilidades, proporcionando una visión clara, rápida y actualizada del estado real del departamento.

A diferencia de un CRM o un ERP, POD no pretende gestionar clientes, facturación o imputación de horas, ya que estas funciones seguirán realizándose en los sistemas corporativos existentes.

Sin embargo, POD sí se integrará en el flujo de presupuestos de la empresa para evitar la pérdida de información entre la fase comercial y la fase de ejecución.

La aplicación debe responder a una pregunta muy concreta:

> ¿Qué está ocurriendo ahora mismo en el departamento y qué va a ocurrir próximamente?

Y hacerlo en menos de 30 segundos.

---

## Problema a resolver

Actualmente el departamento utiliza una combinación de:

- Sistema de partes para imputación de horas.
- Comunicación informal entre compañeros.
- Pizarras físicas con nombres y tareas.
- Presupuestos desconectados de la ejecución posterior.

Esto genera varios problemas:

- Falta de visibilidad global.
- Información dispersa.
- Dificultad para conocer el estado real de los proyectos.
- Dependencia de conversaciones para entender el contexto.
- Pérdida de información cuando alguien se ausenta.
- Imposibilidad de detectar bloqueos rápidamente.
- Falta de seguimiento estructurado de presupuestos enviados.
- Duplicación de trabajo entre comercial y desarrollo.

La información existe, pero no está centralizada ni estructurada.

---

## Objetivos

### Objetivos principales

- Centralizar el estado operativo del departamento.
- Sustituir la pizarra física por un sistema digital.
- Facilitar la planificación diaria.
- Visualizar proyectos activos.
- Visualizar responsables y participantes.
- Identificar bloqueos rápidamente.
- Gestionar presupuestos pendientes.
- Facilitar la transición entre presupuesto y proyecto.
- Conocer el estado general del departamento en tiempo real.

### Objetivos secundarios

- Generar métricas de actividad.
- Facilitar reuniones de seguimiento.
- Mejorar el seguimiento comercial.
- Reducir el tiempo de arranque de nuevos proyectos.
- Utilizar IA para automatizar la creación inicial de proyectos.

---

## Filosofía del producto

El sistema **NO** es:

- Un CRM.
- Un ERP.
- Un sistema de tickets.
- Un gestor documental.
- Un sistema de control horario.

El sistema **SÍ** es:

- Un panel operativo.
- Una herramienta de contexto.
- Una representación digital del trabajo real del departamento.
- Un puente entre comercial y desarrollo.

La simplicidad es una prioridad.

Cada funcionalidad deberá justificarse en función de si mejora la comprensión del estado del departamento.

---

## Flujo general del sistema

```text
Presupuesto
   ↓
Oportunidad
   ↓
Proyecto
   ↓
Tareas
   ↓
Actividad Operativa
```

Toda la información generada durante la venta debe reutilizarse durante la ejecución.

---

## Roles

### Desarrollador

Puede:

- Ver proyectos asignados.
- Ver tareas asignadas.
- Actualizar estados.
- Crear actividades.
- Registrar bloqueos.

### Responsable de proyecto

Puede:

- Gestionar proyectos.
- Gestionar tareas.
- Gestionar participantes.
- Resolver bloqueos.
- Validar proyectos generados por IA.

### Responsable comercial

Puede:

- Gestionar oportunidades.
- Consultar presupuestos enviados.
- Actualizar estados comerciales.
- Registrar seguimiento.

### Responsable de departamento

Puede:

- Ver estado global.
- Detectar riesgos.
- Gestionar prioridades.
- Supervisar carga de trabajo.

### Administrador

Control total del sistema.

---

## Entidades principales

### Usuario

Campos:

- `id`
- `nombre`
- `email`
- `avatar`
- `rol`
- `activo`
- `fecha_creacion`

### Oportunidad

Representa un presupuesto enviado al cliente.

Campos:

- `id`
- `nombre`
- `cliente`
- `responsable_comercial`
- `importe`
- `fecha_envio`
- `fecha_ultima_accion`
- `estado`
- `probabilidad`
- `proyecto_generado`

Estados:

- Borrador
- Enviado
- En negociación
- Aceptado
- Rechazado
- Sin respuesta

### Proyecto

Unidad principal del sistema.

Campos:

- `id`
- `oportunidad`
- `nombre`
- `descripcion`
- `responsable`
- `estado`
- `prioridad`
- `progreso`
- `fecha_inicio`
- `fecha_fin_estimada`
- `fecha_fin_real`
- `activo`

Estados:

- Pendiente
- En progreso
- Bloqueado
- En revisión
- Finalizado

Prioridades:

- Baja
- Media
- Alta
- Crítica

### ProyectoUsuario

Campos:

- `proyecto`
- `usuario`
- `rol`

Roles:

- Responsable
- Colaborador
- Consultado

### Tarea

Campos:

- `id`
- `proyecto`
- `titulo`
- `descripcion`
- `asignado`
- `estado`
- `prioridad`
- `estimacion_horas`
- `horas_consumidas`
- `fecha_creacion`
- `fecha_limite`

Estados:

- Pendiente
- En progreso
- Bloqueada
- Finalizada

### Bloqueo

Campos:

- `id`
- `proyecto`
- `tarea`
- `descripcion`
- `creado_por`
- `fecha_creacion`
- `resuelto`
- `fecha_resolucion`

### Actividad

Campos:

- `id`
- `usuario`
- `proyecto`
- `tipo`
- `descripcion`
- `fecha`

Tipos:

- Proyecto creado
- Proyecto actualizado
- Tarea creada
- Tarea completada
- Bloqueo creado
- Bloqueo resuelto
- Participante añadido
- Participante eliminado
- Oportunidad creada
- Oportunidad actualizada
- Oportunidad aceptada
- Oportunidad rechazada

---

## Inteligencia Artificial

### Objetivo

Reducir el trabajo manual necesario para transformar un presupuesto en un proyecto operativo.

### Entrada

Documento utilizado para elaborar el presupuesto.

Formatos admitidos:

- PDF
- DOCX
- Texto
- Correo electrónico
- Documento comercial

### Análisis automático

La IA analizará:

- Alcance funcional.
- Requisitos.
- Funcionalidades.
- Integraciones.
- Dependencias.
- Riesgos.
- Estimaciones.

### Generación automática

A partir del presupuesto la IA generará un borrador de:

#### Proyecto

- Nombre
- Descripción
- Objetivos

#### Fases

Ejemplos:

- Análisis
- Backend
- Frontend
- Testing
- Despliegue

#### Tareas iniciales

Ejemplos:

Backend:

- Diseño base de datos
- Desarrollo API
- Sistema de autenticación

Frontend:

- Diseño interfaz
- Desarrollo vistas
- Integración API

#### Riesgos detectados

#### Dependencias detectadas

#### Estimaciones iniciales

### Validación humana

La IA nunca creará proyectos definitivos.

Siempre generará un borrador revisable.

Un responsable deberá:

- Revisar estructura.
- Ajustar tareas.
- Modificar estimaciones.
- Confirmar la creación.

---

## Dashboard personal

Debe responder:

- ¿En qué estoy trabajando?
- ¿Qué tengo pendiente?
- ¿Qué está bloqueado?
- ¿Qué es prioritario?

### Mis proyectos

- Estado
- Progreso
- Responsable
- Tareas pendientes

### Mis tareas

Ordenadas por prioridad.

### Bloqueos

Activos.

### Actividad reciente

Últimos movimientos relevantes.

---

## Dashboard departamental

Debe responder:

- ¿Cómo está el departamento?
- ¿Dónde están los problemas?
- ¿Quién está más cargado?
- ¿Qué proyectos están en riesgo?

### Proyectos

- Activos
- Bloqueados
- Finalizados
- Retrasados

### Usuarios

- Proyectos asignados
- Tareas abiertas
- Carga de trabajo

### Riesgos

- Sin actividad durante X días.
- Con bloqueos abiertos.
- Con tareas vencidas.

### Actividad reciente

Feed global del departamento.

---

## Dashboard comercial

Debe responder:

- ¿Qué presupuestos siguen abiertos?
- ¿Qué presupuestos necesitan seguimiento?
- ¿Qué oportunidades están estancadas?

### Oportunidades activas

- Días desde envío.
- Responsable.
- Importe.
- Estado.

### Alertas

- Más de X días sin respuesta.
- Más de X días sin seguimiento.
- Probabilidad alta sin actividad reciente.

---

## Sistema de actividad

Toda acción relevante genera actividad automáticamente.

Ejemplos:

- "Dani completó la tarea API Estadísticas"
- "Pedro bloqueó el proyecto Portal Cliente"
- "Ana fue asignada al proyecto Nóminas"
- "Presupuesto ERP enviado a cliente"
- "Oportunidad Portal Cliente aceptada"

Esto genera un feed continuo del estado real de la organización.

---

## Integraciones futuras

### Sistema de partes

Cruzar:

- Horas imputadas.
- Estado del proyecto.
- Progreso previsto.
- Progreso real.

### IA Operativa

Consultas:

- ¿Qué proyectos llevan más de 7 días sin actividad?
- ¿Quién tiene más carga actualmente?
- Resume el estado del departamento.
- ¿Qué tareas están bloqueando más trabajo?

### Detección automática de riesgos

- Proyectos abandonados.
- Sobrecarga de usuarios.
- Retrasos previstos.
- Dependencias críticas.

### Resúmenes automáticos

- Diario.
- Semanal.
- Mensual.

---

## Principio fundamental

El éxito del sistema no se medirá por la cantidad de funcionalidades incorporadas.

Se medirá por una única métrica:

> Cualquier miembro de la organización debe poder entender qué está ocurriendo, qué está pendiente y qué requiere atención en menos de 30 segundos.
