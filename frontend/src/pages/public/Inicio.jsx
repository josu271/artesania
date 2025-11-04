import "../../assets/styles/public/Inicio.scss";

export default function Inicio() {
  return (
    <section className="inicio">
      <div className="hero">
        <h1>ArtesanIA: Innovación y Tradición</h1>
        <p>
          Usamos el poder del <strong>Machine Learning</strong> para impulsar el
          arte y la creatividad de nuestros artesanos wankas.
        </p>
      </div>

      <div className="beneficios mt-5">
        <h2>Beneficios del Machine Learning en la Artesanía</h2>
        <ul>
          <li>Predicción de ventas y productos más demandados.</li>
          <li>Recomendaciones personalizadas para artesanos.</li>
          <li>Optimización de inventarios y tendencias.</li>
        </ul>
      </div>
    </section>
  );
}
