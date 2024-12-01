import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  const { id, user_id, quote_version, quote_id, project_id } = await req.json();

  try {
    const request = connection.request();

    // Start transaction
    await request.query("BEGIN TRANSACTION;");

    // Deactivate the quote and its related material
    await request
      .input("id", id)
      .input("user_id", user_id)
      .input("quote_version", quote_version)
      .input("quote_id", quote_id)
      .input("project_id", project_id).query(`
        UPDATE quote 
        SET is_active = 0, deleted_by = @user_id, deleted_date = GETDATE()
        WHERE id = @id AND is_active = 1;

        UPDATE material_quoted 
        SET is_active = 0 
        WHERE permanent_quote_id = @quote_id AND quote_version = @quote_version AND is_active = 1;
      `);

    // Recalculate project value, cost, and margin after quote removal
    const result = await request.input("project_id", project_id).query(`
        DECLARE @margin FLOAT, @value FLOAT, @cost FLOAT;

        WITH RankedRows AS (
          SELECT 
            quote_value, 
            quote_margin, 
            quote_cost, 
            ROW_NUMBER() OVER (PARTITION BY quote_id ORDER BY quote_version DESC) AS VersionRank
          FROM quote
          WHERE is_active = 1 AND project_id = @project_id
        )
        SELECT 
          @margin = AVG(COALESCE(quote_margin, 0)), 
          @value = SUM(quote_value), 
          @cost = SUM(quote_cost)
        FROM RankedRows
        WHERE VersionRank = 1;

        UPDATE project 
        SET total_value = @value, total_cost = @cost, total_margin = @margin 
        WHERE project_id = @project_id;
      `);

    // Commit the transaction
    await request.query("COMMIT TRANSACTION;");

    return NextResponse.json({ message: "Quote was deleted successfully!" });
  } catch (error) {
    // Rollback in case of an error
    await connection.request().query("ROLLBACK TRANSACTION;");
    console.error("Error deleting quote:", error);

    return NextResponse.json(
      { message: "Failed to delete quote!", error: error.message },
      { status: 500 }
    );
  }
}
