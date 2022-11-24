import Head from "next/head";
import Nav from "./Nav";

export default function AppLayout({ children, title }: any) {
  return (
    <div className="bg-embracebg min-h-screen flex flex-col items-start justify-start">
      <Head>
        <title>Embrace Community: {title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Nav />
      <div className="w-full flex flex-1 flex-col justify-start items-start">
        {children}
      </div>
    </div>
  );
}
