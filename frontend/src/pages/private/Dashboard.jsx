import "../../assets/styles/private/Dashboard.scss";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Resumen de Ventas</h2>
      <div className="stats">
        <div className="card">
          <h4>Ventas del Mes</h4>
          <p>1500 S/</p>
        </div>
        <div className="card">
          <h4>Artículos más vendidos</h4>
          <p>Chullos, Ponchos, Pulseras</p>
        </div>
      </div>
    </div>
  );
}
