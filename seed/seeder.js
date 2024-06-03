import categorias from "./categorias.js";
import precios from "./precios.js";
import { Categoria, Precio, Propiedad } from "../models/index.js"
import db from "../config/db.js";

const importarDatos = async () => {
    try {
        //Autenticar BD
        await db.authenticate();

        //Generar las Columnas para la BD
        await db.sync();

        //Insertar los Datos
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
        ])

        console.log("Datos Importados Correctamente")
        process.exit(0);

    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
}

const elimilarDatos = async () => {
    try {
        await db.sync({force: true})

        //await Promise.all([
       //     Categoria.destroy({ where: {}, truncate: true }),
       //     Precio.destroy({ where: {}, truncate: true }),
        //])

        console.log('Datos Eliminados Correctamente');
        process.exit();
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
}


if (process.argv[2] === "-i") {
    importarDatos();
}

if (process.argv[2] === "-e") {
    elimilarDatos();
}