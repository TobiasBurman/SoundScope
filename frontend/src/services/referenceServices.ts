import {
    collection,
    addDoc,
    getDocs,
    query,
    where
  } from "firebase/firestore";
import { db } from "../firebase";
import type { SavedReference } from "../types";
  
  export const saveReference = async (
    userId: string,
    name: string
  ) => {
    await addDoc(collection(db, "references"), {
      userId,
      name,
      createdAt: Date.now()
    });
  };
  
  export const getUserReferences = async (
    userId: string
  ): Promise<SavedReference[]> => {
    const q = query(
      collection(db, "references"),
      where("userId", "==", userId)
    );
  
    const snapshot = await getDocs(q);
  
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<SavedReference, "id">)
    }));
  };
  
  