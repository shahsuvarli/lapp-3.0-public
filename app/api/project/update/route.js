import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  const {
    project_id,
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
    created_date,
    modified_by,
  } = await req.json();

  try {
    const request = connection.request();

    // Add input parameters to avoid SQL injection
    request.input("project_id", project_id);
    request.input("project_name", project_name);
    request.input("ranking", ranking);
    request.input("general_contractor", general_contractor);
    request.input("electrical_contractor", electrical_contractor);
    request.input("state", state);
    request.input("region", region);
    request.input("vertical_market", vertical_market);
    request.input("status", status);
    request.input("won_lost", won_lost);
    request.input("channel", channel);
    request.input("notes", notes);
    request.input("created_date", created_date);
    request.input("modified_by", modified_by);

    await request.query(
      `
      UPDATE project
      SET 
        modified_date = GETDATE(), 
        modified_by = @modified_by, 
        project_name = @project_name, 
        ranking = @ranking, 
        general_contractor = @general_contractor, 
        electrical_contractor = @electrical_contractor, 
        state = @state, 
        region = @region, 
        vertical_market = @vertical_market, 
        status = @status, 
        won_lost = @won_lost, 
        channel = @channel, 
        created_date = @created_date, 
        notes = @notes
      WHERE 
        project_id = @project_id;
    `
    );

    return NextResponse.json({
      message: "Project updated successfully!",
      success: true,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      {
        message: "Failed to update the project.",
        error: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
