import Link from "next/link";

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="font-bold">
          Builder Registry
        </Link>
      </div>
    </header>
  );
}
