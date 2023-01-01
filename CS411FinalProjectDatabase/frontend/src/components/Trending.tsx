import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { TrendingCard } from '../types';

const Trending = (props: { trendingCards: TrendingCard[] }) => {
  return (
    <TableContainer
      component={Paper}
      sx={{ maxWidth: 300, backgroundColor: "#F8FAFC" }}
    >
      <Table size="small" aria-label="collapsible table">
        <TableHead
          sx={{
            "& th": {
              fontWeight: "bold",
              color: "#FF5F05",
              backgroundColor: "#13294B",
            },
          }}
        >
          <TableRow>
            <TableCell>Trending Cards</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.trendingCards.map((card, index) => (
            <TableRow key={index}>
              <TableCell>{(index + 1).toString() + ". " + card.card_name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Trending;
