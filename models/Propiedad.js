import { DataTypes } from "sequelize";
import db from '../config/db.js';

const Propiedad = db.define('propiedades', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    titulo:{
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    descripcion:{
        type: DataTypes.STRING,
    },
    barrio:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    calle:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    habitaciones: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    br: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    dimencion: {
        type: DataTypes.STRING(11),
        allowNull: false,
    },
    imagen: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    publicado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }


})

export default Propiedad;