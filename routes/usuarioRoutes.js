import express from "express";
import { formularioLogin, autenticar, formularioRegistro, formularioRecuperacion, registrar, confirmar, resetPassword, comprobarToken, nuevoPassword, cerrarSesion} from "../controllers/usuarioController.js";


const router = express.Router();

//ROUTING
router.get('/login', formularioLogin);
router.post('/login', autenticar);

router.post('/cerrar-sesion', cerrarSesion)

router.get('/registro', formularioRegistro)
router.post('/registro', registrar)

router.get('/confirmar/:token', confirmar)

router.get('/recuperacion', formularioRecuperacion)
router.post('/recuperacion', resetPassword)

//ALMACENAR EL NUEVO PASSWORD
router.get('/recuperacion/:token', comprobarToken)
router.post('/recuperacion/:token', nuevoPassword)



export default router;