import { useDispatch, useSelector } from "react-redux";
import { customerWindow, selectCustomer } from "utils/store/crmSlice";
import { Field, Form, Formik, useFormik } from "formik";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

function Customer({ customer, projectId }) {
  const params = useParams();
  const { customerPopup } = useSelector((state) => state.crm);
  const [countries, setCountries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [city, setCity] = useState([]);
  const [state, setState] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session } = useSession();

  const handleUpdate = async () => {
    dispatch(customerWindow(false));
    dispatch(selectCustomer(selectedRow));
  };

  const handleSearch = async () => {
    try {
      const {
        data: { result, message },
      } = await axios.post("/api/customer/get/", formik.values);
      setCustomers(result);
      enqueueSnackbar(message, { variant: "success" });
    } catch ({ message }) {
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  const handleSubmit = async () => {
    dispatch(selectCustomer(selectedRow));
    dispatch(customerWindow(false));
    try {
      const {
        data: { data, message },
      } = await axios.post(`/api/quote/create/`, {
        project_id: projectId,
        sap_customer_id: selectedRow.sap_id,
        created_date: new Date().toISOString(),
        modified_date: new Date().toISOString(),
        created_by: session?.user.id,
        modified_by: session?.user.id,
        quote_version: 1,
      });

      router.push(`/projects/${projectId}/${data}`);
      enqueueSnackbar(message, { variant: "success" });
    } catch ({ message }) {
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  const handleCustomer = (value) => {
    const assignedCustomer = customer.find((obj) => obj.sap_id === value);
    setSelectedRow(assignedCustomer);
  };

  useEffect(() => {
    const countryArr = [];
    const cityArr = [];
    const stateArr = [];
    for (const { country, city, state } of customer) {
      countryArr.push(country);
      cityArr.push(city);
      stateArr.push(state);
    }

    const uniqueCountry = new Set(countryArr);
    const uniqueCity = new Set(cityArr);
    const uniqueState = new Set(stateArr);

    setCountries([...uniqueCountry]);
    setCity([...uniqueCity]);
    setState([...uniqueState]);
  }, []);

  const heads = [
    "Customer Name",
    "Customer SAP ID",
    "Country",
    "State",
    "City",
  ];

  const handleWindow = () => {
    dispatch(customerWindow());
  };

  const handleSafe = (e) => {
    e.preventDefault();
    dispatch(customerWindow());
  };

  const formik = useFormik({
    initialValues: {
      customer_name: "",
      sap_id: "",
      country: "",
      state: "",
      regions: "",
      city: "",
    },
    onSubmit: (values, { setSubmitting }) => {
      setTimeout(() => {
        handleSearch();
        setSubmitting(false);
      }, 400);
    },
  });

  return (
    <div
      className={
        customerPopup
          ? "fixed top-0 left-0 right-0 bottom-0 w-full h-screen bg-[#4845458f] flex justify-center items-center z-[100]"
          : "hidden"
      }
      onClick={handleWindow}
    >
      <div
        className="bg-white w-2/3 rounded-md animate-[rise_1s_ease-in-out] p-5 gap-4 flex flex-col"
        onClick={handleSafe}
      >
        <p className="text-lg">Customer Selection</p>
        <div className="flex justify-between">
          <Formik onSubmit={formik.handleSubmit}>
            <Form className="w-full flex flex-col justify-center">
              <div className="w-full h-full gap-y-6 gap-x-0 flex flex-wrap justify-between  [&>*]:gap-2 [&>*]:flex [&>*]:flex-col [&>*]:text-sm text-[#313131] [&>*]:w-[32%] [&>*]:relative [&>div>input]:h-10 [&>div>input]:p-2 [&>div>input]:box-border [&>div>input]:rounded-md [&>div>input]:border [&>div>input]:border-solid [&>div>input]:border-[#d9d9d9] [&>div>select]:h-10 [&>div>select]:p-2 [&>div>select]:box-border [&>div>select]:rounded-md [&>div>select]:border [&>div>select]:border-solid [&>div>select]:border-[#d9d9d9]">
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
                    type="number"
                    id="sap_id"
                    placeholder="Enter Customer SAP ID"
                    value={formik.values.sap_id}
                    onChange={(event) => {
                      formik.handleChange(event);
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="country">Country</label>
                  <Field
                    name="country"
                    type="select"
                    as="select"
                    value={formik.values.country}
                    autoComplete="off"
                    id="country"
                    onChange={async (e) => {
                      formik.setFieldValue("country", e.target.value);
                    }}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option value={country} key={country}>
                        {country}
                      </option>
                    ))}
                  </Field>
                </div>
                <div>
                  <label htmlFor="state">State</label>
                  <Field
                    name="state"
                    type="select"
                    as="select"
                    id="state"
                    value={formik.values.state}
                    onChange={(event) => {
                      formik.handleChange(event);
                    }}
                  >
                    <option value="">Select State</option>
                    {state.map((item) => (
                      <option key={item} value={item} id="state">
                        {item}
                      </option>
                    ))}
                  </Field>
                </div>
                <div>
                  <label htmlFor="city">City</label>
                  <Field
                    name="city"
                    type="select"
                    as="select"
                    id="city"
                    value={formik.values.city}
                    onChange={(event) => {
                      formik.handleChange(event);
                    }}
                  >
                    <option value="">Select City</option>
                    {city.map((item) => (
                      <option key={item} value={item} id="city">
                        {item}
                      </option>
                    ))}
                  </Field>
                </div>
                <div className="flex text-base gap-5 self-end mt-3 [&>button]:w-36 [&>button]:rounded-md [&>button]:border-none [&>button]:hover:cursor-pointer">
                  <button
                    className="bg-[#e7914e] text-white h-10"
                    type="submit"
                    onClick={formik.handleSubmit}
                  >
                    Search
                  </button>
                </div>
              </div>
            </Form>
          </Formik>
        </div>
        <div className="max-h-72 overflow-y-scroll flex justify-center border-[0.1px] border-solid border-[#808080] mt-2 w-full">
          <table className="rounded-xl overflow-y-scroll w-full">
            <thead className="sticky top-0 bg-[#dcdada]">
              <tr>
                {heads.map((item) => (
                  <th key={item}>{item}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map(
                ({ sap_id, customer_name, country, state, city }) => (
                  <tr
                    key={sap_id}
                    className={`hover:cursor-pointer hover:bg-[#e9bd9b] ${
                      selectedRow?.sap_id === sap_id
                        ? "bg-[#e7914e]"
                        : "bg-transparent"
                    }`}
                    onClick={() => handleCustomer(sap_id)}
                  >
                    <td>{customer_name}</td>
                    <td>{sap_id}</td>
                    <td>{country}</td>
                    <td>{state}</td>
                    <td>{city}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        <div className="self-end">
          <div className="flex text-base gap-5 self-end mt-3 [&>button]:w-36 [&>button]:rounded-md [&>button]:border-none [&>button]:hover:cursor-pointer [&>button]:h-10">
            <button
              className="bg-[#e4e2dd] text-[#313131]"
              type="cancel"
              onClick={() => {
                setSelectedRow(null);
                handleWindow();
              }}
            >
              Cancel
            </button>
            {params?.id ? (
              <button
                className="bg-[#e7914e] text-white"
                type="button"
                onClick={handleUpdate}
              >
                Update Quote
              </button>
            ) : (
              <button
                className="bg-[#e7914e] text-white h-10 disabled:bg-[#e7904eb4]"
                type="button"
                onClick={handleSubmit}
                disabled={!selectedRow}
              >
                Create Quote
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Customer;
