const EsVendedor = (usuarioId, propiedadUsuarioId)=>{
    return usuarioId === propiedadUsuarioId
}

const EstaLogueado = (token)=>{
    let nav = false

    if(token)
    {
        return nav = true
    }
    else
    {
        return nav = false
    }
}
    

export {
    EsVendedor,
    EstaLogueado
}