import { useUser } from "@auth0/nextjs-auth0/client";
import axios from "axios";
import { useState } from "react";

export const useUserData = () => {
  const { user } = useUser();

  const [userDetails, setUserDetails] = useState({
    bookmarks: [],
    liked: [],
  });

  const fetchUserDetails = async () => {
    if (!user || !user.sub) {
      console.log("User is not available, skipping fetchUserDetails");
      return;
    }

    try {
      const res = await axios.get(`/api/user/${user.sub}`);
      console.log("Fetched user details:", res.data);
      setUserDetails(res.data);
    } catch (error) {
      console.log("Error in fetchUserDetails", error);
    }
  };

  const performAction = async (userId, pokemon, action) => {
    if (!user) {
      console.log("User is not logged in, skipping performAction");
      return;
    }

    try {
      setUserDetails((prev) => {
        if (!prev) return prev;

        const updatedBookmarks =
          action === "bookmark"
            ? (prev.bookmarks || []).includes(pokemon)
              ? (prev.bookmarks || []).filter((p) => p !== pokemon)
              : [...(prev.bookmarks || []), pokemon]
            : prev.bookmarks || [];

        const updatedLikes =
          action === "like"
            ? (prev.liked || []).includes(pokemon)
              ? (prev.liked || []).filter((p) => p !== pokemon)
              : [...(prev.liked || []), pokemon]
            : prev.liked || [];

        return {
          ...prev,
          bookmarks: updatedBookmarks,
          liked: updatedLikes,
        };
      });

      await axios.post("/api/pokemon", {
        userId,
        pokemon,
        action,
      });
    } catch (error) {
      console.log("Error in performAction", error);
      fetchUserDetails(userId); // when error, fetch the user details again
    }
  };

  return { userDetails, performAction, fetchUserDetails };
};

const UserTabs = () => {
  const { userDetails } = useUserData();
  const { user } = useUser();

  if (!user) {
    return <div>Please log in to view your bookmarks and favorites.</div>;
  }

  if (!userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Favorites</h2>
      {userDetails.liked.map((pokemon) => (
        <div key={pokemon}>{pokemon}</div>
      ))}

      <h2>Saved</h2>
      {userDetails.bookmarks.map((pokemon) => (
        <div key={pokemon}>{pokemon}</div>
      ))}
    </div>
  );
};
