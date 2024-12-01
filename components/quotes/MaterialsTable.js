import { useDispatch, useSelector } from "react-redux";
import {
  materialWindow,
  newMaterialWindow,
  selectMaterial,
} from "utils/store/crmSlice";
import numeral from "numeral";
import { RiFileExcel2Fill } from "react-icons/ri";
import { MdOutlineAddCircleOutline } from "react-icons/md";
import Material from "@components/material/editMaterial.js";
import { useSession } from "next-auth/react";
import { Fragment, useState } from "react";
import NewMaterial from "@components/material/newMaterial.js";
import Customer from "@components/shared/customer.js";
import { formFields } from "utils/materialInputs";

function MaterialsTable({ materials, quote, customer, setMarketing }) {
  const [step, setStep] = useState(10);

  const dispatch = useDispatch();
  const { material } = useSelector((state) => state.crm);
  const { data: session } = useSession();

  const handlePerPage = (e) => {
    setStep(Number(e.target.value));
  };

  const handleStepCount = (e, p) => {
    setStart((p - 1) * step);
  };

  const handleEditMaterial = () => {
    dispatch(materialWindow(true));
    dispatch(selectMaterial({}));
  };

  const handleNewMaterial = () => {
    dispatch(newMaterialWindow(true));
  };

  return (
    <Fragment>
      <Customer customer={customer} projectId={quote.project_id} />
      {material && <Material quote={quote} material={material} />}
      {quote && <NewMaterial quote={quote} session={session} />}
      <div className="flex flex-col py-5 px-8 gap-8 w-full h-fit bg-[#f7f6f3] rounded-md box-border mb-12">
        <div className="flex flex-row justify-between items-center w-full">
          <p className="text-2xl h-full">Material List</p>
          <div className="flex text-base gap-5 self-end mt-3 [&>button]:w-36 [&>button]:rounded-md [&>button]:border-none [&>button]:hover:cursor-pointer [&>div]:flex [&>div]:justify-center [&>div]:items-center [&>div]:rounded-md [&>div]:text-center [&>div]:h-12 [&>div]:border [&>div]:border-solid [&>div]:border-[#999998] [&>div]:w-32 [&>div]:text-[#434342] [&>div]:flex-col [&>div]:gap-0 [&>div]:px-1 [&>div]:box-border [&>div]:bg-[#e3e3df61]">
            <span
              className="text-white font-bold w-12 flex justify-center items-center hover:cursor-pointer"
              onClick={() => setMarketing(true)}
            >
              <RiFileExcel2Fill
                color="#e7914e"
                style={{ width: "60%", height: "100%" }}
              />
            </span>
            <div>
              <p style={{ fontSize: 13 }}>total value</p>
              {numeral(quote.quote_value).format("$0,0")}
            </div>
            <div>
              <p style={{ fontSize: 13 }}>total cost</p>
              {numeral(quote.quote_cost).format("$0,0")}
            </div>
            <div>
              <p style={{ fontSize: 13 }}>total margin</p>
              {numeral(quote.quote_margin).format("0.0")}%
            </div>

            <button
              className={
                quote.is_active
                  ? "bg-[#f08938] flex justify-center items-center flex-row w-36 h-10 rounded-md text-base text-white transform-none border-none gap-3 hover:bg-[#b8682a] hover:cursor-pointer"
                  : "hidden"
              }
              type="button"
              onClick={handleNewMaterial}
              disabled={!Boolean(quote.copper_rate)}
            >
              <MdOutlineAddCircleOutline size={17} />
              <p>New Material</p>
            </button>
          </div>
        </div>
        <div
          className="max-w-full overflow-x-scroll box-border"
          onClick={handleEditMaterial}
        >
          <table className="w-full rounded-md overflow-x-scroll box-border">
            <thead>
              <tr>
                {formFields.map(({ id, label }) => (
                  <th key={id} className="align-text-top">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materials.map((item) => (
                <tr
                  key={item.id}
                  className="hover:cursor-pointer hover:bg-[#a5a4a42f]"
                >
                  <td>{item.material_id}</td>
                  <td>{item.quantity}</td>
                  <td>{item.uom}</td>
                  <td>{item.stock_6100}</td>
                  <td>{item.stock_6120}</td>
                  <td>{item.stock_6130}</td>
                  <td>{item.stock_6140}</td>

                  <td>{numeral(item.low_discount).format("0,0.00")}%</td>
                  <td>{numeral(item.average_discount).format("0,0.00")}%</td>
                  <td>{numeral(item.high_discount).format("0,0.00")}%</td>
                  <td className="w-40 break-words overflow-scroll text-ellipsis border-b-0 h-[4em] border-l-0 border-r-0 line-clamp-3">
                    {item.line_notes}
                  </td>
                  <td>{numeral(item.level_5_base_cu).format("$0,0.00")}</td>
                  <td>{numeral(item.discount_percent).format("0,0.00")}%</td>
                  <td>{numeral(item.copper_base_price).format("$0,0.00")}</td>
                  <td>{numeral(item.full_base_price).format("$0,0.00")}</td>
                  <td>{item.margin_full_copper}%</td>
                  <td>{numeral(item.line_value).format("$0,0.00")}</td>
                  <td>{numeral(item.line_cogs).format("$0,0.00")}</td>
                  <td>{item.description}</td>
                  <td>{item.product_family}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center [&>div]:flex [&>div]:flex-row [&>div]:gap-3 [&>div]:items-center">
          <div>
            <p className="text-sm text-[#313131]">Rows per page</p>
            <select
              id="rowCount"
              className="py-2 pr-1 pl-2 border border-solid border-[#d9d9d9]"
              onChange={handlePerPage}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* <Stack spacing={2}>
            <Pagination
              count={Math.ceil(materials.length / step)}
              showFirstButton
              showLastButton
              onChange={handleStepCount}
            />
          </Stack> */}
        </div>
      </div>
    </Fragment>
  );
}

export default MaterialsTable;
