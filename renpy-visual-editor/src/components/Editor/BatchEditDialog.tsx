import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import { RenpyElement, RenpyCharacter } from '../../types/renpy';
import { useLanguage } from '../../contexts/LanguageContext';

interface BatchEditDialogProps {
  open: boolean;
  onClose: () => void;
  selectedElements: RenpyElement[];
  characters: RenpyCharacter[];
  onBatchEdit: (updates: Partial<RenpyElement>) => void;
}

export const BatchEditDialog: React.FC<BatchEditDialogProps> = ({
  open,
  onClose,
  selectedElements,
  characters,
  onBatchEdit
}) => {
  const { t } = useLanguage();
  const [updates, setUpdates] = useState<Partial<RenpyElement>>({});

  const handleApply = () => {
    onBatchEdit(updates);
    setUpdates({});
    onClose();
  };

  const elementTypes = Array.from(new Set(selectedElements.map(el => el.type)));
  const hasDialogue = elementTypes.includes('dialogue');
  const hasScene = elementTypes.includes('scene');
  const hasShow = elementTypes.includes('show');
  const hasTransitions = selectedElements.some(el => 'transition' in el);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('batch.title') || "批量编辑"}
        <Typography variant="body2" color="text.secondary">
          已选择 {selectedElements.length} 个元素
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              包含的元素类型：
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              {elementTypes.map(type => (
                <Chip key={type} label={type} size="small" />
              ))}
            </Stack>
          </Box>

          {hasDialogue && (
            <FormControl fullWidth>
              <InputLabel>{t('editor.element.character')}</InputLabel>
              <Select
                value={updates.character || ''}
                onChange={(e) => setUpdates({ ...updates, character: e.target.value })}
                label={t('editor.element.character')}
              >
                <MenuItem value="">
                  <em>不更改</em>
                </MenuItem>
                <MenuItem value="narrator">{t('editor.element.narrator')}</MenuItem>
                {characters.map((char) => (
                  <MenuItem key={char.id} value={char.id}>
                    {char.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {hasTransitions && (
            <FormControl fullWidth>
              <InputLabel>{t('editor.element.transition')}</InputLabel>
              <Select
                value={updates.transition || ''}
                onChange={(e) => setUpdates({ ...updates, transition: e.target.value })}
                label={t('editor.element.transition')}
              >
                <MenuItem value="">
                  <em>不更改</em>
                </MenuItem>
                <MenuItem value="none">{t('editor.element.none')}</MenuItem>
                <MenuItem value="fade">{t('editor.element.fade')}</MenuItem>
                <MenuItem value="dissolve">{t('editor.element.dissolve')}</MenuItem>
                <MenuItem value="pixellate">{t('editor.element.pixellate')}</MenuItem>
                <MenuItem value="move">{t('editor.element.move')}</MenuItem>
              </Select>
            </FormControl>
          )}

          {hasShow && (
            <FormControl fullWidth>
              <InputLabel>{t('editor.element.position')}</InputLabel>
              <Select
                value={updates.position || ''}
                onChange={(e) => setUpdates({ ...updates, position: e.target.value as any })}
                label={t('editor.element.position')}
              >
                <MenuItem value="">
                  <em>不更改</em>
                </MenuItem>
                <MenuItem value="left">{t('editor.element.left')}</MenuItem>
                <MenuItem value="center">{t('editor.element.center')}</MenuItem>
                <MenuItem value="right">{t('editor.element.right')}</MenuItem>
              </Select>
            </FormControl>
          )}

          <Alert severity="info">
            只有填写的字段会被更新，留空的字段将保持原值不变。
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button 
          onClick={handleApply} 
          variant="contained"
          disabled={Object.keys(updates).length === 0}
        >
          {t('batch.apply') || "应用更改"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};