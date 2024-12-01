import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Field, FieldArray, Form, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { TiDelete } from "react-icons/ti";
import { TbNumber } from "react-icons/tb";
import { IoSave } from "react-icons/io5";
import { IoDuplicate } from "react-icons/io5";
import { useRouter } from "next/navigation";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { formFields } from "utils/materialInputs";
import { materialWindow } from "utils/store/crmSlice";

function Material({ quote, material }) {
  const [discountType, setDiscountType] = useState(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const {
          data: { data, message },
        } = await axios.post(`/api/material/edit/get`, {
          quote_id: quote.quote_id,
          quote_version: quote.quote_version,
        });

        formik.setValues({ rows: [...data] });
        enqueueSnackbar(message, { variant: "success" });
      } catch ({ message }) {
        enqueueSnackbar(message, { variant: "error" });
      }
    };

    fetchMaterial();
  }, [material]);

  const router = useRouter();
  const blankData = {
    id: 0,
    material_id: "",
    quantity: "",
    uom: "",
    stock_6100: "",
    stock_6120: "",
    stock_6130: "",
    stock_6140: "",
    description: "",
    line_notes: "",
    product_family: "",
    level_5_base_cu: "",
    low_discount: "",
    average_discount: "",
    high_discount: "",
    discount_percent: "",
    copper_base_price: "",
    full_base_price: "",
    margin_full_copper: "",
    line_value: "",
    line_cogs: "",
    found: false,
  };
  const [rows, setRows] = useState([blankData]);

  const formik = useFormik({
    initialValues: { rows },
    enableReinitialize: true,
    onSubmit: ({ setSubmitting }) => {
      if (formik.isValid) {
        handleUpdate();
      } else {
        setSubmitting(false);
      }
    },
    validationSchema: Yup.object().shape({
      rows: Yup.array().of(
        Yup.object().shape({
          material_id: Yup.string().required("MATERIAL is required"),
          quantity: Yup.number().required("QUANTITY is required"),
          uom: Yup.string().required("UOM is required"),
        })
      ),
    }),
  });

  const { materialPopup } = useSelector((state) => state.crm);
  const dispatch = useDispatch();

  const handleUpdate = async () => {
    try {
      const {
        data: { message },
      } = await axios.post(`/api/material/edit/update/`, {
        values: formik.values.rows,
        quote,
      });

      router.refresh();
      dispatch(materialWindow(false));
      enqueueSnackbar(message, { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to update the material list!", {
        variant: "error",
      });
    }
  };

  const handleRevise = async () => {
    try {
      const {
        data: { data, message },
      } = await axios.post(`/api/material/edit/revise`, {
        values: formik.values.rows,
        quote,
      });

      router.push(`/projects/${quote.project_id}/${data}`);
      handleWindow();
      enqueueSnackbar(message, { variant: "success" });
      router.refresh();
    } catch (error) {
      throw new Error(error);
    }
  };

  const deleteRow = (index) => {
    const values = formik.values.rows;
    const newRows = values.filter((row) => row.id != index);
    setRows(newRows);
  };

  const handleDiscount = (event, id) => {
    if (event.keyCode === 13) {
      const selectedMaterialData = formik.values.rows.find(
        (item) => item.id === id
      );

      const {
        level_5_base_cu,
        copper_weight,
        discount_percent,
        cost_full_copper,
        uom,
        quantity,
      } = selectedMaterialData;

      switch (discountType) {
        case "full_copper_price":
          selectedMaterialData.copper_base_price = parseFloat(
            level_5_base_cu * (1 - discount_percent / 100)
          ).toFixed(2);
          break;

        case "copper_base_price":
          selectedMaterialData.full_base_price = parseFloat(
            Number(selectedMaterialData.copper_base_price) +
              (Number(quote.copper_rate) - 1.2) * copper_weight
          ).toFixed(2);
          break;

        case null:
          selectedMaterialData.copper_base_price = parseFloat(
            level_5_base_cu * (1 - discount_percent / 100)
          ).toFixed(2);

          selectedMaterialData.full_base_price = parseFloat(
            Number(selectedMaterialData.copper_base_price) +
              (Number(quote.copper_rate) - 1.2) * copper_weight
          ).toFixed(2);
      }

      selectedMaterialData.margin_full_copper = parseFloat(
        (selectedMaterialData.full_base_price - cost_full_copper) /
          selectedMaterialData.full_base_price
      ).toFixed(2);

      const divisor = uom === "Meter" || uom === "Feet" ? 1000 : 1;

      selectedMaterialData.line_value = parseFloat(
        (selectedMaterialData.full_base_price * quantity) / divisor
      ).toFixed(2);

      selectedMaterialData.line_cogs = parseFloat(
        (cost_full_copper * quantity) / divisor
      ).toFixed(2);

      setDiscountType(null);

      formik.setValues({
        rows: [...formik.values.rows],
      });
    }
  };

  const handleCopperBasePrice = (event, id) => {
    setDiscountType("copper_base_price");
    if (event.keyCode === 13) {
      const selectedMaterialData = formik.values.rows.find(
        (item) => item.id === id
      );

      const { copper_base_price, level_5_base_cu } = selectedMaterialData;

      selectedMaterialData.discount_percent = parseFloat(
        100 * (1 - Number(copper_base_price) / Number(level_5_base_cu))
      ).toFixed(2);

      formik.setValues({
        rows: [...formik.values.rows],
      });

      handleDiscount(event, id);

      event.target.readOnly = true;
    }
  };

  const handleFullBasePrice = (event, id) => {
    setDiscountType("full_base_price");
    if (event.keyCode === 13) {
      const selectedMaterialData = formik.values.rows.find(
        (item) => item.id === id
      );

      const { full_base_price, copper_weight } = selectedMaterialData;

      selectedMaterialData.copper_base_price = parseFloat(
        Number(full_base_price) -
          (Number(quote.copper_rate) - 1.2) * Number(copper_weight)
      ).toFixed(2);

      formik.setValues({
        rows: [...formik.values.rows],
      });

      handleCopperBasePrice(event, id);

      event.target.readOnly = true;
    }
  };

  const handleWindow = () => {
    dispatch(materialWindow(false));
  };

  const handleSafe = (e) => {
    e.preventDefault();
    dispatch(materialWindow());
  };

  return (
    <div
      className={
        materialPopup
          ? "fixed top-0 left-0 right-0 bottom-0 w-full h-screen bg-[#4845458f] flex justify-center items-center z-[100]"
          : "hidden"
      }
      onClick={handleWindow}
    >
      <div
        className="rounded-ms w-11/12 h-[80vh] bg-white flex flex-col items-center p-5 gap-2 relative box-border animate-[rise_1s_ease-in-out]"
        onClick={handleSafe}
      >
        <p className="text-2xl">Edit Materials</p>
        <div className="overflow-y-scroll w-full py-7 px-5 box-border border-[0.5px] border-solid border-[#7b7a7a4a] rounded-md">
          <FormikProvider value={formik}>
            <Form onSubmit={formik.handleSubmit}>
              <FieldArray name="rows">
                {() => (
                  <div>
                    <table>
                      <thead>
                        <tr>
                          <th className="font-bold text-[#737373] align-text-top">
                            <TbNumber size={20} color="dimgrey" />
                          </th>
                          <th className="font-bold text-[#737373] align-text-top">
                            <TiDelete size={25} color="dimgrey" />
                          </th>
                          {formFields.map((head) => (
                            <th
                              key={head.id}
                              className="font-bold text-[#737373] align-text-top"
                            >
                              {head.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {formik.values.rows.map((data, index) => (
                          <tr
                            key={index}
                            className="[&>td>input]:h-10 [&>td>input]:p-2 [&>td>input]:w-24 [&>td>input]:box-border [&>td>input]:border [&>td>input]:border-solid [&>td>input]:border-[#d9d9d9] [&>td>input]:text-base [&>td>input]:placeholder:text-base [&>td>input]:placeholder:text-[#999998] [&>td>input]:rounded-sm"
                          >
                            <td>{index + 1}.</td>
                            <td>
                              <button
                                type="button"
                                className="h-7 w-10 rounded-md border-none text-[#f24441bb] font-bold hover:bg-[#c60303] hover:text-white disabled:bg-[#f2444150] disabled:hover:cursor-not-allowed"
                                onClick={(event) => {
                                  deleteRow(data.id);
                                  event.target.blur();
                                }}
                              >
                                X
                              </button>
                            </td>
                            <td>
                              <Field
                                type="text"
                                id={`${index}-material_id`}
                                name={`rows[${index}].material_id`}
                                placeholder="Material"
                                style={{
                                  border: formik.errors.rows?.at(index)
                                    .material_id
                                    ? "1px solid red"
                                    : "1px solid #e0dbd4",
                                }}
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-quantity`}
                                name={`rows[${index}].quantity`}
                                placeholder="Quantity"
                                style={{
                                  border: formik.errors.rows?.at(index).quantity
                                    ? "1px solid red"
                                    : "1px solid #e0dbd4",
                                }}
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                                onWheel={(event) => {
                                  event.target.blur();
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="text"
                                id={`${index}-uom`}
                                name={`rows[${index}].uom`}
                                placeholder="UOM"
                                disabled
                                style={{
                                  border: formik.errors.rows?.at(index).uom
                                    ? "1px solid red"
                                    : "1px solid #e0dbd4",
                                }}
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-stock_6100`}
                                name={`rows[${index}].stock_6100`}
                                placeholder="Stock in 6100"
                                disabled
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-stock_6120`}
                                name={`rows[${index}].stock_6120`}
                                placeholder="Stock in 6120"
                                disabled
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-stock_6130`}
                                name={`rows[${index}].stock_6130`}
                                placeholder="Stock in 6130"
                                disabled
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-stock_6140`}
                                name={`rows[${index}].stock_6140`}
                                placeholder="Stock in 6140"
                                disabled
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-low_discount`}
                                name={`rows[${index}].low_discount`}
                                placeholder="Low Discount"
                                disabled
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-average_discount`}
                                name={`rows[${index}].average_discount`}
                                placeholder="Average Discount"
                                disabled
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-high_discount`}
                                name={`rows[${index}].high_discount`}
                                placeholder="High Discount"
                                disabled
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="text"
                                id={`${index}-line_notes`}
                                name={`rows[${index}].line_notes`}
                                placeholder="Notes"
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-level_5_base_cu`}
                                name={`rows[${index}].level_5_base_cu`}
                                placeholder="Base Copper Price"
                                disabled
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                              />
                            </td>

                            <td>
                              <Field
                                type="number"
                                id={`${index}-discount`}
                                name={`rows[${index}].discount_percent`}
                                placeholder="Discount %"
                                onKeyDown={(event) =>
                                  handleDiscount(event, data.id)
                                }
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                                onWheel={(event) => {
                                  event.target.blur();
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-copper_base_price`}
                                name={`rows[${index}].copper_base_price`}
                                placeholder="Enter Copper Base Price"
                                readOnly
                                style={{
                                  border: formik.errors.rows?.at(index)
                                    .copper_base_price
                                    ? "1px solid red"
                                    : "1px solid #e0dbd4",
                                }}
                                onKeyDown={(event) => {
                                  handleCopperBasePrice(event, data.id);
                                }}
                                onWheel={(event) => {
                                  event.target.blur();
                                }}
                                onDoubleClick={(event) => {
                                  event.target.readOnly = false;
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-full_base_price`}
                                name={`rows[${index}].full_base_price`}
                                placeholder="Enter Full Base Price"
                                readOnly
                                onKeyDown={(event) =>
                                  handleFullBasePrice(event, data.id)
                                }
                                onWheel={(event) => {
                                  event.target.blur();
                                }}
                                onDoubleClick={(event) => {
                                  event.target.readOnly = false;
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-margin_full_copper`}
                                name={`rows[${index}].margin_full_copper`}
                                placeholder="Margin at Full Copper"
                                disabled
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-line_value`}
                                name={`rows[${index}].line_value`}
                                placeholder="Line Value"
                                disabled
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-line_cogs`}
                                name={`rows[${index}].line_cogs`}
                                placeholder="Line COGS"
                                disabled
                              />
                            </td>
                            <td>
                              <Field
                                type="text"
                                id={`${index}-description`}
                                name={`rows[${index}].description`}
                                placeholder="Material Description"
                                disabled
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                              />
                            </td>
                            <td>
                              <Field
                                type="text"
                                id={`${index}-product_family`}
                                name={`rows[${index}].product_family`}
                                placeholder="Product Family"
                                disabled
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="absolute bottom-5 right-5 flex justify-between items-center box-border gap-6">
                      <button
                        type="button"
                        className="w-36 rounded-md h-10 border border-solid border-[#e7914e] text-base text-[#e7914e] bg-white  flex gap-2 justify-center items-center hover:bg-[#e5ac7f] hover:text-white hover:opacity-90"
                        onClick={formik.handleSubmit}
                      >
                        <span className="flex justify-center items-center">
                          <IoSave size={20} />
                        </span>
                        <span>Update</span>
                      </button>
                      <button
                        type="button"
                        className="w-40 rounded-md h-10 border border-solid border-[#e7914e] text-base text-white bg-[#e7914e] flex gap-5 justify-center items-center hover:bg-[#e5ac7f] hover:text-white hover:opacity-90"
                        onClick={handleRevise}
                      >
                        <span className="flex justify-center items-center">
                          <IoDuplicate size={20} />
                        </span>
                        <span>Revise</span>
                      </button>
                    </div>
                  </div>
                )}
              </FieldArray>
            </Form>
          </FormikProvider>
        </div>
      </div>
    </div>
  );
}

export default Material;
