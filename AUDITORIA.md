# Reporte de Auditoría de Código y Seguridad - Colegio Calama

Este documento presenta los resultados de una auditoría técnica profunda realizada sobre el código del frontend (Angular) y el backend (Laravel) del proyecto Colegio Calama.

---

## 1. Vulnerabilidades de Seguridad

### A. Control de Acceso Deficiente en Rutas Críticas (Broken Function Level Authorization)
* **Ubicación:** `backend/routes/api.php`
* **Detalle:** Las rutas CRUD para los recursos más sensibles del sistema (cursos, alumnos, matrículas, materias y asignaciones de profesores) están protegidas únicamente por el middleware `auth:sanctum` sin un filtro de rol (`role:administrador`).
* **Impacto:** Cualquier usuario autenticado (un Profesor o un Asesor) puede realizar peticiones HTTP (POST, PUT, DELETE) y modificar la base de datos de manera no autorizada (por ejemplo, borrar cursos, registrar alumnos o cambiar asignaciones de profesores).
* **Código vulnerable (ejemplo):**
  ```php
  Route::middleware(['auth:sanctum'])->group(function () {
      Route::apiResource('cursos', CursoController::class);
      Route::apiResource('alumnos', AlumnoController::class);
  });
  ```

### B. Referencia Directa Insegura a Objetos (IDOR / Broken Object Level Authorization)
* **Ubicación:** `backend/app/Http/Controllers/Api/CalificacionesController.php::getReporte`
* **Detalle:** La ruta `/calificaciones/reporte/{alumnoId}` permite a cualquier usuario autenticado consultar el historial y libreta de calificaciones completa de cualquier estudiante en el sistema, únicamente pasando su ID numérico en la URL.
* **Impacto:** Un profesor o asesor podría extraer información de alumnos y calificaciones que no pertenecen a sus cursos o tutorías asignadas. No se valida la relación de tutoría o docencia entre el usuario solicitante y el estudiante consultado.

### C. Bloqueo del Sistema por Autodeleción (Denegación de Servicio Lógica)
* **Ubicación:** `backend/app/Http/Controllers/UserController.php::destroy`
* **Detalle:** El método de eliminación de usuarios no verifica si el usuario a eliminar es el propio usuario en sesión o si se trata del último administrador activo en el sistema.
* **Impacto:** Un administrador podría eliminarse a sí mismo o borrar al último usuario con rol `administrador`, dejando el panel de administración bloqueado permanentemente.

---

## 2. Errores Potenciales y Code Smells

### A. Consistencia de Roles y Datos Huérfanos
* **Ubicación:** `backend/app/Http/Controllers/UserController.php::update` (Línea 89)
* **Detalle:** Al actualizar un usuario, las reglas de validación permiten asignar el rol `'student'`, el cual no existe en la lógica del sistema (los estudiantes se manejan a través de la tabla y modelo `Alumno`), mientras que al crear un usuario en el método `store` (Línea 35) este rol sí está restringido de forma correcta.

### B. Uso de Variables No Declaradas (Posibles Advertencias de PHP)
* **Ubicación:** `backend/app/Http/Controllers/ProfesorController.php::dashboard` (Línea 78 y 108)
* **Detalle:** Se intenta agregar elementos al arreglo `$recentActivity` (`$recentActivity[] = [...]`) dentro de los bloques `try-catch` de calificaciones y asistencias recientes, pero la variable `$recentActivity` no se declara o inicializa al inicio del método.
* **Impacto:** Bajo configuraciones de PHP con reporte de errores estricto, esto lanzará advertencias de variable indefinida y puede congelar el flujo del dashboard.

### C. Archivos de Servicio Frontend Redundantes y Vacíos
* **Ubicación:** `frontend/src/app/services/`
* **Detalle:** Existen archivos esqueleto redundantes que carecen del sufijo `.service.ts` (como `asistencia.ts`, `auth.ts`, `dashboard.ts`, `user.ts`) los cuales fueron autogenerados incorrectamente y están completamente vacíos, coexistiendo con los servicios reales (`asistencia.service.ts`, `auth.service.ts`, etc.).
* **Impacto:** Aumenta el ruido en el espacio de nombres y dificulta el mantenimiento del código en el frontend.

### D. Race Conditions en Formularios Reactivos
* **Ubicación:** `frontend/src/app/components/matricula-management/matricula-management.ts::closeAlumnoDropdownWithDelay`
* **Detalle:** Se implementa un retardo manual con `setTimeout` para ocultar la lista desplegable de alumnos al perder el foco.
* **Impacto:** Es un "anti-patrón" que puede fallar en dispositivos con latencia táctil o al hacer clic rápidamente, cerrando el menú antes de registrar la selección de alumno.

---

## 3. Rendimiento y Consultas Pesadas (Base de Datos)

El sistema sufre de problemas generalizados de consultas redundantes conocidos como **Problema N+1**, causados por consultas SQL anidadas dentro de bucles.

### A. Generación de Actas Ineficiente (N^3 Queries)
* **Ubicación:** `backend/app/Http/Controllers/ActaCalificacionesController.php::generarActa`
* **Detalle:** Para construir el acta del curso:
  1. Se itera sobre todos los estudiantes inscritos ($N$).
  2. Dentro, se itera sobre cada materia del curso ($M$).
  3. Dentro, se itera por cada uno de los 3 trimestres ($T$).
  4. En cada trimestre, se consulta la base de datos para obtener los criterios de evaluación, luego las notas del alumno, y por último se realiza una consulta individual por cada nota (`CriterioEvaluacion::find(...)`) para obtener su ponderación.
* **Impacto:** Para una clase estándar de 40 estudiantes con 10 materias, se pueden llegar a realizar **más de 1,200 consultas SQL individuales** en una sola petición web, lo que resultará en un alto consumo de CPU y tiempos de espera (timeouts) en el servidor.

### B. Consolidado de Calificaciones del Asesor
* **Ubicación:** `backend/app/Http/Controllers/AsesorController.php::getReporteNotas` (Líneas 172-227)
* **Detalle:** Al generar las notas del curso asesorado, se ejecuta un bucle sobre los alumnos y otro sobre las materias, realizando consultas de criterios de evaluación y notas por estudiante de manera individual dentro de la iteración.
* **Impacto:** Provoca alrededor de **800 consultas SQL** para un curso de 40 alumnos con 10 materias en lugar de precargar los datos con relaciones o agrupaciones agregadas.

### C. Consulta Individual de Asistencias
* **Ubicación:** `backend/app/Http/Controllers/AsistenciaController.php::reporte` (Líneas 64-89)
* **Detalle:** Se itera sobre los alumnos matriculados y se hace una consulta independiente por cada uno de ellos para filtrar sus registros de asistencia en el rango de fechas.
* **Impacto:** Genera $N$ consultas a la tabla `asistencias` (donde $N$ es la cantidad de alumnos), ralentizando drásticamente el reporte de asistencias del colegio a medida que aumenta la matrícula escolar.

### D. Conteo Ineficiente de Estados de Asistencia (Advisor Dashboard)
* **Ubicación:** `backend/app/Http/Controllers/AsesorController.php::getReporteAsistencia` (Líneas 281-284)
* **Detalle:** Para calcular los totales de asistencia por estudiante, el código clona la consulta base y realiza 3 consultas independientes por cada alumno (`presente`, `ausente` y `licencia`).
* **Impacto:** Multiplica por 3 las consultas ejecutadas por estudiante, traduciéndose en **120 consultas SQL adicionales** para un grupo de 40 estudiantes, cuando esto podría consolidarse en una sola consulta de agregación condicional (`COUNT` / `SUM` agrupado).
