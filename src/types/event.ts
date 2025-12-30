export interface Evento {
    id: number;
    titulo: string;
    descripcion?: string;
    fecha: string;
    hora: string;
    precio: number;
    tipo: 'Virtual' | 'Presencial' | 'Híbrido';
    modalidad?: string;
    ubicacion?: string;
    imagenUrl?: string;
    estado: 'Activo' | 'Pendiente' | 'Finalizado';
    cupoMaximo: number;
    inscritos: number;

    fechaCreacion: string;
    idUsuarioCreacion: number;
    fechaActualizacion?: string;
    idUsuarioActualizacion?: number;
    fechaEliminacion?: string;
    idUsuarioEliminacion?: number;
}
