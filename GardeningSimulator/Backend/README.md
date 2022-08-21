# Blockchain Backend

## Credits
Credits to the [OniiChain project source](https://github.com/maximebrugel/OniiChain), which code helped a lot to implement readable solidity code for the `on chain` svg generation.

## Pre Conditions
- VsCode
    - `Solidity` Extension
- Backend dependencies, like hardhat
    - run `npm install` to install all dev dependencies
        - in the terminal from the current Folder(play2earn/GardeningSimulator/Backend)

## Run Tests
- run `npx hardhat test`
    - in the terminal from the current Folder(play2earn/GardeningSimulator/Backend)
- run `npx hardhat coverage`
    - in the terminal from the current Folder(play2earn/GardeningSimulator/Backend)

## Deploy Contract to Rinkeby
- Prerequisites: `Metamask` account with `matic address` and test `test matic`
- Open Remix and create the contracts `Plant.sol` and `PlantDrawer.sol`
- Deploy first the `PlantDrawer.sol` and then use the address of the created contract for the creation of the `Plant.sol`
    -To deploy to the rinkeby testnet, use `Injected Web3` as Environment and choose the `Matic Chain` in `Metamask`

## Documentation
- A code documentation can be found [here](./docs/index.md) 