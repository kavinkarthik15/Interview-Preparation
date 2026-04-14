import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export const signupUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
    const token = await user.getIdToken();
    localStorage.setItem("token", token);

    const response = await fetch("https://interview-prep-backend-0d28.onrender.com/api/users/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: user.email.split("@")[0],
        email: user.email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw errorData.message || "Failed to sync user with backend";
    }

    return user;
  } catch (error) {
    throw error instanceof Error ? error.message : error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const token = await userCredential.user.getIdToken();
    localStorage.setItem("token", token);
    return userCredential.user;
  } catch (error) {
    throw error instanceof Error ? error.message : error;
  }
};
