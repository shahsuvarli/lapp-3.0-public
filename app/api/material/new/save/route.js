import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function POST(req) {
  const {
    values,
    quote: { id, quote_id, quote_version, project_id },
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
    (item) =>
      `('${item.material_id}', ${item.quantity}, ${
        item.line_notes ? `'${item.line_notes}'` : null
      }, ${item.discount_percent}, ${item.copper_base_price}, ${
        item.full_base_price
      }, ${item.margin_full_copper}, ${item.line_value}, ${item.line_cogs}, ${
        item.permanent_quote_id
      }, ${item.quote_version})`
  );
  const new_values = formattedArray.join(",");

  try {
    const request = connection.request();

    await request.query(
      `
      insert into material_quoted(material_id, quantity, line_notes, discount_percent, copper_base_price, full_base_price, margin_full_copper, 
        line_value, line_cogs, permanent_quote_id, quote_version)

      values ${new_values}


      DECLARE @margin float, @value float, @cost float;

      WITH
          RankedRows
          AS
          (
              SELECT line_value, margin_full_copper, line_cogs, ROW_NUMBER() OVER (PARTITION BY id order by id desc) AS VersionRank
              FROM material_quoted
              WHERE is_active=1 AND permanent_quote_id=${quote_id} AND quote_version=${quote_version}
          )
      SELECT @margin=avg(coalesce(margin_full_copper, 0)), @value=sum(line_value), @cost=sum(line_cogs)
      FROM RankedRows
      WHERE VersionRank = 1

      UPDATE quote SET quote_value=@value, quote_cost=@cost, quote_margin=@margin WHERE id=${id}

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
    `
    );

    return NextResponse.json(true);
  } catch (error) {
    throw new Error(error);
  }
}