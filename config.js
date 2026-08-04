import axios from "axios";
import MercadoLibreToken from "./tokenmodel.js"

export const obtenerToken = async () => {
    console.log(MercadoLibreToken.collection.name);
    const token = await MercadoLibreToken.find();
    console.log(token)
    if (!token.length) {
        throw new Error(`No se encuentra token`);
    }
    // Primera ejecución
    // if (!token) {

    //     console.log("Creando documento del token...");

    //     try {
    //         token = await MercadoLibreToken.create({
    //             seller_id,
    //             client_id: process.env.ML_CLIENT_ID,
    //             client_secret: process.env.ML_CLIENT_SECRET,
    //             access_token: process.env.ML_ACCESS_TOKEN,
    //             refresh_token: process.env.ML_REFRESH_TOKEN,
    //             expires_at: Date.now() + (6 * 60 * 60 * 1000)
    //         });

    //         console.log("Creado:", token);
    //     } catch (err) {
    //         console.error(err);
    //     }

    //     return token.access_token;
    // }

    // Todavía es válido
    const listaTokens = []
    for (const mltoken of token) {
        if (Date.now() < mltoken.expires_at) {
            listaTokens.push({ access_token: mltoken.access_token, seller: mltoken.seller_id });
        } else {
            console.log("Renovando Access Token...");

            try {
                const { data } = await axios.post(
                    "https://api.mercadolibre.com/oauth/token",
                    {
                        grant_type: "refresh_token",
                        client_id: mltoken.client_id,
                        client_secret: mltoken.client_secret,
                        refresh_token: mltoken.refresh_token
                    }
                );

                mltoken.access_token = data.access_token;
                mltoken.refresh_token = data.refresh_token;
                mltoken.expires_at = Date.now() + (data.expires_in * 1000);

                await mltoken.save();

                console.log("Token renovado.");

                listaTokens.push({ access_token: mltoken.access_token, seller: mltoken.seller_id });
            } catch (error) {
                console.error(
                    "Error renovando token:",
                    error.response?.data || error.message
                );
                throw error;
            }
        }
    }

    return listaTokens


};