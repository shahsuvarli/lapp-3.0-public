"use client";

import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { useRouter } from "next/navigation";
import { MdOutlineExpandLess, MdModeEditOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { customerWindow, selectCustomer } from "utils/store/crmSlice";
import { BiPurchaseTag } from "react-icons/bi";
import moment from "moment";
import { FaTrashAlt } from "react-icons/fa";
import * as Yup from "yup";
import axios from "axios";
import { useSession } from "next-auth/react";
import { enqueueSnackbar } from "notistack";
import Marketing from "@components/shared/marketing";
import MaterialsTable from "./MaterialsTable";

function QuoteContainer({
  quote,
  project,
  materials,
  sales_org,
  account_manager,
  dsm,
  customer,
}) {
  const router = useRouter();
  const [disabled, setDisabled] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const dispatch = useDispatch();
  const { selectedCustomer } = useSelector((state) => state.crm);
  const { data: session } = useSession();

  const [newCustomer, setNewCustomer] = useState(null);

  useEffect(() => {
    setNewCustomer(selectedCustomer);
  }, [selectedCustomer]);

  useEffect(() => {
    return () => {
      dispatch(selectCustomer({}));
    };
  }, []);

  const handlePopup = () => {
    dispatch(customerWindow());
  };

  const handleDelete = async () => {
    const confirmResult = confirm(
      `Do you want to delete the Quote ${quote.quote_id}.${quote.quote_version}?`
    );

    if (confirmResult) {
      try {
        const {
          data: { message },
        } = await axios.post("/api/quote/delete/", {
          id: quote.id,
          quote_id: quote.quote_id,
          quote_version: quote.quote_version,
          project_id: quote.project_id,
          user_id: session?.user.id,
        });
        router.push(`/projects/${quote.project_id}`);
        router.refresh();
        enqueueSnackbar(message, { variant: "success" });
      } catch ({ message }) {
        enqueueSnackbar(message, { variant: "error" });
      }
    }
  };

  const saveQuote = async (values) => {
    let copper_rate_diff = false;
    if (values.copper_rate !== quote.copper_rate) {
      copper_rate_diff = true;
    }
    try {
      const {
        data: { message },
      } = await axios.post("/api/quote/update/", {
        values,
        user_id: session?.user.id,
        copper_rate_diff,
      });
      setDisabled(true);
      router.refresh();
      enqueueSnackbar(message, { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to update the data", { variant: "error" });
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-[rise_1s_ease-in-out] lg:w-[calc(100%-310px)] w-full">
      {marketing && (
        <Marketing
          setMarketing={setMarketing}
          quote={quote}
          materials={materials}
          session={session}
        />
      )}
      <div className="flex flex-col py-5 px-5 gap-8 bg-[#f7f6f3] rounded-md box-border animate-[rise_1s_ease-in-out w-full]">
        <div className="w-full flex justify-between items-center flex-row">
          <div className="flex flex-row self-start gap-5">
            <button
              className="hover:cursor-pointer w-10 h-10 rounded-md flex justify-center items-center border border-solid border-[#d9d9d9] text-[#313131] font-bold -rotate-90"
              onClick={() => router.push(`/projects/${quote.project_id}`)}
            >
              <MdOutlineExpandLess size={35} />
            </button>
            <p className="flex items-center gap-3 text-2xl">
              <BiPurchaseTag />
              <span>
                Quote #{quote.quote_id}.{quote.quote_version}{" "}
              </span>
              <span
                className={quote.is_active ? "hidden" : "flex text-red-600"}
              >
                (inactive)
              </span>
            </p>
          </div>
          {disabled ? (
            <button
              className={
                quote.is_active
                  ? "bg-[#f08938] flex justify-center items-center flex-row w-36 h-10 rounded-md text-base text-white transform-none border-none gap-3 hover:bg-[#b8682a] hover:cursor-pointer"
                  : "hidden"
              }
              onClick={() => setDisabled(false)}
            >
              <MdModeEditOutline />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex flex-row justify-evenly items-center gap-7">
              <span className="w-12 flex justify-center items-center hover:cursor-pointer hover:scale-125">
                <FaTrashAlt size={23} color="red" onClick={handleDelete} />
              </span>
              <button
                className="bg-transparent flex justify-center items-center flex-row w-36 h-10 rounded-md text-base text-[#313131] normal-case border border-solid border-[#f08938] gap-2 hover:cursor-pointer"
                onClick={handlePopup}
              >
                Change Customer
              </button>
            </div>
          )}
        </div>
        <Formik
          validationSchema={Yup.object({
            copper_rate: Yup.number().required("Please select copper rate"),
          })}
          enableReinitialize
          initialValues={{
            id: quote.id,
            quote_id: quote.quote_id,
            project_id: quote.project_id,
            sales_org_id: project[0].sales_org_id,
            quote_version: quote.quote_version,
            sap_quote_id: quote.sap_quote_id,
            sap_customer_id: newCustomer?.sap_id || quote.sap_customer_id,
            customer_name: newCustomer?.customer_name || quote.customer_name,
            country: newCustomer?.country || quote.customer_country,
            state: newCustomer?.state || quote.customer_state,
            city: newCustomer?.city || quote.customer_city,
            account_manager_id: quote.account_manager_id,
            dsm_id: quote.dsm_id,
            created_date: moment.utc(quote.created_date).format("YYYY-MM-DD"),
            created_by: `${quote.created_name} ${quote.created_surname}`,
            modified_date: moment.utc(quote.modified_date).format("YYYY-MM-DD"),
            modified_by: `${quote.modified_name} ${quote.modified_surname}`,
            copper_rate: quote.copper_rate,
            notes: quote.notes,
          }}
          onSubmit={(values, { setSubmitting }) => {
            const newValues = {
              id: quote.id,
              modified_date: new Date().toISOString(),
              quote_id: quote.quote_id,
              created_by: quote.created_by,
              modified_by: Number(session?.user.id),
              sap_customer_id: Number(values.sap_customer_id),
              account_manager_id: Number(values.account_manager_id) || null,
              dsm_id: Number(values.dsm_id) || null,
              copper_rate: Number(values.copper_rate) || null,
              quote_version: quote.quote_version,
              sap_quote_id: Number(values.sap_quote_id) || null,
              notes: values.notes || null,
              sales_org_id: project[0].sales_org_id,
            };
            setTimeout(() => {
              saveQuote(newValues);
              setSubmitting(false);
            }, 400);
          }}
        >
          {({
            values,
            setFieldValue,
            handleSubmit,
            handleChange,
            handleReset,
            errors,
          }) => (
            <Form className="w-full flex flex-col justify-center">
              <div className="w-full h-full gap-x-0 gap-y-6 flex flex-wrap justify-between [&>*]:flex [&>*]:flex-col [&>*]:text-sm text-[#313131] [&>*]:w-[24%] [&>*]:relative [&>div>input]:h-10 [&>div>input]:p-2 [&>div>input]:box-border [&>div>input]:rounded-md [&>div>input]:border [&>div>input]:border-solid [&>div>input]:border-[#d9d9d9] [&>div>select]:h-10 [&>div>select]:p-2 [&>div>select]:box-border [&>div>select]:rounded-md [&>div>select]:border [&>div>select]:border-solid [&>div>select]:border-[#d9d9d9]">
                <div>
                  <label htmlFor="project_id">Project ID</label>
                  <Field
                    type="text"
                    id="project_id"
                    name="project_id"
                    disabled={true}
                    value={values.project_id || ""}
                  />
                </div>
                <div>
                  <label htmlFor="sales_org_id">Sales Organization ID</label>
                  <Field
                    disabled={true}
                    name="sales_org_id"
                    type="select"
                    as="select"
                    id="sales_org_id"
                    placeholder="Enter Sales Organization"
                    value={values.sales_org_id}
                    onChange={async (e) => {
                      setFieldValue("sales_org_id", e.target.value);
                    }}
                  >
                    {sales_org.map(({ sales_org_id, sales_org }) => (
                      <option
                        value={sales_org_id}
                        key={sales_org_id}
                      >{`${sales_org_id} - ${sales_org}`}</option>
                    ))}
                  </Field>
                </div>
                <div>
                  <label htmlFor="quote_version">Version</label>
                  <Field
                    type="text"
                    id="quote_version"
                    name="quote_version"
                    disabled={true}
                    value={values.quote_version || ""}
                  />
                </div>
                <div>
                  <label htmlFor="sap_quote_id">SAP Quote Number</label>
                  <Field
                    type="number"
                    id="sap_quote_id"
                    name="sap_quote_id"
                    disabled={disabled}
                    value={values.sap_quote_id || ""}
                  />
                </div>
                <div>
                  <label htmlFor="customer_name">Customer Name</label>
                  <Field
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    disabled={true}
                    value={values.customer_name}
                  />
                </div>
                <div>
                  <label htmlFor="sap_customer_id">Customer SAP ID</label>
                  <Field
                    type="text"
                    id="sap_customer_id"
                    name="sap_customer_id"
                    disabled={true}
                    value={values.sap_customer_id || ""}
                  />
                </div>
                <div>
                  <label htmlFor="country">Country</label>
                  <Field
                    type="select"
                    id="country"
                    name="country"
                    disabled={true}
                    value={values.country || ""}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label htmlFor="state">State</label>
                  <Field
                    type="select"
                    id="state"
                    name="state"
                    disabled={true}
                    value={values.state || ""}
                  />
                </div>
                <div>
                  <label htmlFor="city">City</label>
                  <Field
                    type="text"
                    id="city"
                    name="city"
                    disabled={true}
                    value={values.city || ""}
                  />
                </div>
                <div>
                  <label htmlFor="account_manager_id">Account Manager</label>
                  <Field
                    type="select"
                    id="account_manager_id"
                    name="account_manager_id"
                    as="select"
                    disabled={disabled}
                    value={values.account_manager_id || ""}
                    onChange={(event) => {
                      handleChange(event);
                    }}
                  >
                    <option value={""}>Select Account Manager</option>
                    {account_manager.map(
                      ({ account_manager_id, account_manager }) => (
                        <option
                          value={account_manager_id}
                          key={account_manager_id}
                        >
                          {account_manager}
                        </option>
                      )
                    )}
                  </Field>
                </div>
                <div>
                  <label htmlFor="dsm_id">District Sales Manager</label>
                  <Field
                    type="select"
                    as="select"
                    id="dsm_id"
                    name="dsm_id"
                    disabled={disabled}
                    value={values.dsm_id || ""}
                    onChange={(event) => {
                      handleChange(event);
                    }}
                  >
                    <option value={""}>Select District Sales Manager</option>
                    {dsm.map(({ dsm_id, dsm }) => (
                      <option value={dsm_id} key={dsm_id}>
                        {dsm}
                      </option>
                    ))}
                  </Field>
                </div>
                <div>
                  <label htmlFor="created_date">Created Date</label>
                  <Field
                    type="date"
                    id="created_date"
                    name="created_date"
                    disabled={true}
                    value={values.created_date || ""}
                  />
                </div>
                <div>
                  <label htmlFor="created_by">Created By</label>
                  <Field
                    type="text"
                    id="created_by"
                    name="created_by"
                    disabled={true}
                    value={values.created_by || ""}
                  />
                </div>
                <div>
                  <label htmlFor="modified_date">Modified Date</label>
                  <Field
                    type="date"
                    id="modified_date"
                    name="modified_date"
                    disabled={true}
                    value={values.modified_date || ""}
                  />
                </div>
                <div>
                  <label htmlFor="modified_by">Modified By</label>
                  <Field
                    type="text"
                    id="modified_by"
                    name="modified_by"
                    disabled={true}
                    value={values.modified_by || ""}
                  />
                </div>
                <div>
                  <label htmlFor="copper_rate">Copper Rate</label>
                  <Field
                    type="number"
                    id="copper_rate"
                    name="copper_rate"
                    disabled={disabled}
                    value={values.copper_rate || ""}
                    onChange={(event) => {
                      handleChange(event);
                    }}
                    className={`border border-solid ${
                      errors.copper_rate
                        ? "!border-red-600"
                        : "!border-[#e0dbd4]"
                    }`}
                    onWheel={(event) => {
                      event.target.blur();
                    }}
                  />
                </div>
                <div className="sm:w-[49%] w-full">
                  <label htmlFor="notes">Notes</label>
                  <Field
                    className="h-16 border border-solid border-[#d9d9d9] border-radius text-base p-2"
                    name="notes"
                    id="notes"
                    type="textarea"
                    disabled={disabled}
                    placeholder="Enter Notes"
                    value={values.notes || ""}
                    component="textarea"
                    onChange={(event) => {
                      handleChange(event);
                    }}
                  />
                </div>
              </div>
              <div
                className={
                  disabled
                    ? "[&>button]:hidden"
                    : "flex text-base gap-5 self-end mt-4 [&>button]:w-36 [&>button]:rounded-md [&>button]:border-none [&>button]:hover:cursor-pointer justify-end w-1/2 right-0"
                }
              >
                <button
                  className="bg-[#e4e2dd] text-[#313131] h-10"
                  type="button"
                  onClick={() => {
                    handleReset();
                    setNewCustomer(null);
                    setDisabled(true);
                    enqueueSnackbar("Quote update cancelled", {
                      variant: "warning",
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-[#e7914e] text-white flex justify-center items-center gap-2 h-10"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      <MaterialsTable
        setMarketing={setMarketing}
        materials={materials}
        quote={quote}
        customer={customer}
      />
    </div>
  );
}

export default QuoteContainer;
