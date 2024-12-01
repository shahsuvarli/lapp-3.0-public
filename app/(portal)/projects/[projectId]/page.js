"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import QuotesTable from "@components/quotes/QuotesTable";
import ProjectFormik from "@components/project/project-formik";
import { FaSpinner } from "react-icons/fa";

export default function Page({ params }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("/api/project/project-by-id", {
        params: {
          project_id: params.projectId,
        },
      });
      setData(response.data);
    };
    fetchData();
  }, []);

  if (!data)
    return (
      <div>
        <FaSpinner className="animate-spin" />
      </div>
    );

  return (
    <div className="flex flex-col gap-5 animate-[rise_1s_ease-in-out] lg:w-[calc(100%-310px)] w-full">
      <ProjectFormik
        project={data.project}
        sales_org={data.sales_org}
        vertical_market={data.vertical_market}
        region={data.region}
        channel={data.channel}
        state={data.state}
        project_sap_orders={data.project_sap_orders}
        project_competitors={data.project_competitors}
        competitors={data.competitors}
      />
      <QuotesTable
        quotes={data.quotes}
        project={data.project}
        customer={data.customer}
      />
    </div>
  );
}
