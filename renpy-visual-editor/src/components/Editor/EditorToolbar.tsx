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
import { RenpyElementType } from '../../types/renpy';
import { useLanguage } from '../../contexts/LanguageContext';

interface EditorToolbarProps {
  onAddElement: (type: RenpyElementType) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ onAddElement }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useLanguage();
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
    { type: 'dialogue' as RenpyElementType, icon: <ChatIcon />, label: t('editor.toolbar.dialogue') },
    { type: 'scene' as RenpyElementType, icon: <ImageIcon />, label: t('editor.toolbar.scene') },
    { type: 'show' as RenpyElementType, icon: <PersonIcon />, label: t('editor.toolbar.character') },
    { type: 'menu' as RenpyElementType, icon: <MenuBookIcon />, label: t('editor.toolbar.menu') },
    { type: 'label' as RenpyElementType, icon: <LabelIcon />, label: t('editor.toolbar.label') },
  ];

  const moreActions = [
    { type: 'hide' as RenpyElementType, label: t('editor.toolbar.hide') },
    { type: 'play' as RenpyElementType, label: t('editor.toolbar.playAudio') },
    { type: 'stop' as RenpyElementType, label: t('editor.toolbar.stopAudio') },
    { type: 'jump' as RenpyElementType, label: t('editor.toolbar.jump') },
    { type: 'call' as RenpyElementType, label: t('editor.toolbar.call') },
    { type: 'variable' as RenpyElementType, label: t('editor.toolbar.setVariable') },
    { type: 'if' as RenpyElementType, label: t('editor.toolbar.ifStatement') },
    { type: 'python' as RenpyElementType, label: t('editor.toolbar.pythonCode') },
    { type: 'pause' as RenpyElementType, label: t('editor.toolbar.pause') },
    { type: 'return' as RenpyElementType, label: t('editor.toolbar.return') },
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
              {t('editor.toolbar.moreElements')}
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