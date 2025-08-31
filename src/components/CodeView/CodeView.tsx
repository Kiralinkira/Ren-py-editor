import React from 'react';
import Editor from '@monaco-editor/react';
import { Box, Paper, Typography, Button, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import { RenpyScript } from '../../types/renpy';
import { RenpyParser } from '../../utils/renpyParser';

interface CodeViewProps {
  script: RenpyScript;
}

export const CodeView: React.FC<CodeViewProps> = ({ script }) => {
  const code = RenpyParser.generateScript(script);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    // You could add a snackbar notification here
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.rpy';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6">Generated Ren'Py Code</Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Copy to clipboard">
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopy}
            >
              Copy
            </Button>
          </Tooltip>
          <Tooltip title="Download as .rpy file">
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </Tooltip>
        </Box>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false
          }}
        />
      </Box>
    </Paper>
  );
};