const runUpdateBot = async () => {
  const url = `http://localhost:5173/api/bots`;

  const res = await fetch(url, {
    method: "PUT",
    body: JSON.stringify("null"),
  });

  const data = await res.json();
  console.log({ data });
};

runUpdateBot();
