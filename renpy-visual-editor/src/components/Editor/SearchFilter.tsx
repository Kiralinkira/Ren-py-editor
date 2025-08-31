import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Collapse,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Typography,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { RenpyElementType } from '../../types/renpy';
import { useLanguage } from '../../contexts/LanguageContext';

interface SearchFilterProps {
  onSearchChange: (query: string) => void;
  onTypeFilter: (types: RenpyElementType[]) => void;
  elementCount: number;
  filteredCount: number;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearchChange,
  onTypeFilter,
  elementCount,
  filteredCount
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<RenpyElementType[]>([]);

  const elementTypes: { value: RenpyElementType; label: string }[] = [
    { value: 'dialogue', label: t('editor.toolbar.dialogue') },
    { value: 'scene', label: t('editor.toolbar.scene') },
    { value: 'show', label: t('editor.toolbar.character') },
    { value: 'hide', label: t('editor.toolbar.hide') },
    { value: 'menu', label: t('editor.toolbar.menu') },
    { value: 'label', label: t('editor.toolbar.label') },
    { value: 'jump', label: t('editor.toolbar.jump') },
    { value: 'play', label: t('editor.toolbar.playAudio') },
    { value: 'variable', label: t('editor.toolbar.setVariable') },
  ];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handleTypeToggle = (type: RenpyElementType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(newTypes);
    onTypeFilter(newTypes);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    onSearchChange('');
    onTypeFilter([]);
  };

  const hasActiveFilters = searchQuery || selectedTypes.length > 0;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box>
        <TextField
          fullWidth
          size="small"
          placeholder={t('search.placeholder') || "搜索元素..."}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Stack direction="row" spacing={1}>
                  {hasActiveFilters && (
                    <Tooltip title={t('search.clear') || "清除过滤"}>
                      <IconButton size="small" onClick={clearFilters}>
                        <ClearIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t('search.filter') || "过滤选项"}>
                    <IconButton 
                      size="small" 
                      onClick={() => setShowFilters(!showFilters)}
                      color={selectedTypes.length > 0 ? 'primary' : 'default'}
                    >
                      <FilterListIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </InputAdornment>
            ),
          }}
        />
        
        <Collapse in={showFilters}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('search.filterByType') || "按类型过滤"}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {elementTypes.map(({ value, label }) => (
                <Chip
                  key={value}
                  label={label}
                  size="small"
                  onClick={() => handleTypeToggle(value)}
                  color={selectedTypes.includes(value) ? 'primary' : 'default'}
                  variant={selectedTypes.includes(value) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Box>
        </Collapse>

        {hasActiveFilters && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              显示 {filteredCount} / {elementCount} 个元素
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};