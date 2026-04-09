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
git clone [https://github.com/TU_USUARIO/TU_REPOSITORIO.git](https://github.com/TU_USUARIO/TU_REPOSITORIO.git)
cd TU_REPOSITORIO
3. Instalar Dependencias
Instala todas las librerías necesarias del backend (Express, xlsx, dotenv, Gemini) ejecutando:

Bash
npm install
4. Configurar Variables de Entorno (API Key)
Por seguridad, la llave de la Inteligencia Artificial no está incluida en el código.

Crea un archivo en la raíz del proyecto llamado exactamente .env

Abre el archivo y pega tu API Key de Google AI Studio con este formato:

Fragmento de código
GEMINI_API_KEY=tu_api_key_secreta_aqui
5. Iniciar el Servidor
Levanta el servidor local de Node.js con el siguiente comando:

Bash
node server.js
Verás un mensaje en la terminal indicando: Servidor corriendo en el puerto 3000.

6. Abrir la Aplicación
Abre tu navegador web favorito (Chrome, Edge, Firefox) y dirígete a:
👉 http://localhost:3000

📂 Estructura del Proyecto
Plaintext
📁 raiz-del-proyecto/
├── 📁 db/                       # Base de datos
│   └── BASE_DE_DATOS_GENERAL.xlsx # Archivo donde se guarda la info real
├── 📁 back/                     # Lógica Frontend
│   ├── index.js                 # Ruteo de la SPA y llamadas al API
│   └── formularios.js           # Lógica de formularios y UI
├── .env                         # Llaves maestras (Ignorado en Git)
├── .gitignore                   # Archivos excluidos de GitHub
├── index.html                   # Cascarón principal de la SPA
├── admin.html                   # Vista inyectable del Administrador
├── registro.html                # Vista inyectable de Formularios
├── package.json                 # Recetario de dependencias de Node
└── server.js                    # Servidor Backend (Express + API)
⚠️ Notas Importantes para Evaluación
No usar Live Server: La aplicación está diseñada para ser servida directamente por Node.js. Usar extensiones como Live Server de VS Code causará que la página se recargue cada vez que la base de datos de Excel se actualice. Entra siempre por localhost:3000.

Si se agregan campos nuevos en los formularios del frontend, el backend creará automáticamente las columnas necesarias en el archivo de Excel gracias a la función json_to_sheet.

💻 Desarrollado con pasión para el Hackathon Traxion 2026
