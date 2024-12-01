import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  const {
    sales_org_id,
    project_name,
    ranking,
    general_contractor,
    electrical_contractor,
    region,
    state,
    vertical_market,
    won_lost,
    status,
    channel,
    notes,
    date_from,
    date_to,
  } = await req.json();

  try {
    const request = connection.request();

    // Adding SQL query conditions based on provided values
    let conditions = "project.is_active = 1";

    if (project_name)
      conditions += ` AND project.project_name LIKE @project_name`;
    if (sales_org_id) conditions += ` AND project.sales_org_id = @sales_org_id`;
    if (ranking) conditions += ` AND project.ranking = @ranking`;
    if (general_contractor)
      conditions += ` AND project.general_contractor LIKE @general_contractor`;
    if (electrical_contractor)
      conditions += ` AND project.electrical_contractor LIKE @electrical_contractor`;
    if (region) conditions += ` AND project.region = @region`;
    if (state) conditions += ` AND project.state = @state`;
    if (vertical_market)
      conditions += ` AND project.vertical_market = @vertical_market`;
    if (won_lost) conditions += ` AND project.won_lost = @won_lost`;
    if (status) conditions += ` AND project.status = @status`;
    if (channel) conditions += ` AND project.channel = @channel`;
    if (notes) conditions += ` AND project.notes LIKE @notes`;
    if (date_from) conditions += ` AND project.created_date >= @date_from`;
    if (date_to) conditions += ` AND project.created_date <= @date_to`;

    // Input parameters for parameterized query
    request.input("project_name", `%${project_name}%`);
    request.input("sales_org_id", sales_org_id);
    request.input("ranking", ranking);
    request.input("general_contractor", `%${general_contractor}%`);
    request.input("electrical_contractor", `%${electrical_contractor}%`);
    request.input("region", region);
    request.input("state", state);
    request.input("vertical_market", vertical_market);
    request.input("won_lost", won_lost);
    request.input("status", status);
    request.input("channel", channel);
    request.input("notes", `%${notes}%`);
    request.input("date_from", date_from);
    request.input("date_to", date_to);

    const result = await request.query(`
      SELECT
        project.*, 
        so.sales_org, 
        re.region_name, 
        ch.channel_name, 
        vm.vertical_market_name, 
        st.state_long_name, 
        em_cr.name AS cr_name, 
        em_cr.surname AS cr_surname, 
        em_mo.name AS mo_name, 
        em_mo.surname AS mo_surname
      FROM project
      LEFT JOIN sales_org so ON project.sales_org_id = so.sales_org_id
      LEFT JOIN region re ON project.region = re.region_id
      LEFT JOIN channel ch ON project.channel = ch.channel_id
      LEFT JOIN vertical_market vm ON project.vertical_market = vm.vertical_market_id
      LEFT JOIN state st ON project.state = st.state_id
      LEFT JOIN employees em_cr ON project.created_by = em_cr.employee_id
      LEFT JOIN employees em_mo ON project.modified_by = em_mo.employee_id
      WHERE ${conditions}
      ORDER BY project.project_id DESC;
    `);

    return NextResponse.json({
      data: result.recordset,
      message: "Project list updated successfully!",
      status: 200,
      ok: true,
    });
  } catch (error) {
    console.error("Error fetching project list:", error);
    return NextResponse.json({
      message: "Failed to update the project list!",
      status: 500,
      ok: false,
      error: error.message,
    });
  }
}
