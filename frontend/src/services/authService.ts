import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  const user = result.user;

  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      createdAt: Date.now()
    },
    { merge: true }
  );

  return user;
};

export const logout = async () => {
  await signOut(auth);
};
