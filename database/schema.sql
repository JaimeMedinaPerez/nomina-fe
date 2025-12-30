-- =============================================
-- TABLAS DE CATÁLOGO (Estructura Organizacional)
-- =============================================

CREATE TABLE Departamentos (
    IdDepartamento INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(255) NULL,
    
    -- Auditoría
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    IdUsuarioCreacion INT NOT NULL DEFAULT 1,
    FechaActualizacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    IdUsuarioActualizacion INT NULL,
    FechaEliminacion DATETIME NULL,
    IdUsuarioEliminacion INT NULL
);

CREATE TABLE Cargos (
    IdCargo INT AUTO_INCREMENT PRIMARY KEY,
    IdDepartamento INT NULL, -- Relación opcional para filtrar cargos por dep
    Nombre VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(255) NULL,
    SalarioBaseMinimo DECIMAL(10, 2) NULL,
    SalarioBaseMaximo DECIMAL(10, 2) NULL,
    
    -- Auditoría
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    IdUsuarioCreacion INT NOT NULL DEFAULT 1,
    FechaActualizacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    IdUsuarioActualizacion INT NULL,
    FechaEliminacion DATETIME NULL,
    IdUsuarioEliminacion INT NULL
);

-- =============================================
-- TABLAS PRINCIPALES (RRHH)
-- =============================================

CREATE TABLE Empleados (
    IdEmpleado INT AUTO_INCREMENT PRIMARY KEY,
    IdDepartamento INT NULL, -- FK a Departamentos
    IdCargo INT NULL,        -- FK a Cargos
    Nombre VARCHAR(200) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    -- Campos legados o para visualización rápida (opcional mantenerlos)
    -- Cargo VARCHAR(100) NULL, 
    -- Departamento VARCHAR(100) NULL,
    Salario DECIMAL(10, 2) NOT NULL DEFAULT 0,
    FechaIngreso DATE NOT NULL,
    Estado VARCHAR(50) NOT NULL DEFAULT 'Activo', -- 'Activo', 'Inactivo'
    HoraEntrada VARCHAR(10) DEFAULT '09:00',
    HoraSalida VARCHAR(10) DEFAULT '18:00',

    -- Auditoría
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    IdUsuarioCreacion INT NOT NULL DEFAULT 1,
    FechaActualizacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    IdUsuarioActualizacion INT NULL,
    FechaEliminacion DATETIME NULL,
    IdUsuarioEliminacion INT NULL
);

CREATE TABLE HistorialSalarios (
    IdHistorial INT AUTO_INCREMENT PRIMARY KEY,
    IdEmpleado INT NOT NULL,
    SalarioAnterior DECIMAL(10, 2) NOT NULL,
    SalarioNuevo DECIMAL(10, 2) NOT NULL,
    FechaCambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    Motivo VARCHAR(255) NULL, -- 'Aumento Anual', 'Promoción'
    IdUsuarioCreacion INT NOT NULL
);

-- =============================================
-- GESTIÓN DE TIEMPO
-- =============================================

CREATE TABLE Asistencias (
    IdAsistencia INT AUTO_INCREMENT PRIMARY KEY,
    IdEmpleado INT NOT NULL,
    Fecha DATE NOT NULL,
    HoraEntrada DATETIME NOT NULL,
    HoraSalida DATETIME NULL,
    Estado VARCHAR(50) NOT NULL, -- 'Presente', 'Tarde', 'Ausente'
    
    -- Auditoría
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    IdUsuarioCreacion INT NOT NULL,
    FechaActualizacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    IdUsuarioActualizacion INT NULL
);

CREATE TABLE Permisos (
    IdPermiso INT AUTO_INCREMENT PRIMARY KEY,
    IdEmpleado INT NOT NULL,
    Tipo VARCHAR(50) NOT NULL, -- 'Vacaciones', 'Enfermedad', 'Personal'
    FechaInicio DATE NOT NULL,
    FechaFin DATE NOT NULL,
    Motivo TEXT NULL,
    Estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', -- 'Pendiente', 'Aprobado', 'Rechazado'

    -- Auditoría
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    IdUsuarioCreacion INT NOT NULL,
    FechaActualizacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    IdUsuarioActualizacion INT NULL
);

