import Head from "next/head";
import Nav from "./Nav";

export default function AppLayout({ children, title }: any) {
  return (
    <div className="bg-white min-h-screen flex flex-col justify-start items-stretch content-stretch">
      <Head>
        <title>Embrace Community</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Nav />
      <div className="min-h-full w-full bg-embracebg">
        <main>
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
