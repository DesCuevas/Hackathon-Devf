const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const app = express();
const PORT = 3000;

// Permite recibir datos de tu HTML y entender formato JSON
app.use(cors());
app.use(express.json());

// Ruta donde se guardará la carpeta y el Excel
const folderPath = path.join(__dirname, 'users');
const excelFilePath = path.join(folderPath, 'base_datos.xlsx');

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
        password // En la vida real esto se encripta, pero para el hackathon está bien
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
        rol: "Transportista" // Puedes usar esto después si quieres limitar qué ven
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});