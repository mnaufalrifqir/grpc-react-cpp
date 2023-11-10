import React, { useState, useEffect } from "react";
import { UserServiceClient } from "./proto/UserServiceClientPb";
import { User } from "./proto/user_pb";

function App() {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [createResponse, setCreateResponse] = useState("");
  const [fetchResponse, setFetchResponse] = useState("");
  const [userList, setUserList] = useState<User[]>([]);

  useEffect(() => {
    // Call the stream function when the component mounts
    getAllUserStream();
  }, []);

  const createNewUser = async (name: string) => {
    const EnvoyURL = "http://localhost:5050";
    const client = new UserServiceClient(EnvoyURL);
    const request = new User();
    request.setName(name);
    try {
      const response = await client.createUser(request, {});
      console.log(response);
      setCreateResponse(
        "Created,\n Id: " + response.getId() + ",\n Name: " + response.getName() + ",\n Created-at: " + response.getCreatedAt() + ",\n Updated-at: " + response.getUpdatedAt()
      );
    } catch (error) {
      console.error(error);
      setCreateResponse("Error creating user");
    }
  };

  const createNewUserLoop = async () => {
    const EnvoyURL = "http://localhost:5050";
    const client = new UserServiceClient(EnvoyURL);
    const request = new User();
    for (let i = 0; i < 10000; i++) {
      request.setName("lorem ipsum " + i);
      try {
        const response = await client.createUser(request, {});
        console.log(response);
      } catch (error) {
        console.error(error);
        setCreateResponse("Error creating user");
      }
    }
  };

  const getUser = async (userId: number) => {
    const EnvoyURL = "http://localhost:5050";
    const client = new UserServiceClient(EnvoyURL);
    const request = new User();
    request.setId(userId);
    try {
      const response = await client.readUser(request, {});
      console.log(response);
      setFetchResponse(
        "Fetched,\n Id: " + response.getId() + ",\n Name: " + response.getName() + ",\n Created-at: " + response.getCreatedAt() + ",\n Updated-at: " + response.getUpdatedAt()
      );
    } catch (error) {
      console.error(error);
      setFetchResponse("User not found");
    }
  };

  const getAllUserStream = async () => {
    const EnvoyURL = "http://localhost:5050";
    const client = new UserServiceClient(EnvoyURL);
    try {
      const stream = client.listUsers(new User());
      stream.on("data", (response) => {
        console.log(response);
        // Check for duplicates before adding to the userList
        if (!userList.some(user => user.getId() === response.getId())) {
          setUserList(userList => [...userList, response]);
        }
      });
      stream.on("error", (error) => {
        console.error(error);
      });
      stream.on("end", () => {
        console.log("Stream ended");
      });
    } catch (error) {
      console.error(error);
      setCreateResponse("Error user streaming");
    }
  };

  const onClickGreet = () => {
    if (name) {
      createNewUser(name);
      setFetchResponse("");
    }
  };

  const onClickFetchUser = () => {
    if (userId) {
      getUser(parseInt(userId));
      setCreateResponse("");
    }
  };

  return (
    <div className="App">
      <div>
        <input
          type="text"
          value={name}
          placeholder="Enter name"
          className="p-3"
          onChange={(e) => setName(e.target.value)}
        />
        <button className="p-3" onClick={onClickGreet}>Create</button>
        {name && <div id="createResponse">{createResponse}</div>}
      </div>
      <div>
        <button className="p-3" onClick={createNewUserLoop}>Create Loop</button>
      </div>

      <div>
        <input
          type="text"
          value={userId}
          placeholder="Enter user ID"
          onChange={(e) => setUserId(e.target.value)}
        />
        <button onClick={onClickFetchUser}>Fetch</button>
        {userId && <div id="fetchResponse">{fetchResponse}</div>}
      </div>
    </div>
  );
}

export default App;
