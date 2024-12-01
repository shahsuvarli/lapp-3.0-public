import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  try {
    const {
      values,
      quote: {
        id,
        quote_id,
        project_id,
        sap_quote_id,
        sap_customer_id,
        created_by,
        modified_by,
        account_manager_id,
        dsm_id,
        copper_rate,
        notes,
        quote_version,
      },
    } = await req.json();

    const newDataArray = values.map((item) => {
      return {
        material_id: item.material_id,
        quantity: item.quantity,
        line_notes: item.line_notes || null,
        discount_percent: item.discount_percent || null,
        copper_base_price: item.copper_base_price || null,
        full_base_price: item.full_base_price || null,
        margin_full_copper: item.margin_full_copper || null,
        line_value: item.line_value || null,
        line_cogs: item.line_cogs || null,
        permanent_quote_id: quote_id,
        quote_version: quote_version,
      };
    });

    const formattedArray = newDataArray.map(
      (quote) =>
        `('${quote.material_id}', ${quote.quantity}, ${
          quote.line_notes ? `'${quote.line_notes}'` : null
        }, ${quote.discount_percent}, ${quote.copper_base_price}, ${
          quote.full_base_price
        }, ${quote.margin_full_copper}, ${quote.line_value}, ${
          quote.line_cogs
        }, ${quote.permanent_quote_id}, ${quote.quote_version})`
    );
    const new_values = formattedArray.join(",");

    const request = connection.request();

    const result = await request.query(
      `
    DECLARE @new_quote_version INT

    SELECT TOP 1 @new_quote_version=quote_version + 1 FROM quote WHERE quote_id=${quote_id} ORDER BY quote_version DESC

    DECLARE @temp_table TABLE (col INT)
    DECLARE @inserted_id INT

    INSERT INTO quote(quote_id, quote_version, project_id, sap_quote_id, sap_customer_id, created_by, modified_by, account_manager_id, dsm_id, copper_rate, notes, created_date, modified_date)

    OUTPUT Inserted.id INTO @temp_table

    VALUES(${quote_id}, @new_quote_version, ${project_id}, ${
        sap_quote_id || null
      }, ${sap_customer_id}, ${created_by}, ${modified_by}, ${
        account_manager_id || null
      }, ${dsm_id || null}, ${copper_rate}, ${
        notes ? `'${notes}'` : null
      }, getdate(), getdate())

    INSERT INTO material_quoted(material_id, quantity, line_notes, discount_percent, copper_base_price, full_base_price, margin_full_copper, line_value, line_cogs, permanent_quote_id, quote_version)

    SELECT material_id, quantity, line_notes, discount_percent, copper_base_price, full_base_price, margin_full_copper, line_value, line_cogs, permanent_quote_id, @new_quote_version FROM material_quoted
    
    WHERE permanent_quote_id=${quote_id} and quote_version=${quote_version} and is_active=1

    SELECT @inserted_id=col FROM @temp_table

    DECLARE @table_of_ids TABLE (col INT)

    ${
      newDataArray.length
        ? `INSERT INTO material_quoted(material_id, quantity, line_notes, discount_percent, copper_base_price, full_base_price, margin_full_copper, line_value, line_cogs, permanent_quote_id, quote_version)

      OUTPUT Inserted.id INTO @table_of_ids

      VALUES ${new_values}`
        : ""
    }

      UPDATE material_quoted SET quote_version=@new_quote_version WHERE id IN (SELECT col FROM @table_of_ids)

      DECLARE @margin float, @value float, @cost float;

      WITH
          RankedRows
          AS
          (
              SELECT line_value, margin_full_copper, line_cogs, ROW_NUMBER() OVER (PARTITION BY id order by id desc) AS VersionRank
              FROM material_quoted
              WHERE is_active=1 AND permanent_quote_id=${quote_id} AND quote_version=@new_quote_version
          )
      SELECT @margin=avg(coalesce(margin_full_copper, 0)), @value=sum(line_value), @cost=sum(line_cogs)
      FROM RankedRows
      WHERE VersionRank = 1
 
      UPDATE quote SET quote_value=@value, quote_cost=@cost, quote_margin=@margin WHERE id=@inserted_id

      DECLARE @project_margin float, @project_value float, @project_cost float;
 
      WITH
          RankedRows
          AS
          (
              SELECT quote_value, quote_margin, quote_cost, ROW_NUMBER() OVER (PARTITION BY quote_id ORDER BY quote_version DESC) AS VersionRank
              FROM quote
              WHERE is_active=1 AND project_id=${project_id}
          )
      SELECT @project_margin=avg(coalesce(quote_margin, 0)), @project_value=sum(quote_value), @project_cost=sum(quote_cost)
      FROM RankedRows
      WHERE VersionRank = 1

      UPDATE project SET total_value=@project_value, total_cost=@project_cost, total_margin=@project_margin WHERE project_id=${project_id}

      SELECT TOP 1 col FROM @temp_table
      `
    );

    return NextResponse.json({
      data: result.recordset[0].col,
      message: "Material list revised to new quote version!",
    });
  } catch (error) {
    return NextResponse.json({
      message: "Failed to add and revise a new quote version",
    });
  }
}