import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { TextField } from '@mui/material';

const StyledTextField = styled(TextField)(({ theme }) => ({
  color: 'inherit',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
}));

const SearchBar = () => {
  const [query, setQuery] = useState('');

  const search = async event => {
    event.preventDefault();

    console.log(query);
  };

  return (
    <form onSubmit={search}>
      <StyledTextField
        id='search-bar'
        sx={{ input: { color: 'white' } }}
        onChange={ event => setQuery(event.target.value) }
        placeholder='Search...'
        size='small'
      />
      <IconButton
        type='submit'
        color='inherit'
        aria-label='search'
      >
        <SearchIcon />
      </IconButton>
    </form>
  );
};

export default SearchBar;