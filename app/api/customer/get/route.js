import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  const { customer_name, sap_id, country, state, city } = await req.json();

  try {
    const request = connection.request();

    // Add parameters conditionally for security
    if (customer_name) {
      request.input("customer_name", `%${customer_name}%`);
    }
    if (sap_id) {
      request.input("sap_id", sap_id);
    }
    if (country) {
      request.input("country", country);
    }
    if (state) {
      request.input("state", state);
    }
    if (city) {
      request.input("city", city);
    }

    // Dynamically build the query string based on provided inputs
    const query = `
      SELECT * FROM customer WHERE sap_id IS NOT NULL
      ${customer_name ? "AND customer_name LIKE @customer_name" : ""}
      ${sap_id ? "AND sap_id = @sap_id" : ""}
      ${country ? "AND country = @country" : ""}
      ${state ? "AND state = @state" : ""}
      ${city ? "AND city = @city" : ""}
    `;

    // Execute the parameterized query
    const result = await request.query(query);
    request.cancel();

    return NextResponse.json({
      result: result.recordset,
      message: "Customer list updated!",
    });
  } catch (error) {
    console.error("Error fetching customer list:", error); // Log for debugging
    return NextResponse.json({
      message: "Failed to update the customer list!",
      success: false,
    });
  }
}
