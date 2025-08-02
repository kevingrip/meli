export const cantidadStockPublicado = (mla) => {
    return `https://api.mercadolibre.com/items/${mla}`
}

export const ordersRoute = (seller) => {
    return `https://api.mercadolibre.com/orders/search?seller=${seller}&sort=date_desc&limit=50`
    // return `https://api.mercadolibre.com/orders/search?seller=${seller}&sort=date_desc&limit=50&order.date_created.from=2025-07-15T00:00:00Z&order.date_created.to=2025-07-25T00:00:00Z`
}

export const shippingRoute = (shipment_id) => {
    return `https://api.mercadolibre.com/shipments/${shipment_id}`
}

export const paymentRoute = (payment_id) => {
    return `https://api.mercadopago.com/v1/payments/${payment_id}`
}

export const costShippingRoute = (shipping_id) => {
    return `https://api.mercadolibre.com/shipments/${shipping_id}/costs`
}