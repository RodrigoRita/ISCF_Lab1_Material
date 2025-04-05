import { useSession,signIn,signOut } from "next-auth/react";
import {Avatar} from "@mui/material";

const Login = () => {
    const { data: session }=useSession();

    if(session){
        return <>
        Signed in as {session?.user?.email} <br/>
        <p>Welcome {session?.user?.name}</p> <br/>
        <Avatar alt={session?.user?.name} src={session?.user?.image}/> <br/>
        <button onClick={() => signOut()}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition font-semibold"
            >Sign Out</button>
        </>   
    } 
    return <>
    Not signed in <br/>
    <button onClick={() => signIn("google")} 
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition font-semibold">
             Sign in</button>
        </>
}

export default Login