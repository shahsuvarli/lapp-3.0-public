import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  try {
    const {
      values,
      quote: {
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

    const newDataArray = values.map((item) => ({
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
      quote_version,
    }));

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
      declare @new_quote_version int

      select top 1 @new_quote_version=quote_version + 1 from quote where quote_id=${quote_id} order by quote_version desc

      declare @temp_table table (col int)
      declare @inserted_id int

      insert into quote(quote_id, quote_version, project_id, sap_quote_id, sap_customer_id, created_by, modified_by, account_manager_id, dsm_id, copper_rate, notes, created_date, modified_date)

      output inserted.id into @temp_table

      values(${quote_id}, @new_quote_version, ${project_id}, ${
        sap_quote_id || null
      }, ${sap_customer_id}, ${created_by}, ${modified_by},  ${
        account_manager_id || null
      },  ${dsm_id || null}, ${copper_rate}, ${
        notes ? `'${notes}'` : null
      }, getdate(), getdate())

      select @inserted_id=col from @temp_table

      declare @table_of_ids table (col int)

     ${
       newDataArray.length
         ? `insert into material_quoted(material_id, quantity, line_notes, discount_percent, copper_base_price, full_base_price, margin_full_copper, line_value, line_cogs, permanent_quote_id, quote_version)

      output inserted.id into @table_of_ids

      values ${new_values}`
         : ""
     }

      update material_quoted set quote_version=@new_quote_version where id in (select col from @table_of_ids)

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

        select top 1 col from @temp_table
      `
    );

    return NextResponse.json({
      data: result.recordset[0].col,
      message: "Material list revised to new quote version!",
    });
  } catch (error) {
    return NextResponse.json({
      message: "Failed to revise the material list!",
    });
  }
}