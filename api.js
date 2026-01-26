import axios, { all } from 'axios'
import path from 'path';
import fs from 'fs'
import os from 'os';
import { refreshToken } from './config.js'
import { PDFDocument, rgb } from 'pdf-lib';
import dotenv from 'dotenv'
dotenv.config();
import { ordersRoute, cantidadStockPublicado, shippingRoute, paymentRoute, costShippingRoute, searchOrderId } from './routes.js';



const token = await refreshToken()

const access_token1 = token[0]
const access_token2 = token[1]

const seller = {
    c1: process.env.sellerC1,
    c2: process.env.sellerC2
}


const headers = {
    c1: {
        Authorization: `Bearer ${access_token1}`
    },
    c2: {
        Authorization: `Bearer ${access_token2}`
    }
}

const getToken = (nickname) => {
    if (nickname === 'F3FG') {
        return headers.c1
    } else if (nickname === 'HUELLITAS3F') {
        return headers.c2
    }
}

const getSeller = (nickname) => {
    if (nickname === 'F3FG') {
        return seller.c1
    } else if (nickname === 'HUELLITAS3F') {
        return seller.c2
    }
}


const createVentaId = (orders) => {

    orders.forEach(element => {
        if (element.pack_id) {
            element.ventaid = element.pack_id

        } else {
            element.ventaid = element.id
        }
    })
    return orders
}

const variantes = (valueName, mla) => {
    let type;
    let valueVariante;
    let brev;


    if (valueName === "Beige" && ['MLA2420073752', 'MLA2006797664', 'MLA1552136575'].includes(mla) || ["MLA2097220908", "MLA2152579766"].includes(mla)) {
        valueVariante = 'Beige'
        type = 'Alfombra'
        brev = 'BG'

    } else if (valueName === "Gris oscuro" && ['MLA2420073752', 'MLA2006797664', 'MLA1552136575'].includes(mla) || ["MLA2097220910", "MLA2152488642", "MLA1517485317"].includes(mla)) {
        valueVariante = 'Gris oscuro'
        type = 'Alfombra'
        brev = 'OS'

    } else if (valueName === "Gris Claro" && ['MLA2420073752', 'MLA2006797664', 'MLA1552136575'].includes(mla) || ["MLA2097220912", "MLA2152475848", "MLA1517498065", "MLA2285279166"].includes(mla)) {
        valueVariante = 'Gris Claro'
        type = 'Alfombra'
        brev = 'CL'

    } else if ((valueName === "Negro" && ['MLA2420073752', 'MLA2006797664', 'MLA1552136575'].includes(mla)) || ["MLA2104745370", "MLA1508055601", "MLA1517069435"].includes(mla)) {
        valueVariante = 'Negro'
        type = 'Alfombra'
        brev = 'NG'

    } else if (valueName === "Blanco" && ['MLA2420073752', 'MLA2006797664', 'MLA1552136575'].includes(mla) || ["MLA1507750191", "MLA2153666050"].includes(mla)) {
        valueVariante = 'Blanco'
        type = 'Alfombra'
        brev = 'BL'

    } else if ((valueName === "Negro" && ['MLA2290461256', "MLA1552200067"].includes(mla)) || ["MLA2289561384"].includes(mla)) {
        valueVariante = 'Negro (2mt)'
        type = 'Alfombra'
        brev = 'NG (2mt)'

    } else if ((valueName === "Beige" && ['MLA2290461256', "MLA1552200067"].includes(mla)) || ["MLA2289535536", "MLA2300115880", "MLA1517562895", "MLA2420073860", "MLA1552135457"].includes(mla)) {
        valueVariante = 'Beige (2mt)'
        type = 'Alfombra'
        brev = 'BG (2mt)'

    } else if ((valueName === "Gris oscuro" && ['MLA2290461256', "MLA1552200067"].includes(mla)) || ["MLA2423225008"].includes(mla)) {
        valueVariante = 'Gris oscuro (2mt)'
        type = 'Alfombra'
        brev = 'OS (2mt)'

    } else if ((valueName === "Gris" && ['MLA2290461256', "MLA1552200067"].includes(mla))) {
        valueVariante = 'Gris claro (2mt)'
        type = 'Alfombra'
        brev = 'CL (2mt)'

    } else if (["MLA1500334145", 'MLA2270106622'].includes(mla)) {
        valueVariante = 'Pajaro'
        type = 'Juguete'
        brev = 'PJ'

    } else if (["MLA1515754789"].includes(mla)) {
        valueVariante = 'Cepillo'
        type = 'Cepillo'
        brev = 'CE'

    } else if (["MLA1241847466", "MLA1287984004"].includes(mla)) {
        valueVariante = 'Mundial Qatar'
        type = 'Panini'
        brev = 'MQ'

    } else if (["MLA1413919557", "MLA1413968381"].includes(mla)) {
        valueVariante = 'Copa America'
        type = 'Panini'
        brev = 'AM'

    }
    return { type, valueVariante, brev }
}

