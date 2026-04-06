import { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import { profileService } from "../services/profileService";

export const Settings = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const { session } = UserAuth();
  const user = session?.user;

  useEffect(() => {
    if (session?.user?.id) {
      profileService
        .getProfile(session.user.id)
        .then((data) => {
          setName(data.full_name || "");
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [session]);

  const handleUpdateName = async () => {
    try {
      await profileService.updateName(user.id, name);
      console.log("Name updated successfully!");
    } catch (err) {
      console.log("Update failed");
    }
  };
  
  return <div>Settings</div>;
};
