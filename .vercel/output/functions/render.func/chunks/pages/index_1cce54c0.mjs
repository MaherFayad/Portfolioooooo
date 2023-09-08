/* empty css                         */import { c as createAstro, a as createComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute, d as renderComponent } from '../astro_4846160c.mjs';
import 'clsx';
import { $ as $$Layout } from './404_0df522a4.mjs';
import { $ as $$Logos } from './about_8a273090.mjs';

const $$Astro$6 = createAstro();
const $$About = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$About;
  return renderTemplate`${maybeRenderHead()}<section class="py-16 sm:py-20 fade-up"><div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8"><div class="grid gap-12 lg:grid-cols-3 lg:gap-8"><h2 class="text-3xl font-medium tracking-tight sm:text-4xl">Who am I?</h2><div class="flex flex-col items-start gap-8 sm:gap-10 lg:col-span-2"><p class="text-primary-950/70 dark:text-primary-200/70 text-base sm:text-lg">
I am an experienced UI/UX Designer with extensive knowledge and expertise in 
          creating graphical user interfaces and user experiences. With an Experience 
          in design through volunteering in multiple organizations Like<b> United Nations, 
            TEDx, Enactus, ASME, and Mansoura Motorsport</b> .
<br><br> In addition to the Outstanding Experience from my work with contact financial 
          holding, my part-time work with GameIT, my Internship with Algoriza, and My 
          freelance work in Upwork with some amazing clients like <b>Theradome, Mit Olin 
            foundation, konica minolta, solidity studios, Brackets, IterationX, Phonic,</b>
and many others.
</p><a href="/about" class="text-center whitespace-nowrap px-4 bg-primary-600 dark:bg-primary-200 hover:bg-primary-700 dark:hover:bg-primary-300 focus-visible:outline-primary-600 dark:focus-visible:outline-primary-400 dark:text-primary-950 inline-flex items-center justify-center rounded-full border border-transparent py-1 text-base font-medium text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">See my CV
</a></div></div></div></section>`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/components/home/About.astro", void 0);

const $$Astro$5 = createAstro();
const $$Cta = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Cta;
  return renderTemplate`${maybeRenderHead()}<section class="py-16 sm:py-20 fade-up"><div class="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:max-w-7xl lg:px-8"><div class="bg-primary-500/10 dark:bg-primary-400/10 flex flex-col items-center gap-8 rounded-3xl px-5 py-16 sm:gap-10"><div class="flex flex-col gap-4 sm:gap-6"><h2 class="mx-auto max-w text-3xl font-medium tracking-tight sm:text-4xl">
Let's Take Over the World
</h2><p class="text-primary-950/70 dark:text-primary-200/70 mx-auto max-w-2xl text-lg">
Are you ready to revolutionize the industry with a product that will make your competitors quiver with envy? Let's join forces and create a design solution that will make history.
</p></div><a href="/contact" class="text-center whitespace-nowrap px-4 bg-primary-600 dark:bg-primary-200 hover:bg-primary-700 dark:hover:bg-primary-300 focus-visible:outline-primary-600 dark:focus-visible:outline-primary-400 dark:text-primary-950 inline-flex items-center justify-center rounded-full border border-transparent py-1 text-base font-medium text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Say Hi
</a></div></div></section>`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/components/home/Cta.astro", void 0);

