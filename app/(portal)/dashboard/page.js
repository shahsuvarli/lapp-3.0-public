import PieChart from "@components/dashboard/BarChart";
import CardContainers from "@components/dashboard/CardContainers";
import SalesBarChart from "@components/dashboard/SalesBarChart";

export default async function page() {
  return (
    <div className="flex flex-col gap-5 animate-[rise_1s_ease-in-out] lg:w-[calc(100%-310px)] w-full">
      <div className="flex flex-col py-5 px-5 gap-8 bg-[#f7f6f3] rounded-md box-border animate-[rise_1s_ease-in-out w-full]">
        <p>Dashboard</p>
        <CardContainers />
        <PieChart />
        <SalesBarChart />
      </div>
    </div>
  );
}
