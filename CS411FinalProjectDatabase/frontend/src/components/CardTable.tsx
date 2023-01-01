import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import {
  FormControl,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { useEffect, useState } from "react";
import { CardData } from "../types";
import CardModal from "./CardModal";

const rewardTypes = ["Cashback", "Points"];

const Row = (props: {
  row: CardData;
  cardsCallback: (response: any) => void;
  cardModalCallback: (card: CardData) => void;
  isAdmin: boolean;
}) => {
  const { row, cardsCallback, cardModalCallback, isAdmin } = props;
  const [open, setOpen] = useState(false);
  const [rewardType, setRewardType] = useState(row.reward_type);
  const [editMode, setEditMode] = useState(false);
  const [rowChanges, setRowChanges] = useState({});

  const handleCardClick = () => {
    axios.get(
      process.env.REACT_APP_API_URL +
        "/queries/clickDetected?card_id=" +
        row.card_id
    );
    cardModalCallback(row);
  };
  const handleRowDelete = (id: number) => {
    console.log("Delete card id: " + id);
    axios
      .delete(process.env.REACT_APP_API_URL + "/cards/" + id)
      .then((response) => {
        console.log(response.data);
        cardsCallback(response);
      });
  };

  const handleRewardTypeChange = (event: SelectChangeEvent) => {
    setRewardType(event.target.value);
    handleTextFieldChange({
      fieldName: "reward_type",
      fieldValue: event.target.value,
    });
  };

  const handleToggleEditMode = () => {
    if (editMode) {
      setRowChanges({});
    }
    setEditMode(!editMode);
  };

  const handleTextFieldChange = (change: {
    fieldName: any;
    fieldValue: any;
  }) => {
    setRowChanges({ ...rowChanges, [change.fieldName]: change.fieldValue });
  };

  const handleUpdateCard = () => {
    // check all values in the row and see submit the ones that are changed to the backend
    // post the row changes
    console.log(rowChanges);
    axios
      .put(process.env.REACT_APP_API_URL + "/cards/" + row.card_id, rowChanges)
      .then((response) => {
        console.log(response.data);
        cardsCallback(response);
      });
    handleToggleEditMode();
  };

  return (
    <>
      <TableRow
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          "&:hover": { background: "#009FD4" },
        }}
        onClick={() => {
          if (!isAdmin) {
            handleCardClick();
          }
        }}
      >
        <TableCell>
          {isAdmin && (
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open && isAdmin ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </IconButton>
          )}
        </TableCell>
        <TableCell component="th" scope="row">
          {editMode ? (
            <TextField
              id="card_name"
              variant="outlined"
              size="small"
              defaultValue={row.card_name}
              onChange={(e) =>
                handleTextFieldChange({
                  fieldName: "card_name",
                  fieldValue: e.target.value,
                })
              }
              sx={{ backgroundColor: "white" }}
            />
          ) : (
            row.card_name
          )}
        </TableCell>
        <TableCell align="right">
          {editMode ? (
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
              <Select
                id="reward_type"
                value={rewardType}
                displayEmpty
                onChange={handleRewardTypeChange}
                inputProps={{ "aria-label": "Without label" }}
                sx={{ backgroundColor: "white" }}
              >
                {rewardTypes.map((rewardType, index) => (
                  <MenuItem value={rewardType} key={index}>
                    {rewardType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            rewardType
          )}
        </TableCell>
        <TableCell align="right">
          {editMode ? (
            <TextField
              id="min_rec_credit"
              label="Minimum Score"
              variant="outlined"
              size="small"
              onChange={(e) =>
                handleTextFieldChange({
                  fieldName: "min_rec_credit",
                  fieldValue: e.target.value,
                })
              }
              defaultValue={row.min_rec_credit}
              sx={{ backgroundColor: "white" }}
            />
          ) : (
            row.min_rec_credit
          )}
        </TableCell>
        <TableCell align="right">
          {editMode ? (
            <TextField
              id="annual_fee"
              label="Annual Fee ($)"
              variant="outlined"
              size="small"
              defaultValue={row.annual_fee}
              onChange={(e) =>
                handleTextFieldChange({
                  fieldName: "annual_fee",
                  fieldValue: e.target.value,
                })
              }
              sx={{ backgroundColor: "white" }}
            />
          ) : (
            "$ " + row.annual_fee
          )}
        </TableCell>
      </TableRow>
      {isAdmin && (
        <TableRow>
          <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box
                component="form"
                sx={{
                  margin: 1,
                  "& .MuiTextField-root": { m: 1, width: "25ch" },
                }}
              >
                <Box
                  component="span"
                  m={1}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  {editMode ? (
                    <ButtonGroup>
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        onClick={handleToggleEditMode}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={handleUpdateCard}
                      >
                        Update
                      </Button>
                    </ButtonGroup>
                  ) : (
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      onClick={handleToggleEditMode}
                    >
                      Modify
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleRowDelete(row.card_id)}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const InsertableRow = (props: {
  onInsert: () => void;
  cardsCallback: (response: any) => void;
}) => {
  const { cardsCallback, onInsert } = props;
  const [rowChanges, setRowChanges] = useState({});

  const [rewardType, setRewardType] = useState("");

  const handleRewardTypeChange = (event: SelectChangeEvent) => {
    setRewardType(event.target.value);
    handleTextFieldChange({
      fieldName: "reward_type",
      fieldValue: event.target.value,
    });
  };

  const handleTextFieldChange = (change: {
    fieldName: any;
    fieldValue: any;
  }) => {
    setRowChanges({ ...rowChanges, [change.fieldName]: change.fieldValue });
  };

  const handleInsert = () => {
    // check all values in the row and see submit the ones that are changed to the backend
    // post the row changes
    console.log(rowChanges);
    axios
      .post(process.env.REACT_APP_API_URL + "/cards/", rowChanges)
      .then((response) => {
        console.log(response.data);
        cardsCallback(response);
      });
    setRowChanges({}); // Clear row since it has been submitted
    onInsert();
  };

  return (
    <TableRow>
      <TableCell>
        <Button variant="contained" color="secondary" onClick={handleInsert}>
          Insert
        </Button>
      </TableCell>
      <TableCell component="th" scope="row">
        <TextField
          id="card_name"
          variant="outlined"
          size="small"
          defaultValue={""}
          label="Card Name"
          onChange={(e) =>
            handleTextFieldChange({
              fieldName: "card_name",
              fieldValue: e.target.value,
            })
          }
          sx={{ backgroundColor: "white" }}
        />
      </TableCell>
      <TableCell align="right">
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <Select
            id="reward_type"
            value={rewardType}
            onChange={handleRewardTypeChange}
            sx={{ backgroundColor: "white" }}
          >
            {rewardTypes.map((rewardType, index) => (
              <MenuItem value={rewardType} key={index}>
                {rewardType}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell align="right">
        <TextField
          id="min_rec_credit"
          label="Minimum Score"
          variant="outlined"
          size="small"
          onChange={(e) =>
            handleTextFieldChange({
              fieldName: "min_rec_credit",
              fieldValue: e.target.value,
            })
          }
          defaultValue={""}
          sx={{ backgroundColor: "white" }}
        />
      </TableCell>
      <TableCell align="right">
        <TextField
          id="annual_fee"
          label="Annual Fee ($)"
          variant="outlined"
          size="small"
          onChange={(e) =>
            handleTextFieldChange({
              fieldName: "annual_fee",
              fieldValue: e.target.value,
            })
          }
          sx={{ backgroundColor: "white" }}
        />
      </TableCell>
    </TableRow>
  );
};

const FilterableTableHead = (props: {
  cardsCallback: (response: any) => void;
}) => {
  const { cardsCallback } = props;
  const [toggleFilter, setToggleFilter] = useState(false);

  const handleToggleFilter = () => {
    setToggleFilter(!toggleFilter);
  };

  const [searchCardName, setSearchCardName] = useState("");

  const handleSubmitFilter = () => {
    console.log(searchCardName);
    axios
      .get(process.env.REACT_APP_API_URL + "/cards?card_name=" + searchCardName)
      .then((response) => {
        console.log(response.data);
        cardsCallback(response.data);
      });
  };
  return (
    <>
      <TableHead>
        <TableRow
          sx={{
            "& th": {
              fontWeight: "bold",
              color: "#FF5F05",
              backgroundColor: "#13294B",
            },
          }}
        >
          <TableCell>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={handleToggleFilter}
            >
              Filters
            </Button>
          </TableCell>
          <TableCell>Card Name</TableCell>
          <TableCell align="right">Reward Type</TableCell>
          <TableCell align="right">Minimum Score</TableCell>
          <TableCell align="right">Annual Fee</TableCell>
        </TableRow>
      </TableHead>
      {toggleFilter ? (
        <TableBody>
          <TableRow>
            <TableCell>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={handleSubmitFilter}
              >
                Search
              </Button>
            </TableCell>
            <TableCell component="th" scope="row">
              <TextField
                id="card_name"
                variant="outlined"
                size="small"
                label="Card Name"
                defaultValue={""}
                onChange={(e) => setSearchCardName(e.target.value)}
                sx={{ backgroundColor: "white" }}
              />
            </TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
          </TableRow>
        </TableBody>
      ) : null}
    </>
  );
};

interface CardDataTableProps {
  cards: CardData[];
  cardsCallback: (response: any) => void;
  cardModalCallback: (card: CardData) => void;
  updateCards: (response: any) => void;
  isAdmin: boolean;
}
const UserDataTable = ({
  cards,
  cardsCallback,
  cardModalCallback,
  updateCards,
  isAdmin = false,
}: CardDataTableProps) => {
  const [newRowCount, setNewRowCount] = useState<number>(0);

  return (
    <TableContainer component={Paper} sx={{ backgroundColor: "#F8FAFC" }}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="collapsible table">
        <FilterableTableHead cardsCallback={updateCards} />
        <TableBody>
          {cards.map((row) => (
            <Row
              key={row.card_id}
              row={row}
              cardsCallback={cardsCallback}
              isAdmin={isAdmin}
              cardModalCallback={cardModalCallback}
            />
          ))}
          {isAdmin && (
            <InsertableRow
              cardsCallback={cardsCallback}
              key={newRowCount}
              onInsert={() => {
                setNewRowCount(newRowCount + 1);
              }}
            />
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const DataTableSelector = ({ isAdmin = false }) => {
  // Returns the 'admin' version of the data table if user is authenticated as admin. Otherwise, return the regular 'user' table.
  const [creditCards, setCreditCards] = useState<CardData[]>([]);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [adminMode, setAdminMode] = useState(isAdmin);
  const [modalCard, setModalCard] = useState<CardData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = (card: CardData) => {
    setModalCard(card);
    setModalOpen(true);
  };
  const handleModalClose = () => setModalOpen(false);
  useEffect(() => {
    axios(process.env.REACT_APP_API_URL + "/cards")
      .then((response) => {
        setCreditCards(response.data);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        console.log(err);
      });
  }, [response]);

  if (error) return <h1>An error occurred</h1>;

  return (
    <>
      <CardModal
        card={modalCard}
        open={modalOpen}
        onModalClose={handleModalClose}
      />
      <FormGroup>
        <FormControlLabel
          control={<Switch />}
          label="Admin Mode"
          color="secondary"
          onClick={() => setAdminMode(!adminMode)}
        />
      </FormGroup>
      <UserDataTable
        cards={creditCards}
        cardsCallback={setResponse}
        updateCards={setCreditCards}
        isAdmin={adminMode}
        cardModalCallback={handleRowClick}
      />
    </>
  );
};

export default DataTableSelector;
