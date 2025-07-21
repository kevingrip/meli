import express from "express";
import { getOrders, getStockMeli, getOrdersFlex, getEtiqueta, getCountOrders, getCountEtiquetas } from "./api.js";
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();


const adminUser = {
    user: "admin",
    // Contraseña: "123456" hasheada con bcrypt
    password: process.env.password
};

const juanUser = {
    user: "juancruz",
    // Contraseña: "123456" hasheada con bcrypt
    password: process.env.passwordJuan
};

// const passwordPlano='juanakd'
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
    let { user, password } = req.body;

    user = user.toLowerCase();

    const checkUser = () =>{
        if (adminUser.user==user){
            return adminUser
        }
        if (juanUser.user==user){
            return juanUser
        }
        return null
    }

    const usuario = checkUser()

    if (!usuario || usuario.user!==user) {
        return res.status(401).json({ error: "Usuario incorrecto" });
    }

    const isValid = await bcrypt.compare(password, usuario.password);
    if (!isValid) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '10m' }); //si corregimos el tiempo de expiracion aca, lo hacemos tambien en settimeout de index e inicio 
    
    res.json({ token });
});

//////

const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token requerido" });

    const token = authHeader.split(" ")[1];
    // console.log("Token extraído:", token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Token inválido o expirado" });
    }
};

/////

app.get('/api/orders', verificarToken, async (req, res) => {
    try {
        const stock = await getStockMeli()
        const data = await getOrders()
        const counts = await getCountOrders(data)
        const packs = await getCountEtiquetas(data)
        res.json({ stock, data, counts, packs })
    } catch (error) {
        console.error(error)
    }
})

app.get('/api/alf', verificarToken, async (req, res) => {
    try {
        const data = await getOrders(true)
        const counts = await getCountOrders(data)
        const packs = await getCountEtiquetas(data)
        res.json({ data, counts, packs })
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