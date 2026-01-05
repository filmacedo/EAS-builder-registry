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

        </div>
      </div>
    </footer>
  );
}
