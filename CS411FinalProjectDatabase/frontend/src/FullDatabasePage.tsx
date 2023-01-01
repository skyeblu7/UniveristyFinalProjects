import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import GlobalStyles from '@mui/material/GlobalStyles';
import Container from '@mui/material/Container';
import CardTable from './components/CardTable';
import MainAppBar from './components/MainAppBar';
import AppFooter from './components/AppFooter';


export default function FullDatabasePage() {
    return (
    <React.Fragment>
      <GlobalStyles styles={{ ul: { margin: 0, padding: 0, listStyle: 'none' } }} />
      <CssBaseline />
      <MainAppBar />
      {/* Hero unit */}
      <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Illini CC'd
        </Typography>
        <CardTable />
      </Container>
      <AppFooter  />
    </React.Fragment>
    );
};