const fixVentaId = (orders) => {
    const allVentas = []
    const allVId = []

    orders.forEach(element => {
        if (!allVId.includes(element.ventaid)) {
            allVId.push(element.ventaid)
            element.orderItemNuevo = []
            element.orderResumen ??= []
            element.ordersOriginales = []
            element.paymentsOriginales = []
            const paymentsApproved = element.payments.filter(payment => payment.status === "approved").map(order => order.id)
            element.ordersOriginales.push(element.id)
            element.paymentsOriginales.push(...paymentsApproved)

            const valueName = element.order_items?.[0]?.item?.variation_attributes?.[0]?.value_name;
            const mla_id = element.order_items?.[0]?.item?.id

            var { type, valueVariante, brev } = variantes(valueName, mla_id);

            var cantReal
            if (["MLA2152475848", "MLA2152488642", "MLA2152579766", "MLA2153666050", "MLA1508055601", "MLA2420073752"].includes(mla_id)) {
                cantReal = 2 * element.order_items[0].quantity
            } else {
                cantReal = element.order_items[0].quantity
            }

            element.orderItemNuevo.push(element.order_items[0])
            element.orderResumen.push({
                tipo: type,
                variante: valueVariante,
                cantidad: cantReal,
                abreviado: brev
            })

            allVentas.push(element)
        } else {
            allVentas.forEach(ventas => {
                if (ventas.ventaid === element.ventaid) {
                    ventas.ordersOriginales.push(element.id)
                    const paymentsApproved = element.payments.filter(payment => payment.status === "approved").map(order => order.id)
                    ventas.paymentsOriginales.push(...paymentsApproved)
                    ventas.orderItemNuevo.push(element.order_items[0])
                    const valueName = element.order_items?.[0]?.item?.variation_attributes?.[0]?.value_name;
                    const mla_id = element.order_items?.[0]?.item?.id
                    var { type, valueVariante, brev } = variantes(valueName, mla_id);

                    var cantReal
                    if (["MLA2152475848", "MLA2152488642", "MLA2152579766", "MLA2153666050", "MLA1508055601"].includes(mla_id)) {
                        cantReal = 2 * element.order_items[0].quantity
                    } else {
                        cantReal = element.order_items[0].quantity
                    }
                    ventas.orderResumen.push({
                        tipo: type,
                        variante: valueVariante,
                        cantidad: cantReal,
                        abreviado: brev
                    })
                }
            })
        }
    })

    allVentas.forEach(venta => {
        const resumenAgrupado = {}

        venta.orderResumen.forEach(item => {
            const key = `${item.tipo}-${item.variante}`;

            if (!resumenAgrupado[key]) {
                resumenAgrupado[key] = { ...item }
            } else {
                resumenAgrupado[key].cantidad += item.cantidad;
            }
        })
        venta.orderResumen = Object.values(resumenAgrupado);
    })

    return allVentas
}

//////////////////

const getPayment = async (payment_id, token) => {
    try {
        const paymentData = await axios.get(paymentRoute(payment_id), { headers: token })
        return paymentData.data
    } catch (error) {
        console.error(`Error 404 en pago ${payment_id}:`, error.message);
        return {};
    }
}

const getShippingCost = async (payment_id, token) => {
    try {
        const shippment = await axios.get(costShippingRoute(payment_id), { headers: token })
        return shippment.data
    } catch (error) {
        console.error(`Error 404 en shippment:`, error.message);
        return {};
    }
}

