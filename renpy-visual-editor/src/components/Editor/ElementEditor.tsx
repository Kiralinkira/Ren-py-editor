import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Typography,
  IconButton,
  Button,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { RenpyElement, RenpyCharacter, MenuChoice } from '../../types/renpy';

interface ElementEditorProps {
  element: RenpyElement;
  characters: RenpyCharacter[];
  onUpdate: (element: RenpyElement) => void;
  onDelete: (id: string) => void;
}

export const ElementEditor: React.FC<ElementEditorProps> = ({
  element,
  characters,
  onUpdate,
  onDelete
}) => {
  const handleChange = (field: keyof RenpyElement, value: any) => {
    onUpdate({ ...element, [field]: value });
  };

  const handleChoiceUpdate = (choiceIndex: number, field: keyof MenuChoice, value: any) => {
    if (element.choices) {
      const newChoices = [...element.choices];
      newChoices[choiceIndex] = { ...newChoices[choiceIndex], [field]: value };
      handleChange('choices', newChoices);
    }
  };

  const addChoice = () => {
    const newChoice: MenuChoice = {
      id: `choice-${Date.now()}`,
      text: 'New Choice',
      actions: []
    };
    handleChange('choices', [...(element.choices || []), newChoice]);
  };

  const removeChoice = (index: number) => {
    if (element.choices) {
      const newChoices = element.choices.filter((_, i) => i !== index);
      handleChange('choices', newChoices);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" color="primary">
          {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
        </Typography>
        <IconButton onClick={() => onDelete(element.id)} color="error" size="small">
          <DeleteIcon />
        </IconButton>
      </Box>

      {/* Dialogue Editor */}
      {element.type === 'dialogue' && (
        <>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Character</InputLabel>
            <Select
              value={element.character || ''}
              onChange={(e) => handleChange('character', e.target.value)}
              label="Character"
            >
              <MenuItem value="">Narrator</MenuItem>
              {characters.map((char) => (
                <MenuItem key={char.id} value={char.id}>
                  {char.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Dialogue Text"
            value={element.content || ''}
            onChange={(e) => handleChange('content', e.target.value)}
          />
        </>
      )}

      {/* Scene Editor */}
      {element.type === 'scene' && (
        <>
          <TextField
            fullWidth
            label="Background Image"
            value={element.image || ''}
            onChange={(e) => handleChange('image', e.target.value)}
            sx={{ mb: 2 }}
            helperText="e.g., bg room, bg school"
          />
          <FormControl fullWidth>
            <InputLabel>Transition</InputLabel>
            <Select
              value={element.transition || ''}
              onChange={(e) => handleChange('transition', e.target.value)}
              label="Transition"
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="fade">Fade</MenuItem>
              <MenuItem value="dissolve">Dissolve</MenuItem>
              <MenuItem value="pixellate">Pixellate</MenuItem>
              <MenuItem value="move">Move</MenuItem>
              <MenuItem value="ease">Ease</MenuItem>
            </Select>
          </FormControl>
        </>
      )}

      {/* Show/Hide Character Editor */}
      {(element.type === 'show' || element.type === 'hide') && (
        <>
          <TextField
            fullWidth
            label="Character/Image"
            value={element.image || ''}
            onChange={(e) => handleChange('image', e.target.value)}
            sx={{ mb: 2 }}
            helperText="e.g., eileen happy, mary sad"
          />
          {element.type === 'show' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Position</InputLabel>
              <Select
                value={element.position || 'center'}
                onChange={(e) => handleChange('position', e.target.value)}
                label="Position"
              >
                <MenuItem value="left">Left</MenuItem>
                <MenuItem value="center">Center</MenuItem>
                <MenuItem value="right">Right</MenuItem>
                <MenuItem value="truecenter">True Center</MenuItem>
              </Select>
            </FormControl>
          )}
          <FormControl fullWidth>
            <InputLabel>Transition</InputLabel>
            <Select
              value={element.transition || ''}
              onChange={(e) => handleChange('transition', e.target.value)}
              label="Transition"
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="dissolve">Dissolve</MenuItem>
              <MenuItem value="moveinright">Move In Right</MenuItem>
              <MenuItem value="moveinleft">Move In Left</MenuItem>
              <MenuItem value="moveoutright">Move Out Right</MenuItem>
              <MenuItem value="moveoutleft">Move Out Left</MenuItem>
            </Select>
          </FormControl>
        </>
      )}

      {/* Menu Editor */}
      {element.type === 'menu' && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Choices</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addChoice}
              size="small"
              variant="outlined"
            >
              Add Choice
            </Button>
          </Box>
          {element.choices?.map((choice, index) => (
            <Box key={choice.id} mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  fullWidth
                  label={`Choice ${index + 1}`}
                  value={choice.text}
                  onChange={(e) => handleChoiceUpdate(index, 'text', e.target.value)}
                  size="small"
                />
                <IconButton
                  onClick={() => removeChoice(index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </>
      )}

      {/* Label Editor */}
      {element.type === 'label' && (
        <TextField
          fullWidth
          label="Label Name"
          value={element.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
          helperText="Used for jumps and calls"
        />
      )}

      {/* Jump Editor */}
      {element.type === 'jump' && (
        <TextField
          fullWidth
          label="Jump to Label"
          value={element.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
        />
      )}

      {/* Play Audio Editor */}
      {element.type === 'play' && (
        <>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Channel</InputLabel>
            <Select
              value={element.channel || 'music'}
              onChange={(e) => handleChange('channel', e.target.value)}
              label="Channel"
            >
              <MenuItem value="music">Music</MenuItem>
              <MenuItem value="sound">Sound</MenuItem>
              <MenuItem value="voice">Voice</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Audio File"
            value={element.audio || ''}
            onChange={(e) => handleChange('audio', e.target.value)}
            helperText="e.g., audio/theme.mp3"
          />
        </>
      )}

      {/* Variable Editor */}
      {element.type === 'variable' && (
        <>
          <TextField
            fullWidth
            label="Variable Name"
            value={element.variable || ''}
            onChange={(e) => handleChange('variable', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Value"
            value={element.value || ''}
            onChange={(e) => handleChange('value', e.target.value)}
            helperText="e.g., True, False, 0, 'text'"
          />
        </>
      )}
    </Paper>
  );
};