# 1 install

yarn global add @graphprotocol/graph-cli

# 2 Init

*you will need the Mumbai contracts deployed first*
At this stage the embrace communities contract will be indexed first (with metadata ipfs mapping)
Then, the dynamic contract for embrace Community needs to be indexed

graph init --product hosted-service embrace-community/embrace-community-mumbai --index-events

graph codegen && graph build (In directory)

# 3 publish

graph auth --product hosted-service *key*

graph deploy --product hosted-service embrace-community/embrace-community-mumbai
