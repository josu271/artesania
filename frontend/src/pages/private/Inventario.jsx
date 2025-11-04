import "../../assets/styles/private/Inventario.scss";

export default function Inventario() {
  const productos = [
    { id: 1, nombre: "Chullo Andino", stock: 15, precio: 25 },
    { id: 2, nombre: "Poncho Wanka", stock: 8, precio: 60 },
  ];

  return (
    <div className="inventario">
      <h2>Inventario</h2>
      <button className="btn btn-success mb-3">Agregar Producto</button>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Stock</th>
            <th>Precio (S/)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.stock}</td>
              <td>{p.precio}</td>
              <td>
                <button className="btn btn-warning btn-sm me-2">Editar</button>
                <button className="btn btn-danger btn-sm">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
