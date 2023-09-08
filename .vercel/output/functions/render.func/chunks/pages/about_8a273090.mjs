/* empty css                         */import { c as createAstro, a as createComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute, d as renderComponent } from '../astro_4846160c.mjs';
import 'clsx';
import { $ as $$Layout } from './404_0df522a4.mjs';

const $$Astro$5 = createAstro();
const $$Logos = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Logos;
  const logo = [
    {
      name: "Theradome",
      image: "/assets/Logos/theradome.png"
    },
    {
      name: "Mit-olins",
      image: "/assets/Logos/Mit-olin.png"
    },
    {
      name: "Contact",
      image: "/assets/Logos/Contact.png"
    },
    {
      name: "Konica",
      image: "/assets/Logos/konica-minolta.png"
    },
    {
      name: "IterationX",
      image: "/assets/Logos/iterationX.png"
    },
    {
      name: "Solidity Law",
      image: "/assets/Logos/Solidity-Law.png"
    },
    {
      name: "GameIt",
      image: "/assets/Logos/gameit-logo-large.png"
    },
    {
      name: "Solidity Studios",
      image: "/assets/Logos/Solidity-Studios.png"
    }
  ];
  return renderTemplate`${maybeRenderHead()}<div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 py-8 fade-up"><h2 class="text-3xl font-medium tracking-tight sm:text-4xl py-8">Worked With These amazing brands</h2><div class="grid lg:gap-8 md:gap-8 lg:grid-cols-4 md:grid-cols-2 grid-cols-2 gap-2 items-center align-middle">${logo.map((logo2) => renderTemplate`<div class="bg-primary-800 bg-opacity-20 dark:bg-opacity-50 flex flex-col gap-4 align-middle items-center rounded-md px-4 py-8"><img class="items-center align-middle md:h-12 bg-cover h-8"${addAttribute(logo2.image, "src")}${addAttribute(logo2.name, "alt")}></div>`)}</div></div>`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/components/home/Logos.astro", void 0);

const $$Astro$4 = createAstro();
const $$Heading = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Heading;
  return renderTemplate`${maybeRenderHead()}<section class="py-16 sm:py-20 fade-up"><div class="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:max-w-7xl lg:px-8"><div class="flex flex-col gap-4 sm:gap-6 items-center align-middle"><p class="text-primary-950/70 dark:text-primary-200/70 mx-auto max-w-xl text-2xl sm:text-2xl">
🎉 Looking for a UI/UX designer who can make your product stand out like a flamingo in a flock of pigeons? Look no further, my friend!
</p><a href="" class="text-center whitespace-nowrap px-4 bg-primary-600 dark:bg-primary-200 hover:bg-primary-700 dark:hover:bg-primary-300 focus-visible:outline-primary-600 dark:focus-visible:outline-primary-400 dark:text-primary-950 inline-flex items-center justify-center rounded-full border border-transparent py-1 text-base font-medium text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" onclick=" window.open('https://drive.google.com/file/d/17gjXpoyjISAdNi6Jw8E-3052SkGq1TRc/view?usp=sharing','_blank')">Download CV
</a></div></div></section>`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/components/about/Heading.astro", void 0);

