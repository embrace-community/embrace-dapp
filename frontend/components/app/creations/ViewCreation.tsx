import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import Button from "../../Button";

export default function ViewCreation({ id }: { id: string }) {
  const router = useRouter();

  const creation = {
    id: 1,
    title: "This is an image of a tree",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce et faucibus arcu, ac pharetra neque. Nulla ut nisi sodales, viverra magna vel, elementum sapien. Nullam hendrerit urna eu diam fermentum pretium. Cras et massa tempus, ultrices quam eget, convallis risus. Curabitur eu leo risus. Suspendisse semper arcu ac pretium lacinia. Praesent magna mi, efficitur at quam at, porttitor tincidunt lacus. Donec malesuada nunc sed nunc porta cursus. Pellentesque accumsan laoreet diam, ac luctus orci ullamcorper ut. Proin faucibus ipsum libero, pellentesque rutrum ex pellentesque sit amet.",
    source:
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80",
  };

  return (
    <>
      <Button
        additionalClassName="p-2 mb-5"
        buttonProps={{ onClick: () => router.back() }}
      >
        Back
      </Button>

      <div className="w-full flex justify-center">
        <Image
          src={creation.source}
          alt={creation.title}
          width="0"
          height="0"
          sizes="100vw"
          className="w-auto h-auto"
        />
      </div>

      <div className="w-full flex justify-center">
        <h1 className="text-2xl font-bold">{creation.title}</h1>
      </div>

      <div className="w-full flex justify-center">
        <p className="text-sm">{creation.description}</p>
      </div>
    </>
  );
}
