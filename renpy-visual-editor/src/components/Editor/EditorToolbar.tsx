import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';
import ImageIcon from '@mui/icons-material/Image';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LabelIcon from '@mui/icons-material/Label';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CodeIcon from '@mui/icons-material/Code';
import { RenpyElementType } from '../../types/renpy';

interface EditorToolbarProps {
  onAddElement: (type: RenpyElementType) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ onAddElement }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAdd = (type: RenpyElementType) => {
    onAddElement(type);
    handleClose();
  };

  const quickActions = [
    { type: 'dialogue' as RenpyElementType, icon: <ChatIcon />, label: 'Dialogue' },
    { type: 'scene' as RenpyElementType, icon: <ImageIcon />, label: 'Scene' },
    { type: 'show' as RenpyElementType, icon: <PersonIcon />, label: 'Show Character' },
    { type: 'menu' as RenpyElementType, icon: <MenuBookIcon />, label: 'Menu' },
    { type: 'label' as RenpyElementType, icon: <LabelIcon />, label: 'Label' },
  ];

  const moreActions = [
    { type: 'hide' as RenpyElementType, label: 'Hide Character' },
    { type: 'play' as RenpyElementType, label: 'Play Audio' },
    { type: 'stop' as RenpyElementType, label: 'Stop Audio' },
    { type: 'jump' as RenpyElementType, label: 'Jump to Label' },
    { type: 'call' as RenpyElementType, label: 'Call Label' },
    { type: 'variable' as RenpyElementType, label: 'Set Variable' },
    { type: 'if' as RenpyElementType, label: 'If Statement' },
    { type: 'python' as RenpyElementType, label: 'Python Code' },
    { type: 'pause' as RenpyElementType, label: 'Pause' },
    { type: 'return' as RenpyElementType, label: 'Return' },
  ];

  return (
    <Box sx={{ p: isMobile ? 1 : 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      <Box display="flex" gap={isMobile ? 1 : 2} alignItems="center" flexWrap="wrap">
        {isMobile ? (
          <>
            {quickActions.map((action) => (
              <Tooltip key={action.type} title={`Add ${action.label}`}>
                <IconButton
                  color="primary"
                  onClick={() => handleAdd(action.type)}
                  size="small"
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
            <IconButton
              color="default"
              onClick={handleClick}
              size="small"
            >
              <AddIcon />
            </IconButton>
          </>
        ) : (
          <>
            <ButtonGroup variant="contained" size="small">
              {quickActions.map((action) => (
                <Tooltip key={action.type} title={`Add ${action.label}`}>
                  <Button
                    startIcon={action.icon}
                    onClick={() => handleAdd(action.type)}
                  >
                    {action.label}
                  </Button>
                </Tooltip>
              ))}
            </ButtonGroup>

            <Divider orientation="vertical" flexItem />

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleClick}
            >
              More Elements
            </Button>
          </>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {moreActions.map((action) => (
            <MenuItem
              key={action.type}
              onClick={() => handleAdd(action.type)}
            >
              {action.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  );
};