import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  try {
    const { project_id, user_id } = await req.json();

    const request = connection.request();
    request.input("project_id", project_id);
    request.input("user_id", user_id);

    await request.query(
      `
      UPDATE project 
      SET is_active = 0, deleted_by = @user_id, deleted_date = GETDATE() 
      WHERE project_id = @project_id AND is_active = 1;

      UPDATE quote 
      SET is_active = 0, deleted_by = @user_id, deleted_date = GETDATE() 
      WHERE project_id = @project_id;

      UPDATE material_quoted 
      SET is_active = 0 
      WHERE permanent_quote_id IN (
        SELECT DISTINCT quote_id FROM quote WHERE project_id = @project_id
      );
    `
    );

    return NextResponse.json({
      message: "Project was deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      {
        message: "Failed to delete the project!",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
