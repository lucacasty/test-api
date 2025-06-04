import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const SearchBar = ({ children }: Props) => {
  return 
    <div className="searchBar-container">
      <SearchBar>
        <textarea
          className="search-input"
          placeholder="Enter your text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <Button textContent="Send" handleClick={handleSend} />
      </SearchBar>
    </div>
  ;
};

export default SearchBar;