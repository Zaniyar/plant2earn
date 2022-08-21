# React Frontend

## Pre Conditions
- VsCode
- React and Moralis dependencies
    - run `npm install` to install all dev dependencies    
        - in the terminal from the current Folder(GardeningSimulator/Frontend)
- Moralis CLI  
    -run `npm install -g moralis-admin-cli`
        - in the terminal from the current Folder(GardeningSimulator/Frontend) (doesn't really matter since it is installed globally with the flag -g)

## Run locally
1. First deploy the backend smart contract to the rinkeby chain and replace the `CONTRACT_ADDRESS` in the `index.tsx` file.
    - A Contract should already be deployed
        - CONTRACT_ADDRESS = "0x90CC6a405740E6229f2a4A04C74C4E65a1f0631E"
2. Create a Moralis Server under `https://admin.moralis.io/servers` and replace the `SERVER_URL` and `APP_ID` in the `index.tsx` file.
    - A Server and App in Moralis should already be available
        - SERVER_URL = "https://ut01tiub6zvr.usemoralis.com:2053/server"
        - APP_ID = "5GbBhVnTO74hE7okMwcD9GaMfAIwwoBCsR7q7Fyt"
3. Run `npm run start`
    - in the terminal from the current Folder(GardeningSimulator/Frontend)

## Deployment Website
1. Build website
    1. run `npm run build`
        - in the terminal from the current Folder(GardeningSimulator/Frontend)
    2. navigate into the directory where `index.html` is stored
        - Folder(GardeningSimulator/Frontend/build)

2. Run `moralis-admin-cli deploy` in the terminal from the current Folder(GardeningSimulator/Frontend/build)
    1. Api Key MqZ91FhyMvKEjQg
    2. Secret 33i6jVcJGVN4uPH
    3. Choose server 0

## Interaction
- Since the `SmartContract` is deployed on the `Matic testnet` a `Metamask Wallet` with a `Matic address` and some `test matic` is needed to perform actions