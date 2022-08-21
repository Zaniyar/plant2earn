import { useState } from "react";
import { useMoralis, useWeb3ExecuteFunction, Web3ExecuteFunctionParameters } from "react-moralis";
import { CONTRACT_ADDRESS, SELL_PRICE, } from "../..";
import { ABI_PLANT } from "../../abi/abi_plant";
import "./Card.css";

interface IMintCardAction {
    onAction: (tokenId: string) => void;
}

const MintCard = (props: IMintCardAction) => {

    const [isMinting, setIsMinting] = useState<boolean>(false);

    const { enableWeb3 } = useMoralis();
    const { fetch } = useWeb3ExecuteFunction();

    const { onAction } = props;

    const defaultOptions = {
        abi: ABI_PLANT,
        contractAddress: CONTRACT_ADDRESS,
    }

    const onMintClick = async () => {
        setIsMinting(true);

        const mintOptions: Web3ExecuteFunctionParameters = {
            ...defaultOptions,
            functionName: "mint",
            msgValue: SELL_PRICE
        }

        await enableWeb3();
        await fetch({ params: mintOptions }).then(tx => {
            console.log(tx);
            if(tx === undefined){
                setIsMinting(false);
                return;
            }
            (tx as any).wait().then(async (finalTx: any) => {
                setIsMinting(false);
                onAction("0");
                console.log(finalTx);
            });
        });
    }

    return <div className="card card-center" >
        <div>
            {isMinting ?
                <div className="card-action">...is minting new Seed</div> :
                <button className="card-action" onClick={onMintClick}>Mint new Seed</button>
            }
        </div>
    </div>
}

export default MintCard;
