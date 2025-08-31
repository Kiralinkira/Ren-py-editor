import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Chip,
  ListItemButton,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LabelIcon from '@mui/icons-material/Label';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import { RenpyScript, RenpyElement } from '../../types/renpy';
import { useLanguage } from '../../contexts/LanguageContext';

interface QuickJumpProps {
  open: boolean;
  onClose: () => void;
  script: RenpyScript;
  onJump: (elementId: string) => void;
}

interface JumpTarget {
  id: string;
  label: string;
  type: 'label' | 'bookmark' | 'recent';
  elementIndex: number;
  element: RenpyElement;
}

export const QuickJump: React.FC<QuickJumpProps> = ({
  open,
  onClose,
  script,
  onJump
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [jumpTargets, setJumpTargets] = useState<JumpTarget[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [recentJumps, setRecentJumps] = useState<string[]>([]);

  useEffect(() => {
    // 加载书签和最近跳转
    const savedBookmarks = localStorage.getItem('renpy-editor-bookmarks');
    const savedRecent = localStorage.getItem('renpy-editor-recent-jumps');
    
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    if (savedRecent) setRecentJumps(JSON.parse(savedRecent));
  }, []);

  useEffect(() => {
    const targets: JumpTarget[] = [];
    
    // 收集所有标签
    script.elements.forEach((element, index) => {
      if (element.type === 'label' && element.label) {
        targets.push({
          id: element.id,
          label: element.label,
          type: 'label',
          elementIndex: index,
          element
        });
      }
    });

    // 添加书签
    bookmarks.forEach(elementId => {
      const index = script.elements.findIndex(el => el.id === elementId);
      if (index !== -1) {
        const element = script.elements[index];
        targets.push({
          id: element.id,
          label: getElementPreview(element),
          type: 'bookmark',
          elementIndex: index,
          element
        });
      }
    });

    // 添加最近跳转
    recentJumps.slice(0, 5).forEach(elementId => {
      const index = script.elements.findIndex(el => el.id === elementId);
      if (index !== -1 && !targets.find(t => t.id === elementId)) {
        const element = script.elements[index];
        targets.push({
          id: element.id,
          label: getElementPreview(element),
          type: 'recent',
          elementIndex: index,
          element
        });
      }
    });

    setJumpTargets(targets);
  }, [script, bookmarks, recentJumps]);

  const getElementPreview = (element: RenpyElement): string => {
    switch (element.type) {
      case 'label':
        return `Label: ${element.label}`;
      case 'dialogue':
        return `${element.character || 'Narrator'}: ${element.content?.substring(0, 50)}...`;
      case 'scene':
        return `Scene: ${element.image}`;
      case 'menu':
        return `Menu (${element.choices?.length} choices)`;
      default:
        return element.type;
    }
  };

  const filteredTargets = jumpTargets.filter(target =>
    target.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJump = (target: JumpTarget) => {
    // 记录最近跳转
    const newRecent = [target.id, ...recentJumps.filter(id => id !== target.id)].slice(0, 10);
    setRecentJumps(newRecent);
    localStorage.setItem('renpy-editor-recent-jumps', JSON.stringify(newRecent));
    
    onJump(target.id);
    onClose();
  };

  const getIcon = (type: JumpTarget['type']) => {
    switch (type) {
      case 'label':
        return <LabelIcon />;
      case 'bookmark':
        return <BookmarkIcon color="primary" />;
      case 'recent':
        return <HistoryIcon color="action" />;
    }
  };

  const getTypeLabel = (type: JumpTarget['type']) => {
    switch (type) {
      case 'label':
        return t('quickJump.label') || '标签';
      case 'bookmark':
        return t('quickJump.bookmark') || '书签';
      case 'recent':
        return t('quickJump.recent') || '最近';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { height: '70vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{t('quickJump.title') || "快速跳转"}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder={t('quickJump.search') || "搜索标签、书签..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <List>
          {filteredTargets.map((target) => (
            <ListItemButton
              key={target.id}
              onClick={() => handleJump(target)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08)
                }
              }}
            >
              <ListItemIcon>
                {getIcon(target.type)}
              </ListItemIcon>
              <ListItemText
                primary={target.label}
                secondary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip 
                      label={getTypeLabel(target.type)} 
                      size="small" 
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      行 {target.elementIndex + 1}
                    </Typography>
                  </Box>
                }
              />
            </ListItemButton>
          ))}
        </List>

        {filteredTargets.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              {searchQuery ? '没有找到匹配的项目' : '没有可跳转的目标'}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};