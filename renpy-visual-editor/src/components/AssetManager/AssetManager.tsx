import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Fab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useLanguage } from '../../contexts/LanguageContext';

interface Asset {
  id: string;
  name: string;
  path: string;
  type: 'image' | 'audio' | 'character';
  tags?: string[];
}

interface AssetManagerProps {
  open: boolean;
  onClose: () => void;
  onSelectAsset: (asset: Asset) => void;
}

export const AssetManager: React.FC<AssetManagerProps> = ({
  open,
  onClose,
  onSelectAsset
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 模拟资源数据
  const [assets, setAssets] = useState<Asset[]>([
    // 背景
    { id: '1', name: 'bg room', path: 'bg/room.jpg', type: 'image', tags: ['室内', '房间'] },
    { id: '2', name: 'bg school', path: 'bg/school.jpg', type: 'image', tags: ['学校', '室外'] },
    { id: '3', name: 'bg park', path: 'bg/park.jpg', type: 'image', tags: ['公园', '室外'] },
    { id: '4', name: 'bg night_sky', path: 'bg/night_sky.jpg', type: 'image', tags: ['夜晚', '天空'] },
    { id: '5', name: 'bg sunset', path: 'bg/sunset.jpg', type: 'image', tags: ['黄昏', '室外'] },
    
    // 角色
    { id: '6', name: 'eileen happy', path: 'characters/eileen_happy.png', type: 'character', tags: ['艾琳', '开心'] },
    { id: '7', name: 'eileen normal', path: 'characters/eileen_normal.png', type: 'character', tags: ['艾琳', '普通'] },
    { id: '8', name: 'eileen sad', path: 'characters/eileen_sad.png', type: 'character', tags: ['艾琳', '悲伤'] },
    { id: '9', name: 'mary happy', path: 'characters/mary_happy.png', type: 'character', tags: ['玛丽', '开心'] },
    { id: '10', name: 'mary angry', path: 'characters/mary_angry.png', type: 'character', tags: ['玛丽', '生气'] },
    
    // 音频
    { id: '11', name: 'theme.mp3', path: 'audio/theme.mp3', type: 'audio', tags: ['背景音乐', '主题曲'] },
    { id: '12', name: 'battle.mp3', path: 'audio/battle.mp3', type: 'audio', tags: ['背景音乐', '战斗'] },
    { id: '13', name: 'sad_bgm.mp3', path: 'audio/sad_bgm.mp3', type: 'audio', tags: ['背景音乐', '悲伤'] },
    { id: '14', name: 'click.wav', path: 'audio/click.wav', type: 'audio', tags: ['音效', '点击'] },
    { id: '15', name: 'door.wav', path: 'audio/door.wav', type: 'audio', tags: ['音效', '门'] },
  ]);

  const getFilteredAssets = () => {
    const typeFilter = activeTab === 0 ? 'image' : activeTab === 1 ? 'character' : 'audio';
    return assets.filter(asset => {
      if (asset.type !== typeFilter && !(activeTab === 0 && asset.type === 'image')) return false;
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        asset.name.toLowerCase().includes(query) ||
        asset.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    });
  };

  const handleAddAsset = () => {
    // 这里可以实现文件上传功能
    alert('文件上传功能将在后续版本中实现');
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
  };

  const renderAssetCard = (asset: Asset) => {
    if (asset.type === 'audio') {
      return (
        <ListItem key={asset.id}>
          <ListItemIcon>
            <AudiotrackIcon />
          </ListItemIcon>
          <ListItemText 
            primary={asset.name}
            secondary={asset.tags?.join(', ')}
          />
          <ListItemSecondaryAction>
            <IconButton size="small" onClick={() => handleCopyPath(asset.path)}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => onSelectAsset(asset)}
            >
              <AddIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    }

    return (
      <Grid item xs={6} sm={4} md={3} key={asset.id}>
        <Card 
          sx={{ 
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 3
            }
          }}
          onClick={() => onSelectAsset(asset)}
        >
          <CardMedia
            component="div"
            sx={{
              height: 140,
              bgcolor: 'grey.300',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {asset.type === 'character' ? (
              <PersonIcon sx={{ fontSize: 60, color: 'grey.500' }} />
            ) : (
              <ImageIcon sx={{ fontSize: 60, color: 'grey.500' }} />
            )}
          </CardMedia>
          <CardContent sx={{ p: 1.5 }}>
            <Typography variant="body2" noWrap>
              {asset.name}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              {asset.tags?.map(tag => (
                <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{t('assets.title') || "资源管理器"}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab label={t('assets.backgrounds') || "背景"} />
            <Tab label={t('assets.characters') || "角色"} />
            <Tab label={t('assets.audio') || "音频"} />
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('assets.search') || "搜索资源..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {activeTab === 2 ? (
            <Paper variant="outlined">
              <List>
                {getFilteredAssets().map(renderAssetCard)}
              </List>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {getFilteredAssets().map(renderAssetCard)}
            </Grid>
          )}
        </Box>

        <Fab
          color="primary"
          sx={{
            position: 'absolute',
            bottom: 24,
            right: 24,
          }}
          onClick={handleAddAsset}
        >
          <AddIcon />
        </Fab>
      </DialogContent>
    </Dialog>
  );
};