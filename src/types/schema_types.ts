// ===== CATÁLOGOS =====
export interface Departamento {
    id: number;
    nombre: string;
    descripcion?: string;
    fechaCreacion: string;
}

export interface Cargo {
    id: number;
    idDepartamento?: number;
    nombre: string;
    descripcion?: string;
    salarioBaseMinimo?: number;
    salarioBaseMaximo?: number;
}

// ===== RRHH =====
export interface Empleado {
    id: number;
    idDepartamento?: number;
    idCargo?: number;
    nombre: string;
    email: string;
    // cargo y departamento removidos/opcionales si se usa ID
    salario: number;
    fechaIngreso: string;
    estado: 'Activo' | 'Inactivo';
    horaEntrada: string;
    horaSalida: string;

    fechaCreacion: string;
    idUsuarioCreacion: number;
    fechaActualizacion?: string;
    idUsuarioActualizacion?: number;
    fechaEliminacion?: string;
    idUsuarioEliminacion?: number;
}

export interface HistorialSalario {
    id: number;
    idEmpleado: number;
    salarioAnterior: number;
    salarioNuevo: number;
    fechaCambio: string;
    motivo?: string;
    idUsuarioCreacion: number;
}

// ===== TIEMPO =====
export interface Asistencia {
    id: number;
    idEmpleado: number;
    fecha: string;
    horaEntrada: string;
    horaSalida?: string;
    estado: 'Presente' | 'Tarde' | 'Ausente';

    fechaCreacion: string;
    idUsuarioCreacion: number;
}

export interface Permiso {
    id: number;
    idEmpleado: number;
    tipo: 'Vacaciones' | 'Enfermedad' | 'Personal';
    fechaInicio: string;
    fechaFin: string;
    motivo?: string;
    estado: 'Pendiente' | 'Aprobado' | 'Rechazado';

    fechaCreacion: string;
    idUsuarioCreacion: number;
}

export interface Feriado {
    id: number;
    nombre: string;
    fecha: string; // YYYY-MM-DD
    esRecurrente: boolean;
    tipo: 'Nacional' | 'Regional';
}

// ===== NÓMINA =====
export interface ConceptoNomina {
    id: number;
    nombre: string;
    tipo: 'Ingreso' | 'Descuento' | 'Aporte';
    esPorcentaje: boolean;
    valorPorDefecto?: number;
    codigoContable?: string;
    estado: 'Activo' | 'Inactivo';
}

export interface Pago {
    id: number;
    idEmpleado: number;
    fechaPago: string;
    periodo: string;

    totalIngresos: number;
    totalDescuentos: number;
    netoAPagar: number;

    referencia?: string;
    urlComprobante?: string;
    estado: 'Pendiente' | 'Pagado';

    fechaCreacion: string;
    idUsuarioCreacion: number;
    fechaActualizacion?: string;
    idUsuarioActualizacion?: number;
    // Detalles se cargarian por separado o como propiedad opcional
    detalles?: DetalleNomina[];
}

export interface DetalleNomina {
    id: number;
    idPago: number;
    idConcepto: number;
    nombreConcepto: string;
    monto: number;
    cantidad: number;
    idUsuarioCreacion: number;
}

// ===== ACCESO Y OTROS =====
export interface Documento {
    id: number;
    titulo: string;
    tipo: 'Contrato' | 'Poliza' | 'Identificacion' | 'CV' | 'Otro';
    urlArchivo: string;
    tamano?: string;
    fechaSubida: string;
    subidoPor: 'Admin' | 'Trabajador';
    idPropietario?: number;

    fechaCreacion: string;
    idUsuarioCreacion: number;
}

export interface Rol {
    id: number;
    nombre: string;
    descripcion?: string;
}

export interface Usuario {
    id: number;
    idRol: number;
    idEmpleado?: number;
    nombre: string;
    email: string;
    passwordHash: string;
    avatarUrl?: string;
    estado: 'Activo' | 'Inactivo' | 'Bloqueado';

    fechaCreacion: string;
    idUsuarioCreacion: number;
    fechaActualizacion?: string;
}
