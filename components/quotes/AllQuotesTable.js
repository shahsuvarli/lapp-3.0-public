import Link from "next/link";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useDispatch } from "react-redux";
import numeral from "numeral";
import { useState } from "react";
import { customerWindow } from "utils/store/crmSlice";
import moment from "moment/moment";

const heads = [
  "Quote ID",
  "Sales Organization",
  "Project ID",
  "SAP Quote ID",
  "Project Name",
  "Project State",
  "Status",
  "Won/Lost",
  "Quote Value",
  "Customer",
  "Customer ID",
  "Customer City",
  "Customer State",
  "Customer Country",
  "Electrical Contractor",
  "Account Manager",
  "DSM",
  "Region",
  "Vertical Market",
  "Created By",
  "Created Date",
  "Quote Cost",
  "Quote Margin",
];

function AllQuotesTable({ quotes, projectId }) {
  const [start, setStart] = useState(0);
  const [step, setStep] = useState(10);

  const dispatch = useDispatch();

  const handlePopup = () => {
    dispatch(customerWindow());
  };

  const handlePerPage = (e) => {
    setStep(Number(e.target.value));
  };

  const handleStepCount = (e, p) => {
    setStart((p - 1) * step);
  };
  return (
    <div className="flex flex-col px-5 py-5 gap-8 w-full h-fit bg-[#f7f6f3] rounded-md box-border mb-12">
      <div className="flex justify-betweem items-center w-full flex-row">
        <p className="text-2xl">Results</p>
      </div>
      <div className="max-w-full overflow-x-scroll box-border">
        <table className="w-full rounded-md overflow-x-scroll">
          <thead>
            <tr>
              {heads.map((item) => (
                <th key={item}>{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotes
              // .sort(function (a, b) {
              //   return new Date(b.createdDate) - new Date(a.createdDate);
              // })
              .slice(start, start + step)
              .map((item) => {
                const createdDate = moment(item.createdDate).format(
                  "YYYY-MM-DD"
                );
                return (
                  <tr key={item.id}>
                    <td>
                      <Link
                        href={`/projects/${
                          item.project_id
                        }/${item.id.toString()}`}
                        className="text no-underline rounded-md px-2 py-1 text-[#383636] bg-white border border-solid border-[#aaa9a9] hover:bg-[#e7914e] hover:white hover:border-transparent hover:text-white"
                      >
                        {item.quote_id}.{item.quote_version}
                      </Link>
                    </td>
                    <td>{item.sales_org}</td>
                    <td>{item.project_id}</td>
                    <td>{item.sap_quote_id}</td>
                    <td>{item.project_name}</td>
                    <td className="whitespace-nowrap">
                      {item.state_long_name}
                    </td>
                    <td>{item.status}</td>
                    <td>{item.won_lost}</td>
                    <td>{item.quote_value}</td>
                    <td className="whitespace-nowrap">{item.customer_name}</td>
                    <td>{item.customer_sap_id}</td>
                    <td>{item.customer_city}</td>
                    <td>{item.customer_state}</td>
                    <td>{item.customer_country}</td>
                    <td>{item.electrical_contractor}</td>
                    <td className="whitespace-nowrap">
                      {item.account_manager}
                    </td>
                    <td className="whitespace-nowrap">{item.dsm}</td>
                    <td className="whitespace-nowrap">{item.region_name}</td>
                    <td>{item.vertical_market_name}</td>
                    <td className="whitespace-nowrap">
                      {item.emp_name} {item.emp_surname}
                    </td>
                    <td className="whitespace-nowrap">{createdDate}</td>
                    <td className="whitespace-nowrap">
                      {numeral(item.quote_cost).format("$0,0")}
                    </td>
                    <td className="whitespace-nowrap">
                      {numeral(item.quote_margin).format("$0,0")}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center [&>div]:flex [&>div]:flex-row [&>div]:gap-3 [&>div]:items-center">
        <div>
          <p className="text-sm text-[#313131]">Rows per page</p>
          <select
            className="py-2.5 pr-1 pl-2 border border-solid border-[#d9d9d9] box-border rounded-md"
            onChange={handlePerPage}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <Stack spacing={2}>
          <Pagination
            count={Math.ceil(quotes.length / step)}
            showFirstButton
            showLastButton
            onChange={handleStepCount}
          />
        </Stack>
      </div>
    </div>
  );
}

export default AllQuotesTable;
