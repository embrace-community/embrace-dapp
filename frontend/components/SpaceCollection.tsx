export default function SpaceCollection({ title, collection }: any) {
    return (
      <div className="w-full border-t-2 border-embracedark border-opacity-5 pb-14 flex flex-col">
        {title?
            <p className="text-embracedark text-opacity-20 text-sm mt-2 mb-8">{title}</p>
            :
            "no title"
        }
        <div className="flex flex-row">
        {collection?
            collection.map(collectionitem => {
                return(
                    <div className="w-48 flex flex-col items-center">
                        <div className="w-32 h-32 mb-5">
                            <img className="extrastyles-collectionitem-img w-full" src={collectionitem.img} />
                        </div>
                        <p className="text-embracedark font-semibold">{collectionitem.name}</p>
                    </div>
                )
            })
        :
        <></>
        }
        </div>
      </div>
    );
  }
  