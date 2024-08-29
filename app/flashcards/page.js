"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

import {
  CollectionReference,
  doc,
  getDoc,
  setDoc,
  collection,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";
import {
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

export default function Flashcards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;

      console.log("user", user.id);
      const docRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        setFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] });
      }
    }

    getFlashcards();
  }, [user]);

  if (!isLoaded || !isSignedIn) {
    return <></>;
  }

  const handleCardClick = (name) => {
    router.push(`/flashcard?name=${name}`);
  };

  return (
    <Container maxWidth="100vh">
      <Grid
        container
        spacing={3}
        sx={{ mt: 4 }}
      >
        {flashcards.map((flashcard, id) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={id}
          >
            <CardActionArea onClick={() => handleCardClick(flashcard.name)}>
              <CardContent>
                <Typography variant="h6">{flashcard.name}</Typography>
              </CardContent>
            </CardActionArea>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
