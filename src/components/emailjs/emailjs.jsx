import React, { useState, useRef } from 'react'; // Import FormEvent type
import emailjs from 'emailjs-com';

export const ContactUs = () => {
  const form = useRef(); // Specify the type of useRef
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [redirecting, setRedirecting] = useState(false); // Specify boolean type
  console.log("XXXXXXXXXXXXXXXX");

  const redirectToThanks = () => {
    setRedirecting(true);
    window.location.href = '/thanks';
  };

  const redirectTo404 = () => {
    setRedirecting(true);
    window.location.href = '/404';
  };

  const sendEmail = (e) => {
    console.log("XXXXXXXXXXXXXXXX");
    alert('test');
    e.preventDefault();
    if(form.current){
    emailjs
    .sendForm('service_lwri32l', 'template_hnydtuc', form.current, 'EX_A9-j_JtnnH7oPd')
      .then(
        (result) => {
          console.log(result.text);
          redirectToThanks();
        },
        (error) => {
          console.log(error.text);
          redirectTo404();
        }
      );};
  };


  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">Let's work together</h2>
            <p className="text-primary-950/70 max-w-lg text-lg sm:text-xl">
              We'd love to learn more about you and what we can build together.
            </p>
          </div>
          <form className="mt-3 flex flex-col gap-y-6" ref={form} onSubmit={sendEmail}
 >
            {/* Full name input */}
            <label htmlFor="full-name" className="sr-only">
              Full name
            </label>
            <input
              type="text"
              name="full-name"
              id="full-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="hover:ring-primary-600 focus:ring-primary-600 bg-primary-100 ring-primary-700/40 placeholder:text-primary-700/60 text-primary-950 block w-full appearance-none rounded-md border-1 border-primary-400 px-4 py-3 text-primary-950 transition focus:outline-none focus:ring-2"
              placeholder="Full name"
            />

            {/* Email input */}
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="hover:ring-primary-600 focus:ring-primary-600 bg-primary-100 ring-primary-700/40 placeholder:text-primary-700/60 block w-full appearance-none rounded-md border-1 border-primary-400 px-4 py-3 text-primary-950 transition focus:outline-none focus:ring-2"
              placeholder="Email"
            />

            {/* Message textarea */}
            <label htmlFor="message" className="sr-only">
              Message
            </label>
            <textarea
              name="message"
              id="message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="hover:ring-primary-600 focus:ring-primary-600 bg-primary-100 ring-primary-700/40 placeholder:text-primary-700/60 block w-full appearance-none rounded-md border-1 border-primary-400 px-4 py-3 text-primary-950 transition focus:outline-none focus:ring-2"
              placeholder="Message"
            />

            <button type="submit"
            className="bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-600 text-white rounded-full px-5 py-3 text-primary-950 font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            placeholder="hjkggs"
            >Submit</button>
          </form>
        </div>
      </div>
    </section>
  );
};
