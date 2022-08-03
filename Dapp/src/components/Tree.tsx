import { IDetails } from "../interfaces";
import Field from "./Field";

const Tree = (props: IDetails) => {
    return <div>
        { JSON.stringify(props)}
    </div>
}

export default Tree;