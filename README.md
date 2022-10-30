# Embrace

This is a mono-repo which includes both the contracts and frontend.

## Presentation

[Google Slides](https://docs.google.com/presentation/d/1S9ExAmx9alB77exgWNN5q_Pj4qTKXJ5-44fDco_qy-s)

## Design

[Figma Design](https://www.figma.com/proto/sEmV82YmSN96KVMeIUcuh0/Embrace.community?node-id=15%3A1107&scaling=scale-down-width&page-id=0%3A1&starting-point-node-id=9%3A646)

## Frontend

[Deployed Frontend](embrace-community.vercel.app)

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
