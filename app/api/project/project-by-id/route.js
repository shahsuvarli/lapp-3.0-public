import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function GET(req) {
  const params = new URL(req.url).searchParams;
  const project_id = params.get("project_id");
  const request = connection.request();

  try {
    // Parameterize the query to avoid SQL injection
    const projectQuery = await request.input("project_id1", project_id) // Using input binding to safely pass parameters
      .query(`
          SELECT TOP 1 pr.*,
            created.name AS created_name, created.surname AS created_surname,
            modified.name AS modified_name, modified.surname AS modified_surname
          FROM project pr
          LEFT JOIN employees AS created ON pr.created_by = created.employee_id
          LEFT JOIN employees AS modified ON pr.modified_by = modified.employee_id
          WHERE pr.project_id = @project_id1
        `);

    const project = projectQuery.recordset[0];

    if (!project) {
      throw new Error(`Project with ID ${project_id} not found`);
    }

    // Fetching related records with parameterized queries
    const project_competitors = await request.input("project_id2", project_id)
      .query(`
          SELECT * FROM project_competitor WHERE project_id = @project_id2 AND is_active = 1
        `);

    const project_sap_orders = await request.input("project_id3", project_id)
      .query(`
          SELECT project_id, sap_order_id FROM project_sap_order WHERE project_id = @project_id3 AND is_active = 1
        `);

    const quotes = await request.input("project_id4", project.project_id)
      .query(`
          SELECT quote.*, customer.customer_name, account_manager.account_manager, dsm.dsm 
          FROM quote
          LEFT JOIN customer ON quote.sap_customer_id = customer.sap_id
          LEFT JOIN account_manager ON quote.account_manager_id = account_manager.account_manager_id
          LEFT JOIN dsm ON quote.dsm_id = dsm.dsm_id
          WHERE quote.project_id = @project_id4 AND quote.is_active = 1
          ORDER BY quote.quote_id DESC, quote.quote_version DESC
        `);

    const sales_org = await request.query(`SELECT * FROM sales_org`);

    const vertical_market = await request.query(
      `SELECT * FROM vertical_market`
    );

    const channel = await request.query(`SELECT * FROM channel`);

    const region = await request.input("sales_org_id1", project.sales_org_id)
      .query(`
          SELECT * FROM region WHERE sales_org_id = @sales_org_id1 AND is_active = 1
        `);

    const state = await request
      .input("sales_org_id2", project.sales_org_id)
      .query(`SELECT * FROM state WHERE sales_org_id = @sales_org_id2`);

    const competitors = await request
      .input("sales_org_id3", project.sales_org_id)
      .query(`SELECT * FROM competitor WHERE sales_org_id = @sales_org_id3`);

    const customer = await request.query("SELECT * FROM customer");

    const data = {
      project: JSON.parse(JSON.stringify(project)),
      project_competitors: JSON.parse(
        JSON.stringify(project_competitors.recordset)
      ),
      project_sap_orders: JSON.parse(
        JSON.stringify(project_sap_orders.recordset)
      ),
      quotes: JSON.parse(JSON.stringify(quotes.recordset)),
      sales_org: JSON.parse(JSON.stringify(sales_org.recordset)),
      vertical_market: JSON.parse(JSON.stringify(vertical_market.recordset)),
      channel: JSON.parse(JSON.stringify(channel.recordset)),
      region: JSON.parse(JSON.stringify(region.recordset)),
      state: JSON.parse(JSON.stringify(state.recordset)),
      competitors: JSON.parse(JSON.stringify(competitors.recordset)),
      customer: JSON.parse(JSON.stringify(customer.recordset)),
    };

    // Return the results
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching project data:", error);
    throw new Error(`Failed to fetch project data: ${error.message}`);
  }
}
