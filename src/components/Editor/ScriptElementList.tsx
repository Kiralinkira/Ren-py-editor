import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { RenpyElement, RenpyCharacter, RenpyElementType } from '../../types/renpy';

interface ScriptElementListProps {
  elements: RenpyElement[];
  characters: RenpyCharacter[];
  selectedId?: string;
  onSelect: (element: RenpyElement) => void;
  onDelete: (id: string) => void;
  onReorder: (elements: RenpyElement[]) => void;
}

export const ScriptElementList: React.FC<ScriptElementListProps> = ({
  elements,
  characters,
  selectedId,
  onSelect,
  onDelete,
  onReorder
}) => {
  const [draggedItem, setDraggedItem] = React.useState<number | null>(null);

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
    
    // Remove dragged item
    newElements.splice(draggedItem, 1);
    
    // Insert at new position
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
        return `${char ? char.name : 'Narrator'}: "${element.content}"`;
      case 'scene':
        return `Scene: ${element.image}${element.transition ? ` with ${element.transition}` : ''}`;
      case 'show':
        return `Show: ${element.image} at ${element.position}`;
      case 'hide':
        return `Hide: ${element.image}`;
      case 'menu':
        return `Menu with ${element.choices?.length || 0} choices`;
      case 'label':
        return `Label: ${element.label}`;
      case 'jump':
        return `Jump to: ${element.label}`;
      case 'play':
        return `Play ${element.channel}: ${element.audio}`;
      case 'variable':
        return `Set ${element.variable} = ${element.value}`;
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

  return (
    <Box>
      {elements.map((element, index) => (
        <Card
          key={element.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          sx={{
            mb: 1,
            cursor: 'move',
            opacity: draggedItem === index ? 0.5 : 1,
            border: selectedId === element.id ? 2 : 0,
            borderColor: 'primary.main',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
            <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Box flex={1} onClick={() => onSelect(element)}>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={element.type}
                  size="small"
                  color={getElementColor(element.type)}
                />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {getElementPreview(element)}
                </Typography>
              </Box>
            </Box>
            <CardActions>
              <IconButton size="small" onClick={() => onSelect(element)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(element.id);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </CardActions>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};