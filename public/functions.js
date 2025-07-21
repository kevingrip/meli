export const createDivCountDoble = (nombre, cant1, cant2, color, radioDer, radioIzq, bordeDer) => {

    const divBloque = document.createElement('div')
    const divNombre = document.createElement('div')
    const divPadreNumero = document.createElement('div')
    const divNumero1 = document.createElement('div')
    const divNumero2 = document.createElement('div')
    divPadreNumero.style.display = 'flex'
    divNombre.textContent = nombre

    divNumero1.textContent = `${cant1 || 0}`
    divNumero2.textContent = `${cant2 || 0}`
    divBloque.appendChild(divNombre)
    divPadreNumero.appendChild(divNumero1)
    divPadreNumero.appendChild(divNumero2)
    divBloque.appendChild(divPadreNumero)
    divNombre.classList.add('divNombreResumen', radioDer, radioIzq, color, bordeDer)
    divNumero1.classList.add('divEtiquetaCantidad', 'sombraBordeDer', 'divNumeroResumen')
    divNumero2.classList.add('divEtiquetaCantidad', 'divNumeroResumen', bordeDer)
    divBloque.classList.add('divResumen')
    divPadreNumero.style.height = '100%'
    return divBloque
}

export const createDivProduct = (nombre, cant, Color, bordeIzq, BordeDer, bordeIndividual) => {
    const divProduct = document.createElement('div')
    const divNombre = document.createElement('div')
    const divNumero = document.createElement('div')
    divNombre.textContent = nombre
    divNumero.textContent = `${cant || 0}`
    divProduct.appendChild(divNombre)
    divProduct.appendChild(divNumero)
    divNombre.classList.add('divNombreResumen', "solidDown", Color, bordeIzq, BordeDer)
    divNumero.classList.add('divNumeroResumen')
    divProduct.classList.add(bordeIndividual, "displayColumn")
    return divProduct
}

export const crearDivStock = (C1, C2) => {

    const divStock = document.createElement('div')

    const divCantidadVariantes = document.createElement('div')

    divCantidadVariantes.appendChild(
        createDivCountDoble(window.matchMedia("(max-width: 768px)").matches ? "BG" : "Beige", C1.Beige, C2.Beige, "colorBeige", 'borderLeft', null, "solidDer")
    )
    divCantidadVariantes.appendChild(
        createDivCountDoble(window.matchMedia("(max-width: 768px)").matches ? "OS" : "Gris Oscuro", C1["Gris oscuro"], C2["Gris Oscuro"], "colorGrisOscuro", null, null, "solidDer")
    )
    divCantidadVariantes.appendChild(
        createDivCountDoble(window.matchMedia("(max-width: 768px)").matches ? "CL" : "Gris Claro", C1["Gris Claro"], C2["Gris Claro"], "colorGrisClaro", null, null, "solidDer")
    )
    divCantidadVariantes.appendChild(
        createDivCountDoble(window.matchMedia("(max-width: 768px)").matches ? "NG" : "Negro", C1.Negro, C2.Negro, "colorNegro", null, null, "solidDer")
    )
    divCantidadVariantes.appendChild(
        createDivCountDoble(window.matchMedia("(max-width: 768px)").matches ? "BL" : "Blanco", C1.Blanco, C2.Blanco, "colorBlanco", null, "borderRight", null)
    )
    divCantidadVariantes.style.border = 'solid black'

    divStock.appendChild(divCantidadVariantes)

    divStock.classList.add("divCounts")
    divCantidadVariantes.classList.add("divBordeProductInd", "displayRow")
    return divStock    
}


export const crearDivVentas = (div, tipo, cant1, cant2, color, cantidad) => {

    const divEtiquetaCorreo = createDivCountDoble(tipo, cant1, cant2, color, 'borderRight', 'borderLeft')
    divEtiquetaCorreo.style.border = 'solid black'
    divEtiquetaCorreo.style.borderRadius = '1vw';
    const divCantidadVariantes = document.createElement('div')

    divCantidadVariantes.appendChild(
        createDivProduct(window.matchMedia("(max-width: 768px)").matches ? "BG" : "Beige", cantidad.Beige, "colorBeige", "borderLeft")
    )
    divCantidadVariantes.appendChild(
        createDivProduct(window.matchMedia("(max-width: 768px)").matches ? "OS" : "Gris Oscuro", cantidad["Gris oscuro"], "colorGrisOscuro")
    )
    divCantidadVariantes.appendChild(
        createDivProduct(window.matchMedia("(max-width: 768px)").matches ? "CL" : "Gris Claro", cantidad["Gris Claro"], "colorGrisClaro")
    )
    divCantidadVariantes.appendChild(
        createDivProduct(window.matchMedia("(max-width: 768px)").matches ? "NG" : "Negro", cantidad.Negro, "colorNegro")
    )
    divCantidadVariantes.appendChild(
        createDivProduct(window.matchMedia("(max-width: 768px)").matches ? "BL" : "Blanco", cantidad.Blanco, "colorBlanco", "borderRight")
    )

    div.appendChild(divEtiquetaCorreo)
    div.appendChild(divCantidadVariantes)

    div.appendChild(
        createDivProduct(window.matchMedia("(max-width: 768px)").matches ? "PJ" : "Pajaro", cantidad.Pajaro, "colorPajaro", "borderLeft", "borderRight", "divBordeProductInd")
    )
    if (cantidad["Mundial Qatar"] > 0 || cantidad["Copa America"] > 0) {
        let cantFigu = (cantidad["Mundial Qatar"] || 0) + (cantidad["Copa America"] || 0)
        div.appendChild(            
            createDivProduct(window.matchMedia("(max-width: 768px)").matches ? "FG" : "Figu", cantFigu, "colorFigu", "borderLeft", "borderRight", "divBordeProductInd")
        )
    }

    div.classList.add("divCounts")
    divCantidadVariantes.classList.add("divBordeProductInd", "displayRow")
    return div

}


export const createDivs = () => {
    const divCorreo = document.createElement('div');
    const divFlex = document.createElement('div');
    return { divCorreo, divFlex };
}