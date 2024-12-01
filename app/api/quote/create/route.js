import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  const {
    project_id,
    sap_customer_id,
    created_by,
    modified_by,
    quote_version,
  } = await req.json();

  const request = connection.request();

  try {
    // Execute the main query
    const result = await request
      .input("project_id", project_id)
      .input("sap_customer_id", sap_customer_id)
      .input("created_by", created_by)
      .input("modified_by", modified_by)
      .input("quote_version", quote_version).query(`
        -- Declare variables
        DECLARE @lastId INT;
        DECLARE @projectMargin FLOAT;

        -- Get the last quote_id and increment it
        SET @lastId = (SELECT ISNULL(MAX(quote_id), 0) + 1 FROM quote);

        -- Insert into the quote table and output the inserted quote_id
        INSERT INTO quote (quote_id, project_id, sap_customer_id, created_by, modified_by, quote_version, created_date, modified_date)
        OUTPUT INSERTED.id
        VALUES (@lastId, @project_id, @sap_customer_id, @created_by, @modified_by, @quote_version, GETDATE(), GETDATE());

        -- Calculate project margin for the project_id based on the most recent quote version
        WITH RankedRows AS (
            SELECT quote_margin, ROW_NUMBER() OVER (PARTITION BY quote_id ORDER BY quote_version DESC) AS VersionRank
            FROM quote
            WHERE is_active = 1 AND project_id = @project_id
        )
        SELECT @projectMargin = AVG(COALESCE(quote_margin, 0))
        FROM RankedRows
        WHERE VersionRank = 1;

        -- Update the total margin for the project
        UPDATE project
        SET total_margin = @projectMargin
        WHERE project_id = @project_id;
      `);

    return NextResponse.json({
      data: result.recordset[0]?.id || null,
      message: "New quote created successfully!",
      success: true,
    });
  } catch (error) {
    console.error("Error creating new quote:", error);
    return NextResponse.json(
      {
        message: "Failed to create new quote!",
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
