import { Box, Card } from "@mui/material";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import axios from "axios";
import * as React from "react";
import { useEffect, useState } from "react";

import AppFooter from "./components/AppFooter";
import CardRecommender from "./components/CardRecommender";
import CardTable from "./components/CardTable";
import MainAppBar from "./components/MainAppBar";
import Trending from "./components/Trending";
import TrendingChart from "./components/TrendingChart";
import { TrendingCard } from './types';


export default function HomePage() {
  const [trendingCards, setTrendingCards] = useState<TrendingCard[]>([]);
  useEffect(() => {
    axios(process.env.REACT_APP_API_URL + "/queries/trend")
      .then((response) => {
        setTrendingCards(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <React.Fragment>
      <GlobalStyles
        styles={{ ul: { margin: 0, padding: 0, listStyle: "none" } }}
      />
      <CssBaseline />
      <MainAppBar />
      {/* Hero unit */}
      <Container
        disableGutters
        maxWidth="sm"
        component="main"
        sx={{ pt: 8, pb: 6 }}
      >
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Illini CC'd
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          component="p"
        >
          We provide a standardized dataset of credit card information to help
          you choose the credit card that best suits your needs.
        </Typography>
      </Container>
      <Container>
        <Grid container spacing={2}>
          <Grid xs={6} md={8} sx={{ paddingBottom: 5 }}>
            <CardRecommender />
            <Box sx={{paddingTop: 5}}><TrendingChart trendingCards={trendingCards}/></Box>
            
          </Grid>
          <Grid xs={6} md={4}>
            <Trending trendingCards={trendingCards} />
          </Grid>
        </Grid>
      </Container>
       

      <Container>
        <CardTable />
      </Container>
      <AppFooter />
    </React.Fragment>
  );
}