const $$Astro$3 = createAstro();
const $$Mission = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Mission;
  const stats = [
    {
      name: "Years",
      value: "< 2"
    },
    {
      name: "Years as volunteer",
      value: "> 3"
    },
    {
      name: "Projects",
      value: "18"
    },
    {
      name: "Brands Worked with",
      value: "14"
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section class="py-16 sm:py-20 fade-up"><div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8"><div class="grid gap-16 lg:grid-cols-2 lg:gap-24"><img class="mx-auto h-auto w-full max-w-xl rounded-3xl" width="576" height="864" aspect-ratio="3/4" src="/assets/about.webp" alt="Maher"><div class="flex flex-col gap-10"><!-- Mission description --><div class="space-y-8 sm:space-y-12"><h2 class="text-3xl font-medium tracking-tight sm:text-4xl">Overview</h2><div class="space-y-6"><p class="text-primary-950/70 dark:text-primary-200/70 text-base sm:text-lg">
"UX design is not just about aesthetics, it's about understanding and satisfying user needs."
<br> Chatgpt when I asked him about a quote to use
</p><p class="text-primary-950/70 dark:text-primary-200/70 text-base sm:text-lg">
I am an experienced UI/UX Designer with extensive knowledge and expertise in creating graphical user interfaces and user experiences. With an Experience in design through volunteering in multiple organizations Like United Nations, TEDx, Enactus, ASME, and Mansoura Motorsport.
<br><br>In addition to the Outstanding Experience from my work with <b>contact financial holding</b>, my part-time work with <b>GameIT</b>, my Internship with <b>Algoriza</b>, and My freelance work in <b>Upwork</b> with some amazing clients like <b>Theradome, Mit Olin foundation, konica minolta, solidity studios, Brackets, IterationX, Phonic, </b>and many others.
</p><p class="text-primary-950/70 dark:text-primary-200/70 text-base sm:text-lg">
In addition to the Experience, I got from my internship with the <b>British council</b> as an Ambassador at my University where I took training on customer service, PR, and Presentation to serve as a liaison between the <b>British Council</b> and My university while conducting <b>2 Mega Events (over 200 Attendees)</b>.
</p></div></div><!-- Stats --><dl class="grid grid-cols-1 gap-6 sm:grid-cols-2">${stats.map((stat) => renderTemplate`<div class="border-primary-900/10 dark:border-primary-300/10 rounded-3xl border p-6"><dt class="text-base">${stat.name}</dt><dd class="text-3xl font-medium tracking-tight">${stat.value}</dd></div>`)}</dl></div></div></div></section>`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/components/about/Mission.astro", void 0);

const $$Astro$2 = createAstro();
const $$Team = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Team;
  const stats = [
    {
      Position: "Product Designer",
      Company: "Contact",
      Time: "Dec. 2022 - Present",
      image: "/assets/Logos/Contact.png",
      description1: `- I am responsible for creating user-centric and visually compelling designs that meet the company\u2019s business and customer needs. I work on the whole the design process, from concept generation to implementation.`,
      description2: `- My duties include developing user flows and wireframes, designing user interfaces, creating prototypes, and conducting user research.`,
      description3: `- worked on assissting in the design of some apps like contact Now, brokerage and other apps that the company develops`
    },
    {
      Position: "UI/UX Designer",
      Company: "GameIT",
      Time: "Jun. 2022 - Dec. 2022",
      image: "/assets/Logos/gameit-logo-large.png",
      description1: `- Work on optimizing the Website experience usable, enjoyable, and accessible.`,
      description2: `- work with the marketing team to create some visuals and video assets to be used across our platforms`,
      description3: `- Work with the Game Dev. team to make the Game UI better and more accessible`
    },
    {
      Position: "Freelance UI/UX Designer",
      Company: "Upwork",
      Time: "Aug. 2022 - Present",
      image: "/assets/Logos/upwork.png",
      description1: `- Worked with great companies like Konica minolta, Mit olin foundation, Solidity studios, Brackets. iterationx, Phonic, and many others`,
      description2: `- Worked on habit tracking app with octalysis gamification framework and hooks model`,
      description3: `- Worked on an app to enhance remote team coherence using sound and other techniques with help of AI`
    },
    {
      Position: "User Experience Intern Designer",
      Company: "Algoriza",
      Time: "Mar. 2022 - Jun. 2022",
      image: "/assets/Logos/Algoriza.png",
      description1: `In this amazing internship I learnt basics of UX design Process and research in addition to learning the main concepts of UI design and accessibility`
    },
    {
      Position: "Intern",
      Company: "British Council",
      Time: "Jun. 2018 - May 2019",
      image: "/assets/Logos/british-council.png",
      description1: `- Served as liaisons between the British council and My university.`,
      description2: `- Managed a mega event every semester (over 200 attendees).`,
      description3: `- Reported monthly about the events, deals and needs.`
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section class="py-16 sm:py-20 fade-up"><div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8"><div class="flex lg:flex-row flex-col lg:gap-32 md:gap-8 sm:gap-8 w-full lg:flex-nowrap sm:flex-wrap md:flex-wrap"><!-- Stats --><h2 class="text-3xl font-medium tracking-tight sm:text-4xl">Experience</h2><dl class="grid grid-row-1 gap-6 sm:grid-row-2 w-full">${stats.map((stat) => renderTemplate`<div class="border-primary-900/10 dark:border-primary-300/10 rounded-3xl border p-6"><dt class="text-sm">${stat.Position}</dt><div class="flex flex-row justify-between align-middle items-center"><div class="flex flex-row justify-between"><dd class="lg:text-3xl text-2xl font-bold tracking-tight w-fit py-2">${stat.Company}</dd></div><dd class="lg:text-base text-xs font-regular text-right w-fit">${stat.Time}</dd></div><ul class="py-4"><dd class="text-base font-regular text-left w-fit py-1">${stat.description1}</dd><dd class="text-base font-regular text-left w-fit py-1">${stat.description2}</dd><dd class="text-base font-regular text-left w-fit py-1">${stat.description3}</dd></ul></div>`)}</dl></div></div></section>`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/components/about/Team.astro", void 0);

const $$Astro$1 = createAstro();
const $$Values = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Values;
  const values = [
    [
      {
        ref: "01",
        name: "UI design",
        description: `Do you want your users to click, tap, and swipe with a smile? That's where my UI design magic comes in! I turn dull buttons into delightful ones, making your app or website so intuitive that even your grandma can use it (well, almost). Get ready to level up your digital game with buttons that are as fun as a game of Whack-a-Mole, minus the mallet.`
      },
      {
        ref: "02",
        name: "UX research",
        description: `Want to know what your users are thinking without having to resort to mind-reading tricks? Allow me to introduce you to the world of UX research. I dive into the minds of your users, figuratively of course, to understand their wants, needs, and desires. It's like being a psychic for digital products, minus the crystal ball.`
      }
    ],
    [
      {
        ref: "03",
        name: "Analytics",
        description: `Ever felt like your data is a secret code, waiting to be cracked? Fear not! I'm your digital detective, armed with analytics tools sharper than Sherlock's magnifying glass. I'll unearth insights from your data that will make your competition jealous. We'll reveal more about your users than they reveal on their Tinder profiles.`
      },
      {
        ref: "04",
        name: "Heuristic evaluation",
        description: `If you've ever had the nagging feeling that something's off with your website or app, but you can't quite put your finger on it, that's where I come in. I'm the UX nitpicker extraordinaire! I'll scrutinize every pixel, button, and interaction to ensure your product follows the golden rules of usability. It's like having a digital perfectionist on your side, minus the snobby attitude.`
      }
    ]
  ];
  return renderTemplate`${maybeRenderHead()}<section class="py-16 sm:py-20 fade-up"><div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8"><div class="flex lg:flex-row flex-col lg:gap-32 md:gap-8 sm:gap-8 w-full lg:flex-nowrap sm:flex-wrap md:flex-wrap"><h2 class="text-3xl font-medium tracking-tight sm:text-4xl">Experties</h2><div class="grid gap-8 lg:grid-cols-2">${values.map((column, index) => renderTemplate`<div${addAttribute(["space-y-8", index === 1 && "lg:mt-16"], "class:list")}>${column.map((value) => renderTemplate`<div class="bg-primary-500/10 dark:bg-primary-400/10 flex flex-col gap-12 rounded-3xl px-6 py-8"><p class="text-sm">${value.ref}</p><div class="flex flex-col gap-4"><h3 class="text-xl font-medium">${value.name}</h3><p class="text-primary-950/70 dark:text-primary-200/70 text-base sm:text-lg">${value.description}</p></div></div>`)}</div>`)}</div></div></div></section>`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/components/about/Values.astro", void 0);

const $$Astro = createAstro();
const $$About = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$About;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "description": "UI/UX Designer with extensive knowledge and expertise in creating graphical user interfaces and user experiences.", "title": "CV \xB7 Maher Fayad" }, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "Heading", $$Heading, {})}${renderComponent($$result2, "Mission", $$Mission, {})}${renderComponent($$result2, "Team", $$Team, {})}${renderComponent($$result2, "Logos", $$Logos, {})}${renderComponent($$result2, "Values", $$Values, {})}` })}`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/pages/about.astro", void 0);

const $$file = "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/pages/about.astro";
const $$url = "/about";

const about = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { $$Logos as $, about as a };
