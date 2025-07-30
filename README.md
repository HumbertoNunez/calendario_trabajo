# Calendario de Trabajo

Este proyecto es una aplicación de calendario de trabajo interactiva, desarrollada con React, TypeScript y Vite. Permite a los usuarios registrar sus horas de entrada y salida, marcar días de descanso, y obtener resúmenes detallados de su tiempo trabajado.

## Características

- **Registro de Horas Flexible:** Ingresa horas de entrada y salida para cada día, con cálculo automático de las horas trabajadas. Soporte para turnos nocturnos.
- **Días de Descanso:** Marca fácilmente los días como días de descanso.
- **Entrada de Datos Mejorada:** Interfaz de usuario intuitiva con un modal para registrar y editar entradas, reemplazando las ventanas `prompt()`.
- **Notificaciones Toast:** Feedback visual instantáneo al guardar o eliminar una entrada para una mejor experiencia de usuario.
- **Validación de Horas:** Feedback visual directo en el modal para formatos de hora incorrectos y validación de la lógica de entrada/salida.
- **Auto-formato de Horas:** Inserción automática de los dos puntos (`:`) al ingresar las horas (ej. escribir `0900` se convierte en `09:00`).
- **Campo de Notas:** Añade descripciones o notas detalladas a cada entrada de trabajo para un mejor seguimiento.
- **Resumen Semanal:** Visualiza el total de horas y días trabajados por semana, incluyendo el número de semana.
- **Resumen Mensual:** Obtén un resumen completo de horas trabajadas, días trabajados y días de descanso para el mes actual.
- **Exportación de Datos:** Exporta todos tus registros a un archivo CSV, incluyendo tu nombre, lugar de trabajo y número de semana, para análisis externo o respaldo.
- **Limpiar Todos los Datos:** Opción para eliminar de forma segura todas tus entradas de trabajo de la base de datos.
- **Modo Claro/Oscuro:** Alterna entre un tema claro y oscuro, con persistencia de la preferencia y detección automática de la configuración del sistema.
- **Interfaz de Usuario Moderna:** Diseño limpio y profesional con estilos adaptativos para una mejor experiencia visual.
- **Persistencia de Datos Segura con Supabase:** Ahora, tus datos se almacenan de forma segura en una base de datos PostgreSQL en la nube (Supabase), permitiéndote acceder a tu información desde cualquier dispositivo y con autenticación de usuario.
- **Autenticación de Usuarios:** Implementación de registro e inicio de sesión para proteger tus datos.
- **Código Limpio y Mantenible:** Lógica de persistencia de datos refactorizada a un hook personalizado (`useLocalStorage`) para mayor claridad y reutilización.

## Despliegue

¡Tu aplicación está desplegada y disponible en línea!

**URL de Producción:** [https://calendariotrabajo.netlify.app](https://calendariotrabajo.netlify.app)

## Configuración del Proyecto

Este proyecto utiliza [Vite](https://vitejs.dev/) para un entorno de desarrollo rápido y [TypeScript](https://www.typescriptlang.org/) para un tipado estático.

### Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila la aplicación para producción.
- `npm run lint`: Ejecuta el linter para verificar el código.
- `npm run preview`: Previsualiza la compilación de producción localmente.

## Expandiendo la configuración de ESLint

Si estás desarrollando una aplicación de producción, se recomienda actualizar la configuración para habilitar las reglas de linting conscientes del tipo:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

También puedes instalar [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) y [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) para reglas de linting específicas de React:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```