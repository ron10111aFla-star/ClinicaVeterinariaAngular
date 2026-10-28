# VetCare — Clínica veterinaria

Aplicación académica para el curso **Desarrollo de Interfaces 3**, construida con Angular y TypeScript. Continúa el problema, pantallas y flujos definidos en el documento *Definición del problema y diseño de la solución*: registro de propietarios y mascotas, agenda con control de disponibilidad e historial por mascota.

## 1. Requisitos

- Node.js compatible con la versión de Angular instalada (se recomienda Node.js 22 LTS).
- npm.
- Editor recomendado: Visual Studio Code.
- Conexión a internet durante la instalación de dependencias y para cargar Bootstrap desde CDN.

## 2. Instalación y ejecución

1. Descomprime la carpeta `ClinicaVeterinariaAngular`.
2. Abre esa carpeta en Visual Studio Code o en una terminal.
3. Instala dependencias con `npm install`.
4. Inicia el servidor con `npm start`.
5. Abre la URL local que indique Angular CLI, normalmente `http://localhost:4200`.
6. Para compilar el proyecto, ejecuta `npm run build`.

> El archivo `S04_Angular_02_v2.0.rar` contiene un proyecto Angular 22 con componentes standalone. La solución adopta el estilo de entrada `src/app/app.ts`, rutas y componentes standalone, y organiza las funciones en carpetas por funcionalidad. El RAR incluye `node_modules` y cachés; no se copian esas carpetas al proyecto final porque npm las vuelve a generar.

## 3. Estructura principal

```text
src/
├── main.ts
├── index.html
├── styles.css
└── app/
    ├── app.ts / app.html / app.css
    ├── app.config.ts
    ├── app.routes.ts
    ├── core/
    │   ├── models/       # Propietario, Mascota, Cita y Atención
    │   └── services/     # Persistencia y reglas de negocio
    ├── features/
    │   ├── mascotas/    # Formulario de propietario + mascota
    │   ├── citas/       # Agenda, disponibilidad y reserva
    │   └── historial/   # Búsqueda, ficha e historial
    └── shared/
        ├── pipes/       # Pipe estadoCita
        └── directives/  # Directiva citaProxima
```

## 4. Funcionalidades implementadas

### Registro de propietario y mascota

- Propietario: tipo y número de documento (número opcional), nombres, apellidos, teléfono y correo.
- Mascota: nombre, especie, raza, fecha de nacimiento, sexo y observaciones relevantes.
- Validación de campos obligatorios, longitud, correo y teléfono.
- Mensajes de error y confirmación, además de botón para limpiar el formulario.

### Agenda de citas

- Selector de fecha y mascota registrada.
- Horarios de 09:00 a 17:00 en intervalos de una hora.
- Los horarios ocupados, las fechas pasadas y las horas pasadas del día actual se deshabilitan.
- Validación final de disponibilidad antes de registrar una cita.
- Estados de cita: Programada, Atendida y Cancelada.
- La directiva `citaProxima` resalta citas dentro de las próximas 48 horas.

### Historial por mascota

- Búsqueda por código, nombre de mascota, especie, raza o propietario.
- Ficha de mascota con datos del dueño y observaciones.
- Historial ordenado del registro más reciente al más antiguo.
- Formulario para registrar una atención con fecha, motivo, diagnóstico, tratamiento y observaciones.

## 5. TypeScript y Angular

- Interfaces: `Propietario`, `MascotaDatos`, `Cita` y `Atencion`.
- Clase de dominio `Mascota`, que implementa `MascotaDatos` y expone `nombreCompleto`.
- Servicio inyectable `ClinicaService` para centralizar registros, consultas, disponibilidad y estados.
- Formularios reactivos tipados con `FormBuilder` y validadores de Angular.
- Componente reutilizable `SelectorMascotaComponent` con `@Input` y `@Output`.
- Componentes standalone y rutas con carga diferida (`loadComponent`).
- Pipe personalizado `estadoCita` y directiva `citaProxima`.
- Bootstrap 5 para la estructura adaptable; estilos propios en CSS.

## 6. Persistencia y limitaciones

Para que el proyecto funcione sin un backend, los registros se guardan en `localStorage` del navegador. Los datos permanecen en ese navegador y equipo, no se comparten entre usuarios ni se envían a una base de datos. Por ello, esta versión es un prototipo de interfaz para el trabajo académico, no un sistema clínico listo para producción. Una siguiente etapa debería integrar API/backend, base de datos, autenticación, permisos y respaldo de información.

## 7. Pruebas manuales sugeridas

1. Intentar guardar el formulario vacío: deben aparecer mensajes de validación.
2. Registrar un propietario y una mascota; confirmar el código generado.
3. Abrir Agenda: la mascota registrada debe aparecer en la lista.
4. Agendar una cita en un horario libre y verificar que se muestre en la agenda.
5. Intentar seleccionar ese mismo horario y fecha: debe aparecer como ocupado.
6. Cancelar una cita y comprobar que el horario vuelva a estar disponible.
7. Marcar una cita como atendida y verificar su estado.
8. Buscar la mascota por nombre y por código en Historial.
9. Registrar una atención con motivo y diagnóstico; confirmar que aparezca en el historial.
10. Recargar el navegador y comprobar que los datos continúen disponibles en el mismo navegador.
11. Probar la pantalla en una ventana estrecha para revisar la adaptación móvil.
12. Ejecutar `npm test` para correr la prueba unitaria del pipe de estado.

## 8. Relación con la rúbrica

| Criterio | Evidencia en el proyecto |
|---|---|
| Tipos, interfaces, funciones y POO | Modelos TypeScript, clase `Mascota`, servicio con métodos tipados. |
| Arquitectura modular | Carpetas `core`, `features` y `shared`; rutas por funcionalidad. |
| Componentes reutilizables e interacción | Componentes standalone y servicio compartido; los componentes mantienen una responsabilidad específica. |
| Pipes, directivas y Bootstrap | `estadoCita`, `citaProxima`, Bootstrap y CSS adaptable. |
| Código limpio y documentación | Nombres descriptivos, validaciones, README, pasos de instalación y pruebas manuales. |

**Nota:** el diseño utiliza componentes standalone, tal como el proyecto base de Angular 22 del material entregado. En Angular moderno, la separación por funcionalidades puede hacerse con carpetas y rutas lazy-loaded sin necesitar un `NgModule` por cada pantalla.
