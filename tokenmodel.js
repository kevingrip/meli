import mongoose from "mongoose";

const esquema = new mongoose.Schema({
    access_token: {
        type: String,
        required: true
    },
    refresh_token: {
        type: String,
        required: true
    },
    client_id: {
        type: String,
        required: true
    },
    client_secret: {
        type: String,
        required: true
    },
    seller_id:{
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    expires_at: {
        type: Number,
        required: true
    }
});

export default mongoose.model(
    "MercadoLibreToken",
    esquema,
    "mercadolibretokens"
);