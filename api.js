import axios, { all } from 'axios'
import path from 'path';
import fs from 'fs'
import os from 'os';
import { refreshToken } from './config.js'
import { PDFDocument, rgb } from 'pdf-lib';



const isRender = process.env.RENDER === 'true'; // Render define esta variable
const desktopPath = isRender
  ? path.join(process.cwd(), 'etiquetas')
  : path.join(os.homedir(), 'Desktop', 'etiquetas');



const seller1 = 1005868067
const seller2 = 2385461382

const token = await refreshToken()

const access_token1 = token[0]
const access_token2 = token[1]


const cantidadStockPublicado = (mla) => {
    return `https://api.mercadolibre.com/items/${mla}`
}

const url = (seller) => {
    return `https://api.mercadolibre.com/orders/search?seller=${seller}&sort=date_desc&limit=50`
    //return `https://api.mercadolibre.com/orders/search?seller=${seller}&sort=date_desc&limit=50&order.date_created.from=2025-05-20T00:00:00Z&order.date_created.to=2025-06-08T00:00:00Z`
}

const shippingRoute = (shipment_id) => {
    return `https://api.mercadolibre.com/shipments/${shipment_id}`
}

const paymentRoute = (payment_id) => {
    return `https://api.mercadopago.com/v1/payments/${payment_id}`
}

const costShippingRoute = (shipping_id) => {
    return `https://api.mercadolibre.com/shipments/${shipping_id}/costs`
}

const headers1 = {
    Authorization: `Bearer ${access_token1}`
}

const headers2 = {
    Authorization: `Bearer ${access_token2}`
}

const checkFolderDownload = () => {
    if (!fs.existsSync(desktopPath)) {
        fs.mkdirSync(desktopPath, { recursive: true });
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
            var value;
            var type;
            const valueName = element.order_items?.[0]?.item?.variation_attributes?.[0]?.value_name;
            if (valueName === "Beige" || element.order_items?.[0]?.item?.id === "MLA2097220908" || element.order_items?.[0]?.item?.id === "MLA2152579766") {
                value = 'Beige'
                type = 'Alfombra'
            } else if (valueName === "Gris oscuro" || element.order_items?.[0]?.item?.id === "MLA2097220910" || element.order_items?.[0]?.item?.id === "MLA2152488642") {
                value = 'Gris oscuro'
                type = 'Alfombra'
            } else if (valueName === "Gris Claro" || element.order_items?.[0]?.item?.id === "MLA2097220912" || element.order_items?.[0]?.item?.id === "MLA2152475848") {
                value = 'Gris Claro'
                type = 'Alfombra'
            } else if (valueName === "Negro" || element.order_items?.[0]?.item?.id === "MLA2104745370" || element.order_items?.[0]?.item?.id === "MLA1508055601") {
                value = 'Negro'
                type = 'Alfombra'
            } else if (valueName === "Blanco" || element.order_items?.[0]?.item?.id === "MLA1507750191" || element.order_items?.[0]?.item?.id === "MLA2153666050") {
                value = 'Blanco'
                type = 'Alfombra'
            } else if (element.order_items?.[0]?.item?.id === "MLA1500334145") {
                type = 'Pajaro'
                value = null
            }

            var cantReal
            if (["MLA2152475848", "MLA2152488642", "MLA2152579766", "MLA2153666050", "MLA1508055601"].includes(element.order_items?.[0]?.item?.id)) {
                cantReal = 2 * element.order_items[0].quantity
            } else {
                cantReal = element.order_items[0].quantity
            }

            element.orderItemNuevo.push(element.order_items[0])
            element.orderResumen.push({
                product: type,
                color: value,
                cantidad: cantReal
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
                    if (valueName === "Beige" || element.order_items?.[0]?.item?.id === "MLA2097220908" || element.order_items?.[0]?.item?.id === "MLA2152579766") {
                        value = 'Beige'
                        type = 'Alfombra'
                    } else if (valueName === "Gris oscuro" || element.order_items?.[0]?.item?.id === "MLA2097220910" || element.order_items?.[0]?.item?.id === "MLA2152488642") {
                        value = 'Gris oscuro'
                        type = 'Alfombra'
                    } else if (valueName === "Gris Claro" || element.order_items?.[0]?.item?.id === "MLA2097220912" || element.order_items?.[0]?.item?.id === "MLA2152475848") {
                        value = 'Gris Claro'
                        type = 'Alfombra'
                    } else if (valueName === "Negro" || element.order_items?.[0]?.item?.id === "MLA2104745370" || element.order_items?.[0]?.item?.id === "MLA1508055601") {
                        value = 'Negro'
                        type = 'Alfombra'
                    } else if (valueName === "Blanco" || element.order_items?.[0]?.item?.id === "MLA1507750191" || element.order_items?.[0]?.item?.id === "MLA2153666050") {
                        value = 'Blanco'
                        type = 'Alfombra'
                    } else if (element.order_items?.[0]?.item?.id === "MLA1500334145") {
                        type = 'Pajaro'
                        value = null
                    }

                    var cantReal
                    if (["MLA2152475848", "MLA2152488642", "MLA2152579766", "MLA2153666050", "MLA1508055601"].includes(element.order_items?.[0]?.item?.id)) {
                        cantReal = 2 * element.order_items[0].quantity
                    } else {
                        cantReal = element.order_items[0].quantity
                    }
                    ventas.orderResumen.push({
                        product: type,
                        color: value,
                        cantidad: cantReal
                    })

                }
            })
        }
    })
    //console.log(allVentas)
    return allVentas
}

