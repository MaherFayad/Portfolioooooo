import React, { useState, useRef } from 'react';
import emailjs from 'emailjs-com';

export const ContactUs = () => {
  const form = useRef();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const redirectToThanks = () => {
    window.location.href = '/thanks';
  };

  const redirectTo404 = () => {
    window.location.href = '/404';
  };

  const sendEmail = (e) => {
    console.log("emailjs");
    e.preventDefault();
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
      );
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">Let's work together</h2>
            <p className="max-w-lg text-lg sm:text-xl">
              We'd love to learn more about you and what we can build together.
            </p>
          </div>
          <div class="bg-primary-400/10 dark:bg-primary-400/10 rounded-3xl px-6 py-6">
          <form
            action="/thanks"
            className="mt-3 flex flex-col gap-y-6"
            id="Form"
            ref={form}
            onSubmit={(e) => sendEmail(e)}
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
              className="bg-opacity-0 hover:ring-primary-600 focus:ring-primary-600 dark:hover:ring-primary-400 dark:focus:ring-primary-400 bg-primary-950 dark:bg-primary-950 ring-primary-200 dark:ring-primary-200 placeholder:text-primary-200/60 dark:placeholder:text-primary-200/60 block w-full appearance-none rounded-md border-0 px-4 py-4 text-base ring-1 ring-primary-800 transition focus:outline-none focus:ring-2 mb-4"
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
              className="bg-opacity-0 hover:ring-primary-600 focus:ring-primary-600 dark:hover:ring-primary-400 dark:focus:ring-primary-400 bg-primary-950 dark:bg-primary-950 ring-primary-200 dark:ring-primary-200 placeholder:text-primary-200/60 dark:placeholder:text-primary-200/60 block w-full appearance-none rounded-md border-0 px-4 py-4 text-base ring-1 ring-primary-800 transition focus:outline-none focus:ring-2 mb-4"
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
              className="bg-opacity-0 hover:ring-primary-600 focus:ring-primary-600 dark:hover:ring-primary-400 dark:focus:ring-primary-400 bg-primary-950 dark:bg-primary-950 ring-primary-200 dark:ring-primary-200 placeholder:text-primary-200/60 dark:placeholder:text-primary-200/60 block w-full appearance-none rounded-md border-0 px-4 py-4 text-base ring-1 ring-primary-800 transition focus:outline-none focus:ring-2 mb-4"
              placeholder="Message"
            />

            <button
              type="submit"
              className="text-center whitespace-nowrap px-4 bg-primary-200 dark:bg-primary-200 hover:bg-primary-300 dark:hover:bg-primary-300 focus-visible:outline-primary-400 dark:focus-visible:outline-primary-400 text-primary-950 dark:text-primary-950 inline-flex items-center justify-center rounded-full border border-gray-50 py-1 text-base font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Submit
            </button>
          </form>
          </div>
        </div>
      </div>
    </section>
  );
};
