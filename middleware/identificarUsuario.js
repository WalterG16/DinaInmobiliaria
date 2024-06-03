import jwt from 'jsonwebtoken'
import { Usuario } from '../models/index.js'

const identificarUsuario = async(req, res, next) => {
    //IDENTIFICAR TOKEN
    const token = req.cookies._token

    if(!token)
    {
        req.usuario = null
        return next()
    }

    //COMPROBAR TOKEN
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id)

        //ALMACENAR EL USUARIO
        if (usuario) 
        {
            req.usuario = usuario
        }
        return next()
        
    } catch (error) {
        console.log(error)
        return res.clearCookie('_token').redirect('/auth/login')
    }


    next()
}

export default identificarUsuario