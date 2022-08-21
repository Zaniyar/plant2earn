import { useMoralis } from "react-moralis";
import Dashboard from './Dashboard/Dashboard';

const App = () => {

    const { authenticate, isAuthenticated, isAuthenticating, logout } = useMoralis();

    const login = async () => {
        if (!isAuthenticated) {

            await authenticate({ signingMessage: "Log in using Moralis" })
                .then(async function (user) {
                    console.log("logged in user:", user);
                    console.log(user!.get("ethAddress"));
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }

    const logOut = async () => {
        await logout();
        console.log("logged out");
    }

    return (
        <div>
            <h1>Gardening Simulator</h1>
            <div style={{ paddingLeft: "5px" }}>
                <button onClick={login}>Login</button>
                <button onClick={logOut} disabled={isAuthenticating}>Logout</button>
            </div>
            {isAuthenticated && <Dashboard />}
        </div>
    );
}

export default App;