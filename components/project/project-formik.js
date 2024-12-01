import { Formik, useFormik, Form, Field } from "formik";
import moment from "moment/moment";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  MdModeEditOutline,
  MdOutlineExpandLess,
  MdOutlineSaveAs,
} from "react-icons/md";
import { RiArrowDownSLine } from "react-icons/ri";
import * as Yup from "yup";
import { AiOutlineFundProjectionScreen } from "react-icons/ai";
import { FaTrashAlt } from "react-icons/fa";
import { enqueueSnackbar } from "notistack";
import axios from "axios";

const ProjectFormik = ({
  project,
  project_sap_orders,
  sales_org,
  vertical_market,
  channel,
  project_competitors,
  competitors,
  state,
  region,
}) => {
  const [states, setStates] = useState(state);
  const [regions, setRegions] = useState(region);
  const [disabled, setDisabled] = useState(true);
  const router = useRouter();
  const [dropdown, setDropdown] = useState(false);
  const { data: session } = useSession();

  const formik = useFormik({
    initialValues: {
      project_id: project.project_id,
      sales_org_id: project.sales_org_id,
      project_name: project.project_name,
      ranking: project.ranking || "",
      general_contractor: project.general_contractor || "",
      electrical_contractor: project.electrical_contractor || "",
      state: project.state,
      region: project.region,
      vertical_market: project.vertical_market,
      status: project.status,
      won_lost: project.won_lost,
      channel: project.channel,
      created_date: moment.utc(project.created_date).format("YYYY-MM-DD"),
      notes: project.notes,
      total_value: project.total_value,
      created_by: `${project.created_name} ${project.created_surname}`,
      modified_by: `${project.modified_name} ${project.modified_surname}`,
      modified_date: moment.utc(project.modified_date).format("YYYY-MM-DD"),
      sap_order_1: project_sap_orders[0]?.sap_order_id,
      sap_order_2: project_sap_orders[1]?.sap_order_id,
      sap_order_3: project_sap_orders[2]?.sap_order_id,
      sap_order_4: project_sap_orders[3]?.sap_order_id,
      sap_order_5: project_sap_orders[4]?.sap_order_id,
      sap_order_6: project_sap_orders[5]?.sap_order_id,
    },

    validationSchema: Yup.object({
      created_date: Yup.date().required("Please select date"),
      project_name: Yup.string().required("Please enter value"),
      vertical_market: Yup.string().required("Please select option"),
      region: Yup.string().required("Please select option"),
      sales_org_id: Yup.string().required("Please select option"),
      state: Yup.string().required("Please select option"),
      channel: Yup.string().required("Please select option"),
    }),
    onSubmit: (values, { setSubmitting }) => {
      const sapOrderValues = {};
      const nonSapOrderValues = {};

      for (const [key, value] of Object.entries(values)) {
        if (key.startsWith("sap_order")) {
          sapOrderValues[key] = value;
        } else {
          nonSapOrderValues[key] = value;
        }
      }

      const newValues = {
        ...nonSapOrderValues,
        channel: Number(values.channel),
        ranking: Number(values.ranking) || null,
        region: Number(values.region),
        sales_org_id: Number(values.sales_org_id),
        vertical_market: Number(values.vertical_market),
        state: Number(values.state),
        created_date: new Date(values.created_date).toISOString(),
        modified_date: new Date().toISOString(),
        created_by: project.created_by,
        modified_by: Number(session?.user.id),
        general_contractor: values.general_contractor,
        electrical_contractor: values.electrical_contractor,
      };

      setTimeout(() => {
        updateProject(newValues, sapOrderValues);
        setSubmitting(false);
        setDisabled(true);
      }, 400);
    },
  });

  const handleDelete = async () => {
    const confirmResult = confirm(
      `Do you want to delete the Project ${project.project_id}?`
    );

    if (confirmResult) {
      try {
        const {
          data: { message },
        } = await axios.post("/api/project/delete/", {
          project_id: project.project_id,
          user_id: session?.user.id,
        });
        router.push("/projects");
        enqueueSnackbar(message, { variant: "success" });
      } catch ({ message }) {
        enqueueSnackbar(message, { variant: "error" });
      }
    }
  };

  const [listOfCompetitorIds, selectListOfCompetitorIds] = useState(
    project_competitors?.map((item) => item.competitor_id)
  );

  const [selectedCompetitors, setSelectedCompetitors] = useState(
    competitors.reduce(
      (obj, comp) => ({ ...obj, [comp.competitor_name]: false }),
      {}
    )
  );

  const handleCompetitor = (id) => {
    if (listOfCompetitorIds.includes(id)) {
      const newList = listOfCompetitorIds.filter((item) => item !== id);
      selectListOfCompetitorIds(newList);
    } else {
      selectListOfCompetitorIds([...listOfCompetitorIds, id]);
    }
  };

  const updateProject = async (updatedValues, sapOrderValues) => {
    const userId = session?.user.id;
    const projectId = updatedValues.project_id;

    const sap_order = await postUpdate("/api/sap_order/update", {
      ...sapOrderValues,
      project_id: projectId,
      user_id: userId,
    });
    const competitor = await postUpdate("/api/project_competitor/update", {
      ids: listOfCompetitorIds,
      project_id: projectId,
      user_id: userId,
    });
    const project = await postUpdate("/api/project/update", updatedValues);

    if (sap_order && competitor && project) {
      enqueueSnackbar("Project updated successfully", { variant: "success" });
    }
  };

  const postUpdate = async (url, values) => {
    try {
      const {
        data: { success },
      } = await axios.post(url, values);
      return success;
    } catch (error) {
      enqueueSnackbar(error?.message, { variant: "error" });
    }
  };

  return (
    <div className="flex flex-col py-5 px-5 gap-8 bg-[#f7f6f3] rounded-md box-border animate-[rise_1s_ease-in-out] w-full">
      <div className="w-full flex justify-between items-center flex-row">
        <div className="flex flex-row self-start gap-5">
          <button
            className="hover:cursor-pointer w-10 h-10 rounded-md flex justify-center items-center border border-solid border-[#d9d9d9] text-[#313131] font-bold -rotate-90"
            onClick={() => router.push("/projects/")}
          >
            <MdOutlineExpandLess size={35} />
          </button>
          <p className="flex items-center gap-3 text-2xl">
            <AiOutlineFundProjectionScreen />
            <span>Project #{project.project_id}</span>
            <span
              className={project.is_active ? "hidden" : "flex text-red-600"}
            >
              (inactive)
            </span>
          </p>
        </div>
        <div>
          {disabled ? (
            <button
              className={
                project.is_active
                  ? "bg-[#f08938] flex justify-center items-center flex-row w-36 h-10 rounded-md text-base text-white transform-none border-none gap-3 hover:bg-[#b8682a] hover:cursor-pointer"
                  : "hidden"
              }
              onClick={() => {
                setDisabled(!disabled);
                setDropdown(false);
              }}
            >
              <MdModeEditOutline />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex text-base gap-5 self-end [&>button]:w-36 [&>button]:rounded-md [&>button]:border-none [&>button]:hover:cursor-pointer">
              <span className="w-12 flex justify-center items-center hover:cursor-pointer hover:scale-125">
                <FaTrashAlt size={23} color="red" onClick={handleDelete} />
              </span>
              <button
                type="button"
                className="bg-[#e4e2dd] text-[#313131]"
                onClick={() => {
                  formik.handleReset();
                  setDisabled(true);
                  router.refresh();
                }}
              >
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="bg-[#f08938] flex justify-center items-center flex-row w-36 h-10 rounded-md text-base text-white transform-none border-none gap-3 hover:bg-[#b8682a] hover:cursor-pointer"
                onClick={formik.handleSubmit}
              >
                <MdOutlineSaveAs />
                <span>Save</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <Formik>
        <Form
          className="w-full flex flex-col justify-center"
          onSubmit={formik.handleSubmit}
        >
          <div className="w-full h-full gap-x-0 gap-y-6 flex flex-wrap justify-between [&>*]:gap-2 [&>*]:flex [&>*]:flex-col [&>*]:text-sm text-[#313131] [&>*]:w-[24%] [&>*]:relative [&>div>input]:h-10 [&>div>input]:p-2 [&>div>input]:box-border [&>div>input]:rounded-md [&>div>input]:border [&>div>input]:border-solid [&>div>input]:border-[#d9d9d9] [&>div>select]:h-10 [&>div>select]:p-2 [&>div>select]:box-border [&>div>select]:rounded-md [&>div>select]:border [&>div>select]:border-solid [&>div>select]:border-[#d9d9d9]">
            <div>
              <label htmlFor="sales_org_id">Sales Organization</label>
              <Field
                name="sales_org_id"
                disabled={true}
                type="select"
                as="select"
                value={formik.values.sales_org_id}
                id="sales_org_id"
                placeholder="Enter Sales Organization"
                style={{
                  border: formik.errors.sales_org_id
                    ? "1px solid red"
                    : "1px solid #e0dbd4",
                }}
                onChange={async (e) => {
                  formik.setFieldValue("sales_org_id", e.target.value);
                  formik.setFieldValue("state", "");
                  formik.setFieldValue("region", "");
                  const newStates = states.filter(
                    (item) => item.sales_org_id == e.target.value
                  );
                  const newRegions = regions.filter(
                    (region) => region.sales_org_id == e.target.value
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
                disabled={disabled}
                name="project_name"
                type="text"
                id="project_name"
                value={formik.values.project_name}
                placeholder="Enter Project Name"
                style={{
                  border: formik.errors.project_name
                    ? "1px solid red"
                    : "1px solid #e0dbd4",
                }}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              />
            </div>
            <div>
              <label htmlFor="ranking">Ranking</label>
              <Field
                name="ranking"
                type="select"
                as="select"
                id="ranking"
                disabled={disabled}
                value={formik.values.ranking}
                style={{
                  border: formik.errors.ranking
                    ? "1px solid red"
                    : "1px solid #e0dbd4",
                }}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              >
                <option value={""}>Select Ranking</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </Field>
            </div>
            <div>
              <label htmlFor="state">State</label>
              <Field
                disabled={disabled}
                name="state"
                type="select"
                as="select"
                id="state"
                placeholder="Select State"
                value={formik.values.state}
                style={{
                  border: formik.errors.state
                    ? "1px solid red"
                    : "1px solid #e0dbd4",
                }}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              >
                <option value={""}>Select State</option>
                {states.map((state) => (
                  <option
                    key={state.state_id}
                    value={state.state_id}
                    id="state"
                  >
                    {state.state_long_name}
                  </option>
                ))}
              </Field>
            </div>
            <div>
              <label htmlFor="region">Region</label>
              <Field
                disabled={disabled}
                name="region"
                type="select"
                as="select"
                id="region"
                autoComplete="off"
                placeholder="Select Region"
                style={{
                  border: formik.errors.region
                    ? "1px solid red"
                    : "1px solid #e0dbd4",
                }}
                value={formik.values.region}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              >
                <option>Select Region</option>
                {regions.map(({ region_id, region_name }) => (
                  <option value={region_id} key={region_id}>
                    {region_name}
                  </option>
                ))}
              </Field>
            </div>
            <div>
              <label htmlFor="channel">Channel (direct/dist)</label>
              <Field
                disabled={disabled}
                name="channel"
                type="select"
                as="select"
                id="channel"
                placeholder="Select Channel"
                value={formik.values.channel}
                style={{
                  border: formik.errors.channel
                    ? "1px solid red"
                    : "1px solid #e0dbd4",
                }}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              >
                {channel.map(({ channel_id, channel_name }) => (
                  <option value={channel_id} key={channel_id}>
                    {channel_name}
                  </option>
                ))}
              </Field>
            </div>
            <div>
              <label htmlFor="status">Status</label>
              <Field
                disabled={disabled}
                name="status"
                type="select"
                id="status"
                as="select"
                placeholder="Select Status"
                value={formik.values.status}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              >
                <option value={"Open"}>Open</option>
                <option value={"Closed"}>Closed</option>
              </Field>
            </div>
            <div>
              <label htmlFor="won_lost">Won / Lost</label>
              <Field
                disabled={disabled}
                name="won_lost"
                type="select"
                id="won_lost"
                as="select"
                placeholder="Select Won / Lost"
                value={formik.values.won_lost}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              >
                <option value={"Pending"}>Pending</option>
                <option value={"Won"}>Won</option>
                <option value={"Lost"}>Lost</option>
              </Field>
            </div>
            <div>
              <label htmlFor="created_date">Created Date</label>
              <Field
                disabled={disabled}
                name="created_date"
                type="date"
                placeholder="Enter Created Date"
                id="created_date"
                value={formik.values.created_date}
                style={{
                  border: formik.errors.created_date
                    ? "1px solid red"
                    : "1px solid #e0dbd4",
                }}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              />
            </div>
            <div>
              <label htmlFor="created_by">Created By</label>
              <Field
                disabled={true}
                name="created_by"
                type="text"
                id="created_by"
                value={formik.values.created_by}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              />
            </div>
            <div>
              <label htmlFor="modified_date">Modified Date</label>
              <Field
                disabled={true}
                name="modified_date"
                type="date"
                id="modified_date"
                value={formik.values.modified_date}
                style={{
                  border: formik.errors.modified_date
                    ? "1px solid red"
                    : "1px solid #e0dbd4",
                }}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              />
            </div>
            <div>
              <label htmlFor="modified_by">Modified By</label>
              <Field
                disabled={true}
                name="modified_by"
                type="text"
                id="modified_by"
                value={formik.values.modified_by}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              />
            </div>
            <div>
              <label htmlFor="vertical_market">Vertical Market</label>
              <Field
                disabled={disabled}
                name="vertical_market"
                type="select"
                as="select"
                id="vertical_market"
                placeholder="Select Vertical Market"
                value={formik.values.vertical_market}
                style={{
                  border: formik.errors.vertical_market
                    ? "1px solid red"
                    : "1px solid #e0dbd4",
                }}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              >
                {vertical_market.map(
                  ({ vertical_market_id, vertical_market_name }) => (
                    <option value={vertical_market_id} key={vertical_market_id}>
                      {vertical_market_name}
                    </option>
                  )
                )}
              </Field>
            </div>
            <div>
              <label htmlFor="general_contractor">General Contractor</label>
              <Field
                disabled={disabled}
                name="general_contractor"
                type="text"
                id="general_contractor"
                placeholder="Enter General Contractor"
                value={formik.values.general_contractor}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              />
            </div>
            <div>
              <label htmlFor="electrical_contractor">
                Electrical Contractor
              </label>
              <Field
                disabled={disabled}
                name="electrical_contractor"
                type="text"
                id="electrical_contractor"
                placeholder="Enter Electrical Contractor"
                value={formik.values.electrical_contractor}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              />
            </div>
            <div>
              <label htmlFor="competitors">Competitors</label>
              <button
                onClick={() => setDropdown(!dropdown)}
                disabled={disabled}
                type="button"
                className="flex text-center justify-between border border-solid border-[#d9d9d9] p-2 box-border rounded-md"
                value={formik.values.competitor}
                id="competitors"
              >
                {listOfCompetitorIds?.length
                  ? `${listOfCompetitorIds.length} competitors selected`
                  : "Select competitors"}
                <RiArrowDownSLine
                  size={20}
                  style={{
                    transform: dropdown ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "all 0.1s ease-in-out",
                  }}
                />
              </button>
              {dropdown && (
                <div className="absolute mt-20 bg-[#d5d2d292] w-full z-10 flex flex-col py-2 box-border max-h-40 overflow-y-scroll border border-solid border-[#525151] border-t-0 hover:cursor-pointer">
                  {competitors.map(({ competitor_id, competitor_name }) => (
                    <fieldset
                      key={competitor_id}
                      className="flex flex-row items-center gap-2 hover:bg-[#313131] hover:text-white w-full px-2"
                    >
                      <input
                        onChange={(e) => {
                          setSelectedCompetitors({
                            ...selectedCompetitors,
                            [competitor_name]: e.target.checked,
                          });
                        }}
                        onClick={() => handleCompetitor(competitor_id)}
                        checked={listOfCompetitorIds.includes(competitor_id)}
                        id={`input-${competitor_id}`}
                        type="checkbox"
                      />
                      <label
                        htmlFor={`input-${competitor_id}`}
                        className="w-full hover:cursor-pointer h-10 items-center flex"
                      >
                        {competitor_name}
                      </label>
                    </fieldset>
                  ))}
                </div>
              )}
            </div>
            <div className="!w-[49%]">
              <label htmlFor="notes">Notes</label>
              <Field
                className="h-20 border border-solid border-[#d9d9d9] border-radius text-base p-2 rounded-md"
                disabled={disabled}
                name="notes"
                id="notes"
                type="textarea"
                placeholder="Enter Notes"
                rows="4"
                component="textarea"
                value={formik.values.notes || ""}
                onChange={(event) => {
                  formik.handleChange(event);
                }}
              />
            </div>
            <div className="lg:!w-[49%] !w-full [&>div]:w-full [&>div]:flex [&>div]:flex-wrap [&>div]:justify-between [&>div]:min-h-24 [&>input]:1/3">
              <label htmlFor="notes">
                Won SAP Order ({project_sap_orders.length} orders)
              </label>
              <div className="flex flex-wrap [&>input]:border [&>input]:border-solid [&>input]:border-[#d9d9d9] [&>input]:rounded-md [&>input]:p-2 [&>input]:box-border [&>input]:min-w-60 gap-y-2 gap-x-0 [&>*]:w-[32%]">
                <Field
                  disabled={disabled}
                  name="sap_order_1"
                  id="sap_order_1"
                  type="number"
                  placeholder="Enter SAP Code"
                  value={formik.values.sap_order_1 || ""}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                />
                <Field
                  disabled={disabled}
                  name="sap_order_2"
                  id="sap_order_2"
                  type="number"
                  placeholder="Enter SAP Code"
                  value={formik.values.sap_order_2 || ""}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                />
                <Field
                  disabled={disabled}
                  name="sap_order_3"
                  id="sap_order_3"
                  type="number"
                  placeholder="Enter SAP Code"
                  value={formik.values.sap_order_3 || ""}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                />
                <Field
                  disabled={disabled}
                  name="sap_order_4"
                  id="sap_order_4"
                  type="number"
                  placeholder="Enter SAP Code"
                  value={formik.values.sap_order_4 || ""}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                />
                <Field
                  disabled={disabled}
                  name="sap_order_5"
                  id="sap_order_5"
                  type="number"
                  placeholder="Enter SAP Code"
                  value={formik.values.sap_order_5 || ""}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                />
                <Field
                  disabled={disabled}
                  name="sap_order_6"
                  id="sap_order_6"
                  type="number"
                  placeholder="Enter SAP Code"
                  value={formik.values.sap_order_6 || ""}
                  onChange={(event) => {
                    formik.handleChange(event);
                  }}
                />
              </div>
            </div>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default ProjectFormik;
