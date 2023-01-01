import AppBar from "@mui/material/AppBar";
import { styled } from "@mui/material/styles";

import Link from "@mui/material/Link";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export default function MainAppBar() {
  // TODO: Implement page links/switching component
  return (
    <StyledAppbar
      position="static"
      elevation={0}
      sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      enableColorOnDark
    >
      <Toolbar sx={{ flexWrap: "wrap" }}>
        <Typography variant="h5" color="secondary" noWrap sx={{ flexGrow: 1 }}>
          Illini CC'd
        </Typography>
        <nav>
          <Link
            variant="button"
            href="#"
            sx={{ my: 1, mx: 1.5 }}
            color="secondary"
          >
            Overview
          </Link>
          <Link
            variant="button"
            href="#"
            sx={{ my: 1, mx: 1.5 }}
            color="secondary"
          >
            Full Database
          </Link>
          <Link
            variant="button"
            href="#"
            sx={{ my: 1, mx: 1.5 }}
            color="secondary"
          >
            Trends
          </Link>
        </nav>
      </Toolbar>
    </StyledAppbar>
  );
}

const StyledAppbar = styled(AppBar)(({ theme }) => ({
  color: theme.palette.common.white,
})) as typeof AppBar;
