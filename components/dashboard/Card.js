export const Card = ({ value, description, bg }) => {
  return (
    <div className={`flex flex-col gap-2 rounded-md p-4 w-52 ${bg} drop-shadow-md text-white`}>
      <p className="text-2xl">{value}</p>
      <p className="font-thin text-xl">{description}</p>
    </div>
  );
};