const $$Astro$4 = createAstro();
const $$Expertise = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Expertise;
  const features = [
    {
      id: "1",
      name: "Research and Discovery",
      description: `To create a kick-ass design, I need to understand the user's pain points and your business goals. So, I'll chat with users, do some surveys, and usability tests - basically, I'll be Sherlock Holmes-ing it. Then, I'll check out the competition, analyze the market, and steal some of their best ideas. With all that info, I'll define the problem and start brainstorming solutions like mad scientists.`
    },
    {
      id: "2",
      name: "Design and Prototyping",
      description: `I'll get my hands dirty with some low-fidelity sketches and wireframes to get those design ideas flowing. Then, I'll refine the concepts based on feedback from the entourage, users, and designer pals. Time to turn up the fancy and create high-fidelity mockups to make your designs pop and gather more feedback. After that, I'll prototype and test our ideas like a boss. Finally, I'll make a design system to keep everything looking slick and ensure your team is on the same page.`
    },
    {
      id: "3",
      name: "User Testing and Iteration",
      description: `I'll put our prototypes to the test with some usability testing and get some juicy feedback to improve our designs. Then, I'll dive into that feedback and spot any recurring issues that need fixing pronto. Time to iterate and incorporate that feedback into the designs like a boss. Next up, I'll work with your developer pals to make sure the designs become a reality. Finally, I'll keep a close eye on the product after launch and keep making it better and better.`
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section class="py-16 sm:py-20 fade-up"><div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8"><div class="grid gap-12 lg:grid-cols-3 lg:gap-8"><h2 class="text-3xl font-medium tracking-tight sm:text-4xl">My Process</h2><div class="lg:col-span-2"><dl class="-mt-3" x-data="{ selected: '0', toggle(value) { this.selected = (this.selected === value) ? null : value } }">${features.map((feature, id) => renderTemplate`<div class="rounded-3xl px-4 transition"${addAttribute(`{ id: ${id}, get isOpen() { if (this.id == this.selected) return (true) ; else return this.id === this.selected; }, get isNextOpen() { return (this.id + 1) === this.selected } } `, "x-data")} x-bind:class="{ 'bg-primary-500/10 dark:bg-primary-400/10': isOpen }"><dt class="border-b text-lg transition" x-cloak x-bind:class="{ 'border-transparent': isOpen || isNextOpen, 'border-primary-900/10 dark:border-primary-300/10': !(isOpen || isNextOpen) }"><button type="button" class="group block w-full py-6 text-left transition focus-visible:outline-none"${addAttribute(feature.id, "aria-controls")} x-on:click="toggle(id)" aria-expanded="true" x-bind:aria-expanded="isOpen.toString()"><div class="group-focus-visible:outline-primary-950 dark:group-focus-visible:outline-primary-200 flex items-center justify-between rounded-3xl group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2"><span class="whitespace-nowrap font-medium">${feature.name}</span><span class="ml-6 flex h-7 items-center"><svg class="text-primary-600 dark:text-primary-400 h-6 w-6 rotate-0 transform transition duration-200 ease-in-out" x-bind:class="{ '-rotate-180': isOpen, 'rotate-0': !isOpen }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.9997 13.1714L16.9495 8.22168L18.3637 9.63589L11.9997 15.9999L5.63574 9.63589L7.04996 8.22168L11.9997 13.1714Z"></path></svg></span></div></button></dt><dd class="pb-6 pr-6"${addAttribute(feature.id, "id")} x-show="isOpen || id === '1'"><p class="text-primary-950/70 dark:text-primary-200/70 text-base">${feature.description}</p></dd></div>`)}</dl></div></div></div></section>`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/components/home/Expertise.astro", void 0);

const $$Astro$3 = createAstro();
const $$Hero = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Hero;
  return renderTemplate`${maybeRenderHead()}<section class="py-8 lg:py-8 md:py-8 fade-up"><div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 h-1/5"><div class="flex lg:flex-row flex-col-reverse items-end lg:items-center md:items-center gap-0 lg:gap-72 md:gap-24"><div class="flex max-w-xl min-w-base flex-col  items-start  gap-4 sm:gap-10"><div class="flex max-w-xl flex-col items-start gap-4 sm:gap-6"><h1 class="text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl"><span class="text-primary-950/70 dark:text-primary-300/70 text-3xl">Hi there!</span><br><span>I am <b class="text-primart-100">Maher Fayad</b><br>a product designer</span></h1><p class="text-primary-950/70 dark:text-primary-200/70 text-lg sm:text-xl">
I'm a Product designer with more tricks up my sleeve than any magician you know.
</p></div><a href="/contact" class="text-center whitespace-nowrap px-4 bg-primary-600 dark:bg-primary-200 hover:bg-primary-700 dark:hover:bg-primary-300 focus-visible:outline-primary-600 dark:focus-visible:outline-primary-400 dark:text-primary-950 inline-flex items-center justify-center rounded-full border border-transparent py-1 text-base font-medium text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Say hi
</a></div><img src="/assets/Maher.png" alt="Maher Fayad Character" max-width="400vw" class="max-h-56 lg:max-h-96 md:max-h-96 items-end align-righ"></div></div></section>`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/components/home/Hero.astro", void 0);

const $$Astro$2 = createAstro();
const $$Services = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Services;
  const services = [
    {
      step: "01",
      name: "Sanarte App ",
      image: "/assets/4.webp",
      link: "https://maherfayad.notion.site/Sanarte-Case-Study-466a6b1726634c0f97965c4c8c15dbf9?pvs=4",
      description: `Mobile app end to end case study`
    },
    {
      step: "02",
      name: "LFG Mobil App",
      image: "/assets/5.webp",
      link: "https://maherfayad.notion.site/LFG-Gamification-Framework-9376019753954b8991aaa8dc95c86f1b?pvs=4",
      description: `mobile app with octalysis gamification framework`
    },
    {
      step: "03",
      name: "Indigo Marketing Website",
      image: "/assets/1.webp",
      link: "https://www.behance.net/gallery/179485605/Indigo-marketing",
      description: `website design for a marketing agency`
    },
    {
      step: "04",
      name: "Omaco Website design",
      image: "/assets/2.webp",
      link: "https://www.behance.net/gallery/179484965/Website-Design",
      description: `Landing page for a holding corporate`
    },
    {
      step: "05",
      name: "Airlab Website design",
      image: "/assets/3.webp",
      link: "https://www.behance.net/gallery/179485743/airlab-website",
      description: `Website for a Web3.0 company`
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section class="py-16 sm:py-20 fade-up"><div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 "><h2 class="text-3xl font-medium tracking-tight sm:text-4xl">Portfolio</h2><p class="text-base font-medium py-2">alot of my projects can't be shared due to NDA.</p><div class="flex flex-col gap-0"><!-- <h2 class="text-3xl font-medium tracking-tight sm:text-4xl">My work Steps</h2> --><div class="grid lg:grid-cols-5 md:grid-cols-1 sm:grid-cols-1 gap-0"><div class="lg:col-span-3 lg:row-span-2"><div class="hover:bg-primary-200 dark:hover:bg-primary-800 flex flex-col gap-4 rounded-3xl lg:px-4 md:px-8 px-4 lg:py-4 md:py-8 py-4" onclick="window.open('https://maherfayad.notion.site/Sanarte-Case-Study-466a6b1726634c0f97965c4c8c15dbf9?pvs=4','_blank')"><img class="mx-auto aspect-video rounded-lg object-cover"${addAttribute(services[0].image, "src")} alt=""><div class="flex flex-col"><h3 class="text-2xl font-medium">${services[0].name}</h3><p class="text-primary-950/70 dark:text-primary-200/70 text-base sm:text-lg">${services[0].description}</p></div></div></div><div class="lg:col-span-2 lg:row-span-2 lg:col-start-"><div class="hover:bg-primary-200 dark:hover:bg-primary-800 flex flex-col gap-4 rounded-3xl lg:px-4 md:px-4 px-4 lg:py-4 md:py-8 py-4" onclick="window.open('https://maherfayad.notion.site/LFG-Gamification-Framework-9376019753954b8991aaa8dc95c86f1b?pvs=4','_blank')"><img class="mx-auto lg:aspect-auto lg:h-96 aspect-video rounded-lg object-cover"${addAttribute(services[1].image, "src")} alt=""><div class="flex flex-col "><h3 class="text-2xl font-medium">${services[1].name}</h3><p class="text-primary-950/70 dark:text-primary-200/70 text-base sm:text-lg">${services[1].description}</p></div></div></div></div><div class="grid lg:grid-cols-3"><div class="hover:bg-primary-200 dark:hover:bg-primary-800 flex flex-col gap-4 rounded-3xl lg:px-4 md:px-8 px-4 lg:py-4 md:py-8 py-4" onclick="window.open('https://www.behance.net/gallery/179485605/Indigo-marketing','_blank')"><img class="mx-auto rounded-lg aspect-video object-cover"${addAttribute(services[2].image, "src")} alt=""><div class="flex flex-col "><h3 class="text-2xl font-medium">${services[2].name}</h3><p class="text-primary-950/70 dark:text-primary-200/70 text-base sm:text-lg">${services[2].description}</p></div></div><div class="hover:bg-primary-200 dark:hover:bg-primary-800 flex flex-col gap-4 rounded-3xl lg:px-4 md:px-8 px-4 lg:py-4 md:py-8 py-4" onclick="window.open('https://www.behance.net/gallery/179484965/Website-Design','_blank')"><img class="mx-auto rounded-lg aspect-video object-cover"${addAttribute(services[3].image, "src")} alt=""><div class="flex flex-col "><h3 class="text-2xl font-medium">${services[3].name}</h3><p class="text-primary-950/70 dark:text-primary-200/70 text-base sm:text-lg">${services[3].description}</p></div></div><div class="hover:bg-primary-200 dark:hover:bg-primary-800 flex flex-col gap-4 rounded-3xl lg:px-4 md:px-8 px-4 lg:py-4 md:py-8 py-4" onclick="window.open('https://www.behance.net/gallery/179485743/airlab-website','_blank')"><img class="mx-auto rounded-lg aspect-video object-cover"${addAttribute(services[4].image, "src")} alt=""><div class="flex flex-col "><h3 class="text-2xl font-medium">${services[4].name}</h3><p class="text-primary-950/70 dark:text-primary-200/70 text-base sm:text-lg">${services[4].description}</p></div></div></div></div></div></section>`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/components/home/Services.astro", void 0);

const $$Astro$1 = createAstro();
const $$Testimonials = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Testimonials;
  const testimonials = [
    {
      name: "Grigory Yusufov",
      description: "Mindful Magic - Businees Owner",
      image: "/assets/testimonial-1.webp",
      message: `" Maher is one of the best designers and overall people I have collaborated with, We need more people like him in this space. I had the pleasure of hiring Maher on multiple occasions for various tasks a few times and now for my own project too. He honestly became my go-to for design services. "`
    },
    {
      name: "Joey Dakwerk",
      description: "Phonic - Business Owner",
      image: "/assets/testimonial-2.webp",
      message: "\u201C I had the pleasure of working with Maher on a UX/UI design project, and I must say that he is a talented and intuitive designer. From the very beginning, Maher was focused on understanding my user needs and desires, and he incorporated them seamlessly into the design process. \u201D"
    },
    {
      name: "Salim Boudi",
      description: "Iteration X - Business Owner",
      image: "/assets/testimonial-3.webp",
      message: "\u201C Maher did a wonderful job. Everything went smoothly, communication was fluent, delivered on time and as expected. I highly recommend working with Maher \u201D"
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section class="py-12 sm:py-12 fade-up"><div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8"><div class="flex flex-col items-left gap-4 lg:gap-12"><h2 class="max-w-lg text-3xl font-medium tracking-tight sm:text-4xl lg:py-8 py-2">Clients Testimonials That Will Make You Smile.</h2><div class="divide-primary-900/10 dark:divide-primary-300/10 grid divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">${testimonials.map((testimonial) => renderTemplate`<figure class="mx-auto flex max-w-lg flex-col items-left gap-6 py-8 lg:px-8 lg:py-0"><div class="flex flex-row gap-2">${[...Array(5)].map(() => renderTemplate`<svg class="text-primary-600 dark:text-primary-400 h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.0006 18.26L4.94715 22.2082L6.52248 14.2799L0.587891 8.7918L8.61493 7.84006L12.0006 0.5L15.3862 7.84006L23.4132 8.7918L17.4787 14.2799L19.054 22.2082L12.0006 18.26Z"></path></svg>`)}</div><blockquote class="text-primary-950/70 dark:text-primary-200/70 lg:h-72 text-left text-lg italic leading-loose"><p>${testimonial.message}</p></blockquote><figcaption class="flex flex-col gap-4"><div class="text-left"><div class="text-base font-medium">${testimonial.name}</div><div class="text-primary-950/70 dark:text-primary-200/70 text-sm">${testimonial.description}</div></div></figcaption></figure>`)}</div></div></div></section>`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/components/home/Testimonials.astro", void 0);

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "description": "Maher Fayad Product Designer | Telekinesis Expert | Elevating User Experiences | Bridging the Gap with Your Product | Let's Boost Your UX!", "title": "Maher Fayad" }, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "Hero", $$Hero, {})}${renderComponent($$result2, "Services", $$Services, {})}${renderComponent($$result2, "Logos", $$Logos, {})}${renderComponent($$result2, "About", $$About, {})}${renderComponent($$result2, "Expertise", $$Expertise, {})}${renderComponent($$result2, "Testimonials", $$Testimonials, {})}${renderComponent($$result2, "Cta", $$Cta, {})}` })}`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/pages/index.astro", void 0);

const $$file = "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/pages/index.astro";
const $$url = "";

export { $$Index as default, $$file as file, $$url as url };