const getStockMeli = async () => {
    try {

        const variantesC2 = [
            { mla: "MLA2097220908", color: "Beige" },
            { mla: "MLA2097220912", color: "Gris Claro" },
            { mla: "MLA2097220910", color: "Gris Oscuro" },
            { mla: "MLA1507750191", color: "Blanco" },
            { mla: "MLA2104745370", color: "Negro" },
            { mla: "MLA2289561384", color: "Negro 2m" },
            { mla: "MLA1500334145", color: "Juguete" },
            { mla: "MLA2270106622", color: "Juguete" },
            { mla: "MLA1515754789", color: "Cepillo" }
        ]

        let resumenStockC2 = [];

        for (const variantes of variantesC2) {
            const getStockC2 = await axios.get(cantidadStockPublicado(variantes.mla), { headers: headers.c2 })
            resumenStockC2.push({ value: variantes.color, cantidad: getStockC2.data.available_quantity })
        }

        const stockC1 = await axios.get(cantidadStockPublicado("MLA2006797664"), { headers: headers.c1 })

        const resumenStockC1 = stockC1.data.variations.map(variacion => {
            const value = variacion.attribute_combinations.map(items => items.value_name).join(" | ");
            const cantidad = variacion.available_quantity
            return { value, cantidad }
        })

        // const stockFigu = await axios.get(cantidadStockPublicado("MLA1241847466"), { headers: headers.c1 })

        // const resumenStockFigu = stockFigu.data.variations.map(variacion => {
        //     const value = variacion.attribute_combinations.map(items => items.value_name).join(" | ");
        //     const cantidad = variacion.available_quantity
        //     return { value, cantidad }
        // })

        // console.log(resumenStockFigu)

        const resumenStock = {
            resumenStockC1,
            resumenStockC2
        }

        return resumenStock


    } catch (error) {
        console.error(`Error 404 en pago getStockMeli:`, error.message);
        return {};
    }
}

