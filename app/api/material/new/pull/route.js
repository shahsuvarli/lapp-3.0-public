import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  try {
    const materialData = await req.json();

    // Check if materialData is empty
    if (!Array.isArray(materialData) || materialData.length === 0) {
      return NextResponse.json(
        { message: "No material data provided." },
        { status: 400 }
      );
    }

    // Create array of material IDs and prepare them for the query
    const arrayOfIds = materialData.map((item) =>
      item.material_id.toUpperCase()
    );
    const concatenatedString = arrayOfIds
      .map((id) => "'" + id + "'")
      .join(", ");

    const result = [];

    // Prepare the SQL query
    const query = `
      SELECT 
        material.*, 
        material_sales_org.uom, 
        material_sales_org.level_5_base_cu, 
        material_sales_org.low_discount, 
        material_sales_org.high_discount, 
        material_sales_org.average_discount, 
        material_sales_org.copper_weight, 
        material_sales_org.cost_full_copper 
      FROM material
      LEFT JOIN material_sales_org 
        ON material_sales_org.material_id = material.material_id 
        AND material_sales_org.sales_org_id = material.sales_org_id
      WHERE material.material_id IN (${concatenatedString})
    `;

    // Execute query with parameterized values
    const request = connection.request();
    const result1 = await request.query(query, arrayOfIds);

    // Process the found materials and map results
    const updatedFoundMaterials = result1.recordset.map((item) => ({
      ...item,
      uom: item.uom || "",
      level_5_base_cu: item.level_5_base_cu || "",
      low_discount: item.low_discount || "",
      high_discount: item.high_discount || "",
      average_discount: item.average_discount || "",
      copper_base_price: item.copper_base_price || "",
      full_base_price: item.full_base_price || "",
      margin_full_copper: item.margin_full_copper || "",
      line_value: item.line_value || "",
      line_cogs: item.line_cogs || "",
      copper_weight: item.copper_weight || "",
      cost_full_copper: item.cost_full_copper || "",
    }));

    const idsOfFoundMaterials = updatedFoundMaterials.map((item) =>
      item.material_id.toUpperCase()
    );

    // Loop through each material and check if found in the query result
    for (let i = 0; i < arrayOfIds.length; i++) {
      const value = arrayOfIds[i];
      const index = idsOfFoundMaterials.indexOf(value);

      if (index === -1) {
        result.push({ ...materialData[i], found: false });
      } else {
        const foundMaterial = {
          ...updatedFoundMaterials[index],
          quantity: materialData[i].quantity,
          line_notes: materialData[i].line_notes,
          discount_percent: materialData[i].discount_percent, // Use 'i' here instead of 'index'
          found: true,
        };
        result.push(foundMaterial);
      }
    }

    // Add an ID field to the response items
    const newRes = result.map((item, index) => ({ ...item, id: index }));

    // Return a success response
    return NextResponse.json({
      data: newRes,
      message: "New materials successfully added!",
    });
  } catch (error) {
    // Handle the error and return a proper response
    return NextResponse.json(
      {
        message: "An error occurred while processing the materials.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