const getToken = (nickname) => {
    if (nickname === 'F3FG') {
        return headers1
    } else if (nickname === 'HUELLITAS3F') {
        return headers2
    }
}

const getSeller = (nickname) => {
    if (nickname === 'F3FG') {
        return 1005868067
    } else if (nickname === 'HUELLITAS3F') {
        return 2385461382
    }
}


const getPayment = async (payment_id, token) => {
    try {
        const paymentData = await axios.get(paymentRoute(payment_id), { headers: token })
        return paymentData.data
    } catch (error) {
        console.log(error.message)
    }
}

const getShippingCost = async (payment_id, token) => {
    try {
        const shippment = await axios.get(costShippingRoute(payment_id), { headers: token })
        return shippment.data
    } catch (error) {
        console.log(error.message)
    }
}

const getStockMeli = async () => {
    try {
        const stock = await axios.get(cantidadStockPublicado("MLA2006797664"), { headers: headers1 })
        console.log(stock.data.available_quantity)
    } catch (error) {
        console.error("error")
    }
}

const getOrders = async () => {
    try {
        await getStockMeli()
        const ordersSeller1 = await axios.get(url(seller1), { headers: headers1 })
        const ordersSeller2 = await axios.get(url(seller2), { headers: headers2 })
        const allOrders = [...ordersSeller1.data.results, ...ordersSeller2.data.results]
        const ventaid = createVentaId(allOrders)
        const allOrdersFixed = fixVentaId(ventaid)
        // const allOrdersFixed = fixVentaId(ventaid).filter(venta => venta.ventaid===2000012002761540)
        await Promise.all(
            allOrdersFixed.map(async (orden) => {
                orden.shippingId = orden.shipping.id
                //console.log(orden.ventaid)
                var user = orden.seller.nickname
                var token = getToken(user)
                if (orden.status != 'cancelled') {

                    if ((orden.shipping?.id != null)) {
                        var shippingId = orden.shipping.id
                        const shipping = await getShipping(shippingId, token)
                        orden.shipping_info = shipping.data
                        orden.maps = `https://www.google.com/maps?q=${shipping.data.receiver_address.latitude},${shipping.data.receiver_address.longitude}`
                        orden.coordenadas = `${shipping.data.receiver_address.latitude},${shipping.data.receiver_address.longitude}`
                    }
                    var precioTotal = 0;
                    var precioNeto = 0;
                    var boniFlex = 0;
                    var costoFlex = 0
                    if (orden.paymentsOriginales) {

                        const paymentPromises = orden.paymentsOriginales.map(id => getPayment(id, token));
                        const paymentsResults = await Promise.all(paymentPromises);



                        for (const payment of paymentsResults) {
                            precioTotal += payment.transaction_amount;
                            precioNeto += payment.transaction_details.net_received_amount;
                            var fechaLiqui = payment.money_release_date
                        }

                        if (orden.shipping_info?.logistic_type === 'self_service') {
                            const shippmentCost = await getShippingCost(shippingId, token)
                            const receiverDiscount = shippmentCost?.receiver?.discounts?.[0]?.promoted_amount ?? 0;
                            const senderDiscount = shippmentCost?.senders?.[0]?.discounts?.[0]?.promoted_amount ?? 0;
                            const receiverCost = shippmentCost?.receiver?.cost ?? 0;

                            costoFlex = Math.ceil(receiverCost + receiverDiscount) * (-1);
                            boniFlex = senderDiscount || receiverDiscount;
                        }

                    }
                    var totaLiqui = Number(precioNeto) + Number(boniFlex);
                    orden.pagos = {
                        totalPubli: precioTotal.toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }),
                        totalNeto: precioNeto.toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }),
                        bonificacion: boniFlex.toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }),
                        totalLiquidacion: totaLiqui.toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }),

                        flex: costoFlex.toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }),
                        fechaLiquidacion: fechaLiqui
                    }
                } else {
                    orden.shipping_info = { status: "cancelled" };
                    orden.coordenadas = "Error en envío";
                    orden.pagos = {
                        totalPubli: 0,
                        totalNeto: 0,
                        bonificacion: 0,
                        totalLiquidacion: 0,
                        flex: 0,
                        fechaLiquidacion: null
                    }
                }
                return orden;
            })
        );
        // const findByMPID = allOrdersFixed.filter(item => item.payments[0].id === 115626115802)
        // const findByMPID = allOrdersFixed.filter(item => item.ventaid === 2000012002761540)

        // console.dir(findByMPID, { depth: null })
        const filePathJson = path.join(desktopPath, 'ventas.txt')
        const allOrdersForTxt = allOrdersFixed.filter(item => item.status === 'paid').sort((a, b) => new Date(a.date_created) - new Date(b.date_created));
        const ventasTxt = allOrdersForTxt.map(order => `${order.payments[0].reason}\t${order.orderItemNuevo[0].item.id}\t${order.seller.nickname}\t#${order.ventaid}\t${new Date(order.date_created).toLocaleDateString()}\t\t${order.orderResumen.find(item => item.color === "Gris oscuro")?.cantidad || ""}\t${order.orderResumen.find(item => item.color === "Gris Claro")?.cantidad || ""}\t${order.orderResumen.find(item => item.color === "Beige")?.cantidad || ""}\t${order.orderResumen.find(item => item.color === "Negro")?.cantidad || ""}\t${order.orderResumen.find(item => item.color === "Blanco")?.cantidad || ""}\t${order.orderItemNuevo[0].item.id === 'MLA1500334145' ? (order.orderResumen[0]?.cantidad || "") : ""}\t${order.pagos.totalPubli}\t${order.pagos.totalLiquidacion}\t${order.shipping_info?.logistic_type === "self_service" ? order.shipping_info?.receiver_address?.state?.name === "Capital Federal" ? "-7000" : order.pagos.flex : ""}\t${["ready_to_ship", "handling", "pending"].includes(order.shipping_info?.status) ? "N" : "S"}\t${order.seller.nickname === "HUELLITAS3F" ? "C2" : ""}\t""\t${order.shipping_info?.logistic_type === "self_service" ? order.shipping_info?.receiver_address?.state?.name === "Capital Federal" ? "caba" : order.shipping_info?.receiver_address?.city?.name : ""}\t#${order.shippingId}\t#${order.payments[0].id}\t${order.pagos.totalNeto}\t${order.pagos.bonificacion}\t${order.pagos.fechaLiquidacion}`).join('\n');
        const encabezado = `title\tmla\tseller\tventaid\tfechaventa\tcepillo\tgris oscuro\tgris claro\tbeige\tnegro\tblanco\tpajaro\tprecio\tliquidar\tflex\tarmado\tcuenta\tlimpio\tsector\tenvioid\tpaymentid\tp\tflex2\tfechaLiquidacion\n`
        fs.writeFileSync(filePathJson, encabezado + ventasTxt, 'utf-8')

        //console.dir(allOrdersFixed,{depth:null}) //ver todas las ordenes como objetos

        const ordersCancelled = allOrdersFixed.filter(orders => orders.shippingId != null && orders.shipping_info.status === "cancelled")
        const ordersToPrint = allOrdersFixed.filter(orders => orders.shippingId != null && orders.shipping_info.substatus === "ready_to_print").sort((b, a) => new Date(a.date_created) - new Date(b.date_created));
        const ordersPrinted = allOrdersFixed.filter(orders => orders.shippingId != null && orders.shipping_info.substatus === "printed")
        const ordersInComming = allOrdersFixed.filter(orders => orders.shippingId != null && orders.shipping_info.substatus != "ready_to_print" && orders.shipping_info.substatus != "printed" && orders.shipping_info.status != "delivered" && orders.shipping_info.status != "pending" && orders.shipping_info.status != "cancelled")
        const ordersDelivered = allOrdersFixed.filter(orders => orders.shippingId != null && orders.shipping_info.status == "delivered")
        const ordersPending = allOrdersFixed.filter(orders => orders.shippingId != null && orders.shipping_info.status == "pending")
        //const ordersShippingNull = allOrdersFixed.filter(orders => orders.shippingId===null)
        const allOrdersOrdered = [...ordersToPrint, ...ordersPrinted, ...ordersPending, ...ordersInComming, ...ordersCancelled, ...ordersDelivered]

        return allOrdersOrdered
    } catch (error) {
        console.error(error.message)
    }
}

