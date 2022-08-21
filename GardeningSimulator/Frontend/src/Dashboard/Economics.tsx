// import Moralis from "moralis/types";
import { useEffect, useState } from "react";
import { useMoralis, useNativeBalance, useWeb3ExecuteFunction, Web3ExecuteFunctionParameters } from "react-moralis";
import { CHAIN, CONTRACT_ADDRESS } from "..";
import { ABI_PLANT } from "../abi/abi_plant";

interface IEconomicsProps {
    externalRefreshKey: number
}

const Economics = (props: IEconomicsProps) => {
    const { Moralis } = useMoralis();
    const { enableWeb3 } = useMoralis();
    const { fetch } = useWeb3ExecuteFunction();

    const [actionPending, setActionPending] = useState<boolean>(false);

    const [refreshKey, setRefreshKey] = useState(0);

    const [contractBalance, setContractBalance] = useState("0");
    const [userBalance, setUserBalance] = useState("0");

    const [userTokenBalance, setUserTokenBalance] = useState(0);
    const [tokenPrice, setTokenPrice] = useState(0);


    let { getBalances: getContractBalances } = useNativeBalance({ chain: CHAIN, address: CONTRACT_ADDRESS });
    let { getBalances: getUserBalances } = useNativeBalance({ chain: CHAIN });


    useEffect(() => {
        const fetchData = async () => {
            await getContractBalances().then(r => {
                setContractBalance(r?.balance ?? "0");
            });

            await getUserBalances().then(r => {
                setUserBalance(r?.balance ?? "0");
            });

            await getDistributedTokensOfAddress().then((tokenBalance: number) => {
                setUserTokenBalance(tokenBalance)
            });

            await calculateTokenPrice().then((tokenPrice: number) => {
                setTokenPrice(tokenPrice)
            });
        };
        fetchData();
    }, [refreshKey, props.externalRefreshKey]);

    async function getDistributedTokensOfAddress(): Promise<number> {
        const defaultOptions = {
            abi: ABI_PLANT,
            contractAddress: CONTRACT_ADDRESS,
        }

        const distributedTokensOptions: Web3ExecuteFunctionParameters = {
            ...defaultOptions,
            functionName: "getDistributedTokensOfAddress",
        }

        await enableWeb3();
        return await fetch({ params: distributedTokensOptions }).then((val: any) => {
            return val?.toNumber() ?? 0;
        });
    }

    async function calculateTokenPrice(): Promise<number> {
        const defaultOptions = {
            abi: ABI_PLANT,
            contractAddress: CONTRACT_ADDRESS,
        }

        const tokenPriceOptions: Web3ExecuteFunctionParameters = {
            ...defaultOptions,
            functionName: "calculateTokenPrice",
        }

        await enableWeb3();
        return await fetch({ params: tokenPriceOptions }).then((val: any) => {
            return val?.toNumber() ?? 0;
        });
    }

    async function sellTokens() {
        setActionPending(true);
        const defaultOptions = {
            abi: ABI_PLANT,
            contractAddress: CONTRACT_ADDRESS,
        }

        const sellOptions: Web3ExecuteFunctionParameters = {
            ...defaultOptions,
            functionName: "sellTokens",
            params: {
                tokenAmount: userTokenBalance,
            },
        }

        await enableWeb3();
        await fetch({ params: sellOptions }).then((tx: any) => {
            console.log(tx);
            if (tx === undefined) {
                setActionPending(false);
                return;
            }
            (tx as any).wait().then(async (finalTx: any) => {
                console.log(finalTx);
                setActionPending(false);
                handleRefresh("0")
            });
        });
    }


    const delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));
    const handleRefresh = async (tokenId: string) => {
        // Refresh the effect by incrementing 1
        await delay(100);
        setRefreshKey(oldKey => oldKey + 1)
    };

    return <div className="container">
        <div>Project Balance: {Moralis?.Units?.FromWei(contractBalance, 18)}</div>
        <div>Your Balance: {Moralis?.Units?.FromWei(userBalance, 18)}</div>
        <div>Your harvested Balance: {userTokenBalance}
            {!actionPending && userTokenBalance > 0 && <button onClick={sellTokens}>Sell</button>}
            {actionPending && <span> Action is being perfromed</span>}
        </div>
        <div>Token Price: {Moralis?.Units?.FromWei(tokenPrice, 18)}</div>
        <button onClick={() => handleRefresh("0")}>Refetch</button>
    </div>
}

export default Economics;