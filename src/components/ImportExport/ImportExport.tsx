import React, { useRef } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { RenpyScript } from '../../types/renpy';
import { RenpyParser } from '../../utils/renpyParser';

interface ImportExportProps {
  script: RenpyScript;
  onImport: (script: RenpyScript) => void;
}

export const ImportExport: React.FC<ImportExportProps> = ({ script, onImport }) => {
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [importText, setImportText] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportProject = () => {
    const projectData = JSON.stringify(script, null, 2);
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'renpy-project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportProject = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const projectData = JSON.parse(event.target?.result as string);
          onImport(projectData);
        } catch (err) {
          setError('Invalid project file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImportRenpyScript = () => {
    setImportDialogOpen(true);
    setError(null);
  };

  const handleConfirmImport = () => {
    try {
      const parsedScript = RenpyParser.parseScript(importText);
      onImport(parsedScript);
      setImportDialogOpen(false);
      setImportText('');
      setError(null);
    } catch (err) {
      setError('Failed to parse Ren\'Py script. Please check the syntax.');
    }
  };

  const handleSaveToLocalStorage = () => {
    localStorage.setItem('renpy-visual-editor-project', JSON.stringify(script));
    // You could add a snackbar notification here
  };

  const handleLoadFromLocalStorage = () => {
    const saved = localStorage.getItem('renpy-visual-editor-project');
    if (saved) {
      try {
        const projectData = JSON.parse(saved);
        onImport(projectData);
      } catch (err) {
        setError('Failed to load saved project');
      }
    }
  };

  return (
    <>
      <Box display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end">
        <ButtonGroup variant="outlined" size="small">
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSaveToLocalStorage}
            title="Save to browser"
            sx={{ minWidth: 'auto', px: 1 }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Save</Box>
            <Box sx={{ display: { xs: 'inline', sm: 'none' } }}><SaveIcon /></Box>
          </Button>
          <Button
            startIcon={<FolderOpenIcon />}
            onClick={handleLoadFromLocalStorage}
            title="Load from browser"
            sx={{ minWidth: 'auto', px: 1 }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Load</Box>
            <Box sx={{ display: { xs: 'inline', sm: 'none' } }}><FolderOpenIcon /></Box>
          </Button>
        </ButtonGroup>

        <ButtonGroup variant="outlined" size="small">
          <Button
            onClick={handleExportProject}
            title="Export project"
            sx={{ minWidth: 'auto', px: 1 }}
          >
            <DownloadIcon />
          </Button>
          <Button
            onClick={handleImportProject}
            title="Import project"
            sx={{ minWidth: 'auto', px: 1 }}
          >
            <UploadFileIcon />
          </Button>
        </ButtonGroup>

        <Button
          variant="outlined"
          size="small"
          onClick={handleImportRenpyScript}
          title="Import Ren'Py script"
          sx={{ minWidth: 'auto', px: 1 }}
        >
          <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Import Script</Box>
          <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>Script</Box>
        </Button>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Ren'Py Script</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Paste your Ren'Py script here. The editor will try to parse and import it.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            multiline
            rows={15}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={`define e = Character("Eileen", color="#c8ffc8")

label start:
    scene bg room
    show eileen happy
    e "Hello, world!"`}
            sx={{ fontFamily: 'monospace' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmImport}
            variant="contained"
            disabled={!importText.trim()}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};