import { EmbraceSpace } from "../../utils/types";

export default function Header({ space }: { space: any }) {
  return (
    <div className="w-full flex flex-col justify-start text-embracedark extrastyles-specialpadding2">
      <div className="w-full flex flex-row justify-start items-end border-b-2 border-embracedark border-opacity-5 mb-12">
        <img
          className="w-28 h-28 extrastyles-border-radius extrastyles-negmarg"
          src={space?.metadata?.image}
        />
        <div className="mb-6 ml-7">
          <h1 className="font-semibold text-2xl">{space?.metadata?.name}</h1>
          <div className="w-full flex flex-row mt-1 text-sm">
            <p className="text-embracedark text-opacity-50 mx-3  mt-4px">
              {space?.memberCount} Members
            </p>
          </div>
          <div className="w-full flex flex-row mt-1 text-sm">
            <p className="text-embracedark text-opacity-50 mx-3  mt-4px">
              {space?.metadata?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
