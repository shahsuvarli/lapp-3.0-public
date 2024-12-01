import { Card } from "./Card";

const cards = [
  {
    id: 1,
    value: 100,
    description: "Total Sales",
    bg: "bg-sky-400",
  },
  {
    id: 2,
    value: 100,
    description: "Total Projects",
    bg: "bg-red-400",
  },
  {
    id: 3,
    value: 100,
    description: "Total Quotes",
    bg: "bg-green-400",
  },
];

function CardContainers() {
  return (
    <div className="flex flex-wrap gap-4">
      {cards.map(({ id, value, description, bg }) => {
        return (
          <Card key={id} value={value} description={description} bg={bg} />
        );
      })}
    </div>
  );
}

export default CardContainers;
