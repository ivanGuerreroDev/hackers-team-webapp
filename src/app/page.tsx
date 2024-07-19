import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Hackers</h1>
      <Image
        src="/images/team-logo.png"
        alt="Hackers Logo"
        width={300}
        height={300}
      />
      <h2 className="text-2xl font-bold">Bienvenido al sitio web del equipo.</h2>
    </main>
  );
}
