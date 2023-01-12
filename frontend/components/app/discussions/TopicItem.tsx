import { Player } from "@livepeer/react";
import Link from "next/link";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import EnsAvatar from "../../EnsAvatar";

export default function TopicItem({
  id,
  includeContent = false,
  spaceId,
  handle,
  address,
  title,
  content,
  createdAt,
}) {
  const videos: string[] = [];

  const formatOutput = () => {
    let cleanContent = content.replaceAll("\\", "");

    // Parse videos
    const videoRegex = /VIDEO:\[.*\]/g;
    const videoMatches = cleanContent.match(videoRegex);
    if (videoMatches) {
      videoMatches.forEach((match) => {
        const videoUrl = match.split("[")[1].split("]")[0];

        // Add video to videos array
        videos.push(videoUrl);

        console.log("videoUrl", videoUrl);
        cleanContent = cleanContent.replace(videoRegex, "");
      });
    }

    return cleanContent;
  };

  return (
    <>
      <div
        className="rounded-lg border-gray-400 border-2 mt-2 p-4 mb-4 cursor-default shadow-xl"
        key={id}
      >
        <Link href={`/${handle}/discussions?id=${id}`}>
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="text-sm font-normal mt-1">
            <span className="flex">
              <span className="mr-1">added by</span>{" "}
              <EnsAvatar address={address} /> @ {createdAt}
            </span>
          </div>
        </Link>

        {includeContent && (
          <div className="text-md font-normal mt-1">
            <ReactMarkdown>{formatOutput()}</ReactMarkdown>

            {videos.map((videoUrl) => {
              return (
                <div
                  className="max-h-[450px] rounded-lg mb-2"
                  key={`media${videoUrl}`}
                >
                  <Player
                    src={videoUrl}
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
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
