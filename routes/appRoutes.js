import express from 'express'
import { inicio, categoria, buscador, PaginaNoEncontrada } from '../controllers/appController.js'; 

const router = express.Router()

//PAGINA DE INICIO
router.get('/', inicio)


//CATEGORIAS
router.get('/categoria/:id', categoria )


//BUSCADOR
router.post('/buscador', buscador)


//PAGINA 404
router.get('/404', PaginaNoEncontrada)


export default router;