const getPacksToSend = async (data) => {
    try {
        const allVentas = data.filter(ventas => ventas.shippingId != null && (ventas.shipping_info.substatus === "ready_to_print" || ventas.shipping_info.substatus === "printed"))

        return allVentas

    } catch (error) {

    }
}

const getCountPacks = async (data) => {
    try {
        const packs = await getPacksToSend(data)

        const countVentas = { correo: 0, flex: 0 }

        packs.forEach(venta => {
            if (venta.shipping_info.logistic_type === "self_service") {
                countVentas.flex++
            } else if ((venta.shipping_info.logistic_type === "drop_off") || (venta.shipping_info.logistic_type === "xd_drop_off")) {
                countVentas.correo++
            }
        })
        return countVentas
    } catch (error) {
        console.log(error.message)
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
            item.resumen.forEach((variante) => {

                const color = variante.color
                const cantidad = variante.cantidad
                if (item.envio === 'self_service') {

                    if (!resumen.flex[color]) {
                        resumen.flex[color] = cantidad;
                    } else {
                        resumen.flex[color] += cantidad;
                    }
                } else if (['xd_drop_off', 'drop_off'].includes(item.envio)) {
                    if (!resumen.correo[color]) {
                        resumen.correo[color] = cantidad;
                    } else {
                        resumen.correo[color] += cantidad;
                    }
                } else {
                    if (!resumen.otros[color]) {
                        resumen.otros[color] = cantidad;
                    } else {
                        resumen.otros[color] += cantidad;
                    }
                }

            })


        }
        )
        return (resumen)
    } catch (error) {
        console.log('Error en :', error.message);
    }
}



