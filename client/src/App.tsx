import React, { useState } from "react";
import { UserServiceClient } from "./proto/UserServiceClientPb";
import { User } from "./proto/user_pb";

const greetClient = async (name: string) => {
  const EnvoyURL = "http://localhost:5000";
  const client = new UserServiceClient(EnvoyURL);
  const request = new User();
  request.setName(name);
  const response = await client.createUser(request, {});
  console.log(response);
  const div = document.getElementById("response");
  if (div) div.innerText = response.getName();
};

function App() {
  const [name, setName] = useState("");
  const onClickGreet = () => {
    if (name) greetClient(name);
  };

  return (
    <div className="App">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={onClickGreet}>greet</button>
      {name && <div id="response"></div>}
    </div>
  );
}

export default App;