CREATE TABLE Feriados (
    IdFeriado INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Fecha DATE NOT NULL,
    EsRecurrente BOOLEAN DEFAULT TRUE, -- Si se repite cada año
    Tipo VARCHAR(50) DEFAULT 'Nacional', -- 'Nacional', 'Regional'
    
    -- Auditoría
    IdUsuarioCreacion INT NOT NULL DEFAULT 1
);

-- =============================================
-- NÓMINA Y PAGOS
-- =============================================

CREATE TABLE ConceptosNomina (
    IdConcepto INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Tipo VARCHAR(20) NOT NULL, -- 'Ingreso', 'Descuento', 'Aporte'
    EsPorcentaje BOOLEAN DEFAULT FALSE,
    ValorPorDefecto DECIMAL(10, 2) NULL, -- Si es monto fijo o % fijo
    CodigoContable VARCHAR(50) NULL,
    
    Estado VARCHAR(20) DEFAULT 'Activo'
);

CREATE TABLE Pagos (
    IdPago INT AUTO_INCREMENT PRIMARY KEY,
    IdEmpleado INT NOT NULL,
    FechaPago DATE NOT NULL,
    Periodo VARCHAR(20) NOT NULL, -- Ej: '2023-10'
    
    -- Totales calculados (Denormalización para consultas rápidas)
    TotalIngresos DECIMAL(10, 2) NOT NULL DEFAULT 0,
    TotalDescuentos DECIMAL(10, 2) NOT NULL DEFAULT 0,
    NetoAPagar DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    Referencia VARCHAR(100) NULL,
    UrlComprobante VARCHAR(500) NULL,
    Estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', -- 'Pendiente', 'Pagado'

    -- Auditoría
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    IdUsuarioCreacion INT NOT NULL,
    FechaActualizacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    IdUsuarioActualizacion INT NULL
);

CREATE TABLE DetallesNomina (
    IdDetalle INT AUTO_INCREMENT PRIMARY KEY,
    IdPago INT NOT NULL,
    IdConcepto INT NOT NULL,
    NombreConcepto VARCHAR(100) NOT NULL, -- Copia del nombre por histórico
    Monto DECIMAL(10, 2) NOT NULL,
    Cantidad DECIMAL(10, 2) DEFAULT 1, -- Para horas extras (ej: 2.5 horas)
    
    -- Auditoría
    IdUsuarioCreacion INT NOT NULL
);

-- =============================================
-- SEGURIDAD Y ACCESO
-- =============================================

CREATE TABLE Roles (
    IdRol INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    Descripcion VARCHAR(200) NULL,
    
    -- Auditoría
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Usuarios (
    IdUsuario INT AUTO_INCREMENT PRIMARY KEY,
    IdRol INT NOT NULL,
    IdEmpleado INT NULL,
    Nombre VARCHAR(200) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    AvatarUrl VARCHAR(500) NULL,
    Estado VARCHAR(50) NOT NULL DEFAULT 'Activo',
    
    -- Auditoría
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    IdUsuarioCreacion INT NOT NULL DEFAULT 1,
    FechaActualizacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    IdUsuarioActualizacion INT NULL,
    FechaEliminacion DATETIME NULL,
    IdUsuarioEliminacion INT NULL
);

-- =============================================
-- OTROS
-- =============================================

CREATE TABLE Documentos (
    IdDocumento INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(200) NOT NULL,
    Tipo VARCHAR(50) NOT NULL,
    UrlArchivo VARCHAR(500) NOT NULL,
    Tamano VARCHAR(50) NULL,
    FechaSubida DATETIME DEFAULT CURRENT_TIMESTAMP,
    SubidoPor VARCHAR(50) NOT NULL,
    IdPropietario INT NULL,
    
    -- Auditoría
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    IdUsuarioCreacion INT NOT NULL DEFAULT 1,
    FechaEliminacion DATETIME NULL,
    IdUsuarioEliminacion INT NULL
);
