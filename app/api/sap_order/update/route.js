import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  const {
    sap_order_1,
    sap_order_2,
    sap_order_3,
    sap_order_4,
    sap_order_5,
    sap_order_6,
    project_id,
    user_id,
  } = await req.json();

  // Filter and collect SAP orders that are valid numbers
  const sap_orders = [
    sap_order_1,
    sap_order_2,
    sap_order_3,
    sap_order_4,
    sap_order_5,
    sap_order_6,
  ].filter(Number);

  try {
    const request = connection.request();

    // Deactivate existing active SAP orders for the project
    request.input("user_id", user_id);
    request.input("project_id", project_id);

    // Update existing rows by marking them as inactive
    await request.query(`
      UPDATE project_sap_order
      SET is_active = 0, deleted_by = @user_id, deleted_date = GETDATE()
      WHERE is_active = 1 AND project_id = @project_id
    `);

    // If there are new SAP orders, insert them
    if (sap_orders.length > 0) {
      // Add the insert values as parameters dynamically
      sap_orders.forEach((sap_order, index) => {
        request.input(`sap_order_${index}`, sap_order);
      });

      const insertQuery = `
        INSERT INTO project_sap_order (project_id, sap_order_id)
        VALUES ${sap_orders
          .map((_, index) => `(@project_id, @sap_order_${index})`)
          .join(",")}
      `;

      await request.query(insertQuery);
    }

    request.cancel(); // Cancel request as a safety measure

    return NextResponse.json({
      message: "SAP orders updated successfully!",
      success: true,
    });
  } catch (error) {
    return NextResponse.json({
      message: "SAP orders failed to update!",
      success: false,
      error: error.message,
    });
  }
}
