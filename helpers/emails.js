import nodemailer from 'nodemailer';


const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos

    //Enviar El Email
    await transport.sendMail({
        from: 'BieneRaices.com',
        to: email,
        subject: 'Confirama Tu Cuenta En DinaInmobiliaria.com',
        text: 'Confirama Tu Cuenta En DinaInmobiliaria.com',
        html: `
            <p>Hola ${nombre}, Comprueba tu cuenta en DinaInmobiliaria.com</p>

            <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}"> Confirmar Cuenta</a> </p>

            <p>Si tu no creaste esta cuenta, ignora este mensaje</p>
        `
    })
}

const emailRecuperacion = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos

    //Enviar El Email
    await transport.sendMail({
        from: 'BieneRaices.com',
        to: email,
        subject: 'Restablece tu Contraseña En DinaInmobiliaria.com',
        text: 'Restablece tu Contraseña En DinaInmobiliaria.com',
        html: `
            <p>Hola ${nombre}, has solicitado restablecer tu contraseña en DinaInmobiliaria.com</p>

            <p>Dale click en el siguiente enlace para restablecer tu contraseña:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/recuperacion/${token}"> Restablece tu Contraseña</a> </p>

            <p>Si tu no solicitaste un cambio de contraseña ignora este mensaje</p>
        `
    })
}

export {
    emailRegistro, 
    emailRecuperacion,

}