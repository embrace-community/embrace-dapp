import { TypedDataDomain } from "ethers";

export function getSignature(typedData: {
  domain: TypedDataDomain;
  types: Record<string, any>;
  value: Record<string, any>;
}) {
  const formattedTypedData = {
    domain: omit(typedData.domain, "__typename"),
    types: omit(typedData.types, "__typename"),
    value: omit(typedData.value, "__typename"),
  };

  console.log("create post: getSignature", formattedTypedData);
  return formattedTypedData;
}

const omit = (object: Record<string, any>, name: string) => {
  delete object[name];
  return object;
};
