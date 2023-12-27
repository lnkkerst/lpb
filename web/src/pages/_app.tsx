import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Box, InputBase, Toolbar, Typography } from '@mui/material';
import { useState } from 'react';

function Search() {
  const host = window.location.host + '/';
  const navigate = useNavigate();
  const [id, setId] = useState('');

  return (
    <form
      className="flex items-center"
      onSubmit={e => {
        e.preventDefault();
        navigate(`/${id}`);
      }}
    >
      <div>{host}</div>
      <InputBase
        placeholder="Please Input ID"
        className="text-white! w-28"
        value={id}
        onChange={e => setId(e.target.value)}
      />
    </form>
  );
}

export default function AppLayout() {
  return (
    <Box>
      <AppBar position="absolute">
        <Toolbar>
          <Link to="/">
            <Typography variant="h6">LPB</Typography>
          </Link>

          <div className="mx-4">
            <Search />
          </div>
        </Toolbar>
      </AppBar>

      <main className="h-screen overflow-auto pt-16">
        <Outlet />
      </main>
    </Box>
  );
}
