import { NextResponse } from "next/server";
import { connection } from "utils/db";

export async function GET() {
  const request = connection.request();

  try {
    const [sales_org, vertical_market, channel, region, state] =
      await Promise.all([
        request.query("SELECT * FROM sales_org"),
        request.query("SELECT * FROM vertical_market"),
        request.query("SELECT * FROM channel"),
        request.query("SELECT * FROM region"),
        request.query("SELECT * FROM state"),
      ]);

    const data = {
      sales_org: sales_org.recordset,
      vertical_market: vertical_market.recordset,
      channel: channel.recordset,
      region: region.recordset,
      state: state.recordset,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch create form data");
  }
}
