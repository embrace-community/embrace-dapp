import Head from "next/head";
import Nav from "./Nav";

export default function AppLayout({ children, title }: any) {
  return (
    <>
      <Head>
        <title>Embrace Community</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Nav />
      <div className="min-h-full">
        <header className="bg-white shadow">
          <div className="mx-auto max-w-5xl py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              {title}
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-5xl py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
