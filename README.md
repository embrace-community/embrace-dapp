# Embrace

This is a mono-repo which includes both the contracts and frontend.

## Presentation & Design

[Google Slides](https://docs.google.com/presentation/d/1S9ExAmx9alB77exgWNN5q_Pj4qTKXJ5-44fDco_qy-s)

[Figma Design](https://www.figma.com/proto/sEmV82YmSN96KVMeIUcuh0/Embrace.community?node-id=15%3A1107&scaling=scale-down-width&page-id=0%3A1&starting-point-node-id=9%3A646)

## Team

Martin <martin@openskydevelopment.co.uk>
Ben <info@bennisan.be>
Tobias <caruso33@web.de>

## Bounties

- IPFS / FileCoin
  - web3.storage - Community Space & Discussion metadata - [Link to implementation example](https://github.com/embrace-community/embrace-dapp/blob/main/frontend/pages/space/create.tsx#L92)
  - Ceramic - Discussion data - [Link to implementation example](https://github.com/embrace-community/embrace-dapp/blob/main/frontend/components/app/discussion/DiscussionTopicComments.tsx#L49)
- WalletConnect - Connection - [Link to implementation example](https://github.com/embrace-community/embrace-dapp/blob/cb548f65a461ea185a93b17856cac7d4a4dbd2ae/frontend/components/Nav.tsx#L48) (unfortunately later had to be replaced because of issues with cronos & goerli networks - `Error: underlying network changed`)
- Cronos - Deployment - [Link to implementation example](https://github.com/embrace-community/embrace-dapp/blob/52a85b467531a8981903eb8aedee7b2278cf2efe/contracts/hardhat.config.ts#L40) (unfortunately had to be replaced later because of wallet connection & deployment issues to cronos)

## Frontend

[Deployed Frontend](https://embrace-community.vercel.app)

### Run

`cd frontend && cp .env.example .env.local` - fill envs

`cd frontend && yarn` - install deps

`cd frontend && yarn dev` - run frontend in dev mode

## Contracts

#### Deployments

#### Goerli

```
EmbraceApps deployed to:  0x98F535f286Db7b425266E6432c9A11989aFdCbfc

EmbraceSpaces deployed to:  0x23A21A1572288d0DFF9E8005cEeaF657F9bBdcad

EmbraceAccounts deployed to:  0x53D4D0FFf2d9c62Ac51f15856eaB323802845A6b
```

#### Cronos

```
EmbraceApps deployed to:  0x148B94D622c2Ac3abfb550AEaF48F25F105EA18b

EmbraceSpaces deployed to:  0x53D4D0FFf2d9c62Ac51f15856eaB323802845A6b

EmbraceAccounts deployed to:  0x3706a43642eC170E9E5e57fa3929FAD854A8fC4E
```

### Run

`cd contracts && yarn` - install deps

`cd contracts && yarn test` - run tests

#### deploy

##### locally

`cd contracts && yarn run node` - run your local node
`cd contracts && yarn deploy` - deploy all contracts locally

##### cronos testnet

`cd contracts && yarn deploy:cro:test` - deploy all contracts to cronos testnet

This might fail, depending which contracts weren't deployed, there are the single commands as well:

`cd contracts && yarn deploy:apps:cro:test` - deploy EmbraceApps contract to cronos testnet
`cd contracts && yarn deploy:spaces:cro:test` - deploy EmbraceSpaces contract to cronos testnet
`cd contracts && yarn deploy:accounts:cro:test` - deploy EmbraceAccounts contract to cronos testnet
