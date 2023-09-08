/* empty css                         */import { c as createAstro, a as createComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute, s as spreadAttributes, u as unescapeHTML, d as renderComponent, e as renderSlot, f as renderHead } from '../astro_4846160c.mjs';
import 'clsx';

const $$Astro$b = createAstro();
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$Footer;
  const bottomLinks = [
    {
      header: " ",
      links: [
        {
          name: "Linkedin",
          href: "https://www.linkedin.com/in/maherfayad/",
          isExternal: true
        },
        {
          name: "Upwork",
          href: "https://www.upwork.com/fl/maherfayad55",
          isExternal: true
        },
        {
          name: "Dribbble",
          href: "https://dribbble.com/MaherFayad",
          isExternal: true
        }
      ]
    },
    {
      header: "  ",
      links: [
        {
          name: "Home",
          href: "/",
          isExternal: false
        },
        {
          name: "CV",
          href: "/about",
          isExternal: false
        },
        {
          name: "Contact",
          href: "/contact",
          isExternal: false
        }
      ]
    }
    // {
    //   header: 'Legal',
    //   links: [
    //     {
    //       name: 'Privacy',
    //       href: '/privacy',
    //       isExternal: false,
    //     },
    //     {
    //       name: '404',
    //       href: '/404',
    //       isExternal: false,
    //     },
    //     {
    //       name: 'Styleguide',
    //       href: '/styleguide',
    //       isExternal: false,
    //     },
    //   ],
    // },
  ];
  return renderTemplate`${maybeRenderHead()}<footer class="bg-primary-500/10 dark:bg-primary-400/10 mt-16 py-16 lg:mt-20 lg:py-20" aria-labelledby="footer-heading"><h2 id="footer-heading" class="sr-only">Footer</h2><div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8"><div class="flex flex-col justify-between gap-12 sm:gap-16 lg:flex-row"><div class="flex max-w-sm flex-col items-start gap-6 sm:gap-8"><img class="h-8 w-auto" width="65" height="40" :src="$store.theme.isDark ? '/assets/logo-inverted.svg' : '/assets/logo.svg'" alt="Stone"><p class="text-primary-950/70 dark:text-primary-200/70 text-base">
maher fayad is an experienced UI/UX Designer with extensive
          knowledge and expertise in creating graphical user interfaces and user experiences.
</p><!-- <p class="text-primary-950/70 dark:text-primary-200/70 text-sm">© 2023 Stone</p> --></div><!-- Bottom links --><div class="grid max-w-xl flex-1 grid-cols-1 gap-8 sm:grid-cols-2">${bottomLinks.map((group) => renderTemplate`<div class="flex flex-col gap-4"><p class="text-base font-medium">${group.header}</p><ul role="list" class="flex flex-col gap-3">${group.links.map((link) => renderTemplate`<li><a${addAttribute(link.href, "href")} class="focus-visible:outline-primary-950 dark:focus-visible:outline-primary-200 inline-flex items-center gap-1 rounded-md text-base hover:underline focus-visible:outline focus-visible:outline-2"${addAttribute(link.isExternal ? "_blank" : void 0, "target")}${addAttribute(link.isExternal ? "noopener" : void 0, "rel")}>${link.name}${link.isExternal && renderTemplate`<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6H10ZM21 3V11H19L18.9999 6.413L11.2071 14.2071L9.79289 12.7929L17.5849 5H13V3H21Z"></path></svg>`}</a></li>`)}</ul></div>`)}</div></div></div></footer>`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/components/layout/Footer.astro", void 0);

const $$Astro$a = createAstro();
const $$Header = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$Header;
  const links = [
    {
      ref: "01",
      name: "Home",
      href: "/"
    },
    {
      ref: "02",
      name: "CV",
      href: "/about"
    },
    {
      ref: "03",
      name: "Contact",
      href: "/contact"
    }
  ];
  return renderTemplate`${maybeRenderHead()}<header x-data="{ open: false }" class="transition" :class="{ 'bg-primary-500/10 dark:bg-primary-400/10': open, 'bg-primary-50 dark:bg-primary-900': !(open) }"><div class="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6 lg:max-w-7xl lg:px-8"><!-- Brand logo --><div class="flex"><a href="/" class="focus-visible:outline-primary-900 dark:group-focus-visible:outline-primary-200 rounded-md focus-visible:outline focus-visible:outline-2"><span class="sr-only">Maher Fayad</span><img class="h-8 w-auto" width="65" height="40" :src="$store.theme.isDark ? '/assets/logo-inverted.svg' : '/assets/logo.svg'" alt="Stone"></a></div><!-- Actions --><div class="-mr-2 flex items-center space-x-2 sm:space-x-2"><!-- Toggle theme mode
      <button
        type="button"
        class="text-primary-950 dark:text-primary-200 hover:bg-primary-500/10 dark:hover:bg-primary-400/10 ring-primary-950 inline-flex h-14 w-14 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2"
        x-data
        @click="$store.theme.toggle()"
      >
        <span class="sr-only">Toggle theme mode</span>
        <svg
          x-cloak
          class="h-6 w-6"
          :class="{ 'hidden': !($store.theme.isDark) }"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"
          ></path>
        </svg>
        <svg
          x-cloak
          class="h-6 w-6"
          :class="{ 'hidden': $store.theme.isDark }"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M10 6C10 10.4183 13.5817 14 18 14C19.4386 14 20.7885 13.6203 21.9549 12.9556C21.4738 18.0302 17.2005 22 12 22C6.47715 22 2 17.5228 2 12C2 6.79948 5.9698 2.52616 11.0444 2.04507C10.3797 3.21152 10 4.56142 10 6ZM4 12C4 16.4183 7.58172 20 12 20C14.9654 20 17.5757 18.3788 18.9571 15.9546C18.6407 15.9848 18.3214 16 18 16C12.4772 16 8 11.5228 8 6C8 5.67863 8.01524 5.35933 8.04536 5.04293C5.62119 6.42426 4 9.03458 4 12ZM18.1642 2.29104L19 2.5V3.5L18.1642 3.70896C17.4476 3.8881 16.8881 4.4476 16.709 5.16417L16.5 6H15.5L15.291 5.16417C15.1119 4.4476 14.5524 3.8881 13.8358 3.70896L13 3.5V2.5L13.8358 2.29104C14.5524 2.1119 15.1119 1.5524 15.291 0.835829L15.5 0H16.5L16.709 0.835829C16.8881 1.5524 17.4476 2.1119 18.1642 2.29104ZM23.1642 7.29104L24 7.5V8.5L23.1642 8.70896C22.4476 8.8881 21.8881 9.4476 21.709 10.1642L21.5 11H20.5L20.291 10.1642C20.1119 9.4476 19.5524 8.8881 18.8358 8.70896L18 8.5V7.5L18.8358 7.29104C19.5524 7.1119 20.1119 6.5524 20.291 5.83583L20.5 5H21.5L21.709 5.83583C21.8881 6.5524 22.4476 7.1119 23.1642 7.29104Z"
          ></path>
        </svg>
      </button> --><!-- Toggle menu --><button type="button" class="text-primary-950 dark:text-primary-200 hover:bg-primary-500/10 dark:hover:bg-primary-400/10 ring-primary-950 inline-flex h-14 w-14 min-w-max items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2" @click="open = !open" @mousedown="if (open) $event.preventDefault()" aria-controls="website-menu" aria-expanded="false" :aria-expanded="open.toString()"><span class="sr-only">Toggle menu</span><svg x-cloak class="h-8 w-8" :class="{ 'hidden': open, 'block': !(open) }" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 8H5V10H19V8ZM19 14H5V16H19V14Z"></path></svg><svg x-cloak class="h-8 w-8" :class="{ 'block': open, 'hidden': !(open) }" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.0007 10.5865L16.9504 5.63672L18.3646 7.05093L13.4149 12.0007L18.3646 16.9504L16.9504 18.3646L12.0007 13.4149L7.05093 18.3646L5.63672 16.9504L10.5865 12.0007L5.63672 7.05093L7.05093 5.63672L12.0007 10.5865Z"></path></svg></button><a href="/contact" class="text-center whitespace-nowrap px-4 bg-primary-600 dark:bg-primary-200 hover:bg-primary-700 dark:hover:bg-primary-300 focus-visible:outline-primary-600 dark:focus-visible:outline-primary-400 dark:text-primary-950 inline-flex items-center justify-center rounded-full border border-transparent py-1 text-base font-medium text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Say hi
</a></div></div><!-- Menu content --><div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8" id="website-menu" x-cloak x-show="open" x-collapse x-collapse.duration.500ms><div class="grid grid-cols-1 gap-16 pb-24 pt-6 lg:grid-cols-2 lg:pt-12"><div class="bg-primary-500/10 dark:bg-primary-400/10 hidden items-center justify-center rounded-3xl px-6 py-8 lg:flex"><p class="text-primary-900/70 dark:text-primary-200/70 max-w-sm text-xl italic leading-loose"><span class="text-3xl">“  I don’t help people with horse
            problems, I help horses with
            people problems. "</span><br><span class="text-lg small"><br>Robert Redford - Horse Whisperer movie.</span></p></div><!-- Navigation --><nav class="divide-primary-900/10 dark:divide-primary-300/10 flex flex-col gap-1 divide-y ">${links.map((link) => renderTemplate`<a${addAttribute(link.href, "href")} class="text-primary-950 dark:text-primary-200 group inline-flex py-6 text-3xl font-medium tracking-tight transition focus-visible:outline-none sm:py-8 sm:text-4xl"><div class="group-focus-visible:outline-primary-950 dark:group-focus-visible:outline-primary-200 flex flex-1 items-center justify-between rounded-3xl group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2"><div class="flex items-center gap-6"><span class="text-xs">${link.ref}</span><span class="group-hover:underline">${link.name}</span></div><svg class="text-primary-600 dark:text-primary-400 h-6 w-6 sm:h-8 sm:w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.0037 9.41421L7.39712 18.0208L5.98291 16.6066L14.5895 8H7.00373V6H18.0037V17H16.0037V9.41421Z"></path></svg></div></a>`)}</nav></div></div></header>`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/components/layout/Header.astro", void 0);

const $$Astro$9 = createAstro();
const $$OpenGraphArticleTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$OpenGraphArticleTags;
  const { publishedTime, modifiedTime, expirationTime, authors, section, tags } = Astro2.props.openGraph.article;
  return renderTemplate`${publishedTime ? renderTemplate`<meta property="article:published_time"${addAttribute(publishedTime, "content")}>` : null}${modifiedTime ? renderTemplate`<meta property="article:modified_time"${addAttribute(modifiedTime, "content")}>` : null}${expirationTime ? renderTemplate`<meta property="article:expiration_time"${addAttribute(expirationTime, "content")}>` : null}${authors ? authors.map((author) => renderTemplate`<meta property="article:author"${addAttribute(author, "content")}>`) : null}${section ? renderTemplate`<meta property="article:section"${addAttribute(section, "content")}>` : null}${tags ? tags.map((tag) => renderTemplate`<meta property="article:tag"${addAttribute(tag, "content")}>`) : null}`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/node_modules/astro-seo/src/components/OpenGraphArticleTags.astro", void 0);

const $$Astro$8 = createAstro();
const $$OpenGraphBasicTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$OpenGraphBasicTags;
  const { openGraph } = Astro2.props;
  return renderTemplate`<meta property="og:title"${addAttribute(openGraph.basic.title, "content")}><meta property="og:type"${addAttribute(openGraph.basic.type, "content")}><meta property="og:image"${addAttribute(openGraph.basic.image, "content")}><meta property="og:url"${addAttribute(openGraph.basic.url || Astro2.url.href, "content")}>`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/node_modules/astro-seo/src/components/OpenGraphBasicTags.astro", void 0);

const $$Astro$7 = createAstro();
const $$OpenGraphImageTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$OpenGraphImageTags;
  const { image } = Astro2.props.openGraph.basic;
  const { secureUrl, type, width, height, alt } = Astro2.props.openGraph.image;
  return renderTemplate`<meta property="og:image:url"${addAttribute(image, "content")}>${secureUrl ? renderTemplate`<meta property="og:image:secure_url"${addAttribute(secureUrl, "content")}>` : null}${type ? renderTemplate`<meta property="og:image:type"${addAttribute(type, "content")}>` : null}${width ? renderTemplate`<meta property="og:image:width"${addAttribute(width, "content")}>` : null}${height ? renderTemplate`<meta property="og:image:height"${addAttribute(height, "content")}>` : null}${alt ? renderTemplate`<meta property="og:image:alt"${addAttribute(alt, "content")}>` : null}`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/node_modules/astro-seo/src/components/OpenGraphImageTags.astro", void 0);

const $$Astro$6 = createAstro();
const $$OpenGraphOptionalTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$OpenGraphOptionalTags;
  const { optional } = Astro2.props.openGraph;
  return renderTemplate`${optional.audio ? renderTemplate`<meta property="og:audio"${addAttribute(optional.audio, "content")}>` : null}${optional.description ? renderTemplate`<meta property="og:description"${addAttribute(optional.description, "content")}>` : null}${optional.determiner ? renderTemplate`<meta property="og:determiner"${addAttribute(optional.determiner, "content")}>` : null}${optional.locale ? renderTemplate`<meta property="og:locale"${addAttribute(optional.locale, "content")}>` : null}${optional.localeAlternate?.map((locale) => renderTemplate`<meta property="og:locale:alternate"${addAttribute(locale, "content")}>`)}${optional.siteName ? renderTemplate`<meta property="og:site_name"${addAttribute(optional.siteName, "content")}>` : null}${optional.video ? renderTemplate`<meta property="og:video"${addAttribute(optional.video, "content")}>` : null}`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/node_modules/astro-seo/src/components/OpenGraphOptionalTags.astro", void 0);

const $$Astro$5 = createAstro();
const $$ExtendedTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$ExtendedTags;
  const { props } = Astro2;
  return renderTemplate`${props.extend.link?.map((attributes) => renderTemplate`<link${spreadAttributes(attributes)}>`)}${props.extend.meta?.map(({ content, httpEquiv, media, name, property }) => renderTemplate`<meta${addAttribute(content, "content")}${addAttribute(httpEquiv, "http-equiv")}${addAttribute(media, "media")}${addAttribute(name, "name")}${addAttribute(property, "property")}>`)}`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/node_modules/astro-seo/src/components/ExtendedTags.astro", void 0);

const $$Astro$4 = createAstro();
const $$TwitterTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$TwitterTags;
  const { card, site, title, creator, description, image, imageAlt } = Astro2.props.twitter;
  return renderTemplate`${card ? renderTemplate`<meta name="twitter:card"${addAttribute(card, "content")}>` : null}${site ? renderTemplate`<meta name="twitter:site"${addAttribute(site, "content")}>` : null}${title ? renderTemplate`<meta name="twitter:title"${addAttribute(title, "content")}>` : null}${image ? renderTemplate`<meta name="twitter:image"${addAttribute(image, "content")}>` : null}${imageAlt ? renderTemplate`<meta name="twitter:image:alt"${addAttribute(imageAlt, "content")}>` : null}${description ? renderTemplate`<meta name="twitter:description"${addAttribute(description, "content")}>` : null}${creator ? renderTemplate`<meta name="twitter:creator"${addAttribute(creator, "content")}>` : null}`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/node_modules/astro-seo/src/components/TwitterTags.astro", void 0);

const $$Astro$3 = createAstro();
const $$LanguageAlternatesTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$LanguageAlternatesTags;
  const { languageAlternates } = Astro2.props;
  return renderTemplate`${languageAlternates.map((alternate) => renderTemplate`<link rel="alternate"${addAttribute(alternate.hrefLang, "hreflang")}${addAttribute(alternate.href, "href")}>`)}`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/node_modules/astro-seo/src/components/LanguageAlternatesTags.astro", void 0);

const $$Astro$2 = createAstro();
const $$SEO = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$SEO;
  Astro2.props.surpressWarnings = true;
  function validateProps(props) {
    if (props.openGraph) {
      if (!props.openGraph.basic || (props.openGraph.basic.title ?? void 0) == void 0 || (props.openGraph.basic.type ?? void 0) == void 0 || (props.openGraph.basic.image ?? void 0) == void 0) {
        throw new Error(
          "If you pass the openGraph prop, you have to at least define the title, type, and image basic properties!"
        );
      }
    }
    if (props.title && props.openGraph?.basic.title) {
      if (props.title == props.openGraph.basic.title && !props.surpressWarnings) {
        console.warn(
          "WARNING(astro-seo): You passed the same value to `title` and `openGraph.optional.title`. This is most likely not what you want. See docs for more."
        );
      }
    }
    if (props.openGraph?.basic?.image && !props.openGraph?.image?.alt && !props.surpressWarnings) {
      console.warn(
        "WARNING(astro-seo): You defined `openGraph.basic.image`, but didn't define `openGraph.image.alt`. This is stongly discouraged.'"
      );
    }
  }
  validateProps(Astro2.props);
  let updatedTitle = "";
  if (Astro2.props.title) {
    updatedTitle = Astro2.props.title;
    if (Astro2.props.titleTemplate) {
      updatedTitle = Astro2.props.titleTemplate.replace(/%s/g, updatedTitle);
    }
  } else if (Astro2.props.titleDefault) {
    updatedTitle = Astro2.props.titleDefault;
  }
  return renderTemplate`${updatedTitle ? renderTemplate`<title>${unescapeHTML(updatedTitle)}</title>` : null}${Astro2.props.charset ? renderTemplate`<meta${addAttribute(Astro2.props.charset, "charset")}>` : null}<link rel="canonical"${addAttribute(Astro2.props.canonical || Astro2.url.href, "href")}>${Astro2.props.description ? renderTemplate`<meta name="description"${addAttribute(Astro2.props.description, "content")}>` : null}<meta name="robots"${addAttribute(`${Astro2.props.noindex ? "noindex" : "index"}, ${Astro2.props.nofollow ? "nofollow" : "follow"}`, "content")}>${Astro2.props.openGraph && renderTemplate`${renderComponent($$result, "OpenGraphBasicTags", $$OpenGraphBasicTags, { ...Astro2.props })}`}${Astro2.props.openGraph?.optional && renderTemplate`${renderComponent($$result, "OpenGraphOptionalTags", $$OpenGraphOptionalTags, { ...Astro2.props })}`}${Astro2.props.openGraph?.image && renderTemplate`${renderComponent($$result, "OpenGraphImageTags", $$OpenGraphImageTags, { ...Astro2.props })}`}${Astro2.props.openGraph?.article && renderTemplate`${renderComponent($$result, "OpenGraphArticleTags", $$OpenGraphArticleTags, { ...Astro2.props })}`}${Astro2.props.twitter && renderTemplate`${renderComponent($$result, "TwitterTags", $$TwitterTags, { ...Astro2.props })}`}${Astro2.props.extend && renderTemplate`${renderComponent($$result, "ExtendedTags", $$ExtendedTags, { ...Astro2.props })}`}${Astro2.props.languageAlternates && renderTemplate`${renderComponent($$result, "LanguageAlternatesTags", $$LanguageAlternatesTags, { ...Astro2.props })}`}`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/node_modules/astro-seo/src/SEO.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro$1 = createAstro();
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Layout;
  const { description, title } = Astro2.props;
  return renderTemplate(_a || (_a = __template([`<html lang="en" x-cloak x-data :class="{ 'dark': $store.theme.isDark }"><head><script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"><\/script><script type="text/javascript">
         (function () {
           emailjs.init("EX_A9-j_JtnnH7oPd");
         })();
       <\/script>`, '<meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"><link rel="manifest" href="/site.webmanifest"><meta name="generator"', '><meta name="description"', '><meta property="og:title" content="Maher Fayad"><meta property="og:description" content="maher fayad is an experienced UI/UX Designer with extensive knowledge and expertise in creating graphical user interfaces and user experiences."><meta property="og:image" content="/assets/Maher.png"><title>', '</title><!-- Google Tag Manager --><!-- End Google Tag Manager --><!-- Google tag (gtag.js) --><script async src="https://www.googletagmanager.com/gtag/js?id=G-4FMQJ9VWF9"><\/script><!-- Hotjar Tracking Code for Maher Fayad -->', '</head><body class="bg-primary-50 text-primary-900 dark:bg-primary-900 dark:text-primary-200 antialiased transition"><!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W8V75P2Q" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) --><div class="bg-opacity-100 bg-primary-50 dark:bg-opacity-100 dark:bg-primary-900 sticky top-0 z-50 ">', "</div><main>", "</main>", "</body></html>"])), renderComponent($$result, "SEO", $$SEO, { "title": "Maher Fayad", "titleTemplate": "Maher Fayad", "titleDefault": "Maher Fayad", "description": "maher fayad is an experienced UI/UX Designer with extensive knowledge and expertise in creating graphical user interfaces and user experiences.      ", "openGraph": {
    basic: {
      title: "Maher Fayad Portfolio",
      type: "title",
      image: "/assets/Maher.png"
    }
  }, "twitter": {
    creator: "MaherFayad"
  }, "extend": {
    // extending the default link tags
    link: [{ rel: "icon", href: "/assets/Maher.png" }],
    // extending the default meta tags
    meta: [
      {
        name: "twitter:image",
        content: "/assets/Maher.png"
      },
      { name: "twitter:title", content: "Maher Fayad" },
      { name: "twitter:description", content: "maher fayad is an experienced UI/UX Designer with extensive knowledge and expertise in creating graphical user interfaces and user experiences." }
    ]
  } }), addAttribute(Astro2.generator, "content"), addAttribute(description, "content"), title, renderHead(), renderComponent($$result, "Header", $$Header, {}), renderSlot($$result, $$slots["default"]), renderComponent($$result, "Footer", $$Footer, {}));
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/layouts/Layout.astro", void 0);

const $$Astro = createAstro();
const $$404 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$404;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "description": "Page not found. Please check the URL in the address bar and try again.", "title": "Not found" }, { "default": ($$result2) => renderTemplate`${maybeRenderHead()}<section class="py-16 sm:py-20"><div class="flex lg:flex-row flex-col-reverse gap-20 mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8"><div class="flex flex-col items-start gap-8 sm:gap-10"><div class="flex flex-col gap-4 sm:gap-6"><h1 class="text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl"><div>404</div><div>Page not found</div></h1><p class="text-primary-950/70 dark:text-primary-200/70 text-lg sm:text-xl">
Please check the URL in the address bar and try again.
</p></div><a href="/" class="text-center whitespace-nowrap px-4 bg-primary-600 dark:bg-primary-200 hover:bg-primary-700 dark:hover:bg-primary-300 focus-visible:outline-primary-600 dark:focus-visible:outline-primary-400 dark:text-primary-950 inline-flex items-center justify-center rounded-full border border-transparent py-1 text-base font-medium text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Back home
</a></div><img src="/assets/404.svg" width="600"></div></section>` })}`;
}, "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/pages/404.astro", void 0);

const $$file = "D:/Front end/Portfolio-Last/astro-theme-stone/Astro/src/pages/404.astro";
const $$url = "/404";

const _404 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { $$Layout as $, _404 as _ };
