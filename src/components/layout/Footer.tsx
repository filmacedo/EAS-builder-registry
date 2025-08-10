import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t mt-16 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          {/* Credits - Left aligned */}
          <div className="flex flex-col items-center md:items-start">
            <p className="text-sm">
              Vibe coded by{" "}
              <a
                href="https://x.com/0xmacedo"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                macedo.eth
              </a>
              {", with data from "}
              <a
                href="https://talentprotocol.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                Talent Protocol
              </a>
              {" and "}
              <a
                href="https://attest.sh"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                EAS
              </a>
            </p>
          </div>

          {/* Links - Left aligned on mobile, right aligned on desktop */}
          <div className="flex gap-6 w-full md:w-auto justify-start md:justify-end">
            {/* <a
              href="https://app.deform.cc/form/3c9a7879-2a22-426a-ab89-eba8c6055204"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              Join as Builder
            </a> */}
            <a
              href="https://talentprotocol.notion.site/buildersday2025-partners?pvs=4"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              Become a Partner
            </a>
            <a
              href="https://talentprotocol.notion.site/Builder-Registry-FAQ-1cbfc9bb5319805a9643c9c91f318d8d?pvs=4"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              FAQ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
