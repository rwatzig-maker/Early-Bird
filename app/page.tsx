import ContactForm from "./ContactForm";
import CurrentYear from "./CurrentYear";

export default function Home() {
  return (
    <main>
      <header className="siteHeader">
        <a className="brand" href="#top" aria-label="Early Bird Child Care home">
          <img src="/early-bird-logo.png" alt="Early Bird Child Care logo" />
          <span>Early Bird Child Care</span>
        </a>

        <nav>
          <a href="#program">Child Care</a>
          <a href="#hours">Hours</a>
          <a href="#spanish">Español</a>
          <a href="#contact">Contact</a>
        </nav>

        <a className="headerCta" href="tel:5034210600">
          (503) 421-0600
        </a>
      </header>

      <section className="hero" id="top">
        <img
          className="heroPhoto"
          src="/early-bird-hero.png"
          alt="Early Bird Child Care outdoors in Sandy, Oregon"
        />

        <div className="heroFade" />

        <div className="heroCopy">
          <div className="sunDoodle" aria-hidden="true">
            <span />
          </div>

          <h1>Warm, family-like child care in Sandy</h1>

          <p className="heroLead">
            Now accepting infants, toddlers, and preschoolers.
          </p>

          <a className="primary" href="#contact">
            Message me for more information!
          </a>
        </div>
      </section>

      <section className="infoBar" aria-label="Early Bird Child Care highlights">
        <span>ERDC accepted</span>
        <i aria-hidden="true" />
        <span>Se Habla Español</span>
        <i aria-hidden="true" />
        <span>Monday–Friday, 6:30 AM–6:00 PM</span>
        <i aria-hidden="true" />
        <span>Safe, loving, family-like environment</span>
      </section>

      <section className="programSection" id="program">
        <div className="programHeading">
          <h2>Child care for infants, toddlers, and young children</h2>
          <div className="scribble" aria-hidden="true" />
        </div>

        <div className="playGrid">
          <article className="playCard playCardCoral">
            <div className="cardIcon" aria-hidden="true">
              <svg viewBox="0 0 64 64">
                <path d="M14 18h23a9 9 0 0 1 9 9v8a9 9 0 0 1-9 9H27l-11 8v-8h-2a9 9 0 0 1-9-9v-8a9 9 0 0 1 9-9Z" />
                <path d="M31 11h18a9 9 0 0 1 9 9v7a9 9 0 0 1-9 9h-2" />
              </svg>
            </div>
            <h3>Spanish &amp; English bilingual immersion program</h3>
            <span className="cardDot" />
          </article>

          <article className="playCard playCardYellow">
            <div className="cardIcon" aria-hidden="true">
              <svg viewBox="0 0 64 64">
                <rect x="8" y="31" width="18" height="18" rx="3" />
                <rect x="27" y="20" width="18" height="18" rx="3" />
                <rect x="40" y="38" width="16" height="16" rx="3" />
                <circle cx="16" cy="18" r="7" />
              </svg>
            </div>
            <h3>Play-based learning and age-appropriate activities</h3>
            <span className="cardStar">✦</span>
          </article>

          <article className="playCard playCardBlue">
            <div className="cardIcon" aria-hidden="true">
              <svg viewBox="0 0 64 64">
                <path d="M32 53S9 40 9 23c0-8 6-13 13-13 5 0 9 3 10 7 2-4 6-7 11-7 7 0 13 5 13 13 0 17-24 30-24 30Z" />
              </svg>
            </div>
            <h3>Safe, loving, and family-friendly environment</h3>
            <span className="cardLine" />
          </article>

          <article className="playCard playCardMint">
            <div className="cardIcon" aria-hidden="true">
              <svg viewBox="0 0 64 64">
                <path d="M32 55V29" />
                <path d="M32 31C17 31 10 23 10 11c15 0 22 7 22 20Z" />
                <path d="M32 39c15 0 22-8 22-20-15 0-22 7-22 20Z" />
              </svg>
            </div>
            <h3>Outdoor play area</h3>
            <span className="cardSun" />
          </article>
        </div>
      </section>

      <section className="outdoorSection" id="hours">
        <div className="outdoorPhoto">
          <img src="/early-bird-hero.png" alt="Large green outdoor area" />
          <div className="photoRibbon">Outdoor play area</div>
        </div>

        <div className="outdoorCopy">
          <h2>Large green outdoor areas, and a new playground opening soon.</h2>

          <div className="hoursCard">
            <div className="hoursRow">
              <span>Monday–Friday</span>
              <strong>6:30 AM–6:00 PM</strong>
            </div>
            <div className="hoursRow">
              <span>Saturday</span>
              <strong>Closed</strong>
            </div>
            <div className="hoursRow">
              <span>Sunday</span>
              <strong>Closed</strong>
            </div>
          </div>

          <p className="transportText">
            The Oregon Trail School District works well with transportation, and the
            Firwood bus stops right in front of our home, making drop-off and pick-up easy.
          </p>

          <div className="erTag">ERDC accepted</div>
        </div>
      </section>

      <section className="spanishSection" id="spanish">
        <div className="spanishTitle">
          <h2>Cuidado para bebés, toddlers y niños pequeños</h2>
        </div>

        <div className="spanishList">
          <div>Programa de inmersión bilingüe Español 🇲🇽 / Inglés 🇺🇸</div>
          <div>Aprendizaje a través del juego y actividades apropiadas para cada edad</div>
          <div>Ambiente familiar, seguro y acogedor</div>
          <div>Espacio de juego al aire libre</div>
          <div>Lunes a viernes, 6:30 AM–6:00 PM</div>
          <div>Aceptamos ERDC</div>
        </div>
      </section>

      <section className="contact contactFormSection" id="contact">
        <div className="contactBurst contactBurstOne" aria-hidden="true" />
        <div className="contactBurst contactBurstTwo" aria-hidden="true" />

        <div className="contactIntro">
          <h2>Message me for more information!</h2>
          <p>
            Have a question about openings, hours, ERDC, or child care? Send a message below.
          </p>

          <div className="contactDirect">
            <a href="tel:5034210600">
              <span>Phone</span>
              <strong>(503) 421-0600</strong>
            </a>

            <a href="https://maps.google.com/?q=41361+SE+Vista+Loop+Dr+Sandy+OR+97055">
              <span>Address</span>
              <strong>41361 SE Vista Loop Dr, Sandy, OR 97055</strong>
            </a>
          </div>
        </div>

        <ContactForm />
      </section>

      <footer className="siteFooter">
        <div className="footerTop">
          <div className="brand footerBrand">
            <img src="/early-bird-logo.png" alt="" />
            <span>Early Bird Child Care</span>
          </div>
          <span>Sandy, Oregon</span>
        </div>

        <div className="footerBottom">
          <span>© <CurrentYear /> Early Bird Child Care</span>
          <span>
            Website designed and hosted by{" "}
            <a
              href="https://digital.rudie.org"
              target="_blank"
              rel="noreferrer"
            >
              Rudie Digital
            </a>
          </span>
        </div>
      </footer>
    </main>
  );
}
