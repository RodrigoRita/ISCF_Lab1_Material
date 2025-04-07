import React from "react";
import { AccountToggle } from "./AccountToggle";
import { RouteSelect } from "./RouteSelect";


export const Sidebar = () => {
  return (
    <div >
      <div className="fixed left-0 top-0 w-64 h-full bg-gray-100 text-gray-800 p-4 overflow-y-auto rounded-r-lg shadow-lg">
        <AccountToggle />
        <RouteSelect />
      </div>
    </div>
  );
};
//fixed left-0 top-0 w-64 h-full bg-gray-100 text-gray-800 p-4 overflow-y-auto rounded-r-lg shadow-lg