import { Dashboard } from "@/components/Dashboard/Dashboard";
import { Sidebar } from "@/components/Sidebar/Sidebar";

export default function Home() {
  

  return (
    <main className='min-h-screen flex-1 p-6 bg-gray-50 ml-64'>
      <Sidebar />
      <Dashboard />
    </main>
  );
}

//'min-h-screen flex-1 p-6 bg-gray-50 ml-64'>