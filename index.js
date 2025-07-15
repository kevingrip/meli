import express from "express";
import { getOrders, getOrdersToPrint, getOrdersFlex, getEtiqueta, getCountOrders, getCountEtiquetas } from "./api.js";
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();


const fakeUser = {
    email: "admin@example.com",
    // Contraseña: "123456" hasheada con bcrypt
    password: process.env.password
};


// bcrypt.hash(passwordPlano, 10).then(hash => {
//   console.log("Hash generado:", hash);
// });



const app = express()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())

const PORT = process.env.PORT || 3500

// Ruta de login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (email !== fakeUser.email) {
        return res.status(401).json({ error: "Email incorrecto" });
    }

    const isValid = await bcrypt.compare(password, fakeUser.password);
    if (!isValid) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '30m' });

    res.json({ token });
});
//////

const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token requerido" });

    const token = authHeader.split(" ")[1];
    console.log("Token extraído:", token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Token inválido o expirado" });
    }
};

app.get('/api/orders', verificarToken, async (req, res) => {
    try {
        const data = await getOrders()
        const counts = await getCountOrders(data)
        const packs = await getCountEtiquetas(data)
        res.json({ data, counts, packs })
    } catch (error) {
        console.error(error)
    }

})


app.get(('/print'), async (req, res) => {
    try {
        const dataToPrint = await getOrdersToPrint()
        console.log(dataToPrint)
        res.json(dataToPrint)
    } catch (error) {
        console.error(error)
    }
})

app.get(('/flex'), async (req, res) => {
    try {
        const dataFlex = await getOrdersFlex()
        const counts = await getCountOrders(dataFlex)
        res.json({ dataFlex, counts })
    } catch (error) {
        console.error(error)
    }
})

app.post(('/etiqueta'), async (req, res) => {

    const { usuario, id, variantes } = req.body
    try {
        const etiquetaGenerada = await getEtiqueta(usuario, id, variantes)
        if (!etiquetaGenerada.success || !etiquetaGenerada.pdfBytes) {
            throw new Error(etiquetaGenerada.error || 'PDF no generado');
        }

        // Devolver el PDF directamente para descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${id}.pdf`);
        res.send(etiquetaGenerada.pdfBytes);
    } catch (error) {
        console.error('Error al generar etiqueta:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }


})



app.listen(PORT, () => {
    console.log(`Servidor levantado en el puerto http://192.168.0.8:${PORT} o http://localhost:${PORT}`)
})