import { ArrowUpRight, Building2, Camera, Code2, Mail, MapPin, Phone } from "lucide-react";

const phoneNumbers = [
  { display: "0100 9347346", href: "tel:+201009347346" },
  { display: "01124648145", href: "tel:+201124648145" }
];
const contactEmails = [process.env.ADMIN_EMAIL, "Mmtextile863@gmail.com"].filter(
  (email): email is string => Boolean(email)
);

export function SiteFooter() {
  return (
    <footer className="relative left-1/2 mt-16 w-[100dvw] max-w-[100dvw] -translate-x-1/2 border-t border-[#16436f]/18 bg-[#e9eef3] text-[#16436f]">
      <div className="mx-auto grid w-full max-w-[1840px] gap-10 px-4 py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.8fr)_minmax(280px,0.8fr)] lg:gap-14 lg:py-16">
        <div className="grid content-between gap-8">
          <div className="flex items-center gap-3 text-[#16436f]">
            <span className="grid h-11 w-11 shrink-0 place-items-center border border-[#16436f]/25" aria-hidden="true">
              <Building2 size={21} strokeWidth={1.7} />
            </span>
            <p className="m-0 text-xs font-black uppercase">Egyptian textile quality</p>
          </div>
          <h2 className="m-0 max-w-3xl text-[clamp(3.2rem,7vw,8rem)] font-black uppercase leading-[0.82] text-[#16436f]">
            MM Textile
          </h2>
        </div>

        <div>
          <p className="m-0 mb-5 text-xs font-black uppercase text-[#526984]">Contact</p>
          <div className="grid border-t border-[#16436f]/14">
            {phoneNumbers.map((phone) => (
              <a
                key={phone.href}
                href={phone.href}
                className="group flex min-h-16 items-center gap-3 border-b border-[#16436f]/14 py-3 text-lg font-black text-[#16436f] no-underline transition-colors hover:text-[#37506f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16436f]"
              >
                <Phone className="shrink-0 text-[#16436f]" size={19} strokeWidth={1.8} aria-hidden="true" />
                <span>{phone.display}</span>
                <ArrowUpRight className="ml-auto shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={18} aria-hidden="true" />
              </a>
            ))}
            {contactEmails.map((email) => (
              <a
                key={email}
                href={`mailto:${email}`}
                className="group flex min-h-16 items-center gap-3 border-b border-[#16436f]/14 py-3 text-lg font-black text-[#16436f] no-underline transition-colors hover:text-[#37506f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16436f]"
              >
                <Mail className="shrink-0 text-[#16436f]" size={19} strokeWidth={1.8} aria-hidden="true" />
                <span className="break-all">{email}</span>
                <ArrowUpRight className="ml-auto shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={18} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <address className="not-italic">
          <p className="m-0 mb-5 text-xs font-black uppercase text-[#526984]">Visit us</p>
          <div className="flex gap-4 border-y border-[#16436f]/14 py-5">
            <MapPin className="mt-1 shrink-0 text-[#16436f]" size={22} strokeWidth={1.8} aria-hidden="true" />
            <div>
              <p className="m-0 text-lg font-black uppercase text-[#16436f]">El Mahalla El Kubra</p>
              <p className="m-0 mt-1 text-base text-[#526984]">Damro Road, Egypt</p>
            </div>
          </div>
        </address>
      </div>

      <div className="border-t border-[#16436f]/14">
        <div className="mx-auto flex w-full max-w-[1840px] flex-wrap items-center justify-between gap-3 px-4 py-4 text-[0.68rem] font-black uppercase text-[#60738d]">
          <span>&copy; 2026 MM Textile</span>
          <span>El Mahalla El Kubra</span>
        </div>
      </div>

      <div className="border-t border-[#16436f]/12 bg-[#dde5ed]">
        <div className="mx-auto flex w-full max-w-[1840px] flex-wrap items-center justify-between gap-4 px-4 py-4">
          <p className="m-0 text-xs font-black uppercase text-[#526984]">
            Developed by <span className="text-[#16436f]">Adham Al-Rifaie</span>
          </p>
          <div className="flex items-center gap-2" aria-label="Developer social links">
            <a
              className="inline-flex min-h-10 items-center gap-2 border border-[#16436f]/18 px-3 text-xs font-black uppercase text-[#16436f] no-underline transition hover:border-[#16436f] hover:bg-[#16436f] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#16436f]"
              href="https://github.com/AdhamAl-Rifaie"
              target="_blank"
              rel="noreferrer"
            >
              <Code2 size={16} strokeWidth={1.8} aria-hidden="true" />
              GitHub
            </a>
            <a
              className="inline-flex min-h-10 items-center gap-2 border border-[#16436f]/18 px-3 text-xs font-black uppercase text-[#16436f] no-underline transition hover:border-[#16436f] hover:bg-[#16436f] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#16436f]"
              href="https://www.instagram.com/adhamalrifaie/"
              target="_blank"
              rel="noreferrer"
            >
              <Camera size={16} strokeWidth={1.8} aria-hidden="true" />
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
