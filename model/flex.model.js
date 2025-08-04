import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'flex'; 

const flexSchema = new mongoose.Schema({

    seller: {type: String, required: true},

    ventaid: {type: Number, required: true, unique: true},

    shipping: {type: Number, required: true},

    fechaVenta: { type: String, required: true },

    fechaEntrega: { type: Date, required: true },

    diaSemana: { type: Number, required: true },

    mes: { type: String, required: true },

    dia: { type: String, required: true },

    producto: { type: String, required: true },

    zona: { type: String, required: true },

    envio: { type: String, required: true },

    precio: { type: String, required: true },

    pago: { type: Number, required: true }

},{ versionKey: false });

const flexModel = mongoose.model(collection, flexSchema); 

export default flexModel;