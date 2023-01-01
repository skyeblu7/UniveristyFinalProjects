import { List, ListItem } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/system/Box";
import axios from "axios";
import { useState } from "react";

// TODO: add form control/input validation/submit button
const defaultValues = {
  credit_score: 650,
  max_annual_fee: 90,
};

const CardRecommender = () => {
  const [formValues, setFormValues] = useState(defaultValues);
  const [recommendedCards, setRecommendedCards] = useState<string[]>([]);
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };
  const handleSubmit = (event: any) => {
    event.preventDefault();
    axios
      .get(
        process.env.REACT_APP_API_URL +
          "/queries/recommend?credit_score=" +
          formValues.credit_score +
          "&max_annual_fee=" +
          formValues.max_annual_fee
      )
      .then((response) => {
        console.log(response.data);
        setRecommendedCards(response.data);
      }).catch((err) => {
        console.log(err);
      });

    console.log(formValues);
  };
  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <Card sx={{ backgroundColor: "#F8FAFC", color: "#13294B" }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid xs={6} md={7}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  User Questionnaire
                </Typography>

                <Box>
                  <Typography variant="subtitle1">
                    Current credit score:
                  </Typography>
                  <TextField
                    id="credit_score-input"
                    name="credit_score"
                    // label="Credit Score"
                    type="number"
                    size="small"
                    value={formValues.credit_score}
                    onChange={handleInputChange}
                    sx={{ backgroundColor: "white" }}
                  />
                  <Typography variant="subtitle1">
                    Maximum annual fee:
                  </Typography>
                  <TextField
                    id="annual_fee-input"
                    name="max_annual_fee"
                    // label="Annual Fee"
                    size="small"
                    type="number"
                    value={formValues.max_annual_fee}
                    onChange={handleInputChange}
                    sx={{ backgroundColor: "white" }}
                  />
                </Box>
                <Button
                  sx={{ marginTop: 2, maxWidth: 195 }}
                  variant="contained"
                  color="secondary"
                  disableElevation
                  type="submit"
                  fullWidth
                >
                  Recommend cards!
                </Button>
              </Grid>
              <Grid xs={5} md={5}>
                {recommendedCards.length > 0 && (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Top Recommendations:
                    </Typography>
                    <List>
                      {recommendedCards.map((card_name, id) => (
                        <ListItem dense key={id}>
                          {card_name}
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </form>
    </Container>
  );
};

export default CardRecommender;
