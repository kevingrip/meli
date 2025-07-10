import { getShipping,getOrdersUser,getEtiqueta, getOrders,getAllOrders } from "./api.js";
import axios from 'axios'
const seller1 = 1005868067
const seller2 = 2385461382

const urlToken = "https://api.mercadolibre.com/oauth/token"

const postSeller1 = {
    params: {
    grant_type: "refresh_token",
    client_id:1748501765105234,
    client_secret:'aM2KDb5W3X7aneI2OZn9iJbnJN44uTwF',
    refresh_token:'TG-68250d6875dcce000112da05-1005868067'
    },
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
}

const postSeller2 = {
    params: {
    grant_type: "refresh_token",
    client_id:8532318331435557,
    client_secret:'nF1HOMn2Ab8j6pIB05VygTifQvHWxUmc',
    refresh_token:'TG-68247673bf7d3b0001a9569b-2385461382'
    },
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
}

const refreshToken = async(seller1,seller2) =>{
    try {
        const response1 = await axios.post(urlToken,seller1.params,seller1.headers)
        const response2 = await axios.post(urlToken,seller2.params,seller2.headers)
        console.log(`const access_token1 = "${response1.data.access_token}"`)
        console.log(`const access_token2 = "${response2.data.access_token}"`)
    } catch (error) {
        console.error(error.message)
    }
}

const access_token1 = "APP_USR-1748501765105234-060711-e3242a7cd818eff3a847323a9830d6b8-1005868067"
const access_token2 = "APP_USR-8532318331435557-060711-0228354ad36f345128f2c7eeba8033ed-2385461382"

const headers1 = {
    Authorization: `Bearer ${access_token1}`
}

const headers2 = {
    Authorization: `Bearer ${access_token2}`
}

const shipp = async(id) =>{
    try {
        const shipping = await getShipping(id,headers2)
        console.dir(shipping.data,{depth:null})
    } catch (error) {
        
    }
}

const ord = async() =>{
    try {
        await getOrdersUser('F3FG')
    } catch (error) {
        throw error
    }
}

const etiqueta = async() =>{
    try {
        await getEtiqueta('HUELLITAS3F',44876732153,'CL x1')
    } catch (error) {
        throw error
    }
}


const url = (seller) =>{
    return `https://api.mercadolibre.com/orders/search?seller=${seller}&sort=date_desc&limit=50&order.date_created.from=2025-05-13T00:00:00Z`
}
const getOrders2 = async() =>{
    try {
        const ordersSeller = await axios.get(url(seller1),{headers:headers1})
        const ordersSeller1 = ordersSeller.data.results

        for (const order of ordersSeller.data.results){
            if (order.shipping.id==null){
                console.log(order)
            }
            
        }

        return ordersSeller1
    } catch (error) {
        console.error(error.message)
    }
}


// refreshToken(postSeller1,postSeller2)
shipp(44978991598)

//getOrders2()

// const orders = await getOrders()
// const filterOrder = orders.filter(orden=>orden.ventaid ===2000007970722159)
// console.dir(filterOrder,{depth:null})

// const orders = await getOrders()
// const filterOrder = orders.filter(orden=>orden.ventaid ===2000008032516769)
// console.dir(filterOrder,{depth:null})