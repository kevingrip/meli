import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'token'; 

const tokenSchema = new mongoose.Schema({

    expires_in: {type: Number, required: true},

    access_token_c1: { type: String, required: true },

    access_token_c2: { type: String, required: true },

    fecha: { type: String, required: false },


},{ versionKey: false });

const tokenModel = mongoose.model(collection, tokenSchema); 

export default tokenModel;