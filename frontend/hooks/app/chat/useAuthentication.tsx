export {};
// import { gql } from "@apollo/client";
// import {
//   CreateProfileRequest,
//   SignedAuthChallenge,
// } from "../../../types/lens-generated";

// function useAuthentication(reqParams: SignedAuthChallenge = {}) {
//   const { address, isConnected, isConnecting, isDisconnected } = useAccount();

//   const shouldCallApi =
//     !address || !isConnected || isConnecting || isDisconnected;

//   const request: SignedAuthChallenge = {
//     ownedBy: [address],
//     ...reqParams,
//   };

//   const result = useQuery<ProfilesQuery, { request: SignedAuthChallenge }>(
//     CHALLENGE,
//     {
//       variables: { request },
//       context: { clientName: "lens" },
//       skip: !shouldCallApi,
//     },
//   );

//   const profiles = result?.data?.profiles;

//   return profiles as Auth | undefined;
// }

// const CHALLENGE = gql`
//   query Challenge($address: EthereumAddress!) {
//     challenge(request: { address: $address }) {
//       text
//     }
//   }
// `;

// const AUTHENTICATE = gql`
//   mutation Authenticate($address: EthereumAddress!, $signature: Signature!) {
//     authenticate(request: { address: $address, signature: $signature }) {
//       accessToken
//       refreshToken
//     }
//   }
// `;
