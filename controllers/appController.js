import { Sequelize } from "sequelize"
import {Categoria, Precio, Propiedad} from "../models/index.js"
import { EstaLogueado } from "../helpers/index.js"


const inicio = async(req, res) =>{

    res.render('inicio.pug',{
        pagina: 'inicio',
        csrfToken: req.csrfToken(),
        EstaLogueado: EstaLogueado(req.cookies._token)
    })
}


const categoria = async(req, res) =>{

    const { id } = req.params
    let publico = false

    //EXISTE CATEGORIA
    const categoria = await Categoria.findByPk(id)
    if(!categoria)
    {
        return res.redirect('/404')
    }

    //OBTENER PROPIEDADES
    const propiedades = await Propiedad.findAll({
        where:{
            categoriaId:id
        },
        include:[
            { model: Precio, as: 'precio' }
        ]
    })

    propiedades.forEach(function(propiedad) {
        if(propiedad.publicado)
        {
            publico = true
        }
    });

    res.render('categoria.pug', {
        pagina: 'Categoria',
        propiedades,
        csrfToken: req.csrfToken(),
        publico,
        EstaLogueado: EstaLogueado(req.cookies._token)
    })

}

const buscador = async(req, res) =>{
    const { termino } = req.body
    let publico = false

    //VALIDACION
    if(!termino.trim())
    {
        return res.redirect('back')
    }

    
    //CONSULTA
    const propiedades = await Propiedad.findAll({
        where: {
            [Sequelize.Op.or] : [
                {barrio: {
                    [Sequelize.Op.like] : '%' + termino + '%'
                }},
                {calle: {
                    [Sequelize.Op.like] : '%' + termino + '%'
                }},
                {titulo: {
                    [Sequelize.Op.like] : '%' + termino + '%'
                }},
            ]      
        },
        include: [
            { model: Precio, as: 'precio' }
        ]
    })
    
    propiedades.forEach(function(propiedad) {
        if(propiedad.publicado)
        {
            publico = true
        }
    });

    res.render('buscar.pug', {
        propiedades,
        publico,
        EstaLogueado: EstaLogueado(req.cookies._token)
    })

}   



const PaginaNoEncontrada = (req, res) =>{
    res.render('404.pug',{
        pagina: 'Pagina No Encontrada',
        csrfToken: req.csrfToken(),
        EstaLogueado: EstaLogueado(req.cookies._token)
    })
}




export{
    inicio,
    categoria,
    buscador,
    PaginaNoEncontrada,

}

