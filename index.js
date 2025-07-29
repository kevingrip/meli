import express from "express";
import { getOrders, getStockMeli, getOrdersFlex, getEtiqueta, getCountOrders, getCountEtiquetas } from "./api.js";
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import flexModel from "./model/flex.model.js";
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🔗 Conexión a MongoDB exitosa'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));


const users = [
    { user: "admin", password: process.env.password },
    { user: "juancruz", password: process.env.passwordJuan },
    { user: "jose", password: process.env.password }
]


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

    const checkUser = () => {
        const findUser = users.find(usuario => usuario.user === user)

        if (findUser) {
            return findUser
        }
        return null
    }

    const usuario = checkUser()

    if (!usuario || usuario.user !== user) {
        return res.status(401).json({ error: "Usuario incorrecto" });
    }

    const isValid = await bcrypt.compare(password, usuario.password);
    if (!isValid) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '15m' }); //si corregimos el tiempo de expiracion aca, lo hacemos tambien en settimeout de index e inicio 

    res.json({ token });
});

//////

const verificarToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader)
        return res.status(401).json({ error: "Token requerido" });

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Token inválido o expirado" });
    }
};

/////

//actualizar dia semana mongo

// async function actualizarDiaSemana() {
//     try {
//         const docs = await flexModel.find();
//         let nuevoDiaSemana;
//         for (const doc of docs) {
//             if(doc.dia==='lunes'){
//                 nuevoDiaSemana=1
//             }else if (doc.dia==='martes'){
//                 nuevoDiaSemana=2
//             }else if (doc.dia==='miercoles'){
//                 nuevoDiaSemana=3
//             }else if (doc.dia==='jueves'){
//                 nuevoDiaSemana=4
//             }else if (doc.dia==='viernes'){
//                 nuevoDiaSemana=5
//             }else if (doc.dia==='sabado'){
//                 nuevoDiaSemana=6
//             }else if (doc.dia==='domingo'){
//                 nuevoDiaSemana=0
//             }
//             // Solo actualizar si no coincide o no existe diaSemana
//             if (doc.diaSemana !== nuevoDiaSemana) {
//                 doc.diaSemana = nuevoDiaSemana;
//                 await doc.save();
//             }
//         }

//         console.log('Actualización completa');
//     } catch (error) {
//         console.error('Error actualizando diaSemana:', error);
//     }
// }

// actualizarDiaSemana()

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

app.get('/api/log', verificarToken, async (req, res) => {
    try {
        const data = await getOrdersFlex()
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

app.post(('/mongo'), async (req, res) => {
    const bodyMongo = req.body || {};
    const { seller, ventaid, shipping, fechaVenta, fechaEntrega, mes, producto, zona, envio, precio, pago, dia, diaSemana } = bodyMongo

    const datosFlex = {
        seller,
        ventaid,
        shipping,
        fechaVenta,
        fechaEntrega,
        diaSemana,
        dia,
        mes,
        producto,
        zona,
        envio,
        precio,
        pago
    };

    try {
        if (seller && ventaid && shipping) {
        const nuevoEnvio = new flexModel(datosFlex);
        await nuevoEnvio.save();
        console.log('✅ FLEX guardado en MongoDB');
        return res.status(200).json({ success: true, message: "Guardado correctamente" });

    } else {
        console.log('❌ Datos incompletos, no se guarda en MongoDB');
        return res.status(400).json({ success: false, message: "Datos incompletos" });

    }
    } catch (error) {
        console.error('❌ Error al guardar en MongoDB:', error.message);
        return res.status(500).json({ success: false, message: "Error interno al guardar en MongoDB" });
        
    }

    

})



app.get('/api/mongo/:ventaid', async (req, res) => {
    try {
        const data = await flexModel.find({ ventaid: req.params.ventaid })
        
        res.json(data)
    } catch (error) {
        console.error('Error al obtener datos de MongoDB:', error);
    }
})

app.get('/api/pagos/:envio', async (req, res) => {
    try {
        const envioParam = req.params.envio;
        let filtro = {};

        if (envioParam && envioParam !== 'null' && envioParam !== 'TODAS') {
            filtro = { envio: envioParam };
        }
        const data = await flexModel.find(filtro).sort({ fechaEntrega: 1 });
        res.json(data)
    } catch (error) {
        console.error('Error al obtener datos de MongoDB:', error);
    }
})


app.get('/api/mongo/', async (req, res) => {
    try {
        const data = await flexModel.find()
        res.json(data)
    } catch (error) {
        console.error('Error al obtener datos de MongoDB:', error);
    }
})


app.listen(PORT, () => {
    console.log(`Servidor levantado en el puerto http://192.168.0.8:${PORT} o http://localhost:${PORT}`)
})