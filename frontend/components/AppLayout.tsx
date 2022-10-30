import Head from "next/head";
import Nav from "./Nav";

export default function AppLayout({ children, title }: any) {
  return (
    <div className="bg-embracebg min-h-screen">
      <Head>
        <title>Embrace Community</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Nav />
      <div className="min-h-full w-full">
        <main>
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
