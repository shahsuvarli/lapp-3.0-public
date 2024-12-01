"use client";

import Link from "next/link";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useDispatch } from "react-redux";
import { customerWindow } from "utils/store/crmSlice";
import Customer from "@components/shared/customer";
import { Fragment, useState } from "react";

const heads = [
  "Quote ID",
  "Customer Name",
  "SAP Quote #",
  "Quote Value",
  "Cost",
  "Margin",
  "Account Manager",
  "DSM",
  "Notes",
];

function QuotesTable({ quotes, project, customer }) {
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
    <Fragment>
      <Customer customer={customer} projectId={project.project_id} />
      <div className="flex flex-col py-5 px-8 gap-8 w-full h-fit bg-[#f7f6f3] rounded-md box-border mb-12">
        <div className="flex flex-row justify-between items-center w-full">
          <p className="text-2xl">Quote List</p>
          <div
            className={
              project.is_active
                ? "flex text-base gap-5 self-end mt-3 [&>button]:w-36 [&>button]:rounded-md [&>button]:border-none [&>button]:hover:cursor-pointer"
                : "hidden"
            }
          >
            <button
              className="bg-[#e7914e] text-white h-10"
              type="submit"
              onClick={handlePopup}
            >
              Create Quote
            </button>
          </div>
        </div>
        <div className="max-w-full overflow-x-scroll box-border">
          <table className="w-full rounded-md overflow-x-scroll box-border">
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
                  return (
                    <tr key={item.id}>
                      <td>
                        <Link
                          href={`/projects/${
                            project.project_id
                          }/${item.id.toString()}`}
                          className="no-underline border border-solid border-[#aaa9a9] rounded-md px-2 py-1 bg-white text-[#383636] hover:bg-[#e7914e] hover:text-white hover:border-transparent"
                        >
                          {item.quote_id}.{item.quote_version}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap">
                        {item.customer_name}
                      </td>
                      <td>{item.sap_quote_id}</td>
                      <td>{item.quote_value}</td>
                      <td>{item.quote_cost}</td>
                      <td>{item.quote_margin}</td>
                      <td className="whitespace-nowrap">
                        {item.account_manager}
                      </td>
                      <td className="whitespace-nowrap">{item.dsm}</td>
                      <td className="w-40 break-words overflow-scroll text-ellipsis border-b-0 h-[4em] border-l-0 border-r-0 line-clamp-3">
                        {item.notes}
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
              className="py-2 pr-1 pl-2 border border-solid border-[#d9d9d9]"
              onChange={handlePerPage}
              id="rowsPerPage"
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
    </Fragment>
  );
}

export default QuotesTable;
