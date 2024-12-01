import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { newMaterialWindow } from "utils/store/crmSlice";
import { Field, FieldArray, Form, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { TiDelete } from "react-icons/ti";
import { RxUpdate } from "react-icons/rx";
import { MdPlaylistAdd } from "react-icons/md";
import { IoSave } from "react-icons/io5";
import { IoDuplicate } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { formFields } from "utils/materialInputs";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { v4 as uuid } from "uuid";

function NewMaterial({ quote }) {
  const [discountType, setDiscountType] = useState(null);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Perform actions before the component unloads
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
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
    is_manual_overwrite: false,
  };
  const [rows, setRows] = useState([blankData]);

  const formik = useFormik({
    initialValues: { rows },
    enableReinitialize: true,
    onSubmit: ({ rows }, { setSubmitting }) => {
      if (formik.isValid) {
        handleSave();
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

  const [id, setId] = useState(1);

  const { newMaterialPopup } = useSelector((state) => state.crm);
  const dispatch = useDispatch();

  const handleSave = async () => {
    try {
      await axios.post(`/api/material/new/save/`, {
        values: [...formik.values.rows],
        quote,
      });

      router.refresh();
      formik.setValues({ rows: [blankData] });
      dispatch(newMaterialWindow(false));
    } catch (error) {
      throw new Error(error);
    }
  };

  const callMaterials = async () => {
    try {
      const {
        data: { data, message },
      } = await axios.post(`/api/material/new/pull/`, formik.values.rows);

      formik.setValues(() => ({ rows: data }));
      enqueueSnackbar(message, { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to add new materials!", { variant: "error" });
    }
  };

  const handleRevise = async () => {
    formik.validateForm().then((err) => {
      if (!err.rows) {
        setTimeout(async () => {
          try {
            const {
              data: { data, message },
            } = await axios.post(`/api/material/new/revise`, {
              values: formik.values.rows,
              quote,
            });

            router.push(`/projects/${quote.project_id}/${data}`);
            formik.setValues({ rows: [blankData] });
            handleWindow();
            enqueueSnackbar(message, { variant: "success" });
          } catch ({ message }) {
            enqueueSnackbar(message, { variant: "error" });
          }
        }, 1000);
      } else {
        formik.handleSubmit();
      }
    });
  };

  const deleteRow = (index) => {
    const values = formik.values.rows;
    if (values.length - 1) {
      const newRows = values.filter((row) => row.id != index);
      setRows(newRows);
    }
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
        is_manual_overwrite,
      } = selectedMaterialData;

      switch (discountType) {
        case "full_copper_price":
          selectedMaterialData.copper_base_price = parseFloat(
            level_5_base_cu * (1 - discount_percent / 100)
          ).toFixed(2);
          break;

        case "copper_base_price":
          // full copper price
          selectedMaterialData.full_base_price = parseFloat(
            Number(selectedMaterialData.copper_base_price) +
              (Number(quote.copper_rate) - 1.2) * copper_weight
          ).toFixed(2);
          break;

        case null:
          selectedMaterialData.copper_base_price = parseFloat(
            level_5_base_cu * (1 - discount_percent / 100)
          ).toFixed(2);
          // full copper price
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

      const { found, full_base_price, copper_weight } = selectedMaterialData;

      if (found) {
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
    }
  };

  const handleWindow = () => {
    dispatch(newMaterialWindow());
  };

  const handleSafe = (e) => {
    e.preventDefault();
    dispatch(newMaterialWindow());
  };

  return (
    <div
      className={
        newMaterialPopup
          ? "fixed top-0 left-0 right-0 bottom-0 w-full h-screen bg-[#4845458f] flex justify-center items-center z-[100]"
          : "hidden"
      }
      onClick={handleWindow}
    >
      <div
        className="rounded-ms w-11/12 h-[80vh] bg-white flex flex-col items-center p-5 gap-2 relative box-border animate-[rise_1s_ease-in-out]"
        onClick={handleSafe}
      >
        <p className="text-2xl">Add New Material(s)</p>
        <div className="overflow-y-scroll w-full py-3 px-3 box-border border-[0.5px] border-solid border-[#7b7a7a4a] rounded-md h-5/6">
          <FormikProvider value={formik}>
            <Form onSubmit={formik.handleSubmit}>
              <FieldArray name="rows">
                {(arrayHelpers) => (
                  <>
                    <table
                      onPaste={(event) => {
                        const data = event.clipboardData.getData("Text");
                        const cleanedString = data.replace(/\\\\/g, "\\");
                        const resultArray = cleanedString.split(/\r\n/);
                        resultArray.map((elem) => {
                          const [matId, matQu] = elem.split(/\t/);
                          arrayHelpers.push({
                            ...blankData,
                            id: uuid(),
                            material_id: matId,
                            quantity: matQu,
                          });
                        });
                      }}
                    >
                      <thead>
                        <tr>
                          <th className="font-bold text-[#737373]">№</th>
                          <th className="border-none flex justify-center items-center font-bold">
                            <TiDelete size={25} color="dimgrey" />
                          </th>
                          {formFields.map((head) => (
                            <th key={head.id} className="text-[#737373]">
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
                            <td className="font-bold text-[#737373]">
                              {index + 1}.
                            </td>
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
                                className="border-2 border-solid border-red-600"
                                style={{
                                  border: formik.errors.rows?.at(index)
                                    ?.material_id
                                    ? "1px solid red"
                                    : "1px solid #e0dbd4",
                                }}
                                placeholder="Material"
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
                                id={`${index}-quantity`}
                                name={`rows[${index}].quantity`}
                                placeholder="Quantity"
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                                style={{
                                  border: formik.errors.rows?.at(index)
                                    ?.quantity
                                    ? "1px solid red"
                                    : "1px solid #e0dbd4",
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
                                onChange={(event) => {
                                  formik.handleChange(event);
                                }}
                                onWheel={(event) => {
                                  event.target.blur();
                                }}
                                style={{
                                  border: formik.errors.rows?.at(index)?.uom
                                    ? "1px solid red"
                                    : "1px solid #e0dbd4",
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
                                id={`${index}-hfigh_discount`}
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
                                id={`${index}-discount_percent`}
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
                                placeholder="Enter Proposed CU BP w/discount"
                                readOnly
                                style={{
                                  border: formik.errors.rows?.at(index)
                                    ?.material_id
                                    ? "1px solid red"
                                    : "1px solid #e0dbd4",
                                }}
                                onKeyDown={(event) => {
                                  handleCopperBasePrice(event, data.id);
                                }}
                                onWheel={(event) => {
                                  event.target.blur();
                                }}
                                onDoubleClick={(event) =>
                                  (event.target.readOnly = false)
                                }
                              />
                            </td>
                            <td>
                              <Field
                                type="number"
                                id={`${index}-full_base_price`}
                                name={`rows[${index}].full_base_price`}
                                placeholder="Enter Full Copper Price"
                                readOnly
                                onKeyDown={(event) => {
                                  handleFullBasePrice(event, data.id);
                                }}
                                onWheel={(event) => {
                                  event.target.blur();
                                }}
                                onDoubleClick={(event) =>
                                  (event.target.readOnly = false)
                                }
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
                              />
                            </td>
                            <td>
                              <Field
                                type="text"
                                id={`${index}-product_family`}
                                name={`rows[${index}].product_family`}
                                placeholder="Product Family"
                                disabled
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="absolute bottom-5 w-11/12 right-10 flex justify-between box-border">
                      <button
                        type="button"
                        className="w-40 rounded-md h-10 border border-solid border-[#e7914e] text-base text-[#e7914e] flex gap-2 justify-center items-center hover:bg-[#e5ac7f] hover:text-white hover:opacity-90"
                        onClick={(event) => {
                          arrayHelpers.push({ ...blankData, id: id + 1 });
                          setId(id + 1);
                          event.target.blur();
                        }}
                      >
                        <span className="flex justify-center items-center">
                          <MdPlaylistAdd size={20} />
                        </span>
                        <p>New Row</p>
                      </button>
                      <div className="flex justify-between items-center box-border gap-5">
                        <button
                          type="button"
                          onClick={callMaterials}
                          className="w-12 rounded-md h-10 border border-solid border-[#e7914e] text-base text-[#e7914e] flex gap-2 justify-center items-center hover:bg-[#e5ac7f] hover:text-white hover:opacity-90"
                        >
                          <span className="flex justify-center items-center">
                            <RxUpdate size={20} />
                          </span>
                        </button>
                        <button
                          type="button"
                          className="w-40 rounded-md h-10 border border-solid border-[#e7914e] text-base text-[#e7914e] flex gap-2 justify-center items-center hover:bg-[#e5ac7f] hover:text-white hover:opacity-90"
                          onClick={formik.handleSubmit}
                        >
                          <span className="flex justify-center items-center">
                            <IoSave size={20} />
                          </span>
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          className="w-40 rounded-md h-10 border border-solid border-[#e7914e] text-base text-white bg-[#e7914e] flex justify-center items-center gap-5 hover:bg-[#e5ac7f] hover:text-white hover:opacity-90"
                          onClick={handleRevise}
                        >
                          <span className="flex justify-center items-center">
                            <IoDuplicate size={20} />
                          </span>
                          <span>Revise</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </FieldArray>
            </Form>
          </FormikProvider>
        </div>
      </div>
    </div>
  );
}

export default NewMaterial;
