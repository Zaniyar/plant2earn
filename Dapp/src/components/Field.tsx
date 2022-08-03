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
    return <div>
        {
            trees.map((tree: IDetails) => {
                return <Tree {...tree}/>
            })
        }
    </div>
}

export default Field;