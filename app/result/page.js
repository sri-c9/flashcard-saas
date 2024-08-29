"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import getStripe from "@/utils/get-stripe";
import { useSearchParams } from "next/navigation";

import { CircularProgress, Container, Typography, Box } from "@mui/material";

const ResultPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");

  const [loading, setLoading] = useState();
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCheckoutSession = async () => {
      if (!session_id) return;
      else {
        try {
          const rest = await fetch(
            `/api/checkout_session?session_id=${session_id}`
          );
          const sessionData = await rest.json();
          if (rest.ok) {
            setSession(sessionData);
          } else {
            setError(sessionData.error);
          }
        } catch (error) {
          setError("Error occured");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCheckoutSession();
  }, [session_id]);

  if (loading) {
    return (
      <Container
        maxWidth="100vw"
        sx={{ textAlign: "center" }}
      >
        <CircularProgress />
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth="100vw"
        sx={{ textAlign: "center" }}
      >
        <Typography variant="h6">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="100vw"
      sx={{ textAlign: "center" }}
    >
      {session.payment_status == "paid" ? (
        <>
          <Typography variant="h4">Thank you for purchasing</Typography>
          <Box sx={{ mt: 22 }}>
            <Typography variant="body1">
              We have received your payment. You will received an email with the
              order details shortly.
            </Typography>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="h4">Payment failed</Typography>
          <Box sx={{ mt: 22 }}>
            <Typography variant="body1">
              Your payment was not successful. Please try again
            </Typography>
          </Box>
        </>
      )}
    </Container>
  );
};

export default ResultPage;
