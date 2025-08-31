import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatIcon from '@mui/icons-material/Chat';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import PersonIcon from '@mui/icons-material/Person';
import ImageIcon from '@mui/icons-material/Image';
import { useLanguage } from '../../contexts/LanguageContext';
import { RenpyScript } from '../../types/renpy';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  script: RenpyScript;
}

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (script: RenpyScript) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  open,
  onClose,
  onSelect
}) => {
  const { t } = useLanguage();

  const templates: Template[] = [
    {
      id: 'blank',
      name: t('templates.blank'),
      description: '从空白项目开始',
      icon: <DescriptionIcon fontSize="large" />,
      script: {
        characters: [],
        elements: [
          {
            id: 'element-1',
            type: 'label',
            label: 'start'
          }
        ],
        assets: { images: [], audio: [], backgrounds: [] }
      }
    },
    {
      id: 'simple',
      name: t('templates.simple'),
      description: '包含基本对话的简单示例',
      icon: <ChatIcon fontSize="large" />,
      script: {
        characters: [
          { id: 'e', name: '艾琳', color: '#c8ffc8' }
        ],
        elements: [
          {
            id: 'element-1',
            type: 'label',
            label: 'start'
          },
          {
            id: 'element-2',
            type: 'scene',
            image: 'bg room',
            transition: 'fade'
          },
          {
            id: 'element-3',
            type: 'show',
            image: 'eileen happy',
            position: 'center',
            transition: 'dissolve'
          },
          {
            id: 'element-4',
            type: 'dialogue',
            character: 'e',
            content: '你好！欢迎来到视觉小说的世界！'
          },
          {
            id: 'element-5',
            type: 'dialogue',
            character: 'e',
            content: '让我们开始创作你的故事吧！'
          }
        ],
        assets: { images: [], audio: [], backgrounds: [] }
      }
    },
    {
      id: 'choice',
      name: t('templates.choice'),
      description: '展示选择分支的示例',
      icon: <ForkRightIcon fontSize="large" />,
      script: {
        characters: [
          { id: 'e', name: '艾琳', color: '#c8ffc8' }
        ],
        elements: [
          {
            id: 'element-1',
            type: 'label',
            label: 'start'
          },
          {
            id: 'element-2',
            type: 'scene',
            image: 'bg room'
          },
          {
            id: 'element-3',
            type: 'show',
            image: 'eileen normal',
            position: 'center'
          },
          {
            id: 'element-4',
            type: 'dialogue',
            character: 'e',
            content: '你想了解什么？'
          },
          {
            id: 'element-5',
            type: 'menu',
            choices: [
              {
                id: 'choice-1',
                text: '告诉我关于Ren\'Py',
                actions: []
              },
              {
                id: 'choice-2',
                text: '教我如何创作',
                actions: []
              },
              {
                id: 'choice-3',
                text: '我已经知道了',
                actions: []
              }
            ]
          }
        ],
        assets: { images: [], audio: [], backgrounds: [] }
      }
    },
    {
      id: 'character',
      name: t('templates.character'),
      description: '多角色对话示例',
      icon: <PersonIcon fontSize="large" />,
      script: {
        characters: [
          { id: 'e', name: '艾琳', color: '#c8ffc8' },
          { id: 'm', name: '玛丽', color: '#ffc8c8' },
          { id: 's', name: '希尔维', color: '#c8c8ff' }
        ],
        elements: [
          {
            id: 'element-1',
            type: 'label',
            label: 'start'
          },
          {
            id: 'element-2',
            type: 'scene',
            image: 'bg classroom'
          },
          {
            id: 'element-3',
            type: 'show',
            image: 'eileen happy',
            position: 'left'
          },
          {
            id: 'element-4',
            type: 'dialogue',
            character: 'e',
            content: '大家好！我是艾琳。'
          },
          {
            id: 'element-5',
            type: 'show',
            image: 'mary normal',
            position: 'right'
          },
          {
            id: 'element-6',
            type: 'dialogue',
            character: 'm',
            content: '我是玛丽，很高兴认识你！'
          },
          {
            id: 'element-7',
            type: 'show',
            image: 'sylvie smile',
            position: 'center'
          },
          {
            id: 'element-8',
            type: 'dialogue',
            character: 's',
            content: '我是希尔维，让我们一起创作故事吧！'
          }
        ],
        assets: { images: [], audio: [], backgrounds: [] }
      }
    },
    {
      id: 'scene',
      name: t('templates.scene'),
      description: '场景转换示例',
      icon: <ImageIcon fontSize="large" />,
      script: {
        characters: [
          { id: 'narrator', name: '旁白', color: '#ffffff' }
        ],
        elements: [
          {
            id: 'element-1',
            type: 'label',
            label: 'start'
          },
          {
            id: 'element-2',
            type: 'scene',
            image: 'bg morning',
            transition: 'fade'
          },
          {
            id: 'element-3',
            type: 'dialogue',
            content: '清晨的阳光洒进房间...'
          },
          {
            id: 'element-4',
            type: 'pause',
            duration: 2
          },
          {
            id: 'element-5',
            type: 'scene',
            image: 'bg noon',
            transition: 'dissolve'
          },
          {
            id: 'element-6',
            type: 'dialogue',
            content: '时间来到了中午...'
          },
          {
            id: 'element-7',
            type: 'scene',
            image: 'bg sunset',
            transition: 'pixellate'
          },
          {
            id: 'element-8',
            type: 'dialogue',
            content: '夕阳西下，一天即将结束...'
          }
        ],
        assets: { images: [], audio: [], backgrounds: [] }
      }
    }
  ];

  const handleSelect = (template: Template) => {
    onSelect(template.script);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '60vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight="bold">
            {t('templates.title')}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {templates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardActionArea
                  onClick={() => handleSelect(template)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                    <Box
                      sx={{
                        mb: 2,
                        color: 'primary.main',
                        display: 'flex',
                        justifyContent: 'center'
                      }}
                    >
                      {template.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};