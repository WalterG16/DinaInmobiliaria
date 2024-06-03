import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import Usuario from "../models/Usuario.js";
import { generarID, generarJWT } from '../helpers/tokens.js';
import { emailRegistro, emailRecuperacion } from '../helpers/emails.js';



const formularioLogin = (req, res) =>{
    res.render('auth/login.pug',{
        pagina: 'Iniciar Sesion',
        csrfToken: req.csrfToken(),
    })
}

const autenticar = async (req, res) =>{
    //VALIDACION
    await check('email').isEmail().withMessage('No es un Email Valido').run(req);
    await check('password').isLength({min: 6}).withMessage('El Password Debe ser Minimo 6 Caracteres').run(req);

    let resultado = validationResult(req);

    if(!resultado.isEmpty())
    {
        return res.render('auth/login.pug',{
            pagina: "iniciar Sesion",
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
        })
    }

    //COMPROBAR SI EL USUARIO EXISTE
    const {email, password} = req.body
    const usuario = await Usuario.findOne({ where: {email} })

    if(!usuario)
    {
        return res.render('auth/login.pug',{
            pagina: "Iniciar Sesion",
            errores: [{ msg: 'El usuario no existe' }],
            csrfToken: req.csrfToken(),
        })
    }

    //COMPROBAR SI EL USUARIO ESTA CONFIRMADO
    if(!usuario.confirmado)
    {
        return res.render('auth/login.pug',{
            pagina: "Iniciar Sesion",
            errores: [{ msg: 'El usuario no esta confirmado' }],
            csrfToken: req.csrfToken(),
        })
    }
    
    //COMPROBAR SI LA CONTRASEÑA ES CORRECTA
    if(!usuario.verificarPassword(password))
    {
        return res.render('auth/login.pug',{
            pagina: "Iniciar Sesion",
            errores: [{ msg: 'La Contraseña es Incorrecta' }],
            csrfToken: req.csrfToken(),
        })
    }

    //AUTENTICAR USUARIO
    const token = generarJWT(usuario.id)
    
    console.log(token)

    //ALMACENAR EL JWT EN UN COOKIE
    return res.cookie('_token', token,{
        httpOnly: true,
        //secure: true,
    }).redirect('/mis-propiedades')



}

const cerrarSesion = (req, res) => {
    
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}

const formularioRegistro = (req, res) =>{
    res.render('auth/registro.pug',{
        pagina: "Crear Cuenta",
        csrfToken: req.csrfToken(),
    })
}

const registrar = async (req, res) =>{
    //VALIDACION
    await check('nombre').notEmpty().withMessage('El Nombre no Puede Estar Vacio').run(req);
    await check('email').isEmail().withMessage('No es un Email Valido').run(req);
    await check('password').isLength({min: 6}).withMessage('El Password Debe ser Minimo 6 Caracteres').run(req);
    await check('repetir_password').equals(req.body.password).withMessage('Los Password no son Iguales').run(req);

    let resultado = validationResult(req);

    //Verificar que los campos no esten vacios
    if(!resultado.isEmpty())
    {
        return res.render('auth/registro.pug',{
            pagina: "Crear Cuenta",
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }
    
    // Verificacion de Usuario Existente
    const existeUsuario = await Usuario.findOne({ where: {email: req.body.email} })

    if(existeUsuario)
    {
        return res.render('auth/registro.pug',{
            pagina: "Crear Cuenta",
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Email ya se Encuentra Registrado'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    //Guardar un Usuario
    const usuario = await Usuario.create({
        nombre: req.body.nombre,
        email: req.body.email,
        password: req.body.password,
        token: generarID(),
    })

    //Enviar Email De Confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token,
    })

    //Mostrar mensaje de confirmacion
    res.render('templates/mensaje.pug',{
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos Enviado un Correo de Confirmacion a tu Email'
    })

}

//Comprobacion de Cuenta
const confirmar = async (req, res) =>{
    const { token } = req.params;

    //Verificar si el TOKEN es Valido
    const usuario = await Usuario.findOne({ where:{token} }); 
    
    if(!usuario)
    {
        return res.render('auth/confirmar-cuenta.pug',{
            pagina: 'Error al Confirmar tu Cuenta',
            mensaje: 'Huvo un ERROR al Confirmar tu Cuenta, Vuelve a Intentarlo',
            error: true
        });
    }
    
    //Confirmar cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    return res.render('auth/confirmar-cuenta.pug',{
        pagina: 'Cuenta Confirmada',
        mensaje: 'La Cuenta se Confirmo Correctamente',
    });
    
}

const formularioRecuperacion = (req, res) =>{
    res.render('auth/recuperacion.pug',{
        pagina: "Recupera Tu Cuenta",
        csrfToken: req.csrfToken(),
    })
}

const resetPassword = async (req, res) =>{
    //VALIDACION
    await check('email').isEmail().withMessage('No es un Email Valido').run(req);

    let resultado = validationResult(req);

    //return res.json(resultado.array())

    //Verificar que los campos no esten vacios
    if(!resultado.isEmpty())
    {
        return res.render('auth/recuperacion.pug',{
            pagina: "Recupera Tu Cuenta",
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    //BUSCAR UN USUARIO
    const { email } = req.body

    const usuario = await Usuario.findOne({ where: {email} })
    if(!usuario)
    {
        return res.render('auth/recuperacion.pug',{
            pagina: "Recupera Tu Cuenta",
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El Email no se Encuentra Registrado' }]
        })
    }

    //GENERA UN NUEVO TOKEN 
    usuario.token = generarID();
    await usuario.save();

    //ENVIAR EMAIL DE RECUPERACION
    emailRecuperacion({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token,
    });

    //RENDERIZAR MENSAJE
    res.render('templates/mensaje.pug',{
        pagina: 'Sigue los pasos para restablecer tu contraseña',
        mensaje: 'Hemos Enviado un Correo de Recuperacion a tu Email'
    })


}

const comprobarToken = async (req, res) =>{
    const { token } = req.params;

    const usuario = await Usuario.findOne({ where: {token} })

    if(!usuario)
    {
        return res.render('auth/confirmar-cuenta.pug',{
            pagina: 'Restablece tu Contraseña',
            mensaje: 'Huvo un ERROR al validar tu informacion, intetalo de nuevo',
            error: true
        });
    }

    //MOSTRAR FORMULARION PARA CAMBIAR EL PASSWORD
    res.render('auth/resetPassword.pug', {
        pagina: 'Restablece tu Contraseñaz',
        csrfToken: req.csrfToken(),
    })
}


const nuevoPassword = async (req, res) =>{

    await check('password').isLength({min: 6}).withMessage('El Password Debe ser Minimo 6 Caracteres').run(req);

    let resultado = validationResult(req);

    //Verificar que los campos no esten vacios
    if(!resultado.isEmpty())
    {
        return res.render('auth/resetPassword.pug',{
            pagina: "Restablece tu Contraseña",
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
        })
    }

    const { token } = req.params;
    const { password } = req.body;

    //IDENTIFICAR QUIEN REQUIERE EL CAMBIO 
    const usuario = await Usuario.findOne({ where: {token} })

    //HUSHEAR EL PASSWORD
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt);

    //ELIMINAR EL NUEVO TOKEN
    usuario.token = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta.pug',{
        pagina: 'Password Restablecido',
        mensaje: 'Tu Contraseña se a Restablecido Exitosamente',
    })
}


export{
    formularioLogin,
    autenticar,
    formularioRegistro,
    formularioRecuperacion,
    registrar,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    cerrarSesion

}