import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Tooltip,
  Snackbar,
  Alert,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Fab
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SaveIcon from '@mui/icons-material/Save';
import LanguageIcon from '@mui/icons-material/Language';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import HistoryIcon from '@mui/icons-material/History';
import { EditorToolbar } from './components/Editor/EditorToolbar';
import { ElementEditor } from './components/Editor/ElementEditor';
import { CharacterEditor } from './components/Editor/CharacterEditor';
import { ScriptElementList } from './components/Editor/ScriptElementList';
import { GamePreview } from './components/Preview/GamePreview';
import { CodeView } from './components/CodeView/CodeView';
import { ImportExport } from './components/ImportExport/ImportExport';
import { TemplateSelector } from './components/Templates/TemplateSelector';
import { RenpyScript, RenpyElement, RenpyElementType } from './types/renpy';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { lightTheme, darkTheme } from './theme/theme';
import { useHistory } from './hooks/useHistory';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutoSave } from './hooks/useAutoSave';

function AppContent() {
  const { t, language, setLanguage } = useLanguage();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('renpy-editor-darkmode');
    return saved === 'true';
  });
  
  const theme = darkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | undefined>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePanelView, setMobilePanelView] = useState<'characters' | 'elements' | 'properties'>('elements');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error' | 'info'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  const initialScript: RenpyScript = {
    characters: [
      { id: 'e', name: '艾琳', color: '#c8ffc8' },
      { id: 'm', name: '玛丽', color: '#ffc8c8' }
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
        content: "你好！欢迎使用 Ren'Py 可视化编辑器！"
      },
      {
        id: 'element-4',
        type: 'dialogue',
        character: 'e',
        content: "使用这个工具，你可以轻松创建视觉小说。"
      },
      {
        id: 'element-5',
        type: 'menu',
        choices: [
          {
            id: 'choice-1',
            text: '告诉我更多！',
            actions: []
          },
          {
            id: 'choice-2',
            text: '我已经知道怎么用了。',
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
  };

  const {
    state: script,
    setState: setScript,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory<RenpyScript>(initialScript);

  const { loadAutoSave, getAutoSaveTimestamp } = useAutoSave(script);

  // Load autosave on mount
  useEffect(() => {
    const autosave = loadAutoSave();
    if (autosave) {
      const timestamp = getAutoSaveTimestamp();
      if (timestamp && window.confirm(`发现自动保存的项目 (${timestamp.toLocaleString()})，是否要恢复？`)) {
        setScript(autosave);
        showSnackbar('已恢复自动保存的项目', 'success');
      }
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('renpy-editor-darkmode', darkMode.toString());
  }, [darkMode]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSave = useCallback(() => {
    localStorage.setItem('renpy-visual-editor-project', JSON.stringify(script));
    showSnackbar(t('importExport.saved'), 'success');
  }, [script, t]);

  const handleCopyElement = useCallback(() => {
    if (selectedElementId) {
      const element = script.elements.find(el => el.id === selectedElementId);
      if (element) {
        localStorage.setItem('renpy-editor-clipboard', JSON.stringify(element));
        showSnackbar('元素已复制', 'success');
      }
    }
  }, [selectedElementId, script]);

  const handlePasteElement = useCallback(() => {
    const clipboard = localStorage.getItem('renpy-editor-clipboard');
    if (clipboard) {
      try {
        const element = JSON.parse(clipboard);
        const newElement = { ...element, id: `element-${Date.now()}` };
        setScript({
          ...script,
          elements: [...script.elements, newElement]
        });
        showSnackbar('元素已粘贴', 'success');
      } catch (error) {
        showSnackbar('粘贴失败', 'error');
      }
    }
  }, [script, setScript]);

  useKeyboardShortcuts({
    onSave: handleSave,
    onUndo: canUndo ? undo : undefined,
    onRedo: canRedo ? redo : undefined,
    onCopy: handleCopyElement,
    onPaste: handlePasteElement,
    onDelete: selectedElementId ? () => handleDeleteElement(selectedElementId) : undefined,
    onEscape: () => setSelectedElementId(undefined)
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
        newElement.content = '新对话文本';
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
          { id: 'choice-new-1', text: '选项 1', actions: [] },
          { id: 'choice-new-2', text: '选项 2', actions: [] }
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

    setScript({
      ...script,
      elements: [...script.elements, newElement]
    });
    
    // Auto-select the new element
    setSelectedElementId(newElement.id);
    if (isMobile) {
      setMobilePanelView('properties');
    }
  };

  const handleUpdateElement = (updatedElement: RenpyElement) => {
    setScript({
      ...script,
      elements: script.elements.map(el =>
        el.id === updatedElement.id ? updatedElement : el
      )
    });
  };

  const handleDeleteElement = (id: string) => {
    setScript({
      ...script,
      elements: script.elements.filter(el => el.id !== id)
    });
    // Clear selection if deleted element was selected
    if (selectedElementId === id) {
      setSelectedElementId(undefined);
    }
  };

  const handleUpdateCharacters = (characters: typeof script.characters) => {
    setScript({ ...script, characters });
  };

  const handleReorderElements = (elements: RenpyElement[]) => {
    setScript({ ...script, elements });
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
    showSnackbar(t('importExport.loaded'), 'success');
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
            <ListItemText primary={t('editor.panels.elements')} />
          </ListItem>
          <ListItem button onClick={() => { setMobilePanelView('characters'); setMobileMenuOpen(false); }}>
            <ListItemText primary={t('editor.panels.characters')} />
          </ListItem>
          <ListItem button onClick={() => { setMobilePanelView('properties'); setMobileMenuOpen(false); }}>
            <ListItemText primary={t('editor.panels.properties')} />
          </ListItem>
          <Divider />
          <ListItem button onClick={() => { setTemplateDialogOpen(true); setMobileMenuOpen(false); }}>
            <ListItemText primary={t('templates.title')} />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ gap: 1 }}>
            {isMobile && activeTab === 0 && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileMenuOpen(true)}
                size="small"
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography 
              variant={isMobile ? 'body1' : 'h6'} 
              sx={{ 
                flexGrow: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 'bold'
              }}
            >
              {t('editor.title')}
            </Typography>
            
            {/* Desktop toolbar actions */}
            {!isMobile && (
              <>
                <Tooltip title={t('templates.title')}>
                  <IconButton color="inherit" onClick={() => setTemplateDialogOpen(true)}>
                    <AutoFixHighIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={canUndo ? 'Undo (Ctrl+Z)' : 'Nothing to undo'}>
                  <span>
                    <IconButton color="inherit" onClick={undo} disabled={!canUndo}>
                      <UndoIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={canRedo ? 'Redo (Ctrl+Y)' : 'Nothing to redo'}>
                  <span>
                    <IconButton color="inherit" onClick={redo} disabled={!canRedo}>
                      <RedoIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Save (Ctrl+S)">
                  <IconButton color="inherit" onClick={handleSave}>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
                <ImportExport script={script} onImport={handleImportScript} />
                <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: 'rgba(255,255,255,0.3)' }} />
                <Tooltip title={t('common.settings')}>
                  <IconButton
                    color="inherit"
                    onClick={(e) => setLanguageMenuAnchor(e.currentTarget)}
                  >
                    <LanguageIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                  <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Toolbar>
        </AppBar>

        <Menu
          anchorEl={languageMenuAnchor}
          open={Boolean(languageMenuAnchor)}
          onClose={() => setLanguageMenuAnchor(null)}
        >
          <MenuItem 
            selected={language === 'zh'} 
            onClick={() => { setLanguage('zh'); setLanguageMenuAnchor(null); }}
          >
            中文
          </MenuItem>
          <MenuItem 
            selected={language === 'en'} 
            onClick={() => { setLanguage('en'); setLanguageMenuAnchor(null); }}
          >
            English
          </MenuItem>
        </Menu>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              centered={!isMobile}
              variant={isMobile ? 'fullWidth' : 'standard'}
            >
              <Tab label={t('editor.tabs.visual')} />
              <Tab label={t('editor.tabs.preview')} />
              <Tab label={t('editor.tabs.code')} />
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
                            {t('editor.panels.elements')}
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
                                {t('editor.element.noElements')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {t('editor.element.addElementHint')}
                              </Typography>
                            </Paper>
                          )}
                        </>
                      )}
                      {mobilePanelView === 'properties' && (
                        <>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Button
                              size="small"
                              onClick={() => setMobilePanelView('elements')}
                              sx={{ minWidth: 'auto' }}
                            >
                              ← {t('common.back')}
                            </Button>
                            <Typography variant="h6" sx={{ flex: 1 }}>
                              {t('editor.panels.properties')}
                            </Typography>
                          </Box>
                          {selectedElement ? (
                            <ElementEditor
                              element={selectedElement}
                              characters={script.characters}
                              onUpdate={handleUpdateElement}
                              onDelete={(id) => {
                                handleDeleteElement(id);
                                setMobilePanelView('elements');
                              }}
                            />
                          ) : (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                              <Typography color="text.secondary">
                                {t('editor.element.selectElement')}
                              </Typography>
                            </Paper>
                          )}
                        </>
                      )}
                    </Box>
                  </>
                ) : (
                  <Grid container sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Grid item xs={12} md={3} sx={{ height: '100%', overflow: 'auto', p: 2, bgcolor: 'background.default' }}>
                      <CharacterEditor
                        characters={script.characters}
                        onUpdate={handleUpdateCharacters}
                      />
                    </Grid>
                    <Grid item xs={12} md={5} sx={{ height: '100%', overflow: 'auto', p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {t('editor.panels.elements')}
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
                        <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
                          <Typography color="text.secondary">
                            {t('editor.element.noElements')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {t('editor.element.addElementHint')}
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AutoFixHighIcon />}
                            onClick={() => setTemplateDialogOpen(true)}
                            sx={{ mt: 2 }}
                          >
                            {t('templates.title')}
                          </Button>
                        </Paper>
                      )}
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ height: '100%', overflow: 'auto', p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="h6" gutterBottom>
                        {t('editor.panels.properties')}
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
                            {t('editor.element.selectElement')}
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

        {/* Mobile Floating Action Buttons */}
        {isMobile && (
          <>
            <SpeedDial
              ariaLabel="Quick actions"
              sx={{ position: 'fixed', bottom: 16, right: 16 }}
              icon={<SpeedDialIcon />}
            >
              <SpeedDialAction
                icon={<AutoFixHighIcon />}
                tooltipTitle={t('templates.title')}
                onClick={() => setTemplateDialogOpen(true)}
              />
              <SpeedDialAction
                icon={<SaveIcon />}
                tooltipTitle={t('common.save')}
                onClick={handleSave}
              />
              <SpeedDialAction
                icon={<UndoIcon />}
                tooltipTitle="Undo"
                onClick={undo}
                FabProps={{ disabled: !canUndo }}
              />
              <SpeedDialAction
                icon={darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                tooltipTitle={darkMode ? 'Light Mode' : 'Dark Mode'}
                onClick={() => setDarkMode(!darkMode)}
              />
              <SpeedDialAction
                icon={<LanguageIcon />}
                tooltipTitle="Language"
                onClick={(e) => setLanguageMenuAnchor(e.currentTarget as HTMLElement)}
              />
            </SpeedDial>
            
            {activeTab !== 0 && (
              <Paper 
                elevation={3} 
                sx={{ 
                  position: 'sticky',
                  bottom: 0,
                  p: 1, 
                  borderTop: 1, 
                  borderColor: 'divider',
                  overflow: 'auto'
                }}
              >
                <ImportExport script={script} onImport={handleImportScript} />
              </Paper>
            )}
          </>
        )}

        <TemplateSelector
          open={templateDialogOpen}
          onClose={() => setTemplateDialogOpen(false)}
          onSelect={(templateScript) => {
            setScript(templateScript);
            setSelectedElementId(undefined);
            showSnackbar('已加载模板', 'success');
          }}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;