import { useSession, signIn, signOut } from "next-auth/react";

const Login = () => {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <p>Signed in as {session.user?.email}</p>
        <p>Welcome, {session.user?.name}</p>
        {session.user?.image && (
          <img
            src={session.user.image}
            alt="Profile"
            className="w-16 h-16 rounded-full shadow-lg"
          />
        )}
        <button
          onClick={() => signOut()}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition font-semibold"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <p>Not signed in</p>
      <button
        onClick={() => signIn("google")}
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition font-semibold"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
