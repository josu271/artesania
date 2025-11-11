// src/pages/private/Eventos.jsx
import { useState, useEffect } from "react";
import { eventosService } from "../../services/eventosService";
import "../../assets/styles/private/Eventos.scss";

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [form, setForm] = useState({
    nombre: "",
    fecha: "",
    ubicacion: "",
    descripcion: ""
  });

  const token = localStorage.getItem("token");

  // Cargar eventos al montar el componente
  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    setLoading(true);
    try {
      const data = await eventosService.getEventos(token);
      setEventos(data);
      setError("");
    } catch (err) {
      setError("Error al cargar los eventos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Resetear formulario
  const resetForm = () => {
    setForm({
      nombre: "",
      fecha: "",
      ubicacion: "",
      descripcion: ""
    });
    setEditingEvento(null);
    setError("");
    setSuccess("");
  };

  // Abrir modal para crear nuevo evento
  const handleNuevoEvento = () => {
    resetForm();
    setShowModal(true);
  };

  // Abrir modal para editar evento
  const handleEditarEvento = (evento) => {
    setForm({
      nombre: evento.nombre,
      fecha: evento.fecha,
      ubicacion: evento.ubicacion,
      descripcion: evento.descripcion || ""
    });
    setEditingEvento(evento);
    setShowModal(true);
  };

  // Enviar formulario (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editingEvento) {
        // Actualizar evento existente
        await eventosService.updateEvento(editingEvento.id, form, token);
        setSuccess("Evento actualizado correctamente");
      } else {
        // Crear nuevo evento
        await eventosService.createEvento(form, token);
        setSuccess("Evento creado correctamente");
      }

      // Recargar lista y cerrar modal
      await cargarEventos();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message || "Error al guardar el evento");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar evento
  const handleEliminarEvento = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      return;
    }

    setLoading(true);
    try {
      await eventosService.deleteEvento(id, token);
      setSuccess("Evento eliminado correctamente");
      await cargarEventos();
    } catch (err) {
      setError("Error al eliminar el evento");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha para mostrar
  const formatFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Eventos</h1>
        <button 
          className="btn btn-primary"
          onClick={handleNuevoEvento}
          disabled={loading}
        >
          + Nuevo Evento
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccess("")}
          ></button>
        </div>
      )}

      {/* Lista de eventos */}
      {loading && eventos.length === 0 ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : eventos.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5>No hay eventos registrados</h5>
            <p className="text-muted">Comienza creando tu primer evento.</p>
          </div>
        </div>
      ) : (
        <div className="row">
          {eventos.map((evento) => (
            <div key={evento.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{evento.nombre}</h5>
                  <p className="card-text">
                    <small className="text-muted">
                      <i className="bi bi-calendar-event me-2"></i>
                      {formatFecha(evento.fecha)}
                    </small>
                  </p>
                  <p className="card-text">
                    <i className="bi bi-geo-alt me-2"></i>
                    {evento.ubicacion}
                  </p>
                  {evento.descripcion && (
                    <p className="card-text">{evento.descripcion}</p>
                  )}
                </div>
                <div className="card-footer bg-transparent">
                  <div className="btn-group w-100">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleEditarEvento(evento)}
                      disabled={loading}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleEliminarEvento(evento.id)}
                      disabled={loading}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear/editar evento */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingEvento ? "Editar Evento" : "Nuevo Evento"}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre del Evento</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nombre"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="fecha" className="form-label">Fecha</label>
                    <input
                      type="date"
                      className="form-control"
                      id="fecha"
                      name="fecha"
                      value={form.fecha}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="ubicacion" className="form-label">Ubicación</label>
                    <input
                      type="text"
                      className="form-control"
                      id="ubicacion"
                      name="ubicacion"
                      value={form.ubicacion}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      id="descripcion"
                      name="descripcion"
                      rows="3"
                      value={form.descripcion}
                      onChange={handleChange}
                      disabled={loading}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : (editingEvento ? "Actualizar" : "Crear")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}