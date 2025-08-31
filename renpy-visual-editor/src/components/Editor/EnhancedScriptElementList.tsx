import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
  Checkbox,
  Button,
  Stack,
  Collapse,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  alpha
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BookmarkIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkAddedIcon from '@mui/icons-material/Bookmark';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { RenpyElement, RenpyCharacter, RenpyElementType } from '../../types/renpy';
import { useLanguage } from '../../contexts/LanguageContext';
import { SearchFilter } from './SearchFilter';
import { ValidationIssue } from '../../utils/scriptValidator';

interface EnhancedScriptElementListProps {
  elements: RenpyElement[];
  characters: RenpyCharacter[];
  selectedId?: string;
  selectedIds?: string[];
  validationIssues?: ValidationIssue[];
  onSelect: (element: RenpyElement) => void;
  onMultiSelect?: (ids: string[]) => void;
  onDelete: (id: string) => void;
  onReorder: (elements: RenpyElement[]) => void;
  onBookmark?: (id: string) => void;
  bookmarkedIds?: string[];
}

export const EnhancedScriptElementList: React.FC<EnhancedScriptElementListProps> = ({
  elements,
  characters,
  selectedId,
  selectedIds = [],
  validationIssues = [],
  onSelect,
  onMultiSelect,
  onDelete,
  onReorder,
  onBookmark,
  bookmarkedIds = []
}) => {
  const { t } = useLanguage();
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<RenpyElementType[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; elementId: string } | null>(null);

  // Group elements by labels
  const groupedElements = useMemo(() => {
    const groups: { label: string; elements: RenpyElement[] }[] = [];
    let currentGroup: { label: string; elements: RenpyElement[] } = { label: '', elements: [] };

    elements.forEach(element => {
      if (element.type === 'label') {
        if (currentGroup.elements.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = { label: element.label || '', elements: [element] };
      } else {
        currentGroup.elements.push(element);
      }
    });

    if (currentGroup.elements.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }, [elements]);

  // Filter elements
  const filteredElements = useMemo(() => {
    return elements.filter(element => {
      // Type filter
      if (typeFilter.length > 0 && !typeFilter.includes(element.type)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const elementText = getElementPreview(element).toLowerCase();
        return elementText.includes(query);
      }

      return true;
    });
  }, [elements, searchQuery, typeFilter]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem === null) return;

    const draggedElement = elements[draggedItem];
    const newElements = [...elements];
    
    newElements.splice(draggedItem, 1);
    
    if (draggedItem < dropIndex) {
      newElements.splice(dropIndex - 1, 0, draggedElement);
    } else {
      newElements.splice(dropIndex, 0, draggedElement);
    }
    
    onReorder(newElements);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const getElementPreview = (element: RenpyElement) => {
    switch (element.type) {
      case 'dialogue':
        const char = characters.find(c => c.id === element.character);
        return `${char ? char.name : t('editor.element.narrator')}: "${element.content}"`;
      case 'scene':
        return `${t('editor.toolbar.scene')}: ${element.image}${element.transition ? ` (${element.transition})` : ''}`;
      case 'show':
        return `${t('editor.toolbar.character')}: ${element.image} ${t('editor.element.position').toLowerCase()} ${element.position}`;
      case 'hide':
        return `${t('editor.toolbar.hide')}: ${element.image}`;
      case 'menu':
        return `${t('editor.toolbar.menu')} (${element.choices?.length || 0} ${t('editor.element.choices')})`;
      case 'label':
        return `${t('editor.toolbar.label')}: ${element.label}`;
      case 'jump':
        return `${t('editor.toolbar.jump')}: ${element.label}`;
      case 'play':
        return `${t('editor.toolbar.playAudio')} ${element.channel}: ${element.audio}`;
      case 'variable':
        return `${t('editor.toolbar.setVariable')}: ${element.variable} = ${element.value}`;
      default:
        return element.type;
    }
  };

  const getElementColor = (type: RenpyElementType): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const typeColors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      dialogue: 'primary',
      scene: 'secondary',
      show: 'info',
      hide: 'warning',
      menu: 'success',
      label: 'default',
      variable: 'error'
    };
    return typeColors[type] || 'default';
  };

  const handleSelectAll = () => {
    if (onMultiSelect) {
      onMultiSelect(filteredElements.map(el => el.id));
    }
  };

  const handleDeselectAll = () => {
    if (onMultiSelect) {
      onMultiSelect([]);
    }
  };

  const toggleGroup = (label: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(label)) {
      newCollapsed.delete(label);
    } else {
      newCollapsed.add(label);
    }
    setCollapsedGroups(newCollapsed);
  };

  const getValidationIcon = (elementId: string) => {
    const issues = validationIssues.filter(issue => issue.elementId === elementId);
    if (issues.length === 0) return null;

    const hasError = issues.some(i => i.type === 'error');
    const icon = hasError ? <ErrorIcon fontSize="small" color="error" /> : <WarningIcon fontSize="small" color="warning" />;
    const messages = issues.map(i => i.message).join('\n');

    return (
      <Tooltip title={messages}>
        {icon}
      </Tooltip>
    );
  };

  const renderElement = (element: RenpyElement, index: number) => {
    const isSelected = multiSelectMode ? selectedIds.includes(element.id) : selectedId === element.id;
    const isBookmarked = bookmarkedIds.includes(element.id);

    return (
      <Card
        key={element.id}
        draggable={!multiSelectMode}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
        onDragEnd={handleDragEnd}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({
            mouseX: e.clientX - 2,
            mouseY: e.clientY - 4,
            elementId: element.id
          });
        }}
        sx={{
          mb: 1,
          cursor: multiSelectMode ? 'pointer' : 'move',
          opacity: draggedItem === index ? 0.5 : 1,
          border: isSelected ? 2 : 0,
          borderColor: 'primary.main',
          bgcolor: isSelected ? alpha('#FF6B6B', 0.08) : 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
          {multiSelectMode && (
            <Checkbox
              checked={selectedIds.includes(element.id)}
              onChange={(e) => {
                if (onMultiSelect) {
                  if (e.target.checked) {
                    onMultiSelect([...selectedIds, element.id]);
                  } else {
                    onMultiSelect(selectedIds.filter(id => id !== element.id));
                  }
                }
              }}
              sx={{ mr: 1 }}
            />
          )}
          {!multiSelectMode && <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />}
          <Box flex={1} onClick={() => !multiSelectMode && onSelect(element)}>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={element.type}
                size="small"
                color={getElementColor(element.type)}
              />
              <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                {getElementPreview(element)}
              </Typography>
              {getValidationIcon(element.id)}
              {isBookmarked && <BookmarkAddedIcon fontSize="small" color="primary" />}
            </Box>
          </Box>
          <CardActions>
            {!multiSelectMode && (
              <>
                <IconButton size="small" onClick={() => onSelect(element)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onBookmark && onBookmark(element.id)}
                >
                  {isBookmarked ? <BookmarkAddedIcon fontSize="small" /> : <BookmarkIcon fontSize="small" />}
                </IconButton>
              </>
            )}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setContextMenu({
                  mouseX: e.currentTarget.getBoundingClientRect().left,
                  mouseY: e.currentTarget.getBoundingClientRect().bottom,
                  elementId: element.id
                });
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </CardActions>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <SearchFilter
        onSearchChange={setSearchQuery}
        onTypeFilter={setTypeFilter}
        elementCount={elements.length}
        filteredCount={filteredElements.length}
      />

      {multiSelectMode && (
        <Box sx={{ mb: 2, p: 1, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2">
              {t('batch.selected')}: {selectedIds.length}
            </Typography>
            <Button size="small" variant="outlined" color="inherit" onClick={handleSelectAll}>
              {t('batch.selectAll')}
            </Button>
            <Button size="small" variant="outlined" color="inherit" onClick={handleDeselectAll}>
              {t('batch.deselectAll')}
            </Button>
            <Box flex={1} />
            <Button size="small" variant="contained" color="secondary" onClick={() => setMultiSelectMode(false)}>
              完成
            </Button>
          </Stack>
        </Box>
      )}

      {!multiSelectMode && (
        <Box sx={{ mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setMultiSelectMode(true)}
          >
            批量编辑模式
          </Button>
        </Box>
      )}

      {/* Render grouped elements */}
      {groupedElements.map((group, groupIndex) => {
        const isCollapsed = collapsedGroups.has(group.label);
        const groupElements = group.elements.filter(el => filteredElements.includes(el));
        
        if (groupElements.length === 0) return null;

        return (
          <Box key={groupIndex} sx={{ mb: 2 }}>
            {group.label && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  p: 1,
                  borderRadius: 1
                }}
                onClick={() => toggleGroup(group.label)}
              >
                <IconButton size="small">
                  {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </IconButton>
                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                  {group.label}
                </Typography>
                <Chip label={groupElements.length} size="small" />
              </Box>
            )}
            <Collapse in={!isCollapsed}>
              <Box sx={{ pl: group.label ? 4 : 0 }}>
                {groupElements.map((element, index) => 
                  renderElement(element, elements.indexOf(element))
                )}
              </Box>
            </Collapse>
          </Box>
        );
      })}

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => {
          if (contextMenu) {
            navigator.clipboard.writeText(contextMenu.elementId);
            setContextMenu(null);
          }
        }}>
          复制ID
        </MenuItem>
        <MenuItem onClick={() => {
          if (contextMenu) {
            const element = elements.find(el => el.id === contextMenu.elementId);
            if (element) {
              const newElement = { ...element, id: `element-${Date.now()}` };
              // This would need to be implemented in the parent component
              setContextMenu(null);
            }
          }
        }}>
          复制元素
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          if (contextMenu) {
            onDelete(contextMenu.elementId);
            setContextMenu(null);
          }
        }} sx={{ color: 'error.main' }}>
          删除
        </MenuItem>
      </Menu>
    </Box>
  );
};