const getOrders = async (alfombra, fechaDesde, fechaHasta) => {
    let ordenVentaid = "No identificada";
    try {
        let ordersSellerC1;
        let ordersSellerC2;
        if (fechaDesde && fechaHasta) {
            ordersSellerC1 = await axios.get(searchOrderId(seller.c1, fechaDesde, fechaHasta), { headers: headers.c1 })
            ordersSellerC2 = await axios.get(searchOrderId(seller.c2, fechaDesde, fechaHasta), { headers: headers.c2 })
        } else {
            ordersSellerC1 = await axios.get(ordersRoute(seller.c1), { headers: headers.c1 })
            ordersSellerC2 = await axios.get(ordersRoute(seller.c2), { headers: headers.c2 })
        }
        
        const allOrders = [...ordersSellerC1.data.results, ...ordersSellerC2.data.results]
        const newVentaid = createVentaId(allOrders)
        let allOrdersFixed = fixVentaId(newVentaid)

        // --- CAMBIO 1: USAR FILTER EN LUGAR DE FIND ---
        // Esto garantiza que allOrdersFixed siga siendo una LISTA (Array)
        // allOrdersFixed=allOrdersFixed.find(orden=>orden.ventaid===2000009477248609)

        if (alfombra) {
            // Seguridad: verificar que sea array antes de filtrar
            allOrdersFixed = Array.isArray(allOrdersFixed) ? allOrdersFixed.filter(element => element.orderResumen?.some(resumen => ["Alfombra", "Juguete"].includes(resumen.tipo))) : [];
        }

        // --- CAMBIO 2: VALIDACIÓN DE SEGURIDAD ---
        if (!Array.isArray(allOrdersFixed)) {
            allOrdersFixed = allOrdersFixed ? [allOrdersFixed] : [];
        }
        await Promise.all(
            allOrdersFixed.map(async (orden) => {
                try {
                    ordenVentaid = orden.ventaid || "ID no detectado";

                    orden.shippingId = orden.shipping?.id || null;
                    const user = orden.seller?.nickname;
                    const token = getToken(user);

                    if (orden.status !== 'cancelled') {
                        if (orden.shipping?.id) {
                            try {
                                const shipping = await getShipping(orden.shipping.id, token);                                
                                orden.shipping_info = shipping.data;                                
                                const lat = shipping.data?.receiver_address?.latitude;
                                const lon = shipping.data?.receiver_address?.longitude;
                                orden.maps = lat && lon ? `https://www.google.com/maps?q=${lat},${lon}` : "Sin mapa";
                                orden.coordenadas = lat && lon ? `${lat},${lon}` : "Sin coordenadas";
                            } catch (e) {
                                orden.shipping_info = { status: "error_api" };
                            }
                        }

                        let precioTotal = 0, precioNeto = 0, boniFlex = 0, costoFlex = 0, fechaLiqui = null;

                        if (orden.paymentsOriginales && Array.isArray(orden.paymentsOriginales)) {
                            const paymentPromises = orden.paymentsOriginales.map(id =>
                                getPayment(id, token).catch(err => null)
                            );
                            const paymentsResults = await Promise.all(paymentPromises);

                            for (const payment of paymentsResults) {
                                if (!payment) continue;
                                precioTotal += (payment.transaction_amount || 0);
                                precioNeto += (payment.transaction_details?.net_received_amount || 0);
                                fechaLiqui = payment.money_release_date || fechaLiqui;
                            }

                            if (orden.shipping_info?.logistic_type === 'self_service' && orden.shippingId) {
                                try {
                                    const shippmentCost = await getShippingCost(orden.shippingId, token);
                                    const receiverDiscount = shippmentCost?.receiver?.discounts?.[0]?.promoted_amount ?? 0;
                                    const senderDiscount = shippmentCost?.senders?.[0]?.discounts?.[0]?.promoted_amount ?? 0;
                                    const receiverCost = shippmentCost?.receiver?.cost ?? 0;
                                    costoFlex = Math.ceil(receiverCost + receiverDiscount) * (-1);
                                    boniFlex = senderDiscount || receiverDiscount;
                                } catch (e) {}
                            }
                        }

                        const totaLiqui = Number(precioNeto) + Number(boniFlex);
                        const format = (val) => val.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                        orden.pagos = {
                            totalPubli: format(precioTotal),
                            totalNeto: format(precioNeto),
                            bonificacion: format(boniFlex),
                            totalLiquidacion: format(totaLiqui),
                            flex: format(costoFlex),
                            fechaLiquidacion: fechaLiqui
                        };
                    } else {
                        orden.shipping_info = { status: "cancelled" };
                        orden.pagos = { totalPubli: "0,00", totalNeto: "0,00", bonificacion: "0,00", totalLiquidacion: "0,00", flex: "0,00", fechaLiquidacion: null };
                    }
                } catch (innerError) {
                    console.error(`Error interno venta #${ordenVentaid}:`, innerError.message);
                }
                return orden;
            })
        );

        const isRender = process.env.RENDER === 'true';

        if (!isRender && allOrdersFixed.length > 0) {
            const desktopPath = path.join(os.homedir(), 'Desktop', 'etiquetas');
            const filePathJson = path.join(desktopPath, 'ventas.txt')
            const allOrdersForTxt = allOrdersFixed.filter(item => item.status === 'paid').sort((a, b) => new Date(a.date_created) - new Date(b.date_created));
            
            // Seguridad añadida en el mapeo del TXT para evitar "cannot read property 0 of undefined"
            const ventasTxt = allOrdersForTxt.map(order => {
                const tipo = order.orderResumen?.[0]?.tipo || "N/A";
                const reason = order.payments?.[0]?.reason || "N/A";
                const mla = order.orderItemNuevo?.[0]?.item?.id || "N/A";
                const payId = order.payments?.[0]?.id || "N/A";
                
                return `${tipo}\t${reason}\t${mla}\t${order.seller?.nickname}\t#${order.ventaid}\t${new Date(order.date_created).toLocaleDateString()}\t${order.orderResumen?.find(item => item.abreviado === "CE")?.cantidad || ""}\t${order.orderResumen?.find(item => item.abreviado === "OS")?.cantidad || ""}\t${order.orderResumen?.find(item => item.abreviado === "CL")?.cantidad || ""}\t${order.orderResumen?.find(item => item.abreviado === "BG")?.cantidad || ""}\t${order.orderResumen?.find(item => item.abreviado === "NG")?.cantidad || ""}\t${order.orderResumen?.find(item => item.abreviado === "BL")?.cantidad || ""}\t${order.orderResumen?.find(item => item.abreviado === "PJ")?.cantidad || ""}\t${order.pagos?.totalPubli}\t${order.pagos?.totalLiquidacion}\t${order.shipping_info?.logistic_type === "self_service" ? order.shipping_info?.receiver_address?.state?.name === "Capital Federal" ? "-7.371,00" : order.pagos?.flex : ""}\t${["handling", "pending"].includes(order.shipping_info?.status) || ["ready_to_print"].includes(order.shipping_info?.substatus) ? "N" : "S"}\t${order.seller?.nickname === "HUELLITAS3F" ? "C2" : ""}\t""\t${order.shipping_info?.logistic_type === "self_service" ? order.shipping_info?.receiver_address?.state?.name === "Capital Federal" ? "caba" : order.shipping_info?.receiver_address?.city?.name : ""}\t\t\t${order.pagos?.fechaLiquidacion}\t#${order.shippingId}\t#${payId}\t${order.pagos?.totalNeto}\t${order.pagos?.bonificacion}`;
            }).join('\n');

            const encabezado = `tipo\ttitle\tmla\tseller\tventaid\tfechaventa\tcepillo\tgris oscuro\tgris claro\tbeige\tnegro\tblanco\tpajaro\tprecio\tliquidar\tflex\tarmado\tcuenta\tlimpio\tsector\tfecha_Envio\tComentario\tfechaLiquidacion\tenvioid\tpaymentid\tp\tflex2\n`
            try {
                fs.writeFileSync(filePathJson, encabezado + ventasTxt, 'utf-8')
            } catch (error) {
                console.log("no hay archivo ventas.txt")
            }
        }
        console.log(allOrdersFixed)
        const ordersCancelled = allOrdersFixed.filter(orders => orders.shippingId != null && orders.shipping_info?.status === "cancelled","not_delivered")
        const ordersToPrint = allOrdersFixed.filter(orders => orders.shippingId != null && orders.shipping_info?.substatus === "ready_to_print").sort((b, a) => new Date(a.date_created) - new Date(b.date_created));
        const ordersPrinted = allOrdersFixed.filter(orders => orders.shippingId != null && orders.shipping_info?.substatus === "printed")
        const ordersInComming = allOrdersFixed.filter(orders => orders.shippingId != null && ["shipped"].includes(orders.shipping_info?.status))
        const ordersPending = allOrdersFixed.filter(orders => orders.shippingId != null && ["pending"].includes(orders.shipping_info?.status))
        const ordersDelivered = allOrdersFixed.filter(orders => orders.shippingId != null && orders.shipping_info?.status == "delivered").sort((b, a) => new Date(a.date_created) - new Date(b.date_created));
        
        return [...ordersToPrint, ...ordersPrinted, ...ordersPending, ...ordersInComming, ...ordersDelivered, ...ordersCancelled]

    } catch (error) {
        console.error(`ERROR CRÍTICO en getOrders (Venta #${ordenVentaid}):`, error.message);
        // --- CAMBIO 3: DEVOLVER ARRAY VACÍO ---
        return []; 
    }
}

