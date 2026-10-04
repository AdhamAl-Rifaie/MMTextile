import { ArrowUpRight, Building2, Camera, Code2, MapPin, Phone } from "lucide-react";

const phoneNumbers = [
  { display: "0100 9347346", href: "tel:+201009347346" },
  { display: "01124648145", href: "tel:+201124648145" }
];

export function SiteFooter() {
  return (
    <footer className="relative left-1/2 mt-16 w-[100dvw] max-w-[100dvw] -translate-x-1/2 border-t border-[#f1c85b]/45 bg-black/55 text-[#f7f0de]">
      <div className="mx-auto grid w-full max-w-[1840px] gap-10 px-4 py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.8fr)_minmax(280px,0.8fr)] lg:gap-14 lg:py-16">
        <div className="grid content-between gap-8">
          <div className="flex items-center gap-3 text-[#f1c85b]">
            <span className="grid h-11 w-11 shrink-0 place-items-center border border-[#f1c85b]/50" aria-hidden="true">
              <Building2 size={21} strokeWidth={1.7} />
            </span>
            <p className="m-0 text-xs font-black uppercase">Egyptian textile quality</p>
          </div>
          <h2 className="m-0 max-w-3xl text-[clamp(3.2rem,7vw,8rem)] font-black uppercase leading-[0.82] text-[#f1c85b]">
            MM Textile
          </h2>
        </div>

        <div>
          <p className="m-0 mb-5 text-xs font-black uppercase text-[#b8aa8a]">Contact</p>
          <div className="grid border-t border-white/15">
            {phoneNumbers.map((phone) => (
              <a
                key={phone.href}
                href={phone.href}
                className="group flex min-h-16 items-center gap-3 border-b border-white/15 py-3 text-lg font-black text-white no-underline transition-colors hover:text-[#f1c85b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f1c85b]"
              >
                <Phone className="shrink-0 text-[#f1c85b]" size={19} strokeWidth={1.8} aria-hidden="true" />
                <span>{phone.display}</span>
                <ArrowUpRight className="ml-auto shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={18} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <address className="not-italic">
          <p className="m-0 mb-5 text-xs font-black uppercase text-[#b8aa8a]">Visit us</p>
          <div className="flex gap-4 border-y border-white/15 py-5">
            <MapPin className="mt-1 shrink-0 text-[#f1c85b]" size={22} strokeWidth={1.8} aria-hidden="true" />
            <div>
              <p className="m-0 text-lg font-black uppercase text-white">El Mahalla El Kubra</p>
              <p className="m-0 mt-1 text-base text-[#c6c1b5]">Damro Road, Egypt</p>
            </div>
          </div>
        </address>
      </div>

      <div className="border-t border-[#f1c85b]/25">
        <div className="mx-auto flex w-full max-w-[1840px] flex-wrap items-center justify-between gap-3 px-4 py-4 text-[0.68rem] font-black uppercase text-[#8f866f]">
          <span>&copy; 2026 MM Textile</span>
          <span>El Mahalla El Kubra</span>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#070705]">
        <div className="mx-auto flex w-full max-w-[1840px] flex-wrap items-center justify-between gap-4 px-4 py-4">
          <p className="m-0 text-xs font-black uppercase text-[#b8aa8a]">
            Developed by <span className="text-[#f1c85b]">Adham Al-Rifaie</span>
          </p>
          <div className="flex items-center gap-2" aria-label="Developer social links">
            <a
              className="inline-flex min-h-10 items-center gap-2 border border-white/15 px-3 text-xs font-black uppercase text-white no-underline transition hover:border-[#f1c85b] hover:text-[#f1c85b] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#f1c85b]"
              href="https://github.com/AdhamAl-Rifaie"
              target="_blank"
              rel="noreferrer"
            >
              <Code2 size={16} strokeWidth={1.8} aria-hidden="true" />
              GitHub
            </a>
            <a
              className="inline-flex min-h-10 items-center gap-2 border border-white/15 px-3 text-xs font-black uppercase text-white no-underline transition hover:border-[#f1c85b] hover:text-[#f1c85b] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#f1c85b]"
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
