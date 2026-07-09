import React from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import OutlinedInput from '@mui/material/OutlinedInput';
import Chip from '@mui/material/Chip';
import SearchBar from './SearchBar';
import { FilterSectionProps } from './type';

export const FilterSection: React.FC<FilterSectionProps> = ({
  filterMenuConfig = [],
  filters,
  onFilterChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  disabled = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
      }}
    >
      {/* Search Input */}
      <SearchBar
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        disabled={disabled}
      />

      {/* Dynamic Filter Dropdowns */}
      {filterMenuConfig.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 2,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {filterMenuConfig.map((item) => {
            const selectValue = filters[item.key] !== undefined
              ? filters[item.key]
              : (item.multiple ? [] : '');

            const handleChange = (e: SelectChangeEvent<any>) => {
              onFilterChange(item.key, e.target.value);
            };

            const labelId = `filter-select-label-${item.key}`;

            return (
              <FormControl
                key={item.key}
                size="small"
                disabled={disabled || item.disabled}
                sx={{
                  minWidth: item.width || 130,
                  flexGrow: { xs: 1, sm: 0 },
                }}
              >
                <InputLabel id={labelId}>{item.label}</InputLabel>
                <Select
                  labelId={labelId}
                  multiple={item.multiple}
                  value={selectValue}
                  onChange={handleChange}
                  input={<OutlinedInput label={item.label} />}
                  renderValue={(selected) => {
                    if (item.multiple) {
                      const selectedArray = Array.isArray(selected) ? selected : [selected];
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selectedArray.map((value) => {
                            const opt = item.options.find((o) => o.value === value);
                            const textLabel = opt ? opt.label : String(value);
                            return (
                              <Chip
                                key={value}
                                label={textLabel}
                                size="small"
                                sx={{ height: 20, fontSize: '11px', borderRadius: '4px' }}
                              />
                            );
                          })}
                        </Box>
                      );
                    }
                    const opt = item.options.find((o) => o.value === selected);
                    return opt ? opt.label : String(selected);
                  }}
                  endAdornment={
                    item.loading ? (
                      <CircularProgress
                        size={16}
                        sx={{ position: 'absolute', right: 28, color: 'text.secondary' }}
                      />
                    ) : null
                  }
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: 'background.paper',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--color-border)',
                    },
                  }}
                >
                  {/* For single selects, allow clearing the filter */}
                  {!item.multiple && (
                    <MenuItem value="">
                      <em>All</em>
                    </MenuItem>
                  )}
                  
                  {item.options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {item.getOptionLabel ? item.getOptionLabel(opt) : opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default FilterSection;