const getPacksToSend = async (data) => {
    try {
        const allVentas = data.filter(ventas => ventas.shippingId != null && (ventas.shipping_info.substatus === "ready_to_print" || ventas.shipping_info.substatus === "printed"))

        return allVentas

    } catch (error) {
        console.error(`Error 404 en getPacksToSend:`, error.message);
        return {};
    }
}

const getCountEtiquetas = async (data) => {
    try {
        const packs = await getPacksToSend(data)

        const countVentas = { correo: 0, flex: 0, toPrintCorreo: 0, toPrintFlex: 0 }

        packs.forEach(venta => {
            if (venta.shipping_info.logistic_type === "self_service") {
                countVentas.flex++
                if (venta.shipping_info.substatus === "ready_to_print") {
                    countVentas.toPrintFlex++
                }
            } else if ((venta.shipping_info.logistic_type === "drop_off") || (venta.shipping_info.logistic_type === "xd_drop_off")) {
                countVentas.correo++
                if (venta.shipping_info.substatus === "ready_to_print") {
                    countVentas.toPrintCorreo++
                }
            }

        })
        return countVentas
    } catch (error) {
        console.error(`Error 404 en getCountEtiquetas:`, error.message);
        return {};
    }
}


const getCountOrders = async (data) => {
    try {
        const packsToCount = await getPacksToSend(data)

        const dataVariantes = packsToCount.map((order) => (
            {
                resumen: order.orderResumen,
                envio: order.shipping_info.logistic_type
            }
        ))
        const resumen = { flex: {}, correo: {}, otros: {} }
        dataVariantes.forEach((item) => {
            item.resumen.forEach((element) => {

                const variante = element.variante
                const cantidad = element.cantidad
                if (item.envio === 'self_service') {

                    if (!resumen.flex[variante]) {
                        resumen.flex[variante] = cantidad;
                    } else {
                        resumen.flex[variante] += cantidad;
                    }
                } else if (['xd_drop_off', 'drop_off'].includes(item.envio)) {
                    if (!resumen.correo[variante]) {
                        resumen.correo[variante] = cantidad;
                    } else {
                        resumen.correo[variante] += cantidad;
                    }
                } else {
                    if (!resumen.otros[variante]) {
                        resumen.otros[variante] = cantidad;
                    } else {
                        resumen.otros[variante] += cantidad;
                    }
                }

            })


        }
        )
        return (resumen)
    } catch (error) {
        console.error(`Error 404 en getCountOrders:`, error.message);
        return {};
    }
}



