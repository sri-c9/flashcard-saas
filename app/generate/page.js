"use client";

import { useUser } from "@clerk/nextjs";
import { collection, writeBatch } from "firebase/firestore";
import { useState } from "react";

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState();
  const [text, setText] = useState("");
  const [name, setOpenName] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    fetch("api/generate", {
      method: "POST",
      body: text,
    })
      .then((res) => res.json())
      .then((data) => setFlashcards(data));
  };

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveFlashcards = async () => {
    if (!name) {
      alert("Please enter a name");
      return;
    }

    const batch = writeBatch(db);
    const userDocRef = doc(collection(db, "users"), user.id);
    const docSnap = await getDoc(userDocRef, "");

    if (docSnap.exists()) {
      const collections = docSnap.data.flashcards || [];
      if (collections.find((f) => f.name === name)) {
        alert("Flashcrd collection with same name already exists");
        return;
      } else {
        collections.push(name);
        batch.set(userDocRef, { flashcards: collections }, { merge: true });
      }
    } else {
      batch.set(userDocRef, { flashcards: [{ name }] });
    }

    const columnRef = collection(userDocRef, name);
    flashcards.forEach((f) => {
      const cardDocRef = doc(colRef);
      batch.set(cardDocref, flashcard);
    });

    await batch.commit();
    handleClose();
    router.push("/flashcards");
  };
}
