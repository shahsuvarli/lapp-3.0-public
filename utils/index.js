import { connection } from "utils/db";

export async function getQuotes() {
  const request = connection.request();

  try {
    const quotesQuery = request.query(`
      SELECT TOP 10 
        quote.*, 
        sales_org.sales_org, 
        project.project_name, 
        project.status, 
        project.won_lost, 
        project.electrical_contractor, 
        state.state_long_name, 
        customer.customer_name, 
        customer.sap_id AS customer_sap_id, 
        customer.city AS customer_city, 
        customer.state AS customer_state, 
        customer.country AS customer_country, 
        account_manager.account_manager, 
        dsm.dsm, 
        region.region_name, 
        vertical_market.vertical_market_name, 
        emp_created.name AS emp_name, 
        emp_created.surname AS emp_surname 
      FROM quote
      LEFT JOIN project ON project.project_id = quote.project_id
      LEFT JOIN sales_org ON sales_org.sales_org_id = project.sales_org_id
      LEFT JOIN state ON state.state_id = project.state
      LEFT JOIN region ON region.region_id = project.region
      LEFT JOIN vertical_market ON vertical_market.vertical_market_id = project.vertical_market
      LEFT JOIN customer ON customer.sap_id = quote.sap_customer_id
      LEFT JOIN account_manager ON account_manager.account_manager_id = quote.account_manager_id
      LEFT JOIN dsm ON dsm.dsm_id = quote.dsm_id
      LEFT JOIN employees emp_created ON emp_created.employee_id = quote.created_by
      WHERE quote.is_active = 1
      ORDER BY id DESC
    `);

    const [
      quotes,
      dsm,
      region,
      vertical_market,
      state,
      sales_org,
      account_manager,
    ] = await Promise.all([
      quotesQuery,
      request.query(`SELECT * FROM dsm`),
      request.query(`SELECT * FROM region`),
      request.query(`SELECT * FROM vertical_market`),
      request.query(`SELECT * FROM state`),
      request.query(`SELECT * FROM sales_org`),
      request.query(`SELECT * FROM account_manager`),
    ]);

    return {
      quotes: quotes.recordset,
      state: state.recordset,
      sales_org: sales_org.recordset,
      account_manager: account_manager.recordset,
      region: region.recordset,
      dsm: dsm.recordset,
      vertical_market: vertical_market.recordset,
    };
  } catch (error) {
    console.error("Error fetching quotes data:", error);
    throw new Error("Failed to fetch quotes data.");
  }
}