const getOrdersUser = async (nickname) => {
    try {
        const user = getSeller(nickname)
        const token = getToken(nickname)
        console.log(user)
        console.log(token)
        const orders = await axios.get(ordersRoute(user), { headers: token })
        console.log(orders)
    } catch (error) {
        console.error(`Error 404 en getOrdersUser:`, error.message);
        return {};
    }
}

const getShipping = async (id, token) => {
    try {
        const shipp = await axios.get(shippingRoute(id), { headers: token })
        const dataLabel = await axios.get(`${shippingRoute(id)}/sla`, { headers: token })
        shipp.data.statusLabel = dataLabel.data.status
        shipp.data.lastTimeToSend = dataLabel.data.expected_date
        return shipp
    } catch (error) {
        console.error(`Error 404 en getShipping ${id} (Venta #${ventaid}):`, error.message);
        return {};
    }
}


const getOrdersFlex = async () => {
    try {
        const allOrders = await getOrders()
        const ordersFlex = allOrders.filter(orders => orders.shipping_info.logistic_type === "self_service")
        return ordersFlex
    } catch (error) {
        console.error(`Error 404 en getOrdersFlex:`, error.message);
        return {};
    }
}

const getEtiqueta = async (nickname, shipping, variantes) => {
    try {
        const url = `https://api.mercadolibre.com/shipment_labels?shipment_ids=${shipping}&savePdf=Y`
        const token = getToken(nickname)
        const etiqueta = await axios.get(url, { headers: token, responseType: 'arraybuffer' })

        console.log(variantes)

        const pdfDoc = await PDFDocument.load(etiqueta.data);
        const pages = pdfDoc.getPages();

        const text = variantes;

        // Agrega "2025" al final de cada página (o poné solo `pages.slice(-1)` para solo la última)
        for (const page of pages) {
            const { width, height } = page.getSize();

            // Dibujar un rectángulo blanco con borde negro y luego el texto encima
            const boxWidth = 180;
            const boxHeight = 20;

            const x = 20;
            const y = 5;

            page.drawRectangle({
                x,
                y,
                width: boxWidth,
                height: boxHeight,
                color: rgb(1, 1, 1),
                borderColor: rgb(0, 0, 0),
                borderWidth: 0.5,
            });

            page.drawText(text, {
                x: x + 10,
                y: y + 6,
                size: 12,
                color: rgb(0, 0, 0),
            });
        }

        const pdfBytes = await pdfDoc.save();


        return { success: true, pdfBytes };


    } catch (error) {
        console.error('Error al obtener o guardar la etiqueta:', error);
        return { success: false, error: error.message };
    }
}




export { getOrders, getShipping, getStockMeli, getOrdersUser, getEtiqueta, getOrdersFlex, getCountOrders, getCountEtiquetas };