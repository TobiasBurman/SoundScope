import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { deleteObject, ref as storageRef } from "firebase/storage";

import { db } from "../firebase";
import { storage } from "../firebaseStorage";
import { uploadReferenceFile } from "../firebaseStorage";

import type { SavedReference } from "../types";
import type { AnalysisResponse } from "../types/analysis";

export const saveReference = async (
  userId: string,
  userMixFile: File,
  referenceFile?: File,
  analysisResult?: AnalysisResponse
): Promise<void> => {
  const userMixUpload = await uploadReferenceFile(userId, userMixFile);

  let refUpload: { url: string; path: string } | undefined;
  if (referenceFile) {
    refUpload = await uploadReferenceFile(userId, referenceFile);
  }

  await addDoc(collection(db, "references"), {
    userId,
    name: userMixFile.name,
    userMixUrl: userMixUpload.url,
    userMixPath: userMixUpload.path,
    userMixName: userMixFile.name,
    ...(refUpload && {
      referenceUrl: refUpload.url,
      referencePath: refUpload.path,
      referenceName: referenceFile!.name,
    }),
    createdAt: Timestamp.now(),
    ...(analysisResult && { analysisResult }),
  });
};

export const getUserReferences = async (
  userId: string
): Promise<SavedReference[]> => {
  const q = query(
    collection(db, "references"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId,
      name: data.name,
      userMixUrl: data.userMixUrl ?? data.audioUrl ?? "",
      userMixPath: data.userMixPath ?? data.storagePath ?? "",
      userMixName: data.userMixName ?? data.name ?? "",
      referenceUrl: data.referenceUrl,
      referencePath: data.referencePath,
      referenceName: data.referenceName,
      createdAt: data.createdAt.toMillis(),
      analysisResult: data.analysisResult,
    };
  });
};

export const deleteReference = async (
  reference: SavedReference
): Promise<void> => {
  await deleteDoc(doc(db, "references", reference.id));

  if (reference.userMixPath) {
    const fileRef = storageRef(storage, reference.userMixPath);
    await deleteObject(fileRef).catch(() => {});
  }

  if (reference.referencePath) {
    const fileRef = storageRef(storage, reference.referencePath);
    await deleteObject(fileRef).catch(() => {});
  }
};
