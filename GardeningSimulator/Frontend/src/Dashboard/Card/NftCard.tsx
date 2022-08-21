import { useEffect, useState } from "react";
import { operations } from "moralis/types/generated/web3Api";
import { useMoralis, useMoralisWeb3Api, useWeb3ExecuteFunction, Web3ExecuteFunctionParameters } from "react-moralis";
import { CHAIN, CONTRACT_ADDRESS, MAX_WATERING_COUNTER, SEEDING_PRICE, WATERING_PRICE } from "../..";
import { ABI_PLANT } from "../../abi/abi_plant";
import { IDetails, ITokenURI } from "../../Interfaces";
import "./Card.css";

export interface INftCard {
    tokenId: string,
    metadata: ITokenURI,
    details: IDetails
}

interface INftCardAction {
    onAction: (tokenId: string) => void;
}

interface ITimer {
    timerActive: boolean,
    timerUntilNextAction: number,
    timerUntilRotted: number
}

const NftCard = (props: INftCard & INftCardAction & ITimer) => {

    const [actionPending, setActionPending] = useState<boolean>(false);
    const [now, setNow] = useState<Date>(new Date());

    const { Web3API } = useMoralisWeb3Api();
    const { enableWeb3 } = useMoralis();
    const { fetch } = useWeb3ExecuteFunction();

    const { tokenId, metadata, details, onAction, timerActive, timerUntilNextAction, timerUntilRotted } = props;
    const { image, attributes } = metadata;

    const metaDataOutOfSync = details.level !== parseInt((attributes || []).find(a => a.trait_type === "Level")?.value ?? "-1") || details.harvestCounter !== parseInt((attributes || []).find(a => a.trait_type === "HarvestCounter")?.value ?? "-1");


    useEffect(() => {
        const timer = setTimeout(() => {
            setNow(new Date());
            //   console.log(now);
        }, 15000);

        return () => clearTimeout(timer);
    });

    const defaultOptions = {
        abi: ABI_PLANT,
        contractAddress: CONTRACT_ADDRESS,
    }

    const onSeedClick = async () => {
        setActionPending(true);
        const seedOptions: Web3ExecuteFunctionParameters = {
            ...defaultOptions,
            functionName: "seed",
            params: {
                tokenId: tokenId,
            },
            msgValue: SEEDING_PRICE
        }

        await enableWeb3();
        await fetch({ params: seedOptions }).then(tx => {
            console.log(tx);
            if (tx === undefined) {
                setActionPending(false);
                return;
            }
            (tx as any).wait().then(async (finalTx: any) => {
                console.log(finalTx);
                await reSyncMetadata();
                setActionPending(false);
                onAction(tokenId);
            });
        });
    }

    const onWaterClick = async () => {
        setActionPending(true);
        const waterOptions: Web3ExecuteFunctionParameters = {
            ...defaultOptions,
            functionName: "water",
            params: {
                tokenId: tokenId,
            },
            msgValue: WATERING_PRICE
        }

        await enableWeb3();
        await fetch({ params: waterOptions })
            .then(tx => {
                if (tx === undefined) {
                    setActionPending(false);
                    return;
                }
                (tx as any).wait().then(async (finalTx: any) => {
                    console.log(finalTx);
                    setActionPending(false);
                    onAction(tokenId);
                });
            })
    }

    const onLevelUpClick = async () => {
        setActionPending(true);
        const levelUpOptions: Web3ExecuteFunctionParameters = {
            ...defaultOptions,
            functionName: "levelUp",
            params: {
                tokenId: tokenId,
            },
        }

        await enableWeb3();
        await fetch({ params: levelUpOptions }).then(tx => {
            console.log(tx);
            if (tx === undefined) {
                setActionPending(false);
                return;
            }
            (tx as any).wait().then(async (finalTx: any) => {
                console.log(finalTx);
                setActionPending(false);
                onAction(tokenId);
                await reSyncMetadata();
            });
        });
    }

    const onHarvestClick = async () => {
        setActionPending(true);
        const harvestOptions: Web3ExecuteFunctionParameters = {
            ...defaultOptions,
            functionName: "harvest",
            params: {
                tokenId: tokenId,
            },
        }

        await enableWeb3();
        await fetch({ params: harvestOptions }).then(tx => {
            console.log(tx);
            if (tx === undefined) {
                setActionPending(false);
                return;
            }
            (tx as any).wait().then(async (finalTx: any) => {
                console.log(finalTx);
                setActionPending(false);
                onAction(tokenId);
                await reSyncMetadata();
            });
        });
    }

    const reSyncMetadata = async () => {
        const syncOptionsUri: operations["reSyncMetadata"]["parameters"]["query"] & operations["reSyncMetadata"]["parameters"]["path"] = {
            chain: CHAIN,
            address: CONTRACT_ADDRESS,
            token_id: tokenId,
            flag: "uri",
        };

        await Web3API.token.reSyncMetadata(syncOptionsUri).then(tx => {
            console.log(tx);
        });
    }

    const isSeeded = details.level !== 0;
    const isRipe = details.wateringCounter === MAX_WATERING_COUNTER;

    const lastActionDate = new Date((details?.lastActionTimestamp?.toNumber() ?? 0) * 1000);
    const lastActionDateString = lastActionDate.toISOString();

    const nextActionDate = new Date(lastActionDate.getTime());
    nextActionDate.setSeconds(nextActionDate.getSeconds() + timerUntilNextAction);;
    const nextActionDateString = nextActionDate.toISOString();

    const rottingDate = new Date(lastActionDate.getTime());
    rottingDate.setSeconds(rottingDate.getSeconds() + timerUntilRotted);;
    const rottingDateString = rottingDate.toISOString();

    const plantRotted = timerActive ? isSeeded && now > rottingDate : false;
    const actionPossible = timerActive ? !plantRotted && now > nextActionDate : true;

    return <div className="card">
        {plantRotted && <div className="card-rotted">rotted</div>}
        <div className="card-image-container">
            <img className="card-image" src={image} alt={`Plant ${tokenId}`} />
            {/* {svg} */}
        </div>
        {isSeeded && timerActive && <div className="card-timer-container">
            <div>Last Action: {lastActionDateString}</div>
            <div>Action possible: {nextActionDateString}</div>
            <div>Plant rotted at: {rottingDateString}</div>
        </div>
        }
        <div className="card-body">
            <h5 className="card-title">{`Plant ${tokenId}`}</h5>
            <div className="card-trait-container">
                <div className="card-trait">Watered: {details.wateringCounter}</div>
                <div className="card-trait">Level: {details.level}</div>
                <div className="card-trait">Harvested: {details.harvestCounter}</div>
            </div>
            {!actionPending && !plantRotted && actionPossible &&
                <div className="card-actions">
                    {!isSeeded && <button className="card-action" onClick={onSeedClick}>Seed</button>}
                    {isSeeded && !isRipe && <button className="card-action" onClick={onWaterClick}>Water</button>}
                    {isSeeded && isRipe && <button className="card-action" onClick={onLevelUpClick}>LevelUp</button>}
                    {isSeeded && isRipe && <button className="card-action" onClick={onHarvestClick}>Harvest</button>}
                </div>
            }
            {plantRotted && <div className="card-action">Rotted, no action possible anymore</div>}
            {!plantRotted && !actionPossible && <div className="card-action">Wait for next action {timerUntilNextAction} seconds</div>}
            {actionPending && <div className="card-action">Action is being perfromed</div>}
        </div>
        {metaDataOutOfSync && <div className="card-metadata-sync">!</div>}
        {metaDataOutOfSync && <button className="card-metadata-reload" onClick={reSyncMetadata}>&#x21bb;</button>}
    </div>
}

const svg =
    <svg className="card-image" width="256" height="512" fill="#83502e" viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg">
        <line x1="128" y1="374.98039215686276" x2="10" y2="349.98039215686276" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="369.9607843137255" x2="244" y2="344.9607843137255" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="364.94117647058823" x2="14" y2="339.94117647058823" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="359.921568627451" x2="240" y2="334.921568627451" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="354.90196078431376" x2="18" y2="329.90196078431376" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="349.8823529411765" x2="236" y2="324.8823529411765" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="344.8627450980392" x2="22" y2="319.8627450980392" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="339.843137254902" x2="232" y2="314.843137254902" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="334.82352941176475" x2="26" y2="309.82352941176475" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="329.8039215686275" x2="228" y2="304.8039215686275" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="324.7843137254902" x2="30" y2="299.7843137254902" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="319.764705882353" x2="224" y2="294.764705882353" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="314.74509803921575" x2="34" y2="289.74509803921575" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="309.7254901960785" x2="220" y2="284.7254901960785" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="304.7058823529412" x2="38" y2="279.7058823529412" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="299.686274509804" x2="216" y2="274.686274509804" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="294.66666666666674" x2="42" y2="269.66666666666674" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="289.6470588235295" x2="212" y2="264.6470588235295" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="284.62745098039227" x2="46" y2="259.62745098039227" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="279.607843137255" x2="208" y2="254.60784313725497" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="274.58823529411774" x2="50" y2="249.58823529411774" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="269.5686274509805" x2="204" y2="244.5686274509805" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="264.5490196078432" x2="54" y2="239.5490196078432" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="259.52941176470597" x2="200" y2="234.52941176470597" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="254.50980392156873" x2="58" y2="229.50980392156873" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="249.4901960784315" x2="196" y2="224.4901960784315" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="244.47058823529423" x2="62" y2="219.47058823529423" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="239.450980392157" x2="192" y2="214.450980392157" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="234.43137254901973" x2="66" y2="209.43137254901973" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="229.4117647058825" x2="188" y2="204.4117647058825" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="224.39215686274522" x2="70" y2="199.39215686274522" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="219.372549019608" x2="184" y2="194.372549019608" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="214.35294117647075" x2="74" y2="189.35294117647075" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="209.33333333333348" x2="180" y2="184.33333333333348" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="204.31372549019625" x2="78" y2="179.31372549019625" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="199.29411764705898" x2="176" y2="174.29411764705898" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="194.27450980392175" x2="82" y2="169.27450980392175" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="189.25490196078448" x2="172" y2="164.25490196078448" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="184.23529411764724" x2="86" y2="159.23529411764724" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="179.21568627450998" x2="168" y2="154.21568627450998" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="174.19607843137274" x2="90" y2="149.19607843137274" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="169.17647058823547" x2="164" y2="144.17647058823547" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="164.15686274509824" x2="94" y2="139.15686274509824" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="159.13725490196097" x2="160" y2="134.13725490196097" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="154.11764705882374" x2="98" y2="129.11764705882374" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="149.09803921568647" x2="156" y2="124.09803921568647" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="144.07843137254923" x2="102" y2="119.07843137254923" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="139.058823529412" x2="152" y2="114.058823529412" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="134.03921568627473" x2="106" y2="109.03921568627473" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="129.0196078431375" x2="148" y2="104.01960784313749" strokeWidth="2" stroke="green"></line>
        <line x1="128" y1="380" x2="128" y2="124.00000000000023" strokeWidth="2" stroke="green"></line><polygon points="60,380 196,380 176,500 80,500" strokeLinejoin="round" strokeWidth="5" stroke="black"></polygon>
    </svg>

export default NftCard;
