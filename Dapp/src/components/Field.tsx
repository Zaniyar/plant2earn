import { IDetails } from "../interfaces";
import Tree from "./Tree";
interface IFieldProps {
    tree: IDetails;
}

const Field = (props: IFieldProps) => {

    const { tree } = props;

    const zPos = 0;
    const xPos = 0;
    const yPos = 0;
    const position = [xPos, yPos, zPos]



    return <>
        <Tree position={position} {...tree}/>
    </>
}

export default Field;