import React, { useState, useRef, FormEvent } from 'react';
import emailjs from '@emailjs/browser';

export const ContactUs = () => {
  const form = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!form.current) throw new Error('Form not found');

      const result = await emailjs.sendForm(
        'service_0qkob2y',
        'template_mnzk4uc',
        form.current,
        '6Iz6j9YWRI_DaJ-s6'
      );

      if (result.status === 200) {
        window.location.href = '/thanks';
      }
    } catch (err: any) {
      console.error('Failed to send email:', err);
      setError(err.message || 'Failed to send email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Let's work together</h1>
            <p className="max-w-lg text-lg sm:text-xl">
              I'd love to learn more about you and what we can build together.
            </p>
          </div>
          <div className="bg-primary-400/10 dark:bg-primary-400/10 rounded-3xl px-6 py-6">
          <form
            className="mt-3 flex flex-col gap-y-6"
            ref={form}
            onSubmit={sendEmail}
          >
            {/* Full name input */}
            <label htmlFor="name" className="sr-only">
              Full name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              autoComplete="name"
              className="hover:ring-primary-600 focus:ring-primary-600 dark:hover:ring-primary-400 dark:focus:ring-primary-400 bg-primary-900 dark:bg-primary-900 ring-primary-600 dark:ring-primary-600 placeholder:text-primary-200/60 dark:placeholder:text-primary-200/60 block w-full appearance-none rounded-md border-0 px-4 py-4 text-base ring-1 transition focus:outline-none focus:ring-2 mb-4"
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
              className="hover:ring-primary-600 focus:ring-primary-600 dark:hover:ring-primary-400 dark:focus:ring-primary-400 bg-primary-900 dark:bg-primary-900 dark:ring-primary-600 placeholder:text-primary-200/60 dark:placeholder:text-primary-200/60 block w-full appearance-none rounded-md border-0 px-4 py-4 text-base ring-1 ring-primary-600 transition focus:outline-none focus:ring-2 mb-4"
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
              className="hover:ring-primary-600 focus:ring-primary-600 dark:hover:ring-primary-400 dark:focus:ring-primary-400 bg-primary-900 dark:bg-primary-900 dark:ring-primary-600 placeholder:text-primary-200/60 dark:placeholder:text-primary-200/60 block w-full appearance-none rounded-md border-0 px-4 py-4 text-base ring-1 ring-primary-600 transition focus:outline-none focus:ring-2 mb-4"
              placeholder="Message"
            />

            {error && (
              <div className="text-red-500">{error}</div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-center whitespace-nowrap px-4 bg-primary-200 dark:bg-primary-200 hover:bg-primary-300 dark:hover:bg-primary-300 focus-visible:outline-primary-400 dark:focus-visible:outline-primary-400 text-primary-950 dark:text-primary-950 inline-flex items-center justify-center rounded-full border border-gray-50 py-1 text-base font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {isSubmitting ? 'Sending...' : 'Submit'}
            </button>
          </form>
          </div>
        </div>
      </div>
    </section>
  );
};

