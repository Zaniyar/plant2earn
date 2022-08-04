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
                const zPos = Math.floor(index/5)*3;
                const xPos = (index-5*Math.floor(index/5))*3;
                const yPos = 0;
                console.log(xPos, yPos, zPos);
                const position = [xPos, yPos, zPos]
                return <Tree key={index} position={position} />
            })
        }
    </>
}

export default Field;