import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  const {
    sales_org_id,
    project_name,
    region,
    vertical_market,
    status,
    won_lost,
    value_from,
    value_to,
    cost_from,
    cost_to,
    customer_name,
    sap_id,
    country,
    account_manager,
    dsm,
    date_from,
    date_to,
  } = await req.json();

  try {
    const request = connection.request();

    // Constructing the WHERE clause dynamically
    let conditions = "quote.is_active = 1"; // Base condition

    if (sales_org_id)
      conditions += ` AND sales_org.sales_org_id = @sales_org_id`;
    if (project_name)
      conditions += ` AND project.project_name LIKE @project_name`;
    if (region) conditions += ` AND region.region_id = @region`;
    if (vertical_market)
      conditions += ` AND vertical_market.vertical_market_id = @vertical_market`;
    if (status) conditions += ` AND project.status = @status`;
    if (won_lost) conditions += ` AND project.won_lost = @won_lost`;
    if (value_from) conditions += ` AND quote.quote_value >= @value_from`;
    if (value_to) conditions += ` AND quote.quote_value <= @value_to`;
    if (cost_from) conditions += ` AND quote.quote_cost >= @cost_from`;
    if (cost_to) conditions += ` AND quote.quote_cost <= @cost_to`;
    if (customer_name)
      conditions += ` AND customer.customer_name LIKE @customer_name`;
    if (sap_id) conditions += ` AND customer.sap_id = @sap_id`;
    if (country) conditions += ` AND customer.country = @country`;
    if (account_manager)
      conditions += ` AND project.account_manager = @account_manager`;
    if (dsm) conditions += ` AND dsm.dsm_id = @dsm`;
    if (date_from) conditions += ` AND quote.created_date >= @date_from`;
    if (date_to) conditions += ` AND quote.created_date <= @date_to`;

    // Add input parameters for query
    request.input("sales_org_id", sales_org_id);
    request.input("project_name", `%${project_name}%`);
    request.input("region", region);
    request.input("vertical_market", vertical_market);
    request.input("status", status);
    request.input("won_lost", won_lost);
    request.input("value_from", value_from);
    request.input("value_to", value_to);
    request.input("cost_from", cost_from);
    request.input("cost_to", cost_to);
    request.input("customer_name", `%${customer_name}%`);
    request.input("sap_id", sap_id);
    request.input("country", country);
    request.input("account_manager", account_manager);
    request.input("dsm", dsm);
    request.input("date_from", date_from);
    request.input("date_to", date_to);

    // Query execution
    const result = await request.query(`
      SELECT 
        quote.*, 
        project.project_name, 
        state.state_long_name, 
        project.status, 
        project.won_lost, 
        customer.customer_name, 
        customer.sap_id AS customer_sap_id, 
        customer.country AS customer_country, 
        customer.city AS customer_city, 
        customer.state AS customer_state, 
        project.electrical_contractor, 
        account_manager.account_manager, 
        dsm.dsm, 
        region.region_name, 
        vertical_market.vertical_market_name, 
        sales_org.sales_org, 
        employees.name AS emp_name, 
        employees.surname AS emp_surname
      FROM quote
      LEFT JOIN project ON project.project_id = quote.project_id
      LEFT JOIN sales_org ON sales_org.sales_org_id = project.sales_org_id
      LEFT JOIN state ON state.state_id = project.state
      LEFT JOIN region ON region.region_id = project.region
      LEFT JOIN vertical_market ON vertical_market.vertical_market_id = project.vertical_market
      LEFT JOIN customer ON customer.sap_id = quote.sap_customer_id
      LEFT JOIN account_manager ON account_manager.account_manager_id = quote.account_manager_id
      LEFT JOIN dsm ON dsm.dsm_id = quote.dsm_id
      LEFT JOIN employees ON employees.employee_id = quote.created_by
      WHERE ${conditions}
      ORDER BY quote.id DESC
    `);

    return NextResponse.json({
      data: result.recordset,
      message: "Quote list updated successfully!",
    });
  } catch (error) {
    console.error("Error updating quote list:", error);
    return NextResponse.json(
      {
        message: "Failed to update the quote list!",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
