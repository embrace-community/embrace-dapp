# Embrace

This is a mono-repo which will include both the contracts and frontend...

## Contracts

### Goerli

#### deployments

```
EmbraceApps deployed to:  0x148B94D622c2Ac3abfb550AEaF48F25F105EA18b

EmbraceSpaces deployed to:  0x3706a43642eC170E9E5e57fa3929FAD854A8fC4E

EmbraceAccounts deployed to:  0x53D4D0FFf2d9c62Ac51f15856eaB323802845A6b
```

### Cronos

#### deployments

```
EmbraceApps deployed to:  0x148B94D622c2Ac3abfb550AEaF48F25F105EA18b

EmbraceSpaces deployed to:  0x53D4D0FFf2d9c62Ac51f15856eaB323802845A6b

EmbraceAccounts deployed to:  0x3706a43642eC170E9E5e57fa3929FAD854A8fC4E
```

#### deps

`cd contracts && yarn`

#### tests

`cd contracts && yarn test`

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
