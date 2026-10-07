"use client";

export default function ContactForm() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="formWrap">
      <form className="contactForm" onSubmit={handleSubmit}>
        <div className="formRow">
          <label>
            <span>Name</span>
            <input type="text" name="name" autoComplete="name" placeholder="Your name" />
          </label>

          <label>
            <span>Phone</span>
            <input type="tel" name="phone" autoComplete="tel" placeholder="(503) 555-1234" />
          </label>
        </div>

        <label>
          <span>Email</span>
          <input type="email" name="email" autoComplete="email" placeholder="you@example.com" />
        </label>

        <label>
          <span>Message</span>
          <textarea
            name="message"
            rows={6}
            placeholder="Tell us what you'd like to know..."
          />
        </label>

        <button type="submit">Send message</button>

        <p className="demoNotice">
          This is a demo form, this will not send any messages.
        </p>
      </form>
    </div>
  );
}
