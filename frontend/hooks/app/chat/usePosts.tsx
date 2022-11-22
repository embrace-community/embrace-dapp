import { gql, useQuery } from "@apollo/client";

function useGetOwnPosts(currentPage: number) {
  const { loading, data } = useQuery(GET_MY_POSTS, {
    variables: {
      page: currentPage,
    },
    context: { clientName: "lens" },
  });
}

const GET_MY_POSTS = gql`
  query ExploreProfiles {
    exploreProfiles(request: { sortCriteria: MOST_FOLLOWERS }) {
      items {
        id
        name
        bio
        handle
        picture {
          ... on MediaSet {
            original {
              url
            }
          }
        }
        stats {
          totalFollowers
        }
      }
    }
  }
`;

export { useGetOwnPosts };
