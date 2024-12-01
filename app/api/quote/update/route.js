import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  const {
    values: {
      id,
      sap_customer_id,
      account_manager_id,
      dsm_id,
      copper_rate,
      sap_quote_id,
      notes,
      quote_id,
      quote_version,
      sales_org_id,
    },
    user_id,
    copper_rate_diff,
  } = await req.json();

  try {
    const request = connection.request();

    // Update the quote details
    request.input("user_id", user_id);
    request.input("sap_customer_id", sap_customer_id);
    request.input("account_manager_id", account_manager_id);
    request.input("dsm_id", dsm_id);
    request.input("copper_rate", copper_rate);
    request.input("sap_quote_id", sap_quote_id);
    request.input("notes", notes || null);
    request.input("id", id);

    await request.query(`
      UPDATE quote
      SET 
        modified_date = GETDATE(), 
        modified_by = @user_id, 
        sap_customer_id = @sap_customer_id, 
        account_manager_id = @account_manager_id,
        dsm_id = @dsm_id, 
        copper_rate = @copper_rate, 
        sap_quote_id = @sap_quote_id, 
        notes = @notes
      WHERE id = @id
    `);

    // If copper_rate_diff is provided, update the quote_version table
    if (copper_rate_diff) {
      request.input("quote_id", quote_id);
      request.input("quote_version", quote_version);

      // Fetch materials related to the quote
      const result = await request.query(`
        SELECT * FROM material_quoted 
        WHERE permanent_quote_id = @quote_id 
          AND quote_version = @quote_version 
          AND is_active = 1
      `);

      if (result.recordset.length > 0) {
        // Process all materials concurrently
        const updates = result.recordset.map(async (item, index) => {
          const materialResult = await request
            .input(`material_id_${index}`, item.material_id)
            .input(`sales_org_id_${index}`, sales_org_id).query(`
              SELECT copper_weight, cost_full_copper, uom 
              FROM material_sales_org 
              WHERE material_id = @material_id_${index} 
                AND sales_org_id = @sales_org_id_${index}
            `);

          const { copper_weight, cost_full_copper, uom } =
            materialResult.recordset[0];

          // Calculate the values based on copper_rate
          const full_base_price = parseFloat(
            Number(item.copper_base_price) +
              (Number(copper_rate) - 1.2) * copper_weight
          ).toFixed(2);

          const margin_full_copper = parseFloat(
            (full_base_price - cost_full_copper) / full_base_price
          ).toFixed(2);

          const divisor = uom === "Meter" || uom === "Feet" ? 1000 : 1;

          const lines_value = parseFloat(
            (full_base_price * item.quantity) / divisor
          ).toFixed(2);

          // Update the material_quoted entry
          await request
            .input(`full_base_price_${index}`, full_base_price)
            .input(`margin_full_copper_${index}`, margin_full_copper)
            .input(`line_value_${index}`, lines_value).query(`
              UPDATE material_quoted
              SET 
                full_base_price = @full_base_price_${index}, 
                margin_full_copper = @margin_full_copper_${index}, 
                line_value = @line_value_${index}
              WHERE permanent_quote_id = @quote_id 
                AND quote_version = @quote_version 
                AND material_id = @material_id_${index}
            `);
        });

        // Await all updates concurrently
        await Promise.all(updates);

        // Update the quote totals
        await request.query(`
          DECLARE @margin FLOAT, @value FLOAT, @cost FLOAT;

          WITH RankedRows AS (
              SELECT line_value, margin_full_copper, line_cogs, 
                    ROW_NUMBER() OVER (PARTITION BY id ORDER BY id DESC) AS VersionRank
              FROM material_quoted
              WHERE is_active = 1 
                AND permanent_quote_id = @quote_id 
                AND quote_version = @quote_version
          )
          SELECT @margin = AVG(COALESCE(margin_full_copper, 0)), 
                  @value = SUM(line_value), 
                  @cost = SUM(line_cogs)
          FROM RankedRows
          WHERE VersionRank = 1;

          UPDATE quote 
          SET quote_value = @value, 
              quote_cost = @cost, 
              quote_margin = @margin 
          WHERE id = @id;

          -- Update project totals
          DECLARE @project_margin FLOAT, @project_value FLOAT, @project_cost FLOAT;

          WITH ProjectRankedRows AS (
              SELECT quote_value, quote_margin, quote_cost, 
                    ROW_NUMBER() OVER (PARTITION BY quote_id ORDER BY quote_version DESC) AS VersionRank
              FROM quote
              WHERE is_active = 1 
                AND project_id = (SELECT project_id FROM quote WHERE id = @id)
          )
          SELECT @project_margin = AVG(COALESCE(quote_margin, 0)), 
                  @project_value = SUM(quote_value), 
                  @project_cost = SUM(quote_cost)
          FROM ProjectRankedRows
          WHERE VersionRank = 1;

          UPDATE project
          SET total_value = @project_value, 
              total_cost = @project_cost, 
              total_margin = @project_margin 
          WHERE project_id = (SELECT project_id FROM quote WHERE id = @id);
        `);
      }
    }

    // Optional: cancel any remaining request
    request.cancel();

    return NextResponse.json({
      message: "Quote and materials updated successfully!",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
