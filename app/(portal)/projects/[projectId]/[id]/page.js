import QuoteContainer from "@components/quotes/QuoteContainer";
import {getQuote} from "utils";

export default async function Page({ params }) {
  const {
    quote,
    project,
    materials,
    sales_org,
    account_manager,
    dsm,
    customer,
  } = await getQuote(params.id);

  return (
    <QuoteContainer
      quote={quote}
      project={project}
      materials={materials}
      sales_org={sales_org}
      account_manager={account_manager}
      dsm={dsm}
      customer={customer}
    />
  );
}
