import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Fade,
  Slide,
  Zoom
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { RenpyScript, PreviewState, RenpyElement } from '../../types/renpy';

interface GamePreviewProps {
  script: RenpyScript;
}

export const GamePreview: React.FC<GamePreviewProps> = ({ script }) => {
  const [previewState, setPreviewState] = useState<PreviewState>({
    currentElementIndex: 0,
    variables: {},
    visibleCharacters: {},
    isPlaying: false
  });
  
  const [showText, setShowText] = useState(true);
  const [menuChoices, setMenuChoices] = useState<any>(null);
  const [transition, setTransition] = useState<string>('');

  const currentElement = script.elements[previewState.currentElementIndex];

  useEffect(() => {
    if (previewState.isPlaying && currentElement) {
      processCurrentElement();
    }
  }, [previewState.currentElementIndex, previewState.isPlaying]);

  const processCurrentElement = () => {
    if (!currentElement) return;

    setShowText(false);
    setTransition(currentElement.transition || '');

    setTimeout(() => {
      switch (currentElement.type) {
        case 'scene':
          setPreviewState(prev => ({
            ...prev,
            background: currentElement.image,
            visibleCharacters: {} // Clear all characters on scene change
          }));
          break;

        case 'show':
          if (currentElement.image) {
            const [charName, ...expression] = currentElement.image.split(' ');
            setPreviewState(prev => ({
              ...prev,
              visibleCharacters: {
                ...prev.visibleCharacters,
                [charName]: {
                  character: charName,
                  image: currentElement.image!,
                  position: currentElement.position || 'center'
                }
              }
            }));
          }
          break;

        case 'hide':
          if (currentElement.image) {
            const charName = currentElement.image.split(' ')[0];
            setPreviewState(prev => {
              const newChars = { ...prev.visibleCharacters };
              delete newChars[charName];
              return { ...prev, visibleCharacters: newChars };
            });
          }
          break;

        case 'menu':
          setMenuChoices(currentElement.choices);
          setPreviewState(prev => ({ ...prev, isPlaying: false }));
          return;

        case 'variable':
          if (currentElement.variable) {
            setPreviewState(prev => ({
              ...prev,
              variables: {
                ...prev.variables,
                [currentElement.variable!]: currentElement.value
              }
            }));
          }
          break;

        case 'play':
          if (currentElement.channel === 'music') {
            setPreviewState(prev => ({
              ...prev,
              backgroundMusic: currentElement.audio
            }));
          }
          break;
      }

      setShowText(true);

      // Auto-advance for non-dialogue elements
      if (currentElement.type !== 'dialogue' && currentElement.type !== 'menu') {
        setTimeout(() => {
          if (previewState.isPlaying) {
            advance();
          }
        }, 500);
      }
    }, 300);
  };

  const advance = () => {
    setMenuChoices(null);
    if (previewState.currentElementIndex < script.elements.length - 1) {
      setPreviewState(prev => ({
        ...prev,
        currentElementIndex: prev.currentElementIndex + 1
      }));
    } else {
      setPreviewState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const handleMenuChoice = (choiceIndex: number) => {
    setMenuChoices(null);
    // In a real implementation, this would execute the choice actions
    // For now, just advance
    advance();
    setPreviewState(prev => ({ ...prev, isPlaying: true }));
  };

  const togglePlay = () => {
    setPreviewState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    if (!previewState.isPlaying && currentElement) {
      processCurrentElement();
    }
  };

  const restart = () => {
    setPreviewState({
      currentElementIndex: 0,
      variables: {},
      visibleCharacters: {},
      isPlaying: false
    });
    setMenuChoices(null);
  };

  const skip = () => {
    advance();
  };

  const getCharacterName = (charId: string) => {
    const character = script.characters.find(c => c.id === charId);
    return character ? character.name : '';
  };

  const getCharacterColor = (charId: string) => {
    const character = script.characters.find(c => c.id === charId);
    return character?.color || '#ffffff';
  };

  const renderTransition = (content: React.ReactNode) => {
    switch (transition) {
      case 'fade':
        return <Fade in={showText} timeout={500}>{<Box>{content}</Box>}</Fade>;
      case 'dissolve':
        return <Fade in={showText} timeout={1000}>{<Box>{content}</Box>}</Fade>;
      case 'slide':
        return <Slide in={showText} direction="up" timeout={500}>{<Box>{content}</Box>}</Slide>;
      default:
        return content;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#000',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Game Screen */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            background: previewState.background
              ? `linear-gradient(to bottom, #4a5568, #2d3748)`
              : 'linear-gradient(to bottom, #87CEEB, #98D8C8)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Characters */}
          {Object.values(previewState.visibleCharacters).map((char) => (
            <Box
              key={char.character}
              sx={{
                position: 'absolute',
                bottom: 0,
                left: char.position === 'left' ? '10%' : char.position === 'right' ? '60%' : '35%',
                width: '30%',
                height: '80%',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                transition: 'all 0.5s ease'
              }}
            >
              {/* Character Placeholder */}
              <Box
                sx={{
                  width: '80%',
                  height: '90%',
                  background: 'linear-gradient(to bottom, #667eea, #764ba2)',
                  borderRadius: '50% 50% 0 0',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '15%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '40%',
                    height: '40%',
                    background: '#fbbf24',
                    borderRadius: '50%'
                  }
                }}
              />
            </Box>
          ))}

          {/* Dialogue Box */}
          {currentElement && (currentElement.type === 'dialogue' || menuChoices) && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(0, 0, 0, 0.8)',
                p: 3,
                minHeight: '25%'
              }}
            >
              {renderTransition(
                <>
                  {currentElement.type === 'dialogue' && (
                    <>
                      {currentElement.character && (
                        <Typography
                          variant="h6"
                          sx={{
                            color: getCharacterColor(currentElement.character),
                            mb: 1
                          }}
                        >
                          {getCharacterName(currentElement.character)}
                        </Typography>
                      )}
                      <Typography
                        variant="body1"
                        sx={{ color: '#fff', lineHeight: 1.8 }}
                      >
                        {currentElement.content}
                      </Typography>
                    </>
                  )}

                  {menuChoices && (
                    <Box>
                      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                        Choose:
                      </Typography>
                      {menuChoices.map((choice: any, index: number) => (
                        <Button
                          key={choice.id}
                          variant="outlined"
                          fullWidth
                          sx={{
                            mb: 1,
                            color: '#fff',
                            borderColor: '#fff',
                            '&:hover': {
                              borderColor: '#fff',
                              bgcolor: 'rgba(255, 255, 255, 0.1)'
                            }
                          }}
                          onClick={() => handleMenuChoice(index)}
                        >
                          {choice.text}
                        </Button>
                      ))}
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </Box>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={(previewState.currentElementIndex / script.elements.length) * 100}
          sx={{ height: 4 }}
        />

        {/* Controls */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 1,
            bgcolor: 'background.paper',
            gap: 1
          }}
        >
          <IconButton onClick={restart} title="Restart">
            <RestartAltIcon />
          </IconButton>
          <IconButton
            onClick={togglePlay}
            color="primary"
            title={previewState.isPlaying ? 'Pause' : 'Play'}
          >
            {previewState.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton
            onClick={skip}
            disabled={!currentElement || currentElement.type === 'menu'}
            title="Next"
          >
            <SkipNextIcon />
          </IconButton>
          <Typography variant="body2" sx={{ ml: 2 }}>
            {previewState.currentElementIndex + 1} / {script.elements.length}
          </Typography>
        </Box>
      </Paper>

      {/* Click to advance hint */}
      {previewState.isPlaying && currentElement?.type === 'dialogue' && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 180,
            right: 20,
            color: '#fff',
            opacity: 0.7,
            pointerEvents: 'none'
          }}
        >
          <Typography variant="caption">Click to continue...</Typography>
        </Box>
      )}
    </Box>
  );
};