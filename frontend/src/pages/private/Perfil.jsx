import "../../assets/styles/private/Perfil.scss";

export default function Perfil() {
  const usuario = {
    nombre: "Arturo Huamán",
    correo: "arturo@artesania.pe",
    especialidad: "Cerámica Wanka",
  };

  return (
    <div className="perfil">
      <h2>Perfil del Artesano</h2>
      <div className="card p-3">
        <p><strong>Nombre:</strong> {usuario.nombre}</p>
        <p><strong>Correo:</strong> {usuario.correo}</p>
        <p><strong>Especialidad:</strong> {usuario.especialidad}</p>
        <button className="btn btn-warning mt-3">Editar Perfil</button>
      </div>
    </div>
  );
}
