"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, get } from "firebase/firestore";

import { db } from "@/firebase";
import { useRouter } from "next/navigation";
import {
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
  Card,
  Box,
} from "@mui/material";

import { useSearchParams } from "next/navigation";

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});

  const searchParams = useSearchParams();
  const search = searchParams.get("name");

  useEffect(() => {
    async function getFlashcard() {
      if (!search || !user) return;

      const colRef = collection(doc(collection(db, "users"), user.id), search);

      const docs = await getDocs(colRef);

      const flashcards = [];

      docs.forEach((doc) => {
        flashcards.push({ id: doc.id, ...doc.data() });
      });
      setFlashcards(flashcards);
    }
    getFlashcard();
  }, [user, search]);

  const handleCardClick = (index) => {
    setFlipped((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // TODO: trouble shot
  if (!isLoaded || !isSignedIn) {
    return <></>;
  }

  return (
    <Container maxWidth="100vw">
      <Grid
        container
        spacing={3}
        sx={{ mt: 4 }}
      >
        {flashcards.map((flashcard, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={index}
          >
            <Card>
              <CardActionArea onClick={() => handleCardClick(flashcard.name)}>
                <CardContent>
                  <Box
                    sx={{
                      perspective: "1000px", // Perspective for the 3D effect
                      height: "200px",
                      width: "100%",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        transition: "transform 0.6s",
                        transformStyle: "preserve-3d",
                        transform: flipped[index]
                          ? "rotateY(180deg)"
                          : "rotateY(0deg)",
                      }}
                    >
                      {/* Front Side */}
                      <Box
                        sx={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: 2,
                          boxSizing: "border-box",
                          backgroundColor: "#fff", // Ensure background color for visibility
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{
                            textAlign: "center",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {flashcard.front}
                        </Typography>
                      </Box>

                      {/* Back Side */}
                      <Box
                        sx={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: 2,
                          boxSizing: "border-box",
                          backgroundColor: "#fff", // Ensure background color for visibility
                          transform: "rotateY(180deg)", // Back side flipped
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{
                            textAlign: "center",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {flashcard.back}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
