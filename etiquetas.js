import { PDFDocument, rgb } from 'pdf-lib';

const getEtiqueta = async(nickname,shipping,variantes) =>{
    try {
        const url = `https://api.mercadolibre.com/shipment_labels?shipment_ids=${shipping}&savePdf=Y`
        const token = getToken(nickname)
        const etiqueta = await axios.get(url,{headers:token,responseType: 'arraybuffer'})
        
        checkFolderDownload()
        console.log(variantes)

        const pdfDoc = await PDFDocument.load(etiqueta.data);
        const pages = pdfDoc.getPages();

        const text = variantes;

        // Agrega "2025" al final de cada página (o poné solo `pages.slice(-1)` para solo la última)
        for (const page of pages) {
        const { width, height } = page.getSize();

        // Dibujar un rectángulo blanco con borde negro y luego el texto encima
        const boxWidth = 50;
        const boxHeight = 25;

        const x = width / 2 - boxWidth / 2;
        const y = 5;

        page.drawRectangle({
            x,
            y,
            width: boxWidth,
            height: boxHeight,
            color: rgb(1, 1, 1),
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
        });

        page.drawText(text, {
            x: x + 10,
            y: y + 7,
            size: 12,
            color: rgb(0, 0, 0),
        });
        }

        const pdfBytes = await pdfDoc.save();


        const filePath = path.join(desktopPath, `${shipping}.pdf`);
        fs.writeFileSync(filePath, pdfBytes);
        

        console.log(nickname,shipping,variantes)
        console.log('Etiqueta guardada como etiqueta.pdf');
        
        return { success: true };
    } catch (error) {
        console.error('Error al obtener o guardar la etiqueta:', error);
        return { success: false, error: error.message };
    }
}

export default getEtiqueta