const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Permite recibir datos de tu HTML y entender formato JSON
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Ruta donde se guardará la carpeta y el Excel
const folderPath = path.join(__dirname, 'users');
const excelFilePath = path.join(folderPath, 'base_datos.xlsx');

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configura tu API Key aquí
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

app.post('/api/registro', (req, res) => {
    const { id_camionero, nombre_completo, fecha_nacimiento, password, rol } = req.body;

    // 1. Crear la carpeta 'users' si no existe
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    let workbook;
    let worksheet;
    let datosExistentes = [];

    // 2. Verificar si el Excel ya existe
    if (fs.existsSync(excelFilePath)) {
        // Leer el archivo existente
        workbook = xlsx.readFile(excelFilePath);
        worksheet = workbook.Sheets[workbook.SheetNames[0]];
        // Convertir la hoja a un arreglo de objetos de Javascript
        datosExistentes = xlsx.utils.sheet_to_json(worksheet);
        
        // Validar que el ID no esté repetido
        const usuarioExiste = datosExistentes.find(u => u.id_camionero === id_camionero);
        if (usuarioExiste) {
            return res.status(400).json({ error: "Este ID ya está registrado." });
        }
    } else {
        // Si no existe, crear un nuevo libro de Excel
        workbook = xlsx.utils.book_new();
    }

    // 3. Agregar el nuevo usuario a los datos
    datosExistentes.push({
        id_camionero,
        nombre_completo,
        fecha_nacimiento,
        password,
        rol
    });

    // 4. Crear una nueva hoja con los datos actualizados y guardarla
    worksheet = xlsx.utils.json_to_sheet(datosExistentes);
    
    // Si la hoja ya existía, la reemplazamos, si no, la agregamos
    if (workbook.SheetNames.length > 0) {
        workbook.Sheets[workbook.SheetNames[0]] = worksheet;
    } else {
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
    }

    xlsx.writeFile(workbook, excelFilePath);

    res.json({ mensaje: "¡Usuario registrado exitosamente en Excel!" });
});

