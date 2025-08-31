import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Fade,
  Slide,
  useTheme,
  useMediaQuery
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { RenpyScript, PreviewState } from '../../types/renpy';

interface GamePreviewProps {
  script: RenpyScript;
}

export const GamePreview: React.FC<GamePreviewProps> = ({ script }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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

  const advance = useCallback(() => {
    setMenuChoices(null);
    if (previewState.currentElementIndex < script.elements.length - 1) {
      setPreviewState(prev => ({
        ...prev,
        currentElementIndex: prev.currentElementIndex + 1
      }));
    } else {
      setPreviewState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [previewState.currentElementIndex, script.elements.length]);

  const processCurrentElement = useCallback(() => {
    if (!currentElement) return;

    setShowText(false);
    setTransition(currentElement.transition || '');

    const element = currentElement; // Capture for closure
    const elementType = element.type as string; // Type assertion for comparison
    
    setTimeout(() => {
      switch (element.type) {
        case 'scene':
          setPreviewState(prev => ({
            ...prev,
            background: element.image,
            visibleCharacters: {} // Clear all characters on scene change
          }));
          break;

        case 'show':
          if (element.image) {
            const [charName] = element.image.split(' ');
            setPreviewState(prev => ({
              ...prev,
              visibleCharacters: {
                ...prev.visibleCharacters,
                [charName]: {
                  character: charName,
                  image: element.image!,
                  position: element.position || 'center'
                }
              }
            }));
          }
          break;

        case 'hide':
          if (element.image) {
            const charName = element.image.split(' ')[0];
            setPreviewState(prev => {
              const newChars = { ...prev.visibleCharacters };
              delete newChars[charName];
              return { ...prev, visibleCharacters: newChars };
            });
          }
          break;

        case 'menu':
          setMenuChoices(element.choices);
          setPreviewState(prev => ({ ...prev, isPlaying: false }));
          return;

        case 'variable':
          if (element.variable) {
            setPreviewState(prev => ({
              ...prev,
              variables: {
                ...prev.variables,
                [element.variable!]: element.value
              }
            }));
          }
          break;

        case 'play':
          if (element.channel === 'music') {
            setPreviewState(prev => ({
              ...prev,
              backgroundMusic: element.audio
            }));
          }
          break;
      }

      setShowText(true);

      // Auto-advance for non-dialogue elements
      if (elementType !== 'dialogue' && elementType !== 'menu') {
        setTimeout(() => {
          if (previewState.isPlaying) {
            advance();
          }
        }, 500);
      }
    }, 300);
  }, [currentElement, previewState.isPlaying, advance]);

  useEffect(() => {
    if (previewState.isPlaying && currentElement) {
      processCurrentElement();
    }
  }, [previewState.currentElementIndex, previewState.isPlaying, currentElement, processCurrentElement]);

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

  // Handle click to advance for mobile
  const handleScreenClick = useCallback(() => {
    if (previewState.isPlaying && currentElement?.type === 'dialogue' && !menuChoices) {
      advance();
    }
  }, [previewState.isPlaying, currentElement, menuChoices, advance]);

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
            backgroundPosition: 'center',
            cursor: previewState.isPlaying && currentElement?.type === 'dialogue' ? 'pointer' : 'default'
          }}
          onClick={handleScreenClick}
        >
          {/* Characters */}
          {Object.values(previewState.visibleCharacters).map((char) => {
            const positions = {
              left: isMobile ? '5%' : '10%',
              right: isMobile ? '55%' : '60%',
              center: isMobile ? '30%' : '35%'
            };
            
            return (
              <Box
                key={char.character}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: positions[char.position as keyof typeof positions] || positions.center,
                  width: isMobile ? '40%' : '30%',
                  height: isMobile ? '70%' : '80%',
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
            );
          })}

          {/* Dialogue Box */}
          {currentElement && (currentElement.type === 'dialogue' || menuChoices) && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(0, 0, 0, 0.8)',
                p: isMobile ? 2 : 3,
                minHeight: isMobile ? '30%' : '25%'
              }}
            >
              {renderTransition(
                <>
                  {currentElement.type === 'dialogue' && (
                    <>
                      {currentElement.character && (
                        <Typography
                          variant={isMobile ? 'body1' : 'h6'}
                          sx={{
                            color: getCharacterColor(currentElement.character),
                            mb: 1,
                            fontWeight: 'bold'
                          }}
                        >
                          {getCharacterName(currentElement.character)}
                        </Typography>
                      )}
                      <Typography
                        variant="body1"
                        sx={{ 
                          color: '#fff', 
                          lineHeight: 1.8,
                          fontSize: isMobile ? '0.9rem' : '1rem'
                        }}
                      >
                        {currentElement.content}
                      </Typography>
                    </>
                  )}

                  {menuChoices && (
                    <Box>
                      <Typography 
                        variant={isMobile ? 'body1' : 'h6'} 
                        sx={{ color: '#fff', mb: 2, fontWeight: 'bold' }}
                      >
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
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            py: isMobile ? 1 : 1.5,
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
          value={(previewState.currentElementIndex / Math.max(script.elements.length, 1)) * 100}
          sx={{ height: 4 }}
        />

        {/* Controls */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: isMobile ? 0.5 : 1,
            bgcolor: 'background.paper',
            gap: isMobile ? 0.5 : 1
          }}
        >
          <IconButton 
            onClick={restart} 
            title="Restart"
            size={isMobile ? 'small' : 'medium'}
          >
            <RestartAltIcon />
          </IconButton>
          <IconButton
            onClick={togglePlay}
            color="primary"
            title={previewState.isPlaying ? 'Pause' : 'Play'}
            size={isMobile ? 'small' : 'medium'}
          >
            {previewState.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton
            onClick={skip}
            disabled={!currentElement || currentElement.type === 'menu'}
            title="Next"
            size={isMobile ? 'small' : 'medium'}
          >
            <SkipNextIcon />
          </IconButton>
          <Typography 
            variant={isMobile ? 'caption' : 'body2'} 
            sx={{ ml: isMobile ? 1 : 2 }}
          >
            {previewState.currentElementIndex + 1} / {script.elements.length}
          </Typography>
        </Box>
      </Paper>

      {/* Click to advance hint */}
      {previewState.isPlaying && currentElement?.type === 'dialogue' && !isMobile && (
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