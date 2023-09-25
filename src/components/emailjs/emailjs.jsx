  import React, { useRef } from 'react';
  import emailjs from 'emailjs-com';
  
  export const ContactUs = () => {
    const form = useRef();
  
    const sendEmail = (e) => {
      e.preventDefault();
  
      emailjs.sendForm('service_lwri32l', 'template_hnydtuc', form.current, 'template_hnydtuc')
        .then((result) => {
          console.log(result.text);
          // Handle success, e.g., show a success message
        })
        .catch((error) => {
          console.log(error.text);
          // Handle error, e.g., show an error message
        });
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
            <form action="#" method="POST" className="mt-3 flex flex-col gap-y-6" ref={form} onSubmit={sendEmail}>
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
                  className="hover:ring-primary-600 focus:ring-primary-600 bg-primary-50 ring-primary-900/40 placeholder:text-primary-950/60 block w-full appearance-none rounded-md border-0 px-4 py-4 text-base ring-1 transition focus:outline-none focus:ring-2"
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
                  className="hover:ring-primary-600 focus:ring-primary-600 bg-primary-50 ring-primary-900/40 placeholder:text-primary-950/60 block w-full appearance-none rounded-md border-0 px-4 py-4 text-base ring-1 transition focus:outline-none focus:ring-2"
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
                  className="hover:ring-primary-600 focus:ring-primary-600 bg-primary-50 ring-primary-900/40 placeholder:text-primary-950/60 block w-full appearance-none rounded-md border-0 px-4 py-4 text-base ring-1 transition focus:outline-none focus:ring-2"
                  placeholder="Message"
                ></textarea>
              </div>
  
              <div>
                <button
                  className="bg-primary-600 hover:bg-primary-700 focus-visible:outline-primary-600 text-white rounded-full px-5 py-3 text-base font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  type="submit"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  };
  