// --- NUEVA RUTA PARA EL LOGIN ---
app.post('/api/login', (req, res) => {
    const { id_camionero, password } = req.body;

    // 1. Verificar si la base de datos existe
    if (!fs.existsSync(excelFilePath)) {
        return res.status(404).json({ error: "Base de datos no encontrada. Registra un usuario primero." });
    }

    // 2. Leer el Excel
    const workbook = xlsx.readFile(excelFilePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const usuarios = xlsx.utils.sheet_to_json(worksheet);

    // 3. Buscar al usuario ignorando mayúsculas/minúsculas
    const usuarioEncontrado = usuarios.find(u => u.id_camionero === id_camionero.toUpperCase());

    // 4. Validaciones
    if (!usuarioEncontrado) {
        return res.status(404).json({ error: "El ID de camionero no existe." });
    }

    if (usuarioEncontrado.password !== password) {
        return res.status(401).json({ error: "Contraseña incorrecta." });
    }

    // 5. Si todo está bien, mandamos éxito y el nombre del usuario
    res.json({ 
        mensaje: "Login exitoso", 
        nombre: usuarioEncontrado.nombre_completo,
        rol: usuarioEncontrado.rol // Puedes usar esto después si quieres limitar qué ven
    });
});




// --- RUTA PARA ACTUALIZAR MANTENIMIENTOS EN EL EXCEL ---
app.post('/api/actualizar-mantenimiento', (req, res) => {
    const { id_camion, mantenimientosActualizados } = req.body;
    const dbPath = path.join(__dirname, 'db', 'BASE_DE_DATOS_GENERAL.xlsx');

    try {
        const workbook = xlsx.readFile(dbPath);
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const datosUnidades = xlsx.utils.sheet_to_json(worksheet);

        // Buscamos la fila del camión que queremos modificar
        const index = datosUnidades.findIndex(u => String(u.Id_unidad) === String(id_camion));

        if (index !== -1) {
            // Actualizamos la celda convirtiendo el JSON modificado de vuelta a texto
            datosUnidades[index].mantenimientos = JSON.stringify(mantenimientosActualizados);
            
            // Sobreescribimos la hoja de Excel
            const nuevaHoja = xlsx.utils.json_to_sheet(datosUnidades);
            workbook.Sheets[worksheetName] = nuevaHoja;
            xlsx.writeFile(workbook, dbPath);
            
            res.json({ success: true, mensaje: "Excel actualizado correctamente" });
        } else {
            res.status(404).json({ error: "Camión no encontrado en la base de datos" });
        }
    } catch (error) {
        console.error("Error al actualizar Excel:", error);
        res.status(500).json({ error: "Error interno al guardar en Excel" });
    }
});



// --- NUEVA RUTA PARA LEER LA BASE DE DATOS GENERAL ---
app.get('/api/unidades', (req, res) => {
    // Apuntamos a la carpeta 'db' y a tu archivo Excel
    const dbPath = path.join(__dirname, 'db', 'BASE_DE_DATOS_GENERAL.xlsx');

    // Verificamos que el archivo realmente exista
    if (!fs.existsSync(dbPath)) {
        return res.status(404).json({ error: "No se encontró el archivo BASE_DE_DATOS_GENERAL.xlsx en la carpeta db" });
    }

    try {
        // Leemos el Excel
        const workbook = xlsx.readFile(dbPath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // Tomamos la primera hoja
        
        // Convertimos todo a un arreglo de objetos JSON
        const datosUnidades = xlsx.utils.sheet_to_json(worksheet);
        
        // Enviamos los datos al frontend
        res.json(datosUnidades);
    } catch (error) {
        console.error("Error al leer el Excel:", error);
        res.status(500).json({ error: "Error interno al leer la base de datos" });
    }
});

// --- RUTA PARA GUARDAR/ACTUALIZAR REPORTE DEL TRANSPORTISTA ---
app.post('/api/guardar-reporte', async (req, res) => {
    let respuestasFormulario = req.body;
    const idCamion = respuestasFormulario.Id_unidad;

    try {
        // 1. Llamamos a Gemini para analizar el reporte
        const analisisIA = await analizarReporteConIA(respuestasFormulario);
        
        // 2. Mezclamos las respuestas originales con el análisis de la IA
        respuestasFormulario = { ...respuestasFormulario, ...analisisIA };

        // 3. Lógica de guardado en Excel (la que ya teníamos)
        const dbPath = path.join(__dirname, 'db', 'BASE_DE_DATOS_GENERAL.xlsx');
        const workbook = xlsx.readFile(dbPath);
        const worksheetName = workbook.SheetNames[0];
        let datosUnidades = xlsx.utils.sheet_to_json(workbook.Sheets[worksheetName]);

        const index = datosUnidades.findIndex(u => String(u.Id_unidad) === String(idCamion));

        if (index !== -1) {
            datosUnidades[index] = { ...datosUnidades[index], ...respuestasFormulario };
        } else {
            datosUnidades.push(respuestasFormulario);
        }

        const nuevaHoja = xlsx.utils.json_to_sheet(datosUnidades);
        workbook.Sheets[worksheetName] = nuevaHoja;
        xlsx.writeFile(workbook, dbPath);
        
        res.json({ success: true, analisis: analisisIA });

    } catch (error) {
        res.status(500).json({ error: "Error procesando reporte con IA" });
    }
});






async function analizarReporteConIA(datosReporte) {
    const prompt = `
    Eres un experto analista mecánico de Traxion. Analiza el siguiente reporte de unidad y genera un diagnóstico técnico.
    
    DATOS DEL REPORTE:
    - Comentario del chofer: "${datosReporte.comentario_general}"
    - ¿Hubo pérdida de potencia?: ${datosReporte.perdida_potencia || 'No reportado'}
    - ¿Ruidos extraños?: ${datosReporte.ruidos_extranos || 'No reportado'}
    - ¿Sobrecalentamiento?: ${datosReporte.sobrecalentamiento || 'No reportado'}
    
    INSTRUCCIONES:
    Devuelve ÚNICAMENTE un objeto JSON con esta estructura:
    {
      "status": "URGENTE" | "PREVENTIVO" | "REVISIÓN SUGERIDA" | "ESTABLE",
      "ponderacion_status": (Número del 0 al 100),
      "comentario_ia": (Breve recomendación técnica de máximo 15 palabras)
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Limpiamos la respuesta por si Gemini agrega markdown (```json ... ```)
        const jsonCleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonCleaned);
    } catch (error) {
        console.error("Error con Gemini:", error);
        return { status: "REVISIÓN REQUERIDA", ponderacion_status: 50, comentario_ia: "Error al procesar diagnóstico." };
    }
}







app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});