import React, { useState, useEffect, useMemo } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { SearchProps } from "./type";
import { debounce } from "./utils";
import { DEFAULT_DEBOUNCE_MS } from "./constants";

export const SearchBar: React.FC<SearchProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
}) => {
  const [localSearchValue, setLocalSearchValue] = useState(value);

  // Sync internal input value with external state changes
  useEffect(() => {
    setLocalSearchValue(value);
  }, [value]);

  // Create a debounced update callback to prevent rapid API calls
  const debouncedOnChange = useMemo(
    () => debounce((val: string) => onChange(val), DEFAULT_DEBOUNCE_MS),
    [onChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearchValue(val);
    debouncedOnChange(val);
  };

  const handleClear = () => {
    setLocalSearchValue("");
    onChange("");
  };

  return (
    <TextField
      value={localSearchValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      disabled={disabled}
      size="small"
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "text.secondary", fontSize: "20px" }} />
            </InputAdornment>
          ),
          endAdornment: localSearchValue ? (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClear}
                size="small"
                edge="end"
                disabled={disabled}
              >
                <ClearIcon sx={{ fontSize: "18px" }} />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
      sx={{
        maxWidth: { xs: "100%", sm: 300 },
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
        },
      }}
    />
  );
};

export default SearchBar;
