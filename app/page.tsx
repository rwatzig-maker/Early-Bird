export default function Home(){
  return <main>
    <header className="siteHeader">
      <a className="brand" href="#top"><div className="logoMark"><span>☀</span><b>🐦</b></div><span>Early Bird Child Care</span></a>
      <nav><a href="#program">Program</a><a href="#hours">Hours</a><a href="#contact">Contact</a></nav>
      <a className="headerCta" href="tel:5034210600">(503) 421-0600</a>
    </header>
    <section className="hero" id="top">
      <div className="heroPhoto" aria-hidden="true"/>
      <div className="heroShade"/>
      <div className="heroCopy">
        <div className="logoCard"><div className="logoMark large"><span>☀</span><b>🐦</b></div><strong>Early Bird<br/>Child Care</strong></div>
        <p className="kicker">Early Bird Child Care — Openings Available</p>
        <h1>Full-time openings for infants, toddlers, and preschoolers.</h1>
        <div className="heroFacts"><span>ERDC accepted</span><span>Se Habla Español</span><span>Monday–Friday, 5:30 AM–6:00 PM</span></div>
        <a className="primary" href="#contact">Message me for more information!</a>
      </div>
    </section>
    <section className="facts" id="program">
      <div className="sectionTitle"><p>Early Bird Child Care</p><h2>Child care for infants, toddlers, and young children</h2></div>
      <div className="factGrid">
        <article><span>01</span><h3>Spanish &amp; English bilingual immersion program</h3></article>
        <article><span>02</span><h3>Play-based learning and age-appropriate activities</h3></article>
        <article><span>03</span><h3>Safe, loving, and family-friendly environment</h3></article>
        <article><span>04</span><h3>Outdoor play area</h3></article>
      </div>
    </section>
    <section className="split" id="hours">
      <div className="splitImage" aria-label="Outdoor play area"><div className="photoLabel">Outdoor play area</div></div>
      <div className="splitCopy">
        <p className="eyebrow">Sandy, Oregon</p>
        <h2>Large green outdoor areas, and a new playground opening soon.</h2>
        <div className="detailRows">
          <div><b>Hours</b><span>Monday–Friday, 5:30 AM–6:00 PM</span></div>
          <div><b>Transportation</b><span>The Oregon Trail School District works well with transportation, and the Firwood bus stops right in front of our home, making drop-off and pick-up easy.</span></div>
          <div><b>ERDC</b><span>ERDC accepted</span></div>
        </div>
      </div>
    </section>
    <section className="bilingual">
      <div className="lang"><p className="eyebrow">Español</p><h2>Cuidado para bebés, toddlers y niños pequeños</h2></div>
      <div className="spanishGrid">
        <p>Programa de inmersión bilingüe Español 🇲🇽 / Inglés 🇺🇸</p>
        <p>Aprendizaje a través del juego y actividades apropiadas para cada edad</p>
        <p>Ambiente familiar, seguro y acogedor</p>
        <p>Espacio de juego al aire libre</p>
        <p>Lunes a viernes, 5:30 AM–6:00 PM</p>
        <p>Aceptamos ERDC</p>
      </div>
    </section>
    <section className="contact" id="contact">
      <div><p className="eyebrow">Contact</p><h2>Message me for more information!</h2></div>
      <div className="contactLinks">
        <a href="tel:5034210600"><small>Phone</small><strong>(503) 421-0600</strong></a>
        <a href="mailto:earlybirdchildcare.info@gmail.com"><small>Email</small><strong>earlybirdchildcare.info@gmail.com</strong></a>
        <a href="https://maps.google.com/?q=41361+SE+Vista+Loop+Dr+Sandy+OR+97055"><small>Address</small><strong>41361 SE Vista Loop Dr, Sandy, OR 97055</strong></a>
      </div>
    </section>
    <footer><div className="brand"><div className="logoMark"><span>☀</span><b>🐦</b></div><span>Early Bird Child Care</span></div><span>Sandy, Oregon</span></footer>
  </main>
}
