import { Precio, Categoria, Propiedad, Mensaje, Usuario } from '../models/index.js'
import { validationResult, check } from 'express-validator';
import { unlink } from 'node:fs/promises'
import { EsVendedor, EstaLogueado } from '../helpers/index.js'



//MUESTRAS MIS PROPIEDADES
const admin = async (req, res) =>{

    const { _token } = req.cookies

    //LEER QUERY DE LA PAGINACION
    const { pagina: paginaActual } = req.query
    
    const expresion = /^[0-9]$/

    if(!expresion.test(paginaActual))
    {
        return res.redirect('/mis-propiedades?pagina=1')
    }

    try {
        //EXTRAER E INCLUIR TABLAS DE BASE DE DATOS RELACIONADAS
        const { id } = req.usuario

        //LIMITE offset PARA EL PAGINADOR
        const limit = 5
        const offset = ((paginaActual * limit) - limit)

        //ESTO HACE LA PAGINACION PONELE
        const [propiedades, total] = await Promise.all([
                Propiedad.findAll({
                    limit,
                    offset,
                    where:{
                        usuarioId: id
                    },
                    include: [
                        { model: Categoria, as: 'categoria' },
                        { model: Precio, as: 'precio' },
                        { model: Mensaje, as: 'mensajes' }
                    ]
                }),
                Propiedad.count({
                    where: {
                        usuarioId: id
                    }
                })
        ])
        

    res.render('propiedades/admin.pug',{
        pagina: 'Mis Propiedades',
        csrfToken: req.csrfToken(),
        propiedades,
        paginas: Math.ceil(total/limit),
        paginaActual,
        EstaLogueado: EstaLogueado(req.cookies._token)
    })
    } catch (error) {
        console.log(error)
    }

    
}

//CREAR NUEVAS PROPIEDADES
const crear = async(req, res) =>{
    //Consultar Los Precios y Categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll(),
    ])

    res.render('propiedades/crear.pug',{
        pagina: 'Crear Propiedades',
        barra: true,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: { },
        EstaLogueado: EstaLogueado(req.cookies._token)
    })
}

const guardar = async(req, res) =>{


    //VALIDACION
    let resultado = validationResult(req)
    if(!resultado.isEmpty())
    {
        //Consultar Los Precios y Categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll(),
        ])

        return res.render('propiedades/crear.pug',{
            pagina: 'Crear Propiedades',
            barra: true,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body,
            EstaLogueado: EstaLogueado(req.cookies._token)
        })
    }

    //CREAR REGISTRO

    const { titulo, descripcion, barrio, calle, categoria, precio, habitaciones, br, dimencion } = req.body;
    const { id: usuarioId } = req.usuario;

    try {
        const propiedadGuardado = await Propiedad.create({
            titulo,
            descripcion, 
            barrio,
            calle,
            categoriaId: categoria, 
            precioId: precio, 
            habitaciones, 
            br, 
            dimencion,
            usuarioId,
            imagen:''

        })

        const { id } = propiedadGuardado

        res.redirect(`/propiedades/agregarImagen/${id}`)

    } catch (error) {
        console.log(error)
    }

}

const agregarImagen = async(req, res) =>{

    const { id } = req.params
 
    //VALIDACION PROPIEDAD
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad)
    {
        return res.redirect('/mis-propiedades')
    }

    //VALIDACION PUBLICADA
    if(propiedad.publicado)
    {
        return res.redirect('/mis-propiedades')
    }

    //VALIDAD A QUIEN PERTENECE LA PROPIEDAD
    if( req.usuario.id.toString() !== propiedad.usuarioId.toString() )
    {
        return res.redirect('/mis-propiedades')
    }


    res.render('propiedades/agregarImagen.pug',{
        pagina: `Agrega Una Imagen para ${propiedad.titulo}`,
        barra: true,
        csrfToken: req.csrfToken(),
        propiedad,
        EstaLogueado: EstaLogueado(req.cookies._token)

    })

}

const almacenarImagen = async (req, res, next) =>{
    const { id } = req.params

    //VALIDACION DE QUE EXISTE
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad)
    {
        return res.render('/mis-propiedades')
    }

    //VERIFICAR QUE ESTE PUBLICADO
    if(propiedad.publicado)
    {
        return res.redirect('/mis-propiedades')
    }

    //VERIFICAR QUE ES EL MISMO USUARIO QUE PUBLICO
    if( req.usuario.id.toString() !== propiedad.usuarioId.toString() )
    {
        return res.redirect('/mis-propiedades')
    }

    //SUBIR IMAGEN 
    try{
        
        //SUBIR IMAGEN EN LA BASE DE DATOS
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1

        await propiedad.save()

        next()

    }catch(error){
        console.log(error)
    }

    
}

const editar = async(req, res) =>{

    //Extraer ID
    const { id } = req.params

    //VALIDAR QUE LA PROPIEDAD EXISTA
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad)
    {
        return res.redirect('/mis-propiedades')
    }

    //VERIFICAR QUE EL ESTA EDITANDO SEA EL PROPIETARIO DE LA PUBLICACION
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString())
    {
        return res.redirect('/mis-propiedades')
    }

    //CONSULTAR LA BASE DE DATOS
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll(),
    ])

    res.render('propiedades/editar.pug',{
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        barra: true,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad,
        EstaLogueado: EstaLogueado(req.cookies._token)
    })
}

