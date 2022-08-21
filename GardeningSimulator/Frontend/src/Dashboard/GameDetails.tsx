interface IGameDetailsProps {
    timerActive: boolean,
    timerUntilNextAction: number,
    timerUntilRotted: number
}

const GameDetails = (props: IGameDetailsProps) => {

    const { timerActive, timerUntilNextAction, timerUntilRotted } = props;

    return <div className="container">
        <div>
            <span>Timer enabled: </span>
            <span style={{ fontWeight: "bold" }}>{timerActive ? "Yes" : "No"}</span>
        </div>
        {timerActive && <div>
            <span>Wait time for next action after seed, watering, harvesting and level up: </span>
            <span style={{ fontWeight: "bold" }}>{timerUntilNextAction}</span>
        </div>
        }
        {timerActive && <div>
            <span>Time of no actions until plant is rotted after seed, watering, harvesting and level up: </span>
            <span style={{ fontWeight: "bold" }}>{timerUntilRotted}</span>
        </div>
        }
    </div>
}

export default GameDetails;