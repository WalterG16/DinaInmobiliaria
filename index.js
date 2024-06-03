import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import db from './config/db.js';


//CREAR LA APP
const app = express();

//Hablilitar lectura de datos de formulario
app.use(express.urlencoded({extended:true}))

//habilitar Cookie Parser
app.use( cookieParser() )

//HABILITAR CSFR
app.use( csrf( { cookie: true } ) )

//Coneccion a la DB
try{
    await db.authenticate();
    db.sync();
    console.log('Coneccion Realizada')
}
catch(error)
{
    console.log(error);
}

//HABILITAR PUG
app.set('veiw enfine', 'pug');
app.set('views', './views');

// CARPERTA PUBLICA 
app.use(express.static('./public'))

//RUTA
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);
app.use('/', appRoutes)
app.use('/api', apiRoutes)

//DEFINIR RUTA
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`el servidor esta corriendo en el puerto ${port}`)
});