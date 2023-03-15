import React from "react";
import Collapse from "@mui/material/Collapse";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// <TableRow
//   key={slice.lastUsedTime}
//   sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
// >
//   <TableCell component="td" scope="row" colSpan={columns.length}>
//     <Box p={1} className={classes.panel}>
//       <SliceDetails
//         client={client}
//         slice={slice}
//         network={network}
//       />
//     </Box>
//   </TableCell>
// </TableRow>
const SliceRow = (props) => {
  const { row } = props;
  console.log("fooo", row);
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.bip32Path}
        </TableCell>
        <TableCell align="right">{row.utxos.length}</TableCell>
        <TableCell align="right">{row.balanceSats.toString()}</TableCell>
        <TableCell align="right">{row.lastUsed}</TableCell>
        <TableCell align="right">{row.address}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            History
            <Table size="small" aria-label="purchases">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Total price ($)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* {row.history.map((historyRow) => (
                  <TableRow key={historyRow.date}>
                    <TableCell component="th" scope="row">
                      {historyRow.date}
                    </TableCell>
                    <TableCell>{historyRow.customerId}</TableCell>
                    <TableCell align="right">{historyRow.amount}</TableCell>
                    <TableCell align="right">
                      {Math.round(historyRow.amount * row.price * 100) / 100}
                    </TableCell>
                  </TableRow>
                ))} */}
                some stuff
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default SliceRow;
