import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { RenpyCharacter } from '../../types/renpy';

interface CharacterEditorProps {
  characters: RenpyCharacter[];
  onUpdate: (characters: RenpyCharacter[]) => void;
}

export const CharacterEditor: React.FC<CharacterEditorProps> = ({
  characters,
  onUpdate
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<RenpyCharacter | null>(null);
  const [formData, setFormData] = useState<Partial<RenpyCharacter>>({});

  const handleOpen = (character?: RenpyCharacter) => {
    if (character) {
      setEditingCharacter(character);
      setFormData(character);
    } else {
      setEditingCharacter(null);
      setFormData({
        id: '',
        name: '',
        color: '#ffffff'
      });
    }
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingCharacter(null);
    setFormData({});
  };

  const handleSave = () => {
    if (!formData.id || !formData.name) return;

    if (editingCharacter) {
      // Update existing
      const updated = characters.map(char =>
        char.id === editingCharacter.id ? formData as RenpyCharacter : char
      );
      onUpdate(updated);
    } else {
      // Add new
      onUpdate([...characters, formData as RenpyCharacter]);
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    onUpdate(characters.filter(char => char.id !== id));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Characters</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="small"
          onClick={() => handleOpen()}
        >
          Add Character
        </Button>
      </Box>

      <Paper variant="outlined">
        <List>
          {characters.map((character) => (
            <ListItem key={character.id} divider>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>{character.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({character.id})
                    </Typography>
                    {character.color && (
                      <Chip
                        size="small"
                        sx={{
                          backgroundColor: character.color,
                          color: '#fff',
                          ml: 1
                        }}
                        label="Color"
                      />
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleOpen(character)}
                  size="small"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(character.id)}
                  size="small"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {characters.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No characters defined"
                secondary="Click 'Add Character' to create one"
              />
            </ListItem>
          )}
        </List>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCharacter ? 'Edit Character' : 'Add Character'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Variable Name"
              value={formData.id || ''}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              sx={{ mb: 2 }}
              helperText="Used in script (e.g., 'e' for Eileen)"
              disabled={!!editingCharacter}
            />
            <TextField
              fullWidth
              label="Display Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
              helperText="Shown to player (e.g., 'Eileen')"
            />
            <TextField
              fullWidth
              label="Text Color"
              type="color"
              value={formData.color || '#ffffff'}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              sx={{ mb: 2 }}
              helperText="Character name color"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.id || !formData.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};