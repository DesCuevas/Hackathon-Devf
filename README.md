# 🚛 Traxion - Sistema de Mantenimiento Predictivo con IA

![Estado](https://img.shields.io/badge/Estado-Prototipo_Funcional-success)
![NodeJS](https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs)
![Gemini](https://img.shields.io/badge/Google_Gemini-IA-4285F4?logo=google)

Este proyecto es una plataforma web (Single Page Application) desarrollada para el Hackathon de Traxion. Permite gestionar el estado de las unidades de transporte, automatizar el registro de mantenimientos y utilizar Inteligencia Artificial (Gemini) para priorizar reportes de riesgo en tiempo real basándose en el lenguaje natural de los operadores.

## ✨ Características Principales

- **Panel de Administrador Dinámico:** Visualización del estatus de la flota en tiempo real con alertas por colores.
- **Formularios Inteligentes (Choferes):** Registro de condiciones de salida y entrega con bifurcación de rutas.
- **Integración de IA (Gemini 1.5 Flash):** Análisis automático de los comentarios de los choferes para asignar una ponderación de riesgo (0-100) y un estatus (Óptimo, Preventivo, Urgente).
- **Base de Datos Local (Excel):** Persistencia de datos utilizando archivos `.xlsx` manejados desde Node.js (Upsert automático y creación de columnas dinámicas).
- **Control de Mantenimientos:** Historial detallado por unidad con sistema de completado (Checklists) y registro de fechas.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript Vanilla (Arquitectura SPA), Bootstrap 5.
- **Backend:** Node.js, Express.js.
- **Base de Datos:** `xlsx` (ExcelJS) para lectura y escritura de archivos locales.
- **Inteligencia Artificial:** `@google/generative-ai` (API de Gemini).

---

## 🚀 Guía de Instalación y Uso (Local)

Sigue estos pasos para ejecutar el proyecto en tu computadora.

### 1. Prerrequisitos
Asegúrate de tener instalado [Node.js](https://nodejs.org/es/) (versión 18 o superior).

### 2. Clonar el repositorio
Si descargaste el `.zip`, descomprímelo. Si usas Git:
```bash
git clone [https://github.com/DesCuevas/Hackathon-Devf.git]
cd Hackathon-Devf
```
### 3. Instalar Dependencias
Instala todas las librerías necesarias del backend (Express, xlsx, dotenv, Gemini) ejecutando:
```
Bash
npm install
```
### 4. Configurar Variables de Entorno (API Key) 
Por seguridad, la llave de la Inteligencia Artificial no está incluida en el código.

Crea un archivo en la raíz del proyecto llamado exactamente .env

Abre el archivo y pega tu API Key de Google AI Studio con este formato:

Fragmento de código
GEMINI_API_KEY=tu_api_key_secreta_aqui

Dicha API Key es una cadena alfanumérica.
Más información de como crear la API KEY: https://ai.google.dev/gemini-api/docs/api-key?hl=es-419

### 5. Iniciar el Servidor
Levanta el servidor local de Node.js con el siguiente comando:
```
Bash
node server.js
```
Verás un mensaje en la terminal indicando: Servidor corriendo en el puerto 3000.

### 6. Abrir la Aplicación
Abre tu navegador web favorito (Chrome, Edge, Firefox) y dirígete a:
👉 http://localhost:3000/index.html

Allí, entrarás a la parte del index, para ver el funcionamiento completo del sistema es necesario crear una cuenta e iniciar sesión. Para ello, en el lado superior derecho está el botón de "Iniciar sesión", debajo, debes dar click en el botón de "Registrate aquí". Prueba a crear un perfil de administrador y uno de transportista. Dichos registros se crean en una base de datos de excel que se inicia localmente al crear el primer registro.

📁 HACHATHON DEVF/
├── 📁 back/                         # Lógica de scripts (JS)
│   ├── 📄 formulario_admin.js       # Control de vista administrativa
│   ├── 📄 formulario_transportista.js # Control de vista transportista
│   ├── 📄 index.js                  # Navegación y lógica general
│   ├── 📄 login.js                  # Validación de acceso
│   └── 📄 registro.js               # Lógica de creación de cuentas
├── 📁 db/                           # Almacenamiento de datos
│   └── 📊 BASE_DE_DATOS_GENERAL.xlsx# Base de datos principal ya con datos
├── 📁 front\styles/                 # Hojas de estilo específicas
│   └── 🎨 formularios.css           # Estilos de los inputs y steps
├── 📁 img/                          # Recursos visuales (Logos, camiones)
├── 📁 node_modules/                 # Dependencias de Node.js
├── 📁 styles/                       # Estilos globales
    └── 🎨 index.css                 # Estilos de index
├── 📁 users/                        # Gestión de usuarios específica
│   └── 📊 base_datos.xlsx           # Listado de credenciales (creado localmente al realizar un registro)
├── 📄 .env                          # Aquí va el API key
├── 📄 .gitignore                    # Archivos excluidos de Git
├── 📄 admin.html                    # Dashboard administrativo
├── 📄 chat-admin.html               # Interfaz Chatbot Admin
├── 📄 chat-trans.html               # Interfaz Chatbot Transportista
├── 📄 cuidado.html                  # Sección "Cuidado de la flota"
├── 📄 formulario_admin.html         # Formulario de registro de unidades
├── 📄 formulario_transportista.html # Formulario de recepción y entrega de transportistas
├── 📄 index.html                    # Entrada principal del sistema
├── 📄 login.html                    # Interfaz de inicio de sesión
├── 📄 package-lock.json             # Historial de versiones de librerías
├── 📄 package.json                  # Definición de scripts y dependencias
├── 📄 README.md                     # Documentación del proyecto
├── 📄 registro.html                 # Pantalla de creación de usuario
└── 📄 server.js                     # Servidor backend de la aplicación

## ⚠️ Notas Importantes para Evaluación
No usar Live Server: La aplicación está diseñada para ser servida directamente por Node.js. Usar extensiones como Live Server de VS Code causará que la página se recargue cada vez que la base de datos de Excel se actualice. Entra siempre por localhost:3000/index.html

Si se agregan campos nuevos en los comentarios adicionales de los formularios del frontend, el backend creará automáticamente las columnas necesarias en el archivo de Excel gracias a la función json_to_sheet.

## Para probar el sistema, siéntete libre de explorarlo con ambos perfiles, de administrador o transportista, llenar formularios, ver que se llenan los campos en la base de datos, y nuestra parte favorita: el Panel de Administrador. Allí, podrás ver los registros que acabas de crear en el formulario de "Registro de unidad" del administrador, su estatus de mantenimiento requerido, los detalles de los mantenimientos realizados con un pop-up emergente y la opción para actualizar y marcar un mantenimiento registrado en el panel sin fecha de realización como "Realizado". De igual manera, si se realiza el registro de un transporte en condiciones óptimas, y posteriormente un transportista ingresa el ID de ese transporte al llenar un formulario de recepción o entrega, y pone que las condiciones de operación son malas y un comentario detallando una falla no percatada, el panel de administrador actualiza el "Comentario IA" y el "Estatus" del mismo para prestar atención a los comentarios hechos por el transportista.

## 💻 Desarrollado con pasión para el Hackathon Traxion 2026.
# Saludos cordiales y anticipando los resultados, Desire, Marcos y Sandra.
