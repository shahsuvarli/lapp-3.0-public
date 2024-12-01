import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  const {
    values: {
      sales_org_id,
      project_name,
      ranking,
      general_contractor,
      electrical_contractor,
      state,
      region,
      vertical_market,
      status,
      won_lost,
      channel,
      notes,
    },
    user_id,
  } = await req.json();

  try {
    const request = connection.request();

    const result = await request
      .input("sales_org_id", sales_org_id)
      .input("project_name", project_name)
      .input("ranking", ranking)
      .input("general_contractor", general_contractor || null)
      .input("electrical_contractor", electrical_contractor || null)
      .input("state", state)
      .input("region", region)
      .input("vertical_market", vertical_market)
      .input("status", status)
      .input("won_lost", won_lost)
      .input("channel", channel)
      .input("notes", notes || null)
      .input("created_by", user_id)
      .input("modified_by", user_id).query(`
    INSERT INTO project (
      sales_org_id, project_name, ranking, general_contractor, electrical_contractor, 
      state, region, vertical_market, status, won_lost, channel, created_date, 
      notes, created_by, modified_by, modified_date
    ) 
    OUTPUT inserted.project_id
    VALUES (
      @sales_org_id, @project_name, @ranking, @general_contractor, @electrical_contractor, 
      @state, @region, @vertical_market, @status, @won_lost, @channel, GETDATE(), 
      @notes, @created_by, @modified_by, GETDATE()
    );
  `);

    request.cancel();

    return NextResponse.json({
      data: result.recordset[0].project_id,
      message: "Project was created successfully!",
    });
  } catch (error) {
    return NextResponse.json({
      error: "An error occurred while creating the project.",
    });
  }
}
