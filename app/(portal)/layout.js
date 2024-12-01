import Header from "@components/shared/header";
import { Sidebar } from "@components/shared/sidebar";

function layout({ children }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <div className="box-border gap-6 bg-[#e0dbd4] px-6 py-4 flex flex-row">
        <Sidebar />
        {children}
      </div>
    </div>
  );
}

export default layout;
