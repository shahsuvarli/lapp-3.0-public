"use client";

import { useState } from "react";
import { Formik, Form, Field, useFormik } from "formik";
import axios from "axios";
import AllQuotesTable from "./AllQuotesTable";
import { enqueueSnackbar } from "notistack";
import { ImSpinner } from "react-icons/im";
import { FaSpinner } from "react-icons/fa";

function ListQuotes({
  defaultQuotes,
  state,
  region,
  sales_org,
  dsm,
  vertical_market,
  account_manager,
}) {
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [regions, setRegions] = useState([]);
  const [quotes, setQuotes] = useState([...defaultQuotes]);

  const handleSearch = async () => {
    setLoading(() => true);
    try {
      const {
        data: { data, message },
      } = await axios.post("/api/quote/search/", formik.values);
      setQuotes(data);
      enqueueSnackbar(message, { variant: "success" });
    } catch ({ message }) {
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(() => false);
    }
  };

  const formik = useFormik({
    initialValues: {
      sales_org_id: "",
      project_name: "",
      state: "",
      region: "",
      vertical_market: "",
      status: "",
      won_lost: "",
      region: "",
      value_from: "",
      value_to: "",
      cost_crom: "",
      cost_to: "",
      customer_name: "",
      sap_id: "",
      country: "",
      account_manager: "",
      dsm: "",
      date_from: "",
      date_to: "",
    },
    onSubmit: (values, { setSubmitting }) => {
      setTimeout(() => {
        setLoading(true);
        handleSearch();
        setSubmitting(false);
        setLoading(false);
      }, 400);
    },
  });

  return (
    <div className="flex flex-col gap-5 animate-[rise_1s_ease-in-out] lg:w-[calc(100%-310px)] w-full">
      <div className="flex flex-col py-5 px-5 gap-8 bg-[#f7f6f3] rounded-md box-border animate-[rise_1s_ease-in-out w-full]">
        <p className="text-2xl">Quotes List</p>
        <Formik>
          <Form
            className="w-full flex flex-col justify-center"
            onSubmit={formik.handleSubmit}
          >
            <div className="w-full h-full gap-y-6 gap-x-0 flex flex-wrap justify-between  [&>*]:gap-2 [&>*]:flex [&>*]:flex-col [&>*]:text-sm text-[#313131] [&>*]:w-[32%] [&>*]:relative [&>div>input]:h-10 [&>div>input]:p-2 [&>div>input]:box-border [&>div>input]:rounded-md [&>div>input]:border [&>div>input]:border-solid [&>div>input]:border-[#d9d9d9] [&>div>select]:h-10 [&>div>select]:p-2 [&>div>select]:box-border [&>div>select]:rounded-md [&>div>select]:border [&>div>select]:border-solid [&>div>select]:border-[#d9d9d9]">
              <div>
                <label htmlFor="sales_org_id">Sales organization</label>
                <Field
                  name="sales_org_id"
                  type="select"
                  as="select"
                  value={formik.values.sales_org_id}
                  id="sales_org_id"
                  placeholder="Enter Sales Organization"
                  onChange={async (event) => {
                    formik.handleChange(event);
                    const newStates = state.filter(
                      (item) => item.sales_org_id == event.target.value
                    );
                    const newRegions = region.filter(
                      (region) => region.sales_org_id == event.target.value
                    );
                    setStates(newStates);
                    setRegions(newRegions);
                  }}
                >
                  <option value="">Select Sales Organization</option>
                  {sales_org.map((sales_org) => (
                    <option
                      value={sales_org.sales_org_id}
                      key={sales_org.sales_org_id}
                    >
                      {sales_org.sales_org_id} - {sales_org.sales_org}
                    </option>
                  ))}
                </Field>
              </div>
              <div>
                <label htmlFor="project_name">Project Name</label>
                <Field
                  name="project_name"
                  type="text"
                  id="project_name"
                  placeholder="Enter Project Name"
                  value={formik.values.project_name}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                />
              </div>
              <div>
                <label htmlFor="status">Status</label>
                <Field
                  name="status"
                  type="text"
                  as="select"
                  id="status"
                  placeholder="Select Status"
                  value={formik.values.status}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                >
                  <option value="">Select Status</option>
                  <option value={"open"}>Open</option>
                  <option value={"closed"}>Closed</option>
                </Field>
              </div>

              <div>
                <label htmlFor="won_lost">Won / Lost</label>
                <Field
                  name="won_lost"
                  type="text"
                  as="select"
                  id="won_lost"
                  placeholder="Select Won / Lost"
                  value={formik.values.won_lost}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                >
                  <option value="">Select Won/Lost</option>
                  <option value={"pending"}>Pending</option>
                  <option value={"won"}>Won</option>
                  <option value={"lost"}>Lost</option>
                </Field>
              </div>
              <div>
                <label htmlFor="quoteValue">Quote Value</label>
                <div className="flex flex-row justify-between gap-1 box-border [&>input]:w-1/2 text-[#313131] [&>input]:h-10 [&>input]:p-2 [&>input]:box-border [&>input]:rounded-md [&>input]:border [&>input]:border-solid [&>input]:border-[#d9d9d9]">
                  <Field
                    name="value_from"
                    type="number"
                    id="value_from"
                    placeholder="From"
                    value={formik.values.value_from}
                    onChange={(event) => {
                      formik.handleChange(event);
                    }}
                  />
                  <Field
                    name="value_to"
                    type="number"
                    id="value_to"
                    placeholder="To"
                    value={formik.values.value_to}
                    onChange={(event) => {
                      formik.handleChange(event);
                    }}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="quoteCost">Quote Cost</label>
                <div className="flex flex-row justify-between gap-1 box-border [&>input]:w-1/2 text-[#313131] [&>input]:h-10 [&>input]:p-2 [&>input]:box-border [&>input]:rounded-md [&>input]:border [&>input]:border-solid [&>input]:border-[#d9d9d9]">
                  <Field
                    name="cost_from"
                    type="number"
                    id="cost_from"
                    placeholder="From"
                    value={formik.values.cost_from}
                    onChange={(event) => {
                      formik.handleChange(event);
                    }}
                  />
                  <Field
                    name="cost_to"
                    type="number"
                    id="cost_to"
                    placeholder="To"
                    value={formik.values.cost_to}
                    onChange={(event) => {
                      formik.handleChange(event);
                    }}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="customer_name">Customer Name</label>
                <Field
                  name="customer_name"
                  type="text"
                  id="customer_name"
                  placeholder="Enter Customer Name"
                  value={formik.values.customer_name}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                />
              </div>
              <div>
                <label htmlFor="sap_id">Customer SAP ID</label>
                <Field
                  name="sap_id"
                  type="text"
                  id="sap_id"
                  placeholder="Enter Customer SAP ID"
                  value={formik.values.sap_id}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                />
              </div>
              <div>
                <label htmlFor="state">Customer State</label>
                <Field
                  name="state"
                  type="text"
                  as="select"
                  id="state"
                  placeholder="Select State"
                  value={formik.values.state}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                >
                  <option value="">Select Customer State</option>
                </Field>
              </div>
              <div>
                <label htmlFor="country">Customer Country</label>
                <Field
                  name="country"
                  type="select"
                  as="select"
                  id="country"
                  value={formik.values.country}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                >
                  <option value="">Select Customer Country</option>
                  <option value={"usa"}>USA</option>
                  <option value={"canada"}>Canada</option>
                  <option value={"germany"}>Germany</option>
                </Field>
              </div>
              <div>
                <label htmlFor="account_manager">Account Manager</label>
                <Field
                  name="account_manager"
                  type="select"
                  as="select"
                  id="account_manager"
                  value={formik.values.account_manager}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                >
                  <option value="">Select Account Manager</option>
                  {account_manager.map((item) => (
                    <option
                      value={item.account_manager_id}
                      key={item.account_manager_id}
                    >
                      {item.account_manager}
                    </option>
                  ))}
                </Field>
              </div>
              <div>
                <label htmlFor="dsm">District Sales Manager</label>
                <Field
                  name="dsm"
                  type="select"
                  as="select"
                  id="dsm"
                  value={formik.values.dsm}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                >
                  <option value="">Select District Sales Manager</option>
                  {dsm.map((item) => (
                    <option value={item.dsm_id} key={item.dsm_id}>
                      {item.dsm}
                    </option>
                  ))}
                </Field>
              </div>
              <div>
                <label htmlFor="region">Region</label>
                <Field
                  name="region"
                  type="text"
                  id="region"
                  as="select"
                  placeholder="Select Region"
                  value={formik.values.value_to}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                >
                  <option value="">Select Region</option>
                  {regions.map((item) => (
                    <option value={item.region_id} key={item.region_id}>
                      {item.region_name}
                    </option>
                  ))}
                </Field>
              </div>
              <div>
                <label htmlFor="vertical_market">Vertical Market</label>
                <Field
                  name="vertical_market"
                  type="text"
                  as="select"
                  id="vertical_market"
                  placeholder="Select Vertical Market"
                  value={formik.values.vertical_market}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                >
                  <option value="">Select Market</option>
                  {vertical_market.map((item) => (
                    <option
                      value={item.vertical_market_id}
                      key={item.vertical_market_id}
                    >
                      {item.vertical_market_name}
                    </option>
                  ))}
                </Field>
              </div>
              <div>
                <label htmlFor="createdDate">Created Date</label>
                <div className="flex flex-row justify-between gap-1 box-border [&>input]:w-1/2 text-[#313131] [&>input]:h-10 [&>input]:p-2 [&>input]:box-border [&>input]:rounded-md [&>input]:border [&>input]:border-solid [&>input]:border-[#d9d9d9]">
                  <Field
                    name="date_from"
                    type="date"
                    id="date_from"
                    placeholder="From"
                    value={formik.values.date_from}
                    onChange={(event) => {
                      formik.handleChange(event);
                    }}
                  />
                  <Field
                    name="date_to"
                    type="date"
                    id="date_to"
                    placeholder="To"
                    value={formik.values.date_to}
                    onChange={(event) => {
                      formik.handleChange(event);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex text-base gap-5 self-end mt-7 [&>button]:w-36 [&>button]:rounded-md [&>button]:border-none [&>button]:hover:cursor-pointer [&>button]:h-10">
              {!loading ? (
                <>
                  <button
                    className="bg-[#e4e2dd] text-[#313131]"
                    type="cancel"
                    onClick={formik.resetForm}
                  >
                    Reset
                  </button>
                  <button className="bg-[#e7914e] text-white" type="submit">
                    Search
                  </button>
                </>
              ) : (
                <ImSpinner size={30} className="animate-spin" color="#e7914e" />
              )}
            </div>
          </Form>
        </Formik>
      </div>
      {!loading ? (
        <AllQuotesTable quotes={quotes} />
      ) : (
        <FaSpinner className="animate-spin" />
      )}
    </div>
  );
}

export default ListQuotes;
