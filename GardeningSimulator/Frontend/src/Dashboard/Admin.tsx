import { useState } from "react";
import { useMoralis, useWeb3ExecuteFunction, Web3ExecuteFunctionParameters } from "react-moralis";
import { CONTRACT_ADDRESS } from "..";
import { ABI_PLANT } from "../abi/abi_plant";

interface IAdminProps {
    timerActive: boolean,
    onAction: (tokenId: string) => void;
}

const Admin = (props: IAdminProps) => {
    const { enableWeb3 } = useMoralis();
    const { fetch } = useWeb3ExecuteFunction();

    const [actionPending, setActionPending] = useState<boolean>(false);

    const { timerActive, onAction } = props;

    async function onTimerActiveClick(): Promise<void> {
        setActionPending(true);
        const defaultOptions = {
            abi: ABI_PLANT,
            contractAddress: CONTRACT_ADDRESS,
        }

        const timerActiveOptions: Web3ExecuteFunctionParameters = {
            ...defaultOptions,
            functionName: "setIsTimerActive",
            params: {
                active: !timerActive,
            },
        }

        await enableWeb3();
        await fetch({ params: timerActiveOptions }).then((tx: any) => {
            console.log(tx);
            if (tx === undefined) {
                setActionPending(false);
                return;
            }
            (tx as any).wait().then(async (finalTx: any) => {
                console.log(finalTx);
                setActionPending(false);
                onAction("0");
            });
        });
    }

    return <div className="container">
        <span>Admin function: </span>
        {!actionPending && <button onClick={onTimerActiveClick}>{timerActive ? "turn off" : "turn on"}</button>}
        {actionPending && <span>Action is being perfromed</span>}
    </div>
}

export default Admin;