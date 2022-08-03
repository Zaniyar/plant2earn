import { IDetails } from "../interfaces";
import Tree from "./Tree";

const trees: IDetails[] = [
    {
        level: 0,
        harvestCounter: 0,
        wateringCounter: 0,
        lastActionTimestamp: Date.now(),
    },
    {
        level: 0,
        harvestCounter: 0,
        wateringCounter: 0,
        lastActionTimestamp: Date.now(),
    },
    {
        level: 0,
        harvestCounter: 0,
        wateringCounter: 0,
        lastActionTimestamp: Date.now(),
    },
    {
        level: 0,
        harvestCounter: 0,
        wateringCounter: 0,
        lastActionTimestamp: Date.now(),
    },
    {
        level: 0,
        harvestCounter: 0,
        wateringCounter: 0,
        lastActionTimestamp: Date.now(),
    }
]

const Field = () => {
    return <>
        {
            trees.map((tree: IDetails, index: number) => {
                // return <Tree {...tree}/>
                return <Tree key={index} position={[0,-2,0]} />
            })
        }
    </>
}

export default Field;