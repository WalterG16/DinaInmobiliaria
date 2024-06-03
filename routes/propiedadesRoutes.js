import express from "express";
import { body } from 'express-validator'
import { admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, mostrarPropiedad, enviarMensaje, verMensaje, estado } from '../controllers/propiedadController.js'
import protegerRuta from '../middleware/protegerRutas.js'
import upload from "../middleware/subirImagen.js";
import identificarUsuario from "../middleware/identificarUsuario.js"


const router = express.Router()

router.get('/mis-propiedades', protegerRuta, admin)

router.get('/propiedades/crear', protegerRuta, crear)
router.post('/propiedades/crear', protegerRuta,
        body('titulo')
                .notEmpty().withMessage('El Titulo Es Obligatorio')
                .isLength({ max: 50 }).withMessage('El Titulo es Demasiado Largo'),
        body('descripcion')
                .notEmpty().withMessage('La Descripcion no Puede Estar Vacia')
                .withMessage('La Descripcion no Puede Estar Vacia'),
        body('barrio').notEmpty().withMessage('La direccion del barrio no Puede Estar vacia'),
        body('calle').notEmpty().withMessage('La direccion de la calle no Puede Estar vacia'),
        body('categoria').notEmpty().withMessage('Seleccione una Categoria'),
        body('precio').notEmpty().withMessage('Seleccione un Rango De Precio'),
        body('habitaciones').notEmpty().withMessage('Seleccione el Numero de Habitaciones'),
        body('br').notEmpty().withMessage('Seleccione el Numero de Baños'),
        body('dimencion').notEmpty().withMessage('Seleccione la Dimencion del Terreno'),
        guardar
)


router.get('/propiedades/agregarImagen/:id',
        protegerRuta,
        agregarImagen 
)

router.post('/propiedades/agregarImagen/:id', 
        protegerRuta,
        upload.single('imagen'),
        almacenarImagen
)

router.get('/propiedades/editar/:id',
        protegerRuta,
        editar
)

router.post('/propiedades/editar/:id', protegerRuta,
        body('titulo')
                .notEmpty().withMessage('El Titulo Es Obligatorio')
                .isLength({ max: 50 }).withMessage('El Titulo es Demasiado Largo'),
        body('descripcion')
                .notEmpty().withMessage('La Descripcion no Puede Estar Vacia')
                .withMessage('La Descripcion no Puede Estar Vacia'),
        body('barrio').notEmpty().withMessage('La direccion del barrio no Puede Estar vacia'),
        body('calle').notEmpty().withMessage('La direccion de la calle no Puede Estar vacia'),
        body('categoria').notEmpty().withMessage('Seleccione una Categoria'),
        body('precio').notEmpty().withMessage('Seleccione un Rango De Precio'),
        body('habitaciones').notEmpty().withMessage('Seleccione el Numero de Habitaciones'),
        body('br').notEmpty().withMessage('Seleccione el Numero de Baños'),
        body('dimencion').notEmpty().withMessage('Seleccione la Dimencion del Terreno'),
        guardarCambios
)

router.post('/propiedades/eliminar/:id',
        protegerRuta,
        eliminar
)

//RUTA PUBLICA
router.get('/propiedad/:id',
        identificarUsuario,
        mostrarPropiedad
)

router.post('/propiedad/:id',
        identificarUsuario,
        enviarMensaje
)

router.get('/menseajes/:id',
        protegerRuta,
        verMensaje
)

router.post('/propiedades/estado/:id',
        protegerRuta,
        estado
)

export default router;