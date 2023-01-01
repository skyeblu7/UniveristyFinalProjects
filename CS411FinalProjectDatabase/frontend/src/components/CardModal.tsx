import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import { CardData } from "../types";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 774,
  height: 486,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function CardModal(props: {
  card: CardData | null;
  open: boolean;
  onModalClose: () => void;
}) {
  const { card, open, onModalClose } = props;

  if (card === null) {
    return null;
  }

  console.log(card.signup_link);

  return (
    <div>
      <Modal
        open={open}
        onClose={onModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            {card.card_name || "Card Name"}
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={6} md={7}>
              <Box>
                <img
                  src={
                    card.image_url != null
                      ? card.image_url
                      : "https://creditcards.chase.com/K-Marketplace/images/cardart/freedom_unlimited_card_alt.png"
                  }
                  alt="Card"
                  width="344"
                  height="216"
                />
              </Box>
              <Button
                variant="contained"
                color="secondary"
                href={
                  card.signup_link != null
                    ? "https://www." + card.signup_link
                    : ""
                }
                target="_blank"
                rel="noopener"
                size="medium"
                sx={{ width: 330 }}
              >
                Apply Now
              </Button>
            </Grid>
            <Grid xs={5} md={5}>
              <List>
                <ListItem>
                  <b>Bank:&nbsp;</b>
                  {card.bank}
                </ListItem>
                <ListItem>
                  <b>Annual fee:&nbsp;</b>
                  {"$" + card.annual_fee}{" "}
                </ListItem>
                <ListItem>
                  <b>Credit Limit:&nbsp;</b>
                  {"$" + card.credit_limit}{" "}
                </ListItem>
                <ListItem>
                  <b>Signup Bonus:&nbsp;</b>
                  {"$" + card.signup_bonus}
                </ListItem>
                <ListItem>
                  <b>APR Range:&nbsp;</b>
                  {`(${card.APR_min}, ${card.APR_max})`}
                </ListItem>
                <ListItem>
                  <b>Minimum Credit Score:&nbsp;</b>
                  {card.min_rec_credit}
                </ListItem>
                <ListItem>
                  <b>Foreign Transaction Fee:&nbsp;</b>
                  {"$" + card.foreign_trans_fee}
                </ListItem>
                <ListItem>
                  <b>Reward Type:&nbsp;</b>
                  {card.reward_type}
                </ListItem>
                <ListItem>
                  <b>Payment Processor:&nbsp;</b>
                  {card.processor_id}
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
}
