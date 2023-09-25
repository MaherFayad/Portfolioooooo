import React, { useRef } from 'react';
import emailjs from 'emailjs-com'; // Updated import

export const ContactUs = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm('service_lwri32l', 'template_hnydtuc', form.current, 'template_hnydtuc') // Replace with your actual values
      .then((result) => {
        console.log(result.text);
      })
      .catch((error) => {
        console.log(error.text);
      });
  };

  return (
    <form action="#" method="POST" className="mt-3 flex flex-col gap-y-6" id="email-form">
      {/* Full name input */}
      <div>
        <label htmlFor="full-name" className="sr-only">
          Full name
        </label>
        <input
          type="text"
          name="full-name"
          id="full-name"
          autoComplete="name"
          className="hover:ring-primary-400 focus:ring-primary-400 dark:hover:ring-primary-400 dark:focus:ring-primary-400 bg-primary-950 dark:bg-primary-950 ring-primary-200/40 dark:ring-primary-200/40 placeholder:text-primary-200/60 dark:placeholder:text-primary-200/60 block w-full appearance-none rounded-md border-0 px-4 py-4 text-base ring-1 transition focus:outline-none focus:ring-2"
          placeholder="Full name"
        />
      </div>

      {/* Email input */}
      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          autoComplete="email"
          className="hover:ring-primary-400 focus:ring-primary-400 dark:hover:ring-primary-400 dark:focus:ring-primary-400 bg-primary-950 dark:bg-primary-950 ring-primary-200/40 dark:ring-primary-200/40 placeholder:text-primary-200/60 dark:placeholder:text-primary-200/60 block w-full appearance-none rounded-md border-0 px-4 py-4 text-base ring-1 transition focus:outline-none focus:ring-2"
          placeholder="Email"
        />
      </div>

      {/* Message textarea */}
      <div>
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <textarea
          name="message"
          id="message"
          rows="3"
          className="hover:ring-primary-400 focus:ring-primary-400 dark:hover:ring-primary-400 dark:focus:ring-primary-400 bg-primary-950 dark:bg-primary-950 ring-primary-200/40 dark:ring-primary-200/40 placeholder:text-primary-200/60 dark:placeholder:text-primary-200/60 block w-full appearance-none rounded-md border-0 px-4 py-4 text-base ring-1 transition focus:outline-none focus:ring-2"
          placeholder="Message"
        ></textarea>
      </div>

      <div>
        <button
          className="text-primary-200 dark:text-primary-200 hover:bg-primary-400/10 dark:hover:bg-primary-400/10 ring-primary-950 inline-flex h-14 w-14 min-w-max items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2"
          type="submit"
        >
          Submit
        </button>
      </div>
    </form>
  );
};