export async function getQuote(id) {
  const request = connection.request();

  try {
    // Fetch the customer and quote details concurrently
    const [customer, quote] = await Promise.all([
      request.query(`SELECT * FROM customer`),
      request.input("id", id).query(
        `
        SELECT 
          quote.*, 
          customer.customer_name, 
          customer.country AS customer_country, 
          customer.city AS customer_city, 
          customer.state AS customer_state, 
          em_created.name AS created_name, 
          em_created.surname AS created_surname, 
          em_modified.name AS modified_name, 
          em_modified.surname AS modified_surname
        FROM quote
        LEFT JOIN customer ON customer.sap_id = quote.sap_customer_id
        LEFT JOIN employees em_created ON em_created.employee_id = quote.created_by
        LEFT JOIN employees em_modified ON em_modified.employee_id = quote.modified_by
        LEFT JOIN account_manager ON account_manager.account_manager_id = quote.account_manager_id
        LEFT JOIN dsm ON dsm.dsm_id = quote.dsm_id
        WHERE quote.id = @id
      `
      ),
    ]);

    // Get the project ID from the quote
    const project_id = quote.recordset[0]?.project_id;
    let project = [];
    let sales_org = [];
    let account_manager = [];
    let dsm = [];
    let materials = [];

    if (project_id) {
      // Fetch project data and sales_org, account_manager, and dsm based on project info
      const [
        projectResult,
        salesOrgResult,
        accountManagerResult,
        dsmResult,
        materialsResult,
      ] = await Promise.all([
        request
          .input("project_id", project_id)
          .query(`SELECT * FROM project WHERE project_id = @project_id`),
        request.query(`SELECT * FROM sales_org`),
        request.query(
          `SELECT * FROM account_manager WHERE sales_org_id = (SELECT sales_org_id FROM project WHERE project_id = @project_id)`
        ),
        request.query(
          `SELECT * FROM dsm WHERE sales_org_id = (SELECT sales_org_id FROM project WHERE project_id = @project_id)`
        ),
        request
          .input("quote_id", quote.recordset[0].quote_id)
          .input("quote_version", quote.recordset[0].quote_version)
          .query(
            `
          SELECT 
            material_quoted.*, 
            material_sales_org.uom, 
            material.stock_6100, 
            material.stock_6120, 
            material.stock_6130, 
            material.stock_6140, 
            material.description, 
            material.product_family, 
            material_sales_org.level_5_base_cu, 
            material_sales_org.low_discount, 
            material_sales_org.high_discount, 
            material_sales_org.average_discount, 
            material_sales_org.copper_weight, 
            material_sales_org.cost_full_copper
          FROM material_quoted
          LEFT JOIN material ON material.material_id = material_quoted.material_id
          LEFT JOIN material_sales_org ON material_sales_org.material_id = material.material_id
          WHERE material_quoted.permanent_quote_id = @quote_id 
          AND material_quoted.quote_version = @quote_version
          AND material_quoted.is_active = 1
        `
          ),
      ]);

      project = projectResult.recordset;
      sales_org = salesOrgResult.recordset;
      account_manager = accountManagerResult.recordset;
      dsm = dsmResult.recordset;
      materials = materialsResult.recordset;
    } else {
      console.error("Project ID not found in the quote.");
    }

    // Return all the results
    return {
      customer: customer.recordset,
      quote: quote.recordset[0],
      project,
      sales_org,
      account_manager,
      dsm,
      materials,
    };
  } catch (error) {
    console.error("Error fetching quote data:", error);
    throw new Error("Failed to fetch quote data.");
  }
}

export async function getProjectList() {
  const request = connection.request();
  const projects = await request.query(
    `SELECT top 10
    pr.*, so.sales_org, re.region_name, ch.channel_name, vm.vertical_market_name, st.state_long_name, em_cr.name cr_name, em_cr.surname cr_surname, em_mo.name mo_name, em_mo.surname mo_surname
FROM project AS pr
    LEFT JOIN sales_org so ON pr.sales_org_id=so.sales_org_id
    LEFT JOIN region re ON pr.region=re.region_id
    LEFT JOIN channel ch ON pr.channel=ch.channel_id
    LEFT JOIN vertical_market vm ON pr.vertical_market=vm.vertical_market_id
    LEFT JOIN state st ON pr.state=st.state_id
    LEFT JOIN employees em_cr ON pr.created_by=em_cr.employee_id
    LEFT JOIN employees em_mo ON pr.modified_by=em_mo.employee_id
WHERE pr.is_active=1
ORDER BY pr.project_id DESC`
  );
  const state = await request.query("SELECT * FROM state");
  const vertical_market = await request.query("SELECT * FROM vertical_market");
  const region = await request.query("SELECT * FROM region");
  const channel = await request.query("SELECT * FROM channel");
  const sales_org = await request.query("SELECT * FROM sales_org");
  request.cancel();

  return {
    projects: JSON.parse(JSON.stringify(projects.recordset)),
    state: JSON.parse(JSON.stringify(state.recordset)),
    vertical_market: JSON.parse(JSON.stringify(vertical_market.recordset)),
    region: JSON.parse(JSON.stringify(region.recordset)),
    channel: JSON.parse(JSON.stringify(channel.recordset)),
    sales_org: JSON.parse(JSON.stringify(sales_org.recordset)),
  };
}