const guardarCambios = async(req, res) =>{

    //VERIFICAR VALIDACION
    let resultado = validationResult(req)
    if(!resultado.isEmpty())
    {
        //Consultar Los Precios y Categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll(),
        ])

        res.render('propiedades/editar.pug',{
            pagina: 'Editar Propiedad',
            barra: true,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body,
            EstaLogueado: EstaLogueado(req.cookies._token)
        })
    }

    //Extraer ID
    const { id } = req.params

    //VALIDAR QUE LA PROPIEDAD EXISTA
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad)
    {
        return res.redirect('/mis-propiedades')
    }

    //VERIFICAR QUE EL ESTA EDITANDO SEA EL PROPIETARIO DE LA PUBLICACION
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString())
    {
        return res.redirect('/mis-propiedades')
    }

    //REESCRIBIR LOS DATOS
    try {

        const { titulo, descripcion, barrio, calle, categoria: categoriaId, precio: precioId, habitaciones, br, dimencion } = req.body;
        propiedad.set({
            titulo,
            descripcion,
            barrio,
            calle,
            categoriaId,
            precioId,
            habitaciones,
            br,
            dimencion
        })

        await propiedad.save()

        res.redirect('/mis-propiedades')

    } catch (error) {
        console.log(error)
    }

}

const eliminar = async(req, res) =>{
    
    //VALIDAR QUE EL USUARIO DE LA PROPIEDAD SEA LA QUE LA ESTA ELIMINANDO

    //Extraer ID
    const { id } = req.params

    //VALIDAR QUE LA PROPIEDAD EXISTA
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad)
    {
        return res.redirect('/mis-propiedades')
    }

    //VERIFICAR QUE EL ESTA EDITANDO SEA EL PROPIETARIO DE LA PUBLICACION
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString())
    {
        return res.redirect('/mis-propiedades')
    }
    
    //ELIMINAR IMAGEN
    await unlink(`public/uploads/${propiedad.imagen}`)

    //ELIMINAR LA PROPIEDAD
    await propiedad.destroy()
    res.redirect('/mis-propiedades')

}

//MUESTRA DE PROPIEDAD
const mostrarPropiedad = async(req, res) =>{

    //EXTRAER ID
    const { id } = req.params

    //COMPROBAR QUE LA PROPIEDAD EXISTA
    const propiedad = await Propiedad.findByPk(id,{
        include: [
            { model: Precio, as: 'precio'},
            { model: Categoria, as: 'categoria'},
            { model: Mensaje, as: 'mensajes',
                include: [
                    {model: Usuario.scope('eliminarPassword'), as: 'usuario'}
                ]
            }
            
        ]
    })  

    res.render('propiedades/mostrar.pug',{
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        EsVendedor: EsVendedor(req.usuario?.id, propiedad.usuarioId),
        EstaLogueado: EstaLogueado(req.cookies._token)

    })
}

const enviarMensaje = async(req, res) =>{

    //EXTRAER ID
    const { id } = req.params

    //COMPROBAR QUE LA PROPIEDAD EXISTA
    const propiedad = await Propiedad.findByPk(id,{
        include: [
            { model: Precio, as: 'precio'},
            { model: Categoria, as: 'categoria'}
        ]
    })

    //MOSTRAR LOS ERRORES
    await check('mensaje').isLength({ min:10 }).withMessage('El mensaje esta vacio o es muy corto').run(req);
    let resultado = validationResult(req)


    if(!resultado.isEmpty())
    {
        return res.render('propiedades/mostrar.pug',{
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            EsVendedor: EsVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array(),
            EstaLogueado: EstaLogueado(req.cookies._token)
        })
    }

    const { mensaje } = req.body
    const { id:propiedadId } = req.params
    const { id:usuarioId } = req.usuario


    //GUARDAR MENSAJE
    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

    res.render('propiedades/mostrar.pug',{
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        EsVendedor: EsVendedor(req.usuario?.id, propiedad.usuarioId),
        enviado: true,
        EstaLogueado: EstaLogueado(req.cookies._token)
    })

}

const verMensaje = async(req, res) =>{
    res.send('mensaje')
}

const estado = async(req, res) =>{
    
    const { id } = req.params

    //VALIDAR QUE LA PROPIEDAD EXISTA
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad)
    {
        return res.redirect('/mis-propiedades')
    }

    //VERIFICAR QUE EL ESTA EDITANDO SEA EL PROPIETARIO DE LA PUBLICACION
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString())
    {
        return res.redirect('/mis-propiedades')
    }

    if(propiedad.publicado == true)
    {
        propiedad.publicado = false
        await propiedad.save()
        res.redirect('/mis-propiedades')
    }
    else
    {
        propiedad.publicado = true
        await propiedad.save()
        res.redirect('/mis-propiedades')
    }

}


export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    mostrarPropiedad,
    enviarMensaje,
    verMensaje,
    estado,

}

