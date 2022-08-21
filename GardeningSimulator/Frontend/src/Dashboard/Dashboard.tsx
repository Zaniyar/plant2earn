import { useEffect, useState } from "react";

import NftCard, { INftCard } from "./Card/NftCard";

import { useMoralis, useNFTBalances, useWeb3ExecuteFunction, Web3ExecuteFunctionParameters } from "react-moralis";
import { CHAIN, CONTRACT_ADDRESS } from "..";
import MintCard from "./Card/MintCard";
import { IDetails, ITokenURI } from "../Interfaces";
import { ABI_PLANT } from "../abi/abi_plant";
import "./Dashboard.css";
import Economics from "./Economics";
import GameDetails from "./GameDetails";
import Admin from "./Admin";

const Dashboard = () => {
    const { enableWeb3 } = useMoralis();

    const { fetch } = useWeb3ExecuteFunction();

    const { getNFTBalances } = useNFTBalances({ chain: CHAIN });

    const [refreshKey, setRefreshKey] = useState(0);
    const [timerActive, setTimerActive] = useState(true);
    const [timerUntilNextAction, setTimerUntilNextAction] = useState(0);
    const [timerUntilRotted, setTimerUntilRotted] = useState(0);

    const [nfts, setNfts] = useState<INftCard[]>([]);

    useEffect(() => {
        const fetchData = async () => {

            await enableWeb3();
            await getNFTBalances().then(async data => {
                const relevanTokens = data?.result?.filter(t => t.token_address.toLocaleLowerCase() === CONTRACT_ADDRESS.toLocaleLowerCase());
                console.log(relevanTokens);

                const nftListExtended: INftCard[] = [];

                await Promise.all((relevanTokens || []).map(async (nft) => {
                    const tokenId: string = nft.token_id;
                    const metadata: ITokenURI = JSON.parse(nft.metadata ?? "{}");

                    await loadDetails(tokenId).then((details: IDetails) => {
                        nftListExtended.push({
                            tokenId,
                            metadata,
                            details
                        })
                    })
                }))

                setNfts(nftListExtended.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId)));

                setTimerActive(await getIsTimerActive());
                setTimerUntilNextAction(await getTimeUntilNextAction());
                setTimerUntilRotted(await getTimeUntilRotted());
            });
        };
        fetchData();
    }, [refreshKey]);


    async function loadDetails(tokenId: string): Promise<IDetails> {

        const defaultOptions = {
            abi: ABI_PLANT,
            contractAddress: CONTRACT_ADDRESS,
        }

        const detailsOptions: Web3ExecuteFunctionParameters = {
            ...defaultOptions,
            functionName: "getDetails",
            params: {
                tokenId: tokenId,
            },
        };

        return await fetch({ params: detailsOptions }).then((d: any) => {
            const details: IDetails = {
                level: d && d["level"],
                harvestCounter: d && d["harvestCounter"],
                wateringCounter: d && d["wateringCounter"],
                lastActionTimestamp: d && d["lastActionTimestamp"]
            };
            return details;
        });
    }

    async function getIsTimerActive(): Promise<boolean> {
        const defaultOptions = {
            abi: ABI_PLANT,
            contractAddress: CONTRACT_ADDRESS,
        }

        const timerActiveOptions: Web3ExecuteFunctionParameters = {
            ...defaultOptions,
            functionName: "getIsTimerActive",
        }

        await enableWeb3();
        return await fetch({ params: timerActiveOptions }).then((val: any) => {
            return val ?? true;
        });
    }


    async function getTimeUntilNextAction(): Promise<number> {
        const defaultOptions = {
            abi: ABI_PLANT,
            contractAddress: CONTRACT_ADDRESS,
        }

        const timerActionOptions: Web3ExecuteFunctionParameters = {
            ...defaultOptions,
            functionName: "getTimeUntilNextAction",
        }

        await enableWeb3();
        return await fetch({ params: timerActionOptions }).then((val: any) => {
            return val?.toNumber() ?? 0;
        });
    }

    async function getTimeUntilRotted(): Promise<number> {
        const defaultOptions = {
            abi: ABI_PLANT,
            contractAddress: CONTRACT_ADDRESS,
        }

        const timerRottedOptions: Web3ExecuteFunctionParameters = {
            ...defaultOptions,
            functionName: "getTimeUntilRotted",
        }

        await enableWeb3();
        return await fetch({ params: timerRottedOptions }).then((val: any) => {
            return val?.toNumber() ?? 0;
        });
    }

    const delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));
    const handleRefresh = async (tokenId: string) => {
        console.log(refreshKey);
        // Refresh the effect by incrementing 1
        await delay(1000);
        setRefreshKey(oldKey => oldKey + 1)
    };

    return <div>
        <Admin timerActive={timerActive} onAction={handleRefresh} />
        <GameDetails timerActive={timerActive} timerUntilNextAction={timerUntilNextAction} timerUntilRotted={timerUntilRotted} />
        <Economics externalRefreshKey={refreshKey} />
        <div style={{ paddingLeft: "5px" }}>
            <button onClick={() => handleRefresh("0")}>Refetch NFT Balances</button>
        </div>
        <div className="dashboard-container">
            {nfts.map(nft =>
                <NftCard
                    key={nft.tokenId}
                    tokenId={nft.tokenId}
                    metadata={nft.metadata}
                    details={nft.details}
                    onAction={handleRefresh}
                    timerActive={timerActive}
                    timerUntilNextAction={timerUntilNextAction}
                    timerUntilRotted={timerUntilRotted}
                />)
            }
            <MintCard onAction={handleRefresh} />
        </div>
    </div>
}

export default Dashboard;
