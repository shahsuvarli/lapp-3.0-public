import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function GET() {
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

  const data = {
    projects: JSON.parse(JSON.stringify(projects.recordset)),
    state: JSON.parse(JSON.stringify(state.recordset)),
    vertical_market: JSON.parse(JSON.stringify(vertical_market.recordset)),
    region: JSON.parse(JSON.stringify(region.recordset)),
    channel: JSON.parse(JSON.stringify(channel.recordset)),
    sales_org: JSON.parse(JSON.stringify(sales_org.recordset)),
  };

  return NextResponse.json(data);
}
