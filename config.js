import axios from 'axios'
import tokenModel from './model/token.model.js'
import dotenv from 'dotenv'
dotenv.config();

// import mongoose from 'mongoose';

// const mongo_uri = process.env.MONGO_DB

// mongoose.connect(mongo_uri)
//     .then(() => console.log('Conectado a MongoDB'))
//     .catch(err => console.error('Error de conexión a MongoDB', err));

const urlToken = "https://api.mercadolibre.com/oauth/token"

const postSeller1 = {
    params: {
        grant_type: "refresh_token",
        client_id: process.env.client_id_1,
        client_secret: process.env.client_secret_1,
        refresh_token: process.env.refresh_token_1,
    },
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
}

const postSeller2 = {
    params: {
        grant_type: "refresh_token",
        client_id: process.env.client_id_2,
        client_secret: process.env.client_secret_2,
        refresh_token: process.env.refresh_token_2,
    },
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
}

const createTokens = async () => {
    const segundosActual = Math.floor(Date.now() / 1000);
    const c1 = await axios.post(urlToken, postSeller1.params, postSeller1.headers)
    const c2 = await axios.post(urlToken, postSeller2.params, postSeller2.headers)
    const newToken = await tokenModel.create(
        {
            expires_in: segundosActual,
            access_token_c1: c1.data.access_token,
            access_token_c2: c2.data.access_token,
            fecha: new Date().toLocaleDateString()
        }
    )
    return newToken
}


const refreshToken = async () => {
    try {
        const token1 = await axios.post(urlToken, null, postSeller1)
        const token2 = await axios.post(urlToken, null, postSeller2)
        // console.log(token1.data.access_token)
        return [token1.data.access_token, token2.data.access_token]
    } catch (error) {
        // console.error("Error al refrescar token:", error.response?.data || error.message);
        // throw error;
    }
    // try {
    //     const cantDocument = await tokenModel.countDocuments()
    //     const segundosActual = Math.floor(Date.now() / 1000);
    //     var tokens;

    //     if (cantDocument > 0) {
    //         const getToken = await tokenModel.find()
    //         tokens = getToken[0]
    //         const segundosExpira = tokens.expires_in
    //         // console.log("segundos actual:", segundosActual)
    //         // console.log("segundos expira:", segundosExpira)
    //         console.log("tiempo restantes token:", ((21000 - (segundosActual - segundosExpira))/60/60).toFixed(2),"hs")
    //         if (segundosActual - segundosExpira > 21000) {
    //             await tokenModel.deleteMany({});
    //             tokens = await createTokens()
    //             console.log("Tiempo excedido: Nuevo token creado")
    //         }else{
    //             console.log("Token en tiempo correcto: No se crea nuevo Token")
    //             // console.log(tokens)
    //         }
            
    //     } else {
    //         console.log("Nuevo token creado desde cero")
    //         tokens = await createTokens()
    //         // console.log(tokens)
    //     }

    //     return [tokens.access_token_c1, tokens.access_token_c2]
    // } catch (error) {
    //     console.error(error.message)
    // }
}

export { refreshToken }

/////// HACER QUE EN API NO SE EJECUTE REFRESH TOKEN, SINO QUE LO LEA DE MONGODB, Y QUE REFRESH TOKEN SE EJECUTE EN INDEX