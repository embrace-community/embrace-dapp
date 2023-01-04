import {
  createReactClient,
  LivepeerConfig,
  Player,
  studioProvider,
} from "@livepeer/react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { PageState } from ".";
import { getFileUri } from "../../../lib/web3storage/getIpfsJsonContent";
import { Publication } from "../../../types/lens-generated";

export default function SocialPublicationDetail({
  setPageState,
  publication,
}: {
  setPageState: Dispatch<SetStateAction<{ type: PageState; data: string }>>;
  publication: Publication | undefined;
}) {
  console.log(publication, "publication");

  const livepeerClient = createReactClient({
    provider: studioProvider({
      apiKey: process.env.NEXT_PUBLIC_LIVEPEER_STUDIO_API_KEY,
    }),
  });

  return (
    <LivepeerConfig client={livepeerClient}>
      <div className="mt-8">
        <button
          className="btn"
          onClick={() =>
            setPageState({ type: PageState.Publications, data: "" })
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
            />
          </svg>
        </button>

        <div className="flex justify-between my-8">
          <h3 className="inline text-xl font-bold">
            {publication?.metadata?.name}
          </h3>
          <span>
            Created:{" "}
            {publication?.createdAt &&
              new Date(publication.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="rounded-lg border-gray-400 border-2"></div>

        <div className="mt-8">
          <ReactMarkdown>{publication?.metadata?.content}</ReactMarkdown>
          {publication?.metadata?.media?.map((media, index) => {
            return media?.original?.mimeType?.startsWith("image") ? (
              <Image
                key={`media${index}`}
                src={getFileUri(media?.original?.url.replaceAll("ipfs://", ""))}
                className="h-[450px] rounded-lg"
                alt="publication media"
              />
            ) : media?.original?.mimeType?.startsWith("video") ? (
              <div className="h-[450px] rounded-lg">
                <Player
                  key={`media${index}`}
                  src={media?.original?.url}
                  // title={name}
                  autoPlay={false}
                  objectFit="contain"
                  muted={false}
                  autoUrlUpload={{
                    fallback: true,
                    ipfsGateway: "https://cloudflare-ipfs.com",
                  }}
                />
              </div>
            ) : null;
          })}
        </div>
      </div>
    </LivepeerConfig>
  );
}
