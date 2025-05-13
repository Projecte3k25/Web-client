const backendHost = import.meta.env.VITE_BACKEND_HOST_API;
const Ranking = ({ ranking }) => {
  return (
    <div className="text-black">
      <h3 className="text-2xl font-semibold mb-4">Ranking ELO</h3>
      <ul className="space-y-2">
        {ranking.map((user, index) => (
          <li
            key={user.id}
            className="flex justify-between border-b border-white/20 pb-1"
          >
            <span className="flex gap-1">
              {index + 1}.{" "}
              <img
                src={`http://${backendHost}${user.avatar}`}
                className="h-8 w-8 rounded-full object-cover"
                alt=""
              />{" "}
              {user.nom}
            </span>
            <span className="font-semibold">{user.elo} </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ranking;
