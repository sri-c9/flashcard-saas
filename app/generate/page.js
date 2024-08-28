"use client";
import { writeBatch, doc, collection, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

import { useUser } from "@clerk/nextjs";
import {
  Button,
  Box,
  Container,
  Paper,
  TextField,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [text, setText] = useState("");
  const [name, setOpenName] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: text,
        headers: {
          "Content-Type": "text/plain",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to generate flashcards: ${res.statusText}`);
      }

      const responseText = await res.text();
      console.log("Response Text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        throw new Error("Failed to parse response as JSON");
      }
      console.log("DATA", data);

      if (data.flashcards) {
        setFlashcards(data.flashcards);
      } else {
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCardClick = (index) => {
    setFlipped((prev) => ({
      ...prev,
      [index]: !prev[index],
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
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const collections = docSnap.data().flashcards || [];
      if (collections.find((f) => f.name === name)) {
        alert("Flashcard collection with the same name already exists");
        return;
      } else {
        collections.push({ name });
        batch.set(userDocRef, { flashcards: collections }, { merge: true });
      }
    } else {
      batch.set(userDocRef, { flashcards: [{ name }] });
    }

    const colRef = collection(userDocRef, name);
    flashcards.forEach((f) => {
      const cardDocRef = doc(colRef);
      batch.set(cardDocRef, f);
    });

    await batch.commit();
    handleClose();
    router.push("/flashcards");
  };

  console.log("flashcards data:", flashcards);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6, display: "flex", flexDirection: "column" }}>
        <Typography variant="h4">Generate Flashcard</Typography>
        <Paper sx={{ p: 4, width: "100%" }}>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            label="Enter text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
          >
            Submit
          </Button>
        </Paper>
      </Box>
      {console.log("length", flashcards.length)}
      {flashcards.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">Flashcards Preview</Typography>
          <Grid
            container
            spacing={3}
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
                  <CardActionArea onClick={() => handleCardClick(index)}>
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
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleOpen}
            >
              Save Flashcards
            </Button>
          </Box>
        </Box>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>Save Flashcards</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name for your flashcard collection.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setOpenName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={saveFlashcards}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
