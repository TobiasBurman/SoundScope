import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

export const storage = getStorage(app);

export const uploadReferenceFile = async (
  userId: string,
  file: File
): Promise<{ url: string; path: string }> => {
  const path = `references/${userId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { url, path };
};
