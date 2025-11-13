import React, { useState, useEffect } from 'react';
import { perfilService } from '../../services/perfilService';
import "../../assets/styles/private/Perfil.scss";

const Perfil = () => {
  const [usuario, setUsuario] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    rol: '',
    fecha_registro: ''
  });
  
  const [editing, setEditing] = useState(false);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Datos para cambiar contraseña
  const [passwordData, setPasswordData] = useState({
    password_actual: '',
    nuevo_password: '',
    confirmar_password: ''
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const perfilData = await perfilService.obtenerPerfil(token);
      setUsuario(perfilData);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      setError('Error al cargar el perfil');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUsuario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const resultado = await perfilService.actualizarPerfil(usuario, token);
      
      setMessage(resultado.mensaje || 'Perfil actualizado correctamente');
      setEditing(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (passwordData.nuevo_password !== passwordData.confirmar_password) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const resultado = await perfilService.cambiarPassword({
        password_actual: passwordData.password_actual,
        nuevo_password: passwordData.nuevo_password
      }, token);
      
      setMessage(resultado.mensaje || 'Contraseña cambiada correctamente');
      setCambiandoPassword(false);
      setPasswordData({
        password_actual: '',
        nuevo_password: '',
        confirmar_password: ''
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="perfil-container">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">Mi Perfil</h1>
        </div>
      </div>

      {message && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="row">
        {/* Información del Perfil */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Información Personal</h5>
              {!editing && (
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setEditing(true)}
                >
                  Editar
                </button>
              )}
            </div>
            <div className="card-body">
              {editing ? (
                <form onSubmit={handleGuardarPerfil}>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombre"
                      value={usuario.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Apellido</label>
                    <input
                      type="text"
                      className="form-control"
                      name="apellido"
                      value={usuario.apellido}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Correo Electrónico</label>
                    <input
                      type="email"
                      className="form-control"
                      name="correo"
                      value={usuario.correo}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="telefono"
                      value={usuario.telefono}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditing(false);
                        cargarPerfil(); // Recargar datos originales
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="perfil-info">
                  <div className="row mb-2">
                    <div className="col-4 fw-bold">Nombre:</div>
                    <div className="col-8">{usuario.nombre} {usuario.apellido}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 fw-bold">Correo:</div>
                    <div className="col-8">{usuario.correo}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 fw-bold">Teléfono:</div>
                    <div className="col-8">{usuario.telefono || 'No especificado'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 fw-bold">Rol:</div>
                    <div className="col-8">
                      <span className={`badge ${usuario.rol === 'administrador' ? 'bg-danger' : usuario.rol === 'gestor' ? 'bg-warning' : 'bg-success'}`}>
                        {usuario.rol}
                      </span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-4 fw-bold">Miembro desde:</div>
                    <div className="col-8">{formatearFecha(usuario.fecha_registro)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cambiar Contraseña */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Seguridad</h5>
            </div>
            <div className="card-body">
              {cambiandoPassword ? (
                <form onSubmit={handleCambiarPassword}>
                  <div className="mb-3">
                    <label className="form-label">Contraseña Actual</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password_actual"
                      value={passwordData.password_actual}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nueva Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      name="nuevo_password"
                      value={passwordData.nuevo_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmar_password"
                      value={passwordData.confirmar_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setCambiandoPassword(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p className="text-muted mb-3">
                    Para mayor seguridad, cambia tu contraseña regularmente.
                  </p>
                  <button 
                    className="btn btn-outline-warning"
                    onClick={() => setCambiandoPassword(true)}
                  >
                    Cambiar Contraseña
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;