const getOrdersUser = async (nickname) => {
    try {
        const user = getSeller(nickname)
        const token = getToken(nickname)
        console.log(user)
        console.log(token)
        const orders = await axios.get(url(user), { headers: token })
        console.log(orders)
    } catch (error) {
        console.error(error.message)
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
        console.error(error.message)
    }
}

const getOrdersToPrint = async () => {
    try {
        const fullOrders = await getOrders()
        const ordersToPrint = fullOrders.filter(orders => orders.shipping_info.substatus === "ready_to_print")

        return ordersToPrint
    } catch (error) {
        console.log(error.message)
    }
}

const getOrdersFlex = async () => {
    try {
        const allOrders = await getOrders()
        const ordersFlex = allOrders.filter(orders => orders.shipping_info.logistic_type === "self_service")
        return ordersFlex
    } catch (error) {
        console.log(error.message)
    }
}

const getEtiqueta = async (nickname, shipping, variantes) => {
    try {
        const url = `https://api.mercadolibre.com/shipment_labels?shipment_ids=${shipping}&savePdf=Y`
        const token = getToken(nickname)
        const etiqueta = await axios.get(url, { headers: token, responseType: 'arraybuffer' })

        checkFolderDownload()
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


        const filePath = path.join(desktopPath, `${shipping}.pdf`);
        fs.writeFileSync(filePath, pdfBytes);


        console.log(nickname, shipping, variantes)
        console.log('Etiqueta guardada como etiqueta.pdf');

        return { success: true };
    } catch (error) {
        console.error('Error al obtener o guardar la etiqueta:', error);
        return { success: false, error: error.message };
    }
}

async function combinarEtiquetas() {
    const pdfFiles = fs.readdirSync(desktopPath).filter(file => file.endsWith('.pdf'));

    if (pdfFiles.length>1) {
        const pdfDocFinal = await PDFDocument.create();

        for (const file of pdfFiles) {
            const filePath = path.join(desktopPath, file);
            const pdfBytes = fs.readFileSync(filePath);
            const pdfTemp = await PDFDocument.load(pdfBytes);
            const copiedPages = await pdfDocFinal.copyPages(pdfTemp, pdfTemp.getPageIndices());

            copiedPages.forEach((page) => {
                pdfDocFinal.addPage(page);
            });
        }

        const finalPdfBytes = await pdfDocFinal.save();
        const outputPath = path.join(desktopPath, 'etiquetas-final.pdf');
        fs.writeFileSync(outputPath, finalPdfBytes);

        for (const file of pdfFiles) {
            const filePath = path.join(desktopPath, file);
            fs.unlinkSync(filePath); // Elimina el archivo
        }

        console.log('✅ PDF combinado guardado como etiquetas-final.pdf');
    }else{
        console.log('No hay pdf en la carpeta');
    }


}


export { getOrders, getShipping, getOrdersToPrint, getOrdersUser, getEtiqueta, getOrdersFlex, getCountOrders, getCountPacks, combinarEtiquetas };