import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Container,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { EditorToolbar } from './components/Editor/EditorToolbar';
import { ElementEditor } from './components/Editor/ElementEditor';
import { CharacterEditor } from './components/Editor/CharacterEditor';
import { ScriptElementList } from './components/Editor/ScriptElementList';
import { GamePreview } from './components/Preview/GamePreview';
import { CodeView } from './components/CodeView/CodeView';
import { ImportExport } from './components/ImportExport/ImportExport';
import { RenpyScript, RenpyElement, RenpyElementType } from './types/renpy';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ff6b6b',
    },
    secondary: {
      main: '#4ecdc4',
    },
    background: {
      default: '#f5f5f5',
    }
  },
});

function App() {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | undefined>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePanelView, setMobilePanelView] = useState<'characters' | 'elements' | 'properties'>('elements');
  
  const [script, setScript] = useState<RenpyScript>({
    characters: [
      { id: 'e', name: 'Eileen', color: '#c8ffc8' },
      { id: 'm', name: 'Mary', color: '#ffc8c8' }
    ],
    elements: [
      {
        id: 'element-0',
        type: 'label',
        label: 'start'
      },
      {
        id: 'element-1',
        type: 'scene',
        image: 'bg room',
        transition: 'fade'
      },
      {
        id: 'element-2',
        type: 'show',
        image: 'eileen happy',
        position: 'center',
        transition: 'dissolve'
      },
      {
        id: 'element-3',
        type: 'dialogue',
        character: 'e',
        content: "Hi! Welcome to the Ren'Py Visual Editor!"
      },
      {
        id: 'element-4',
        type: 'dialogue',
        character: 'e',
        content: "You can create visual novels easily with this tool."
      },
      {
        id: 'element-5',
        type: 'menu',
        choices: [
          {
            id: 'choice-1',
            text: 'Tell me more!',
            actions: []
          },
          {
            id: 'choice-2',
            text: 'I already know how to use it.',
            actions: []
          }
        ]
      }
    ],
    assets: {
      images: [],
      audio: [],
      backgrounds: []
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddElement = (type: RenpyElementType) => {
    const newElement: RenpyElement = {
      id: `element-${Date.now()}`,
      type,
    };

    // Set default values based on type
    switch (type) {
      case 'dialogue':
        newElement.content = 'New dialogue text';
        break;
      case 'scene':
        newElement.image = 'bg room';
        break;
      case 'show':
        newElement.image = 'character happy';
        newElement.position = 'center';
        break;
      case 'label':
        newElement.label = 'new_label';
        break;
      case 'menu':
        newElement.choices = [
          { id: 'choice-new-1', text: 'Option 1', actions: [] },
          { id: 'choice-new-2', text: 'Option 2', actions: [] }
        ];
        break;
      case 'play':
        newElement.channel = 'music';
        newElement.audio = 'audio/theme.mp3';
        break;
      case 'variable':
        newElement.variable = 'var_name';
        newElement.value = 'True';
        break;
      case 'jump':
        newElement.label = 'start';
        break;
    }

    setScript(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  };

  const handleUpdateElement = (updatedElement: RenpyElement) => {
    setScript(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === updatedElement.id ? updatedElement : el
      )
    }));
  };

  const handleDeleteElement = (id: string) => {
    setScript(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id)
    }));
  };

  const handleUpdateCharacters = (characters: typeof script.characters) => {
    setScript(prev => ({ ...prev, characters }));
  };

  const handleReorderElements = (elements: RenpyElement[]) => {
    setScript(prev => ({ ...prev, elements }));
  };

  const handleSelectElement = (element: RenpyElement) => {
    setSelectedElementId(element.id);
    if (isMobile) {
      setMobilePanelView('properties');
    }
  };

  const selectedElement = script.elements.find(el => el.id === selectedElementId);

  const handleImportScript = (importedScript: RenpyScript) => {
    setScript(importedScript);
    setSelectedElementId(undefined);
  };

  const MobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
    >
      <Box sx={{ width: 250 }}>
        <List>
          <ListItem button onClick={() => { setMobilePanelView('elements'); setMobileMenuOpen(false); }}>
            <ListItemText primary="Script Elements" />
          </ListItem>
          <ListItem button onClick={() => { setMobilePanelView('characters'); setMobileMenuOpen(false); }}>
            <ListItemText primary="Characters" />
          </ListItem>
          <ListItem button onClick={() => { setMobilePanelView('properties'); setMobileMenuOpen(false); }}>
            <ListItemText primary="Properties" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            {isMobile && activeTab === 0 && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant={isMobile ? 'body1' : 'h6'} sx={{ flexGrow: 1 }}>
              Ren'Py Visual Editor
            </Typography>
            {!isMobile && <ImportExport script={script} onImport={handleImportScript} />}
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              centered={!isMobile}
              variant={isMobile ? 'fullWidth' : 'standard'}
            >
              <Tab label={isMobile ? 'Edit' : 'Visual Editor'} />
              <Tab label="Preview" />
              <Tab label={isMobile ? 'Code' : 'Code View'} />
            </Tabs>
          </Paper>

          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            {activeTab === 0 && (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <EditorToolbar onAddElement={handleAddElement} />
                
                {isMobile ? (
                  <>
                    <MobileDrawer />
                    <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                      {mobilePanelView === 'characters' && (
                        <CharacterEditor
                          characters={script.characters}
                          onUpdate={handleUpdateCharacters}
                        />
                      )}
                      {mobilePanelView === 'elements' && (
                        <>
                          <Typography variant="h6" gutterBottom>
                            Script Elements
                          </Typography>
                          <ScriptElementList
                            elements={script.elements}
                            characters={script.characters}
                            selectedId={selectedElementId}
                            onSelect={handleSelectElement}
                            onDelete={handleDeleteElement}
                            onReorder={handleReorderElements}
                          />
                          {script.elements.length === 0 && (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                              <Typography color="text.secondary">
                                No elements yet. Click the buttons above to add elements.
                              </Typography>
                            </Paper>
                          )}
                        </>
                      )}
                      {mobilePanelView === 'properties' && (
                        <>
                          <Typography variant="h6" gutterBottom>
                            Element Properties
                          </Typography>
                          {selectedElement ? (
                            <ElementEditor
                              element={selectedElement}
                              characters={script.characters}
                              onUpdate={handleUpdateElement}
                              onDelete={handleDeleteElement}
                            />
                          ) : (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                              <Typography color="text.secondary">
                                Select an element to edit its properties
                              </Typography>
                            </Paper>
                          )}
                        </>
                      )}
                    </Box>
                  </>
                ) : (
                  <Grid container sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Grid item xs={12} md={3} sx={{ height: '100%', overflow: 'auto', p: 2 }}>
                      <CharacterEditor
                        characters={script.characters}
                        onUpdate={handleUpdateCharacters}
                      />
                    </Grid>
                    <Grid item xs={12} md={5} sx={{ height: '100%', overflow: 'auto', p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="h6" gutterBottom>
                        Script Elements
                      </Typography>
                      <ScriptElementList
                        elements={script.elements}
                        characters={script.characters}
                        selectedId={selectedElementId}
                        onSelect={handleSelectElement}
                        onDelete={handleDeleteElement}
                        onReorder={handleReorderElements}
                      />
                      {script.elements.length === 0 && (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                          <Typography color="text.secondary">
                            No elements yet. Click the buttons above to add elements to your script.
                          </Typography>
                        </Paper>
                      )}
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ height: '100%', overflow: 'auto', p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Element Properties
                      </Typography>
                      {selectedElement ? (
                        <ElementEditor
                          element={selectedElement}
                          characters={script.characters}
                          onUpdate={handleUpdateElement}
                          onDelete={handleDeleteElement}
                        />
                      ) : (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                          <Typography color="text.secondary">
                            Select an element to edit its properties
                          </Typography>
                        </Paper>
                      )}
                    </Grid>
                  </Grid>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box sx={{ height: '100%', p: isMobile ? 0 : 2 }}>
                <GamePreview script={script} />
              </Box>
            )}

            {activeTab === 2 && (
              <Box sx={{ height: '100%', p: isMobile ? 1 : 2 }}>
                <CodeView script={script} />
              </Box>
            )}
          </Box>
        </Box>

        {isMobile && (
          <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
            <ImportExport script={script} onImport={handleImportScript} />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;