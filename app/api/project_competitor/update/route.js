import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  const { project_id, ids, user_id } = await req.json();

  try {
    const request = connection.request();

    // Set input parameters to prevent SQL injection
    request.input("project_id", project_id);
    request.input("user_id", user_id);

    // Deactivate existing competitors for the project
    await request.query(
      `
        UPDATE project_competitor 
        SET is_active = 0, deleted_by = @user_id, deleted_date = GETDATE()
        WHERE is_active = 1 AND project_id = @project_id
      `
    );

    // Insert new competitors if ids array is not empty
    if (ids.length > 0) {
      const formattedArray = ids.map(
        (id, index) => `(@project_id, @competitor_id_${index})`
      );
      const values = formattedArray.join(",");

      // Add input parameters for competitor IDs
      ids.forEach((id, index) => {
        request.input(`competitor_id_${index}`, id);
      });

      await request.query(
        `
          INSERT INTO project_competitor(project_id, competitor_id)
          VALUES ${values}
        `
      );
    }

    return NextResponse.json({
      message: "Competitors updated successfully!",
      success: true,
    });
  } catch (error) {
    console.error("Error updating competitors:", error);
    return NextResponse.json(
      {
        message: "Competitors failed to update!",
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
